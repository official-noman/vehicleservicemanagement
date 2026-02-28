# vehicle/api.py
import random
from typing import List
from ninja_extra import NinjaExtraAPI
from ninja_jwt.controller import NinjaJWTDefaultController
from ninja_jwt.authentication import JWTAuth
from ninja import Schema
from django.contrib.auth.models import User, Group
from django.contrib.auth import authenticate
from django.db.models import Sum, Q
from django.core.mail import send_mail
from django.db import transaction
from django.conf import settings
from ninja.errors import ValidationError
from django.http import JsonResponse
import json

from . import models
from .schemas import (
    UserOut,
    CustomerOut,
    CustomerRegistrationIn,
    MechanicOut,
    MechanicRegistrationIn,
    MechanicSalaryIn,
    RequestIn,
    RequestOut,
    AdminRequestIn,
    AdminApproveRequestIn,
    UpdateCostIn,
    MechanicUpdateStatusIn,
    FeedbackIn,
    FeedbackOut,
    AttendanceIn,
    AttendanceOut,
    ContactUsIn,
    SuccessResponse,
    ErrorResponse,
    ServiceOut,
)

api = NinjaExtraAPI(title="Vehicle Service API", csrf=False)  # instead of ninja api



@api.exception_handler(ValidationError)
def validation_error_handler(request, exc):
    print("\n===== NINJA VALIDATION ERROR =====")
    print(json.dumps(exc.errors, indent=4))
    print("===================================\n")
    return JsonResponse(
        {
            "success": False,
            "detail": exc.errors,
        },
        status=400,
    )

# automatic token generate and refresh endpoints provided by NinjaJWTDefaultController
api.register_controllers(NinjaJWTDefaultController)


# ─────────────────────────────────────────
# INLINE SCHEMAS (api.py only)
# ─────────────────────────────────────────


class LoginIn(Schema):
    username: str
    password: str


class LoginOut(Schema):
    access: str
    refresh: str
    role: str  # "admin" | "customer" | "mechanic"
    user: UserOut


class AdminDashboardOut(Schema):
    total_customer: int
    total_mechanic: int
    total_request: int
    total_feedback: int


class InvoiceOut(Schema):
    customer_id: int
    customer_name: str
    total_cost: float


class CustomerDashboardOut(Schema):
    work_in_progress: int
    work_completed: int
    new_request_made: int
    bill: float
    customer: CustomerOut


class MechanicDashboardOut(Schema):
    work_in_progress: int
    work_completed: int
    new_work_assigned: int
    salary: float
    mechanic: MechanicOut


class BulkAttendanceIn(Schema):
    date: str  # "YYYY-MM-DD"
    statuses: List[str]  # one per active mechanic, in queryset order


# ─────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────


def _is_customer(user: User) -> bool:
    return user.groups.filter(name="CUSTOMER").exists()


def _is_mechanic(user: User) -> bool:
    return user.groups.filter(name="MECHANIC").exists()


def _create_user(user_data) -> User:
    user = User(
        username=user_data.username,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
    )
    user.set_password(user_data.password)
    user.save()
    return user


# ─────────────────────────────────────────
# AUTH
# ─────────────────────────────────────────


@api.post(
    "/auth/register/customer",
    response={201: CustomerOut, 400: ErrorResponse},
    tags=["Auth"],
)
def register_customer(request, payload: CustomerRegistrationIn):
    if User.objects.filter(username=payload.user.username).exists():
        return 400, {"detail": "Username already taken."}
    if User.objects.filter(email=payload.user.email).exists():
        return 400, {"detail": "Email already registered."}

    try:
        with transaction.atomic():
            # ১. User তৈরি করুন, কিন্তু is_active=False রাখুন যতক্ষণ OTP ভেরিফাই না হয়
            user = _create_user(payload.user)
            user.email = payload.user.email
            user.is_active = False
            user.save()

            # ২. ৬ সংখ্যার random OTP তৈরি করুন
            otp = str(random.randint(100000, 999999))

            customer = models.Customer.objects.create(
                user=user,
                address=payload.profile.address,
                mobile=payload.profile.mobile,
                otp_code=otp,
                is_verified=False,
            )
            group, _ = Group.objects.get_or_create(name="CUSTOMER")
            group.user_set.add(user)
    except Exception as db_err:
        print(f"[Register DB Error] {db_err}")
        return 400, {"detail": f"Registration failed: {str(db_err)}"}

    # ৩. OTP HTML ইমেইলে পাঠান (inline styles — email client compatible)
    html_message = f"""<!DOCTYPE html>
<html>
<body style="background-color: #f4f4f4; margin: 0; padding: 0; font-family: Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background-color: #000000; padding: 30px; text-align: center;">
      <h1 style="color: #D4AF37; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">IGL WEB</h1>
    </div>
    <div style="padding: 40px; text-align: center; color: #333333;">
      <p style="font-size: 16px;">Hello,</p>
      <p>To complete your registration, please enter the code below:</p>
      <div style="font-size: 36px; font-weight: bold; letter-spacing: 5px; color: #000000; margin: 20px 0; padding: 15px; border: 2px dashed #D4AF37; display: inline-block;">{otp}</div>
      <p style="color: #888; font-size: 12px;">Valid for 10 minutes. Do not share this code.</p>
    </div>
    <div style="background-color: #111; padding: 15px; text-align: center; color: #555; font-size: 10px;">
      &copy; 2026 IGL Web. Premium Service.
    </div>
  </div>
</body>
</html>"""

    try:
        send_mail(
            subject="Verify Your Account - IGL Web",
            message=f"Your IGL Web verification OTP is: {otp}\n\nThis code is valid for 10 minutes. Do not share it with anyone.",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user.email],
            fail_silently=False,
            html_message=html_message,
        )
    except Exception as e:
        # Email পাঠাতে সমস্যা হলেও registration সফল থাকবে,
        # কিন্তু error log করা হবে
        print(f"[OTP Email Error] {e}")

    return 201, customer


class OtpVerifyIn(Schema):
    email: str
    otp: str


@api.post(
    "/auth/verify-otp", response={200: CustomerOut, 400: ErrorResponse}, tags=["Auth"]
)
def verify_otp(request, payload: OtpVerifyIn):
    """OTP দিয়ে account verify করুন এবং is_active=True করুন।"""
    try:
        user = User.objects.get(email=payload.email)
        customer = models.Customer.objects.get(user=user)
    except (User.DoesNotExist, models.Customer.DoesNotExist):
        return 400, {"detail": "No account found with this email."}

    if customer.otp_code != payload.otp:
        return 400, {"detail": "Invalid OTP. Please check and try again."}

    # OTP মিলে গেলে account activate করুন
    user.is_active = True
    user.save()

    customer.is_verified = True
    customer.otp_code = ""  # OTP clear করে দিন (security)
    customer.save()

    return 200, customer


@api.post(
    "/auth/register/mechanic",
    response={201: MechanicOut, 400: ErrorResponse},
    tags=["Auth"],
)
def register_mechanic(request, payload: MechanicRegistrationIn):
    if User.objects.filter(username=payload.user.username).exists():
        return 400, {"detail": "Username already taken."}

    user = _create_user(payload.user)
    mechanic = models.Mechanic.objects.create(
        user=user,
        address=payload.profile.address,
        mobile=payload.profile.mobile,
        skill=payload.profile.skill,
        profile_pic=payload.profile.profile_pic or "",
        status=False,  # pending admin approval
        salary=0,
    )
    group, _ = Group.objects.get_or_create(name="MECHANIC")
    group.user_set.add(user)
    return 201, mechanic


@api.post("/auth/login", response={200: LoginOut, 401: ErrorResponse}, tags=["Auth"])
def login(request, payload: LoginIn):
    """Returns JWT access+refresh tokens with the user's role."""
    from ninja_jwt.tokens import RefreshToken

    user = authenticate(username=payload.username, password=payload.password)
    if not user:
        return 401, {"detail": "Invalid credentials."}

    refresh = RefreshToken.for_user(user)
    role = (
        "customer"
        if _is_customer(user)
        else "mechanic"
        if _is_mechanic(user)
        else "admin"
    )

    return 200, {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "role": role,
        "user": user,
    }


# ─────────────────────────────────────────
# ADMIN — DASHBOARD
# ─────────────────────────────────────────


@api.get("/admin/dashboard", response=AdminDashboardOut, auth=JWTAuth(), tags=["Admin"])
def admin_dashboard(request):
    return {
        "total_customer": models.Customer.objects.count(),
        "total_mechanic": models.Mechanic.objects.count(),
        "total_request": models.Request.objects.count(),
        "total_feedback": models.Feedback.objects.count(),
    }


# ─────────────────────────────────────────
# ADMIN — CUSTOMERS
# ─────────────────────────────────────────


@api.get(
    "/admin/customers",
    response=List[CustomerOut],
    auth=JWTAuth(),
    tags=["Admin - Customers"],
)
def admin_list_customers(request):
    return models.Customer.objects.select_related("user").all()


@api.post(
    "/admin/customers",
    response={201: CustomerOut, 400: ErrorResponse},
    auth=JWTAuth(),
    tags=["Admin - Customers"],
)
def admin_add_customer(request, payload: CustomerRegistrationIn):
    if User.objects.filter(username=payload.user.username).exists():
        return 400, {"detail": "Username already taken."}

    user = _create_user(payload.user)
    customer = models.Customer.objects.create(
        user=user,
        address=payload.profile.address,
        mobile=payload.profile.mobile,
        profile_pic=payload.profile.profile_pic or "",
    )
    group, _ = Group.objects.get_or_create(name="CUSTOMER")
    group.user_set.add(user)
    return 201, customer


@api.put(
    "/admin/customers/{customer_id}",
    response={200: CustomerOut, 404: ErrorResponse},
    auth=JWTAuth(),
    tags=["Admin - Customers"],
)
def admin_update_customer(request, customer_id: int, payload: CustomerRegistrationIn):
    try:
        customer = models.Customer.objects.get(id=customer_id)
    except models.Customer.DoesNotExist:
        return 404, {"detail": "Customer not found."}

    user = customer.user
    user.first_name = payload.user.first_name
    user.last_name = payload.user.last_name
    user.username = payload.user.username
    user.set_password(payload.user.password)
    user.save()

    customer.address = payload.profile.address
    customer.mobile = payload.profile.mobile
    if payload.profile.profile_pic:
        customer.profile_pic = payload.profile.profile_pic
    customer.save()
    return 200, customer


@api.delete(
    "/admin/customers/{customer_id}",
    response={200: SuccessResponse, 404: ErrorResponse},
    auth=JWTAuth(),
    tags=["Admin - Customers"],
)
def admin_delete_customer(request, customer_id: int):
    try:
        customer = models.Customer.objects.get(id=customer_id)
    except models.Customer.DoesNotExist:
        return 404, {"detail": "Customer not found."}

    customer.user.delete()
    return 200, {"message": "Customer deleted successfully."}


# ─────────────────────────────────────────
# ADMIN — MECHANICS
# ─────────────────────────────────────────


@api.get(
    "/admin/mechanics",
    response=List[MechanicOut],
    auth=JWTAuth(),
    tags=["Admin - Mechanics"],
)
def admin_list_mechanics(request):
    return models.Mechanic.objects.select_related("user").all()


@api.get(
    "/admin/mechanics/pending",
    response=List[MechanicOut],
    auth=JWTAuth(),
    tags=["Admin - Mechanics"],
)
def admin_list_pending_mechanics(request):
    return models.Mechanic.objects.select_related("user").filter(status=False)


@api.post(
    "/admin/mechanics",
    response={201: MechanicOut, 400: ErrorResponse},
    auth=JWTAuth(),
    tags=["Admin - Mechanics"],
)
def admin_add_mechanic(request, payload: MechanicRegistrationIn, salary: int = 0):
    if User.objects.filter(username=payload.user.username).exists():
        return 400, {"detail": "Username already taken."}

    user = _create_user(payload.user)
    mechanic = models.Mechanic.objects.create(
        user=user,
        address=payload.profile.address,
        mobile=payload.profile.mobile,
        skill=payload.profile.skill,
        profile_pic=payload.profile.profile_pic or "",
        status=True,
        salary=salary,
    )
    group, _ = Group.objects.get_or_create(name="MECHANIC")
    group.user_set.add(user)
    return 201, mechanic


@api.patch(
    "/admin/mechanics/{mechanic_id}/approve",
    response={200: MechanicOut, 404: ErrorResponse},
    auth=JWTAuth(),
    tags=["Admin - Mechanics"],
)
def admin_approve_mechanic(request, mechanic_id: int, payload: MechanicSalaryIn):
    try:
        mechanic = models.Mechanic.objects.get(id=mechanic_id)
    except models.Mechanic.DoesNotExist:
        return 404, {"detail": "Mechanic not found."}

    mechanic.salary = payload.salary
    mechanic.status = True
    mechanic.save()
    return 200, mechanic


@api.put(
    "/admin/mechanics/{mechanic_id}",
    response={200: MechanicOut, 404: ErrorResponse},
    auth=JWTAuth(),
    tags=["Admin - Mechanics"],
)
def admin_update_mechanic(request, mechanic_id: int, payload: MechanicRegistrationIn):
    try:
        mechanic = models.Mechanic.objects.get(id=mechanic_id)
    except models.Mechanic.DoesNotExist:
        return 404, {"detail": "Mechanic not found."}

    user = mechanic.user
    user.first_name = payload.user.first_name
    user.last_name = payload.user.last_name
    user.username = payload.user.username
    user.set_password(payload.user.password)
    user.save()

    mechanic.address = payload.profile.address
    mechanic.mobile = payload.profile.mobile
    mechanic.skill = payload.profile.skill
    if payload.profile.profile_pic:
        mechanic.profile_pic = payload.profile.profile_pic
    mechanic.save()
    return 200, mechanic


@api.patch(
    "/admin/mechanics/{mechanic_id}/salary",
    response={200: MechanicOut, 404: ErrorResponse},
    auth=JWTAuth(),
    tags=["Admin - Mechanics"],
)
def admin_update_mechanic_salary(request, mechanic_id: int, payload: MechanicSalaryIn):
    try:
        mechanic = models.Mechanic.objects.get(id=mechanic_id)
    except models.Mechanic.DoesNotExist:
        return 404, {"detail": "Mechanic not found."}

    mechanic.salary = payload.salary
    mechanic.save()
    return 200, mechanic


@api.delete(
    "/admin/mechanics/{mechanic_id}",
    response={200: SuccessResponse, 404: ErrorResponse},
    auth=JWTAuth(),
    tags=["Admin - Mechanics"],
)
def admin_delete_mechanic(request, mechanic_id: int):
    try:
        mechanic = models.Mechanic.objects.get(id=mechanic_id)
    except models.Mechanic.DoesNotExist:
        return 404, {"detail": "Mechanic not found."}

    mechanic.user.delete()
    return 200, {"message": "Mechanic deleted successfully."}


# ─────────────────────────────────────────
# ADMIN — REQUESTS
# ─────────────────────────────────────────


@api.get(
    "/admin/requests",
    response=List[RequestOut],
    auth=JWTAuth(),
    tags=["Admin - Requests"],
)
def admin_list_requests(request):
    return models.Request.objects.all().order_by("-id")


@api.get(
    "/admin/requests/pending",
    response=List[RequestOut],
    auth=JWTAuth(),
    tags=["Admin - Requests"],
)
def admin_list_pending_requests(request):
    return models.Request.objects.filter(status="Pending")


@api.post(
    "/admin/requests",
    response={201: RequestOut, 400: ErrorResponse},
    auth=JWTAuth(),
    tags=["Admin - Requests"],
)
def admin_add_request(request, request_data: RequestIn, admin_data: AdminRequestIn):
    try:
        customer = models.Customer.objects.get(id=admin_data.customer_id)
        mechanic = models.Mechanic.objects.get(id=admin_data.mechanic_id)
    except (models.Customer.DoesNotExist, models.Mechanic.DoesNotExist):
        return 400, {"detail": "Customer or Mechanic not found."}

    req = models.Request.objects.create(
        customer=customer,
        mechanic=mechanic,
        cost=admin_data.cost,
        status="Approved",
        category=request_data.category,
        vehicle_no=request_data.vehicle_no,
        vehicle_name=request_data.vehicle_name,
        vehicle_model=request_data.vehicle_model,
        vehicle_brand=request_data.vehicle_brand,
        problem_description=request_data.problem_description,
    )
    return 201, req


@api.patch(
    "/admin/requests/{request_id}/approve",
    response={200: RequestOut, 404: ErrorResponse},
    auth=JWTAuth(),
    tags=["Admin - Requests"],
)
def admin_approve_request(request, request_id: int, payload: AdminApproveRequestIn):
    try:
        req = models.Request.objects.get(id=request_id)
        mechanic = models.Mechanic.objects.get(id=payload.mechanic_id)
    except (models.Request.DoesNotExist, models.Mechanic.DoesNotExist):
        return 404, {"detail": "Request or Mechanic not found."}

    req.mechanic = mechanic
    req.cost = payload.cost
    req.status = payload.status
    req.save()
    return 200, req


@api.patch(
    "/admin/requests/{request_id}/status",
    response={200: RequestOut, 404: ErrorResponse},
    auth=JWTAuth(),
    tags=["Admin - Requests"],
)
def admin_change_request_status(
    request, request_id: int, payload: AdminApproveRequestIn
):
    """Change mechanic, cost, and status on an existing request."""
    try:
        req = models.Request.objects.get(id=request_id)
        mechanic = models.Mechanic.objects.get(id=payload.mechanic_id)
    except (models.Request.DoesNotExist, models.Mechanic.DoesNotExist):
        return 404, {"detail": "Request or Mechanic not found."}

    req.mechanic = mechanic
    req.cost = payload.cost
    req.status = payload.status
    req.save()
    return 200, req


@api.patch(
    "/admin/requests/{request_id}/cost",
    response={200: RequestOut, 404: ErrorResponse},
    auth=JWTAuth(),
    tags=["Admin - Requests"],
)
def admin_update_cost(request, request_id: int, payload: UpdateCostIn):
    try:
        req = models.Request.objects.get(id=request_id)
    except models.Request.DoesNotExist:
        return 404, {"detail": "Request not found."}

    req.cost = payload.cost
    req.save()
    return 200, req


@api.delete(
    "/admin/requests/{request_id}",
    response={200: SuccessResponse, 404: ErrorResponse},
    auth=JWTAuth(),
    tags=["Admin - Requests"],
)
def admin_delete_request(request, request_id: int):
    try:
        req = models.Request.objects.get(id=request_id)
    except models.Request.DoesNotExist:
        return 404, {"detail": "Request not found."}

    req.delete()
    return 200, {"message": "Request deleted."}


# ─────────────────────────────────────────
# ADMIN — INVOICES & REPORTS
# ─────────────────────────────────────────


@api.get(
    "/admin/invoices",
    response=List[InvoiceOut],
    auth=JWTAuth(),
    tags=["Admin - Reports"],
)
def admin_invoices(request):
    rows = models.Request.objects.values("customer_id").annotate(total_cost=Sum("cost"))
    result = []
    for row in rows:
        customer = models.Customer.objects.get(id=row["customer_id"])
        result.append(
            {
                "customer_id": customer.id,
                "customer_name": f"{customer.user.first_name} {customer.user.last_name}".strip(),
                "total_cost": row["total_cost"] or 0.0,
            }
        )
    return result


@api.get(
    "/admin/reports",
    response=List[RequestOut],
    auth=JWTAuth(),
    tags=["Admin - Reports"],
)
def admin_reports(request):
    return models.Request.objects.filter(
        Q(status="Repairing Done") | Q(status="Released")
    )


@api.get(
    "/admin/service-costs",
    response=List[RequestOut],
    auth=JWTAuth(),
    tags=["Admin - Reports"],
)
def admin_service_costs(request):
    return models.Request.objects.all().order_by("-id")


# ─────────────────────────────────────────
# ADMIN — ATTENDANCE
# ─────────────────────────────────────────


@api.post(
    "/admin/attendance",
    response={201: SuccessResponse, 400: ErrorResponse},
    auth=JWTAuth(),
    tags=["Admin - Attendance"],
)
def admin_take_attendance(request, payload: BulkAttendanceIn):
    """
    Body: { "date": "2024-01-15", "statuses": ["Present", "Absent", ...] }
    One status per active mechanic, in the same order as the mechanics list.
    """
    mechanics = list(models.Mechanic.objects.filter(status=True))
    if len(payload.statuses) != len(mechanics):
        return 400, {
            "detail": f"Expected {len(mechanics)} status values, got {len(payload.statuses)}."
        }

    if not all(s in {"Present", "Absent"} for s in payload.statuses):
        return 400, {"detail": "Each status must be 'Present' or 'Absent'."}

    for mechanic, status in zip(mechanics, payload.statuses):
        models.Attendance.objects.create(
            mechanic=mechanic,
            date=payload.date,
            present_status=status,
        )
    return 201, {"message": "Attendance recorded successfully."}


@api.get(
    "/admin/attendance",
    response=List[AttendanceOut],
    auth=JWTAuth(),
    tags=["Admin - Attendance"],
)
def admin_view_attendance(request, date: str):
    """Query param: ?date=2024-01-15"""
    return models.Attendance.objects.filter(date=date)


# ─────────────────────────────────────────
# ADMIN — FEEDBACK
# ─────────────────────────────────────────


@api.get(
    "/admin/feedback",
    response=List[FeedbackOut],
    auth=JWTAuth(),
    tags=["Admin - Feedback"],
)
def admin_list_feedback(request):
    return models.Feedback.objects.all().order_by("-id")


# ─────────────────────────────────────────
# CUSTOMER
# ─────────────────────────────────────────


@api.get(
    "/customer/dashboard",
    response={200: CustomerDashboardOut, 403: ErrorResponse},
    auth=JWTAuth(),
    tags=["Customer"],
)
def customer_dashboard(request):
    if not _is_customer(request.user):
        return 403, {"detail": "Not authorized."}

    customer = models.Customer.objects.get(user_id=request.user.id)
    bill = (
        models.Request.objects.filter(customer_id=customer.id)
        .filter(Q(status="Repairing Done") | Q(status="Released"))
        .aggregate(Sum("cost"))
    )

    return 200, {
        "work_in_progress": models.Request.objects.filter(
            customer_id=customer.id, status="Repairing"
        ).count(),
        "work_completed": models.Request.objects.filter(customer_id=customer.id)
        .filter(Q(status="Repairing Done") | Q(status="Released"))
        .count(),
        "new_request_made": models.Request.objects.filter(customer_id=customer.id)
        .filter(Q(status="Pending") | Q(status="Approved"))
        .count(),
        "bill": bill["cost__sum"] or 0.0,
        "customer": customer,
    }


@api.get(
    "/customer/requests",
    response={200: List[RequestOut], 403: ErrorResponse},
    auth=JWTAuth(),
    tags=["Customer"],
)
def customer_list_pending_requests(request):
    if not _is_customer(request.user):
        return 403, {"detail": "Not authorized."}

    customer = models.Customer.objects.get(user_id=request.user.id)
    return 200, models.Request.objects.filter(customer_id=customer.id, status="Pending")


@api.get(
    "/customer/requests/all",
    response={200: List[RequestOut], 403: ErrorResponse},
    auth=JWTAuth(),
    tags=["Customer"],
)
def customer_list_all_requests(request):
    if not _is_customer(request.user):
        return 403, {"detail": "Not authorized."}

    customer = models.Customer.objects.get(user_id=request.user.id)
    return 200, models.Request.objects.filter(customer_id=customer.id).exclude(
        status="Pending"
    )


@api.post(
    "/customer/requests",
    response={201: RequestOut, 403: ErrorResponse},
    auth=JWTAuth(),
    tags=["Customer"],
)
def customer_add_request(request, payload: RequestIn):
    if not _is_customer(request.user):
        return 403, {"detail": "Not authorized."}

    customer = models.Customer.objects.get(user_id=request.user.id)
    req = models.Request.objects.create(
        customer=customer,
        category=payload.category,
        vehicle_no=payload.vehicle_no,
        vehicle_name=payload.vehicle_name,
        vehicle_model=payload.vehicle_model,
        vehicle_brand=payload.vehicle_brand,
        problem_description=payload.problem_description,
        status="Pending",
        cost=0,
    )
    return 201, req


@api.delete(
    "/customer/requests/{request_id}",
    response={200: SuccessResponse, 403: ErrorResponse, 404: ErrorResponse},
    auth=JWTAuth(),
    tags=["Customer"],
)
def customer_delete_request(request, request_id: int):
    if not _is_customer(request.user):
        return 403, {"detail": "Not authorized."}

    try:
        req = models.Request.objects.get(id=request_id)
    except models.Request.DoesNotExist:
        return 404, {"detail": "Request not found."}

    req.delete()
    return 200, {"message": "Request deleted."}


@api.get(
    "/customer/profile",
    response={200: CustomerOut, 403: ErrorResponse},
    auth=JWTAuth(),
    tags=["Customer"],
)
def customer_profile(request):
    if not _is_customer(request.user):
        return 403, {"detail": "Not authorized."}

    return 200, models.Customer.objects.get(user_id=request.user.id)


@api.put(
    "/customer/profile",
    response={200: CustomerOut, 403: ErrorResponse},
    auth=JWTAuth(),
    tags=["Customer"],
)
def customer_update_profile(request, payload: CustomerRegistrationIn):
    if not _is_customer(request.user):
        return 403, {"detail": "Not authorized."}

    customer = models.Customer.objects.get(user_id=request.user.id)
    user = customer.user
    user.first_name = payload.user.first_name
    user.last_name = payload.user.last_name
    user.username = payload.user.username
    user.set_password(payload.user.password)
    user.save()

    customer.address = payload.profile.address
    customer.mobile = payload.profile.mobile
    if payload.profile.profile_pic:
        customer.profile_pic = payload.profile.profile_pic
    customer.save()
    return 200, customer


@api.get(
    "/customer/invoice",
    response={200: List[RequestOut], 403: ErrorResponse},
    auth=JWTAuth(),
    tags=["Customer"],
)
def customer_invoice(request):
    if not _is_customer(request.user):
        return 403, {"detail": "Not authorized."}

    customer = models.Customer.objects.get(user_id=request.user.id)
    return 200, models.Request.objects.filter(customer_id=customer.id).exclude(
        status="Pending"
    )


@api.post(
    "/customer/feedback",
    response={201: SuccessResponse, 403: ErrorResponse},
    auth=JWTAuth(),
    tags=["Customer"],
)
def customer_submit_feedback(request, payload: FeedbackIn):
    if not _is_customer(request.user):
        return 403, {"detail": "Not authorized."}

    models.Feedback.objects.create(by=payload.by, message=payload.message)
    return 201, {"message": "Feedback submitted successfully."}


# ─────────────────────────────────────────
# MECHANIC
# ─────────────────────────────────────────


@api.get(
    "/mechanic/dashboard",
    response={200: MechanicDashboardOut, 403: ErrorResponse},
    auth=JWTAuth(),
    tags=["Mechanic"],
)
def mechanic_dashboard(request):
    if not _is_mechanic(request.user):
        return 403, {"detail": "Not authorized."}

    mechanic = models.Mechanic.objects.get(user_id=request.user.id)
    return 200, {
        "work_in_progress": models.Request.objects.filter(
            mechanic_id=mechanic.id, status="Repairing"
        ).count(),
        "work_completed": models.Request.objects.filter(
            mechanic_id=mechanic.id, status="Repairing Done"
        ).count(),
        "new_work_assigned": models.Request.objects.filter(
            mechanic_id=mechanic.id, status="Approved"
        ).count(),
        "salary": mechanic.salary,
        "mechanic": mechanic,
    }


@api.get(
    "/mechanic/work",
    response={200: List[RequestOut], 403: ErrorResponse},
    auth=JWTAuth(),
    tags=["Mechanic"],
)
def mechanic_work_assigned(request):
    if not _is_mechanic(request.user):
        return 403, {"detail": "Not authorized."}

    mechanic = models.Mechanic.objects.get(user_id=request.user.id)
    return 200, models.Request.objects.filter(mechanic_id=mechanic.id)


@api.patch(
    "/mechanic/work/{request_id}/status",
    response={200: RequestOut, 403: ErrorResponse, 404: ErrorResponse},
    auth=JWTAuth(),
    tags=["Mechanic"],
)
def mechanic_update_status(request, request_id: int, payload: MechanicUpdateStatusIn):
    if not _is_mechanic(request.user):
        return 403, {"detail": "Not authorized."}

    try:
        req = models.Request.objects.get(id=request_id)
    except models.Request.DoesNotExist:
        return 404, {"detail": "Request not found."}

    req.status = payload.status
    req.save()
    return 200, req


@api.get(
    "/mechanic/attendance",
    response={200: List[AttendanceOut], 403: ErrorResponse},
    auth=JWTAuth(),
    tags=["Mechanic"],
)
def mechanic_attendance(request):
    if not _is_mechanic(request.user):
        return 403, {"detail": "Not authorized."}

    mechanic = models.Mechanic.objects.get(user_id=request.user.id)
    return 200, models.Attendance.objects.filter(mechanic=mechanic)


@api.get(
    "/mechanic/salary",
    response={200: List[RequestOut], 403: ErrorResponse},
    auth=JWTAuth(),
    tags=["Mechanic"],
)
def mechanic_salary(request):
    """Returns all completed work used to calculate salary."""
    if not _is_mechanic(request.user):
        return 403, {"detail": "Not authorized."}

    mechanic = models.Mechanic.objects.get(user_id=request.user.id)
    return 200, models.Request.objects.filter(mechanic_id=mechanic.id).filter(
        Q(status="Repairing Done") | Q(status="Released")
    )


@api.get(
    "/mechanic/profile",
    response={200: MechanicOut, 403: ErrorResponse},
    auth=JWTAuth(),
    tags=["Mechanic"],
)
def mechanic_profile(request):
    if not _is_mechanic(request.user):
        return 403, {"detail": "Not authorized."}

    return 200, models.Mechanic.objects.get(user_id=request.user.id)


@api.put(
    "/mechanic/profile",
    response={200: MechanicOut, 403: ErrorResponse},
    auth=JWTAuth(),
    tags=["Mechanic"],
)
def mechanic_update_profile(request, payload: MechanicRegistrationIn):
    if not _is_mechanic(request.user):
        return 403, {"detail": "Not authorized."}

    mechanic = models.Mechanic.objects.get(user_id=request.user.id)
    user = mechanic.user
    user.first_name = payload.user.first_name
    user.last_name = payload.user.last_name
    user.username = payload.user.username
    user.set_password(payload.user.password)
    user.save()

    mechanic.address = payload.profile.address
    mechanic.mobile = payload.profile.mobile
    mechanic.skill = payload.profile.skill
    if payload.profile.profile_pic:
        mechanic.profile_pic = payload.profile.profile_pic
    mechanic.save()
    return 200, mechanic


@api.post(
    "/mechanic/feedback",
    response={201: SuccessResponse, 403: ErrorResponse},
    auth=JWTAuth(),
    tags=["Mechanic"],
)
def mechanic_submit_feedback(request, payload: FeedbackIn):
    if not _is_mechanic(request.user):
        return 403, {"detail": "Not authorized."}

    models.Feedback.objects.create(by=payload.by, message=payload.message)
    return 201, {"message": "Feedback submitted successfully."}


# ─────────────────────────────────────────
# PUBLIC
# ─────────────────────────────────────────


@api.post(
    "/contact", response={200: SuccessResponse, 400: ErrorResponse}, tags=["Public"]
)
def contact_us(request, payload: ContactUsIn):
    try:
        send_mail(
            subject=f"{payload.name} || {payload.email}",
            message=payload.message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=settings.EMAIL_RECEIVING_USER,
            fail_silently=False,
        )
    except Exception as e:
        return 400, {"detail": f"Email could not be sent: {str(e)}"}

    return 200, {"message": "Message sent successfully."}


@api.get("/services", response=List[ServiceOut], tags=["Public"])
def list_services(request):
    # Extend once a Service model exists
    return []
