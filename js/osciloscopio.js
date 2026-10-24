/*
 * osciloscopio.js — minijogo do chefão final: um gerador de funções manda um sinal para o osciloscópio
 * e a jogadora gira os botões VOLTS/DIV, TEMPO/DIV e TRIGGER até a onda aparecer certinha na tela.
 * Sem trigger (nível fora da onda), cada desenho começa num ponto diferente e a imagem corre.
 */
const Osciloscopio = (() => {
  'use strict';
  // tela de 10 × 8 divisões, com 20 pixels por divisão (ampliada com image-rendering: pixelated)
  const DIV = 20, TW = 10 * DIV, TH = 8 * DIV;
  const VOLTS = [0.5, 1, 2, 5, 10];                // V por divisão
  const TEMPOS = [0.1, 0.2, 0.5, 1, 2, 5, 10];     // ms por divisão
  const NIVEL = { min: -8, max: 8, passo: 1 };     // nível do trigger, em volts
  const MARGEM = 0.25;                              // o nível precisa ficar um pouco para dentro da onda
  const CORRE = 1.3;                                // sem trigger, ondas por segundo que a imagem anda
  const RASTROS = 4;                                // desenhos que ficam na tela, o último mais forte

  const num = n => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

  // ---------------------------------------------------------------- o sinal do gerador
  // sinal: { forma: 'seno', vpp, f } ou { forma: 'quadrada', alto, baixo, f, ciclo }; t em segundos
  function valor(s, t) {
    if (s.forma === 'quadrada') return ((t * s.f) % 1 + 1) % 1 < s.ciclo ? s.alto : s.baixo;
    return s.vpp / 2 * Math.sin(2 * Math.PI * s.f * t);
  }
  const extremos = s => (s.forma === 'quadrada' ? { min: s.baixo, max: s.alto } : { min: -s.vpp / 2, max: s.vpp / 2 });

  // primeira vez, a partir de t, em que o sinal sobe passando pelo nível do trigger
  function disparo(s, nivel, t) {
    let fase = 0;   // na quadrada, a subida é no começo de cada período
    if (s.forma !== 'quadrada') fase = Math.asin(nivel / (s.vpp / 2)) / (2 * Math.PI);
    return (Math.ceil(t * s.f - fase) + fase) / s.f;
  }

  // como a onda aparece na tela com estes ajustes (zero: altura da linha do 0 V, em divisões)
  function avaliar(sinal, aj, zero = 0) {
    const { min, max } = extremos(sinal);
    const altura = (max - min) / aj.volts;   // divisões de pico a pico
    return {
      altura,
      cabe: zero + max / aj.volts <= 4 && zero + min / aj.volts >= -4,
      grande: altura >= 4,
      ondas: 10 * aj.tempo / 1000 * sinal.f, // ondas completas na tela
      disparou: aj.trigger > min + MARGEM && aj.trigger < max - MARGEM,
    };
  }
  const ondasBoas = s => s.ondas >= 2 && s.ondas <= 4;
  const METAS = {
    volts: s => s.cabe && s.grande,
    tempo: s => s.cabe && ondasBoas(s),
    trigger: s => s.disparou,
    tudo: s => s.cabe && s.grande && ondasBoas(s) && s.disparou,
  };

  // ---------------------------------------------------------------- estado
  let el = null, ctx = null, cfg = null, aj = null, venceu = false, raf = 0, t0 = 0, rastros = [];

  function dica(s) {
    if (venceu) return ['Golpe certeiro!', true];
    const m = cfg.meta, todas = m === 'tudo';
    if (!s.cabe) return ['A onda está saindo da tela: <b>aumente</b> o VOLTS/DIV.'];
    if ((m === 'volts' || todas) && !s.grande) return ['A onda está baixinha: <b>diminua</b> o VOLTS/DIV para ela crescer.'];
    if (m === 'tempo' || todas) {
      if (s.ondas > 4) return [`Umas ${Math.round(s.ondas)} ondas espremidas: <b>diminua</b> o TEMPO/DIV.`];
      if (s.ondas < 2) return ['Dá para ver menos de 2 ondas: <b>aumente</b> o TEMPO/DIV.'];
    }
    if (!s.disparou) return ['O nível do trigger está fora da onda e a imagem corre: leve o <b>TRIGGER</b> para dentro dela.'];
    return ['Quase lá!'];
  }

  // ---------------------------------------------------------------- desenho
  function px(x, y, w, h, cor) { ctx.fillStyle = cor; ctx.fillRect(Math.round(x), Math.round(y), w, h); }

  function desenhar(agora) {
    const s = avaliar(cfg.sinal, aj, cfg.zero);
    px(0, 0, TW, TH, '#0f1f24');
    for (let x = DIV; x < TW; x += DIV) for (let y = 0; y < TH; y += 4) px(x, y, 1, 1, '#2c5560');
    for (let y = DIV; y < TH; y += DIV) for (let x = 0; x < TW; x += 4) px(x, y, 1, 1, '#2c5560');
    px(TW / 2, 0, 1, TH, '#2c5560'); px(0, TH / 2, TW, 1, '#2c5560');
    for (let x = 0; x < TW; x += 4) px(x, TH / 2 - 1, 1, 3, '#3d6b75');
    for (let y = 0; y < TH; y += 4) px(TW / 2 - 1, y, 3, 1, '#3d6b75');
    // onde cada tensão fica na tela
    const yDe = v => TH / 2 - (cfg.zero + v / aj.volts) * DIV;
    // marcador do 0 V (amarelo, na esquerda) e do nível do trigger (rosa, na direita)
    const marca = (y, x, dir, cor) => {
      const yy = Math.max(2, Math.min(TH - 3, Math.round(y)));
      for (let k = 0; k < 3; k++) px(x + dir * k, yy - 2 + k, 1, 5 - 2 * k, cor);
    };
    marca(yDe(0), 0, 1, '#ffd23f');
    marca(yDe(aj.trigger), TW - 1, -1, '#ff6ec7');
    // a varredura: com trigger, o ponto do disparo fica no meio da tela; sem trigger, a imagem anda
    const seg = (agora - t0) / 1000;
    const dt = aj.tempo / 1000 / DIV;    // segundos por pixel
    const inicio = s.disparou ? disparo(cfg.sinal, aj.trigger, seg) - TW / 2 * dt : seg * CORRE / cfg.sinal.f;
    // cada coluna da tela vira um risco vertical [de, até] que liga a onda de um pixel ao outro
    const colunas = [];
    let yAnt = null;
    for (let x = 0; x < TW; x++) {
      let lo = Infinity, hi = -Infinity, y = 0;
      for (let k = 0; k < 4; k++) {
        y = yDe(valor(cfg.sinal, inicio + (x + k / 4) * dt));
        lo = Math.min(lo, y); hi = Math.max(hi, y);
      }
      if (yAnt !== null) { lo = Math.min(lo, yAnt); hi = Math.max(hi, yAnt); }
      yAnt = y;
      colunas.push([Math.max(0, Math.round(lo)), Math.min(TH - 1, Math.round(hi))]);
    }
    // os desenhos anteriores aparecem mais fracos, como o fósforo da tela apagando
    rastros.push(colunas);
    if (rastros.length > RASTROS) rastros.shift();
    rastros.forEach((r, i) => {
      const atual = i === rastros.length - 1;
      r.forEach(([a, b], x) => {
        if (b < a) return;
        if (atual) { px(x, a - 1, 1, b - a + 3, 'rgba(139,255,107,.3)'); px(x, a, 1, b - a + 1, '#8bff6b'); }
        else px(x, a, 1, b - a + 1, `rgba(139,255,107,${0.1 * (i + 1)})`);
      });
    });
  }

  function atualizarPainel() {
    const s = avaliar(cfg.sinal, aj, cfg.zero);
    el.querySelector('[data-valor="volts"]').textContent = `${num(aj.volts)} V`;
    el.querySelector('[data-valor="tempo"]').textContent = `${num(aj.tempo)} ms`;
    el.querySelector('[data-valor="trigger"]').textContent = `${num(aj.trigger)} V`;
    el.querySelector('.osc-lampada').classList.toggle('aceso', s.disparou);
    el.querySelector('.osc-trig').textContent = s.disparou ? 'TRIG: imagem parada' : 'SEM TRIGGER: a imagem corre';
    const [texto, certo] = dica(s);
    const d = el.querySelector('.osc-dica');
    d.innerHTML = texto;
    d.className = 'osc-dica' + (certo ? ' certo' : '');
    el.querySelectorAll('.osc-ctrl button').forEach(b => {
      const c = b.dataset.c, lista = c === 'volts' ? VOLTS : c === 'tempo' ? TEMPOS : null;
      const fim = lista ? (+b.dataset.d < 0 ? aj[c] === lista[0] : aj[c] === lista[lista.length - 1])
        : (+b.dataset.d < 0 ? aj.trigger <= NIVEL.min : aj.trigger >= NIVEL.max);
      b.disabled = venceu || !cfg.controles.includes(c) || fim;
    });
  }

  function quadro(agora) {
    desenhar(agora);
    raf = requestAnimationFrame(quadro);
  }

  // ---------------------------------------------------------------- controles
  function girar(c, d) {
    if (venceu || !cfg.controles.includes(c)) return;
    const lista = c === 'volts' ? VOLTS : c === 'tempo' ? TEMPOS : null;
    if (lista) aj[c] = lista[Math.max(0, Math.min(lista.length - 1, lista.indexOf(aj[c]) + d))];
    else aj.trigger = Math.max(NIVEL.min, Math.min(NIVEL.max, aj.trigger + d * NIVEL.passo));
    rastros = [];   // a tela muda de escala: o desenho antigo não vale mais
    if (typeof Som !== 'undefined') Som.tocar('clique');
    if (METAS[cfg.meta](avaliar(cfg.sinal, aj, cfg.zero))) {
      venceu = true;
      if (cfg.aoVencer) cfg.aoVencer({ ...aj });
    }
    atualizarPainel();
  }

  const controle = (c, rotulo, menos, mais, nomes) => `
    <div class="osc-ctrl${cfg.controles.includes(c) ? ' foco' : ''}">
      <span class="osc-rotulo">${rotulo}</span>
      <button type="button" data-c="${c}" data-d="-1" aria-label="${nomes[0]}">${menos}</button>
      <span class="osc-valor" data-valor="${c}"></span>
      <button type="button" data-c="${c}" data-d="1" aria-label="${nomes[1]}">${mais}</button>
    </div>`;

  // cfg: { sinal, zero: 0, inicio: { volts, tempo, trigger }, meta: 'volts' | 'tempo' | 'trigger' | 'tudo',
  //        controles: ['volts', ...] (os outros ficam travados), aoVencer(ajustes) }
  function iniciar(painel, opcoes) {
    parar();
    cfg = Object.assign({}, opcoes);
    cfg.zero = cfg.zero || 0;
    cfg.controles = cfg.controles || ['volts', 'tempo', 'trigger'];
    aj = Object.assign({ volts: 1, tempo: 1, trigger: 0 }, cfg.inicio);
    venceu = false;
    rastros = [];
    const freq = cfg.sinal.f >= 1000 ? `${num(cfg.sinal.f / 1000)} kHz` : `${num(cfg.sinal.f)} Hz`;
    painel.innerHTML = `<div class="osc">
      <div class="osc-aparelho">
        <div class="osc-esq">
          <canvas class="osc-tela pixelado" width="${TW}" height="${TH}" role="img" aria-label="Tela do osciloscópio"></canvas>
          <div class="osc-status"><span class="osc-lampada"></span><span class="osc-trig"></span><span class="osc-sinal">CH1 · ${cfg.sinal.forma === 'quadrada' ? 'PWM do Arduino' : 'gerador'} ${freq}</span></div>
        </div>
        <div class="osc-controles">
          ${controle('volts', 'VOLTS/DIV', '◀', '▶', ['Diminuir volts por divisão', 'Aumentar volts por divisão'])}
          ${controle('tempo', 'TEMPO/DIV', '◀', '▶', ['Diminuir tempo por divisão', 'Aumentar tempo por divisão'])}
          ${controle('trigger', 'TRIGGER', '▼', '▲', ['Baixar o nível do trigger', 'Subir o nível do trigger'])}
        </div>
      </div>
      <p class="osc-dica" aria-live="polite"></p>
    </div>`;
    el = painel;
    ctx = painel.querySelector('.osc-tela').getContext('2d');
    ctx.fillStyle = '#0f1f24';
    ctx.fillRect(0, 0, TW, TH);
    painel.querySelector('.osc-controles').addEventListener('click', ev => {
      const b = ev.target.closest('button');
      if (b) girar(b.dataset.c, +b.dataset.d);
    });
    atualizarPainel();
    t0 = performance.now();
    raf = requestAnimationFrame(quadro);
  }

  function parar() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  return { iniciar, parar, avaliar, METAS, VOLTS, TEMPOS };
})();
