import urllib.parse
import httpx
import asyncio

async def fetch_wikipedia_data(topic: str) -> str:
    try:
        query_url = f"https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&explaintext=true&titles={urllib.parse.quote(topic)}&origin=*"
        async with httpx.AsyncClient() as client:
            response = await client.get(query_url)
            response.raise_for_status()
            data = response.json()
            
            pages = data.get("query", {}).get("pages", {})
            if not pages:
                return f"No Wikipedia pages available for {topic}."
                
            page_id = list(pages.keys())[0]
            if page_id == "-1":
                return f"No direct Wikipedia match found for '{topic}'."
                
            extract = pages[page_id].get("extract", "")
            return f"WIKIPEDIA EXTRACT ({topic}):\n{extract[:1000]}..."
    except Exception as e:
        print(f"Wikipedia fetch error: {e}")
        return f"Wikipedia search failed for {topic}."

async def fetch_reddit_news(topic: str) -> str:
    try:
        # Don't need proxy for Python, can hit reddit directly with a user-agent
        target_url = f"https://www.reddit.com/search.json?q={urllib.parse.quote(topic)}&sort=new&t=day&limit=10"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(target_url, headers={"User-Agent": "ConflictIntelligenceSystem/1.0"})
            response.raise_for_status()
            data = response.json()
            
            children = data.get("data", {}).get("children", [])
            if not children:
                return f"No recent Reddit discussions found for '{topic}'."
            
            posts = []
            for child in children:
                post = child.get("data", {})
                posts.append(f"- [{post.get('subreddit_name_prefixed')}] {post.get('title')} ({post.get('ups')} upvotes)")
            
            return f"RECENT SOCIAL MEDIA/NEWS SENTIMENT (Reddit):\n" + "\n".join(posts)
    except Exception as e:
        print(f"Reddit fetch error: {e}")
        return f"Reddit search failed for {topic}."

async def gather_osint(topic: str) -> str:
    from datetime import datetime
    current_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    
    wiki_feature, reddit_feature = await asyncio.gather(
        fetch_wikipedia_data(topic),
        fetch_reddit_news(topic)
    )
    
    return f"""
[OSINT DATA GATHERED ON: {topic}]
[CURRENT REAL-TIME DATE: {current_time}]
(Use this precise date to anchor "Today's" events)

---

{wiki_feature}

---

{reddit_feature}

---
"""
