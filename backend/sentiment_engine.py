import asyncio
import json
import re
from typing import Dict, List, Tuple, Any
from datetime import datetime
import os

# Lightweight sentiment analysis libraries
try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    VADER_AVAILABLE = True
except ImportError:
    VADER_AVAILABLE = False
    print("VADER not installed. Install with: pip install vaderSentiment")

try:
    from textblob import TextBlob
    TEXTBLOB_AVAILABLE = True
except ImportError:
    TEXTBLOB_AVAILABLE = False
    print("TextBlob not installed. Install with: pip install textblob")

class SentimentEngine:
    """
    Lightweight Sentiment Analysis Engine for OSINT Data
    Uses VADER and TextBlob for fast, efficient sentiment processing
    """
    
    def __init__(self):
        self.vader_analyzer = SentimentIntensityAnalyzer() if VADER_AVAILABLE else None
        self.conflict_keywords = self._load_conflict_keywords()
        self.sentiment_history = []
        
    def _load_conflict_keywords(self) -> Dict[str, float]:
        """Load conflict-specific sentiment modifiers"""
        return {
            # High negative weight
            'war': -0.8, 'conflict': -0.7, 'attack': -0.8, 'violence': -0.7,
            'casualties': -0.9, 'fatalities': -0.9, 'killed': -0.8, 'death': -0.7,
            'terrorism': -0.9, 'bomb': -0.8, 'explosion': -0.7, 'gunfire': -0.7,
            'invasion': -0.8, 'military': -0.3, 'troops': -0.2, 'weapons': -0.6,
            
            # Moderate negative
            'tension': -0.5, 'unrest': -0.6, 'protest': -0.4, 'clash': -0.6,
            'displacement': -0.7, 'refugees': -0.6, 'evacuation': -0.5,
            
            # Positive/neutral
            'peace': 0.7, 'ceasefire': 0.6, 'agreement': 0.5, 'diplomacy': 0.4,
            'humanitarian': 0.3, 'aid': 0.2, 'relief': 0.3, 'support': 0.2,
            
            # Severity indicators
            'critical': -0.4, 'urgent': -0.3, 'severe': -0.5, 'escalating': -0.6
        }
    
    def clean_text(self, text: str) -> str:
        """Clean and preprocess text for sentiment analysis"""
        if not text:
            return ""
        
        # Remove URLs, mentions, hashtags
        text = re.sub(r'http\S+', '', text)
        text = re.sub(r'@\w+', '', text)
        text = re.sub(r'#\w+', '', text)
        
        # Remove extra whitespace and special chars
        text = re.sub(r'\s+', ' ', text).strip()
        text = re.sub(r'[^\w\s\.\!\?\,\-\:]', '', text)
        
        return text
    
    def analyze_vader(self, text: str) -> Dict[str, float]:
        """Analyze sentiment using VADER"""
        if not self.vader_analyzer:
            return {'compound': 0.0, 'pos': 0.0, 'neu': 0.0, 'neg': 0.0}
        
        scores = self.vader_analyzer.polarity_scores(text)
        return scores
    
    def analyze_textblob(self, text: str) -> Dict[str, float]:
        """Analyze sentiment using TextBlob"""
        if not TEXTBLOB_AVAILABLE:
            return {'polarity': 0.0, 'subjectivity': 0.0}
        
        blob = TextBlob(text)
        return {
            'polarity': blob.sentiment.polarity,
            'subjectivity': blob.sentiment.subjectivity
        }
    
    def apply_conflict_modifiers(self, text: str, base_score: float) -> float:
        """Apply conflict-specific keyword modifiers"""
        modified_score = base_score
        text_lower = text.lower()
        
        for keyword, modifier in self.conflict_keywords.items():
            if keyword in text_lower:
                # Count occurrences for stronger effect
                count = text_lower.count(keyword)
                modified_score += (modifier * count * 0.1)  # Scale down modifier
        
        # Clamp between -1 and 1
        return max(-1.0, min(1.0, modified_score))
    
    def classify_sentiment(self, score: float) -> str:
        """Classify sentiment score into categories"""
        if score <= -0.6:
            return "VERY_NEGATIVE"
        elif score <= -0.2:
            return "NEGATIVE"
        elif score <= 0.2:
            return "NEUTRAL"
        elif score <= 0.6:
            return "POSITIVE"
        else:
            return "VERY_POSITIVE"
    
    def analyze_text(self, text: str, source: str = "unknown") -> Dict[str, Any]:
        """Comprehensive sentiment analysis of a single text"""
        if not text or not text.strip():
            return {
                'text': text,
                'source': source,
                'sentiment': 'NEUTRAL',
                'confidence': 0.0,
                'scores': {},
                'analysis': 'Empty text provided'
            }
        
        cleaned_text = self.clean_text(text)
        
        # Get VADER scores
        vader_scores = self.analyze_vader(cleaned_text)
        
        # Get TextBlob scores
        textblob_scores = self.analyze_textblob(cleaned_text)
        
        # Combine scores (weighted average)
        vader_weight = 0.6
        textblob_weight = 0.4
        
        if VADER_AVAILABLE and TEXTBLOB_AVAILABLE:
            combined_score = (vader_scores['compound'] * vader_weight + 
                            textblob_scores['polarity'] * textblob_weight)
        elif VADER_AVAILABLE:
            combined_score = vader_scores['compound']
        elif TEXTBLOB_AVAILABLE:
            combined_score = textblob_scores['polarity']
        else:
            combined_score = 0.0
        
        # Apply conflict modifiers
        modified_score = self.apply_conflict_modifiers(cleaned_text, combined_score)
        
        # Classify sentiment
        sentiment_class = self.classify_sentiment(modified_score)
        
        # Calculate confidence based on agreement between models
        confidence = 0.5  # Base confidence
        if VADER_AVAILABLE and TEXTBLOB_AVAILABLE:
            agreement = 1.0 - abs(vader_scores['compound'] - textblob_scores['polarity'])
            confidence = 0.3 + (agreement * 0.7)
        elif VADER_AVAILABLE:
            confidence = 0.7
        elif TEXTBLOB_AVAILABLE:
            confidence = 0.6
        
        return {
            'text': text[:200] + "..." if len(text) > 200 else text,
            'source': source,
            'sentiment': sentiment_class,
            'confidence': round(confidence, 3),
            'scores': {
                'vader': vader_scores if VADER_AVAILABLE else None,
                'textblob': textblob_scores if TEXTBLOB_AVAILABLE else None,
                'combined': round(combined_score, 3),
                'modified': round(modified_score, 3)
            },
            'analysis': self._generate_analysis(sentiment_class, modified_score, source)
        }
    
    def _generate_analysis(self, sentiment: str, score: float, source: str) -> str:
        """Generate human-readable analysis"""
        analyses = {
            'VERY_NEGATIVE': f"Extremely negative sentiment detected from {source}. High conflict indicators present.",
            'NEGATIVE': f"Negative sentiment from {source}. Conflict-related themes detected.",
            'NEUTRAL': f"Neutral sentiment from {source}. Factual or balanced reporting.",
            'POSITIVE': f"Positive sentiment from {source}. Peace or resolution themes.",
            'VERY_POSITIVE': f"Strongly positive sentiment from {source}. Peace agreements or successful outcomes."
        }
        
        base = analyses.get(sentiment, "Sentiment analysis completed.")
        
        if abs(score) > 0.7:
            base += " High confidence in this assessment."
        elif abs(score) < 0.3:
            base += " Low confidence - mixed signals detected."
            
        return base
    
    def analyze_osint_batch(self, osint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze sentiment across all OSINT sources"""
        results = {
            'timestamp': datetime.utcnow().isoformat(),
            'topic': osint_data.get('topic', 'Unknown'),
            'overall_sentiment': 'NEUTRAL',
            'overall_score': 0.0,
            'confidence': 0.0,
            'source_analysis': {},
            'trend_analysis': {},
            'key_insights': [],
            'recommendations': []
        }
        
        all_scores = []
        source_texts = []
        
        # Extract text from different OSINT sources - handle multiple data structures
        agent1_data = osint_data.get('agent1', {})
        
        # Try multiple ways to extract findings
        findings = agent1_data.get('findings', [])
        if not findings and isinstance(agent1_data, dict):
            # Try to extract from other possible structures
            if 'data' in agent1_data:
                findings = agent1_data['data'] if isinstance(agent1_data['data'], list) else []
            elif 'results' in agent1_data:
                findings = agent1_data['results'] if isinstance(agent1_data['results'], list) else []
        
        # Process findings
        for idx, finding in enumerate(findings):
            if not isinstance(finding, dict):
                continue
            # Try multiple text fields
            text = (finding.get('summary') or finding.get('headline') or 
                    finding.get('text') or finding.get('content') or finding.get('description', ''))
            source = finding.get('source_type') or finding.get('source') or finding.get('type', 'unknown')
            if text:
                analysis = self.analyze_text(text, source)
                results['source_analysis'][f"finding_{finding.get('id', idx)}"] = analysis
                all_scores.append(analysis['scores']['modified'])
                source_texts.append(analysis)
        
        # Also try to extract from daily_summary or other top-level text
        if agent1_data.get('daily_summary'):
            analysis = self.analyze_text(agent1_data['daily_summary'], 'daily_summary')
            results['source_analysis']['daily_summary'] = analysis
            all_scores.append(analysis['scores']['modified'])
            source_texts.append(analysis)
        
        # Try to extract from reasoning or other agent data
        for agent_key in ['agent2', 'agent3', 'agent4', 'agent5']:
            agent_data = osint_data.get(agent_key, {})
            if isinstance(agent_data, dict):
                for text_field in ['reasoning', 'summary', 'analysis', 'executive_summary']:
                    if agent_data.get(text_field):
                        analysis = self.analyze_text(agent_data[text_field], agent_key)
                        results['source_analysis'][f"{agent_key}_{text_field}"] = analysis
                        all_scores.append(analysis['scores']['modified'])
                        source_texts.append(analysis)
        
        # Calculate overall sentiment
        if all_scores:
            overall_score = sum(all_scores) / len(all_scores)
            results['overall_score'] = round(overall_score, 3)
            results['overall_sentiment'] = self.classify_sentiment(overall_score)
            results['confidence'] = round(sum(a['confidence'] for a in source_texts) / len(source_texts), 3)
        else:
            # No data found - provide default neutral sentiment with message
            results['key_insights'] = ["No OSINT text data available for sentiment analysis."]
            results['recommendations'] = ["Run OSINT collection first to generate sentiment data."]
        
        # Generate insights
        if source_texts:
            results['key_insights'] = self._generate_insights(source_texts)
            results['recommendations'] = self._generate_recommendations(results['overall_sentiment'], results['overall_score'])
        
        # Store in history
        self.sentiment_history.append({
            'timestamp': results['timestamp'],
            'topic': results['topic'],
            'sentiment': results['overall_sentiment'],
            'score': results['overall_score']
        })
        
        return results
    
    def _generate_insights(self, analyses: List[Dict]) -> List[str]:
        """Generate key insights from sentiment analyses"""
        insights = []
        
        if not analyses:
            return ["No data available for sentiment analysis."]
        
        # Count sentiment categories
        sentiment_counts = {}
        for analysis in analyses:
            sentiment = analysis['sentiment']
            sentiment_counts[sentiment] = sentiment_counts.get(sentiment, 0) + 1
        
        total = len(analyses)
        
        # Dominant sentiment insight
        dominant = max(sentiment_counts, key=sentiment_counts.get)
        dominant_pct = (sentiment_counts[dominant] / total) * 100
        insights.append(f"{dominant_pct:.1f}% of sources show {dominant.replace('_', ' ')} sentiment")
        
        # High negative sentiment warning
        negative_pct = ((sentiment_counts.get('VERY_NEGATIVE', 0) + sentiment_counts.get('NEGATIVE', 0)) / total) * 100
        if negative_pct > 60:
            insights.append(f"High negative sentiment ({negative_pct:.1f}%) indicates escalating tensions")
        
        # Mixed signals
        if len(sentiment_counts) >= 4:
            insights.append("Mixed sentiment signals detected across sources - situation may be rapidly evolving")
        
        return insights[:3]  # Return top 3 insights
    
    def _generate_recommendations(self, sentiment: str, score: float) -> List[str]:
        """Generate actionable recommendations based on sentiment"""
        recommendations = []
        
        if sentiment in ['VERY_NEGATIVE', 'NEGATIVE']:
            recommendations.append("Monitor for escalation - negative sentiment trending")
            if score < -0.7:
                recommendations.append("Consider immediate alert protocols - severe negative sentiment")
        elif sentiment == 'NEUTRAL':
            recommendations.append("Continue monitoring - neutral sentiment requires observation")
        else:
            recommendations.append("Positive developments detected - update strategic assessment")
        
        return recommendations

# Global sentiment engine instance
sentiment_engine = SentimentEngine()

async def analyze_osint_sentiment(osint_data: Dict[str, Any]) -> Dict[str, Any]:
    """Main function to analyze OSINT data sentiment"""
    return sentiment_engine.analyze_osint_batch(osint_data)

if __name__ == "__main__":
    # Test the sentiment engine
    test_data = {
        'topic': 'Test Conflict',
        'agent1': {
            'findings': [
                {'id': 1, 'summary': 'Violent clashes reported in the region', 'source_type': 'News'},
                {'id': 2, 'summary': 'Peace negotiations underway', 'source_type': 'Diplomatic'}
            ]
        }
    }
    
    result = asyncio.run(analyze_osint_sentiment(test_data))
    print(json.dumps(result, indent=2))
