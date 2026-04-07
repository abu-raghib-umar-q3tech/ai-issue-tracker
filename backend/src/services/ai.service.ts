import { env } from '../config/env.js';
import { isTicketPriority, type TicketAnalysisResult } from '../types/ticket.js';

interface OpenAIChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const normalizeTag = (tag: string): string => tag.trim().toLowerCase().replace(/\s+/g, '-');

const normalizeTags = (tags: string[]): string[] => {
  const cleaned = tags.map((tag) => normalizeTag(tag)).filter(Boolean);
  return [...new Set(cleaned)];
};

const toJsonLikeContent = (content: string): string => {
  return content.replace(/```json/gi, '').replace(/```/g, '').trim();
};

const parseJsonPayload = (content: string): unknown => {
  const cleaned = toJsonLikeContent(content);

  try {
    return JSON.parse(cleaned);
  } catch (_initialError: unknown) {
    const match = cleaned.match(/\{[\s\S]*\}/);

    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]);
    } catch (_matchError: unknown) {
      return null;
    }
  }
};

const toAnalysisResult = (value: unknown): TicketAnalysisResult | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as {
    priority?: unknown;
    tags?: unknown;
    estimatedTime?: unknown;
  };

  if (!isTicketPriority(candidate.priority)) {
    return null;
  }

  if (!Array.isArray(candidate.tags) || !candidate.tags.every((tag) => typeof tag === 'string')) {
    return null;
  }

  if (typeof candidate.estimatedTime !== 'string' || !candidate.estimatedTime.trim()) {
    return null;
  }

  return {
    priority: candidate.priority,
    tags: normalizeTags(candidate.tags),
    estimatedTime: candidate.estimatedTime.trim()
  };
};

const ruleBasedAnalyzeTicket = (title: string, description: string): TicketAnalysisResult => {
  const normalized = `${title} ${description}`.toLowerCase();

  let priority: TicketAnalysisResult['priority'] = 'Medium';

  if (/(crash|urgent)/.test(normalized)) {
    priority = 'High';
  }

  const tags: string[] = [];

  if (/ui/.test(normalized)) {
    tags.push('frontend');
  }

  if (/api/.test(normalized)) {
    tags.push('backend');
  }

  if (/bug/.test(normalized)) {
    tags.push('bug');
  }

  const estimatedTime = /bug/.test(normalized) ? '2-4 hours' : '1-2 hours';

  const normalizedTags = normalizeTags(tags);

  return {
    priority,
    tags: normalizedTags.length ? normalizedTags : ['general'],
    estimatedTime
  };
};

const analyzeWithOpenAI = async (title: string, description: string): Promise<TicketAnalysisResult> => {
  const prompt = [
    'Analyze this support ticket and return ONLY valid JSON.',
    'JSON format: {"priority":"Low|Medium|High","tags":["string"],"estimatedTime":"string"}',
    'No extra text, no markdown.',
    `Title: ${title}`,
    `Description: ${description}`
  ].join('\n');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.openaiApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: env.openaiModel,
      temperature: 0,
      messages: [
        {
          role: 'system',
          content:
            'You are a ticket analysis assistant. Output strict JSON only with keys: priority, tags, estimatedTime.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const data = (await response.json()) as OpenAIChatResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('OpenAI response missing content');
  }

  const parsed = parseJsonPayload(content);
  const typedResult = toAnalysisResult(parsed);

  if (!typedResult) {
    throw new Error('OpenAI response JSON has invalid shape');
  }

  return typedResult;
};

const analyzeTicket = async (title: string, description: string): Promise<TicketAnalysisResult> => {
  if (!env.useOpenAI) {
    return ruleBasedAnalyzeTicket(title, description);
  }

  if (!env.openaiApiKey) {
    if (env.nodeEnv !== 'production') {
      console.warn('OPENAI_API_KEY is not set — using rule-based fallback');
    }

    return ruleBasedAnalyzeTicket(title, description);
  }

  try {
    return await analyzeWithOpenAI(title, description);
  } catch (error: unknown) {
    if (env.nodeEnv !== 'production') {
      const message = error instanceof Error ? error.message : 'Unknown OpenAI analysis failure';
      console.warn('OpenAI analysis failed, using rule-based fallback:', message);
    }

    return ruleBasedAnalyzeTicket(title, description);
  }
};

export { analyzeTicket };
