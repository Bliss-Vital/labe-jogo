# Conteúdo do Jogo LABe

Guia do que acontece em cada oficina do jogo: quem conduz, o que é ensinado, as perguntas, os minijogos
e os desafios da bancada. Serve para a equipe do LABe revisar o conteúdo e comparar com as oficinas
de verdade.

Jogar online: <https://bliss-vital.github.io/labe-jogo/>. Para abrir todas as oficinas sem jogar na
ordem, coloque `#livre` no fim do link, ou digite `123juliavital` no lugar do nome.

## A equipe no jogo

| Personagem | Papel | Desenho (quadro do Piskel) | Onde aparece |
| --- | --- | --- | --- |
| Profª Alejandra | professora, coordena o projeto | 6 | abertura e fechamento das oficinas, Lei de Ohm |
| Suzanne | monitora | `monitoras.piskel`, 2º quadro | oficinas 2 e 4 |
| Aline | monitora | 9 | oficinas 1, 3 e 5 |
| Letícia | monitora | 8 | oficinas 1 e 4 |
| Julia | monitora | 12 | (reservada; na oficina de motores ela usa o uniforme da robótica) |
| Técnica Marta | técnica do laboratório | 11 | oficinas 1, 3 e 6 |
| Técnica Lívia | técnica do laboratório | 3 | oficinas 2 e 5 |
| Aline, Letícia e Julia de uniforme verde | equipe de robótica **Project Neon** | 13, 14 e 15 | oficinas 6 e 7 |

As personagens que a jogadora pode escolher são os quadros **1, 2, 4, 5, 7 e 10**.

## Oficina 1 · Bem-vinda ao laboratório

**Equipe:** Profª Alejandra, Letícia, técnica Marta e Aline.

- A jogadora chega ao laboratório 405-1 e conhece a equipe.
- A técnica Marta apresenta a bancada: fonte de alimentação, protoboard, resistor, LED, jumpers e multímetro.
- A Aline explica **tensão**, **corrente** e **resistência** com a comparação da caixa d’água.
- A Letícia explica **circuito fechado** e **circuito aberto**.
- **Perguntas:** qual destes é o resistor (com figuras); o que acontece com a corrente se o resistor
  aumenta; como precisa ser o caminho para o LED acender.

## Oficina 2 · O código de cores

**Equipe:** Suzanne, técnica Lívia e Profª Alejandra.

- A Suzanne explica as faixas coloridas do resistor, com a tabela de cores embaixo do resistor.
- Exemplo explicado: marrom, preto, vermelho = 1000 Ω = 1 kΩ. A 4ª faixa é a tolerância.
- **Perguntas:** valor de três resistores (220 Ω, 330 Ω e 10 kΩ).
- **Minijogo:** montar um resistor de 4,7 kΩ escolhendo as cores das faixas.
- A Profª Alejandra apresenta a **Lei de Ohm** (V = R × I), com duas perguntas de conta.

## Oficina 3 · Protoboard e o primeiro LED

**Equipe:** técnica Marta e Aline.

- A Marta explica como os furos da protoboard se conectam: colunas de 5 furos e trilhas de alimentação.
- **Desafio:** encaixar um resistor de 220 Ω com cada perna numa coluna diferente.
- A Aline apresenta o **LED**: polaridade, perna longa (+) e por que ele precisa de um resistor.
- **Desafio:** acender um LED com resistor. Sem resistor, o LED queima.
- **Perguntas:** por que usar resistor com o LED; o que acontece com um resistor de 10 kΩ.

## Oficina 4 · Série e paralelo

**Equipe:** Letícia e Suzanne.

- Ligação em **série** (um caminho só) e em **paralelo** (cada um com seu caminho).
- **Desafios:** acender dois LEDs em série; acender dois LEDs em paralelo, um resistor para cada.
- **Perguntas:** o que acontece em série quando um LED queima; a corrente da fonte no paralelo.

## Oficina 5 · Medindo com o multímetro

**Equipe:** técnica Lívia, Aline e Profª Alejandra.

- A Lívia explica como medir **tensão**: seletor em V⎓, ponta preta no COM e vermelha no VΩ, em paralelo.
- **Desafios:** medir a tensão sobre o LED; medir a tensão sobre o resistor.
- A Profª Alejandra usa a medida da jogadora para calcular a corrente pela Lei de Ohm.
- **Perguntas:** onde encostar as pontas; para onde vai o resto da tensão da fonte.

## Oficina 6 · Motores elétricos

**Equipe:** Profª Alejandra, Aline, Letícia e Julia (de uniforme da robótica) e técnica Marta.

- Abertura: a professora anuncia a aula e as três monitoras da robótica aparecem juntas na frente da
  sala. A Julia apresenta a equipe **Project Neon** (Instagram **@projectneon**).
- A Marta explica o **motor de corrente contínua**: ímãs, bobina, eletroímã e comutador.
- **Desafios:** ligar o motor na fonte; inverter o sentido do giro; deixar o motor mais devagar com um
  resistor em série.
- A equipe de robótica explica o **PWM** e o **ciclo de trabalho**.
- **Minijogo do PWM:** segurar o botão liga o motor (100%) e soltar desliga (0%). Dando toques no ritmo
  certo, a jogadora deixa o carrinho entre 40% e 60% da velocidade. A tela mostra a onda PWM ao vivo.
- **Perguntas:** o que o motor transforma; como um robô anda de ré; o que é PWM de 25%; por que não
  ligar o motor direto no pino do Arduino.

## Oficina 7 · Arduino: primeiros passos

**Equipe:** Profª Alejandra e Aline, Letícia e Julia de uniforme da robótica.

- O que é o Arduino (texto do slide da oficina), o microcontrolador e o **pinout**.
- Estrutura do programa: `setup()` roda uma vez e `loop()` repete para sempre.
- Comandos: `pinMode`, `digitalWrite`, `delay`, `tone` e `noTone`, montados em blocos.
- **Desafios:** pisca LED no pino 13 (o LED "L" da placa pisca junto); fazer o buzzer apitar no pino 8.
- **Perguntas:** o que é o Arduino; qual pino liga e desliga um LED; quanto tempo é `delay(500)`;
  o que muda trocando `delay(1000)` por `delay(250)`.

## Pontos para a equipe revisar

- **Resistores de 4 ou 5 faixas:** a tabela da aula é a de 5 faixas, mas os resistores do jogo têm 4.
  As colunas da tabela no jogo têm o nome da função de cada faixa, com uma nota explicando.
- **Oficina de Arduino:** só deu para aproveitar os slides 5 a 7 da apresentação do Canva. O resto foi
  escrito a partir dos cartazes e precisa ser comparado com a aula. Exportar os slides em PDF ajuda.
- **Ordem das práticas do Arduino:** o pisca LED e o buzzer foram escolhidos a partir do cartaz
  ("Prática 2: ativando o buzzer"). Conferir se a oficina segue essa ordem.
