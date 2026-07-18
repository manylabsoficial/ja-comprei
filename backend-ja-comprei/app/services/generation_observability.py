import asyncio
import logging
import re
from typing import Any

from supabase import create_client

from app.core.config import get_settings

logger = logging.getLogger(__name__)
_SECRET_PATTERN = re.compile(r"(?:sk-[A-Za-z0-9_-]+|Bearer\s+[A-Za-z0-9._-]+)", re.IGNORECASE)


def _safe_error(error: Exception | str | None, limit: int = 500) -> str | None:
    if not error:
        return None
    message = _SECRET_PATTERN.sub("[redacted]", str(error)).replace("\n", " ").strip()
    return message[:limit] or None


class GenerationObservability:
    """Persist lightweight recipe-generation events without storing prompts or image payloads."""

    @staticmethod
    def _rpc(name: str, payload: dict[str, Any]):
        settings = get_settings()
        return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY).rpc(name, payload).execute()

    async def create_run(self, run_id: str, user_id: str | None, ingredient_count: int) -> None:
        try:
            await asyncio.to_thread(self._rpc, "jacomprei_create_generation_run", {
                "p_run_id": run_id,
                "p_user_id": user_id,
                "p_ingredient_count": ingredient_count,
            })
        except Exception:
            logger.exception("Observability: failed to create generation run %s", run_id)

    def event(self, run_id: str | None, event_type: str, stage: str, *, level: str = "info",
              provider: str | None = None, model: str | None = None, recipe_index: int | None = None,
              duration_ms: int | None = None, error: Exception | str | None = None,
              metadata: dict[str, Any] | None = None) -> None:
        if not run_id:
            return
        asyncio.create_task(self._record_event(run_id, event_type, stage, level, provider, model,
                                                 recipe_index, duration_ms, error, metadata or {}))

    async def _record_event(self, run_id: str, event_type: str, stage: str, level: str,
                            provider: str | None, model: str | None, recipe_index: int | None,
                            duration_ms: int | None, error: Exception | str | None,
                            metadata: dict[str, Any]) -> None:
        try:
            await asyncio.to_thread(self._rpc, "jacomprei_add_generation_event", {
                "p_run_id": run_id, "p_event_type": event_type, "p_stage": stage,
                "p_level": level, "p_provider": provider, "p_model": model,
                "p_recipe_index": recipe_index, "p_duration_ms": duration_ms,
                "p_error_code": type(error).__name__ if isinstance(error, Exception) else None,
                "p_error_message": _safe_error(error), "p_metadata": metadata,
            })
        except Exception:
            logger.exception("Observability: failed to record %s for run %s", event_type, run_id)

    async def finish_run(self, run_id: str, status: str, duration_ms: int, *, recipe_count: int | None = None,
                         error: Exception | str | None = None) -> None:
        try:
            await asyncio.to_thread(self._rpc, "jacomprei_finish_generation_run", {
                "p_run_id": run_id, "p_status": status, "p_recipe_count": recipe_count,
                "p_duration_ms": duration_ms,
                "p_error_code": type(error).__name__ if isinstance(error, Exception) else None,
                "p_error_message": _safe_error(error),
            })
        except Exception:
            logger.exception("Observability: failed to finish generation run %s", run_id)

    async def record_client_image_event(self, run_id: str, user_id: str, recipe_index: int,
                                        event_type: str, metadata: dict[str, Any]) -> bool:
        try:
            response = await asyncio.to_thread(self._rpc, "jacomprei_add_generation_client_event", {
                "p_run_id": run_id, "p_user_id": user_id, "p_recipe_index": recipe_index,
                "p_event_type": event_type, "p_metadata": metadata,
            })
            return bool(response.data)
        except Exception:
            logger.exception("Observability: failed to record browser image event for run %s", run_id)
            return False


generation_observability = GenerationObservability()
