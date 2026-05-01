import random
import asyncio
from scenarios.scenario_base import Scenario

class HeavyNoiseScenario(Scenario):
    @property
    def name(self) -> str:
        return "heavy_noise"

    @property
    def description(self) -> str:
        return "Simulates high-volume traffic with massive statistical jitter to test noise tolerance."

    async def run(self, simulator, count: int, predict_fn=None, train_fn=None, ip=None) -> list:
        events = []
        for _ in range(count):
            # Start with normal traffic
            features = simulator.generate_normal()
            # Add massive noise to continuous features
            for idx in simulator.continuous_indices:
                features[idx] += random.uniform(-10.0, 10.0)
            
            if predict_fn:
                from main import PredictRequest
                await predict_fn(PredictRequest(features=features, ip=ip))
            
            events.append({"features": features, "ip": ip})
        return events
