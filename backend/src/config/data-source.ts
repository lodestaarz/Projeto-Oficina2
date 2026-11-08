import { z } from 'zod';

const esquemaEnv = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET é obrigatório'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  GOOGLE_CLIENT_ID: z.string().optional(),
});

function carregarEnv() {
  const resultado = esquemaEnv.safeParse(process.env);
  if (!resultado.success) {
    const problemas = resultado.error.issues
      .map((issue) => `- ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Variáveis de ambiente inválidas:\n${problemas}\nVeja backend/.env.example.`);
  }

  const dados = resultado.data;

  if (dados.NODE_ENV === 'production' && dados.JWT_SECRET === 'troque-este-valor') {
    throw new Error('Defina um JWT_SECRET próprio antes de rodar em produção.');
  }

  return {
    nodeEnv: dados.NODE_ENV,
    port: dados.PORT,
    corsOrigin: dados.CORS_ORIGIN,
    databaseUrl: dados.DATABASE_URL,
    jwtSecret: dados.JWT_SECRET,
    jwtExpiresIn: dados.JWT_EXPIRES_IN,
  };
}

export const env = carregarEnv();
export type Env = typeof env;
