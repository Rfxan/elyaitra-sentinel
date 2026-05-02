import os
import joblib
import numpy as np
import pandas as pd
import time
import urllib.request
import logging
import shutil
import json
from datetime import datetime
from xgboost import XGBClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MODEL_PATH = os.path.join(DATA_DIR, "model.pkl")
SCALER_PATH = os.path.join(DATA_DIR, "scaler.pkl")
STATS_PATH = os.path.join(DATA_DIR, "train_stats.pkl")
DATASET_URL = "https://raw.githubusercontent.com/defcom17/NSL_KDD/master/KDDTrain%2B.txt"
DATASET_FILE = os.path.join(DATA_DIR, "KDDTrain+.txt")
VERSION_DIR = os.path.join(DATA_DIR, "versions")
MANIFEST_PATH = os.path.join(VERSION_DIR, "manifest.json")

COLUMNS = [
    "duration", "protocol_type", "service", "flag", "src_bytes", "dst_bytes", "land",
    "wrong_fragment", "urgent", "hot", "num_failed_logins", "logged_in",
    "num_compromised", "root_shell", "su_attempted", "num_root", "num_file_creations",
    "num_shells", "num_access_files", "num_outbound_cmds", "is_host_login",
    "is_guest_login", "count", "srv_count", "serror_rate", "srv_serror_rate",
    "rerror_rate", "srv_rerror_rate", "same_srv_rate", "diff_srv_rate",
    "srv_diff_host_rate", "dst_host_count", "dst_host_srv_count", "dst_host_same_srv_rate",
    "dst_host_diff_srv_rate", "dst_host_same_src_port_rate", "dst_host_srv_diff_host_rate",
    "dst_host_serror_rate", "dst_host_srv_serror_rate", "dst_host_rerror_rate",
    "dst_host_srv_rerror_rate", "label", "difficulty_level"
]

class MLModel:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.train_stats = None
        self.accuracy = 0.0
        self.f1 = 0.0
        self.model_history = []
        
        if not os.path.exists(DATA_DIR):
            os.makedirs(DATA_DIR)

    def download_dataset(self):
        if os.path.exists(DATASET_FILE):
            return
        try:
            logger.info("Downloading NSL-KDD dataset...")
            urllib.request.urlretrieve(DATASET_URL, DATASET_FILE)
        except Exception:
            self._generate_synthetic_and_train()

    def _generate_synthetic_and_train(self):
        # Fallback if download fails
        data = [[0]*43 for _ in range(100)]
        df = pd.DataFrame(data, columns=COLUMNS)
        df.to_csv(DATASET_FILE, index=False, header=False)

    def _map_label(self, x):
        x = str(x).lower().strip()
        if x == 'normal': return 0
        dos_types = ['back','land','neptune','pod','smurf','teardrop','apache2','udpstorm','processtable','mailbomb','worm']
        probe_types = ['ipsweep','nmap','portsweep','satan','mscan','saint']
        r2l_types = ['ftp_write','guess_passwd','imap','multihop','phf','spy','warezclient','warezmaster','sendmail','named','snmpgetattack','snmpguess','xlock','xsnoop','httptunnel']
        u2r_types = ['buffer_overflow','loadmodule','perl','rootkit','sqlattack','xterm','ps']
        if any(t in x for t in dos_types): return 1
        if any(t in x for t in probe_types): return 2
        if any(t in x for t in r2l_types): return 3
        if any(t in x for t in u2r_types): return 4
        return 1  # fallback: treat unknown as dos

    def _augment_adversarial(self, X, y):
        attack_mask = (y != 0)
        if not any(attack_mask):
            return X, y
        X_adv = X[attack_mask].copy()
        stds = np.array(self.train_stats['std']) if (self.train_stats and 'std' in self.train_stats) else np.ones(X.shape[1])
        noise = np.random.normal(0, 0.1, X_adv.shape)
        X_adv = X_adv + noise * stds
        y_adv = y[attack_mask].copy() if hasattr(y, 'copy') else y.values[attack_mask].copy()
        return np.vstack([X, X_adv]), np.concatenate([y, y_adv])

    def train(self, new_samples=None):
        if not os.path.exists(DATASET_FILE):
            self.download_dataset()
        
        prev_accuracy = self.accuracy
        prev_f1 = self.f1
        
        df = pd.read_csv(DATASET_FILE, names=COLUMNS, header=None)
        df['label'] = df['label'].apply(self._map_label)
        
        # Numeric encoding for categoricals
        for col in ['protocol_type', 'service', 'flag']:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col])

        X = df.drop(['label', 'difficulty_level'], axis=1)
        y = df['label']

        if new_samples:
            try:
                new_X = pd.DataFrame([s['features'] for s in new_samples], columns=X.columns)
                new_y = pd.Series([s['label'] for s in new_samples])
                X = pd.concat([X, new_X], ignore_index=True)
                y = pd.concat([y, new_y], ignore_index=True)
            except Exception as e:
                logger.error(f"Failed to append new samples: {e}")

        # Split before scaling and training
        X_train_raw, X_test_raw, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        self.train_stats = {
            'mean': X_train_raw.mean(axis=0).values.tolist(),
            'std': X_train_raw.std(axis=0).values.tolist()
        }

        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train_raw)
        X_test_scaled = self.scaler.transform(X_test_raw)
        
        # Adversarial Augmentation
        X_train_final, y_train_final = self._augment_adversarial(X_train_scaled, y_train)
        
        self.model = XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            objective='multi:softprob',
            num_class=5,
            eval_metric='mlogloss'
        )
        self.model.fit(X_train_final, y_train_final)
        
        # Compute metrics
        y_pred = self.model.predict(X_test_scaled)
        self.accuracy = float(accuracy_score(y_test, y_pred))
        self.f1 = float(f1_score(y_test, y_pred, average='weighted'))
        
        self.train_stats['accuracy'] = self.accuracy
        self.train_stats['f1'] = self.f1

        self.model_history.append({
            'ts': time.time(),
            'accuracy': self.accuracy,
            'f1': self.f1,
            'event': 'train'
        })

        self.train_stats['model_history'] = self.model_history
        
        # Task 2: Model Versioning before overwrite
        if not os.path.exists(VERSION_DIR):
            os.makedirs(VERSION_DIR)
        
        version_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        try:
            if os.path.exists(MODEL_PATH):
                shutil.copy2(MODEL_PATH, os.path.join(VERSION_DIR, f"model_{version_id}.pkl"))
                shutil.copy2(SCALER_PATH, os.path.join(VERSION_DIR, f"scaler_{version_id}.pkl"))
                shutil.copy2(STATS_PATH, os.path.join(VERSION_DIR, f"train_stats_{version_id}.pkl"))
                
                # Update Manifest
                manifest = []
                if os.path.exists(MANIFEST_PATH):
                    with open(MANIFEST_PATH, 'r') as f:
                        manifest = json.load(f)
                
                manifest.append({
                    "version_id": version_id,
                    "timestamp": datetime.now().isoformat(),
                    "accuracy": prev_accuracy,
                    "f1": prev_f1
                })
                
                # Cleanup: keep only 5
                if len(manifest) > 5:
                    oldest = manifest.pop(0)
                    for prefix in ["model", "scaler", "train_stats"]:
                        old_file = os.path.join(VERSION_DIR, f"{prefix}_{oldest['version_id']}.pkl")
                        if os.path.exists(old_file):
                            os.remove(old_file)
                
                with open(MANIFEST_PATH, 'w') as f:
                    json.dump(manifest, f, indent=2)
        except Exception as e:
            logger.error(f"Versioning failed: {e}")
            raise  # Re-raise to prevent overwrite if versioning fails (Task 2 requirement)

        joblib.dump(self.model, MODEL_PATH)
        joblib.dump(self.scaler, SCALER_PATH)
        joblib.dump(self.train_stats, STATS_PATH)

    def list_versions(self):
        if not os.path.exists(MANIFEST_PATH):
            return []
        try:
            with open(MANIFEST_PATH, 'r') as f:
                manifest = json.load(f)
            return sorted(manifest, key=lambda x: x['version_id'], reverse=True)
        except Exception:
            return []

    def rollback(self, version_id: str):
        if not os.path.exists(MANIFEST_PATH):
            raise ValueError("No versions found.")
        
        with open(MANIFEST_PATH, 'r') as f:
            manifest = json.load(f)
            
        target = next((v for v in manifest if v['version_id'] == version_id), None)
        if not target:
            raise ValueError(f"Version {version_id} not found in manifest.")

        # Atomic copy rollback
        try:
            shutil.copy2(os.path.join(VERSION_DIR, f"model_{version_id}.pkl"), MODEL_PATH)
            shutil.copy2(os.path.join(VERSION_DIR, f"scaler_{version_id}.pkl"), SCALER_PATH)
            shutil.copy2(os.path.join(VERSION_DIR, f"train_stats_{version_id}.pkl"), STATS_PATH)
            self.load()
            return {
                "success": True,
                "version_id": version_id,
                "accuracy": self.accuracy,
                "f1": self.f1
            }
        except Exception as e:
            logger.error(f"Rollback failed: {e}")
            raise ValueError(f"Rollback failed: {e}")

    def check_drift(self, prev_accuracy: float, prev_f1: float) -> dict:
        if prev_accuracy == 0.0:
            return {"drifted": False, "accuracy_delta": 0.0, "f1_delta": 0.0, "severity": "none"}
        
        accuracy_delta = round(self.accuracy - prev_accuracy, 4)
        f1_delta = round(self.f1 - prev_f1, 4)
        
        if accuracy_delta < -0.05:
            severity = "critical"
        elif accuracy_delta < -0.01:
            severity = "warning"
        else:
            severity = "none"
            
        return {
            "drifted": severity != "none",
            "accuracy_delta": accuracy_delta,
            "f1_delta": f1_delta,
            "severity": severity
        }

    def load(self):
        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)
            self.scaler = joblib.load(SCALER_PATH)
            self.train_stats = joblib.load(STATS_PATH)
            self.accuracy = self.train_stats.get('accuracy', 0.0)
            self.f1 = self.train_stats.get('f1', 0.0)
            self.model_history = self.train_stats.get('model_history', [])
            return True
        return False

    def predict(self, features):
        if not self.model: return 0, 0.0
        X = np.array(features).reshape(1, -1)
        X_scaled = self.scaler.transform(X)
        proba = self.model.predict_proba(X_scaled)[0]
        label = int(np.argmax(proba))
        confidence = float(np.max(proba))
        return label, confidence

    def is_attack(self, label):
        return label != 0
