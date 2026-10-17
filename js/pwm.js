/*
 * pwm.js — minijogo "você é o PWM": segurar o botão liga o motor (100%), soltar desliga (0%).
 * O carrinho tem inércia, então dando toques no ritmo certo a velocidade fica no meio.
 * Mostra a onda PWM que a jogadora desenhou e o ciclo de trabalho (porcentagem do tempo ligado).
 */
const MinijogoPWM = (() => {
  'use strict';
  const INERCIA = 0.45;      // segundos: quanto o carrinho demora para acelerar/frear
  const JANELA = 2;          // segundos usados para calcular o ciclo de trabalho
  const HISTORICO = 4;       // segundos mostrados no gráfico
  // pista: 160×56 pixels; gráfico: 240×44 pixels (os dois ampliados com image-rendering: pixelated)
  const PW = 160, PH = 56, GW = 240, GH = 44;

  let el = null, ctxPista = null, ctxGrafico = null, cfg = null;
  let ligado = false, vel = 0, dist = 0, progresso = 0, venceu = false;
  let amostras = [], tempo = 0, ultimo = 0, raf = 0;
  let osc = null, ganho = null;

  // ---------------------------------------------------------------- som do motor
  function somMotor() {
    if (typeof Som === 'undefined' || !Som.ligado) { pararSom(); return; }
    try {
      const ctx = Som.contexto();
      if (!osc) {
        osc = ctx.createOscillator(); ganho = ctx.createGain();
        osc.type = 'sawtooth'; ganho.gain.value = 0;
        osc.connect(ganho).connect(ctx.destination); osc.start();
      }
      osc.frequency.value = 55 + 150 * vel;
      ganho.gain.value = 0.025 * Math.min(1, vel * 1.4);
    } catch (e) { /* sem áudio */ }
  }
  function pararSom() { if (osc) { try { osc.stop(); } catch (e) { /* já parou */ } osc = null; ganho = null; } }

  // ---------------------------------------------------------------- desenho
  function px(c, x, y, w, h, cor) { c.fillStyle = cor; c.fillRect(Math.round(x), Math.round(y), w, h); }

  function roda(c, cx, cy, ang) {
    // roda 8×8 com o canto cortado e um raio que gira
    px(c, cx - 3, cy - 4, 6, 8, '#141018'); px(c, cx - 4, cy - 3, 8, 6, '#141018');
    px(c, cx - 2, cy - 2, 4, 4, '#8d8d9a');
    const dx = Math.round(Math.cos(ang) * 2), dy = Math.round(Math.sin(ang) * 2);
    px(c, cx + dx - 1, cy + dy - 1, 2, 2, '#e6e6ee');
  }

  function desenharPista() {
    const c = ctxPista;
    px(c, 0, 0, PW, 30, '#e2d4ee');                    // parede do laboratório
    for (let x = ((-dist * 0.3) % 40 + 40) % 40 - 40; x < PW; x += 40) px(c, x + 6, 8, 18, 12, '#d3c3e3'); // quadros na parede
    px(c, 0, 30, PW, 26, '#3a3846');                   // pista
    px(c, 0, 30, PW, 2, '#24232b');
    for (let x = ((-dist) % 24 + 24) % 24 - 24; x < PW; x += 24) px(c, x, 45, 12, 2, '#fff6e8'); // faixas
    // linhas de velocidade
    if (vel > 0.55) for (let i = 0; i < 3; i++) px(c, 30 - ((dist * 3 + i * 17) % 26), 35 + i * 3, 10 + Math.round(vel * 8), 1, 'rgba(255,255,255,.55)');
    // carrinho (robô da equipe): corpo roxo, cabine, farol
    const x = 56, base = 44, sobe = ligado ? 1 : 0;
    px(c, x + 2, base - 1, 40, 2, 'rgba(0,0,0,.25)');                   // sombra
    px(c, x + 10, base - 18 - sobe, 18, 6, '#141018');                    // contorno da cabine
    px(c, x + 11, base - 17 - sobe, 16, 5, '#bfe3ff');                    // vidro
    px(c, x + 2, base - 12 - sobe, 38, 9, '#141018');                     // contorno do corpo
    px(c, x + 3, base - 11 - sobe, 36, 7, '#7b3fb0');                     // corpo
    px(c, x + 3, base - 11 - sobe, 36, 2, '#9b63cf');                     // brilho
    px(c, x + 36, base - 9 - sobe, 3, 3, ligado ? '#ffd23f' : '#8a7a3a'); // farol
    px(c, x + 14, base - 8 - sobe, 10, 2, '#2fbf71');                     // faixa verde da equipe
    const ang = dist * 0.35;
    roda(c, x + 10, base - 3, ang); roda(c, x + 32, base - 3, ang);
  }

  function desenharGrafico() {
    const c = ctxGrafico;
    px(c, 0, 0, GW, GH, '#0f1f24');
    for (let x = 0; x < GW; x += 30) px(c, x, 0, 1, GH, '#17323a');      // grade (meio segundo)
    px(c, 0, 8, GW, 1, '#24434b'); px(c, 0, 36, GW, 1, '#24434b');
    // onda: amostras dos últimos HISTORICO segundos, da esquerda (antigo) para a direita (agora)
    const t0 = tempo - HISTORICO;
    let yAnt = null;
    for (const a of amostras) {
      if (a.t < t0) continue;
      const x = Math.floor((a.t - t0) / HISTORICO * (GW - 1));
      const y = a.u ? 8 : 35;
      if (yAnt !== null && yAnt !== y) px(c, x, 8, 1, 28, '#8bff6b');
      px(c, x, y, 2, 2, '#8bff6b');
      yAnt = y;
    }
    // média (ciclo de trabalho) tracejada
    const yMedia = 36 - Math.round(ciclo() * 28);
    for (let x = 0; x < GW; x += 6) px(c, x, yMedia, 3, 1, '#ff6ec7');
  }

  // ---------------------------------------------------------------- lógica
  function ciclo() {
    const ini = tempo - JANELA;
    let on = 0, total = 0, ant = null;
    for (const a of amostras) {
      if (a.t < ini) { ant = a; continue; }
      const dt = a.t - (ant ? Math.max(ant.t, ini) : ini);
      if (ant && ant.u) on += dt;
      total += dt; ant = a;
    }
    return total > 0 ? on / total : 0;
  }

  function atualizarPainel() {
    const v = Math.round(vel * 100), d = Math.round(ciclo() * 100);
    const [a, b] = cfg.faixa;
    el.querySelector('.pwm-vel').textContent = `${v}%`;
    el.querySelector('.pwm-ciclo').textContent = `${d}%`;
    el.querySelector('.pwm-agulha').style.left = `${v}%`;
    el.querySelector('.pwm-progresso i').style.width = `${Math.min(100, progresso / cfg.segundos * 100)}%`;
    const dica = el.querySelector('.pwm-dica');
    if (venceu) dica.textContent = 'Conseguiu! Você controlou a velocidade com PWM.';
    else if (v > b) dica.textContent = ligado ? 'Rápido demais! Solte um pouco.' : 'Ainda rápido... espere frear.';
    else if (v < a) dica.textContent = vel < 0.05 && !ligado ? 'Segure o botão para o motor ligar.' : 'Devagar demais: dê toques mais longos.';
    else dica.textContent = 'Isso! Mantenha esse ritmo de toques...';
    dica.className = 'pwm-dica' + (v >= a && v <= b ? ' certo' : '');
    el.querySelector('.pwm-botao').classList.toggle('apertado', ligado);
    el.querySelector('.pwm-botao').setAttribute('aria-pressed', String(ligado));
  }

  function quadro(agora) {
    const dt = Math.min(0.05, (agora - ultimo) / 1000 || 0);
    ultimo = agora;
    tempo += dt;
    vel += ((ligado ? 1 : 0) - vel) * (1 - Math.exp(-dt / INERCIA));
    dist += vel * dt * 90;
    amostras.push({ t: tempo, u: ligado });
    while (amostras.length && amostras[0].t < tempo - HISTORICO - 0.5) amostras.shift();
    const v = vel * 100, [a, b] = cfg.faixa;
    if (!venceu) {
      if (v >= a && v <= b) progresso += dt;
      else progresso = Math.max(0, progresso - dt * 1.5);
      if (progresso >= cfg.segundos) {
        venceu = true;
        if (cfg.aoVencer) cfg.aoVencer({ ciclo: Math.round(ciclo() * 100), velocidade: Math.round(v) });
      }
    }
    desenharPista();
    desenharGrafico();
    atualizarPainel();
    somMotor();
    raf = requestAnimationFrame(quadro);
  }

  // ---------------------------------------------------------------- controles
  const apertar = ev => { if (ev) ev.preventDefault(); ligado = true; };
  const soltar = () => { ligado = false; };
  // depois de vencer, o espaço volta a servir para avançar o diálogo
  const teclaDesce = ev => {
    if (venceu || (ev.key !== ' ' && ev.key !== 'ArrowUp')) return;
    ev.preventDefault(); ev.stopPropagation();
    if (!ev.repeat) ligado = true;
  };
  const teclaSobe = ev => { if (ev.key === ' ' || ev.key === 'ArrowUp') { ev.preventDefault(); ligado = false; } };

  // cfg: { faixa: [40, 60], segundos: 4, aoVencer({ ciclo, velocidade }) }
  function iniciar(painel, opcoes) {
    parar();
    cfg = Object.assign({ faixa: [40, 60], segundos: 4 }, opcoes);
    ligado = false; vel = 0; dist = 0; progresso = 0; venceu = false; amostras = []; tempo = 0;
    const [a, b] = cfg.faixa;
    painel.innerHTML = `<div class="pwm">
      <div class="pwm-topo"><span>Velocidade <b class="pwm-vel">0%</b></span><span>Ligado <b class="pwm-ciclo">0%</b> do tempo</span></div>
      <canvas class="pwm-pista pixelado" width="${PW}" height="${PH}" aria-hidden="true"></canvas>
      <div class="pwm-medidor" aria-hidden="true"><span class="pwm-faixa" style="left:${a}%;width:${b - a}%"></span><span class="pwm-agulha"></span>
        <span class="pwm-marca" style="left:0">0%</span><span class="pwm-marca" style="left:50%">50%</span><span class="pwm-marca" style="left:100%">100%</span></div>
      <p class="pwm-dica">Segure o botão para o motor ligar.</p>
      <div class="pwm-progresso" aria-label="Tempo na faixa da meta"><i></i></div>
      <button type="button" class="btn btn-grande pwm-botao" aria-pressed="false">Segure para acelerar</button>
      <div class="pwm-legenda">Sinal PWM (últimos ${HISTORICO} s) · tracejado: média</div>
      <canvas class="pwm-grafico pixelado" width="${GW}" height="${GH}" aria-hidden="true"></canvas>
      <p class="pwm-ajuda">No computador, também dá para segurar a <b>barra de espaço</b>.</p>
    </div>`;
    el = painel;
    ctxPista = painel.querySelector('.pwm-pista').getContext('2d');
    ctxGrafico = painel.querySelector('.pwm-grafico').getContext('2d');
    const botao = painel.querySelector('.pwm-botao');
    botao.addEventListener('pointerdown', ev => { botao.setPointerCapture(ev.pointerId); apertar(ev); });
    botao.addEventListener('pointerup', soltar);
    botao.addEventListener('pointercancel', soltar);
    botao.addEventListener('lostpointercapture', soltar);
    botao.addEventListener('contextmenu', ev => ev.preventDefault());
    document.addEventListener('keydown', teclaDesce, true);
    document.addEventListener('keyup', teclaSobe, true);
    window.addEventListener('blur', soltar);
    ultimo = performance.now();
    raf = requestAnimationFrame(quadro);
  }

  function parar() {
    cancelAnimationFrame(raf);
    raf = 0;
    document.removeEventListener('keydown', teclaDesce, true);
    document.removeEventListener('keyup', teclaSobe, true);
    window.removeEventListener('blur', soltar);
    ligado = false;
    pararSom();
  }

  return { iniciar, parar };
})();
