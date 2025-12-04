# Copilot Instructions

## General Guidelines
- Write simple, clear, and readable code.
- Follow basic style guides (e.g., PEP 8 for Python, Airbnb for JavaScript).
- Use type hints in Python and ES6+ syntax in JavaScript where needed.
- Keep solutions straightforward, avoiding complex logic or over-optimization.
- Skip unnecessary comments; only explain critical logic briefly.
- Do not fix linting errors (e.g., indentation); leave for manual correction.
- Do not execute scripts or run code automatically.
- Do not write documentation unless specifically requested.

## Workflow
- Before coding, briefly describe the planned approach.
- Use modular, simple code structures for easy maintenance.

## Backend (FastAPI)
- Use async/await for endpoints.
- Use Pydantic for basic request/response validation.
- Handle errors with simple HTTPException.

## Frontend (Vanilla JavaScript)
- Place code in `/static/js`, split into files (e.g., `api.js`, `ui.js`).
- Use `fetch` API for API calls.
- Include basic try/catch for error handling.
- Use camelCase for variables/functions.

## Version Control
- Save this file in `.github/copilot-instructions.md`.
- Write clear commit messages (e.g., `Add login endpoint`).

## Developer Growth Best Practices
- **Readability First**: Write code as if someone else will maintain it; prioritize clarity.
- **Refactor Regularly**: Revisit code to simplify and improve structure.
- **Test Early**: Write basic unit tests with `pytest` (backend) to catch issues.
- **Review Code**: Compare your solutions with open-source projects or team code to adopt better patterns.