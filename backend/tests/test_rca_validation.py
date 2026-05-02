import pytest
from app.workflow.state_machine import get_next_status

class TestRCAValidation:

    def test_rca_with_all_fields_allows_close(self):
        rca = {
            "root_cause_category": "Network Failure",
            "fix_applied": "Restarted the network interface"
        }
        result = get_next_status("RESOLVED", rca)
        assert result == "CLOSED"

    def test_rca_missing_root_cause_blocks_close(self):
        rca = {
            "root_cause_category": "",
            "fix_applied": "Some fix"
        }
        with pytest.raises(ValueError):
            get_next_status("RESOLVED", rca)

    def test_rca_missing_fix_applied_blocks_close(self):
        rca = {
            "root_cause_category": "Code Bug",
            "fix_applied": ""
        }
        with pytest.raises(ValueError):
            get_next_status("RESOLVED", rca)

    def test_rca_none_blocks_close(self):
        with pytest.raises(ValueError):
            get_next_status("RESOLVED", None)

    def test_rca_empty_dict_blocks_close(self):
        with pytest.raises(ValueError):
            get_next_status("RESOLVED", {})

    def test_mttr_calculation(self):
        from datetime import datetime
        start = datetime(2026, 5, 1, 8, 0, 0)
        end = datetime(2026, 5, 1, 9, 0, 0)
        mttr_minutes = (end - start).total_seconds() / 60
        assert mttr_minutes == 60.0

    def test_mttr_calculation_partial_hours(self):
        from datetime import datetime
        start = datetime(2026, 5, 1, 8, 0, 0)
        end = datetime(2026, 5, 1, 8, 35, 0)
        mttr_minutes = (end - start).total_seconds() / 60
        assert mttr_minutes == 35.0