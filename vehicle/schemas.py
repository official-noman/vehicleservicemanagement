# myapp/schemas.py
from ninja import Schema, ModelSchema
from typing import Optional, List
from datetime import date, datetime
from pydantic import field_validator, model_validator, EmailStr
from django.contrib.auth.models import User
from . import models


# ─────────────────────────────────────────
# AUTH / USER SCHEMAS
# ─────────────────────────────────────────

class UserIn(Schema):
    """Used for creating a new User (customer or mechanic)."""
    first_name: str
    last_name: str
    username: str
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return v

    @field_validator("username")
    @classmethod
    def username_no_spaces(cls, v: str) -> str:
        if " " in v:
            raise ValueError("Username must not contain spaces.")
        return v.strip()


class BookingOut(Schema):
    username: str
    password: str
    email: str
    first_name: str
    last_name: str


class UserOut(Schema):
    id: int
    username: str
    first_name: str
    last_name: str
    is_customer: bool = False
    is_mechanic: bool = False

    @staticmethod
    def resolve_is_customer(obj: User) -> bool:
        return hasattr(obj, "customer")

    @staticmethod
    def resolve_is_mechanic(obj: User) -> bool:
        return hasattr(obj, "mechanic")


class UserUpdateIn(Schema):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None


# ─────────────────────────────────────────
# CUSTOMER SCHEMAS
# ─────────────────────────────────────────

class CustomerIn(Schema):
    """Profile data when registering a customer."""
    address: str
    mobile: str
    profile_pic: Optional[str] = None  # handled as URL or upload path


class CustomerOut(ModelSchema):
    class Meta:
        model = models.Customer
        fields = ["id", "address", "mobile", "profile_pic"]

    user: UserOut


class CustomerRegistrationIn(Schema):
    """Combined user + customer profile for single-request registration."""
    user: UserIn
    profile: CustomerIn


# ─────────────────────────────────────────
# MECHANIC SCHEMAS
# ─────────────────────────────────────────

class MechanicIn(Schema):
    """Profile data when registering a mechanic."""
    address: str
    mobile: str
    skill: str
    profile_pic: Optional[str] = None


class MechanicOut(ModelSchema):
    class Meta:
        model = models.Mechanic
        fields = ["id", "address", "mobile", "skill", "profile_pic"]

    user: UserOut


class MechanicRegistrationIn(Schema):
    """Combined user + mechanic profile for single-request registration."""
    user: UserIn
    profile: MechanicIn


class MechanicSalaryIn(Schema):
    salary: int

    @field_validator("salary")
    @classmethod
    def salary_positive(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Salary must be a non-negative integer.")
        return v


# ─────────────────────────────────────────
# REQUEST / SERVICE SCHEMAS
# ─────────────────────────────────────────

class RequestIn(Schema):
    """Customer submitting a repair request."""
    category: str
    vehicle_no: str
    vehicle_name: str
    vehicle_model: str
    vehicle_brand: str
    problem_description: str


class AdminRequestIn(Schema):
    """Admin creating a request and assigning it."""
    customer_id: int
    mechanic_id: int
    cost: int

    @field_validator("cost")
    @classmethod
    def cost_positive(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Cost must be non-negative.")
        return v


class AdminApproveRequestIn(Schema):
    """Admin approving a request with mechanic, cost, and status."""
    mechanic_id: int
    cost: int
    status: str

    @field_validator("status")
    @classmethod
    def status_valid(cls, v: str) -> str:
        allowed = {"Pending", "Approved", "Released"}
        if v not in allowed:
            raise ValueError(f"Status must be one of: {allowed}")
        return v


class UpdateCostIn(Schema):
    cost: int

    @field_validator("cost")
    @classmethod
    def cost_non_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Cost must be non-negative.")
        return v


class MechanicUpdateStatusIn(Schema):
    status: str

    @field_validator("status")
    @classmethod
    def status_valid(cls, v: str) -> str:
        allowed = {"Approved", "Repairing", "Repairing Done"}
        if v not in allowed:
            raise ValueError(f"Status must be one of: {allowed}")
        return v


class RequestOut(ModelSchema):
    class Meta:
        model = models.Request
        fields = [
            "id", "category", "vehicle_no", "vehicle_name",
            "vehicle_model", "vehicle_brand", "problem_description", "status", "cost",
        ]


# ─────────────────────────────────────────
# FEEDBACK SCHEMAS
# ─────────────────────────────────────────

class FeedbackIn(Schema):
    by: str
    message: str

    @field_validator("message")
    @classmethod
    def message_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Message cannot be blank.")
        return v


class FeedbackOut(ModelSchema):
    class Meta:
        model = models.Feedback
        fields = ["id", "by", "message"]


# ─────────────────────────────────────────
# ATTENDANCE SCHEMAS
# ─────────────────────────────────────────

class AttendanceIn(Schema):
    present_status: str
    date: date

    @field_validator("present_status")
    @classmethod
    def status_valid(cls, v: str) -> str:
        if v not in {"Present", "Absent"}:
            raise ValueError("present_status must be 'Present' or 'Absent'.")
        return v


class AskDateIn(Schema):
    date: date


class AttendanceOut(ModelSchema):
    class Meta:
        model = models.Attendance
        fields = ["id", "present_status", "date"]


# ─────────────────────────────────────────
# CONTACT SCHEMAS
# ─────────────────────────────────────────

class ContactUsIn(Schema):
    name: str
    email: EmailStr
    message: str

    @field_validator("name")
    @classmethod
    def name_max_length(cls, v: str) -> str:
        if len(v) > 30:
            raise ValueError("Name must not exceed 30 characters.")
        return v

    @field_validator("message")
    @classmethod
    def message_max_length(cls, v: str) -> str:
        if len(v) > 500:
            raise ValueError("Message must not exceed 500 characters.")
        return v


# ─────────────────────────────────────────
# GENERIC RESPONSE SCHEMAS
# ─────────────────────────────────────────

class SuccessResponse(Schema):
    success: bool = True
    message: str


class ErrorResponse(Schema):
    success: bool = False
    detail: str
  
  
class ServiceOut(Schema):
    id: int
    name: str
    description: Optional[str] = None
    price: Optional[float] = 0.0  