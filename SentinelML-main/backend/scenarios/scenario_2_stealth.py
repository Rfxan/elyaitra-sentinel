import random
import asyncio
from scenarios.scenario_base import Scenario

class StealthScenario(Scenario):
    @property
    def name(self) -> str:
        return "stealth"

    @property
    def description(self) -> str:
        return "Low-magnitude perturbations designed to bypass Z-score detectors while maintaining malicious intent."

    async def run(self, simulator, count: int, predict_fn=None, train_fn=None, ip=None) -> list:
        events = []
        for _ in range(count):
            # Start with a real attack sample
            features = simulator.generate_attack()
            # Add very small noise (staying within Z-score 3.5)
            for idx in simulator.continuous_indices:
                features[idx] += random.uniform(-0.1, 0.1)
            
            if predict_fn:
                from main import PredictRequest
                await predict_fn(PredictRequest(features=features, ip=ip))
            
            events.append({"features": features, "ip": ip})
        return events
