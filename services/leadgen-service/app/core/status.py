from enum import StrEnum


class RunStatus(StrEnum):
    CREATED = "created"
    QUEUED = "queued"
    CRAWLING = "crawling"
    CLEANING = "cleaning"
    EMBEDDING = "embedding"
    EXTRACTING = "extracting"
    STORING = "storing"
    VERIFYING = "verifying"
    DONE = "done"
    FAILED = "failed"


ACTIVE_RUN_STATUSES = {
    RunStatus.CREATED,
    RunStatus.QUEUED,
    RunStatus.CRAWLING,
    RunStatus.CLEANING,
    RunStatus.EMBEDDING,
    RunStatus.EXTRACTING,
    RunStatus.STORING,
    RunStatus.VERIFYING,
}

ALLOWED_TRANSITIONS: dict[RunStatus, set[RunStatus]] = {
    RunStatus.CREATED: {RunStatus.QUEUED, RunStatus.FAILED},
    RunStatus.QUEUED: {RunStatus.CRAWLING, RunStatus.FAILED},
    RunStatus.CRAWLING: {RunStatus.CLEANING, RunStatus.FAILED},
    RunStatus.CLEANING: {RunStatus.EMBEDDING, RunStatus.FAILED},
    RunStatus.EMBEDDING: {RunStatus.EXTRACTING, RunStatus.FAILED},
    RunStatus.EXTRACTING: {RunStatus.STORING, RunStatus.FAILED},
    RunStatus.STORING: {RunStatus.VERIFYING, RunStatus.FAILED},
    RunStatus.VERIFYING: {RunStatus.DONE, RunStatus.FAILED},
    RunStatus.DONE: set(),
    RunStatus.FAILED: set(),
}


def can_transition(current_status: RunStatus, next_status: RunStatus) -> bool:
    return next_status in ALLOWED_TRANSITIONS[current_status]
