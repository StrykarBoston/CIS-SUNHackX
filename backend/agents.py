import os
import json
import asyncio
import resend
from typing import Dict, Any, Callable
from groq import AsyncGroq
from anthropic import AsyncAnthropic

from osint_tools import gather_osint
from sentiment_engine import analyze_osint_sentiment

AGENT_PROMPTS = {
    "agent1": {
        "name": "OSINT Collector",
        "system": """You are a senior OSINT Intelligence Collector. You have queried public APIs (Wikipedia, Reddit, News) and retrieved real-world contextual data about the target region/conflict.

You use LangChain tools and web_search capabilities to ingest and filter data from these sources.

Your job is to read the provided real OSINT context and synthezise it into structured, realistic intelligence findings. You MUST anchor your analysis on the provided REAL-TIME DATE to prioritize today's breaking events.

Return ONLY a JSON object with this exact structure:
{
  "agent": "OSINT Collector",
  "timestamp": "ISO date string",
  "region": "string",
  "data_sources_scanned": ["News APIs", "Social Media", "RSS/Feeds", "Wikipedia", "Web Search"],
  "daily_summary": "A 2-3 sentence overarching summary of TODAY'S major events and geopolitical shifts.",
  "findings": [
    {
      "id": 1,
      "headline": "string",
      "summary": "2-3 sentence summary based on the real context",
      "source": "News Agency/Reddit/Wikipedia",
      "source_type": "News API|Social Media|RSS Feed|Wikipedia|Web Search",
      "source_url": "URL if available, else placeholder",
      "date": "YYYY-MM-DD",
      "location": "specific location",
      "latitude": 30.5595,
      "longitude": 22.9375,
      "alert_level": "HIGH|MEDIUM|LOW",
      "confidence": 0.85,
      "category": "military|political|humanitarian|economic",
      "sentiment": "negative|neutral|positive"
    }
  ],
  "alert_flag": true,
  "alert_reason": "Provide a brief reason if generating an active alert for today.",
  "total_findings": 5
}
Generate exactly 5 findings based on the provided OSINT context. Make them detailed, grounded in the data, and highly focused on today's developments.""",
        "build_user_message": lambda topic, outputs, osint: f"Target Region: {topic}\n\n=== REAL OSINT DATA FETCHED SO FAR ===\n{osint or 'No additional OSINT data available.'}\n=====================================\n\nParse this data and generate the JSON findings."
    },
    "agent2": {
        "name": "Conflict Detector",
        "system": """You are an expert Conflict Detector specializing in escalation signal detection, sentiment analysis, and event scoring. You receive raw OSINT findings and analyze them to determine escalation risk, perform sentiment analysis across sources, and score events on a conflict escalation scale.

Your three core capabilities:
1. ESCALATION SIGNAL DETECTION — identify patterns that indicate rising tensions
2. SENTIMENT ANALYSIS — aggregate sentiment across all sources to gauge public/media mood
3. EVENT SCORING — rate each event on a 1-10 conflict severity scale

Return ONLY a JSON object with this exact structure:
{
  "agent": "Conflict Detector",
  "threat_score": 7,
  "threat_level": "HIGH",
  "escalation_signals": ["signal 1", "signal 2", "signal 3"],
  "sentiment_analysis": {
    "overall_sentiment": "negative",
    "sentiment_score": -0.72,
    "breakdown": {
      "negative": 65,
      "neutral": 25,
      "positive": 10
    },
    "trending_direction": "WORSENING"
  },
  "event_scores": [
    {"event": "string", "severity_score": 8, "category": "military|political|humanitarian|economic"}
  ],
  "key_triggers": [
    {"trigger": "string", "severity": "HIGH|MEDIUM|LOW", "evidence": "string"}
  ],
  "confidence": 0.82,
  "reasoning": "2-3 paragraph detailed analysis",
  "recommended_watch_areas": ["area1", "area2"]
}""",
        "build_user_message": lambda topic, outputs, _: f"""Detect conflict escalation and perform sentiment analysis on these OSINT findings.

OSINT FINDINGS:
{json.dumps(outputs.get('agent1', {}))}

SENTIMENT ANALYSIS:
{json.dumps(outputs.get('sentiment_analysis', {}))}

Use both the OSINT findings AND sentiment analysis to provide comprehensive escalation detection and sentiment assessment."""
    },
    "agent3": {
        "name": "Scenario Simulator",
        "system": """You are a Strategic Scenario Simulator. Based on the conflict detection analysis, you perform two critical functions:
1. GENERATE RESPONSE OPTIONS — create 3 distinct strategic scenarios with projected outcomes
2. MODEL CIVILIAN IMPACT — estimate humanitarian consequences for each scenario using UNHCR/IDMC methodologies

Be specific about timelines, probabilities, and civilian impact estimates.

Return ONLY a JSON object:
{
  "agent": "Scenario Simulator",
  "scenarios": [
    {
      "id": 1,
      "title": "string",
      "type": "DIPLOMATIC|MILITARY|ECONOMIC",
      "description": "detailed description",
      "key_actions": ["action1", "action2"],
      "projected_outcome": "string",
      "success_probability": 0.65,
      "timeline_days": 30,
      "risk_level": "LOW|MEDIUM|HIGH",
      "resources_required": "string",
      "civilian_impact": {
        "idp_estimate": 80000,
        "casualty_estimate": 1200,
        "food_insecurity_percent": 45,
        "infrastructure_damage_percent": 25,
        "healthcare_disruption": "SEVERE|MODERATE|MILD",
        "industry_impact": ["string of impacted local industries"],
        "market_impact": "string on stock/commodity disruption"
      }
    }
  ],
  "recommended_scenario_id": 2,
  "simulation_confidence": 0.75,
  "overall_civilian_impact": {
    "total_idp_estimate": 125000,
    "total_casualty_estimate": 2400,
    "overall_infrastructure_damage_percent": 35,
    "most_affected_regions": ["region1", "region2"],
    "urgent_needs": ["food", "shelter", "medical"],
    "response_window_days": 14,
    "most_disrupted_industries": ["industry 1", "industry 2"],
    "market_volatility_indicators": ["indicator 1", "indicator 2"]
  }
}""",
        "build_user_message": lambda topic, outputs, _: f"Simulate strategic scenarios and model civilian impact based on: OSINT: {json.dumps(outputs.get('agent1', {}).get('findings', [])[:4])} CONFLICT DETECTION: {json.dumps(outputs.get('agent2', {}))}"
    },
    "agent4": {
        "name": "Intelligence Brief Writer",
        "system": """You are an Intelligence Brief Writer. You compile all previous agent outputs into a structured, authoritative intelligence assessment with fully traceable citations. Every finding and recommendation MUST cite its source agent and specific evidence.

Your key responsibilities:
- Compile traceable citations from all agents
- Structure information for commander consumption
- Ensure <5 minute delivery workflow
- Cross-reference all sources for consistency

Return ONLY a JSON object:
{
  "agent": "Intelligence Brief Writer",
  "classification": "UNCLASSIFIED // FOR OFFICIAL USE ONLY",
  "brief_id": "CIS-2025-XXX",
  "generated_at": "ISO timestamp",
  "executive_summary": "3-4 sentence summary for commanders",
  "threat_level": "HIGH",
  "threat_score": 7,
  "key_findings": [
    {
      "finding": "string",
      "source_agent": "OSINT Collector|Conflict Detector|Scenario Simulator",
      "evidence": "specific evidence reference",
      "confidence": 0.85,
      "priority": "HIGH|MEDIUM|LOW"
    }
  ],
  "top_3_recommendations": [
    {
      "rank": 1,
      "action": "string",
      "rationale": "string",
      "source": "Agent name + specific finding",
      "urgency": "IMMEDIATE|24H|72H",
      "risk": "LOW|MEDIUM|HIGH"
    }
  ],
  "scenarios_summary": "brief paragraph summarizing strategic options",
  "civilian_impact_summary": "brief paragraph on humanitarian consequences",
  "sources_cited": ["source1", "source2"],
  "citation_chain": [
    {"claim": "string", "agent": "string", "evidence_id": "string"}
  ],
  "next_assessment": "72 hours"
}""",
        "build_user_message": lambda topic, outputs, _: f"Compile intelligence brief with traceable citations using all agent outputs: OSINT: {json.dumps(outputs.get('agent1', {}))} CONFLICT DETECTION: {json.dumps(outputs.get('agent2', {}))} SCENARIOS & IMPACT: {json.dumps(outputs.get('agent3', {}))}"
    },
    "agent5": {
        "name": "Commander Brief",
        "system": """You are the final output stage of a 5-agent intelligence pipeline. You generate the Commander Brief — the definitive output document that includes: threat level assessment, strategic scenarios, civilian impact analysis, and source-traced recommendations.

This is the document commanders will read. It must be:
- Clear and actionable
- Fully source-traced (every recommendation cites its origin agent and evidence)
- Under 5-minute read time
- Prioritized for decision-making

Return ONLY a JSON object:
{
  "agent": "Commander Brief",
  "classification": "UNCLASSIFIED // FOR OFFICIAL USE ONLY",
  "brief_id": "CIS-2025-XXX",
  "generated_at": "ISO timestamp",
  "target_delivery": "under 5 minutes",
  "executive_summary": "3-4 sentence high-level summary for rapid commander consumption",
  "threat_level": "HIGH",
  "threat_score": 7,
  "sentiment_trend": "WORSENING|STABLE|IMPROVING",
  "key_findings": [
    {
      "finding": "string",
      "source_agent": "OSINT Collector|Conflict Detector|Scenario Simulator",
      "confidence": 0.85,
      "priority": "HIGH|MEDIUM|LOW"
    }
  ],
  "top_3_recommendations": [
    {
      "rank": 1,
      "action": "string",
      "rationale": "string",
      "source": "Agent name + specific finding traced back",
      "urgency": "IMMEDIATE|24H|72H",
      "risk": "LOW|MEDIUM|HIGH"
    }
  ],
  "scenarios_summary": "brief paragraph on strategic options",
  "civilian_impact_summary": "brief paragraph on humanitarian situation",
  "market_and_industry_summary": "brief paragraph summarizing macro economic and trade disruptions",
  "total_idp_estimate": 125000,
  "total_casualty_estimate": 2400,
  "sources_cited": ["source1", "source2"],
  "next_assessment": "72 hours"
}""",
        "build_user_message": lambda topic, outputs, _: f"Generate the final Commander Brief output. This is the definitive intelligence product. Use ALL previous agent outputs: OSINT DATA: {json.dumps(outputs.get('agent1', {}))} CONFLICT DETECTION: {json.dumps(outputs.get('agent2', {}))} SCENARIOS & CIVILIAN IMPACT: {json.dumps(outputs.get('agent3', {}))} INTELLIGENCE BRIEF: {json.dumps(outputs.get('agent4', {}))}"
    }
}

AGENT_ORDER = ['agent1', 'agent2', 'agent3', 'agent4', 'agent5']

def parse_json_safely(text: str) -> dict:
    clean = text.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(clean)
    except json.JSONDecodeError as e:
        print(f"JSON Parsing failed. Raw output: {text}")
        raise ValueError("Failed to parse JSON from AI response.")

async def call_groq_agent(system_prompt: str, user_message: str) -> dict:
    api_key = os.getenv("VITE_GROQ_API_KEY")
    client = AsyncGroq(api_key=api_key)
    chat_completion = await client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        model="llama-3.1-8b-instant",
        response_format={"type": "json_object"},
        max_tokens=1500
    )
    return parse_json_safely(chat_completion.choices[0].message.content)

async def call_anthropic_agent(system_prompt: str, user_message: str) -> dict:
    api_key = os.getenv("VITE_ANTHROPIC_API_KEY")
    client = AsyncAnthropic(api_key=api_key)
    response = await client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1500,
        system=system_prompt,
        messages=[
            {"role": "user", "content": user_message}
        ]
    )
    return parse_json_safely(response.content[0].text)

async def call_agent(system_prompt: str, user_message: str) -> dict:
    # Use Groq with failover/smart retry matching the frontend logic
    if os.getenv("VITE_GROQ_API_KEY"):
        retries = 0
        while retries < 4:
            try:
                return await call_groq_agent(system_prompt, user_message)
            except Exception as e:
                err_msg = str(e).lower()
                if '429' in err_msg or 'rate limit' in err_msg:
                    retries += 1
                    delay_seconds = (2 ** retries) * 5
                    print(f"Groq Rate limit hit. Pausing background pipeline for {delay_seconds} seconds... (Attempt {retries}/4)")
                    await asyncio.sleep(delay_seconds)
                    continue
                
                if os.getenv("VITE_ANTHROPIC_API_KEY"):
                    print("Groq failed critically. Falling back to Anthropic...")
                    return await call_anthropic_agent(system_prompt, user_message)
                raise e
        raise Exception("Groq pipeline timed out entirely due to rate limits.")
    elif os.getenv("VITE_ANTHROPIC_API_KEY"):
         return await call_anthropic_agent(system_prompt, user_message)
    else:
        raise Exception("No API capabilities configured.")

async def run_pipeline(topic: str, progress_callback: Callable):
    import time
    outputs = {}
    
    for idx, key in enumerate(AGENT_ORDER):
        agent_def = AGENT_PROMPTS[key]
        agent_num = idx + 1
        
        # update status: running
        await progress_callback(agent_num, "running", 0)
        start_time = time.time()
        
        osint_data = None
        if key == 'agent1':
            osint_data = await gather_osint(topic)
            
        user_msg = agent_def['build_user_message'](topic, outputs, osint_data)
        
        try:
            result = await call_agent(agent_def['system'], user_msg)
        except Exception as e:
            await progress_callback(agent_num, "error", int(time.time() - start_time))
            raise Exception(f"Agent {agent_num} failed: {str(e)}")
            
        elapsed = int(time.time() - start_time)
        outputs[key] = result
        
        await progress_callback(agent_num, "complete", elapsed, result)
        
        # Run sentiment analysis after agent1 (OSINT Collector) completes
        if key == 'agent1':
            try:
                print("Running sentiment analysis on OSINT data...")
                # Wait a moment to ensure result is properly stored
                await asyncio.sleep(0.1)
                sentiment_data = await analyze_osint_sentiment({**outputs, "topic": topic})
                outputs['sentiment_analysis'] = sentiment_data
                print(f"Sentiment analysis complete: {sentiment_data['overall_sentiment']} (score: {sentiment_data['overall_score']:.3f})")
                print(f"Sentiment data stored in outputs: {sentiment_data is not None}")
                # Send sentiment analysis via SSE to frontend
                await progress_callback(0, "sentiment_complete", 0, sentiment_data)
            except Exception as e:
                print(f"Sentiment analysis failed: {e}")
                outputs['sentiment_analysis'] = None
        
    full_brief = {
        **outputs,
        "topic": topic,
        "totalSeconds": sum([outputs[k].get("_elapsed", 0) for k in outputs]),
    }
    
    # Trigger automated Email dispatch
    api_key = os.getenv("RESEND_API_KEY")
    if api_key:
        try:
            print("Dispatching automated Email alert via Resend...")
            resend.api_key = api_key
            
            # Extract executive summary from Commander Brief (agent5)
            summary = full_brief.get('agent5', {}).get('executive_summary', 'No summary generated.')
            
            # NOTE: For trial Resend accounts, you can only send to the email you verified!
            # Change the "to" email address to your real, verified email address.
            response = resend.Emails.send({
                "from": "Acme <onboarding@resend.dev>", # Resend requires exactly this format for testing
                "to": "vedantsangamnere556@gmail.com",   # USER TODO: change to their actual email!
                "subject": f"🚨 URGENT: OSINT Brief - {topic}",
                "text": f"CONFLICT.AI AUTOMATED DISPATCH\n\nTOPIC: {topic}\n\nSUMMARY:\n{summary}\n\n[End of Automated Alert]"
            })
            print(f"Email dispatched successfully! Response: {response}")
        except Exception as e:
            print(f"Failed to send automated email: {str(e)}")
    else:
        print("Skipping automated emails: RESEND_API_KEY not found in .env")
    
    return full_brief
