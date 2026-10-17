/*
 * arte.js — desenhos do jogo feitos em SVG: cenários (que o pixel.js pixeliza),
 * ícones de componentes e ilustrações das aulas. As personagens ficam em img/.
 */
const Arte = (() => {
  'use strict';
  // ---------------------------------------------------------------- cores
  const CORES = {
    preto: '#1b1b1b', marrom: '#7a4a24', vermelho: '#d62828', laranja: '#f77f00',
    amarelo: '#f6c90e', verde: '#2a9d4b', azul: '#2364d2', violeta: '#8e44ad',
    cinza: '#8d8d8d', branco: '#f5f5f5', dourado: '#c9a227', prata: '#c0c0c0',
  };
  const ORDEM = ['preto', 'marrom', 'vermelho', 'laranja', 'amarelo', 'verde', 'azul', 'violeta', 'cinza', 'branco'];
  const COR_LED = { vermelho: '#ff3b3b', verde: '#2ee66b', amarelo: '#ffd23f', azul: '#3d8bff', branco: '#f4f8ff' };
  const TINTA = '#3b1f5c';
  const FONTE = "'Silkscreen','Pixelify Sans',system-ui,sans-serif"; // Silkscreen só fornece os números

  const num = n => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  function ohms(v) {
    if (v >= 1e6) return `${num(v / 1e6)} MΩ`;
    if (v >= 1000) return `${num(v / 1000)} kΩ`;
    return `${num(v)} Ω`;
  }
  // 220 → ['vermelho', 'vermelho', 'marrom'] (valores a partir de 10 Ω)
  function faixasDoValor(valor) {
    const s = String(Math.round(valor));
    return [ORDEM[+s[0]], ORDEM[+(s[1] || 0)], ORDEM[Math.max(0, s.length - 2)]];
  }
  function valorDasFaixas(f) {
    return (ORDEM.indexOf(f[0]) * 10 + ORDEM.indexOf(f[1])) * 10 ** ORDEM.indexOf(f[2]);
  }

  // ---------------------------------------------------------------- peças
  // Resistor horizontal centrado em (0,0). L = comprimento do corpo, h = altura.
  function resistorSVG(faixas, { L = 60, h = 18, tolerancia = 'dourado' } = {}) {
    const corpo = '#e9d3a6';
    const bulbo = h * 0.42;
    const bw = L * 0.065;
    const meio = h * 0.82;
    let s = `<rect x="${-L / 2 + bulbo}" y="${-meio / 2}" width="${L - 2 * bulbo}" height="${meio}" fill="${corpo}"/>`;
    s += `<ellipse cx="${-L / 2 + bulbo}" cy="0" rx="${bulbo}" ry="${h / 2}" fill="${corpo}"/>`;
    s += `<ellipse cx="${L / 2 - bulbo}" cy="0" rx="${bulbo}" ry="${h / 2}" fill="${corpo}"/>`;
    [-0.2, -0.08, 0.04].forEach((p, i) => {
      s += `<rect x="${p * L - bw / 2}" y="${-meio / 2}" width="${bw}" height="${meio}" fill="${CORES[faixas[i]]}"/>`;
    });
    if (tolerancia) s += `<rect x="${0.2 * L - bw / 2}" y="${-meio / 2}" width="${bw}" height="${meio}" fill="${CORES[tolerancia]}"/>`;
    s += `<rect x="${-L / 2 + bulbo}" y="${-h * 0.33}" width="${L - 2 * bulbo}" height="${h * 0.12}" rx="1" fill="#fff" opacity=".35"/>`;
    return s;
  }

  // LED visto de lado, centrado na base. Cátodo (perna curta, lado chanfrado) à esquerda.
  function ledLateral(cor, { aceso = false } = {}) {
    const c = COR_LED[cor] || cor;
    return `
      ${aceso ? `<circle cx="0" cy="-22" r="36" fill="${c}" opacity=".28"/><circle cx="0" cy="-22" r="24" fill="${c}" opacity=".3"/>` : ''}
      <path d="M-6 4 V48" stroke="#9aa0a6" stroke-width="3" fill="none"/>
      <path d="M6 4 V30 L10 36 V62" stroke="#9aa0a6" stroke-width="3" fill="none" stroke-linejoin="round"/>
      <path d="M-14 0 V-26 A14 14 0 0 1 14 -26 V0 Z" fill="${c}" opacity="${aceso ? 1 : 0.8}"/>
      <path d="M-14 -2 H17 V4 H-14 Z" fill="${c}"/>
      <path d="M-8 -26 Q-8 -34 -2 -37" stroke="#fff" stroke-width="3" opacity=".65" fill="none" stroke-linecap="round"/>
      ${aceso ? '<circle cx="0" cy="-20" r="6" fill="#fff" opacity=".7"/>' : ''}`;
  }

  // Arduino UNO visto de cima, 300×210, com o canto em (0,0). destaque13: LED L aceso.
  function placaArduino({ destaque13 = false } = {}) {
    let s = `<rect x="-18" y="22" width="62" height="50" fill="#c9ced6" stroke="#8a909a" stroke-width="2"/>
      <rect x="-12" y="140" width="52" height="44" fill="#222"/>
      <rect width="300" height="210" rx="10" fill="#1d5fa0" stroke="#123f6e" stroke-width="3"/>
      <rect x="18" y="6" width="18" height="18" fill="#d62828" stroke="#7a1010" stroke-width="2"/>
      <rect x="110" y="6" width="180" height="16" fill="#111"/>
      <rect x="60" y="188" width="90" height="16" fill="#111"/><rect x="175" y="188" width="90" height="16" fill="#111"/>
      <rect x="150" y="120" width="120" height="34" fill="#1b1b1b"/>
      <circle cx="80" cy="92" r="13" fill="none" stroke="#fff" stroke-width="4"/><circle cx="106" cy="92" r="13" fill="none" stroke="#fff" stroke-width="4"/>
      <text x="80" y="97" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">−</text><text x="106" y="97" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">+</text>
      <text x="200" y="88" font-size="30" font-weight="700" fill="#fff" text-anchor="middle" font-family="${FONTE}">UNO</text>
      <rect x="96" y="30" width="10" height="6" fill="${destaque13 ? '#ffb43b' : '#6b4a1e'}"/><text x="101" y="48" font-size="9" fill="#cfe3f5" text-anchor="middle">L</text>
      <rect x="60" y="30" width="10" height="6" fill="#2ee66b"/><text x="65" y="48" font-size="9" fill="#cfe3f5" text-anchor="middle">ON</text>`;
    for (let i = 0; i < 16; i++) s += `<rect x="${114 + i * 11}" y="10" width="6" height="7" fill="#c9a227"/>`;
    for (let i = 0; i < 8; i++) s += `<rect x="${64 + i * 11}" y="192" width="6" height="7" fill="#c9a227"/><rect x="${179 + i * 11}" y="192" width="6" height="7" fill="#c9a227"/>`;
    for (let i = 0; i < 14; i++) s += `<rect x="${154 + i * 8}" y="114" width="4" height="6" fill="#b8bcc2"/><rect x="${154 + i * 8}" y="154" width="4" height="6" fill="#b8bcc2"/>`;
    return s;
  }

  // ---------------------------------------------------------------- ícones (caixa 120×100)
  const ICONES = {
    arduino: () => `<g transform="translate(14 18) scale(.31)">${placaArduino()}</g>`,
    buzzer: () => `<path d="M48 70 V96 M72 70 V88" stroke="#9aa0a6" stroke-width="3"/>
      <rect x="30" y="22" width="60" height="50" rx="6" fill="#1b1b1b"/><ellipse cx="60" cy="22" rx="30" ry="9" fill="#333"/><circle cx="60" cy="22" r="4" fill="#666"/>
      <text x="40" y="58" font-size="16" font-weight="700" fill="#ff8a8a">+</text>`,
    resistor: () => `<path d="M4 50 H116" stroke="#9aa0a6" stroke-width="3"/><g transform="translate(60 50)">${resistorSVG(['marrom', 'preto', 'vermelho'], { L: 72, h: 26 })}</g>`,
    led: () => `<g transform="translate(60 42) scale(.85)">${ledLateral('vermelho')}</g>`,
    capacitor: () => `
      <path d="M52 66 V94 M68 66 V90" stroke="#9aa0a6" stroke-width="3"/>
      <rect x="40" y="10" width="40" height="58" rx="7" fill="#2b59c3"/>
      <rect x="66" y="10" width="10" height="58" fill="#8fb0f0"/>
      <text x="71" y="34" font-size="12" font-weight="700" text-anchor="middle" fill="#2b59c3">−</text>
      <text x="71" y="56" font-size="12" font-weight="700" text-anchor="middle" fill="#2b59c3">−</text>
      <ellipse cx="60" cy="11" rx="18" ry="4" fill="#d6dbe4"/>`,
    multimetro: () => `
      <rect x="30" y="3" width="60" height="94" rx="11" fill="#f07a2a"/>
      <rect x="36" y="9" width="48" height="82" rx="7" fill="#3a3a42"/>
      <rect x="40" y="13" width="40" height="20" rx="3" fill="#cfe0c8"/>
      <text x="60" y="28" font-size="12" font-family="ui-monospace,monospace" font-weight="700" text-anchor="middle" fill="#1f2a1c">2.39</text>
      <circle cx="60" cy="55" r="12" fill="#5a5a64"/><path d="M60 55 L60 44" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      <circle cx="47" cy="81" r="4" fill="#d62828"/><circle cx="60" cy="81" r="4" fill="#111"/><circle cx="73" cy="81" r="4" fill="#d62828"/>`,
    fonte: () => `
      <rect x="8" y="20" width="104" height="64" rx="7" fill="#26252c"/>
      <rect x="16" y="28" width="58" height="24" rx="3" fill="#0c1410"/>
      <text x="45" y="45" font-size="13" font-family="ui-monospace,monospace" font-weight="700" text-anchor="middle" fill="#69f0a5">5.00V</text>
      <rect x="16" y="60" width="22" height="14" rx="3" fill="#2fbf71"/>
      <circle cx="86" cy="68" r="7" fill="#d62828"/><circle cx="102" cy="68" r="7" fill="#111" stroke="#555"/>
      <text x="86" y="44" font-size="12" font-weight="700" text-anchor="middle" fill="#ff8a8a">+</text>
      <text x="102" y="44" font-size="12" font-weight="700" text-anchor="middle" fill="#aaa">−</text>`,
    protoboard: () => {
      let s = '<rect x="6" y="14" width="108" height="72" rx="5" fill="#f3f2ee" stroke="#d0cec6" stroke-width="2"/>';
      s += '<path d="M12 21 H108" stroke="#e05555" stroke-width="1.6"/><path d="M12 79 H108" stroke="#4f7fe0" stroke-width="1.6"/>';
      for (let c = 0; c < 12; c++) {
        for (const y of [25, 75]) s += `<rect x="${13 + c * 8}" y="${y - 1.5}" width="3" height="3" fill="#444"/>`;
        for (let l = 0; l < 4; l++) {
          s += `<rect x="${13 + c * 8}" y="${33 + l * 4.5}" width="3" height="3" fill="#444"/>`;
          s += `<rect x="${13 + c * 8}" y="${55 + l * 4.5}" width="3" height="3" fill="#444"/>`;
        }
      }
      return s;
    },
    jumpers: () => ['#e63946', '#2a9d8f', '#f4c430'].map((c, i) =>
      `<path d="M${18 + i * 10} 80 Q${50 + i * 8} ${10 + i * 12} ${100 - i * 6} ${70 - i * 4}" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>
       <rect x="${15 + i * 10}" y="78" width="6" height="12" rx="1" fill="#b8bcc2"/>`).join(''),
  };
  function icone(nome) {
    return `<svg viewBox="0 0 120 100" aria-hidden="true">${ICONES[nome] ? ICONES[nome]() : ''}</svg>`;
  }

  // ---------------------------------------------------------------- símbolos de esquema
  function zigH(x1, x2, y, cor = TINTA) {
    const L = x2 - x1, a = x1 + L * 0.2, b = x2 - L * 0.2, n = 6, w = (b - a) / n;
    let d = `M${x1} ${y} L${a} ${y}`;
    for (let i = 0; i < n; i++) d += ` L${a + w * (i + 0.5)} ${y + (i % 2 ? 9 : -9)}`;
    d += ` L${b} ${y} L${x2} ${y}`;
    return `<path d="${d}" fill="none" stroke="${cor}" stroke-width="3" stroke-linejoin="round"/>`;
  }
  function zigV(x, y1, y2, cor = TINTA) {
    const L = y2 - y1, a = y1 + L * 0.2, b = y2 - L * 0.2, n = 6, w = (b - a) / n;
    let d = `M${x} ${y1} L${x} ${a}`;
    for (let i = 0; i < n; i++) d += ` L${x + (i % 2 ? 9 : -9)} ${a + w * (i + 0.5)}`;
    d += ` L${x} ${b} L${x} ${y2}`;
    return `<path d="${d}" fill="none" stroke="${cor}" stroke-width="3" stroke-linejoin="round"/>`;
  }
  // LED no esquema; ângulo 0 = corrente da esquerda para a direita. Ocupa 48 de comprimento.
  function ledSimb(x, y, angulo = 0, cor = 'vermelho', aceso = false) {
    const c = COR_LED[cor];
    return `<g transform="translate(${x} ${y}) rotate(${angulo})">
      ${aceso ? `<circle r="26" fill="${c}" opacity=".3"/>` : ''}
      <path d="M-24 0 H-10 M10 0 H24" stroke="${TINTA}" stroke-width="3"/>
      <path d="M-10 -11 V11 L10 0 Z" fill="${aceso ? c : '#fff'}" stroke="${TINTA}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M10 -11 V11" stroke="${TINTA}" stroke-width="3"/>
      <path d="M0 -14 L7 -23 M4 -23 H7 V-20 M7 -12 L14 -21 M11 -21 H14 V-18" stroke="${aceso ? c : TINTA}" stroke-width="2" fill="none"/>
    </g>`;
  }
  // Bateria/fonte vertical: placa longa (+) em cima.
  function fonteSimb(x, y, rotulo = '5 V') {
    return `<path d="M${x} ${y - 40} V${y - 7} M${x} ${y + 7} V${y + 40}" stroke="${TINTA}" stroke-width="3"/>
      <path d="M${x - 18} ${y - 6} H${x + 18}" stroke="${TINTA}" stroke-width="3"/>
      <path d="M${x - 9} ${y + 6} H${x + 9}" stroke="${TINTA}" stroke-width="5"/>
      <text x="${x - 26}" y="${y - 10}" font-size="18" font-weight="700" fill="#d62828" text-anchor="middle">+</text>
      <text x="${x - 26}" y="${y + 22}" font-size="18" font-weight="700" fill="#2364d2" text-anchor="middle">−</text>
      <text x="${x + 24}" y="${y + 6}" font-size="15" fill="${TINTA}">${rotulo}</text>`;
  }
  function seta(x, y, angulo, cor = '#e5484d') {
    return `<path d="M-7 -6 L5 0 L-7 6 Z" transform="translate(${x} ${y}) rotate(${angulo})" fill="${cor}"/>`;
  }
  const texto = (x, y, t, { tam = 16, cor = TINTA, peso = 500, ancora = 'middle', fam = FONTE } = {}) =>
    `<text x="${x}" y="${y}" font-size="${tam}" font-weight="${peso}" fill="${cor}" text-anchor="${ancora}" font-family="${fam}">${t}</text>`;

  // ---------------------------------------------------------------- ilustrações das aulas
  const ILUSTRACOES = {
    componentes() {
      const itens = [['fonte', 'Fonte de alimentação'], ['protoboard', 'Protoboard'], ['resistor', 'Resistor'],
        ['led', 'LED'], ['jumpers', 'Jumpers (fios)'], ['multimetro', 'Multímetro']];
      let s = '';
      itens.forEach(([nome, rot], i) => {
        const x = (i % 3) * 200, y = Math.floor(i / 3) * 175;
        s += `<g transform="translate(${x + 28} ${y + 8}) scale(1.2)">${ICONES[nome]()}</g>`;
        s += texto(x + 100, y + 150, rot, { tam: 17, peso: 700 });
      });
      return [600, 350, s];
    },

    agua() {
      let s = `<rect x="30" y="40" width="120" height="180" rx="6" fill="#eef6fc" stroke="${TINTA}" stroke-width="3"/>
        <rect x="33" y="80" width="114" height="137" fill="#7cc6f2"/>
        <path d="M33 80 q14 -6 28 0 t28 0 t28 0 t30 0" fill="none" stroke="#4aa7df" stroke-width="3"/>
        <path d="M150 182 H300 V170 H420 V182 H570 M150 210 H300 V222 H420 V210 H570" fill="none" stroke="${TINTA}" stroke-width="3"/>
        <rect x="150" y="184" width="150" height="24" fill="#7cc6f2"/><rect x="300" y="172" width="120" height="48" fill="#eef6fc"/>
        <rect x="300" y="191" width="120" height="6" fill="#7cc6f2"/><rect x="420" y="184" width="150" height="24" fill="#7cc6f2"/>
        <path d="M300 172 V191 M300 197 V220 M420 172 V191 M420 197 V220" stroke="${TINTA}" stroke-width="3"/>
        <path class="fluxo" d="M160 196 H560" stroke="#fff" stroke-width="3" stroke-dasharray="8 14" fill="none"/>`;
      s += texto(90, 28, 'Tensão (V)', { tam: 18, peso: 800, cor: '#d62828' });
      s += texto(90, 250, 'altura da água =', { tam: 14 }) + texto(90, 268, '“pressão” que empurra', { tam: 14 });
      s += texto(360, 150, 'Resistência (Ω)', { tam: 18, peso: 800, cor: '#8e44ad' });
      s += texto(360, 248, 'cano fino = dificulta', { tam: 14 }) + texto(360, 266, 'a passagem', { tam: 14 });
      s += texto(500, 150, 'Corrente (A)', { tam: 18, peso: 800, cor: '#2364d2' });
      s += texto(500, 248, 'vazão = quanta água', { tam: 14 }) + texto(500, 266, 'passa por segundo', { tam: 14 });
      s += seta(548, 196, 0, '#2364d2');
      return [600, 285, s];
    },

    'circuito-fechado'() {
      const painel = (ox, fechado) => {
        let s = `<path d="M${ox + 50} 95 V40 H${ox + 250} V100 M${ox + 250} 148 V210 H${fechado ? ox + 50 : ox + 170}" fill="none" stroke="${TINTA}" stroke-width="3"/>`;
        if (!fechado) s += `<path d="M${ox + 130} 210 H${ox + 50}" stroke="${TINTA}" stroke-width="3"/><path d="M${ox + 130} 210 L${ox + 166} 190" stroke="${TINTA}" stroke-width="3"/><circle cx="${ox + 130}" cy="210" r="4" fill="${TINTA}"/><circle cx="${ox + 170}" cy="210" r="4" fill="${TINTA}"/>`;
        s += `<path d="M${ox + 50} 165 V210" stroke="${TINTA}" stroke-width="3"/>`;
        s += fonteSimb(ox + 50, 130, '');
        s += `<rect x="${ox + 105}" y="28" width="90" height="24" fill="#fff"/>` + zigH(ox + 100, ox + 200, 40);
        s += ledSimb(ox + 250, 124, 90, 'vermelho', fechado);
        if (fechado) s += seta(ox + 150, 22, 0) + seta(ox + 272, 180, 90) + seta(ox + 150, 228, 180) + seta(ox + 30, 70, -90);
        s += texto(ox + 150, 258, fechado ? '✔ Fechado: a corrente circula' : '✘ Aberto: não há caminho', { tam: 16, peso: 800, cor: fechado ? '#1f8f52' : '#c0392b' });
        return s;
      };
      return [600, 270, painel(0, true) + painel(300, false)];
    },

    vri() {
      let s = `<path d="M150 22 L270 232 H30 Z" fill="#f3e6fb" stroke="${TINTA}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M90 127 H210 M150 127 V232" stroke="${TINTA}" stroke-width="3"/>`;
      s += texto(150, 108, 'V', { tam: 52, peso: 800, cor: '#d62828', fam: FONTE });
      s += texto(110, 205, 'R', { tam: 44, peso: 800, cor: '#8e44ad', fam: FONTE });
      s += texto(190, 205, 'I', { tam: 44, peso: 800, cor: '#2364d2', fam: FONTE });
      s += texto(150, 175, '×', { tam: 22, peso: 800 });
      const linhas = [['V = R × I', 'tensão, em volts (V)', '#d62828'], ['I = V ÷ R', 'corrente, em ampères (A)', '#2364d2'], ['R = V ÷ I', 'resistência, em ohms (Ω)', '#8e44ad']];
      linhas.forEach(([f, d, c], i) => {
        s += texto(330, 70 + i * 68, f, { tam: 30, peso: 700, ancora: 'start', fam: FONTE });
        s += texto(330, 94 + i * 68, `descobre a ${d}`, { tam: 14, ancora: 'start', cor: c, peso: 700 });
      });
      return [600, 250, s];
    },

    'codigo-cores'() {
      const [s, h] = tabelaCores(4);
      return [640, h + 6, s];
    },

    protoboard() {
      const x0 = 70, px = 42, nC = 10;
      const yT = [36, 60], yA = 100, yF = 224, py = 22;
      let s = `<rect x="30" y="14" width="460" height="330" rx="12" fill="#f3f2ee" stroke="#d0cec6" stroke-width="2"/>
        <rect x="30" y="${yA + 4 * py + 12}" width="460" height="${yF - yA - 4 * py - 24}" fill="#e2e0d9"/>
        <path d="M44 ${yT[0] - 12} H476" stroke="#e05555" stroke-width="2.5"/><path d="M44 ${yT[1] + 12} H476" stroke="#4f7fe0" stroke-width="2.5"/>
        <path d="M44 ${yF + 4 * py + 20} H476" stroke="#e05555" stroke-width="2.5"/><path d="M44 ${yF + 4 * py + 46} H476" stroke="#4f7fe0" stroke-width="2.5"/>`;
      // destaques: trilha + inteira, coluna 3 (a–e) e coluna 7 (f–j)
      s += `<rect x="${x0 - 14}" y="${yT[0] - 9}" width="${(nC - 1) * px + 28}" height="18" rx="9" fill="#e05555" opacity=".25"/>`;
      s += `<rect x="${x0 + 2 * px - 11}" y="${yA - 11}" width="22" height="${4 * py + 22}" rx="11" fill="#2fbf71" opacity=".35"/>`;
      s += `<rect x="${x0 + 6 * px - 11}" y="${yF - 11}" width="22" height="${4 * py + 22}" rx="11" fill="#2fbf71" opacity=".35"/>`;
      for (let c = 0; c < nC; c++) {
        const x = x0 + c * px;
        for (const y of [...yT, yF + 4 * py + 33, yF + 4 * py + 33 + 0]) s += `<rect x="${x - 4}" y="${y - 4}" width="8" height="8" rx="1.5" fill="#3b3b3b"/>`;
        for (let l = 0; l < 5; l++) {
          s += `<rect x="${x - 4}" y="${yA + l * py - 4}" width="8" height="8" rx="1.5" fill="#3b3b3b"/>`;
          s += `<rect x="${x - 4}" y="${yF + l * py - 4}" width="8" height="8" rx="1.5" fill="#3b3b3b"/>`;
        }
      }
      'abcde'.split('').forEach((l, i) => { s += texto(48, yA + i * py + 5, l, { tam: 12, cor: '#888' }); });
      'fghij'.split('').forEach((l, i) => { s += texto(48, yF + i * py + 5, l, { tam: 12, cor: '#888' }); });
      s += texto(510, yT[0] + 5, 'trilha +', { tam: 15, peso: 800, cor: '#d62828', ancora: 'start' });
      s += texto(510, yT[1] + 5, 'trilha −', { tam: 15, peso: 800, cor: '#2364d2', ancora: 'start' });
      s += texto(510, yT[0] + 24, '(ligada ↔)', { tam: 12, ancora: 'start' }).replace('y="65"', 'y="65"');
      s += texto(510, yA + 2 * py, 'coluna', { tam: 15, peso: 800, cor: '#1f8f52', ancora: 'start' });
      s += texto(510, yA + 2 * py + 18, 'de 5 furos', { tam: 13, ancora: 'start' });
      s += texto(510, yA + 2 * py + 34, '(ligada ↕)', { tam: 12, ancora: 'start' });
      s += texto(510, yA + 4 * py + 32, 'canal:', { tam: 14, peso: 800, ancora: 'start' });
      s += texto(510, yA + 4 * py + 48, 'separa', { tam: 12, ancora: 'start' });
      s += texto(510, yA + 4 * py + 62, 'cima e baixo', { tam: 12, ancora: 'start' });
      return [600, 360, s];
    },

    led() {
      let s = `<g transform="translate(150 120) scale(2.1)">${ledLateral('vermelho', { aceso: true })}</g>`;
      s += `<path d="M118 230 L60 262" stroke="${TINTA}" stroke-width="1.5"/>` + texto(60, 280, 'cátodo (−)', { tam: 15, peso: 800, cor: '#2364d2' }) + texto(60, 297, 'perna curta', { tam: 13 });
      s += `<path d="M171 245 L235 262" stroke="${TINTA}" stroke-width="1.5"/>` + texto(245, 280, 'ânodo (+)', { tam: 15, peso: 800, cor: '#d62828' }) + texto(245, 297, 'perna longa', { tam: 13 });
      s += `<path d="M118 118 L58 92" stroke="${TINTA}" stroke-width="1.5"/>` + texto(52, 70, 'lado', { tam: 13 }) + texto(52, 86, 'chanfrado', { tam: 13 });
      s += `<rect x="330" y="40" width="250" height="230" rx="14" fill="#f3e6fb"/>`;
      s += texto(455, 72, 'No esquema:', { tam: 16, peso: 800 });
      s += `<g transform="translate(455 140) scale(1.6)">${ledSimb(0, 0, 0, 'vermelho', true)}</g>`;
      s += texto(395, 182, '+', { tam: 22, peso: 800, cor: '#d62828' }) + texto(515, 182, '−', { tam: 22, peso: 800, cor: '#2364d2' });
      s += texto(455, 222, 'a corrente só passa', { tam: 14 }) + texto(455, 240, 'do + para o −', { tam: 14 }) + seta(455, 255, 0, TINTA);
      return [600, 305, s];
    },

    serie() {
      let s = `<path d="M60 92 V40 H110 M210 40 H266 M314 40 H396 M444 40 H540 V220 H60 V168" fill="none" stroke="${TINTA}" stroke-width="3"/>`;
      s += fonteSimb(60, 130) + zigH(110, 210, 40) + ledSimb(290, 40, 0, 'vermelho', true) + ledSimb(420, 40, 0, 'verde', true);
      s += seta(240, 24, 0) + seta(355, 24, 0) + seta(560, 130, 90) + seta(300, 236, 180);
      s += texto(160, 75, 'resistor', { tam: 13 }) + texto(290, 78, 'LED 1', { tam: 13 }) + texto(420, 78, 'LED 2', { tam: 13 });
      s += texto(300, 140, 'Série: um caminho só.', { tam: 19, peso: 800 });
      s += texto(300, 166, 'A mesma corrente passa por todos', { tam: 15 });
      s += texto(300, 186, 'e a tensão da fonte se divide.', { tam: 15 });
      return [600, 250, s];
    },

    paralelo() {
      let s = `<path d="M60 112 V44 H460 M60 188 V256 H460 M260 44 V60 M460 44 V60 M260 140 V164 M460 140 V164 M260 212 V256 M460 212 V256" fill="none" stroke="${TINTA}" stroke-width="3"/>`;
      s += fonteSimb(60, 150) + zigV(260, 60, 140) + zigV(460, 60, 140) + ledSimb(260, 188, 90, 'vermelho', true) + ledSimb(460, 188, 90, 'verde', true);
      s += `<circle cx="260" cy="44" r="5" fill="${TINTA}"/><circle cx="260" cy="256" r="5" fill="${TINTA}"/>`;
      s += seta(160, 28, 0) + seta(282, 100, 90) + seta(482, 100, 90) + seta(160, 272, 180);
      s += texto(360, 112, 'cada LED tem', { tam: 14 }) + texto(360, 130, 'seu caminho', { tam: 14 });
      s += texto(300, 300, 'Paralelo: a tensão é a mesma para todos e a corrente se divide.', { tam: 15, peso: 700 });
      return [600, 315, s];
    },

    multimetro() {
      let s = `<rect x="40" y="16" width="170" height="280" rx="24" fill="#f07a2a"/>
        <rect x="54" y="30" width="142" height="252" rx="16" fill="#3a3a42"/>
        <rect x="66" y="44" width="118" height="54" rx="6" fill="#cfe0c8"/>
        <text x="172" y="84" font-size="34" font-family="ui-monospace,Consolas,monospace" font-weight="700" text-anchor="end" fill="#1f2a1c">1.85</text>
        <circle cx="125" cy="168" r="38" fill="#5a5a64" stroke="#2b2b31" stroke-width="4"/>
        <path d="M125 168 L96 140" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
        <circle cx="86" cy="250" r="11" fill="#111" stroke="#777" stroke-width="2"/><circle cx="164" cy="250" r="11" fill="#d62828"/>`;
      s += texto(86, 128, 'V⎓', { tam: 18, peso: 800, cor: '#ffd23f' }) + texto(176, 128, 'Ω', { tam: 16, cor: '#ddd' }) + texto(125, 224, 'A', { tam: 14, cor: '#ddd' });
      s += texto(86, 278, 'COM', { tam: 12, peso: 800, cor: '#fff' }) + texto(164, 278, 'VΩ', { tam: 12, peso: 800, cor: '#fff' });
      // circuito à direita
      s += `<path d="M330 60 H560 V250 H330 Z" fill="none" stroke="${TINTA}" stroke-width="3"/>`;
      s += `<rect x="340" y="48" width="90" height="24" fill="#fff"/>` + zigH(335, 435, 60);
      s += `<rect x="548" y="120" width="24" height="70" fill="#fff"/>` + ledSimb(560, 155, 90, 'vermelho', true);
      s += texto(330, 40, 'resistor', { tam: 13, ancora: 'start' });
      // pontas
      s += `<path d="M164 250 C 260 250 430 120 548 124" stroke="#d62828" stroke-width="4" fill="none"/>
        <path d="M86 250 C 160 330 420 300 548 188" stroke="#111" stroke-width="4" fill="none"/>
        <circle cx="552" cy="124" r="6" fill="#d62828"/><circle cx="552" cy="188" r="6" fill="#111"/>`;
      s += texto(470, 104, 'vermelha:', { tam: 13, peso: 800, cor: '#d62828' }) + texto(470, 120, 'lado +', { tam: 13 });
      s += texto(470, 218, 'preta:', { tam: 13, peso: 800 }) + texto(470, 234, 'lado −', { tam: 13 });
      s += texto(330, 288, 'Tensão se mede em paralelo: uma ponta de cada lado.', { tam: 14, peso: 700, ancora: 'start' });
      return [600, 300, s];
    },
  };

  Object.assign(ILUSTRACOES, {
    arduino() {
      let s = `<g transform="translate(170 72)">${placaArduino()}</g>`;
      const rot = (x1, y1, x2, y2, linhas, ancora = 'middle', cor = TINTA) => {
        let t = `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${TINTA}" stroke-width="1.5"/>`;
        linhas.forEach((l, i) => { t += texto(x2 + (ancora === 'start' ? 4 : ancora === 'end' ? -4 : 0), y2 + (y2 < y1 ? -6 - (linhas.length - 1 - i) * 17 : 14 + i * 17), l, { tam: 14, peso: i ? 500 : 700, ancora, cor: i ? TINTA : cor }); });
        return t;
      };
      s += rot(160, 118, 92, 150, ['USB', 'energia e programa'], 'middle', '#2364d2');
      s += rot(197, 78, 120, 52, ['Botão reset'], 'middle', '#d62828');
      s += rot(370, 78, 370, 46, ['Pinos digitais (0 a 13)', 'os com ~ também fazem PWM'], 'middle', '#8e44ad');
      s += rot(440, 209, 480, 209, ['Microcontrolador', 'o “cérebro” da placa'], 'start', '#1f8f52');
      s += rot(275, 276, 230, 300, ['Alimentação', '5V, 3.3V e GND'], 'middle', '#d62828');
      s += rot(390, 276, 440, 300, ['Pinos analógicos', 'A0 a A5'], 'middle', '#b26b00');
      s += rot(160, 232, 92, 262, ['Fonte externa', '7 a 12 V'], 'middle', TINTA);
      return [650, 345, s];
    },

    'setup-loop'() {
      let s = `<rect x="40" y="20" width="330" height="96" fill="#0f1f24" stroke="#00979d" stroke-width="4"/>
        <rect x="40" y="150" width="330" height="150" fill="#0f1f24" stroke="#00979d" stroke-width="4"/>`;
      const cod = (x, y, t, cor = '#e6f2f3') => `<text x="${x}" y="${y}" font-size="16" font-family="ui-monospace,Consolas,monospace" fill="${cor}">${t}</text>`;
      s += cod(56, 48, '<tspan fill="#4fc3f7">void</tspan> <tspan fill="#ffb86c">setup</tspan>() {') + cod(76, 74, '<tspan fill="#ffb86c">pinMode</tspan>(13, OUTPUT);') + cod(56, 100, '}');
      s += cod(56, 178, '<tspan fill="#4fc3f7">void</tspan> <tspan fill="#ffb86c">loop</tspan>() {') + cod(76, 204, '<tspan fill="#ffb86c">digitalWrite</tspan>(13, HIGH);') + cod(76, 228, '<tspan fill="#ffb86c">delay</tspan>(1000);')
        + cod(76, 252, '<tspan fill="#ffb86c">digitalWrite</tspan>(13, LOW);') + cod(76, 276, '<tspan fill="#ffb86c">delay</tspan>(1000);') + cod(56, 296, '}');
      s += `<path d="M205 118 V146" stroke="${TINTA}" stroke-width="3"/>` + seta(205, 144, 90, TINTA);
      s += `<path d="M380 280 C 450 280 450 170 380 170" stroke="#e5484d" stroke-width="4" fill="none"/>` + seta(384, 170, 180, '#e5484d');
      s += texto(400, 60, 'roda 1 vez,', { tam: 17, peso: 700, ancora: 'start', cor: '#1f8f52' }) + texto(400, 80, 'quando liga', { tam: 15, ancora: 'start' });
      s += texto(462, 216, 'repete', { tam: 17, peso: 700, ancora: 'start', cor: '#e5484d' }) + texto(462, 236, 'para sempre', { tam: 15, ancora: 'start' });
      return [600, 320, s];
    },

    'high-low'() {
      const painel = (ox, alto) => {
        let s = `<rect x="${ox}" y="10" width="280" height="240" fill="${alto ? '#fff8e0' : '#f1eef5'}" stroke="${TINTA}" stroke-width="3"/>`;
        s += texto(ox + 140, 40, alto ? 'digitalWrite(13, HIGH);' : 'digitalWrite(13, LOW);', { tam: 15, fam: 'ui-monospace,Consolas,monospace', peso: 700 });
        s += `<rect x="${ox + 20}" y="70" width="60" height="120" fill="#1d5fa0"/>` + texto(ox + 50, 134, '13', { tam: 18, peso: 700, cor: '#fff' });
        s += `<path d="M${ox + 80} 110 H${ox + 120}" stroke="${alto ? '#e63946' : '#888'}" stroke-width="4"/>`;
        s += zigH(ox + 120, ox + 190, 110) + `<path d="M${ox + 190} 110 H${ox + 214} V102 M${ox + 214} 150 V170 H${ox + 80}" fill="none" stroke="${TINTA}" stroke-width="3"/>`;
        s += ledSimb(ox + 214, 126, 90, 'vermelho', alto);
        s += texto(ox + 50, 210, alto ? '5 V' : '0 V', { tam: 24, peso: 800, cor: alto ? '#d62828' : '#666' });
        s += texto(ox + 180, 210, alto ? 'LED aceso' : 'LED apagado', { tam: 17, peso: 700 });
        s += texto(ox + 50, 166, 'GND', { tam: 12, cor: '#fff' });
        return s;
      };
      return [600, 260, painel(10, true) + painel(310, false)];
    },

    buzzer() {
      let s = `<g transform="translate(150 150) scale(2.2)"><path d="M-10 18 V48 M10 18 V40" stroke="#9aa0a6" stroke-width="3"/>
        <rect x="-26" y="-26" width="52" height="46" rx="6" fill="#1b1b1b"/><ellipse cx="0" cy="-26" rx="26" ry="8" fill="#333"/><circle cx="0" cy="-26" r="4" fill="#666"/>
        <text x="-20" y="8" font-size="14" font-weight="700" fill="#ff8a8a">+</text></g>`;
      s += [40, 58, 76].map(r => `<path d="M${150 + r * 0.6} ${70 - r * 0.5} A${r} ${r} 0 0 1 ${150 + r * 0.95} ${70 + r * 0.25}" stroke="#ff6ec7" stroke-width="4" fill="none"/>`).join('');
      s += `<path d="M128 258 L80 282" stroke="${TINTA}" stroke-width="1.5"/>` + texto(80, 298, 'perna + (longa)', { tam: 14, peso: 700, cor: '#d62828' });
      s += `<path d="M172 242 L230 282" stroke="${TINTA}" stroke-width="1.5"/>` + texto(240, 298, 'perna −', { tam: 14, peso: 700, cor: '#2364d2' });
      s += `<rect x="330" y="40" width="250" height="220" fill="#f3e6fb"/>`;
      s += texto(455, 80, 'O buzzer transforma', { tam: 16, peso: 700 }) + texto(455, 100, 'eletricidade em som.', { tam: 16, peso: 700 });
      s += texto(455, 140, 'Pino em HIGH: apita', { tam: 15 }) + texto(455, 162, 'Pino em LOW: silêncio', { tam: 15 });
      s += texto(455, 200, 'tone(8, 440) toca a', { tam: 15, fam: 'ui-monospace,Consolas,monospace' }) + texto(455, 222, 'nota lá (440 Hz)', { tam: 15 });
      return [600, 310, s];
    },
  });

  // Tabela do código de cores da oficina (mesmos valores da tabela das aulas, de 5 faixas).
  // As colunas têm o nome da função de cada faixa, para servir também aos resistores de 4 faixas.
  const TABELA = [
    // cor, nome, 1º dígito, 2º dígito, 3º dígito, multiplicador (zeros), tolerância, código
    ['preto', 'Preto', '–', '0', '0', '–', '–', '–'],
    ['marrom', 'Marrom', '1', '1', '1', '0', '±1%', 'F'],
    ['vermelho', 'Vermelho', '2', '2', '2', '00', '±2%', 'G'],
    ['laranja', 'Laranja', '3', '3', '3', '000', '–', '–'],
    ['amarelo', 'Amarelo', '4', '4', '4', '0000', '–', '–'],
    ['verde', 'Verde', '5', '5', '5', '00000', '±0,5%', 'D'],
    ['azul', 'Azul', '6', '6', '6', '000000', '±0,25%', 'C'],
    ['violeta', 'Violeta', '7', '7', '7', '0000000', '±0,1%', 'B'],
    ['cinza', 'Cinza', '8', '8', '8', '00000000', '±0,05%', 'A'],
    ['branco', 'Branco', '9', '9', '9', '000000000', '–', '–'],
    ['dourado', 'Ouro', '–', '–', '–', '÷10', '±5%', 'J'],
    ['prata', 'Prata', '–', '–', '–', '÷100', '±10%', 'K'],
    ['incolor', 'Incolor', '–', '–', '–', '–', '±20%', 'M'],
  ];
  const TEXTO_CLARO = ['preto', 'marrom', 'vermelho', 'verde', 'azul', 'violeta'];

  // Desenha a tabela a partir da altura y0 (largura 640). Devolve [svg, altura].
  function tabelaCores(y0) {
    const larguras = [112, 66, 66, 66, 124, 110, 76];
    const titulos = ['Cor', '1º dígito', '2º dígito', '3º dígito*', 'Multiplicador', 'Tolerância', 'Código'];
    const xs = larguras.reduce((a, w) => [...a, a[a.length - 1] + w], [10]);
    const alt = 23, cab = 28;
    let s = `<rect x="10" y="${y0}" width="620" height="${cab}" fill="#dcd4e6"/>`;
    titulos.forEach((t, i) => { s += texto(xs[i] + larguras[i] / 2, y0 + 19, t, { tam: 12, peso: 700 }); });
    TABELA.forEach((linha, r) => {
      const y = y0 + cab + r * alt;
      const fundo = linha[0] === 'incolor' ? '#ffffff' : CORES[linha[0]];
      const cor = TEXTO_CLARO.includes(linha[0]) ? '#ffffff' : '#1b1b1b';
      s += `<rect x="10" y="${y}" width="620" height="${alt}" fill="${fundo}"/>`;
      s += texto(18, y + 16.5, linha[1], { tam: 14, peso: 700, cor, ancora: 'start' });
      linha.slice(2).forEach((v, i) => { s += texto(xs[i + 1] + larguras[i + 1] / 2, y + 16.5, v, { tam: 14, peso: 700, cor }); });
    });
    const fim = y0 + cab + TABELA.length * alt;
    // linhas da grade
    for (let r = 0; r <= TABELA.length + 1; r++) {
      const y = r === 0 ? y0 : y0 + cab + (r - 1) * alt;
      s += `<path d="M10 ${y} H630" stroke="${TINTA}" stroke-width="1.5"/>`;
    }
    xs.forEach(x => { s += `<path d="M${x} ${y0} V${fim}" stroke="${TINTA}" stroke-width="1.5"/>`; });
    s += texto(10, fim + 18, '* O 3º dígito só aparece nos resistores de 5 faixas.', { tam: 12, ancora: 'start' });
    s += texto(10, fim + 34, '  Nos de 4 faixas (como os do jogo), a 3ª faixa já é o multiplicador.', { tam: 12, ancora: 'start' });
    return [s, fim + 40 - y0];
  }

  // Resistor grande com as faixas indicadas e a tabela embaixo. Ex.: 'resistor:vermelho,vermelho,marrom'.
  // 'resistor-explicado:...' mostra também a conta.
  function ilustracaoResistor(cores, explicado, comTabela = true) {
    const f = cores.split(',');
    const L = 280, cx = 320, cy = 56;
    let s = `<path d="M70 ${cy} H570" stroke="#9aa0a6" stroke-width="5"/><g transform="translate(${cx} ${cy})">${resistorSVG(f, { L, h: 72 })}</g>`;
    const xs = [-0.2, -0.08, 0.04, 0.2].map(p => cx + p * L);
    const rot = ['1º dígito', '2º dígito', 'multiplicador', 'tolerância'];
    const destino = [140, 260, 390, 520];
    const m = ORDEM.indexOf(f[2]);
    const valores = [ORDEM.indexOf(f[0]), ORDEM.indexOf(f[1]), m ? '0'.repeat(m) : 'nenhum zero', '±5%'];
    xs.forEach((x, i) => {
      s += `<path d="M${x} ${cy + 30} L${destino[i]} 106" stroke="${TINTA}" stroke-width="1.5"/>`;
      s += texto(destino[i], 122, rot[i], { tam: 14, peso: 700 });
      if (explicado) s += texto(destino[i], 142, `${i < 3 ? f[i] : 'ouro'} = ${valores[i]}`, { tam: 13, cor: '#8e44ad', peso: 700 });
    });
    let topo = 136;
    if (explicado) {
      const v = valorDasFaixas(f);
      s += texto(320, 172, `${valores[0]}${valores[1]} ${m ? 'seguido de ' + '0'.repeat(m) : 'sem zeros'} = ${num(v)} Ω${v >= 1000 ? ` = ${ohms(v)}` : ''}`, { tam: 20, peso: 700 });
      topo = 188;
    }
    if (!comTabela) return [640, topo, s];
    const [tab, h] = tabelaCores(topo);
    return [640, topo + h, s + tab];
  }

  function ilustracao(id) {
    let r;
    if (id.startsWith('resistor:')) r = ilustracaoResistor(id.slice(9), false);
    else if (id.startsWith('resistor-explicado:')) r = ilustracaoResistor(id.slice(19), true);
    else if (ILUSTRACOES[id]) r = ILUSTRACOES[id]();
    else return '';
    const [w, h, s] = r;
    return `<svg viewBox="0 0 ${w} ${h}" role="img" shape-rendering="crispEdges" font-family="${FONTE}">${s}</svg>`;
  }

  // ---------------------------------------------------------------- cenários
  function fundoLaboratorio() {
    let s = `<defs>
      <linearGradient id="lab-parede" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1e9f8"/><stop offset="1" stop-color="#e2d4ee"/></linearGradient>
      <linearGradient id="lab-luz" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#lab-parede)"/>
    <rect x="160" y="0" width="320" height="12" fill="#fff"/><rect x="1080" y="0" width="320" height="12" fill="#fff"/>
    <g transform="translate(1220 70)">
      <rect width="330" height="250" rx="6" fill="#fff"/>
      <rect x="12" y="12" width="148" height="226" fill="#cfe7f6"/><rect x="170" y="12" width="148" height="226" fill="#cfe7f6"/>
      <path d="M12 190 Q50 150 90 178 T160 168 V238 H12 Z M170 200 Q220 160 260 190 T318 176 V238 H170 Z" fill="#a9d6a0"/>
      <path d="M-40 250 L180 250 L420 640 L120 640 Z" fill="url(#lab-luz)" opacity=".5"/>
    </g>
    <g transform="translate(70 80)">
      <rect width="450" height="262" rx="8" fill="#a29eaa"/><rect x="10" y="10" width="430" height="242" rx="4" fill="#fdfdfd"/>
      <text x="40" y="84" font-family="'Gochi Hand',cursive" font-size="54" fill="#643a96">V = R · I</text>
      <path d="M40 156 h40 l8 -14 l14 28 l14 -28 l14 28 l14 -28 l8 14 h40" stroke="#2a6fdb" stroke-width="4" fill="none"/>
      <text x="96" y="206" font-family="'Gochi Hand',cursive" font-size="30" fill="#2a6fdb">220 Ω</text>
      <text x="290" y="130" font-family="'Gochi Hand',cursive" font-size="34" fill="#d62f6b">1 kΩ</text>
      <text x="282" y="196" font-family="'Gochi Hand',cursive" font-size="26" fill="#3a3a3a">= 1000 Ω</text>
      <rect x="160" y="252" width="130" height="10" fill="#7d7886"/>
    </g>
    <g transform="translate(600 36)">
      <rect x="-12" y="-8" width="484" height="16" rx="8" fill="#3a3346"/>
      <rect width="460" height="300" fill="#f7dbe8"/>
      <rect x="150" y="38" width="282" height="138" rx="12" fill="#e9558b"/>
      <text x="291" y="78" font-family="'Fredoka',sans-serif" font-weight="700" font-size="26" fill="#fff" text-anchor="middle">MULHERES NO</text>
      <text x="291" y="112" font-family="'Fredoka',sans-serif" font-weight="700" font-size="26" fill="#fff" text-anchor="middle">LABORATÓRIO</text>
      <text x="291" y="146" font-family="'Fredoka',sans-serif" font-weight="700" font-size="26" fill="#fff" text-anchor="middle">DE ELETRÔNICA</text>
      <rect x="230" y="196" width="122" height="34" rx="17" fill="#fff"/>
      <text x="291" y="220" font-family="'Fredoka',sans-serif" font-weight="600" font-size="18" fill="#e9558b" text-anchor="middle">OFICINA</text>
      <rect x="26" y="70" width="100" height="150" rx="8" fill="#fff"/>
      ${Array.from({ length: 6 }, (_, c) => Array.from({ length: 9 }, (_, l) => `<circle cx="${42 + c * 14}" cy="${86 + l * 15}" r="2.4" fill="#bbb"/>`).join('')).join('')}
    </g>
    <rect x="0" y="430" width="1600" height="16" fill="#3b3a44"/>
    <rect x="40" y="446" width="14" height="160" fill="#3b3a44"/><rect x="1546" y="446" width="14" height="160" fill="#3b3a44"/>
    <g transform="translate(150 322)">
      <rect width="220" height="108" rx="8" fill="#d9d9de"/><rect x="12" y="12" width="124" height="84" rx="4" fill="#132530"/>
      <path d="M18 40 q10 -18 20 0 t20 0 t20 0 t20 0 t20 0" stroke="#ffd23f" stroke-width="3" fill="none"/>
      <path d="M18 80 v-16 h16 v16 h16 v-16 h16 v16 h16 v-16 h16 v16" stroke="#3fe0e0" stroke-width="3" fill="none"/>
      <circle cx="166" cy="34" r="12" fill="#8a8a94"/><circle cx="196" cy="34" r="8" fill="#8a8a94"/><circle cx="166" cy="72" r="8" fill="#8a8a94"/><circle cx="196" cy="72" r="12" fill="#8a8a94"/>
    </g>
    <g transform="translate(410 352)">
      <rect width="160" height="78" rx="6" fill="#2d2d33"/><rect x="12" y="12" width="70" height="24" rx="3" fill="#2a0c0c"/>
      <text x="47" y="30" font-family="ui-monospace,monospace" font-size="17" fill="#ff5b5b" text-anchor="middle">5.00</text>
      <rect x="12" y="42" width="70" height="24" rx="3" fill="#2a0c0c"/>
      <text x="47" y="60" font-family="ui-monospace,monospace" font-size="17" fill="#ff5b5b" text-anchor="middle">0.01</text>
      <circle cx="112" cy="40" r="13" fill="#666"/><circle cx="142" cy="40" r="9" fill="#666"/>
    </g>
    <g transform="translate(610 360)">
      <rect width="170" height="70" rx="6" fill="#e6e6ea"/><rect x="12" y="12" width="96" height="30" rx="3" fill="#c6d7c0"/>
      <text x="100" y="35" font-family="ui-monospace,monospace" font-size="20" fill="#223" text-anchor="end">220.4</text>
      <circle cx="140" cy="27" r="13" fill="#999"/><rect x="12" y="50" width="22" height="10" rx="2" fill="#d62828"/><rect x="40" y="50" width="22" height="10" rx="2" fill="#333"/>
    </g>
    <g transform="translate(1240 332)">
      <rect width="210" height="98" rx="8" fill="#eaeaee"/><rect x="12" y="12" width="120" height="74" rx="4" fill="#0f2418"/>
      <path d="M18 50 q15 -26 30 0 t30 0 t30 0" stroke="#5dff9a" stroke-width="3" fill="none"/>
      <rect x="146" y="16" width="50" height="10" rx="3" fill="#bbb"/><rect x="146" y="34" width="50" height="10" rx="3" fill="#bbb"/><rect x="146" y="52" width="50" height="10" rx="3" fill="#bbb"/>
    </g>
    <path d="M880 446 q10 90 -20 150 M900 446 q4 70 30 140 M920 446 q-14 60 6 110" stroke="#c62828" stroke-width="5" fill="none"/>
    <path d="M1000 446 q8 80 -12 130 M1018 446 q12 70 30 120" stroke="#222" stroke-width="5" fill="none"/>
    <rect x="0" y="606" width="1600" height="294" fill="#bdb4c9"/>
    <rect x="0" y="600" width="1600" height="44" fill="#24232b"/>
    <rect x="0" y="644" width="1600" height="256" fill="#33323c"/>
    <rect x="0" y="644" width="1600" height="10" fill="#1b1a21"/>
    ${Array.from({ length: 7 }, (_, i) => `<rect x="${120 + i * 210}" y="690" width="150" height="140" rx="6" fill="#3d3c47"/><rect x="${183 + i * 210}" y="752" width="24" height="6" rx="3" fill="#6b6a78"/>`).join('')}
    <g transform="translate(330 560)">
      <rect width="190" height="40" rx="4" fill="#f3f2ee"/>
      ${Array.from({ length: 16 }, (_, c) => `<rect x="${10 + c * 11}" y="10" width="4" height="4" fill="#555"/><rect x="${10 + c * 11}" y="24" width="4" height="4" fill="#555"/>`).join('')}
      <path d="M40 10 q20 -30 50 0" stroke="#e63946" stroke-width="4" fill="none"/><path d="M110 24 q20 -36 60 0" stroke="#2a9d8f" stroke-width="4" fill="none"/>
    </g>
    <g transform="translate(600 514)"><rect width="64" height="88" rx="10" fill="#f07a2a"/><rect x="7" y="7" width="50" height="74" rx="6" fill="#3a3a42"/><rect x="12" y="12" width="40" height="18" rx="3" fill="#cfe0c8"/><circle cx="32" cy="50" r="10" fill="#666"/></g>
    <g transform="translate(720 540)"><rect width="110" height="62" rx="6" fill="#222"/><rect x="10" y="10" width="54" height="20" rx="2" fill="#0c1410"/><circle cx="82" cy="44" r="7" fill="#d62828"/><circle cx="98" cy="44" r="7" fill="#111" stroke="#555"/></g>
    <g transform="translate(870 566)"><rect width="58" height="36" rx="4" fill="#ff8a1f"/><rect x="5" y="5" width="48" height="10" rx="2" fill="#ffb066"/></g>
    <g transform="translate(1000 552)"><circle cx="30" cy="30" r="30" fill="#fff"/><path d="M30 30 L30 0 A30 30 0 0 1 56 15 Z" fill="#e63946"/><path d="M30 30 L56 15 A30 30 0 0 1 56 45 Z" fill="#f4c430"/><path d="M30 30 L56 45 A30 30 0 0 1 30 60 Z" fill="#2a9d4b"/><path d="M30 30 L30 60 A30 30 0 0 1 4 45 Z" fill="#2364d2"/><path d="M30 30 L4 45 A30 30 0 0 1 4 15 Z" fill="#8e44ad"/><circle cx="30" cy="30" r="10" fill="#fff"/></g>`;
    return s;
  }

  function fundoCorredor() {
    return `<defs><linearGradient id="cor-parede" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ece4f4"/><stop offset="1" stop-color="#ddd0ea"/></linearGradient></defs>
    <rect width="1600" height="900" fill="url(#cor-parede)"/>
    <rect x="0" y="0" width="1600" height="40" fill="#d3c6e1"/>
    <rect x="300" y="40" width="240" height="10" fill="#fff"/><rect x="1060" y="40" width="240" height="10" fill="#fff"/>
    <rect x="0" y="690" width="1600" height="210" fill="#b8adc6"/>
    <rect x="0" y="680" width="1600" height="16" fill="#8f82a0"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 200} 696 L${i * 200 - 80} 900" stroke="#a89cb7" stroke-width="3"/>`).join('')}
    <g transform="translate(620 150)">
      <rect width="360" height="540" fill="#4b2a70"/>
      <rect x="20" y="20" width="320" height="520" fill="#7c4fb0"/>
      <rect x="80" y="70" width="200" height="130" rx="6" fill="#cfe7f6" opacity=".85"/>
      <path d="M80 160 L170 70 M150 200 L280 90" stroke="#fff" stroke-width="8" opacity=".35"/>
      <rect x="276" y="290" width="40" height="14" rx="7" fill="#e7d6f6"/>
      <rect x="100" y="250" width="160" height="200" rx="8" fill="#6a41a0"/>
    </g>
    <g transform="translate(700 84)"><rect width="200" height="52" rx="10" fill="#fff" stroke="#4b2a70" stroke-width="4"/>
      <text x="100" y="36" font-family="'Fredoka',sans-serif" font-weight="700" font-size="26" fill="#4b2a70" text-anchor="middle">LAB 405-1</text></g>
    <g transform="translate(250 200) rotate(-2)">
      <rect width="290" height="390" rx="6" fill="#643a96"/>
      <text x="145" y="92" font-family="'Fredoka',sans-serif" font-weight="700" font-size="74" fill="#fff" text-anchor="middle">LABe</text>
      <text x="145" y="132" font-family="'Gochi Hand',cursive" font-size="25" fill="#f3d7ff" text-anchor="middle">Mulheres no Lab</text>
      <text x="145" y="160" font-family="'Gochi Hand',cursive" font-size="25" fill="#f3d7ff" text-anchor="middle">de Eletrônica</text>
      <rect x="40" y="186" width="210" height="64" rx="32" fill="#f59ac8"/>
      <text x="145" y="214" font-family="'Gochi Hand',cursive" font-size="20" fill="#3b1f5c" text-anchor="middle">Não precisa de</text>
      <text x="145" y="238" font-family="'Gochi Hand',cursive" font-size="20" fill="#3b1f5c" text-anchor="middle">conhecimentos prévios!</text>
      <text x="145" y="290" font-family="'Gochi Hand',cursive" font-size="24" fill="#fff" text-anchor="middle">Sábados · 9h às 12h</text>
      <g transform="translate(70 312) scale(.6)">${ledLateral('vermelho', { aceso: true })}</g>
      <g transform="translate(190 330)">${resistorSVG(['marrom', 'preto', 'vermelho'], { L: 70, h: 22 })}</g>
    </g>
    <g transform="translate(1080 250)">
      <rect width="330" height="230" rx="8" fill="#c89b6d" stroke="#9c7349" stroke-width="8"/>
      <rect x="30" y="26" width="110" height="80" fill="#fff" transform="rotate(-4 85 66)"/><rect x="170" y="30" width="120" height="90" fill="#fff6c9" transform="rotate(3 230 75)"/>
      <rect x="60" y="126" width="130" height="80" fill="#ffd9ec" transform="rotate(2 125 166)"/><rect x="214" y="138" width="90" height="70" fill="#d9f0ff"/>
      <circle cx="85" cy="30" r="6" fill="#e63946"/><circle cx="230" cy="34" r="6" fill="#2a9d8f"/><circle cx="125" cy="130" r="6" fill="#f4c430"/>
    </g>`;
  }

  // Sala com computadores, onde acontece a oficina de Arduino
  function fundoComputadores() {
    let s = `<defs><linearGradient id="pc-parede" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9eef4"/><stop offset="1" stop-color="#d5dde8"/></linearGradient></defs>
      <rect width="1600" height="900" fill="url(#pc-parede)"/>
      <rect x="160" y="0" width="320" height="12" fill="#fff"/><rect x="1080" y="0" width="320" height="12" fill="#fff"/>
      <g transform="translate(80 70)"><rect width="520" height="270" rx="8" fill="#a29eaa"/><rect x="10" y="10" width="500" height="250" rx="4" fill="#fdfdfd"/>
        <text x="36" y="70" font-family="ui-monospace,monospace" font-size="34" fill="#2364d2">void loop() {</text>
        <text x="76" y="120" font-family="ui-monospace,monospace" font-size="30" fill="#d62f6b">digitalWrite(13, HIGH);</text>
        <text x="76" y="164" font-family="ui-monospace,monospace" font-size="30" fill="#3a3a3a">delay(1000);</text>
        <text x="36" y="212" font-family="ui-monospace,monospace" font-size="34" fill="#2364d2">}</text></g>
      <g transform="translate(700 60)"><rect width="420" height="280" fill="#ff8a1f"/><rect x="20" y="20" width="380" height="240" fill="#fff3e6"/>
        <text x="210" y="110" font-family="${FONTE}" font-size="46" font-weight="700" fill="#643a96" text-anchor="middle">OFICINA</text>
        <text x="210" y="170" font-family="${FONTE}" font-size="46" font-weight="700" fill="#00979d" text-anchor="middle">ARDUINO</text>
        <g transform="translate(150 190) scale(.4)">${placaArduino()}</g></g>
      <g transform="translate(1230 70)"><rect width="300" height="250" rx="6" fill="#fff"/><rect x="12" y="12" width="132" height="226" fill="#cfe7f6"/><rect x="156" y="12" width="132" height="226" fill="#cfe7f6"/>
        <path d="M12 190 Q50 150 90 178 T144 168 V238 H12 Z M156 200 Q200 160 240 190 T288 176 V238 H156 Z" fill="#a9d6a0"/></g>
      <rect x="0" y="606" width="1600" height="294" fill="#b9b2c6"/>
      <rect x="0" y="560" width="1600" height="40" fill="#e3ded5"/><rect x="0" y="600" width="1600" height="300" fill="#8f8aa0"/>
      <rect x="0" y="600" width="1600" height="10" fill="#6f6a80"/>`;
    for (let i = 0; i < 5; i++) {
      const x = 40 + i * 320;
      s += `<rect x="${x + 40}" y="380" width="230" height="150" rx="6" fill="#2b2b33"/><rect x="${x + 52}" y="392" width="206" height="118" fill="#00979d"/>
        <rect x="${x + 52}" y="392" width="206" height="18" fill="#006468"/>
        <rect x="${x + 64}" y="420" width="120" height="6" fill="#bff4f6"/><rect x="${x + 64}" y="436" width="160" height="6" fill="#ffb86c"/><rect x="${x + 64}" y="452" width="90" height="6" fill="#bff4f6"/><rect x="${x + 64}" y="468" width="140" height="6" fill="#ffb86c"/>
        <rect x="${x + 140}" y="530" width="30" height="30" fill="#2b2b33"/><rect x="${x + 100}" y="556" width="110" height="8" fill="#2b2b33"/>
        <rect x="${x + 30}" y="566" width="170" height="20" fill="#3a3a44"/>
        <g transform="translate(${x + 214} 560) scale(.2)">${placaArduino({ destaque13: i % 2 === 0 })}</g>`;
    }
    return s;
  }

  function fundo(id) {
    const conteudo = id === 'corredor' ? fundoCorredor() : id === 'computadores' ? fundoComputadores() : fundoLaboratorio();
    return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${conteudo}</svg>`;
  }

  return {
    CORES, ORDEM, COR_LED, ohms, faixasDoValor, valorDasFaixas,
    resistorSVG, ledLateral, icone, ilustracao, fundo,
  };
})();
