import asyncio
import json
from sentiment_engine import analyze_osint_sentiment

# Sample real OSINT data structure from your agents
sample_osint_data = {
    "agent1": {
        "agent": "OSINT Collector",
        "timestamp": "2026-04-11T06:00:00Z",
        "region": "Gaza Strip",
        "data_sources_scanned": ["News APIs", "Social Media", "RSS/Feeds", "Wikipedia", "Web Search"],
        "daily_summary": "Escalating tensions reported in Gaza with increased military activity and civilian casualties.",
        "findings": [
            {
                "id": 1,
                "headline": "Military Operations Intensify in Northern Gaza",
                "summary": "Reports of increased military operations in northern Gaza with significant civilian displacement and infrastructure damage.",
                "source": "Reuters",
                "source_type": "News API",
                "source_url": "https://reuters.com/world/middle-east/gaza-conflict",
                "date": "2026-04-11",
                "location": "Northern Gaza",
                "latitude": 31.5,
                "longitude": 34.4,
                "alert_level": "HIGH",
                "confidence": 0.85,
                "category": "military",
                "sentiment": "negative"
            },
            {
                "id": 2,
                "headline": "Humanitarian Crisis Worsens",
                "summary": "UN reports critical shortages of medical supplies and food for displaced civilians in Gaza.",
                "source": "UN OCHA",
                "source_type": "RSS Feed",
                "source_url": "https://ocha.org/gaza-crisis",
                "date": "2026-04-11",
                "location": "Gaza City",
                "latitude": 31.4,
                "longitude": 34.3,
                "alert_level": "CRITICAL",
                "confidence": 0.92,
                "category": "humanitarian",
                "sentiment": "negative"
            },
            {
                "id": 3,
                "headline": "Ceasefire Negotiations Underway",
                "summary": "Diplomatic efforts continue to broker ceasefire agreement between conflicting parties.",
                "source": "Twitter/X",
                "source_type": "Social Media",
                "source_url": "https://twitter.com/statedept",
                "date": "2026-04-11",
                "location": "Cairo",
                "latitude": 30.0,
                "longitude": 31.2,
                "alert_level": "MEDIUM",
                "confidence": 0.68,
                "category": "political",
                "sentiment": "neutral"
            },
            {
                "id": 4,
                "headline": "Economic Impact Assessment",
                "summary": "Regional markets show volatility due to ongoing conflict and supply chain disruptions.",
                "source": "Bloomberg",
                "source_type": "News API",
                "source_url": "https://bloomberg.com/middle-east-markets",
                "date": "2026-04-11",
                "location": "Tel Aviv",
                "latitude": 32.1,
                "longitude": 34.8,
                "alert_level": "MEDIUM",
                "confidence": 0.75,
                "category": "economic",
                "sentiment": "negative"
            },
            {
                "id": 5,
                "headline": "International Response Coordination",
                "summary": "World leaders convene emergency session to address escalating humanitarian crisis.",
                "source": "Wikipedia",
                "source_type": "Wikipedia",
                "source_url": "https://en.wikipedia.org/gaza_conflict_2026",
                "date": "2026-04-11",
                "location": "New York",
                "latitude": 40.7,
                "longitude": -74.0,
                "alert_level": "MEDIUM",
                "confidence": 0.70,
                "category": "political",
                "sentiment": "neutral"
            }
        ],
        "alert_flag": True,
        "alert_reason": "High civilian casualties and humanitarian crisis",
        "total_findings": 5
    },
    "agent2": {
        "agent": "Conflict Detector",
        "threat_score": 8,
        "threat_level": "HIGH",
        "escalation_signals": ["increased military activity", "civilian casualties", "infrastructure damage"],
        "sentiment_analysis": {
            "overall_sentiment": "negative",
            "sentiment_score": -0.65,
            "breakdown": {
                "negative": 70,
                "neutral": 25,
                "positive": 5
            },
            "trending_direction": "WORSENING"
        }
    },
    "topic": "Gaza Strip Conflict Analysis"
}

async def test_sentiment_integration():
    """Test sentiment engine with real OSINT agent data"""
    print("🔍 Testing Sentiment Engine with Real OSINT Agent Data")
    print("=" * 60)
    
    try:
        # Analyze sentiment of the OSINT data
        sentiment_result = await analyze_osint_sentiment(sample_osint_data)
        
        print("✅ Sentiment Analysis Complete!")
        print(f"📊 Overall Sentiment: {sentiment_result['overall_sentiment']}")
        print(f"📈 Overall Score: {sentiment_result['overall_score']:.3f}")
        print(f"🎯 Confidence: {sentiment_result['confidence']:.3f}")
        print(f"🕐 Timestamp: {sentiment_result['timestamp']}")
        
        print("\n📋 Source-Level Analysis:")
        for source_id, analysis in sentiment_result['source_analysis'].items():
            print(f"  • {analysis['source']}: {analysis['sentiment']} (confidence: {analysis['confidence']:.2f})")
            print(f"    Text: {analysis['text'][:100]}...")
        
        print("\n💡 Key Insights:")
        for insight in sentiment_result['key_insights']:
            print(f"  • {insight}")
        
        print("\n🎯 Recommendations:")
        for rec in sentiment_result['recommendations']:
            print(f"  • {rec}")
        
        print("\n" + "=" * 60)
        print("✅ Integration Test Successful!")
        
        return sentiment_result
        
    except Exception as e:
        print(f"❌ Error during sentiment analysis: {e}")
        return None

if __name__ == "__main__":
    result = asyncio.run(test_sentiment_integration())
