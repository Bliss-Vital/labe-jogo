/*
 * pixel.js — sprites das personagens (img/*.png, 32x32 por quadro) e o "palco" pixelado da cena.
 *
 * img/personagens.png: uma personagem por quadro (as da equipe estão em PERSONAGENS; as outras a jogadora escolhe)
 * img/monitoras.png:   desenhos extras (o 2º quadro é a Suzanne)
 * O número de personagens é descoberto pelo tamanho da imagem: largura ÷ altura.
 */
const Pixel = (() => {
  'use strict';
  const TAM = 32;
  const folhas = {};

  function carregarFolha(nome, src) {
    return new Promise(ok => {
      const img = new Image();
      img.onload = () => { folhas[nome] = { img, src, quadros: Math.max(1, Math.round(img.naturalWidth / img.naturalHeight)) }; ok(); };
      img.onerror = () => { folhas[nome] = { img: null, src, quadros: 0 }; ok(); };
      img.src = src;
    });
  }
  const pronto = Promise.all([carregarFolha('personagens', 'img/personagens.png'), carregarFolha('monitoras', 'img/monitoras.png')]);

  // Um quadro da folha como <span>, ampliado por uma escala inteira. recorte = [x, y, largura, altura].
  function sprite(folha, quadro, { escala = 4, espelhar = false, recorte = null, classe = '' } = {}) {
    const f = folhas[folha];
    const [x, y, w, h] = recorte || [0, 0, TAM, TAM];
    const n = f && f.quadros ? f.quadros : 1;
    return `<span class="sprite ${classe}" aria-hidden="true" style="width:${w * escala}px;height:${h * escala}px;` +
      `background-image:url('${f ? f.src : ''}');background-size:${n * TAM * escala}px ${TAM * escala}px;` +
      `background-position:${-(quadro * TAM + x) * escala}px ${-y * escala}px;${espelhar ? 'transform:scaleX(-1);' : ''}"></span>`;
  }
  // Só cabeça e ombros, para o retrato da caixa de diálogo
  const rosto = (folha, quadro, escala = 4, espelhar = false) =>
    sprite(folha, quadro, { escala, espelhar, recorte: [6, 0, 22, 18], classe: 'rosto' });

  // Desenha um SVG numa imagem pequena com bordas duras: ampliada, ela fica pixelada.
  const cache = new Map();
  function rasterizar(chave, svg, w, h) {
    if (cache.has(chave)) return cache.get(chave);
    const p = new Promise((ok, falha) => {
      const s = svg.replace('<svg', `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" shape-rendering="crispEdges"`);
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        ok(c);
      };
      img.onerror = falha;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
    });
    cache.set(chave, p);
    return p;
  }
  // Ícone pixelado num <img>; se o navegador não deixar converter, fica o desenho normal.
  function icone(alvo, nome, w = 40, h = 34) {
    rasterizar('icone-' + nome + w, Arte.icone(nome), w, h)
      .then(c => { alvo.innerHTML = `<img class="pixelado" alt="" src="${c.toDataURL()}">`; })
      .catch(() => { alvo.innerHTML = Arte.icone(nome); });
  }

  return { TAM, folhas, pronto, sprite, rosto, rasterizar, icone };
})();

/*
 * Palco: a cena em 320x180 pixels, desenhada num <canvas> e ampliada.
 * A monitora fica à esquerda (virada para a direita) e a jogadora à direita.
 */
const Palco = (() => {
  'use strict';
  const W = 320, H = 180, ESCALA = 2, CHAO = 172;
  let ctx = null, fundo = null, fundoId = null;
  let monitora = null, jogadora = null, falando = null, desloc = 0, quique = 0, timer = null;

  function preparar() {
    if (ctx) return;
    const c = document.getElementById('cena-canvas');
    c.width = W; c.height = H;
    ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
  }

  function ator(quadro, folha, x, espelhar, ativo) {
    const f = Pixel.folhas[folha];
    if (quadro == null || !f || !f.img) return;
    const t = Pixel.TAM * ESCALA;
    const y = CHAO - 30 * ESCALA - (ativo && quique ? 2 : 0);
    ctx.fillStyle = 'rgba(30,10,40,.28)';
    ctx.fillRect(x + (espelhar ? 10 : 20), CHAO + 1, 34, 3);
    ctx.save();
    if (espelhar) { ctx.translate(x + t, y); ctx.scale(-1, 1); ctx.drawImage(f.img, quadro * Pixel.TAM, 0, Pixel.TAM, Pixel.TAM, 0, 0, t, t); }
    else ctx.drawImage(f.img, quadro * Pixel.TAM, 0, Pixel.TAM, Pixel.TAM, x, y, t, t);
    ctx.restore();
  }

  function desenhar() {
    if (!ctx) return;
    if (fundo) ctx.drawImage(fundo, 0, 0);
    else { ctx.fillStyle = '#e2d4ee'; ctx.fillRect(0, 0, W, H); }
    if (monitora) ator(monitora.sprite, monitora.folha, 106 - desloc, true, falando === 'monitora');
    ator(jogadora, 'personagens', 152 - desloc, false, falando === 'jogadora');
  }

  function definirFundo(id) {
    preparar();
    if (fundoId === id) return;
    fundoId = id;
    Pixel.rasterizar('fundo-' + id, Arte.fundo(id), W, H)
      .then(c => { if (fundoId === id) { fundo = c; desenhar(); } })
      .catch(() => { fundo = null; desenhar(); });
  }

  // monitora: { folha, sprite } ou null; quem: 'monitora' | 'jogadora' | null
  // deslocar: abre espaço para a ilustração, à direita
  function definirElenco(qMonitora, qJogadora, quem, deslocar = false) {
    preparar();
    monitora = qMonitora; jogadora = qJogadora; falando = quem; desloc = deslocar ? 80 : 0;
    desenhar();
  }
  function falar(sim) {
    clearInterval(timer); timer = null; quique = 0;
    if (sim && falando) timer = setInterval(() => { quique ^= 1; desenhar(); }, 170);
    desenhar();
  }

  return { definirFundo, definirElenco, falar };
})();
