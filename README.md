# Jogo LABe

Jogo online das oficinas do **LABe — Mulheres no Laboratório de Eletrônica** (projeto de extensão da UFABC).

É um jogo em **pixel art**: a participante escolhe a personagem, entra no laboratório, conversa com as
monitoras, responde perguntas e monta circuitos de verdade numa **bancada virtual**: protoboard, fonte
de 5 V, resistores, LEDs, fios, multímetro, um **motor CC** e um **Arduino UNO** programável. O simulador
calcula tensões e correntes: o LED acende, fica fraquinho, ou **queima** se faltar o resistor; o motor
gira mais rápido ou mais devagar conforme a tensão, no sentido que a corrente manda.

**Jogar online:** <https://claude.ai/artifact/NtjfM2VXytDxKJUL2JiBXj>

O que cada oficina ensina, quem conduz e quais são os desafios está em [`CONTEUDO.md`](CONTEUDO.md).

## Oficinas

1. **Bem-vinda ao laboratório**: a bancada, tensão, corrente, resistência e circuito fechado.
2. **O código de cores**: ler resistores pelas faixas, minijogo de montar um resistor e a Lei de Ohm.
3. **Protoboard e o primeiro LED**: como os furos se conectam, polaridade do LED, primeiro circuito.
4. **Série e paralelo**: dois LEDs de cada jeito, na bancada.
5. **Medindo com o multímetro**: medir a tensão no LED e no resistor e calcular a corrente.
6. **Motores elétricos**: a equipe de robótica Project Neon se apresenta; como o motor CC funciona
   (ímãs, bobina e comutador), ligar o motor, inverter o sentido do giro, deixar ele mais devagar com
   um resistor em série e o **minijogo do PWM** (segurar o botão liga o motor, soltar desliga: com
   toques no ritmo certo, a jogadora controla a velocidade do carrinho).
7. **Arduino: primeiros passos**: o que é o Arduino, pinout, `setup()` e `loop()`, e as práticas
   *pisca LED* (pino 13) e *ativando o buzzer* (pino 8), com código montado em blocos.

Ao concluir tudo, aparece um certificado de conclusão do jogo com o nome da participante.

## Como jogar no computador

Não precisa instalar nada: dê dois cliques em `index.html` e o jogo abre no navegador.
O progresso fica salvo no próprio navegador.

**Modo monitora:** abra com `index.html?livre` (no link online, use `#livre` no fim) para liberar
todas as oficinas sem precisar jogar na ordem.

## Como editar o conteúdo

| O que mudar | Arquivo |
| --- | --- |
| Falas, perguntas, ordem das oficinas, nomes das monitoras | `js/historia.js` |
| Desafios da bancada (objetivo, peças da gaveta, dicas, quando conta como "certo") | `js/desafios.js` |
| Cenários e ilustrações das aulas | `js/arte.js` |
| Comandos do Arduino e o editor em blocos | `js/arduino.js` |
| Minijogo do PWM (inércia do carrinho, faixa da meta) | `js/pwm.js` |
| Cores e visual | `css/estilo.css` |
| Física do circuito (tensão da fonte, LEDs) | `js/simulador.js` |

Exemplo de passos em `js/historia.js`:

```js
{ quem: 'suzanne', texto: 'Oi, {nome}! Essa é a **protoboard**.', ilustracao: 'protoboard' },
{ tipo: 'quiz', quem: 'aline', pergunta: 'Qual o valor deste resistor?', ilustracao: 'resistor:vermelho,vermelho,marrom',
  opcoes: [
    { texto: '220 Ω', certa: true, resposta: 'Isso!' },
    { texto: '22 Ω', resposta: 'Quase! Falta um zero.' },
  ] },
{ tipo: 'desafio', id: 'primeiro-led' },
```

A equipe do jogo fica em `PERSONAGENS` (em `js/historia.js`): Profª Alejandra, as monitoras Suzanne,
Aline, Letícia e Julia, as técnicas Marta e Lívia, e, nas oficinas de motores e de Arduino, Aline,
Letícia e Julia com o uniforme da equipe de robótica Project Neon. Quem aparece em cada oficina está
em [`CONTEUDO.md`](CONTEUDO.md).

## Personagens (pixel art)

Os desenhos ficam em `fotos/personagens/`, no formato do [Piskel](https://www.piskelapp.com/), com 32×32
pixels por quadro, de perfil, viradas para a esquerda:

- os quadros dos arquivos `.piskel` viram `img/personagens.png`. Os que estão em `PERSONAGENS`
  (`js/historia.js`) são da equipe; todos os outros aparecem para a jogadora escolher;
- `monitoras.piskel` vira `img/monitoras.png` (o 2º quadro é a Suzanne);
- no jogo, a equipe aparece virada para a direita, de frente para a jogadora.

Depois de editar no Piskel, rode `py ferramentas/importar_personagens.py` para gerar `img/personagens.png`
e `img/monitoras.png`. O jogo descobre sozinho quantas personagens existem.

## Testes

Abra `testes/simulador.html` no navegador: ele confere o simulador (LED acende com ~13,8 mA, queima
sem resistor, curto-circuito, série, paralelo, multímetro, motor, Arduino), o minijogo do PWM e o
roteiro (todo nome, desafio e ilustração usados existem), e mostra quantos testes passaram.

## Publicar na internet

O jogo é só HTML, CSS e JavaScript, sem servidor. Dá para publicar de graça no **GitHub Pages**:
*Settings → Pages → Deploy from a branch → `main` / raiz*. Em conta gratuita, o GitHub Pages
só funciona com repositório **público**. Para manter o repositório privado e ainda publicar,
é preciso o GitHub Pro, que estudantes ganham de graça pelo
[GitHub Education](https://education.github.com/) com o e-mail da universidade.
