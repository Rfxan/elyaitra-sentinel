import numpy as np
from model import MLModel

class AdversarialAttacker:
    def __init__(self, model: MLModel):
        if model.scaler is None:
            raise ValueError("Model scaler must be initialized before AdversarialAttacker.")
        self.model = model
        # Compute per-feature valid bounds from scaler
        self.lower = self.model.scaler.mean_ - 3 * self.model.scaler.scale_
        self.upper = self.model.scaler.mean_ + 3 * self.model.scaler.scale_

    def _predict_proba_class(self, features: list, target_class: int) -> float:
        if not self.model.model:
            return 0.0
        X = np.array(features).reshape(1, -1)
        X_scaled = self.model.scaler.transform(X)
        proba = self.model.model.predict_proba(X_scaled)[0]
        return float(proba[target_class])

    def _numerical_gradient(self, features: list, target_class: int, eps=0.01) -> np.ndarray:
        grad = []
        for i in range(len(features)):
            f_plus = list(features)
            f_minus = list(features)
            f_plus[i] += eps
            f_minus[i] -= eps
            
            p_plus = self._predict_proba_class(f_plus, target_class)
            p_minus = self._predict_proba_class(f_minus, target_class)
            
            grad_i = (p_plus - p_minus) / (2 * eps)
            grad.append(grad_i)
        return np.array(grad)

    def fgsm(self, features: list, target_class=0, epsilon=0.1) -> list:
        grad = self._numerical_gradient(features, target_class)
        adv = np.array(features) + epsilon * np.sign(grad)
        adv = np.clip(adv, self.lower, self.upper)
        return adv.tolist()

    def pgd(self, features: list, target_class=0, epsilon=0.1, step_size=0.01, iterations=10) -> list:
        original = np.array(features)
        current = original.copy()
        for _ in range(iterations):
            grad = self._numerical_gradient(current.tolist(), target_class)
            current = current + step_size * np.sign(grad)
            # Clip to epsilon-ball
            current = np.clip(current, original - epsilon, original + epsilon)
            # Clip to valid feature bounds
            current = np.clip(current, self.lower, self.upper)
        return current.tolist()
