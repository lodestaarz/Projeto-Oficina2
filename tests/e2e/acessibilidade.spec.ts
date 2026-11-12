import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

async function violacoes(page: import('@playwright/test').Page) {
  const resultado = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  return resultado.violations.map((v) => `${v.id}: ${v.nodes.length} elemento(s)`);
}

test('telas de login e cadastro sem violações WCAG A/AA', async ({ page }) => {
  for (const rota of ['/login', '/cadastro']) {
    await page.goto(rota);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await violacoes(page), rota).toEqual([]);
  }
});

test('jogo e perfil sem violações WCAG A/AA', async ({ page }) => {
  const email = `a11y-${Date.now()}-${Math.floor(Math.random() * 1e6)}@exemplo.com`;
  await page.goto('/cadastro');
  await page.getByLabel('Nome').fill('Pessoa A11y');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill('senha-a11y-123');
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page).toHaveURL(/\/fases$/);
  await page.getByRole('link', { name: 'Treino livre' }).click();
  await expect(page.getByTestId('posicao')).toBeVisible();
  expect(await violacoes(page), '/treino').toEqual([]);

  await page.getByRole('link', { name: 'Perfil' }).click();
  await expect(page.getByRole('heading', { name: 'Meu perfil' })).toBeVisible();
  expect(await violacoes(page), '/perfil').toEqual([]);
});

test('seleção de fases e fase com blocos sem violações WCAG A/AA', async ({ page }) => {
  const email = `a11y-fases-${Date.now()}-${Math.floor(Math.random() * 1e6)}@exemplo.com`;
  await page.goto('/cadastro');
  await page.getByLabel('Nome').fill('Pessoa A11y');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill('senha-a11y-123');
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page).toHaveURL(/\/fases$/);

  await page.goto('/fases');
  await expect(page.getByRole('heading', { name: 'Fases', level: 1 })).toBeVisible();
  expect(await violacoes(page), '/fases').toEqual([]);

  await page.locator('a[href="/fases/1"]').click();
  await expect(page.getByTestId('oficina')).toBeVisible();
  expect(await violacoes(page), '/fases/1').toEqual([]);
});
