import numpy as np
from sklearn.ensemble import IsolationForest

class Defender:
    def __init__(self, train_stats=None, X_train=None):
        self.stats = train_stats
        self.iso_forest = None
        self.q01 = None
        self.q99 = None
        
        if X_train is not None:
            self._fit_iso_forest(X_train)
            self.q01 = np.percentile(X_train, 1, axis=0)
            self.q99 = np.percentile(X_train, 99, axis=0)

    def _fit_iso_forest(self, X_train):
        self.iso_forest = IsolationForest(contamination=0.05, random_state=42)
        self.iso_forest.fit(X_train)

    def detect_evasion(self, features):
        if not self.stats:
            return False, 0.0
        
        f = np.array(features)
        means = np.array(self.stats['mean'])
        stds = np.array(self.stats['std'])
        stds[stds == 0] = 1e-6
        
        z_scores = np.abs((f - means) / stds)
        max_z = float(np.max(z_scores))
        
        # Feature squeezing: compare prediction on original vs clipped input
        squeeze_signal = False
        if self.q01 is not None:
            f_squeezed = np.clip(f, self.q01, self.q99)
            f_squeezed = np.round(f_squeezed, decimals=2)
            squeeze_delta = float(np.mean(np.abs(f - f_squeezed)))
            squeeze_signal = squeeze_delta > 0.5
        
        is_evasion = max_z > 3.5 or squeeze_signal
        risk_score = min(100, max(0, (max_z - 2.0) * 12.5))
        
        return is_evasion, round(risk_score, 2)

    def detect_poisoning(self, features, label, pred_label, confidence):
        f = np.array(features).reshape(1, -1)
        
        # IsolationForest outlier check
        outlier = False
        if self.iso_forest is not None:
            outlier = self.iso_forest.predict(f)[0] == -1
        
        # Confidence mismatch check (label flipping attempt)
        # If the attacker says it's normal (0) but model sees obvious attack (1), or vice versa
        confidence_flip = bool(confidence > 0.4 and label != pred_label)
        
        # Brutal check: extreme anomalies in data shape
        max_val = np.max(np.abs(f))
        extreme_outlier = max_val > 2000.0
        
        return bool(outlier or confidence_flip or extreme_outlier)
