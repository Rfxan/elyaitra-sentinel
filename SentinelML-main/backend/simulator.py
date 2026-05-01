import random
import numpy as np
import pandas as pd
import os
import glob
import importlib.util
import logging
from typing import List, Dict, Any, Optional, Tuple

logger = logging.getLogger(__name__)

# Threat range IPs for deterministic demo behavior
TOR_IPS = [f"185.220.101.{i}" for i in range(10, 20)]
SCANNER_IPS = [f"45.33.32.{i}" for i in range(50, 60)]
POISON_IPS = [f"103.21.244.{i}" for i in range(1, 6)]

class Simulator:
    def __init__(self):
        self.continuous_indices = [0, 4, 5, 9, 10, 11, 12, 13, 14, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
        self.data_path = os.path.join(os.path.dirname(__file__), "data", "KDDTrain+.txt")
        self.df = None
        self.normal_samples = None
        self.attack_samples = None
        self.scenarios = {}
        
        self._load_data()
        self._load_scenarios()

    def _load_data(self):
        if not os.path.exists(self.data_path):
            logger.warning(f"Dataset not found at {self.data_path}. Simulation will fallback to synthetic data.")
            return

        try:
            # Columns are the same as in model.py
            columns = [
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
            self.df = pd.read_csv(self.data_path, names=columns, header=None)
            
            # Numeric encoding for categoricals (matching model.py)
            from sklearn.preprocessing import LabelEncoder
            for col in ['protocol_type', 'service', 'flag']:
                le = LabelEncoder()
                self.df[col] = le.fit_transform(self.df[col])
            
            self.normal_samples = self.df[self.df['label'] == 'normal'].drop(['label', 'difficulty_level'], axis=1)
            self.attack_samples = self.df[self.df['label'] != 'normal'].drop(['label', 'difficulty_level'], axis=1)
            
            logger.info(f"Simulator loaded {len(self.normal_samples)} normal and {len(self.attack_samples)} attack samples.")
        except Exception as e:
            logger.error(f"Failed to load dataset for simulator: {e}")

    def _load_scenarios(self):
        scenario_dir = os.path.join(os.path.dirname(__file__), "scenarios")
        if not os.path.exists(scenario_dir):
            return

        for file in glob.glob(os.path.join(scenario_dir, "scenario_*.py")):
            try:
                module_name = os.path.basename(file)[:-3]
                spec = importlib.util.spec_from_file_location(module_name, file)
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                
                for attr in dir(module):
                    cls = getattr(module, attr)
                    if isinstance(cls, type) and issubclass(cls, object) and hasattr(cls, 'run') and attr != 'Scenario':
                        instance = cls()
                        self.scenarios[instance.name if hasattr(instance, 'name') else module_name] = instance
                        logger.info(f"Loaded scenario: {module_name}")
            except Exception as e:
                logger.error(f"Failed to load scenario {file}: {e}")

    def get_random_ip(self, mode="normal"):
        if mode == "blitz" or mode == "attack":
            return random.choice(SCANNER_IPS)
        if mode == "evasion" or mode == "fgsm" or mode == "pgd":
            return random.choice(TOR_IPS)
        if mode == "poison":
            return random.choice(POISON_IPS)
            
        return f"{random.randint(1, 223)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 255)}"

    def generate_normal(self) -> List[float]:
        if self.normal_samples is not None and len(self.normal_samples) > 0:
            sample = self.normal_samples.sample(1).values[0].tolist()
            return [float(x) for x in sample]
        
        # Fallback to synthetic if data not loaded
        features = [0.0 for _ in range(41)]
        features[4] = random.uniform(100, 500) # src_bytes
        features[22] = random.uniform(1, 10) # count
        return features

    def generate_attack(self) -> List[float]:
        if self.attack_samples is not None and len(self.attack_samples) > 0:
            sample = self.attack_samples.sample(1).values[0].tolist()
            return [float(x) for x in sample]
        
        # Fallback synthetic attack
        features = [0.0 for _ in range(41)]
        features[22] = random.uniform(100, 500) # count
        features[24] = 1.0 # serror_rate
        return features

    def generate_evasion(self, escalate=False) -> List[float]:
        features = self.generate_attack()
        # Small perturbations to continuous features to try and bypass decision boundary
        factor = 0.5 if escalate else 0.2
        for idx in self.continuous_indices:
            # Huge variance added to break ML assumption
            features[idx] += random.choice([-1, 1]) * random.uniform(0.1, factor)
        return features

    def generate_poison(self) -> Tuple[List[float], int]:
        # Malicious features but targeting normal label to corrupt the model weights
        features = self.generate_attack()
        return features, 0 # features, flipped_label

    def generate_blitz(self):
        strategies = ["normal", "evasion", "poison", "attack"]
        weights = [0.2, 0.3, 0.1, 0.4]
        choice = random.choices(strategies, weights=weights)[0]
        if choice == "normal":
            return self.generate_normal(), "normal"
        elif choice == "evasion":
            return self.generate_evasion(), "evasion"
        elif choice == "attack":
            return self.generate_attack(), "attack"
        else:
            return self.generate_poison(), "poison"

    def generate_extraction_probe(self, probe_type="boundary"):
        if probe_type == "boundary":
            features = self.generate_normal()
            # Vary features slightly to probe decision boundaries
            for idx in self.continuous_indices[:5]:
                features[idx] += random.uniform(-0.1, 0.1)
        else:
            # Broad coverage probe
            features = [float(np.random.uniform(0, 1)) for _ in range(41)]
        return features
