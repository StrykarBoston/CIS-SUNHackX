// ============================================================
// Multi-Provider API Service — Supports Groq (Primary) & Anthropic
// ============================================================

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Fast, highly capable open-weights model on Groq
const GROQ_MODEL = 'llama-3.3-70b-versatile'; 

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';

const MAX_TOKENS = 1500;

export async function callAgent(systemPrompt, userMessage) {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;
  const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (groqKey) {
    return await callGroqAgent(groqKey, systemPrompt, userMessage);
  } else if (anthropicKey) {
    return await callClaudeAgent(anthropicKey, systemPrompt, userMessage);
  } else {
    throw new Error('No API key configured. Please add VITE_GROQ_API_KEY to .env');
  }
}

async function callGroqAgent(apiKey, systemPrompt, userMessage) {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      // Let the model know we want JSON
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Groq API Error ${response.status}: ${errorData?.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  const text = data.choices[0].message.content;
  return parseJsonSafely(text);
}

async function callClaudeAgent(apiKey, systemPrompt, userMessage) {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Anthropic API Error ${response.status}: ${errorData?.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  const text = data.content[0].text;
  return parseJsonSafely(text);
}

function parseJsonSafely(text) {
  // Strip markdown code fences if present
  const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  
  try {
    return JSON.parse(clean);
  } catch (e) {
    console.error("JSON Parsing failed. Raw output:", text);
    throw new Error("Failed to parse JSON from AI response. Ensure AI returns plain JSON.");
  }
}
