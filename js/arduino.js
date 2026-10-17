/*
 * arduino.js — o Arduino UNO da bancada: editor de código em blocos e um interpretador
 * simples que roda setup() uma vez e loop() para sempre, mudando a tensão dos pinos.
 *
 * Comandos disponíveis: pinMode, digitalWrite, delay, tone, noTone.
 * Cada pino vira uma fonte para o simulador: HIGH = 5 V, LOW = 0 V (com ~25 Ω internos).
 * digitalWrite(HIGH) num pino sem pinMode(OUTPUT) liga só o resistor interno (pull-up),
 * e o LED fica quase apagado, igual na vida real.
 */
const Arduino = (() => {
  'use strict';
  const PINOS = [13, 12, 11, 10, 9, 8, 7];
  const COMANDOS = {
    pinMode: { padrao: { pino: 13, modo: 'OUTPUT' }, campos: [['pino', PINOS], ['modo', ['OUTPUT', 'INPUT']]], ajuda: 'configura o pino como saída (OUTPUT) ou entrada (INPUT)' },
    digitalWrite: { padrao: { pino: 13, valor: 'HIGH' }, campos: [['pino', PINOS], ['valor', ['HIGH', 'LOW']]], ajuda: 'liga (HIGH = 5 V) ou desliga (LOW = 0 V) o pino' },
    delay: { padrao: { ms: 1000 }, campos: [['ms', [100, 250, 500, 1000, 2000]]], ajuda: 'espera um tempo, em milissegundos (1000 ms = 1 s)' },
    tone: { padrao: { pino: 8, freq: 440 }, campos: [['pino', PINOS], ['freq', [262, 330, 392, 440, 523, 880]]], ajuda: 'toca uma nota (frequência em Hz) no pino' },
    noTone: { padrao: { pino: 8 }, campos: [['pino', PINOS]], ajuda: 'para de tocar a nota' },
  };

  let programa = { setup: [], loop: [] };
  let permitidos = Object.keys(COMANDOS);
  let pinos = {};
  let rodando = false, fase = 'setup', pc = 0, timer = null;
  let el = null, aoMudar = () => {};

  const zerarPinos = () => { pinos = {}; for (const p of PINOS) pinos[p] = { modo: 'INPUT', valor: 'LOW', tom: null }; };
  zerarPinos();

  // ---------------------------------------------------------------- execução
  function executar(ins) {
    const s = pinos[ins.pino];
    if (ins.cmd === 'pinMode') s.modo = ins.modo;
    else if (ins.cmd === 'digitalWrite') { s.valor = ins.valor; s.tom = null; }
    else if (ins.cmd === 'tone') { s.tom = ins.freq; s.modo = 'OUTPUT'; }
    else if (ins.cmd === 'noTone') { s.tom = null; s.valor = 'LOW'; }
  }

  function passo() {
    if (!rodando) return;
    let mexeu = false, voltas = 0;
    for (;;) {
      const lista = programa[fase];
      if (pc >= lista.length) {
        if (fase === 'setup') { fase = 'loop'; pc = 0; continue; }
        if (!programa.loop.length) { destacar(null); if (mexeu) aoMudar(); return; }
        pc = 0;
        // loop() sem delay: roda muitas vezes de uma vez e dá um respiro para a página
        if (++voltas > 200) { if (mexeu) aoMudar(); timer = setTimeout(passo, 30); return; }
        continue;
      }
      const ins = lista[pc];
      const atual = [fase, pc];
      pc++;
      if (ins.cmd === 'delay') { destacar(atual); if (mexeu) aoMudar(); timer = setTimeout(passo, ins.ms); return; }
      executar(ins);
      mexeu = true;
    }
  }

  function mostrarEstado() {
    if (!el) return;
    el.classList.toggle('rodando', rodando);
    const s = el.querySelector('.estado-placa');
    if (s) s.textContent = rodando ? '● rodando' : '○ parado';
  }

  function enviar() {
    clearTimeout(timer);
    zerarPinos();
    rodando = true; fase = 'setup'; pc = 0;
    mostrarEstado();
    aoMudar('enviou');
    passo();
  }

  function parar(avisar = true) {
    clearTimeout(timer);
    rodando = false;
    zerarPinos();
    destacar(null);
    mostrarEstado();
    somBuzzer(false);
    if (avisar) aoMudar('parou');
  }

  // Fontes de tensão para o simulador
  function fontes() {
    if (!rodando) return [];
    const lista = [];
    for (const p of PINOS) {
      const s = pinos[p];
      if (s.tom || s.modo === 'OUTPUT') lista.push({ no: 'D' + p, v: s.tom || s.valor === 'HIGH' ? 5 : 0, r: 25 });
      else if (s.valor === 'HIGH') lista.push({ no: 'D' + p, v: 5, r: 35000 });
    }
    return lista;
  }

  // ---------------------------------------------------------------- som do buzzer
  let osc = null;
  function somBuzzer(ativo, freq = 1400) {
    if (!ativo || !Som.ligado) { if (osc) { try { osc.stop(); } catch (e) { /* já parou */ } osc = null; } return; }
    try {
      const ctx = Som.contexto();
      if (!osc) {
        osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'square';
        g.gain.value = 0.035;
        osc.connect(g).connect(ctx.destination);
        osc.start();
      }
      osc.frequency.value = freq;
    } catch (e) { /* sem áudio */ }
  }
  const frequenciaTocando = () => { for (const p of PINOS) if (pinos[p].tom) return pinos[p].tom; return null; };

  // ---------------------------------------------------------------- editor em blocos
  const opcoes = (lista, atual) => lista.map(v => `<option value="${v}"${String(v) === String(atual) ? ' selected' : ''}>${v}</option>`).join('');

  function linha(ins, f, i) {
    const def = COMANDOS[ins.cmd];
    const args = def.campos.map(([campo, lista]) =>
      `<select data-campo="${campo}" aria-label="${campo}">${opcoes(lista, ins[campo])}</select>`).join(', ');
    return `<div class="linha-codigo" data-fase="${f}" data-i="${i}" title="${def.ajuda}">
      <span class="cod"><span class="fn">${ins.cmd}</span>(${args});</span>
      <span class="ctrl"><button type="button" data-acao="subir" aria-label="Subir linha">▲</button><button type="button" data-acao="descer" aria-label="Descer linha">▼</button><button type="button" data-acao="apagar" aria-label="Apagar linha">✕</button></span>
    </div>`;
  }

  function funcao(f, comentario) {
    return `<div class="funcao" data-fase="${f}">
      <div class="assinatura"><span class="kw">void</span> <span class="fn">${f}</span>() {</div>
      <div class="comentario">// ${comentario}</div>
      ${programa[f].map((ins, i) => linha(ins, f, i)).join('') || '<div class="vazio">// (vazio)</div>'}
      <div class="adicionar"><span>+</span>${permitidos.map(c => `<button type="button" data-add="${c}" title="${COMANDOS[c].ajuda}">${c}</button>`).join('')}</div>
      <div class="assinatura">}</div>
    </div>`;
  }

  function desenhar() {
    if (!el) return;
    el.innerHTML = `<div class="editor-topo"><span>sketch_labe.ino</span><span class="estado-placa">${rodando ? '● rodando' : '○ parado'}</span></div>
      ${funcao('setup', 'roda uma vez, quando o Arduino liga')}
      ${funcao('loop', 'repete para sempre')}`;
  }

  function destacar(pos) {
    if (!el) return;
    el.querySelectorAll('.linha-codigo.executando').forEach(x => x.classList.remove('executando'));
    if (pos) {
      const x = el.querySelector(`.linha-codigo[data-fase="${pos[0]}"][data-i="${pos[1]}"]`);
      if (x) x.classList.add('executando');
    }
  }

  function editado() {
    if (rodando) parar(false);
    desenhar();
    aoMudar('editou');
  }

  function prepararEditor(alvo) {
    if (el === alvo) return;
    el = alvo;
    el.addEventListener('click', ev => {
      const b = ev.target.closest('button');
      if (!b) return;
      const caixa = b.closest('.funcao');
      const f = caixa.dataset.fase;
      if (b.dataset.add) {
        programa[f].push({ cmd: b.dataset.add, ...COMANDOS[b.dataset.add].padrao });
        Som.tocar('clique');
        return editado();
      }
      const lin = b.closest('.linha-codigo');
      const i = +lin.dataset.i, lista = programa[f];
      if (b.dataset.acao === 'apagar') lista.splice(i, 1);
      else if (b.dataset.acao === 'subir' && i > 0) [lista[i - 1], lista[i]] = [lista[i], lista[i - 1]];
      else if (b.dataset.acao === 'descer' && i < lista.length - 1) [lista[i + 1], lista[i]] = [lista[i], lista[i + 1]];
      Som.tocar('clique');
      editado();
    });
    el.addEventListener('change', ev => {
      const s = ev.target.closest('select');
      if (!s) return;
      const lin = s.closest('.linha-codigo');
      const ins = programa[lin.dataset.fase][+lin.dataset.i];
      const bruto = s.value;
      ins[s.dataset.campo] = /^\d+$/.test(bruto) ? +bruto : bruto;
      editado();
    });
  }

  // ---------------------------------------------------------------- API
  // cfg: { editor: elemento, comandos: [...], manter: bool, aoMudar(motivo) }
  function iniciar(cfg) {
    parar(false);
    if (!cfg.manter) programa = { setup: [], loop: [] };
    permitidos = cfg.comandos || Object.keys(COMANDOS);
    aoMudar = cfg.aoMudar || (() => {});
    prepararEditor(cfg.editor);
    desenhar();
  }

  function codigoTexto() {
    const txt = ins => `${ins.cmd}(${COMANDOS[ins.cmd].campos.map(([c]) => ins[c]).join(', ')});`;
    return `void setup() {\n${programa.setup.map(i => '  ' + txt(i)).join('\n')}\n}\n\nvoid loop() {\n${programa.loop.map(i => '  ' + txt(i)).join('\n')}\n}`;
  }

  return {
    PINOS, iniciar, enviar, parar, fontes, somBuzzer, frequenciaTocando, codigoTexto,
    get rodando() { return rodando; },
    get programa() { return programa; },
    get pinos() { return pinos; },
  };
})();
