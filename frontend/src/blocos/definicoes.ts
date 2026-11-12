import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import * as Pt from 'blockly/msg/pt-br';
import type { Fase, Sensor, TipoBloco } from '@arrowbot/shared/engine';

Blockly.setLocale(Pt as unknown as Record<string, string>);

export const ROTULO_SENSOR: Record<Sensor, string> = {
  obstaculoAFrente: 'obstáculo à frente',
  buracoAFrente: 'buraco à frente',
  caminhoLivre: 'caminho livre',
  metaAFrente: 'meta à frente',
};

const COR = { movimento: 210, controle: 35, logica: 290, inicio: 120 };

/** Sensores liberados na fase aberta (as opções do dropdown dependem dela). */
let sensoresAtivos: Sensor[] = ['obstaculoAFrente'];

function opcoesCondicao(): [string, string][] {
  const opcoes: [string, string][] = [];
  for (const s of sensoresAtivos) {
    opcoes.push([ROTULO_SENSOR[s], s], [`não ${ROTULO_SENSOR[s]}`, `!${s}`]);
  }
  return opcoes;
}

let registrado = false;

function registrarBlocos(): void {
  if (registrado) return;
  registrado = true;
  Blockly.common.defineBlocksWithJsonArray([
    {
      type: 'arrow_inicio',
      message0: 'quando executar',
      nextStatement: null,
      colour: COR.inicio,
      tooltip: 'O programa começa aqui.',
    },
    {
      type: 'arrow_avancar',
      message0: 'avançar',
      previousStatement: null,
      nextStatement: null,
      colour: COR.movimento,
      tooltip: 'Anda uma casa para a frente.',
    },
    {
      type: 'arrow_girar',
      message0: 'girar para %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'LADO',
          options: [
            ['direita ↻', 'direita'],
            ['esquerda ↺', 'esquerda'],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COR.movimento,
      tooltip: 'Gira o robô sem sair do lugar.',
    },
    {
      type: 'arrow_repetir',
      message0: 'repetir %1 vezes',
      args0: [{ type: 'field_number', name: 'VEZES', value: 2, min: 1, max: 99, precision: 1 }],
      message1: '%1',
      args1: [{ type: 'input_statement', name: 'CORPO' }],
      previousStatement: null,
      nextStatement: null,
      colour: COR.controle,
      tooltip: 'Repete os blocos de dentro.',
    },
  ]);

  Blockly.Blocks['arrow_enquanto'] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('enquanto')
        .appendField(new Blockly.FieldDropdown(opcoesCondicao), 'COND');
      this.appendStatementInput('CORPO');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(COR.controle);
      this.setTooltip('Repete enquanto a condição for verdadeira.');
    },
  };

  Blockly.Blocks['arrow_se'] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('se')
        .appendField(new Blockly.FieldDropdown(opcoesCondicao), 'COND');
      this.appendStatementInput('ENTAO').appendField('então');
      this.appendStatementInput('SENAO').appendField('senão');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(COR.logica);
      this.setTooltip('Decide o que fazer conforme o sensor.');
    },
  };
}

const TIPO_BLOCKLY: Record<TipoBloco, string> = {
  avancar: 'arrow_avancar',
  girar: 'arrow_girar',
  repetir: 'arrow_repetir',
  enquanto: 'arrow_enquanto',
  se: 'arrow_se',
};

/** Monta a caixa de ferramentas só com o que a fase libera. */
export function caixaDeFerramentas(fase: Fase) {
  return {
    kind: 'flyoutToolbox',
    contents: fase.blocosPermitidos.map((t) => ({ kind: 'block', type: TIPO_BLOCKLY[t] })),
  };
}

export function criarOficina(elemento: HTMLElement, fase: Fase): Blockly.WorkspaceSvg {
  registrarBlocos();
  sensoresAtivos =
    fase.sensoresPermitidos.length > 0 ? fase.sensoresPermitidos : ['obstaculoAFrente'];
  const ws = Blockly.inject(elemento, {
    toolbox: caixaDeFerramentas(fase),
    trashcan: true,
    scrollbars: true,
    sounds: false,
    move: { scrollbars: true, drag: true, wheel: true },
    zoom: { controls: true, startScale: 0.9, minScale: 0.5, maxScale: 1.6 },
    media: '/blockly-media/',
    renderer: 'zelos',
  });
  // O Blockly põe aria-label num div sem papel (proibido pelo WCAG): dá a ele um papel.
  elemento.querySelector('.injectionDiv')?.setAttribute('role', 'group');
  Blockly.serialization.workspaces.load(
    {
      blocks: {
        languageVersion: 0,
        blocks: [{ type: 'arrow_inicio', id: 'inicio', x: 24, y: 24, deletable: false }],
      },
    },
    ws,
  );
  return ws;
}

export { Blockly };
