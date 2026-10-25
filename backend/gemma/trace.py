"""Gemma 4 Call Tracer.
Records model ID, endpoint, latency, token counts, and outcome for every Gemma 4 call.
Provides an in-memory ring buffer of the last 100 calls and JSONL persistence.
Used to render the live trace panel in the dashboard for judges and auditors.
"""

import collections
import json
import os
import time
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

TRACE_LOG_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "reference", "traces.jsonl")


class TraceEntry(BaseModel):
    id: str
    timestamp: str
    model_id: str
    endpoint: str
    latency_ms: int
    prompt_tokens: int
    output_tokens: int
    outcome: str  # "OK" or "ERR"
    details: Optional[str] = None


class TraceBuffer:
    def __init__(self, capacity: int = 100):
        self.capacity = capacity
        self.buffer: collections.deque = collections.deque(maxlen=capacity)
        self._ensure_log_file()

    def _ensure_log_file(self):
        os.makedirs(os.path.dirname(os.path.abspath(TRACE_LOG_PATH)), exist_ok=True)

    def record(
        self,
        model_id: str,
        endpoint: str,
        latency_ms: int,
        prompt_tokens: int,
        output_tokens: int,
        outcome: str = "OK",
        details: Optional[str] = None,
    ) -> TraceEntry:
        trace_id = f"tr_{int(time.time() * 1000)}"
        entry = TraceEntry(
            id=trace_id,
            timestamp=datetime.now().strftime("%H:%M:%S"),
            model_id=model_id,
            endpoint=endpoint,
            latency_ms=latency_ms,
            prompt_tokens=prompt_tokens,
            output_tokens=output_tokens,
            outcome=outcome,
            details=details,
        )
        self.buffer.append(entry)

        # Append to JSONL log
        try:
            with open(TRACE_LOG_PATH, "a", encoding="utf-8") as f:
                f.write(entry.model_dump_json() + "\n")
        except Exception:
            pass

        return entry

    def get_recent(self) -> List[TraceEntry]:
        return list(reversed(self.buffer))

    def clear(self):
        self.buffer.clear()


# Global tracer instance
tracer = TraceBuffer(capacity=100)
