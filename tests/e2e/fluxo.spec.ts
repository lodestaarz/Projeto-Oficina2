import { expect, test } from '@playwright/test';

test('cadastro, jogo, perfil, sair e entrar de novo', async ({ page }) => {
  const email = `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@exemplo.com`;
  const senha = 'senha-e2e-123';

  await page.goto('/cadastro');
  await page.getByLabel('Nome').fill('Pessoa E2E');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(senha);
  await page.getByRole('button', { name: 'Criar conta' }).click();

  await expect(page).toHaveURL(/\/fases$/);
  await expect(page.getByRole('heading', { name: 'Fases', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Treino livre' }).click();
  const posicao = page.getByTestId('posicao');
  await expect(posicao).toBeVisible();
  const antes = await posicao.textContent();
  await page.getByRole('button', { name: 'Direita', exact: true }).click();
  await expect(posicao).not.toHaveText(antes ?? '');

  await page.getByRole('link', { name: /perfil/i }).click();
  await expect(page.getByText(email)).toBeVisible();

  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeVisible();

  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(senha);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Meu perfil' })).toBeVisible();
  await page.getByRole('link', { name: 'Jogar' }).click();
  await expect(page.getByRole('heading', { name: 'Fases', exact: true })).toBeVisible();
});

test('login com senha errada mostra erro', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('ninguem@exemplo.com');
  await page.getByLabel('Senha').fill('senha-errada-1');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
});
