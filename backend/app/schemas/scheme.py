from pydantic import BaseModel, Field
from typing import Any

class Profile(BaseModel):
    name: str | None = None
    state: str | None = None
    age: int | None = Field(default=None, ge=0, le=120)
    occupation: str | None = None
    education: str | None = None
    annual_income: float | None = Field(default=None, ge=0)
    category: str | None = None
    preferred_language: str = "en"
    digital_comfort: str = "comfortable"

class Scheme(BaseModel):
    id: str
    name: str
    description: str
    category: str
    state: str = "All India"
    state_ut: str | None = None
    government_level: str = "CENTRAL"
    scheme_service_type: str = "SCHEME"
    department: str | None = None
    benefits: list[str] = []
    eligibility: dict[str, Any] = {}
    official_url: str
    application_url: str | None = None
    information_status: str = "PENDING_ADMIN_REVIEW"
    verification_status: str = "PENDING_ADMIN_REVIEW"
    last_verified_date: str | None = None
    is_active: bool = True
    documents: list[dict[str, str]] = []
