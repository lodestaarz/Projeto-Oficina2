import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { JogoPage } from './JogoPage';

function posicaoDoPersonagem() {
  const personagem = screen.getByRole('img', { name: 'Personagem' });
  const celula = personagem.closest<HTMLElement>('[role="gridcell"]');
  return { x: Number(celula?.dataset.x), y: Number(celula?.dataset.y) };
}

function textoDaPosicao() {
  return screen.getByTestId('posicao').textContent;
}

function itensDaSequencia() {
  const lista = screen.queryByRole('list', { name: 'Comandos da sequência' });
  if (!lista) return [];
  return within(lista)
    .getAllByRole('listitem')
    .map((item) => item.querySelector('.sequencia-nome')?.textContent);
}

describe('Área de movimentação (RF06, RF07)', () => {
  it('CT-UI-01: mostra a grade 8 × 8 e o personagem em (0, 0)', () => {
    render(<JogoPage />);

    const grade = screen.getByRole('grid', { name: 'Área de movimentação' });
    expect(within(grade).getAllByRole('gridcell')).toHaveLength(64);
    expect(within(grade).getAllByRole('row')).toHaveLength(8);
    expect(screen.getAllByRole('img', { name: 'Personagem' })).toHaveLength(1);
    expect(posicaoDoPersonagem()).toEqual({ x: 0, y: 0 });
    expect(textoDaPosicao()).toBe('Posição: (0, 0)');
  });
});

describe('Movimento direto (RF08, RF09, RF10, RF11)', () => {
  it('CT-UI-02: move pelo botão Direita', async () => {
    const user = userEvent.setup();
    render(<JogoPage />);

    await user.click(screen.getByRole('button', { name: 'Direita' }));

    expect(posicaoDoPersonagem()).toEqual({ x: 1, y: 0 });
    expect(textoDaPosicao()).toBe('Posição: (1, 0)');
  });

  it('os botões funcionam pelo teclado (Tab + Enter / Espaço)', async () => {
    const user = userEvent.setup();
    render(<JogoPage />);

    screen.getByRole('button', { name: 'Baixo' }).focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(posicaoDoPersonagem()).toEqual({ x: 0, y: 2 });
  });

  it('CT-UI-03: move pela seta ↓ sem rolar a página', () => {
    render(<JogoPage />);

    const naoCancelado = fireEvent.keyDown(document.body, { key: 'ArrowDown' });

    expect(naoCancelado).toBe(false); // preventDefault foi chamado
    expect(posicaoDoPersonagem()).toEqual({ x: 0, y: 1 });
  });

  it('ignora teclas que não são setas', () => {
    render(<JogoPage />);
    const naoCancelado = fireEvent.keyDown(document.body, { key: 'a' });
    expect(naoCancelado).toBe(true);
    expect(posicaoDoPersonagem()).toEqual({ x: 0, y: 0 });
  });

  it('CT-UI-04: ignora as setas dentro de campos de texto', () => {
    render(
      <>
        <input aria-label="Campo de teste" />
        <JogoPage />
      </>,
    );
    const campo = screen.getByRole('textbox', { name: 'Campo de teste' });
    campo.focus();

    const naoCancelado = fireEvent.keyDown(campo, { key: 'ArrowRight' });

    expect(naoCancelado).toBe(true);
    expect(posicaoDoPersonagem()).toEqual({ x: 0, y: 0 });
  });

  it('CT-MOV-02 na interface: na borda fica parado e avisa o usuário', async () => {
    const user = userEvent.setup();
    render(<JogoPage />);

    await user.click(screen.getByRole('button', { name: 'Cima' }));
    await user.click(screen.getByRole('button', { name: 'Esquerda' }));

    expect(posicaoDoPersonagem()).toEqual({ x: 0, y: 0 });
    expect(screen.getByRole('status')).toHaveTextContent('não pode sair da área');
  });

  it('CT-MOV-05: Recomeçar volta para (0, 0)', async () => {
    const user = userEvent.setup();
    render(<JogoPage />);

    for (let i = 0; i < 5; i += 1)
      await user.click(screen.getByRole('button', { name: 'Direita' }));
    for (let i = 0; i < 4; i += 1) await user.click(screen.getByRole('button', { name: 'Baixo' }));
    expect(textoDaPosicao()).toBe('Posição: (5, 4)');

    await user.click(screen.getByRole('button', { name: 'Recomeçar' }));

    expect(posicaoDoPersonagem()).toEqual({ x: 0, y: 0 });
    expect(textoDaPosicao()).toBe('Posição: (0, 0)');
  });
});

describe('Montar a sequência (RF14)', () => {
  it('CT-SEQ-05: adiciona comandos ao fim da lista numerada', async () => {
    const user = userEvent.setup();
    render(<JogoPage />);

    expect(screen.getByText(/sequência está vazia/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Adicionar Direita' }));
    await user.click(screen.getByRole('button', { name: 'Adicionar Baixo' }));

    expect(itensDaSequencia()).toEqual(['Direita', 'Baixo']);
    const [primeiro, segundo] = screen.getAllByRole('listitem');
    expect(primeiro).toHaveTextContent('1.');
    expect(primeiro).toHaveTextContent('→');
    expect(segundo).toHaveTextContent('2.');
    // Adicionar não move o personagem
    expect(posicaoDoPersonagem()).toEqual({ x: 0, y: 0 });
  });

  it('CT-SEQ-06: remove um comando específico', async () => {
    const user = userEvent.setup();
    render(<JogoPage />);
    await user.click(screen.getByRole('button', { name: 'Adicionar Direita' }));
    await user.click(screen.getByRole('button', { name: 'Adicionar Baixo' }));
    await user.click(screen.getByRole('button', { name: 'Adicionar Esquerda' }));

    await user.click(screen.getByRole('button', { name: 'Remover comando 2 (Baixo)' }));

    expect(itensDaSequencia()).toEqual(['Direita', 'Esquerda']);
  });

  it('CT-SEQ-07: reordena com Subir e mantém o foco no item movido', async () => {
    const user = userEvent.setup();
    render(<JogoPage />);
    await user.click(screen.getByRole('button', { name: 'Adicionar Direita' }));
    await user.click(screen.getByRole('button', { name: 'Adicionar Baixo' }));

    await user.click(screen.getByRole('button', { name: 'Subir comando 2 (Baixo)' }));

    expect(itensDaSequencia()).toEqual(['Baixo', 'Direita']);
    // O item que subiu virou o 1º; "Subir" ficou desabilitado, então o foco vai para "Descer".
    expect(screen.getByRole('button', { name: 'Descer comando 1 (Baixo)' })).toHaveFocus();
  });

  it('reordena pelo teclado com Descer', async () => {
    const user = userEvent.setup();
    render(<JogoPage />);
    await user.click(screen.getByRole('button', { name: 'Adicionar Cima' }));
    await user.click(screen.getByRole('button', { name: 'Adicionar Esquerda' }));
    await user.click(screen.getByRole('button', { name: 'Adicionar Direita' }));

    screen.getByRole('button', { name: 'Descer comando 1 (Cima)' }).focus();
    await user.keyboard('{Enter}');

    expect(itensDaSequencia()).toEqual(['Esquerda', 'Cima', 'Direita']);
    expect(screen.getByRole('button', { name: 'Descer comando 2 (Cima)' })).toHaveFocus();
  });

  it('CT-SEQ-08: Limpar apaga a sequência e não move o personagem', async () => {
    const user = userEvent.setup();
    render(<JogoPage />);
    await user.click(screen.getByRole('button', { name: 'Direita' }));
    for (const nome of ['Direita', 'Baixo', 'Esquerda']) {
      await user.click(screen.getByRole('button', { name: `Adicionar ${nome}` }));
    }

    await user.click(screen.getByRole('button', { name: 'Limpar' }));

    expect(itensDaSequencia()).toEqual([]);
    expect(posicaoDoPersonagem()).toEqual({ x: 1, y: 0 });
  });

  it('CT-SEQ-03: com a sequência vazia, Executar e Limpar ficam desabilitados', () => {
    render(<JogoPage />);
    expect(screen.getByRole('button', { name: 'Executar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Limpar' })).toBeDisabled();
  });
});

describe('Executar a sequência (RF12)', () => {
  function montarSequencia(...nomes: string[]) {
    for (const nome of nomes) {
      fireEvent.click(screen.getByRole('button', { name: `Adicionar ${nome}` }));
    }
  }

  function avancar(ms: number) {
    act(() => {
      vi.advanceTimersByTime(ms);
    });
  }

  it('CT-SEQ-04: executa passo a passo, destaca o comando atual e bloqueia a edição', () => {
    vi.useFakeTimers();
    render(<JogoPage />);
    montarSequencia('Direita', 'Direita', 'Baixo');

    fireEvent.click(screen.getByRole('button', { name: 'Executar' }));

    const itens = () => screen.getAllByRole('listitem');
    expect(itens()[0]).toHaveAttribute('aria-current', 'step');
    expect(posicaoDoPersonagem()).toEqual({ x: 1, y: 0 });

    // Edição e movimento direto bloqueados durante a execução
    expect(screen.getByRole('button', { name: 'Adicionar Cima' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remover comando 1 (Direita)' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Limpar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Executando…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Direita' })).toBeDisabled();
    fireEvent.keyDown(document.body, { key: 'ArrowDown' });
    expect(posicaoDoPersonagem()).toEqual({ x: 1, y: 0 });

    avancar(600);
    expect(itens()[1]).toHaveAttribute('aria-current', 'step');
    expect(itens()[0]).not.toHaveAttribute('aria-current');
    expect(posicaoDoPersonagem()).toEqual({ x: 2, y: 0 });

    avancar(600);
    expect(itens()[2]).toHaveAttribute('aria-current', 'step');
    expect(posicaoDoPersonagem()).toEqual({ x: 2, y: 1 });

    avancar(600);
    expect(screen.queryByRole('listitem', { current: 'step' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Adicionar Cima' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Executar' })).toBeEnabled();
    expect(textoDaPosicao()).toBe('Posição: (2, 1)');
    expect(screen.getByRole('status')).toHaveTextContent('Sequência concluída');
  });

  it('parte da posição atual do personagem', () => {
    vi.useFakeTimers();
    render(<JogoPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Baixo' }));
    montarSequencia('Direita');

    fireEvent.click(screen.getByRole('button', { name: 'Executar' }));

    expect(posicaoDoPersonagem()).toEqual({ x: 1, y: 1 });
  });

  it('CT-SEQ-02 na interface: o comando que bate na borda é ignorado e a execução continua', () => {
    vi.useFakeTimers();
    render(<JogoPage />);
    montarSequencia('Cima', 'Direita');

    fireEvent.click(screen.getByRole('button', { name: 'Executar' }));
    expect(posicaoDoPersonagem()).toEqual({ x: 0, y: 0 });
    expect(screen.getByRole('status')).toHaveTextContent('não pode sair da área');

    avancar(600);
    expect(posicaoDoPersonagem()).toEqual({ x: 1, y: 0 });
  });

  it('CT-UI-05: Recomeçar interrompe a execução e mantém a sequência', () => {
    vi.useFakeTimers();
    render(<JogoPage />);
    montarSequencia('Direita', 'Direita', 'Direita');

    fireEvent.click(screen.getByRole('button', { name: 'Executar' }));
    avancar(600);
    expect(posicaoDoPersonagem()).toEqual({ x: 2, y: 0 });

    fireEvent.click(screen.getByRole('button', { name: 'Recomeçar' }));
    expect(posicaoDoPersonagem()).toEqual({ x: 0, y: 0 });

    avancar(5000);
    expect(posicaoDoPersonagem()).toEqual({ x: 0, y: 0 });
    expect(itensDaSequencia()).toEqual(['Direita', 'Direita', 'Direita']);
    expect(screen.getByRole('button', { name: 'Executar' })).toBeEnabled();
  });

  it('respeita a velocidade escolhida', async () => {
    vi.useFakeTimers();
    render(<JogoPage />);
    montarSequencia('Direita', 'Direita');
    fireEvent.change(screen.getByRole('combobox', { name: 'Velocidade' }), {
      target: { value: 'devagar' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Executar' }));
    avancar(600);
    expect(posicaoDoPersonagem()).toEqual({ x: 1, y: 0 });
    avancar(400);
    expect(posicaoDoPersonagem()).toEqual({ x: 2, y: 0 });
  });
});
