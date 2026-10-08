import { Question } from '../types';

export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildWritingPhrases(): string[] {
  return [
    'O arco-íris foge de mim.',
    'A nuvem abraça a montanha.',
    'O vento visita a floresta.',
    'A estrela observa o lago.',
    'O relógio esquece o tempo.',
    'A sombra segue o viajante.',
    'A chuva desperta a cidade.',
    'O espelho guarda segredos.',
    'A ponte desafia o rio.',
    'O silêncio percorre o vale.',
    'A folha encontra o vento.',
    'O sol desperta a colina.',
    'A lua acompanha o oceano.',
    'O pássaro atravessa a neblina.',
    'A brisa dança entre as árvores.',
    'O caminho espera por passos.',
    'A janela contempla o horizonte.',
    'O farol ilumina a tempestade.',
    'A pedra escuta o riacho.',
    'O jardim recebe a primavera.',
    'A chama vence a escuridão.',
    'O rio desenha a planície.',
    'A areia cobre as pegadas.',
    'O céu acolhe as nuvens.',
    'A borboleta visita as flores.',
    'O bosque esconde mistérios.',
    'A montanha desafia o horizonte.',
    'O livro desperta memórias.',
    'A estrada encontra o destino.',
    'O inverno silencia o campo.',
    'A aurora colore o céu.',
    'O riacho acompanha a trilha.',
    'A tempestade desperta o mar.',
    'O cristal reflete a luz.',
    'A fumaça sobe lentamente.',
    'O barco enfrenta as ondas.',
    'A estrela guia o viajante.',
    'A névoa cobre o bosque.',
    'O trovão anuncia a chuva.',
    'A semente espera pela primavera.',
    'O bambu resiste ao vento.',
    'A cachoeira vence as pedras.',
    'O deserto guarda silêncio.',
    'A bússola procura o norte.',
    'O galho sustenta o ninho.',
    'A concha esconde o mar.',
    'O cometa cruza o infinito.',
    'A lanterna rompe a escuridão.',
    'O horizonte encontra o amanhecer.',
    'A melodia atravessa o silêncio.',
  ];
}

function buildAnswerColumn(questions: Question[], startIndex: number, endIndex: number, maxOptions: number): string {
  let header = '<div class="answer-row answer-header">';
  header += '<span class="anum">Nº</span>';
  for (let i = 0; i < maxOptions; i++) {
    const l = String.fromCharCode(65 + i);
    header += `<span class="alabel">${l}</span>`;
  }
  header += '</div>';

  let rows = '';
  for (let i = startIndex; i < endIndex; i++) {
    rows += '<div class="answer-row">';
    rows += `<span class="anum">${String(i + 1).padStart(2, '0')}</span>`;
    for (let j = 0; j < maxOptions; j++) {
      rows += '<span class="acircle"></span>';
    }
    rows += '</div>';
  }
  return `<div class="answer-col">${header}${rows}</div>`;
}

export function buildAnswerTable(totalQuestions: number, questions: Question[]): string {
  const maxOptions = questions.reduce((max, q) => Math.max(max, q.options.length), 4);
  const cols = totalQuestions > 30 ? 4 : totalQuestions > 20 ? 3 : totalQuestions > 10 ? 2 : 1;
  const perCol = Math.ceil(totalQuestions / cols);
  let html = '<div class="answer-grid">';
  for (let c = 0; c < cols; c++) {
    const start = c * perCol;
    const end = Math.min(start + perCol, totalQuestions);
    if (start < totalQuestions) {
      html += buildAnswerColumn(questions, start, end, maxOptions);
    }
  }
  html += '</div>';
  return html;
}

export function buildReviewAnswerSheet(questions: Question[]): { headerHtml: string; rowsHtml: string } {
  const totalQuestions = questions.length;
  const itemsPerRow = totalQuestions <= 5 ? totalQuestions : totalQuestions <= 10 ? totalQuestions : 10;
  const rowCount = Math.ceil(totalQuestions / itemsPerRow);

  let headerHtml = '<tr>';
  for (let itemIndex = 0; itemIndex < itemsPerRow; itemIndex++) {
    headerHtml += '<th class="rnum">Nº</th><th class="rans">Resp</th>';
    if (itemIndex < itemsPerRow - 1) headerHtml += '<th class="rgap"></th>';
  }
  headerHtml += '</tr>';

  let rowsHtml = '';
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    rowsHtml += '<tr>';
    for (let itemIndex = 0; itemIndex < itemsPerRow; itemIndex++) {
      const questionIndex = rowIndex * itemsPerRow + itemIndex;
      if (questionIndex < totalQuestions) {
        const letter = String.fromCharCode(65 + questions[questionIndex].correct);
        rowsHtml += `<td class="rnum">${questionIndex + 1}</td><td class="rans">${letter}</td>`;
      } else {
        rowsHtml += '<td></td><td></td>';
      }
      if (itemIndex < itemsPerRow - 1) rowsHtml += '<td class="rgap"></td>';
    }
    rowsHtml += '</tr>';
  }

  return { headerHtml, rowsHtml };
}
