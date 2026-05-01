from abc import ABC, abstractmethod

class AlertStrategy(ABC):
    @abstractmethod
    def alert(self, work_item: dict):
        pass

class P0Alert(AlertStrategy):
    def alert(self, work_item: dict):
        print(f"[P0 ALERT] 🔴 CRITICAL - Paging on-call immediately for {work_item['component_id']}")

class P1Alert(AlertStrategy):
    def alert(self, work_item: dict):
        print(f"[P1 ALERT] 🟠 HIGH - Notifying team channel for {work_item['component_id']}")

class P2Alert(AlertStrategy):
    def alert(self, work_item: dict):
        print(f"[P2 ALERT] 🟡 MEDIUM - Logging ticket for {work_item['component_id']}")

class AlertContext:
    def __init__(self, strategy: AlertStrategy):
        self._strategy = strategy

    def execute(self, work_item: dict):
        self._strategy.alert(work_item)

def get_strategy(priority) -> AlertStrategy:
    return {
        "P0": P0Alert(),
        "P1": P1Alert(),
        "P2": P2Alert(),
    }.get(str(priority).replace("PriorityEnum.", ""), P2Alert())