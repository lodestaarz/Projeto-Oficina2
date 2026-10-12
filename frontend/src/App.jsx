import { useCallback, useEffect, useState } from 'react';
import { KEY_TO_DIRECTION, move } from './game/movement.js';

const AREA = { columns: 8, rows: 8 };

const BUTTONS = [
  { direction: 'up', label: '↑', name: 'Cima' },
  { direction: 'left', label: '←', name: 'Esquerda' },
  { direction: 'down', label: '↓', name: 'Baixo' },
  { direction: 'right', label: '→', name: 'Direita' },
];

export default function App() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMove = useCallback((direction) => {
    setPosition((current) => move(current, direction, AREA));
  }, []);

  useEffect(() => {
    function onKeyDown(event) {
      const direction = KEY_TO_DIRECTION[event.key];
      if (!direction) return;
      event.preventDefault();
      handleMove(direction);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleMove]);

  const cells = [];
  for (let y = 0; y < AREA.rows; y += 1) {
    for (let x = 0; x < AREA.columns; x += 1) {
      const hasCharacter = position.x === x && position.y === y;
      cells.push(
        <div key={`${x}-${y}`} className="cell">
          {hasCharacter && <span className="character" aria-label="Personagem" />}
        </div>,
      );
    }
  }

  return (
    <main className="app">
      <h1>Lógica Lúdica</h1>
      <p>Use os botões ou as setas do teclado para mover o personagem.</p>

      <div
        className="board"
        style={{ gridTemplateColumns: `repeat(${AREA.columns}, 1fr)` }}
        role="grid"
        aria-label="Área de movimentação"
      >
        {cells}
      </div>

      <div className="controls">
        {BUTTONS.map(({ direction, label, name }) => (
          <button
            key={direction}
            type="button"
            className={`control control-${direction}`}
            onClick={() => handleMove(direction)}
            aria-label={name}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="position">
        Posição: ({position.x}, {position.y})
      </p>
    </main>
  );
}
