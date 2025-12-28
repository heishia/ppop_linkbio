"""
Analytics API Router
"""

from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from backend.core.models import User, PlanType
from backend.core.exceptions import FeatureNotAvailableError
from backend.core.logger import get_logger
from backend.auth.router import get_current_user
from backend.analytics.schemas import AnalyticsResponse
from backend.analytics.service import analytics_service
from backend.auth.service import auth_service

logger = get_logger(__name__)

router = APIRouter()
security = HTTPBearer()


@router.get("", response_model=AnalyticsResponse)
async def get_analytics(
    current_user: User = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get analytics summary for current user (PRO plan only)"""
    # PRO 권한 체크
    access_token = credentials.credentials if credentials else None
    if access_token:
        try:
            subscription = await auth_service.get_subscription_status(access_token)
            if subscription.plan.value != "PRO" or subscription.status.value != "ACTIVE" or not subscription.hasAccess:
                raise FeatureNotAvailableError(
                    detail="Analytics feature is available for PRO plan only"
                )
        except Exception as e:
            # PPOP Auth API 호출 실패 시에도 PRO 권한이 아니면 에러
            logger.warning(f"Failed to check subscription status: {e}")
            raise FeatureNotAvailableError(
                detail="Analytics feature is available for PRO plan only"
            )
    else:
        raise FeatureNotAvailableError(
            detail="Analytics feature is available for PRO plan only"
        )
    
    analytics = await analytics_service.get_analytics_summary(current_user.id)
    return AnalyticsResponse(data=analytics)

