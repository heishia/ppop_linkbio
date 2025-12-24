"""
Analytics Pydantic schemas
"""

from typing import List, Optional
from uuid import UUID
from datetime import date
from pydantic import BaseModel


class LinkClickStats(BaseModel):
    """개별 링크 클릭 통계"""
    link_id: UUID
    title: str
    url: str
    click_count: int
    today_clicks: int = 0
    week_clicks: int = 0
    month_clicks: int = 0


class DailyClickData(BaseModel):
    """일별 클릭 데이터"""
    date: str  # YYYY-MM-DD format
    clicks: int


class OverviewStats(BaseModel):
    """전체 통계 개요"""
    total_clicks: int
    total_links: int
    today_clicks: int
    week_clicks: int
    month_clicks: int


class AnalyticsSummary(BaseModel):
    """분석 요약 전체"""
    overview: OverviewStats
    link_stats: List[LinkClickStats]
    daily_clicks: List[DailyClickData]  # 최근 30일


class AnalyticsResponse(BaseModel):
    """분석 API 응답"""
    success: bool = True
    data: AnalyticsSummary


class LinkAnalyticsResponse(BaseModel):
    """개별 링크 분석 API 응답"""
    success: bool = True
    data: LinkClickStats

