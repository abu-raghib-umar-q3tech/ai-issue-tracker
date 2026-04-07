import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  nodeEnv: string;
  port: number;
  mongoUri: string;
  clientUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  useOpenAI: boolean;
  openaiApiKey?: string;
  openaiModel: string;
}

const env: EnvConfig = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT) || 5001,
  mongoUri: process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/ai_issue_tracker',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET ?? 'change_me_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  useOpenAI: process.env.USE_OPENAI === 'true',
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4o-mini'
};

export { env };
export type { EnvConfig };
