from abc import ABC, abstractmethod
from typing import List, Tuple, Union

class Scenario(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        """Unique name of the scenario."""
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        """Human-readable description of the scenario."""
        pass

    @abstractmethod
    async def run(self, simulator, count: int, predict_fn=None, train_fn=None, ip=None) -> List[dict]:
        """
        Execute the scenario logic.
        Should return a list of generated events or features.
        """
        pass
