/**
 * OSINT Tools for Agent 1 Data Collection
 * Uses free APIs to gather background context on conflicts.
 */

// 1. Wikipedia Summary Fetcher
export async function fetchWikipediaData(topic) {
  try {
    // Wikipedia API requires URL-encoded parameters
    const queryUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(topic)}&origin=*`;
    
    const response = await fetch(queryUrl);
    if (!response.ok) throw new Error('Wikipedia API error');
    
    const data = await response.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    
    if (pageId === '-1') {
      return `No direct Wikipedia match found for "${topic}".`;
    }
    
    const extract = pages[pageId].extract;
    return `WIKIPEDIA EXTRACT (${topic}):\n${extract.substring(0, 1000)}...`; // Limit length
  } catch (err) {
    console.error('Wikipedia fetch error:', err);
    return `Wikipedia search failed for ${topic}.`;
  }
}

// 2. Reddit Latest Headlines (r/worldnews or r/conflicts)
export async function fetchRedditNews(topic) {
  try {
    // We search across all of Reddit for the specific topic in the last month
    // Using a CORS proxy since Reddit blocks browser direct calls
    const targetUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(topic)}&sort=new&t=month&limit=10`;
    const queryUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
    
    const response = await fetch(queryUrl);
    if (!response.ok) throw new Error('Reddit API error');
    
    const proxyData = await response.json();
    const data = JSON.parse(proxyData.contents);
    
    if (!data.data || !data.data.children || data.data.children.length === 0) {
      return `No recent Reddit discussions found for "${topic}".`;
    }
    
    // Extract titles and upvotes as context
    const posts = data.data.children.map(child => {
      return `- [${child.data.subreddit_name_prefixed}] ${child.data.title} (${child.data.ups} upvotes)`;
    });
    
    return `RECENT SOCIAL MEDIA/NEWS SENTIMENT (Reddit):\n${posts.join('\n')}`;
  } catch (err) {
    console.error('Reddit fetch error:', err);
    return `Reddit search failed for ${topic}.`;
  }
}

// 3. Main Data Aggregation exported for Agent 1
export async function gatherOSINT(topic) {
  // Use Promise.all to fetch concurrently
  const [wikiData, redditData] = await Promise.all([
    fetchWikipediaData(topic),
    fetchRedditNews(topic)
  ]);
  
  return `
[OSINT DATA GATHERED ON: ${topic}]

---

${wikiData}

---

${redditData}

---
`;
}
