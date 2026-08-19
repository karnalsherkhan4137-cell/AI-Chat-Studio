import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from app.config import settings


def generate_response(message: str) -> str:
    """Generate an answer with Gemini."""
    if not settings.GEMINI_API_KEY:
        return "Gemini is not configured. Add GEMINI_API_KEY to backend/.env and restart the backend."

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
    )
    payload = {
        "contents": [{"parts": [{"text": message}]}]
    }
    request = Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urlopen(request, timeout=30) as response:
            result = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Gemini API error ({error.code}): {detail}") from error
    except URLError as error:
        raise RuntimeError(f"Could not connect to Gemini: {error.reason}") from error

    try:
        return result["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError) as error:
        raise RuntimeError("Gemini returned an empty or invalid response.") from error