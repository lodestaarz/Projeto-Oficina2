import { z } from 'zod';

export const esquemaCadastro = z.object({
  nome: z.string().trim().min(1, 'Informe o nome').max(100, 'Nome muito longo'),
  email: z.string().trim().toLowerCase().email('E-mail inválido').max(255),
  senha: z.string().min(6, 'A senha precisa de ao menos 6 caracteres').max(72, 'Senha muito longa'),
});

export const esquemaLogin = z.object({
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  senha: z.string().min(1, 'Informe a senha'),
});

export const esquemaGoogle = z.object({
  credential: z.string().min(1, 'Credencial Google ausente'),
});
