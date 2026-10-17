/*
 * simulador.js — calcula tensões e correntes do circuito montado na protoboard.
 *
 * Usa análise nodal: cada conjunto de furos ligados entre si (uma coluna de 5
 * furos, uma trilha de alimentação ou furos unidos por fios) vira um "nó".
 * O LED é modelado como uma pequena "bateria" de ~2 V (tensão direta) em série
 * com uma resistência pequena, e só conduz no sentido ânodo → cátodo.
 *
 * Não depende da página: pode ser testado sozinho (veja testes/simulador.html).
 */
(function (raiz) {
  'use strict';

  const FONTE_V = 5;        // tensão da fonte (V)
  const FONTE_R = 0.05;     // resistência interna da fonte (Ω)
  const G_MIN = 1e-9;       // condutância mínima: evita nós "soltos" no cálculo

  const LED = {
    tensao: { vermelho: 1.8, amarelo: 1.9, verde: 2.0, azul: 2.8, branco: 2.9 },
    resistencia: 12,        // resistência interna do LED conduzindo (Ω)
    correnteAcesa: 0.001,   // a partir de 1 mA consideramos o LED aceso
    correntePlena: 0.015,   // 15 mA = brilho máximo
    correnteQueima: 0.045,  // acima de 45 mA o LED queima
  };

  function criarUniao() {
    const pai = new Map();
    function achar(x) {
      if (!pai.has(x)) pai.set(x, x);
      let r = x;
      while (pai.get(r) !== r) r = pai.get(r);
      while (pai.get(x) !== r) { const prox = pai.get(x); pai.set(x, r); x = prox; }
      return r;
    }
    function unir(a, b) { a = achar(a); b = achar(b); if (a !== b) pai.set(a, b); }
    return { achar, unir };
  }

  // Resolve A·x = b por eliminação de Gauss com pivoteamento parcial.
  function resolverSistema(A, b) {
    const n = b.length;
    for (let c = 0; c < n; c++) {
      let piv = c;
      for (let l = c + 1; l < n; l++) if (Math.abs(A[l][c]) > Math.abs(A[piv][c])) piv = l;
      if (piv !== c) {
        [A[c], A[piv]] = [A[piv], A[c]];
        const t = b[c]; b[c] = b[piv]; b[piv] = t;
      }
      const d = A[c][c];
      if (Math.abs(d) < 1e-30) continue;
      for (let l = c + 1; l < n; l++) {
        const f = A[l][c] / d;
        if (f === 0) continue;
        for (let k = c; k < n; k++) A[l][k] -= f * A[c][k];
        b[l] -= f * b[c];
      }
    }
    const x = new Float64Array(n);
    for (let l = n - 1; l >= 0; l--) {
      let s = b[l];
      for (let k = l + 1; k < n; k++) s -= A[l][k] * x[k];
      x[l] = Math.abs(A[l][l]) < 1e-30 ? 0 : s / A[l][l];
    }
    return x;
  }

  /*
   * pecas: [{ tipo: 'fio'|'resistor'|'led', a, b, valor?, cor?, queimado? }]
   *        no LED, "a" é o ânodo (perna longa) e "b" é o cátodo.
   * noDoFuro(furo): nome do nó "físico" do furo (ex.: 'S3' = coluna 3 de cima).
   *        As trilhas da fonte são 'TP'/'BP' (+) e 'TN'/'BN' (−).
   */
  function calcular(pecas, noDoFuro) {
    const uniao = criarUniao();
    uniao.unir('TP', 'BP');
    uniao.unir('TN', 'BN');
    for (const p of pecas) if (p.tipo === 'fio') uniao.unir(noDoFuro(p.a), noDoFuro(p.b));

    const no = furo => uniao.achar(noDoFuro(furo));
    const POS = uniao.achar('TP');
    const NEG = uniao.achar('TN');
    const leds = pecas.filter(p => p.tipo === 'led');
    const resistores = pecas.filter(p => p.tipo === 'resistor');

    // numeração dos nós; o negativo da fonte é a referência (0 V)
    const indice = new Map();
    const idx = n => {
      if (n === NEG) return -1;
      if (!indice.has(n)) indice.set(n, indice.size);
      return indice.get(n);
    };

    let x = new Float64Array(0);
    const v = i => (i < 0 ? 0 : x[i]);
    const res = { no, curto: POS === NEG, correnteFonte: 0, leds: [], resistores: [] };
    res.tensaoNo = n => (n === NEG ? 0 : indice.has(n) ? x[indice.get(n)] : 0);
    res.tensao = furo => res.tensaoNo(no(furo));

    if (res.curto) {
      res.leds = leds.map(p => ({ peca: p, vak: 0, corrente: 0, aceso: false, brilho: 0, invertido: false, emCurto: no(p.a) === no(p.b) }));
      res.resistores = resistores.map(p => ({ peca: p, tensao: 0, corrente: 0 }));
      return res;
    }

    const iPos = idx(POS);
    const rs = resistores.map(p => ({ peca: p, i: idx(no(p.a)), j: idx(no(p.b)) }));
    const ls = leds.map(p => ({ peca: p, a: idx(no(p.a)), k: idx(no(p.b)), vf: LED.tensao[p.cor] || 2, conduz: !p.queimado }));
    const n = indice.size;

    // O LED não é linear: chutamos quais conduzem, resolvemos e corrigimos até estabilizar.
    for (let volta = 0; volta < 60; volta++) {
      const A = Array.from({ length: n }, () => new Float64Array(n));
      const b = new Float64Array(n);
      const condutancia = (i, j, g) => {
        if (i >= 0) A[i][i] += g;
        if (j >= 0) A[j][j] += g;
        if (i >= 0 && j >= 0) { A[i][j] -= g; A[j][i] -= g; }
      };
      for (let i = 0; i < n; i++) A[i][i] += G_MIN;
      condutancia(iPos, -1, 1 / FONTE_R);
      b[iPos] += FONTE_V / FONTE_R;
      for (const r of rs) condutancia(r.i, r.j, 1 / r.peca.valor);
      for (const l of ls) {
        if (!l.conduz) { condutancia(l.a, l.k, G_MIN); continue; }
        const g = 1 / LED.resistencia;
        condutancia(l.a, l.k, g);
        if (l.a >= 0) b[l.a] += g * l.vf;
        if (l.k >= 0) b[l.k] -= g * l.vf;
      }
      x = resolverSistema(A, b);

      let mudou = false;
      for (const l of ls) {
        if (l.peca.queimado) continue;
        const vak = v(l.a) - v(l.k);
        if (l.conduz && vak < l.vf) { l.conduz = false; mudou = true; }
        else if (!l.conduz && vak > l.vf + 1e-6) { l.conduz = true; mudou = true; }
      }
      if (!mudou) break;
    }

    res.correnteFonte = (FONTE_V - v(iPos)) / FONTE_R;
    res.leds = ls.map(l => {
      const vak = v(l.a) - v(l.k);
      const corrente = l.peca.queimado ? 0 : l.conduz ? (vak - l.vf) / LED.resistencia : vak * G_MIN;
      return {
        peca: l.peca,
        vak,
        corrente,
        aceso: corrente >= LED.correnteAcesa,
        brilho: Math.max(0, Math.min(1, corrente / LED.correntePlena)),
        invertido: !l.peca.queimado && vak < -0.5,
        emCurto: l.a === l.k,
      };
    });
    res.resistores = rs.map(r => {
      const t = v(r.i) - v(r.j);
      return { peca: r.peca, tensao: t, corrente: t / r.peca.valor };
    });
    return res;
  }

  // Igual a calcular(), mas queima (de verdade!) os LEDs com corrente demais.
  // Queima um por vez: num LED em série, quando o primeiro abre, a corrente para.
  function simular(pecas, noDoFuro) {
    const queimouAgora = [];
    for (;;) {
      const res = calcular(pecas, noDoFuro);
      let pior = null;
      for (const l of res.leds) if (l.corrente > LED.correnteQueima && (!pior || l.corrente > pior.corrente)) pior = l;
      if (!pior) { res.queimouAgora = queimouAgora; return res; }
      pior.peca.queimado = true;
      queimouAgora.push(pior.peca);
    }
  }

  raiz.Simulador = { simular, FONTE_V, LED };
})(typeof window !== 'undefined' ? window : globalThis);
