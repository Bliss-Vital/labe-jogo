/*
 * motor.js — faz o jogo andar: telas, diálogos com efeito de digitação, quizzes,
 * minijogo do resistor, desafios na bancada, progresso e certificado.
 */

// ------------------------------------------------------------------ sons (Web Audio, sem arquivos)
const Som = (() => {
  let ctx = null;
  let ligado = true;
  function nota(freq, inicio, dur, tipo = 'sine', vol = 0.14) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, inicio);
    g.gain.exponentialRampToValueAtTime(0.0001, inicio + dur);
    o.connect(g).connect(ctx.destination);
    o.start(inicio); o.stop(inicio + dur + 0.02);
  }
  function ruido(inicio, dur) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = ctx.createBufferSource(), g = ctx.createGain();
    g.gain.value = 0.25; s.buffer = buf; s.connect(g).connect(ctx.destination); s.start(inicio);
  }
  function tocar(nome) {
    if (!ligado) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      const t = ctx.currentTime;
      if (nome === 'certo') { nota(660, t, 0.12); nota(880, t + 0.1, 0.2); }
      else if (nome === 'erro') nota(196, t, 0.2, 'square', 0.05);
      else if (nome === 'sucesso') [523, 659, 784, 1047].forEach((f, i) => nota(f, t + i * 0.1, 0.25, 'triangle'));
      else if (nome === 'estouro') { ruido(t, 0.3); nota(120, t, 0.3, 'sawtooth', 0.08); }
      else if (nome === 'clique') nota(1400, t, 0.03, 'square', 0.025);
    } catch (e) { /* sem áudio, sem problema */ }
  }
  return { tocar, set ligado(v) { ligado = v; }, get ligado() { return ligado; } };
})();

(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const CHAVE = 'labe-jogo-v1';
  const MODO_LIVRE = /[?&#]livre\b/.test(location.search + location.hash);

  // ---------------------------------------------------------------- progresso salvo
  function carregar() {
    try { const s = localStorage.getItem(CHAVE); return s ? JSON.parse(s) : null; } catch (e) { return null; }
  }
  const estado = Object.assign({ nome: '', concluidas: {}, vars: {}, som: true }, carregar() || {});
  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) { /* navegador sem armazenamento */ }
  }
  Som.ligado = estado.som;

  // ---------------------------------------------------------------- texto
  const escapar = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function formatar(t) {
    return escapar(t)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\{(\w+)\}/g, (m, k) => (k === 'nome' ? escapar(estado.nome) : k in estado.vars ? escapar(estado.vars[k]) : '…'));
  }
  const estrelasHTML = n => `<span class="estrelas" aria-label="${n} de 3 estrelas">${'★'.repeat(n)}<span class="apagada">${'★'.repeat(3 - n)}</span></span>`;
  const reduzirMovimento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------- telas e modais
  function mostrarTela(id) {
    document.querySelectorAll('.tela').forEach(t => t.classList.toggle('ativa', t.id === id));
  }
  const telaAtiva = id => $('#' + id).classList.contains('ativa');

  function modal(html) {
    fecharModal();
    const m = document.createElement('div');
    m.className = 'modal';
    m.id = 'modal';
    m.innerHTML = `<div class="modal-cartao" role="dialog" aria-modal="true">${html}</div>`;
    document.body.appendChild(m);
    const b = m.querySelector('button');
    if (b) b.focus();
    return m;
  }
  function fecharModal() { const m = $('#modal'); if (m) m.remove(); }

  // confirmação dentro da página (o visualizador não mostra confirm())
  function confirmar(texto, sim, aoConfirmar) {
    const m = modal(`<h2>Tem certeza?</h2><p>${texto}</p><div class="modal-acoes"><button class="btn btn-claro" data-r="nao">Cancelar</button><button class="btn btn-rosa" data-r="sim">${sim}</button></div>`);
    m.addEventListener('click', ev => {
      const b = ev.target.closest('button');
      if (!b) return;
      fecharModal();
      if (b.dataset.r === 'sim') aoConfirmar();
    });
  }

  function confete() {
    if (reduzirMovimento) return;
    const cores = ['#f39bc9', '#dcaaf0', '#ffd23f', '#2ee66b', '#3d8bff', '#ff3b3b'];
    for (let i = 0; i < 40; i++) {
      const c = document.createElement('div');
      c.className = 'confete';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = cores[i % cores.length];
      c.style.animationDelay = Math.random() * 0.6 + 's';
      c.style.animationDuration = 1.8 + Math.random() * 1.4 + 's';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4000);
    }
  }

  function atualizarBotoesSom() {
    document.querySelectorAll('.btn-som').forEach(b => {
      b.textContent = estado.som ? '🔊' : '🔇';
      b.setAttribute('aria-label', estado.som ? 'Desligar sons' : 'Ligar sons');
      b.title = b.getAttribute('aria-label');
    });
  }
  document.addEventListener('click', ev => {
    if (!ev.target.closest('.btn-som')) return;
    estado.som = !estado.som;
    Som.ligado = estado.som;
    salvar();
    atualizarBotoesSom();
    Som.tocar('clique');
  });

  // ---------------------------------------------------------------- tela inicial
  function iniciarTelaInicial() {
    $('#inicio-deco').innerHTML = [['resistor', '8%', '12%'], ['led', '82%', '10%'], ['multimetro', '6%', '72%'], ['protoboard', '80%', '70%']]
      .map(([n, x, y]) => `<div style="left:${x};top:${y}">${Arte.icone(n)}</div>`).join('');
    const campo = $('#nome');
    campo.value = estado.nome || '';
    $('#btn-continuar').hidden = !estado.nome;
    if (estado.nome) $('#btn-continuar').textContent = `Continuar como ${estado.nome}`;
    $('#form-nome').addEventListener('submit', ev => {
      ev.preventDefault();
      const nome = campo.value.trim().replace(/\s+/g, ' ');
      if (!nome) { campo.classList.remove('tremer'); void campo.offsetWidth; campo.classList.add('tremer'); campo.focus(); return; }
      if (estado.nome && nome.toLowerCase() !== estado.nome.toLowerCase()) {
        // outra pessoa jogando neste computador: começa do zero
        estado.concluidas = {};
        estado.vars = {};
      }
      estado.nome = nome;
      salvar();
      Som.tocar('clique');
      abrirMapa();
    });
    $('#btn-continuar').addEventListener('click', () => { Som.tocar('clique'); abrirMapa(); });
  }

  // ---------------------------------------------------------------- mapa das oficinas
  const liberada = i => MODO_LIVRE || i === 0 || !!estado.concluidas[OFICINAS[i - 1].id];
  function abrirMapa() {
    fecharModal();
    Bancada.parar();
    $('#mapa-saudacao').textContent = `Olá, ${estado.nome}!`;
    const lista = $('#lista-oficinas');
    lista.innerHTML = '';
    OFICINAS.forEach((o, i) => {
      const feita = estado.concluidas[o.id];
      const ok = liberada(i);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cartao-oficina' + (feita ? ' feita' : '');
      b.disabled = !ok;
      b.innerHTML = `<span class="num">Oficina ${i + 1}</span><h3>${escapar(o.titulo)}</h3><p>${escapar(o.resumo)}</p>
        <span class="status">${feita ? `${estrelasHTML(feita)} Jogar de novo` : ok ? 'Começar ▶' : '🔒 Conclua a oficina anterior'}</span>`;
      b.addEventListener('click', () => iniciarOficina(i));
      lista.appendChild(b);
    });
    const todas = OFICINAS.every(o => estado.concluidas[o.id]);
    $('#btn-certificado').hidden = !todas;
    mostrarTela('tela-mapa');
  }

  // ---------------------------------------------------------------- cena
  const cena = { indice: 0, oficina: null, i: 0, erros: 0, falante: null, ilustracao: null, cenario: null, esperando: null, aoAvancar: null };
  let digitacao = null;

  function definirCenario(id) {
    if (cena.cenario === id) return;
    cena.cenario = id;
    const f = $('#cena-fundo');
    f.innerHTML = Arte.fundo(id);
    f.classList.remove('trocando'); void f.offsetWidth; f.classList.add('trocando');
  }

  function definirIlustracao(id) {
    const painel = $('#cena-ilustracao');
    cena.ilustracao = id || null;
    if (!id) { painel.hidden = true; painel.innerHTML = ''; return; }
    painel.innerHTML = Arte.ilustracao(id);
    painel.hidden = false;
  }

  function definirPersonagem(quem) {
    const el = $('#cena-personagem');
    if (quem && PERSONAGENS[quem]) {
      if (cena.falante !== quem) {
        el.innerHTML = Arte.retrato(PERSONAGENS[quem].aparencia);
        cena.falante = quem;
        el.classList.remove('entrando'); void el.offsetWidth; el.classList.add('entrando');
      }
      el.classList.remove('ouvindo', 'oculto');
    } else if (quem === 'voce' && cena.falante) {
      el.classList.remove('oculto');
      el.classList.add('ouvindo');
    } else {
      el.classList.add('oculto');
    }
  }

  function digitar(alvo, html, aoTerminar) {
    if (digitacao) digitacao.parar();
    alvo.innerHTML = html;
    const nos = [];
    const w = document.createTreeWalker(alvo, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) nos.push(w.currentNode);
    const textos = nos.map(n => n.textContent);
    let ni = 0, ci = 0, timer = null;
    const fim = () => { digitacao = null; $('#cena-personagem').classList.remove('falando'); aoTerminar && aoTerminar(); };
    const completar = () => { clearTimeout(timer); nos.forEach((n, i) => { n.textContent = textos[i]; }); fim(); };
    if (reduzirMovimento) { fim(); return; }
    nos.forEach(n => { n.textContent = ''; });
    $('#cena-personagem').classList.add('falando');
    const passo = () => {
      for (let k = 0; k < 2; k++) {
        if (ni >= nos.length) { fim(); return; }
        ci++;
        nos[ni].textContent = textos[ni].slice(0, ci);
        if (ci >= textos[ni].length) { ni++; ci = 0; }
      }
      timer = setTimeout(passo, 22);
    };
    digitacao = { completar, parar: () => clearTimeout(timer) };
    passo();
  }

  function falar(quem, html, depois) {
    definirPersonagem(quem);
    const caixa = $('#caixa-dialogo'), nome = $('#dialogo-nome');
    const narracao = !quem || quem === 'narrador';
    caixa.classList.toggle('narracao', narracao);
    nome.hidden = narracao;
    if (!narracao) {
      nome.textContent = quem === 'voce' ? estado.nome : PERSONAGENS[quem].nome;
      nome.style.background = quem === 'voce' ? 'var(--rosa-escuro)' : PERSONAGENS[quem].cor;
    }
    $('#dialogo-opcoes').innerHTML = '';
    $('#dialogo-feedback').hidden = true;
    $('#dialogo-seta').hidden = true;
    caixa.scrollTop = 0;
    digitar($('#dialogo-texto'), html, () => {
      if (depois) depois();
      else $('#dialogo-seta').hidden = false;
    });
  }

  function iniciarOficina(indice, passoInicial = 0) {
    fecharModal();
    const o = OFICINAS[indice];
    Object.assign(cena, { indice, oficina: o, i: passoInicial, erros: 0, falante: null, cenario: null, esperando: null, aoAvancar: null });
    $('#cena-titulo').textContent = `Oficina ${indice + 1} · ${o.titulo}`;
    $('#cena-personagem').innerHTML = '';
    $('#cena-personagem').classList.add('oculto');
    definirIlustracao(null);
    // ao retomar no meio, reaplica o cenário e a ilustração dos passos anteriores
    let cen = 'laboratorio', ilu = null;
    for (let k = 0; k < passoInicial; k++) {
      const p = o.passos[k];
      if (p.cenario) cen = p.cenario;
      if ('ilustracao' in p) ilu = p.ilustracao;
      if (p.tipo === 'resistor' || p.tipo === 'desafio') ilu = null;
    }
    definirCenario(o.passos[passoInicial] && o.passos[passoInicial].cenario ? o.passos[passoInicial].cenario : cen);
    if (passoInicial) definirIlustracao(ilu);
    mostrarTela('tela-cena');
    executar();
  }

  function executar() {
    const p = cena.oficina.passos[cena.i];
    if (!p) { concluirOficina(); return; }
    if (p.cenario) definirCenario(p.cenario);
    if ('ilustracao' in p) definirIlustracao(p.ilustracao);
    if (p.tipo === 'quiz') mostrarQuiz(p);
    else if (p.tipo === 'resistor') mostrarMontaResistor(p);
    else if (p.tipo === 'desafio') abrirDesafio(p);
    else if (p.texto) { falar(p.quem, formatar(p.texto)); cena.esperando = 'clique'; }
    else avancar();
  }

  function avancar() {
    if (cena.aoAvancar) { cena.aoAvancar(); cena.aoAvancar = null; }
    cena.esperando = null;
    cena.i++;
    executar();
  }

  function tocarAvanco() {
    if (digitacao) { digitacao.completar(); return; }
    if (cena.esperando === 'clique') avancar();
  }

  // ---------------------------------------------------------------- quiz
  function embaralhar(lista) {
    const a = [...lista];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  function mostrarQuiz(p) {
    cena.esperando = 'quiz';
    falar(p.quem, formatar(p.pergunta), () => {
      const caixa = $('#dialogo-opcoes');
      caixa.className = 'dialogo-opcoes' + (p.opcoes.some(o => o.icone) ? ' com-icones' : '');
      for (const o of embaralhar(p.opcoes)) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'opcao';
        b.innerHTML = (o.icone ? `<span class="opcao-icone">${Arte.icone(o.icone)}</span>` : '') + `<span>${formatar(o.texto)}</span>`;
        if (o.icone) b.setAttribute('aria-label', `Opção: ${o.icone}`);
        b.addEventListener('click', ev => { ev.stopPropagation(); responder(o, b); });
        caixa.appendChild(b);
      }
    });
  }

  function responder(o, botao) {
    const fb = $('#dialogo-feedback');
    fb.hidden = false;
    if (o.certa) {
      Som.tocar('certo');
      botao.classList.add('certa');
      $('#dialogo-opcoes').querySelectorAll('button').forEach(b => { b.disabled = true; });
      fb.className = 'dialogo-feedback certo';
      fb.innerHTML = '✔ ' + formatar(o.resposta || 'Isso mesmo!');
      $('#dialogo-seta').hidden = false;
      cena.esperando = 'clique';
      botao.blur();
    } else {
      Som.tocar('erro');
      cena.erros++;
      botao.classList.add('errada');
      botao.disabled = true;
      fb.className = 'dialogo-feedback errado';
      fb.innerHTML = '✘ ' + formatar(o.resposta || 'Ainda não... tenta outra!');
    }
    fb.scrollIntoView({ block: 'nearest' });
  }

  // ---------------------------------------------------------------- minijogo: monte o resistor
  function mostrarMontaResistor(p) {
    cena.esperando = 'resistor';
    const faixas = ['marrom', 'preto', 'preto'];
    const painel = $('#cena-ilustracao');
    const rotulos = ['1ª faixa', '2ª faixa', '3ª faixa (multiplicador)'];
    let terminou = false;
    function desenhar() {
      painel.innerHTML = `<div class="monta-resistor">
        <svg viewBox="-150 -40 300 80" aria-label="Resistor com as faixas ${faixas.join(', ')}"><path d="M-150 0 H150" stroke="#9aa0a6" stroke-width="5"/>${Arte.resistorSVG(faixas, { L: 200, h: 62 })}</svg>
        <div class="faixas-controles">${faixas.map((f, i) => `
          <div class="faixa-ctrl"><span class="rotulo">${rotulos[i]}</span>
            <button type="button" data-f="${i}" data-d="-1" aria-label="Cor anterior da ${rotulos[i]}" ${terminou ? 'disabled' : ''}>◀</button>
            <span class="cor-nome"><i style="background:${Arte.CORES[f]}"></i>${f}</span>
            <button type="button" data-f="${i}" data-d="1" aria-label="Próxima cor da ${rotulos[i]}" ${terminou ? 'disabled' : ''}>▶</button>
          </div>`).join('')}</div>
        <button type="button" class="btn" id="btn-conferir" ${terminou ? 'disabled' : ''}>Conferir</button>
      </div>`;
      painel.hidden = false;
    }
    painel.onclick = ev => {
      const b = ev.target.closest('button');
      if (!b || terminou) return;
      ev.stopPropagation();
      if (b.id === 'btn-conferir') return conferir();
      const i = +b.dataset.f, d = +b.dataset.d;
      faixas[i] = Arte.ORDEM[(Arte.ORDEM.indexOf(faixas[i]) + d + 10) % 10];
      Som.tocar('clique');
      desenhar();
      const foco = painel.querySelector(`button[data-f="${i}"][data-d="${d}"]`);
      if (foco) foco.focus();
    };
    function conferir() {
      const v = Arte.valorDasFaixas(faixas);
      const fb = $('#dialogo-feedback');
      fb.hidden = false;
      if (v === p.alvo) {
        terminou = true;
        Som.tocar('certo');
        fb.className = 'dialogo-feedback certo';
        fb.innerHTML = `✔ Perfeito! ${faixas.join(', ')} = ${Arte.ohms(v)}.`;
        $('#dialogo-seta').hidden = false;
        cena.esperando = 'clique';
        cena.aoAvancar = () => { painel.onclick = null; definirIlustracao(null); };
        desenhar();
      } else {
        Som.tocar('erro');
        cena.erros++;
        fb.className = 'dialogo-feedback errado';
        fb.innerHTML = `✘ Essas cores dão ${Arte.ohms(v)}. ${formatar(p.dica || 'Tenta de novo!')}`;
      }
    }
    desenhar();
    falar(p.quem, formatar(p.texto), () => {});
  }

  // ---------------------------------------------------------------- desafios na bancada
  const bancada = { desafio: null, concluido: false, dica: 0, autoAtiva: false };

  function mostrarDica(texto, tipo = 'info') {
    const caixa = $('#dica-monitora');
    caixa.className = 'dica-monitora' + (tipo === 'info' ? '' : ' ' + tipo);
    $('#dica-texto').innerHTML = texto;
  }

  function abrirDesafio(p) {
    const d = DESAFIOS[p.id];
    if (!d) { avancar(); return; }
    cena.esperando = null;
    Object.assign(bancada, { desafio: d, concluido: false, dica: 0, autoAtiva: false });
    $('#bancada-objetivo').innerHTML = `<span class="rotulo">${escapar(d.titulo)}:</span>${formatar(d.objetivo)}`;
    const m = PERSONAGENS[d.monitora];
    $('#dica-avatar').innerHTML = Arte.retrato(m.aparencia);
    $('#dica-nome').textContent = m.nome;
    mostrarDica(formatar(d.intro || 'Bora montar! Se precisar, peça uma dica.'));
    $('#btn-dica').disabled = !(d.dicas && d.dicas.length);
    mostrarTela('tela-bancada');
    Bancada.iniciar({ gaveta: d.gaveta, manterMontagem: !!d.manterMontagem, aoMudar: verificarDesafio });
  }

  function verificarDesafio(c) {
    const d = bancada.desafio;
    if (!d || bancada.concluido) return;
    if (d.verificar(c)) {
      bancada.concluido = true;
      if (d.aoConcluir) Object.assign(estado.vars, d.aoConcluir(c) || {});
      salvar();
      mostrarDica('Funcionou!', 'ok');
      setTimeout(() => mostrarSucessoDesafio(d), 900);
      return;
    }
    const auto = dicaAutomatica(c, d);
    if (auto) { mostrarDica(formatar(auto.texto), auto.tipo); bancada.autoAtiva = true; }
    else if (bancada.autoAtiva) {
      mostrarDica(c.ligada ? 'Isso, nada de errado por aqui. Continue montando!' : formatar(d.intro || 'Continue montando!'));
      bancada.autoAtiva = false;
    }
  }

  function mostrarSucessoDesafio(d) {
    Som.tocar('sucesso');
    confete();
    const m = PERSONAGENS[d.monitora];
    const caixa = modal(`<div class="retrato">${Arte.retrato(m.aparencia)}</div><h2>Funcionou!</h2><p><strong>${escapar(m.nome)}:</strong> ${formatar(d.sucesso)}</p>
      <div class="modal-acoes"><button class="btn" id="btn-seguir">Continuar a história ▶</button></div>`);
    caixa.querySelector('#btn-seguir').addEventListener('click', () => {
      fecharModal();
      Bancada.parar();
      mostrarTela('tela-cena');
      avancar();
    });
  }

  $('#btn-dica').addEventListener('click', () => {
    const d = bancada.desafio;
    if (!d || !d.dicas) return;
    mostrarDica(formatar(d.dicas[bancada.dica % d.dicas.length]));
    bancada.autoAtiva = true;
    bancada.dica++;
    Som.tocar('clique');
  });
  $('#btn-sair-bancada').addEventListener('click', () => {
    confirmar('Se sair agora, você volta para a lista de oficinas e recomeça esta oficina depois.', 'Sair', abrirMapa);
  });

  // ---------------------------------------------------------------- fim de oficina e certificado
  function concluirOficina() {
    const o = cena.oficina, i = cena.indice;
    const estrelas = cena.erros === 0 ? 3 : cena.erros <= 2 ? 2 : 1;
    estado.concluidas[o.id] = Math.max(estado.concluidas[o.id] || 0, estrelas);
    salvar();
    Som.tocar('sucesso');
    confete();
    const ultima = i === OFICINAS.length - 1;
    const proxima = !ultima ? `<button class="btn" id="btn-proxima">Próxima oficina ▶</button>` : `<button class="btn" id="btn-ver-cert">Ver meu certificado</button>`;
    const comentario = cena.erros === 0 ? 'Sem nenhum erro nas perguntas!' : `Você errou ${cena.erros} ${cena.erros === 1 ? 'pergunta' : 'vezes'} e seguiu em frente. É assim que se aprende!`;
    const m = modal(`<h2>Oficina ${i + 1} concluída!</h2>${estrelasHTML(estrelas)}<p><strong>${escapar(o.titulo)}</strong></p><p>${comentario}</p>
      <div class="modal-acoes"><button class="btn btn-claro" id="btn-mapa">Ver oficinas</button>${proxima}</div>`);
    m.querySelector('#btn-mapa').addEventListener('click', abrirMapa);
    const bp = m.querySelector('#btn-proxima');
    if (bp) bp.addEventListener('click', () => iniciarOficina(i + 1));
    const bc = m.querySelector('#btn-ver-cert');
    if (bc) bc.addEventListener('click', abrirCertificado);
  }

  function abrirCertificado() {
    fecharModal();
    $('#cert-nome').textContent = estado.nome;
    $('#cert-lista').innerHTML = OFICINAS.map(o => `<li>${escapar(o.titulo)} ${estrelasHTML(estado.concluidas[o.id] || 0)}</li>`).join('');
    $('#cert-data').textContent = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    mostrarTela('tela-certificado');
  }

  // ---------------------------------------------------------------- eventos gerais
  $('#tela-cena').addEventListener('click', ev => {
    if (ev.target.closest('button, input, .barra')) return;
    if (ev.target.closest('#cena-ilustracao') && cena.esperando === 'resistor') return;
    tocarAvanco();
  });
  document.addEventListener('keydown', ev => {
    if (!telaAtiva('tela-cena') || $('#modal')) return;
    if (ev.key !== ' ' && ev.key !== 'Enter') return;
    const ativo = document.activeElement;
    if (ativo && (ativo.tagName === 'BUTTON' || ativo.tagName === 'INPUT') && !ativo.disabled) return;
    ev.preventDefault();
    tocarAvanco();
  });
  $('#btn-voltar-mapa').addEventListener('click', () => {
    confirmar('Voltar para a lista de oficinas? O progresso desta oficina será perdido.', 'Voltar', abrirMapa);
  });
  $('#btn-trocar').addEventListener('click', () => {
    confirmar('Isso apaga o progresso salvo neste navegador e volta para a tela inicial.', 'Recomeçar', () => {
      Object.assign(estado, { nome: '', concluidas: {}, vars: {} });
      salvar();
      $('#nome').value = '';
      $('#btn-continuar').hidden = true;
      mostrarTela('tela-inicio');
    });
  });
  $('#btn-certificado').addEventListener('click', abrirCertificado);
  $('#btn-cert-voltar').addEventListener('click', abrirMapa);

  // ---------------------------------------------------------------- início
  // Quando a página é atualizada no visualizador do claude.ai, retoma do mesmo ponto.
  const hot = window.claude && window.claude.hot;
  if (hot && hot.snapshot) {
    hot.snapshot(() => ({ tela: document.querySelector('.tela.ativa')?.id, oficina: cena.indice, passo: cena.i }));
  }
  function comecar(dados) {
    iniciarTelaInicial();
    atualizarBotoesSom();
    if (dados && estado.nome && dados.tela && dados.tela !== 'tela-inicio') {
      if ((dados.tela === 'tela-cena' || dados.tela === 'tela-bancada') && OFICINAS[dados.oficina]) {
        // na bancada, reabre o mesmo desafio (com a placa vazia)
        iniciarOficina(dados.oficina, dados.passo || 0);
        return;
      }
      if (dados.tela === 'tela-certificado') { abrirCertificado(); return; }
      abrirMapa();
      return;
    }
    mostrarTela('tela-inicio');
  }
  if (hot && hot.ready) hot.ready(comecar);
  else comecar(hot && hot.data ? hot.data : null);
})();
