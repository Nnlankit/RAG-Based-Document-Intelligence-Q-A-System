"""Conversation memory management for multi-turn dialogues."""

from dataclasses import dataclass
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database.models import Conversation, Message


@dataclass
class ChatTurn:
    """Represents a single conversational turn."""
    role: str
    content: str


class ConversationMemory:
    """Manages retrieving and persisting conversation message history."""

    @classmethod
    def get_recent_history(
        cls,
        db: Session,
        conversation_id: str,
        max_turns: int = 5,
    ) -> List[ChatTurn]:
        """Fetches the last N turns of conversation history."""
        messages = (
            db.query(Message)
            .filter(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .limit(max_turns * 2)
            .all()
        )
        # Reverse to chronological order
        chronological = list(reversed(messages))
        return [ChatTurn(role=m.role, content=m.content) for m in chronological]

    @classmethod
    def format_history_for_prompt(cls, turns: List[ChatTurn]) -> str:
        """Formats conversational turns into clean text representation."""
        if not turns:
            return ""
        lines = []
        for turn in turns:
            role_label = "User" if turn.role.lower() == "user" else "Assistant"
            lines.append(f"{role_label}: {turn.content}")
        return "\n".join(lines)
