import random
import asyncio
from scenarios.scenario_base import Scenario

class AssaultScenario(Scenario):
    @property
    def name(self) -> str:
        return "assault"

    @property
    def description(self) -> str:
        return "A multi-vector assault combining poisoning and evasion to overwhelm the defender."

    async def run(self, simulator, count: int, predict_fn=None, train_fn=None, ip=None) -> list:
        events = []
        for _ in range(count):
            # 50% chance of poisoning, 50% chance of evasion
            if random.random() > 0.5:
                features, label = simulator.generate_poison()
                if train_fn:
                    from main import TrainRequest
                    await train_fn(TrainRequest(features=features, label=label, ip=ip))
                events.append({"type": "poison", "features": features, "ip": ip})
            else:
                features = simulator.generate_evasion()
                if predict_fn:
                    from main import PredictRequest
                    await predict_fn(PredictRequest(features=features, ip=ip))
                events.append({"type": "evasion", "features": features, "ip": ip})
            
        return events
