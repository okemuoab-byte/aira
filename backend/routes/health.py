
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
import statistics
from collections import defaultdict, Counter
import uuid

from auth import get_current_user
from models import (
    User, HealthDashboardResponse, HealthInsightsResponse, 
    HealthTrendsResponse, HealthRecommendationsResponse,
    DashboardSummary, HealthScoreData, BodySystemBreakdown,
    PatternInsight, TrendData, SymptomCorrelation, HealthInsight,
    RecommendationItem
)
from database import get_database
from services.simple_openai_service import get_simple_openai_service

router = APIRouter()


@router.get("/dashboard", response_model=HealthDashboardResponse)
async def get_health_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    time_period: str = Query("month", description="Time period: week, month, quarter")
):
    """Get comprehensive health dashboard with summary statistics and insights"""
    user_id = ObjectId(current_user["_id"])
    now = datetime.utcnow()
    
    # Calculate time ranges
    if time_period == "week":
        start_date = now - timedelta(days=7)
        prev_start_date = now - timedelta(days=14)
    elif time_period == "quarter":
        start_date = now - timedelta(days=90)
        prev_start_date = now - timedelta(days=180)
    else:  # month
        start_date = now - timedelta(days=30)
        prev_start_date = now - timedelta(days=60)
    
    week_start = now - timedelta(days=7)
    
    # Get symptoms data
    symptoms_query = {"user_id": user_id, "deleted_at": {"$exists": False}}
    all_symptoms = await db.symptoms.find(symptoms_query).to_list(length=None)
    
    period_symptoms = [s for s in all_symptoms if s.get("timestamp", s.get("created_at")) >= start_date]
    week_symptoms = [s for s in all_symptoms if s.get("timestamp", s.get("created_at")) >= week_start]
    
    # Get medications data
    medications = await db.medications.find({"user_id": user_id}).to_list(length=None)
    active_medications = [m for m in medications if not m.get("end_date") or m["end_date"] >= now]
    
    # Get recent visits
    recent_visits = await db.healthcare_visits.find({
        "user_id": user_id,
        "date": {"$gte": start_date}
    }).to_list(length=None)
    
    # Calculate summary statistics
    total_symptoms = len(all_symptoms)
    symptoms_this_week = len(week_symptoms)
    symptoms_this_period = len(period_symptoms)
    
    avg_intensity_week = statistics.mean([s["intensity"] for s in week_symptoms]) if week_symptoms else 0
    avg_intensity_period = statistics.mean([s["intensity"] for s in period_symptoms]) if period_symptoms else 0
    
    # Calculate medication adherence
    adherence_rates = [m.get("adherence_rate", 0) for m in active_medications if m.get("adherence_rate")]
    avg_adherence = statistics.mean(adherence_rates) if adherence_rates else 0
    
    # Body system breakdown
    body_system_breakdown = await calculate_body_system_breakdown(period_symptoms)
    
    # Calculate health score
    health_score = await calculate_health_score(
        period_symptoms, active_medications, recent_visits, avg_adherence
    )
    
    # Generate recent patterns
    recent_patterns = await analyze_recent_patterns(period_symptoms, db, user_id)
    
    # Generate quick insights and alerts
    quick_insights, alerts = await generate_quick_insights_and_alerts(
        period_symptoms, active_medications, recent_visits
    )
    
    summary = DashboardSummary(
        total_symptoms=total_symptoms,
        symptoms_this_week=symptoms_this_week,
        symptoms_this_month=symptoms_this_period,
        avg_intensity_week=avg_intensity_week,
        avg_intensity_month=avg_intensity_period,
        active_medications=len(active_medications),
        medication_adherence_rate=avg_adherence,
        recent_visits=len(recent_visits),
        body_system_breakdown=body_system_breakdown,
        health_score=health_score,
        time_period=time_period
    )
    
    return HealthDashboardResponse(
        summary=summary,
        recent_patterns=recent_patterns,
        quick_insights=quick_insights,
        alerts=alerts,
        generated_at=now
    )


@router.get("/insights", response_model=HealthInsightsResponse)
async def get_health_insights(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    time_period: str = Query("month", description="Time period: week, month, quarter"),
    confidence_threshold: float = Query(0.6, description="Minimum confidence threshold for insights")
):
    """Get AI-generated health insights and pattern analysis"""
    user_id = ObjectId(current_user["_id"])
    now = datetime.utcnow()
    
    # Calculate time range
    if time_period == "week":
        start_date = now - timedelta(days=7)
    elif time_period == "quarter":
        start_date = now - timedelta(days=90)
    else:  # month
        start_date = now - timedelta(days=30)
    
    # Get data
    symptoms = await db.symptoms.find({
        "user_id": user_id,
        "timestamp": {"$gte": start_date},
        "deleted_at": {"$exists": False}
    }).to_list(length=None)
    
    medications = await db.medications.find({"user_id": user_id}).to_list(length=None)
    visits = await db.healthcare_visits.find({
        "user_id": user_id,
        "date": {"$gte": start_date}
    }).to_list(length=None)
    
    # Generate insights
    insights = await generate_health_insights(symptoms, medications, visits, confidence_threshold)
    pattern_analysis = await analyze_symptom_patterns(symptoms)
    correlations = await find_symptom_correlations(symptoms)
    
    # Calculate confidence summary
    confidence_summary = {
        "overall": statistics.mean([i.confidence for i in insights]) if insights else 0,
        "pattern_analysis": statistics.mean([p.confidence for p in pattern_analysis]) if pattern_analysis else 0,
        "correlations": statistics.mean([c.correlation_strength for c in correlations]) if correlations else 0
    }
    
    # Calculate data quality score
    data_quality_score = calculate_data_quality_score(symptoms, medications, visits)
    
    return HealthInsightsResponse(
        insights=insights,
        pattern_analysis=pattern_analysis,
        correlations=correlations,
        confidence_summary=confidence_summary,
        data_quality_score=data_quality_score,
        generated_at=now
    )


@router.get("/trends", response_model=HealthTrendsResponse)
async def get_health_trends(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    time_period: str = Query("month", description="Time period: week, month, quarter")
):
    """Get symptom trends and progression analysis"""
    user_id = ObjectId(current_user["_id"])
    now = datetime.utcnow()
    
    # Calculate time ranges
    if time_period == "week":
        current_start = now - timedelta(days=7)
        previous_start = now - timedelta(days=14)
        previous_end = now - timedelta(days=7)
    elif time_period == "quarter":
        current_start = now - timedelta(days=90)
        previous_start = now - timedelta(days=180)
        previous_end = now - timedelta(days=90)
    else:  # month
        current_start = now - timedelta(days=30)
        previous_start = now - timedelta(days=60)
        previous_end = now - timedelta(days=30)
    
    # Get symptoms for both periods
    current_symptoms = await db.symptoms.find({
        "user_id": user_id,
        "timestamp": {"$gte": current_start},
        "deleted_at": {"$exists": False}
    }).to_list(length=None)
    
    previous_symptoms = await db.symptoms.find({
        "user_id": user_id,
        "timestamp": {"$gte": previous_start, "$lt": previous_end},
        "deleted_at": {"$exists": False}
    }).to_list(length=None)
    
    # Analyze trends
    symptom_trends = await analyze_symptom_trends(current_symptoms, previous_symptoms)
    intensity_progression = await calculate_intensity_progression(current_symptoms, time_period)
    frequency_analysis = await analyze_symptom_frequency(current_symptoms, previous_symptoms)
    body_system_trends = await analyze_body_system_trends(current_symptoms, previous_symptoms)
    
    # Generate trend summary
    trend_summary = generate_trend_summary(symptom_trends)
    
    return HealthTrendsResponse(
        symptom_trends=symptom_trends,
        intensity_progression=intensity_progression,
        frequency_analysis=frequency_analysis,
        body_system_trends=body_system_trends,
        time_period=time_period,
        trend_summary=trend_summary,
        generated_at=now
    )


@router.get("/recommendations", response_model=HealthRecommendationsResponse)
async def get_health_recommendations(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    priority_filter: Optional[str] = Query(None, description="Filter by priority: low, medium, high, urgent")
):
    """Get personalized health recommendations based on user data"""
    user_id = ObjectId(current_user["_id"])
    now = datetime.utcnow()
    
    # Get recent data (last 30 days)
    recent_symptoms = await db.symptoms.find({
        "user_id": user_id,
        "timestamp": {"$gte": now - timedelta(days=30)},
        "deleted_at": {"$exists": False}
    }).to_list(length=None)
    
    medications = await db.medications.find({"user_id": user_id}).to_list(length=None)
    recent_visits = await db.healthcare_visits.find({
        "user_id": user_id,
        "date": {"$gte": now - timedelta(days=90)}
    }).to_list(length=None)
    
    # Generate recommendations
    recommendations = await generate_health_recommendations(
        recent_symptoms, medications, recent_visits, current_user
    )
    
    # Filter by priority if specified
    if priority_filter:
        recommendations = [r for r in recommendations if r.priority == priority_filter]
    
    # Separate priority actions
    priority_actions = [r for r in recommendations if r.priority in ["high", "urgent"]]
    
    # Generate lifestyle and monitoring suggestions
    lifestyle_suggestions = generate_lifestyle_suggestions(recent_symptoms, medications)
    monitoring_suggestions = generate_monitoring_suggestions(recent_symptoms, medications)
    
    # Determine if medical consultation is needed
    medical_consultation_needed = any(r.priority == "urgent" for r in recommendations) or \
                                 any(s["intensity"] >= 8 for s in recent_symptoms[-5:]) if recent_symptoms else False
    
    return HealthRecommendationsResponse(
        recommendations=recommendations,
        priority_actions=priority_actions,
        lifestyle_suggestions=lifestyle_suggestions,
        monitoring_suggestions=monitoring_suggestions,
        medical_consultation_needed=medical_consultation_needed,
        generated_at=now
    )


@router.post("/ai-insights")
async def get_ai_health_insights(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get AI-generated health insights based on user's symptoms and medical history"""
    try:
        user_id = ObjectId(current_user["_id"])
        now = datetime.utcnow()
        
        # Get recent symptoms (last 30 days)
        recent_symptoms = await db.symptoms.find({
            "user_id": user_id,
            "timestamp": {"$gte": now - timedelta(days=30)},
            "deleted_at": {"$exists": False}
        }).to_list(length=None)
        
        if not recent_symptoms:
            return {
                "insights": "No recent symptoms found. Please log some symptoms to get AI insights.",
                "model_used": None,
                "disclaimer": "This information is for educational purposes only. Please consult with a healthcare professional for proper medical advice."
            }
        
        # Extract symptom types and medical history
        symptom_types = [s["type"] for s in recent_symptoms]
        medical_history = current_user.get("medical_history", "")
        
        # Get AI insights
        openai_service = get_simple_openai_service()
        insights = await openai_service.generate_health_insights(symptom_types, medical_history)
        
        return insights
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate AI insights: {str(e)}")


@router.post("/ai-symptom-analysis")
async def get_ai_symptom_analysis(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get AI analysis of symptom progression over time"""
    try:
        user_id = ObjectId(current_user["_id"])
        now = datetime.utcnow()
        
        # Get symptom history (last 90 days)
        symptom_history = await db.symptoms.find({
            "user_id": user_id,
            "timestamp": {"$gte": now - timedelta(days=90)},
            "deleted_at": {"$exists": False}
        }).sort("timestamp", 1).to_list(length=None)
        
        if len(symptom_history) < 2:
            return {
                "analysis": "Insufficient symptom data for progression analysis. Please log more symptoms over time.",
                "model_used": None,
                "disclaimer": "This analysis is for informational purposes only. Consult healthcare professionals for medical advice."
            }
        
        # Format symptom history for AI analysis
        formatted_history = []
        for symptom in symptom_history:
            formatted_history.append({
                "date": symptom.get("timestamp", symptom.get("created_at")).strftime("%Y-%m-%d"),
                "symptoms": [symptom["type"]],
                "severity": symptom["intensity"]
            })
        
        # Get AI analysis
        openai_service = get_simple_openai_service()
        analysis = await openai_service.analyze_symptom_progression(formatted_history)
        
        return analysis
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze symptom progression: {str(e)}")


@router.post("/ai-medication-reminders")
async def get_ai_medication_reminders(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get AI-generated personalized medication reminders and tips"""
    try:
        user_id = ObjectId(current_user["_id"])
        
        # Get active medications
        medications = await db.medications.find({
            "user_id": user_id,
            "$or": [
                {"end_date": {"$exists": False}},
                {"end_date": {"$gte": datetime.utcnow()}}
            ]
        }).to_list(length=None)
        
        if not medications:
            return {
                "reminders": "No active medications found. Add your medications to get personalized reminders.",
                "model_used": None,
                "disclaimer": "Always follow your healthcare provider's instructions for medication use."
            }
        
        # Format medications for AI analysis
        formatted_medications = []
        for med in medications:
            formatted_medications.append({
                "name": med.get("name", "Unknown medication"),
                "dosage": med.get("dosage", "Unknown dosage"),
                "frequency": med.get("frequency", "Unknown frequency")
            })
        
        # Get AI reminders
        openai_service = get_simple_openai_service()
        reminders = await openai_service.generate_medication_reminders(formatted_medications)
        
        return reminders
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate medication reminders: {str(e)}")


# Helper functions for analytics and AI insights

async def calculate_body_system_breakdown(symptoms: List[Dict]) -> List[BodySystemBreakdown]:
    """Calculate breakdown of symptoms by body system"""
    if not symptoms:
        return []
    
    # Map body parts to systems
    body_system_map = {
        "head": "Neurological",
        "neck": "Musculoskeletal",
        "chest": "Respiratory/Cardiovascular",
        "abdomen": "Digestive",
        "back": "Musculoskeletal",
        "left-arm": "Musculoskeletal",
        "right-arm": "Musculoskeletal",
        "left-leg": "Musculoskeletal",
        "right-leg": "Musculoskeletal"
    }
    
    system_data = defaultdict(list)
    
    for symptom in symptoms:
        body_part = symptom.get("body_part_id", "unknown")
        system = body_system_map.get(body_part, "Other")
        system_data[system].append(symptom)
    
    breakdown = []
    total_symptoms = len(symptoms)
    
    for system, system_symptoms in system_data.items():
        symptom_count = len(system_symptoms)
        avg_intensity = statistics.mean([s["intensity"] for s in system_symptoms])
        most_common = Counter([s["type"] for s in system_symptoms]).most_common(1)
        most_common_symptom = most_common[0][0] if most_common else None
        percentage = (symptom_count / total_symptoms) * 100
        
        breakdown.append(BodySystemBreakdown(
            system_name=system,
            symptom_count=symptom_count,
            avg_intensity=avg_intensity,
            most_common_symptom=most_common_symptom,
            percentage=percentage
        ))
    
    return sorted(breakdown, key=lambda x: x.symptom_count, reverse=True)


async def calculate_health_score(symptoms: List[Dict], medications: List[Dict], 
                               visits: List[Dict], adherence_rate: float) -> HealthScoreData:
    """Calculate overall health score based on multiple factors"""
    base_score = 100.0
    
    # Symptom impact (0-40 points deduction)
    if symptoms:
        avg_intensity = statistics.mean([s["intensity"] for s in symptoms])
        symptom_frequency = len(symptoms) / 30  # symptoms per day
        symptom_impact = min(40, (avg_intensity * 2) + (symptom_frequency * 5))
        base_score -= symptom_impact
    
    # Medication adherence impact (0-20 points deduction)
    if adherence_rate > 0:
        adherence_impact = (100 - adherence_rate) * 0.2
        base_score -= adherence_impact
    
    # Recent visits impact (slight positive for preventive care, negative for emergency)
    visit_impact = 0
    for visit in visits:
        if visit.get("provider_type") in ["GP", "Specialist"]:
            visit_impact += 2  # Positive for regular care
        elif visit.get("provider_type") in ["A&E", "Urgent Care"]:
            visit_impact -= 5  # Negative for emergency care
    
    base_score += min(10, max(-15, visit_impact))
    
    # Ensure score is within bounds
    overall_score = max(0, min(100, base_score))
    
    # Calculate component scores
    symptom_score = max(0, 100 - (avg_intensity * 10 if symptoms else 0))
    medication_score = adherence_rate if adherence_rate > 0 else 100
    visit_score = 100 + visit_impact
    
    # Determine trend (simplified logic)
    trend = "stable"
    if overall_score >= 80:
        trend = "improving"
    elif overall_score <= 60:
        trend = "declining"
    
    return HealthScoreData(
        overall_score=overall_score,
        symptom_score=symptom_score,
        medication_score=medication_score,
        visit_score=min(100, max(0, visit_score)),
        trend=trend,
        last_updated=datetime.utcnow()
    )


async def analyze_recent_patterns(symptoms: List[Dict], db: AsyncIOMotorDatabase, 
                                user_id: ObjectId) -> List[PatternInsight]:
    """Analyze recent symptom patterns"""
    if not symptoms:
        return []
    
    patterns = []
    
    # Frequency pattern analysis
    symptom_types = [s["type"] for s in symptoms]
    type_counts = Counter(symptom_types)
    
    if type_counts:
        most_common = type_counts.most_common(1)[0]
        if most_common[1] >= 3:  # At least 3 occurrences
            patterns.append(PatternInsight(
                type="frequency",
                title=f"Recurring {most_common[0]} symptoms",
                description=f"You've experienced {most_common[0]} {most_common[1]} times recently",
                confidence=min(1.0, most_common[1] / 10),
                severity="medium" if most_common[1] >= 5 else "low",
                data_points=most_common[1],
                time_range="last 30 days",
                actionable=True
            ))
    
    # Intensity pattern analysis
    if len(symptoms) >= 5:
        recent_intensities = [s["intensity"] for s in symptoms[-5:]]
        avg_recent = statistics.mean(recent_intensities)
        
        if avg_recent >= 7:
            patterns.append(PatternInsight(
                type="intensity",
                title="High intensity symptoms detected",
                description=f"Recent symptoms averaging {avg_recent:.1f}/10 intensity",
                confidence=0.9,
                severity="high",
                data_points=5,
                time_range="last 5 symptoms",
                actionable=True
            ))
    
    return patterns


async def generate_quick_insights_and_alerts(symptoms: List[Dict], medications: List[Dict], 
                                           visits: List[Dict]) -> tuple[List[str], List[str]]:
    """Generate quick insights and alerts"""
    insights = []
    alerts = []
    
    # Quick insights
    if symptoms:
        avg_intensity = statistics.mean([s["intensity"] for s in symptoms])
        insights.append(f"Average symptom intensity: {avg_intensity:.1f}/10")
        
        most_common_type = Counter([s["type"] for s in symptoms]).most_common(1)[0]
        insights.append(f"Most common symptom: {most_common_type[0]} ({most_common_type[1]} times)")
    
    if medications:
        active_count = len([m for m in medications if not m.get("end_date")])
        insights.append(f"Currently taking {active_count} medications")
    
    # Alerts
    if symptoms:
        high_intensity_symptoms = [s for s in symptoms if s["intensity"] >= 8]
        if high_intensity_symptoms:
            alerts.append(f"{len(high_intensity_symptoms)} high-intensity symptoms (8+/10) recorded")
    
    recent_emergency_visits = [v for v in visits if v.get("provider_type") in ["A&E", "Urgent Care"]]
    if recent_emergency_visits:
        alerts.append(f"{len(recent_emergency_visits)} emergency visits in the selected period")
    
    return insights, alerts


async def generate_health_insights(symptoms: List[Dict], medications: List[Dict], 
                                 visits: List[Dict], confidence_threshold: float) -> List[HealthInsight]:
    """Generate AI-powered health insights"""
    insights = []
    
    if not symptoms:
        return insights
    
    # Pattern-based insights
    symptom_types = [s["type"] for s in symptoms]
    type_counts = Counter(symptom_types)
    
    for symptom_type, count in type_counts.items():
        if count >= 3:
            confidence = min(1.0, count / 10)
            if confidence >= confidence_threshold:
                insights.append(HealthInsight(
                    id=str(uuid.uuid4()),
                    category="pattern",
                    title=f"Recurring {symptom_type} pattern detected",
                    description=f"You've experienced {symptom_type} {count} times, suggesting a recurring pattern",
                    insight_type="frequency_pattern",
                    confidence=confidence,
                    severity="medium" if count >= 5 else "low",
                    actionable=True,
                    recommendations=[
                        f"Track triggers for {symptom_type}",
                        "Consider discussing pattern with healthcare provider",
                        "Monitor for any worsening trends"
                    ],
                    data_source="symptom_logs",
                    time_range="analysis_period",
                    created_at=datetime.utcnow()
                ))
    
    # Intensity trend insights
    if len(symptoms) >= 7:
        intensities = [s["intensity"] for s in symptoms]
        recent_avg = statistics.mean(intensities[-3:])
        overall_avg = statistics.mean(intensities)
        
        if recent_avg > overall_avg + 1:
            insights.append(HealthInsight(
                id=str(uuid.uuid4()),
                category="trend",
                title="Symptom intensity increasing",
                description=f"Recent symptoms are more intense (avg {recent_avg:.1f}) than usual (avg {overall_avg:.1f})",
                insight_type="intensity_trend",
                confidence=0.8,
                severity="medium",
                actionable=True,
                recommendations=[
                    "Monitor symptom progression closely",
                    "Consider consulting healthcare provider",
                    "Review recent lifestyle changes"
                ],
                data_source="symptom_logs",
                time_range="recent_vs_overall",
                created_at=datetime.utcnow()
            ))
    
    return insights


async def analyze_symptom_patterns(symptoms: List[Dict]) -> List[PatternInsight]:
    """Analyze detailed symptom patterns"""
    if not symptoms:
        return []
    
    patterns = []
    
    # Time-based patterns
    symptom_hours = [s.get("timestamp", s.get("created_at")).hour for s in symptoms if s.get("timestamp") or s.get("created_at")]
    if symptom_hours:
        hour_counts = Counter(symptom_hours)
        peak_hour = hour_counts.most_common(1)[0]
        
        if peak_hour[1] >= 3:
            patterns.append(PatternInsight(
                type="timing",
                title=f"Symptoms often occur around {peak_hour[0]:02d}:00",
                description=f"Peak symptom time: {peak_hour[0]:02d}:00 ({peak_hour[1]} occurrences)",
                confidence=min(1.0, peak_hour[1] / len(symptoms)),
                severity="low",
                data_points=peak_hour[1],
                time_range="all_recorded_symptoms",
                actionable=True
            ))
    
    return patterns


async def find_symptom_correlations(symptoms: List[Dict]) -> List[SymptomCorrelation]:
    """Find correlations between different symptoms"""
    if len(symptoms) < 10:
        return []
    
    correlations = []
    symptom_types = list(set([s["type"] for s in symptoms]))
    
    # Simple co-occurrence analysis
    for i, type_a in enumerate(symptom_types):
        for type_b in symptom_types[i+1:]:
            # Find symptoms that occurred within 24 hours of each other
            type_a_symptoms = [s for s in symptoms if s["type"] == type_a]
            type_b_symptoms = [s for s in symptoms if s["type"] == type_b]
            
            co_occurrences = 0
            for symptom_a in type_a_symptoms:
                timestamp_a = symptom_a.get("timestamp", symptom_a.get("created_at"))
                for symptom_b in type_b_symptoms:
                    timestamp_b = symptom_b.get("timestamp", symptom_b.get("created_at"))
                    if abs((timestamp_a - timestamp_b).total_seconds()) <= 86400:  # 24 hours
                        co_occurrences += 1
                        break
            
            if co_occurrences >= 2:
                correlation_strength = co_occurrences / min(len(type_a_symptoms), len(type_b_symptoms))
                co_occurrence_rate = (co_occurrences / len(type_a_symptoms)) * 100
                
                correlations.append(SymptomCorrelation(
                    symptom_a=type_a,
                    symptom_b=type_b,
                    correlation_strength=min(1.0, correlation_strength),
                    co_occurrence_rate=co_occurrence_rate,
                    description=f"{type_a} and {type_b} often occur together ({co_occurrences} times)"
                ))
    
    return correlations


def calculate_data_quality_score(symptoms: List[Dict], medications: List[Dict], visits: List[Dict]) -> float:
    """Calculate data quality score based on completeness and consistency"""
    score = 0.0
    factors = 0
    
    # Symptom data quality
    if symptoms:
        complete_symptoms = sum(1 for s in symptoms if s.get("notes") and s.get("intensity"))
        symptom_quality = complete_symptoms / len(symptoms)
        score += symptom_quality
        factors += 1
    
    # Medication data quality
    if medications:
        complete_medications = sum(1 for m in medications if m.get("dosage") and m.get("frequency"))
        medication_quality = complete_medications / len(medications)
        score += medication_quality
        factors += 1
    
    # Visit data quality
    if visits:
        complete_visits = sum(1 for v in visits if v.get("summary") and v.get("provider_name"))
        visit_quality = complete_visits / len(visits)
        score += visit_quality
        factors += 1
    
    return score / factors if factors > 0 else 0.5


async def analyze_symptom_trends(current_symptoms: List[Dict], previous_symptoms: List[Dict]) -> List[TrendData]:
    """Analyze symptom trends between periods"""
    trends = []
    
    # Group symptoms by type
    current_by_type = defaultdict(list)
    previous_by_type = defaultdict(list)
    
    for symptom in current_symptoms:
        current_by_type[symptom["type"]].append(symptom)
    
    for symptom in previous_symptoms:
        previous_by_type[symptom["type"]].append(symptom)
    
    # Analyze trends for each symptom type
    all_types = set(list(current_by_type.keys()) + list(previous_by_type.keys()))
    
    for symptom_type in all_types:
        current_list = current_by_type.get(symptom_type, [])
        previous_list = previous_by_type.get(symptom_type, [])
        
        current_avg = statistics.mean([s["intensity"] for s in current_list]) if current_list else 0
        previous_avg = statistics.mean([s["intensity"] for s in previous_list]) if previous_list else 0
        
        if current_avg > 0 or previous_avg > 0:
            if previous_avg == 0:
                change_percentage = 100.0
                trend_direction = "increasing"
            elif current_avg == 0:
                change_percentage = -100.0
                trend_direction = "decreasing"
            else:
                change_percentage = ((current_avg - previous_avg) / previous_avg) * 100
                if change_percentage > 10:
                    trend_direction = "increasing"
                elif change_percentage < -10:
                    trend_direction = "decreasing"
                else:
                    trend_direction = "stable"
            
            significance = "significant" if abs(change_percentage) > 25 else "moderate" if abs(change_percentage) > 10 else "minimal"
            
            trends.append(TrendData(
                symptom_type=symptom_type,
                body_part=current_list[0].get("body_part_name") if current_list else previous_list[0].get("body_part_name") if previous_list else None,
                trend_direction=trend_direction,
                change_percentage=change_percentage,
                current_avg_intensity=current_avg,
                previous_avg_intensity=previous_avg,
                data_points=len(current_list) + len(previous_list),
                time_period="comparison_period",
                significance=significance
            ))
    
    return sorted(trends, key=lambda x: abs(x.change_percentage), reverse=True)


async def calculate_intensity_progression(symptoms: List[Dict], time_period: str) -> Dict[str, List[Dict[str, Any]]]:
    """Calculate intensity progression over time"""
    if not symptoms:
        return {}
    
    # Group symptoms by type and sort by timestamp
    by_type = defaultdict(list)
    for symptom in symptoms:
        timestamp = symptom.get("timestamp", symptom.get("created_at"))
        by_type[symptom["type"]].append({
            "timestamp": timestamp,
            "intensity": symptom["intensity"]
        })
    
    # Sort each type by timestamp
    for symptom_type in by_type:
        by_type[symptom_type].sort(key=lambda x: x["timestamp"])
    
    return dict(by_type)


async def analyze_symptom_frequency(current_symptoms: List[Dict], previous_symptoms: List[Dict]) -> Dict[str, Any]:
    """Analyze symptom frequency changes"""
    current_counts = Counter([s["type"] for s in current_symptoms])
    previous_counts = Counter([s["type"] for s in previous_symptoms])
    
    frequency_changes = {}
    all_types = set(list(current_counts.keys()) + list(previous_counts.keys()))
    
    for symptom_type in all_types:
        current_count = current_counts.get(symptom_type, 0)
        previous_count = previous_counts.get(symptom_type, 0)
        
        if previous_count == 0:
            change = "new" if current_count > 0 else "none"
            percentage_change = 100.0 if current_count > 0 else 0
        elif current_count == 0:
            change = "resolved"
            percentage_change = -100.0
        else:
            percentage_change = ((current_count - previous_count) / previous_count) * 100
            if percentage_change > 20:
                change = "increasing"
            elif percentage_change < -20:
                change = "decreasing"
            else:
                change = "stable"
        
        frequency_changes[symptom_type] = {
            "current_count": current_count,
            "previous_count": previous_count,
            "change": change,
            "percentage_change": percentage_change
        }
    
    return {
        "frequency_changes": frequency_changes,
        "total_current": len(current_symptoms),
        "total_previous": len(previous_symptoms),
        "overall_change": len(current_symptoms) - len(previous_symptoms)
    }


async def analyze_body_system_trends(current_symptoms: List[Dict], previous_symptoms: List[Dict]) -> Dict[str, Any]:
    """Analyze trends by body system"""
    body_system_map = {
        "head": "Neurological",
        "neck": "Musculoskeletal",
        "chest": "Respiratory/Cardiovascular",
        "abdomen": "Digestive",
        "back": "Musculoskeletal",
        "left-arm": "Musculoskeletal",
        "right-arm": "Musculoskeletal",
        "left-leg": "Musculoskeletal",
        "right-leg": "Musculoskeletal"
    }
    
    # Group symptoms by body system
    current_by_system = defaultdict(list)
    previous_by_system = defaultdict(list)
    
    for symptom in current_symptoms:
        body_part = symptom.get("body_part_id", "unknown")
        system = body_system_map.get(body_part, "Other")
        current_by_system[system].append(symptom)
    
    for symptom in previous_symptoms:
        body_part = symptom.get("body_part_id", "unknown")
        system = body_system_map.get(body_part, "Other")
        previous_by_system[system].append(symptom)
    
    system_trends = {}
    all_systems = set(list(current_by_system.keys()) + list(previous_by_system.keys()))
    
    for system in all_systems:
        current_list = current_by_system.get(system, [])
        previous_list = previous_by_system.get(system, [])
        
        current_count = len(current_list)
        previous_count = len(previous_list)
        current_avg_intensity = statistics.mean([s["intensity"] for s in current_list]) if current_list else 0
        previous_avg_intensity = statistics.mean([s["intensity"] for s in previous_list]) if previous_list else 0
        
        system_trends[system] = {
            "current_count": current_count,
            "previous_count": previous_count,
            "current_avg_intensity": current_avg_intensity,
            "previous_avg_intensity": previous_avg_intensity,
            "count_change": current_count - previous_count,
            "intensity_change": current_avg_intensity - previous_avg_intensity
        }
    
    return system_trends


def generate_trend_summary(symptom_trends: List[TrendData]) -> str:
    """Generate a summary of symptom trends"""
    if not symptom_trends:
        return "No significant trends detected in the selected time period."
    
    increasing_trends = [t for t in symptom_trends if t.trend_direction == "increasing"]
    decreasing_trends = [t for t in symptom_trends if t.trend_direction == "decreasing"]
    stable_trends = [t for t in symptom_trends if t.trend_direction == "stable"]
    
    summary_parts = []
    
    if increasing_trends:
        summary_parts.append(f"{len(increasing_trends)} symptom types showing increasing trends")
    
    if decreasing_trends:
        summary_parts.append(f"{len(decreasing_trends)} symptom types showing decreasing trends")
    
    if stable_trends:
        summary_parts.append(f"{len(stable_trends)} symptom types remaining stable")
    
    return "; ".join(summary_parts) + "."


async def generate_health_recommendations(symptoms: List[Dict], medications: List[Dict],
                                        visits: List[Dict], user: Dict) -> List[RecommendationItem]:
    """Generate personalized health recommendations"""
    recommendations = []
    
    # High intensity symptom recommendations
    high_intensity_symptoms = [s for s in symptoms if s["intensity"] >= 8]
    if high_intensity_symptoms:
        recommendations.append(RecommendationItem(
            id=str(uuid.uuid4()),
            category="medical",
            title="Consult healthcare provider about high-intensity symptoms",
            description=f"You have {len(high_intensity_symptoms)} high-intensity symptoms (8+/10) that may require medical attention",
            priority="high",
            action_type="consult",
            estimated_impact="high",
            time_sensitive=True,
            based_on=["high_intensity_symptoms"]
        ))
    
    # Medication adherence recommendations
    low_adherence_meds = [m for m in medications if m.get("adherence_rate", 100) < 80]
    if low_adherence_meds:
        recommendations.append(RecommendationItem(
            id=str(uuid.uuid4()),
            category="medication",
            title="Improve medication adherence",
            description=f"{len(low_adherence_meds)} medications have adherence rates below 80%",
            priority="medium",
            action_type="modify",
            estimated_impact="medium",
            time_sensitive=False,
            based_on=["medication_adherence"]
        ))
    
    # Symptom tracking recommendations
    if len(symptoms) < 5:
        recommendations.append(RecommendationItem(
            id=str(uuid.uuid4()),
            category="monitoring",
            title="Increase symptom tracking frequency",
            description="More frequent symptom logging will help identify patterns and trends",
            priority="low",
            action_type="track",
            estimated_impact="medium",
            time_sensitive=False,
            based_on=["tracking_frequency"]
        ))
    
    # Pattern-based recommendations
    symptom_types = [s["type"] for s in symptoms]
    type_counts = Counter(symptom_types)
    recurring_symptoms = [symptom_type for symptom_type, count in type_counts.items() if count >= 3]
    
    if recurring_symptoms:
        recommendations.append(RecommendationItem(
            id=str(uuid.uuid4()),
            category="monitoring",
            title="Track triggers for recurring symptoms",
            description=f"Consider tracking triggers for: {', '.join(recurring_symptoms)}",
            priority="medium",
            action_type="track",
            estimated_impact="medium",
            time_sensitive=False,
            based_on=["recurring_patterns"]
        ))
    
    # Preventive care recommendations
    recent_gp_visits = [v for v in visits if v.get("provider_type") == "GP"]
    if not recent_gp_visits:
        recommendations.append(RecommendationItem(
            id=str(uuid.uuid4()),
            category="medical",
            title="Schedule routine check-up",
            description="Consider scheduling a routine check-up with your GP for preventive care",
            priority="low",
            action_type="schedule",
            estimated_impact="medium",
            time_sensitive=False,
            based_on=["preventive_care"]
        ))
    
    return recommendations


def generate_lifestyle_suggestions(symptoms: List[Dict], medications: List[Dict]) -> List[str]:
    """Generate lifestyle suggestions based on symptoms and medications"""
    suggestions = []
    
    # General suggestions
    suggestions.append("Maintain a regular sleep schedule (7-9 hours per night)")
    suggestions.append("Stay hydrated by drinking adequate water throughout the day")
    suggestions.append("Consider stress management techniques like meditation or deep breathing")
    
    # Symptom-specific suggestions
    symptom_types = [s["type"] for s in symptoms]
    
    if "headache" in symptom_types:
        suggestions.append("Monitor screen time and take regular breaks from digital devices")
        suggestions.append("Ensure proper posture, especially when working at a desk")
    
    if "fatigue" in symptom_types:
        suggestions.append("Maintain regular exercise routine appropriate for your fitness level")
        suggestions.append("Consider reviewing your diet for balanced nutrition")
    
    if "digestive" in [s.get("body_part_id") for s in symptoms]:
        suggestions.append("Keep a food diary to identify potential dietary triggers")
        suggestions.append("Consider eating smaller, more frequent meals")
    
    return suggestions


def generate_monitoring_suggestions(symptoms: List[Dict], medications: List[Dict]) -> List[str]:
    """Generate monitoring suggestions"""
    suggestions = []
    
    suggestions.append("Log symptoms consistently to help identify patterns")
    suggestions.append("Track symptom intensity and duration for better insights")
    suggestions.append("Note potential triggers (food, stress, weather, activities)")
    
    if medications:
        suggestions.append("Monitor medication effectiveness and side effects")
        suggestions.append("Set reminders to maintain consistent medication timing")
    
    # Specific monitoring based on symptom patterns
    symptom_types = [s["type"] for s in symptoms]
    type_counts = Counter(symptom_types)
    
    if any(count >= 3 for count in type_counts.values()):
        suggestions.append("Pay special attention to recurring symptoms and their patterns")
    
    high_intensity_count = len([s for s in symptoms if s["intensity"] >= 7])
    if high_intensity_count >= 2:
        suggestions.append("Monitor high-intensity symptoms closely and seek medical advice if they persist")
    
    return suggestions