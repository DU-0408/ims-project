# AI Prompts & Tools Used

This project was built with the assistance of Claude (Anthropic) as an AI pair
programmer. The following describes how AI was used during development.

## Tool Used
- **Claude Sonnet** by Anthropic (via claude.ai)

## How It Was Used
- System architecture and tech stack decisions
- Code generation for FastAPI backend, React frontend, and Docker Compose
- Debugging errors during development
- UI design and component styling
- README documentation
- Bonus features implementation
- Docker and deployment configuration

## Key Prompts Used
1. Designing the overall architecture for a high-throughput IMS system
2. Implementing the asyncio Queue backpressure mechanism
3. Implementing Strategy Pattern for alerting and State Pattern for lifecycle
4. Building the React frontend with live polling and RCA form
5. Docker Compose setup with health checks and Nginx reverse proxy
6. Debugging timezone mismatch errors in PostgreSQL datetime handling
7. Fixing debounce signal insertion logic in MongoDB
8. Adding JWT authentication with register/login endpoints
9. Implementing WebSocket real-time dashboard updates with auto-reconnect
10. Adding retry logic with exponential backoff on database writes
11. Writing pytest unit tests for RCA validation and state machine
12. Setting up Prometheus metrics and Grafana dashboard with 5 panels
13. Custom dark-themed React UI with glassmorphism and toast notifications
14. Seed script for simulating RDBMS and MCP failure events