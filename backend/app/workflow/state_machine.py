from abc import ABC, abstractmethod

class WorkItemState(ABC):
    @abstractmethod
    def transition(self, work_item: dict) -> str:
        pass

class OpenState(WorkItemState):
    def transition(self, work_item: dict) -> str:
        return "INVESTIGATING"

class InvestigatingState(WorkItemState):
    def transition(self, work_item: dict) -> str:
        return "RESOLVED"

class ResolvedState(WorkItemState):
    def transition(self, work_item: dict) -> str:
        return "CLOSED"

class ClosedState(WorkItemState):
    def transition(self, work_item: dict) -> str:
        raise ValueError("Work item is already CLOSED")

STATE_MAP = {
    "OPEN": OpenState(),
    "INVESTIGATING": InvestigatingState(),
    "RESOLVED": ResolvedState(),
    "CLOSED": ClosedState(),
}

def get_next_status(current_status: str, rca: dict = None) -> str:
    state = STATE_MAP.get(current_status)
    if not state:
        raise ValueError(f"Unknown status: {current_status}")

    next_status = state.transition({})

    # Guard: cannot close without RCA
    if next_status == "CLOSED":
        if not rca or not rca.get("root_cause_category") or not rca.get("fix_applied"):
            raise ValueError("Cannot close incident: RCA is missing or incomplete")

    return next_status