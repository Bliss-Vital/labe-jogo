"""
Converte os desenhos do Piskel (fotos/personagens/*.piskel) nas imagens que o jogo usa.

    py ferramentas/importar_personagens.py

- monitoras.piskel        -> img/monitoras.png    (o 2º quadro é a Suzanne)
- todos os outros .piskel -> img/personagens.png  (personagens para escolher e a equipe do LABe;
                                                   quem é da equipe está em PERSONAGENS, js/historia.js)

Cada quadro tem 32x32 pixels. Também dá para exportar direto do Piskel
(Exportar > PNG > "spritesheet" em uma linha só) e salvar com esses nomes em img/.
Não precisa de nenhuma biblioteca além do Python.
"""
import base64, json, pathlib, struct, zlib

RAIZ = pathlib.Path(__file__).resolve().parent.parent
ORIGEM = RAIZ / 'fotos' / 'personagens'
DESTINO = RAIZ / 'img'


def ler_png(dados):
    assert dados[:8] == b'\x89PNG\r\n\x1a\n', 'não é PNG'
    pos, idat, info, pal, trns = 8, b'', None, None, None
    while pos < len(dados):
        n, tipo = struct.unpack('>I4s', dados[pos:pos + 8])
        corpo = dados[pos + 8:pos + 8 + n]
        if tipo == b'IHDR': info = struct.unpack('>IIBBBBB', corpo)
        elif tipo == b'PLTE': pal = [tuple(corpo[i:i + 3]) for i in range(0, n, 3)]
        elif tipo == b'tRNS': trns = list(corpo)
        elif tipo == b'IDAT': idat += corpo
        pos += 12 + n
    w, h, prof, cor = info[:4]
    if prof != 8 or info[6] != 0: raise SystemExit('PNG em formato não suportado (use 8 bits, sem entrelaçamento)')
    canais = {6: 4, 2: 3, 3: 1, 4: 2, 0: 1}[cor]
    bruto, lin = zlib.decompress(idat), w * canais
    linhas, ant, p = [], bytearray(lin), 0
    for _ in range(h):
        f = bruto[p]; p += 1
        cur = bytearray(bruto[p:p + lin]); p += lin
        for i in range(lin):
            a = cur[i - canais] if i >= canais else 0
            b = ant[i]; c = ant[i - canais] if i >= canais else 0
            if f == 1: cur[i] = (cur[i] + a) & 255
            elif f == 2: cur[i] = (cur[i] + b) & 255
            elif f == 3: cur[i] = (cur[i] + (a + b) // 2) & 255
            elif f == 4:
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                cur[i] = (cur[i] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        linhas.append(cur); ant = cur
    px = []
    for row in linhas:
        r = []
        for x in range(w):
            if cor == 6: r.append(tuple(row[x * 4:x * 4 + 4]))
            elif cor == 2: r.append(tuple(row[x * 3:x * 3 + 3]) + (255,))
            elif cor == 4: r.append((row[x * 2],) * 3 + (row[x * 2 + 1],))
            elif cor == 0: r.append((row[x],) * 3 + (255,))
            else:
                i = row[x]; r.append(pal[i] + ((trns[i] if trns and i < len(trns) else 255),))
        px.append(r)
    return w, h, px


def gravar_png(caminho, w, h, px):
    bruto = b''.join(b'\x00' + bytes(v for p in linha for v in p) for linha in px)
    bloco = lambda t, d: struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    caminho.write_bytes(b'\x89PNG\r\n\x1a\n' + bloco(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0))
                        + bloco(b'IDAT', zlib.compress(bruto, 9)) + bloco(b'IEND', b''))


def sobrepor(baixo, cima, opacidade):
    a = cima[3] / 255 * opacidade
    if a <= 0: return baixo
    b = baixo[3] / 255
    sai = a + b * (1 - a)
    cor = tuple(round((cima[k] * a + baixo[k] * b * (1 - a)) / sai) for k in range(3))
    return cor + (round(sai * 255),)


def quadros_do_piskel(caminho):
    p = json.loads(caminho.read_text(encoding='utf-8'))['piskel']
    w, h = p['width'], p['height']
    escondidos = set(p.get('hiddenFrames') or [])
    camadas = [json.loads(c) if isinstance(c, str) else c for c in p['layers']]
    total = max(c['frameCount'] for c in camadas)
    quadros = [[[(0, 0, 0, 0)] * w for _ in range(h)] for _ in range(total)]
    for camada in camadas:
        for chunk in camada['chunks']:
            _, _, img = ler_png(base64.b64decode(chunk['base64PNG'].split(',', 1)[1]))
            for col, coluna in enumerate(chunk['layout']):
                for lin, q in enumerate(coluna):
                    for y in range(h):
                        for x in range(w):
                            quadros[q][y][x] = sobrepor(quadros[q][y][x], img[lin * h + y][col * w + x], camada.get('opacity', 1))
    return w, h, [q for i, q in enumerate(quadros) if i not in escondidos]


def gravar_folha(nome, quadros, w, h):
    folha = [sum((q[y] for q in quadros), []) for y in range(h)]
    destino = DESTINO / nome
    gravar_png(destino, w * len(quadros), h, folha)
    print(f'{destino.relative_to(RAIZ)}: {len(quadros)} quadro(s) de {w}x{h}')


def main():
    DESTINO.mkdir(exist_ok=True)
    personagens, monitoras, tam = [], [], None
    for arq in sorted(ORIGEM.glob('*.piskel')):
        w, h, quadros = quadros_do_piskel(arq)
        if tam and (w, h) != tam: raise SystemExit(f'{arq.name}: todos os desenhos precisam ter {tam[0]}x{tam[1]}')
        tam = (w, h)
        (monitoras if 'monitora' in arq.stem.lower() else personagens).extend(quadros)
        print(f'lido {arq.name}: {len(quadros)} quadro(s)')
    if not tam: raise SystemExit(f'nenhum .piskel em {ORIGEM}')
    if personagens: gravar_folha('personagens.png', personagens, *tam)
    if monitoras: gravar_folha('monitoras.png', monitoras, *tam)


if __name__ == '__main__':
    main()
