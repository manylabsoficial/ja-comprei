# Corrections to backend requirements

## Problem
The `requirements.txt` file was generated using `pip freeze` which included:
1. **UTF-16LE Encoding**: Causes issues with deployment services (Railway, etc) and some tools.
2. **Missing Dependencies**: `fastapi`, `uvicorn`, `python-multipart` were removed or missing from the latest version.
3. **Unnecessary Packages**: Likely contained global system packages not needed for the project.

## Proposed Changes
Regenerate `requirements.txt` with the following explicit dependencies (UTF-8 encoded):
- `fastapi`
- `uvicorn`
- `python-multipart`
- `pydantic`
- `pydantic-settings`
- `python-dotenv`
- `groq`
- `brevo-python` (Replacing sib-api-v3-sdk)
- `httpx`

## Verification
- User to review the file content.
- User can run `pip install -r requirements.txt` locally to verify storage.
