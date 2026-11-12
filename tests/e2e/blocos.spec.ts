import { expect, test, type Page } from '@playwright/test';

async function cadastrar(page: Page) {
  const email = `blocos-${Date.now()}-${Math.floor(Math.random() * 1e6)}@exemplo.com`;
  await page.goto('/cadastro');
  await page.getByLabel('Nome').fill('Pessoa Blocos');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill('senha-e2e-123');
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page).toHaveURL(/\/fases$/);
}

/** Arrasta um bloco da caixa de ferramentas e encaixa embaixo de "quando executar". */
async function arrastarBloco(page: Page, nome: string) {
  const inicio = await page
    .locator('.blocklyDraggable', { hasText: 'quando executar' })
    .first()
    .boundingBox();
  if (!inicio) throw new Error('bloco inicial não encontrado');
  const origem = page.locator('.blocklyFlyout .blocklyDraggable', { hasText: nome }).first();
  const o = await origem.boundingBox();
  if (!o) throw new Error(`bloco ${nome} não encontrado`);
  await page.mouse.move(o.x + 10, o.y + o.height / 2);
  await page.mouse.down();
  await page.mouse.move(inicio.x + 12, inicio.y + 52, { steps: 10 });
  await page.mouse.up();
}

test('resolve a fase 1 com blocos e ganha estrelas', async ({ page }, info) => {
  await cadastrar(page);
  await page.locator('a[href="/fases/1"]').click();
  await expect(page.getByTestId('oficina')).toBeVisible();

  await page.getByRole('button', { name: /Executar/ }).click();
  await expect(page.getByTestId('mensagem')).toContainText('Arraste blocos');

  for (let n = 0; n < 4; n++) {
    await arrastarBloco(page, 'avançar');
    await expect(page.getByTestId('codigo')).toHaveText(
      new RegExp(`^(\\s*avancar\\(\\);){${n + 1}}\\s*$`),
    );
  }

  await page.getByLabel('Velocidade').selectOption('rapida');
  await page.getByRole('button', { name: /Executar/ }).click();
  await expect(page.getByTestId('estrelas')).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId('posicao')).toHaveText('Robô em (4, 0)');
  await expect(page.getByText('Progresso salvo.')).toBeVisible();
  await page.screenshot({ path: info.outputPath('fase1-vitoria.png') });

  // O progresso fica no servidor: volta à seleção e a estrela aparece.
  await page.getByRole('link', { name: '← Fases' }).click();
  await expect(page.getByTestId('estrelas-fase-1')).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('estrelas-fase-1')).toBeVisible();
  await page.screenshot({ path: info.outputPath('selecao-com-estrela.png') });
});

test('fase 13 mostra itens no mapa e o contador de itens', async ({ page }, info) => {
  await cadastrar(page);
  await page.goto('/fases/13');
  await expect(page.getByTestId('oficina')).toBeVisible();
  await expect(page.getByTestId('item')).toHaveCount(3);
  await expect(page.getByTestId('variaveis')).toContainText('itens: 0');
  await page.screenshot({ path: info.outputPath('fase13-itens.png') });
});

test('fase 16 libera função e chamar e gera o código da chamada', async ({ page }, info) => {
  await cadastrar(page);
  await page.goto('/fases/16');
  await expect(page.getByTestId('oficina')).toBeVisible();
  await expect(
    page.locator('.blocklyFlyout .blocklyDraggable', { hasText: 'função' }).first(),
  ).toBeVisible();
  await arrastarBloco(page, 'chamar função');
  await expect(page.getByTestId('codigo')).toHaveText(/^\s*A\(\);\s*$/);
  await page.screenshot({ path: info.outputPath('fase16-funcao.png') });
});
