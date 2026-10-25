"""Clause retrieval store for VB-G RAM G statutory provisions.
Drafting layer and audit engine cite ONLY provisions returned by retrieve().
"""

import json
import os
from typing import Any, Dict, List, Optional

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "clauses.json")

_CLAUSES_CACHE: Optional[List[Dict[str, Any]]] = None


def _load_clauses() -> List[Dict[str, Any]]:
    global _CLAUSES_CACHE
    if _CLAUSES_CACHE is None:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            _CLAUSES_CACHE = json.load(f)
    return _CLAUSES_CACHE


def get_clause_by_id(clause_id: str) -> Optional[Dict[str, Any]]:
    """Look up a single clause by its unique statutory ID."""
    for clause in _load_clauses():
        if clause["id"] == clause_id:
            return clause
    return None


def retrieve(query: str, k: int = 3) -> List[Dict[str, Any]]:
    """Retrieve relevant clauses by keyword/tag scoring.
    The drafting layer may cite ONLY clauses returned by this function.
    """
    clauses = _load_clauses()
    q_lower = query.lower()
    q_words = set(q_lower.replace(",", " ").replace(".", " ").split())

    scored = []
    for c in clauses:
        score = 0
        c_id = c["id"].lower()
        sec_ref = c["section_reference"].lower()
        title = c["title"].lower()
        gloss = c["plain_language_gloss"].lower()
        tags = [t.lower() for t in c.get("tags", [])]

        if c_id in q_lower or sec_ref in q_lower:
            score += 15

        for word in q_words:
            if word in tags:
                score += 5
            if word in title:
                score += 3
            if word in gloss:
                score += 1

        scored.append((score, c))

    scored.sort(key=lambda x: x[0], reverse=True)
    results = [c for score, c in scored[:k] if score > 0]
    if not results:
        results = [scored[0][1]] if scored else []
    return results
