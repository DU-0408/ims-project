from prometheus_client import Counter, Histogram, Gauge

# Total signals ingested
signals_ingested_total = Counter(
    "ims_signals_ingested_total",
    "Total number of signals ingested",
    ["component_type", "priority"]
)

# Total work items created
work_items_created_total = Counter(
    "ims_work_items_created_total",
    "Total number of work items created",
    ["priority"]
)

# Current queue size
queue_size_gauge = Gauge(
    "ims_signal_queue_size",
    "Current size of the in-memory signal queue"
)

# Signal processing duration
signal_processing_duration = Histogram(
    "ims_signal_processing_duration_seconds",
    "Time taken to process a signal",
    buckets=[0.01, 0.05, 0.1, 0.5, 1.0, 2.0, 5.0]
)

# Active WebSocket connections
active_websocket_connections = Gauge(
    "ims_active_websocket_connections",
    "Number of active WebSocket connections"
)