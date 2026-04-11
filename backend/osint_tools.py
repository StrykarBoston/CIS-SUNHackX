import urllib.parse
import httpx
import asyncio
import os
import base64

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

async def fetch_twitter_data(topic: str) -> str:
    """
    Fetch Twitter/X data using Twitter API v2
    Requires TWITTER_BEARER_TOKEN environment variable
    """
    try:
        bearer_token = os.getenv("TWITTER_BEARER_TOKEN")
        if not bearer_token:
            return "Twitter API: Bearer token not configured. Set TWITTER_BEARER_TOKEN environment variable."
        
        # Twitter API v2 recent search endpoint
        search_url = "https://api.twitter.com/2/tweets/search/recent"
        
        # Query parameters - search for recent tweets about the topic
        params = {
            'query': f"{topic} -is:retweet",  # Exclude retweets
            'tweet.fields': 'created_at,author_id,public_metrics,lang,geo',
            'user.fields': 'name,username,verified',
            'max_results': 10,
            'expansions': 'author_id,geo.place_id'
        }
        
        headers = {
            'Authorization': f'Bearer {bearer_token}',
            'Content-Type': 'application/json'
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(search_url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            
            if 'data' not in data or not data['data']:
                return f"No recent Twitter/X data found for '{topic}'."
            
            tweets = []
            for tweet in data['data'][:10]:  # Limit to 10 tweets
                author_info = "Unknown"
                if 'includes' in data and 'users' in data['includes']:
                    for user in data['includes']['users']:
                        if user['id'] == tweet['author_id']:
                            author_info = f"@{user['username']}"
                            if user.get('verified'):
                                author_info += " (Verified)"
                            break
                
                metrics = tweet.get('public_metrics', {})
                engagement = f"Likes: {metrics.get('like_count', 0)}, RTs: {metrics.get('retweet_count', 0)}"
                
                tweet_text = tweet['text'][:200]  # Truncate long tweets
                if len(tweet['text']) > 200:
                    tweet_text += "..."
                
                tweets.append(f"- [{author_info}] {tweet_text} ({engagement})")
            
            return f"RECENT TWITTER/X INTELLIGENCE:\n" + "\n".join(tweets)
            
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            return "Twitter API rate limit exceeded. Please wait before retrying."
        elif e.response.status_code == 401:
            return "Twitter API authentication failed. Check your bearer token."
        else:
            return f"Twitter API error ({e.response.status_code}): {e.response.text}"
    except Exception as e:
        print(f"Twitter fetch error: {e}")
        return f"Twitter search failed for {topic}."

async def gather_osint(topic: str) -> str:
    from datetime import datetime
    current_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    
    wiki_feature, reddit_feature, twitter_feature = await asyncio.gather(
        fetch_wikipedia_data(topic),
        fetch_reddit_news(topic),
        fetch_twitter_data(topic)
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

{twitter_feature}

---
"""
