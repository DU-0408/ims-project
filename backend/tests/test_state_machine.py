import pytest
from app.workflow.state_machine import get_next_status

class TestStateMachineTransitions:

    def test_open_transitions_to_investigating(self):
        next_status = get_next_status("OPEN")
        assert next_status == "INVESTIGATING"

    def test_investigating_transitions_to_resolved(self):
        next_status = get_next_status("INVESTIGATING")
        assert next_status == "RESOLVED"

    def test_resolved_with_rca_transitions_to_closed(self):
        rca = {
            "root_cause_category": "Database Corruption",
            "fix_applied": "Restored from backup"
        }
        next_status = get_next_status("RESOLVED", rca)
        assert next_status == "CLOSED"

    def test_resolved_without_rca_raises_error(self):
        with pytest.raises(ValueError, match="RCA is missing or incomplete"):
            get_next_status("RESOLVED", None)

    def test_resolved_with_incomplete_rca_raises_error(self):
        rca = {
            "root_cause_category": "",
            "fix_applied": ""
        }
        with pytest.raises(ValueError, match="RCA is missing or incomplete"):
            get_next_status("RESOLVED", rca)

    def test_closed_raises_error(self):
        with pytest.raises(ValueError, match="already CLOSED"):
            get_next_status("CLOSED")

    def test_invalid_status_raises_error(self):
        with pytest.raises(ValueError, match="Unknown status"):
            get_next_status("INVALID_STATUS")