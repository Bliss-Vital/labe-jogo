/*
 * bancada.js — a mesa do laboratório: protoboard interativa, fonte de 5 V e multímetro.
 * Desenha tudo num <svg> e usa o Simulador para saber o que acende (ou queima!).
 */
const Bancada = (() => {
  'use strict';

  // ---------------------------------------------------------------- geometria da placa
  const P = 26;                 // distância entre furos
  const COLS = 24;
  const PAD = 20;
  const BX = 196, BY = 16;      // canto da protoboard (a fonte fica à esquerda)
  const LINHAS = 'abcdefghij';
  const xCol = c => BX + PAD + P / 2 + c * P;
  const Y_A = BY + 90;
  const yLinha = l => (l < 5 ? Y_A + l * P : Y_A + 4 * P + 50 + (l - 5) * P);
  const TRILHAS = {
    tp: { y: BY + 26, no: 'TP', sinal: '+' },
    tn: { y: BY + 26 + P, no: 'TN', sinal: '−' },
    bp: { y: yLinha(9) + P + 12, no: 'BP', sinal: '+' },
    bn: { y: yLinha(9) + 2 * P + 12, no: 'BN', sinal: '−' },
  };
  const LARG = COLS * P + PAD * 2;
  const ALT = TRILHAS.bn.y + 26 - BY;
  const W = BX + LARG + 200;
  const H = BY + ALT + 16;
  const MM_X = BX + LARG + 24;  // multímetro

  const furos = new Map();
  for (let c = 0; c < COLS; c++) {
    for (let l = 0; l < 10; l++) {
      const id = LINHAS[l] + (c + 1);
      furos.set(id, { id, x: xCol(c), y: yLinha(l), no: (l < 5 ? 'S' : 'I') + (c + 1), coluna: c + 1, metade: l < 5 ? 'a–e' : 'f–j' });
    }
    if (c % 6 !== 5) {
      for (const [t, info] of Object.entries(TRILHAS)) {
        const id = t + (c + 1);
        furos.set(id, { id, x: xCol(c), y: info.y, no: info.no, trilha: t });
      }
    }
  }
  const noBase = id => furos.get(id).no;
  const grupos = new Map();
  for (const f of furos.values()) {
    if (!grupos.has(f.no)) grupos.set(f.no, []);
    grupos.get(f.no).push(f);
  }

  const CORES_FIO = [
    { nome: 'vermelho', hex: '#e63946' }, { nome: 'preto', hex: '#26262b' }, { nome: 'amarelo', hex: '#f4c430' },
    { nome: 'verde', hex: '#2a9d8f' }, { nome: 'azul', hex: '#3a86ff' }, { nome: 'laranja', hex: '#f77f00' },
  ];

  // ---------------------------------------------------------------- estado
  let svg, camadas, el = {};
  let config = null;
  let pecas = [];
  let sondas = { v: null, p: null };
  let ligada = false;
  let resultado = null;
  let ferramenta = null;      // { tipo, valor?, cor?, qual? }
  let ferramentas = [];
  let primeiro = null;        // primeiro furo escolhido
  let selecionada = null;     // id da peça ou 'sonda-v'/'sonda-p'
  let hover = null;
  let historico = [];
  let contador = 0;
  const recemQueimados = new Set();
  const som = nome => { if (typeof Som !== 'undefined') Som.tocar(nome); };

  // ---------------------------------------------------------------- utilidades
  function escurecer(hex, f = 0.65) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.round((n >> 16) * f), g = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f);
    return `rgb(${r},${g},${b})`;
  }
  function fmtCorrente(i) {
    const a = Math.abs(i);
    if (a < 1e-5) return '0.00 mA';
    if (a < 1) return `${(i * 1000).toFixed(a < 0.01 ? 2 : 1)} mA`;
    return `${i.toFixed(2)} A`;
  }
  const ocupado = id => pecas.some(p => p.a === id || p.b === id);
  function nomePeca(p) {
    if (p.tipo === 'resistor') return `O resistor de ${Arte.ohms(p.valor)}`;
    if (p.tipo === 'led') return `O LED ${p.cor}`;
    return 'O fio';
  }
  function descreverFuro(f) {
    if (f.trilha) {
      const t = TRILHAS[f.trilha];
      return `Trilha ${t.sinal}: todos os furos desta linha estão ligados ao ${t.sinal === '+' ? 'positivo (+)' : 'negativo (−)'} da fonte.`;
    }
    return `Coluna ${f.coluna} (${f.metade}): estes 5 furos estão ligados entre si por dentro da placa.`;
  }

  // ---------------------------------------------------------------- desenho fixo
  function desenharPlaca() {
    let s = `<rect x="${BX}" y="${BY}" width="${LARG}" height="${ALT}" rx="10" fill="#f3f2ee" stroke="#d8d6cf" stroke-width="2"/>`;
    const c1 = yLinha(4) + P / 2 + 4, c2 = yLinha(5) - P / 2 - 4;
    s += `<rect x="${BX + 6}" y="${c1}" width="${LARG - 12}" height="${c2 - c1}" rx="4" fill="#e2e0d9"/>`;
    for (const [t, info] of Object.entries(TRILHAS)) {
      const cor = info.sinal === '+' ? '#e05555' : '#4f7fe0';
      const yl = t === 'tp' || t === 'bp' ? info.y - 12 : info.y + 12;
      s += `<path d="M${BX + 12} ${yl} H${BX + LARG - 12}" stroke="${cor}" stroke-width="2"/>`;
      s += `<text x="${BX + LARG - 8}" y="${info.y + 4}" font-size="13" font-weight="800" fill="${cor}" text-anchor="end">${info.sinal}</text>`;
    }
    for (let c = 0; c < COLS; c++) {
      s += `<text x="${xCol(c)}" y="${Y_A - 14}" font-size="9" fill="#9a978e" text-anchor="middle">${c + 1}</text>`;
      s += `<text x="${xCol(c)}" y="${yLinha(9) + 20}" font-size="9" fill="#9a978e" text-anchor="middle">${c + 1}</text>`;
    }
    for (let l = 0; l < 10; l++) s += `<text x="${BX + 12}" y="${yLinha(l) + 3.5}" font-size="10" fill="#9a978e" text-anchor="middle">${LINHAS[l]}</text>`;
    for (const f of furos.values()) s += `<rect x="${f.x - 4.5}" y="${f.y - 4.5}" width="9" height="9" rx="2" fill="#3b3b3b"/>`;
    return s;
  }

  function desenharFonte() {
    const curto = resultado && resultado.curto;
    const vTxt = !ligada ? '-.-- V' : curto ? 'CURTO!' : `${Simulador.FONTE_V.toFixed(2)} V`;
    const iTxt = ligada && !curto && resultado ? fmtCorrente(resultado.correnteFonte) : '';
    const corV = !ligada ? '#2b3d33' : curto ? '#ff5b5b' : '#69f0a5';
    const pos = { x: 118, y: 286 }, neg = { x: 154, y: 286 };
    let s = `
      <text x="94" y="128" font-size="13" font-weight="800" fill="#cfc8da" text-anchor="middle" letter-spacing="1">FONTE 5 V</text>
      <rect x="14" y="140" width="162" height="190" rx="12" fill="#26252c" stroke="#45434f" stroke-width="2"/>
      <rect x="28" y="156" width="134" height="76" rx="6" fill="#0c1410"/>
      <text x="154" y="190" font-size="20" font-family="ui-monospace,Consolas,monospace" font-weight="700" fill="${corV}" text-anchor="end" class="${curto ? 'curto-pisca' : ''}">${vTxt}</text>
      <text x="150" y="220" font-size="17" font-family="ui-monospace,Consolas,monospace" fill="#69f0a5" text-anchor="end">${iTxt}</text>
      <g id="fonte-botao" style="cursor:pointer">
        <rect x="26" y="262" width="62" height="40" rx="9" fill="${ligada ? '#2fbf71' : '#5a5866'}" stroke="${ligada ? '#7ff0b0' : '#77758a'}" stroke-width="2"/>
        <text x="57" y="287" font-size="13" font-weight="800" fill="#fff" text-anchor="middle">${ligada ? 'LIGADA' : 'LIGAR'}</text>
      </g>
      <text x="${pos.x}" y="266" font-size="16" font-weight="800" fill="#ff8a8a" text-anchor="middle">+</text>
      <text x="${neg.x}" y="266" font-size="16" font-weight="800" fill="#aab" text-anchor="middle">−</text>
      <circle cx="${pos.x}" cy="${pos.y}" r="11" fill="#d62828" stroke="#8b1414" stroke-width="2"/>
      <circle cx="${neg.x}" cy="${neg.y}" r="11" fill="#151515" stroke="#555" stroke-width="2"/>`;
    // fios fixos da fonte até as trilhas
    const ponta = (t) => ({ x: BX + 10, y: TRILHAS[t].y });
    const fio = (de, ate, cor) => `<path d="M${de.x} ${de.y} C ${de.x + 30} ${de.y + (ate.y < de.y ? -60 : 60)}, ${ate.x - 50} ${ate.y}, ${ate.x} ${ate.y}" stroke="${cor}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    s += fio(pos, ponta('tp'), '#e63946') + fio(pos, ponta('bp'), '#e63946');
    s += fio(neg, ponta('tn'), '#26262b') + fio(neg, ponta('bn'), '#26262b');
    for (const t of Object.keys(TRILHAS)) s += `<rect x="${BX + 6}" y="${TRILHAS[t].y - 4}" width="8" height="8" rx="2" fill="#b8bcc2"/>`;
    camadas.fonte.innerHTML = s;
  }

  // ---------------------------------------------------------------- peças
  function caminhoFio(A, B) {
    const dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 1;
    const curva = Math.min(36, 8 + d * 0.18);
    let nx = -dy / d, ny = dx / d;
    if (ny > 0 || (ny === 0 && nx > 0)) { nx = -nx; ny = -ny; }
    return `M${A.x} ${A.y} Q${(A.x + B.x) / 2 + nx * curva} ${(A.y + B.y) / 2 + ny * curva} ${B.x} ${B.y}`;
  }

  function desenharFio(p, A, B, extra = '') {
    const d = caminhoFio(A, B);
    return `<g class="peca fio${extra}" data-peca="${p.id}">
      <path d="${d}" stroke="rgba(0,0,0,.22)" stroke-width="7" fill="none" stroke-linecap="round" transform="translate(1.5 2.5)"/>
      <path d="${d}" stroke="${escurecer(p.cor)}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="${d}" stroke="${p.cor}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="${d}" stroke="transparent" stroke-width="16" fill="none"/>
      <circle cx="${A.x}" cy="${A.y}" r="3.4" fill="#b8bcc2"/><circle cx="${B.x}" cy="${B.y}" r="3.4" fill="#b8bcc2"/>
    </g>`;
  }

  function geometria(A, B) {
    return {
      mx: (A.x + B.x) / 2, my: (A.y + B.y) / 2,
      ang: Math.atan2(B.y - A.y, B.x - A.x) * 180 / Math.PI,
      d: Math.hypot(B.x - A.x, B.y - A.y),
    };
  }

  function desenharResistor(p, A, B, extra = '') {
    const { mx, my, ang, d } = geometria(A, B);
    const L = Math.min(42, Math.max(16, d - 10));
    return `<g class="peca resistor${extra}" data-peca="${p.id}">
      <line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" stroke="#a7adb4" stroke-width="2.6" stroke-linecap="round"/>
      <g transform="translate(${mx} ${my}) rotate(${ang})">${Arte.resistorSVG(Arte.faixasDoValor(p.valor), { L, h: 13 })}</g>
      <line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" stroke="transparent" stroke-width="18"/>
      <circle cx="${A.x}" cy="${A.y}" r="2.6" fill="#8e949b"/><circle cx="${B.x}" cy="${B.y}" r="2.6" fill="#8e949b"/>
    </g>`;
  }

  function desenharLed(p, A, B, info, extra = '') {
    const { mx, my, ang } = geometria(A, B);
    const cor = Arte.COR_LED[p.cor];
    const brilho = info && !p.queimado ? info.brilho : 0;
    const corpo = p.queimado ? '#5a5a5a' : cor;
    let s = `<g class="peca led${extra}" data-peca="${p.id}">
      <path d="M${A.x} ${A.y} L${(A.x + mx) / 2} ${(A.y + my) / 2 - 3} L${mx} ${my}" stroke="#a7adb4" stroke-width="2.6" fill="none" stroke-linejoin="round"/>
      <line x1="${B.x}" y1="${B.y}" x2="${mx}" y2="${my}" stroke="#a7adb4" stroke-width="2.6"/>`;
    if (brilho > 0.02) {
      s += `<circle cx="${mx}" cy="${my}" r="${16 + 26 * brilho}" fill="url(#brilho-${p.cor})" opacity="${(0.35 + 0.65 * brilho).toFixed(2)}"/>`;
    }
    s += `<g transform="translate(${mx} ${my}) rotate(${ang})">
        <path d="M8.5 -6.16 A10.5 10.5 0 1 0 8.5 6.16 Z" fill="${p.queimado ? '#3d3d3d' : escurecer(cor, 0.8)}"/>
        <circle r="8" fill="${corpo}" opacity="${p.queimado ? 1 : brilho > 0.02 ? 1 : 0.62}"/>
        ${brilho > 0.02 ? `<circle r="${3 + 3 * brilho}" fill="#fff" opacity="${(0.4 + 0.5 * brilho).toFixed(2)}"/>` : ''}
        <circle cx="-2.6" cy="-2.6" r="2.4" fill="#fff" opacity=".6"/>
        ${p.queimado ? '<path d="M-5 -3 L-1 1 L-3 4 M2 -5 L4 -1 L1 3" stroke="#111" stroke-width="1.6" fill="none"/>' : ''}
      </g>
      <text x="${A.x - 8}" y="${A.y - 7}" font-size="11" font-weight="900" fill="#d62828" text-anchor="middle">+</text>
      <circle cx="${mx}" cy="${my}" r="13" fill="transparent"/>
      <line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" stroke="transparent" stroke-width="14"/>`;
    if (recemQueimados.has(p.id)) {
      s += `<g class="fumaca"><circle cx="${mx}" cy="${my - 6}" r="6" fill="#9a9a9a"/><circle cx="${mx + 5}" cy="${my - 10}" r="5" fill="#b5b5b5"/><circle cx="${mx - 4}" cy="${my - 12}" r="4" fill="#c9c9c9"/></g>`;
    }
    return s + '</g>';
  }

  function desenharPecas() {
    const infoLed = new Map();
    if (resultado) for (const l of resultado.leds) infoLed.set(l.peca.id, l);
    const ordem = { fio: 0, resistor: 1, led: 2 };
    let s = '';
    for (const p of [...pecas].sort((a, b) => ordem[a.tipo] - ordem[b.tipo])) {
      const A = furos.get(p.a), B = furos.get(p.b);
      const extra = selecionada === p.id ? ' selecionada' : '';
      if (p.tipo === 'fio') s += desenharFio(p, A, B, extra);
      else if (p.tipo === 'resistor') s += desenharResistor(p, A, B, extra);
      else s += desenharLed(p, A, B, infoLed.get(p.id), extra);
    }
    camadas.pecas.innerHTML = s;
  }

  // ---------------------------------------------------------------- multímetro
  function leituraMultimetro() {
    if (!sondas.v || !sondas.p) return null;
    if (!resultado || resultado.curto) return 0;
    return resultado.tensao(sondas.v) - resultado.tensao(sondas.p);
  }

  function desenharMultimetro() {
    if (!config || !config.gaveta.multimetro) { camadas.multimetro.innerHTML = ''; camadas.sondas.innerHTML = ''; return; }
    const X = MM_X, Y0 = 96;
    const leitura = leituraMultimetro();
    const txt = leitura === null ? '- - -' : (Math.abs(leitura) < 0.005 ? '0.00' : leitura.toFixed(2));
    const com = { x: X + 52, y: Y0 + 252 }, vo = { x: X + 112, y: Y0 + 252 };
    camadas.multimetro.innerHTML = `
      <text x="${X + 82}" y="${Y0 - 10}" font-size="13" font-weight="800" fill="#cfc8da" text-anchor="middle" letter-spacing="1">MULTÍMETRO</text>
      <rect x="${X}" y="${Y0}" width="164" height="286" rx="22" fill="#f07a2a"/>
      <rect x="${X + 12}" y="${Y0 + 12}" width="140" height="262" rx="15" fill="#3a3a42"/>
      <rect x="${X + 22}" y="${Y0 + 24}" width="120" height="58" rx="6" fill="#cfe0c8"/>
      <text x="${X + 116}" y="${Y0 + 66}" font-size="30" font-family="ui-monospace,Consolas,monospace" font-weight="700" fill="#1f2a1c" text-anchor="end">${txt}</text>
      <text x="${X + 136}" y="${Y0 + 66}" font-size="15" font-weight="800" fill="#1f2a1c" text-anchor="end">V</text>
      <circle cx="${X + 82}" cy="${Y0 + 160}" r="36" fill="#5a5a64" stroke="#2b2b31" stroke-width="4"/>
      <path d="M${X + 82} ${Y0 + 160} L${X + 56} ${Y0 + 134}" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
      <text x="${X + 44}" y="${Y0 + 120}" font-size="16" font-weight="800" fill="#ffd23f" text-anchor="middle">V⎓</text>
      <text x="${X + 128}" y="${Y0 + 120}" font-size="14" fill="#ccc" text-anchor="middle">Ω</text>
      <text x="${X + 82}" y="${Y0 + 216}" font-size="12" fill="#ccc" text-anchor="middle">A</text>
      <circle cx="${com.x}" cy="${com.y}" r="10" fill="#111" stroke="#777" stroke-width="2"/>
      <circle cx="${vo.x}" cy="${vo.y}" r="10" fill="#d62828"/>
      <text x="${com.x}" y="${com.y + 25}" font-size="11" font-weight="800" fill="#fff" text-anchor="middle">COM</text>
      <text x="${vo.x}" y="${vo.y + 25}" font-size="11" font-weight="800" fill="#fff" text-anchor="middle">VΩ</text>`;

    let s = '';
    for (const [qual, jack, cor, repouso] of [['p', com, '#1a1a1a', { x: X + 30, y: H - 22 }], ['v', vo, '#d62828', { x: X + 134, y: H - 22 }]]) {
      const furo = sondas[qual] && furos.get(sondas[qual]);
      const sel = selecionada === 'sonda-' + qual ? ' selecionada' : '';
      if (furo) {
        const cabo = { x: furo.x + 16, y: furo.y - 22 };
        s += `<g class="sonda${sel}" data-sonda="${qual}">
          <path d="M${jack.x} ${jack.y} C ${jack.x} ${jack.y + 70}, ${cabo.x + 60} ${cabo.y - 80}, ${cabo.x} ${cabo.y}" stroke="${cor}" stroke-width="4" fill="none"/>
          <line x1="${cabo.x}" y1="${cabo.y}" x2="${furo.x + 3}" y2="${furo.y - 4}" stroke="${cor}" stroke-width="8" stroke-linecap="round"/>
          <line x1="${furo.x + 3}" y1="${furo.y - 4}" x2="${furo.x}" y2="${furo.y}" stroke="#d9dde2" stroke-width="3" stroke-linecap="round"/>
          <circle cx="${furo.x}" cy="${furo.y}" r="12" fill="transparent"/>
        </g>`;
      } else {
        s += `<path d="M${jack.x} ${jack.y} Q ${jack.x} ${repouso.y} ${repouso.x} ${repouso.y - 4}" stroke="${cor}" stroke-width="4" fill="none"/>
          <line x1="${repouso.x}" y1="${repouso.y - 4}" x2="${repouso.x + (qual === 'v' ? 18 : -18)}" y2="${repouso.y - 4}" stroke="${cor}" stroke-width="8" stroke-linecap="round"/>`;
      }
    }
    camadas.sondas.innerHTML = s;
  }

  // ---------------------------------------------------------------- destaque e prévia
  function desenharDestaque() {
    if (!hover) { camadas.destaque.innerHTML = ''; return; }
    const g = grupos.get(hover.no);
    const xs = g.map(f => f.x), ys = g.map(f => f.y);
    const x1 = Math.min(...xs) - 10, x2 = Math.max(...xs) + 10, y1 = Math.min(...ys) - 10, y2 = Math.max(...ys) + 10;
    camadas.destaque.innerHTML = `<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" rx="10" fill="#2fbf71" opacity=".22"/>
      <rect x="${hover.x - 8}" y="${hover.y - 8}" width="16" height="16" rx="4" fill="none" stroke="#1f9d5c" stroke-width="2.5"/>`;
  }

  function desenharPrevia() {
    if (!ferramenta || !primeiro) { camadas.previa.innerHTML = ''; return; }
    const A = furos.get(primeiro);
    let s = `<circle cx="${A.x}" cy="${A.y}" r="8" fill="none" stroke="#ff6ec7" stroke-width="3"/>`;
    if (hover && hover.id !== primeiro) {
      const p = { id: 'previa', tipo: ferramenta.tipo, a: primeiro, b: hover.id, valor: ferramenta.valor, cor: ferramenta.cor };
      s += `<g opacity=".55" style="pointer-events:none">${p.tipo === 'fio' ? desenharFio(p, A, hover) : p.tipo === 'resistor' ? desenharResistor(p, A, hover) : desenharLed(p, A, hover, null)}</g>`;
    }
    camadas.previa.innerHTML = s;
  }

  function desenharTudo() {
    desenharFonte();
    desenharPecas();
    desenharMultimetro();
    desenharDestaque();
    desenharPrevia();
    atualizarControles();
  }

  // ---------------------------------------------------------------- gaveta e controles
  function miniResistor(v) {
    return `<svg viewBox="-24 -8 48 16"><path d="M-24 0 H24" stroke="#a7adb4" stroke-width="2"/>${Arte.resistorSVG(Arte.faixasDoValor(v), { L: 32, h: 12 })}</svg>`;
  }
  function miniLed(cor) {
    return `<svg viewBox="-24 -12 48 24"><path d="M-20 0 H20" stroke="#a7adb4" stroke-width="2"/><circle r="9" fill="${Arte.COR_LED[cor]}"/><circle cx="-3" cy="-3" r="2.5" fill="#fff" opacity=".6"/></svg>`;
  }
  function miniSonda(cor) {
    return `<svg viewBox="-24 -8 48 16"><path d="M-22 0 H10" stroke="${cor}" stroke-width="7" stroke-linecap="round"/><path d="M10 0 H22" stroke="#d9dde2" stroke-width="3" stroke-linecap="round"/></svg>`;
  }

  function montarGaveta() {
    const g = config.gaveta;
    ferramentas = [];
    const grupo = (titulo, itens) => `<div class="gaveta-grupo"><span>${titulo}</span><div class="gaveta-itens">${itens.join('')}</div></div>`;
    const item = (ferr, icone, rotulo) => {
      ferramentas.push(ferr);
      return `<button type="button" class="item-gaveta" data-i="${ferramentas.length - 1}" title="${rotulo}">${icone}<span>${rotulo}</span></button>`;
    };
    let html = '';
    if (g.resistores && g.resistores.length) html += grupo('Resistores', g.resistores.map(v => item({ tipo: 'resistor', valor: v }, miniResistor(v), Arte.ohms(v))));
    if (g.leds && g.leds.length) html += grupo('LEDs', g.leds.map(c => item({ tipo: 'led', cor: c }, miniLed(c), c)));
    if (g.fios) html += grupo('Fios (jumpers)', CORES_FIO.map(c => item({ tipo: 'fio', cor: c.hex }, `<span class="amostra-fio" style="--cor:${c.hex}"></span>`, c.nome)));
    if (g.multimetro) html += grupo('Pontas do multímetro', [item({ tipo: 'sonda', qual: 'v' }, miniSonda('#d62828'), 'vermelha (VΩ)'), item({ tipo: 'sonda', qual: 'p' }, miniSonda('#1a1a1a'), 'preta (COM)')]);
    el.gaveta.innerHTML = html;
  }

  function atualizarControles() {
    el.gaveta.querySelectorAll('.item-gaveta').forEach(b => {
      b.classList.toggle('ativo', ferramenta === ferramentas[+b.dataset.i]);
    });
    el.fonte.classList.toggle('ligada', ligada);
    el.fonte.textContent = ligada ? 'Desligar fonte' : 'Ligar fonte';
    el.remover.disabled = !selecionada;
    const p = pecas.find(x => x.id === selecionada);
    el.inverter.disabled = !p;
    el.desfazer.disabled = !historico.length;
    el.limpar.disabled = !pecas.length && !sondas.v && !sondas.p;
    instrucao();
  }

  function instrucao() {
    let t;
    const f = ferramenta;
    if (f) {
      if (f.tipo === 'sonda') t = `Clique no furo onde quer encostar a ponta ${f.qual === 'v' ? 'vermelha' : 'preta'} do multímetro.`;
      else if (f.tipo === 'led') t = primeiro ? 'Agora clique no furo da perna CURTA do LED (cátodo, −).' : `LED ${f.cor}: clique no furo da perna LONGA (ânodo, +).`;
      else if (f.tipo === 'resistor') t = primeiro ? 'Agora clique no furo da outra perna.' : `Resistor de ${Arte.ohms(f.valor)}: clique no furo da primeira perna.`;
      else t = primeiro ? 'Agora clique no furo onde o fio termina.' : 'Fio: clique no furo onde o fio começa.';
      t += ' (Esc cancela)';
    } else if (selecionada) {
      t = 'Peça selecionada: “Remover” tira da placa e “Inverter” troca as pernas de lado.';
    } else {
      t = 'Escolha um componente na gaveta. Passe o mouse (ou toque) nos furos para ver quais estão conectados.';
    }
    el.instrucao.textContent = t;
  }

  // ---------------------------------------------------------------- ações
  const copiar = () => ({ pecas: pecas.map(p => ({ ...p })), sondas: { ...sondas } });
  function guardar() { historico.push(copiar()); if (historico.length > 80) historico.shift(); }

  function mudou() {
    resultado = ligada ? Simulador.simular(pecas, noBase) : null;
    if (resultado && resultado.queimouAgora.length) {
      resultado.queimouAgora.forEach(p => recemQueimados.add(p.id));
      som('estouro');
      setTimeout(() => { recemQueimados.clear(); if (svg) desenharPecas(); }, 1800);
    } else if (resultado && resultado.curto) {
      som('erro');
    }
    desenharTudo();
    if (config && config.aoMudar) config.aoMudar(contexto());
  }

  function contexto() {
    return {
      pecas, sondas, ligada, res: resultado,
      leitura: leituraMultimetro(),
      // as duas pernas no mesmo grupo de furos (mesma coluna ou mesma trilha)?
      mesmaColuna: p => noBase(p.a) === noBase(p.b),
      // nó elétrico do furo (considera os fios); só faz sentido com a fonte ligada
      no: id => (resultado ? resultado.no(id) : noBase(id)),
      nomePeca,
    };
  }

  function escolherFerramenta(i) {
    const f = ferramentas[i];
    ferramenta = ferramenta === f ? null : f;
    primeiro = null;
    selecionada = null;
    desenharTudo();
  }

  function usarFerramenta(furo) {
    const f = ferramenta;
    if (f.tipo === 'sonda') {
      guardar();
      sondas[f.qual] = furo.id;
      ferramenta = null;
      som('clique');
      mudou();
      return;
    }
    if (ocupado(furo.id)) {
      el.conexao.textContent = 'Esse furo já tem uma perna de componente. Escolha um furo livre.';
      som('erro');
      return;
    }
    if (!primeiro) { primeiro = furo.id; som('clique'); desenharPrevia(); instrucao(); return; }
    if (furo.id === primeiro) { primeiro = null; desenharPrevia(); instrucao(); return; }
    guardar();
    const p = { id: 'p' + (++contador), tipo: f.tipo, a: primeiro, b: furo.id };
    if (f.tipo === 'resistor') p.valor = f.valor;
    else p.cor = f.cor;
    pecas.push(p);
    primeiro = null;
    if (f.tipo !== 'fio') ferramenta = null;
    som('clique');
    mudou();
  }

  function remover() {
    if (!selecionada) return;
    guardar();
    if (selecionada.startsWith('sonda-')) sondas[selecionada.slice(6)] = null;
    else pecas = pecas.filter(p => p.id !== selecionada);
    selecionada = null;
    mudou();
  }

  function inverter() {
    const p = pecas.find(x => x.id === selecionada);
    if (!p) return;
    guardar();
    [p.a, p.b] = [p.b, p.a];
    mudou();
  }

  function desfazer() {
    const ant = historico.pop();
    if (!ant) return;
    pecas = ant.pecas;
    sondas = ant.sondas;
    selecionada = null;
    mudou();
  }

  function limpar() {
    guardar();
    pecas = [];
    sondas = { v: null, p: null };
    selecionada = null;
    mudou();
  }

  function alternarFonte() {
    ligada = !ligada;
    som('clique');
    mudou();
  }

  // ---------------------------------------------------------------- eventos
  function pontoSVG(ev) {
    const pt = svg.createSVGPoint();
    pt.x = ev.clientX; pt.y = ev.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }
  function furoMaisProximo(pt) {
    let melhor = null, dm = (P * 0.55) ** 2;
    for (const f of furos.values()) {
      const d = (f.x - pt.x) ** 2 + (f.y - pt.y) ** 2;
      if (d < dm) { dm = d; melhor = f; }
    }
    return melhor;
  }

  function aoMover(ev) {
    const f = furoMaisProximo(pontoSVG(ev));
    if (f === hover) return;
    hover = f;
    el.conexao.textContent = f ? descreverFuro(f) : '';
    desenharDestaque();
    desenharPrevia();
  }

  function aoClicar(ev) {
    if (ev.target.closest('#fonte-botao')) { alternarFonte(); return; }
    const furo = furoMaisProximo(pontoSVG(ev));
    if (ferramenta) { if (furo) usarFerramenta(furo); return; }
    const pecaEl = ev.target.closest('[data-peca]');
    const sondaEl = ev.target.closest('[data-sonda]');
    if (pecaEl) selecionada = pecaEl.dataset.peca;
    else if (sondaEl) selecionada = 'sonda-' + sondaEl.dataset.sonda;
    else selecionada = null;
    if (!pecaEl && !sondaEl && furo) { hover = furo; el.conexao.textContent = descreverFuro(furo); }
    desenharTudo();
  }

  function aoTeclar(ev) {
    if (!config || !document.getElementById('tela-bancada').classList.contains('ativa')) return;
    if (ev.target.closest && ev.target.closest('input, textarea')) return;
    if (ev.key === 'Escape') { ferramenta = null; primeiro = null; selecionada = null; desenharTudo(); }
    else if (ev.key === 'Delete' || ev.key === 'Backspace') { if (selecionada) { ev.preventDefault(); remover(); } }
    else if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'z') { ev.preventDefault(); desfazer(); }
  }

  function preparar() {
    if (svg) return;
    svg = document.getElementById('placa');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const brilhos = Object.entries(Arte.COR_LED).map(([nome, cor]) =>
      `<radialGradient id="brilho-${nome}"><stop offset="0" stop-color="${cor}" stop-opacity=".95"/><stop offset=".45" stop-color="${cor}" stop-opacity=".45"/><stop offset="1" stop-color="${cor}" stop-opacity="0"/></radialGradient>`).join('');
    svg.innerHTML = `<defs>${brilhos}</defs><g id="c-placa">${desenharPlaca()}</g><g id="c-destaque" style="pointer-events:none"></g>
      <g id="c-fonte"></g><g id="c-pecas"></g><g id="c-multimetro"></g><g id="c-sondas"></g><g id="c-previa" style="pointer-events:none"></g>`;
    camadas = {
      destaque: svg.querySelector('#c-destaque'), fonte: svg.querySelector('#c-fonte'), pecas: svg.querySelector('#c-pecas'),
      multimetro: svg.querySelector('#c-multimetro'), sondas: svg.querySelector('#c-sondas'), previa: svg.querySelector('#c-previa'),
    };
    el = {
      gaveta: document.getElementById('gaveta-itens'), instrucao: document.getElementById('status-instrucao'),
      conexao: document.getElementById('status-conexao'), fonte: document.getElementById('btn-fonte'),
      remover: document.getElementById('btn-remover'), inverter: document.getElementById('btn-inverter'),
      desfazer: document.getElementById('btn-desfazer'), limpar: document.getElementById('btn-limpar'),
    };
    svg.addEventListener('pointermove', aoMover);
    svg.addEventListener('pointerleave', () => { hover = null; el.conexao.textContent = ''; desenharDestaque(); desenharPrevia(); });
    svg.addEventListener('click', aoClicar);
    el.gaveta.addEventListener('click', ev => { const b = ev.target.closest('.item-gaveta'); if (b) escolherFerramenta(+b.dataset.i); });
    el.fonte.addEventListener('click', alternarFonte);
    el.remover.addEventListener('click', remover);
    el.inverter.addEventListener('click', inverter);
    el.desfazer.addEventListener('click', desfazer);
    el.limpar.addEventListener('click', limpar);
    document.addEventListener('keydown', aoTeclar);
  }

  // ---------------------------------------------------------------- API
  // cfg: { gaveta: {resistores, leds, fios, multimetro}, manterMontagem, aoMudar(ctx) }
  function iniciar(cfg) {
    preparar();
    config = cfg;
    if (!cfg.manterMontagem) { pecas = []; sondas = { v: null, p: null }; historico = []; ligada = false; }
    ferramenta = null; primeiro = null; selecionada = null; hover = null;
    el.conexao.textContent = '';
    montarGaveta();
    mudou();
  }

  function parar() { config = null; ferramenta = null; primeiro = null; }

  return { iniciar, parar };
})();
