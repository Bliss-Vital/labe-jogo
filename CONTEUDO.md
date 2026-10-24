# Conteúdo do Jogo LABe

Guia do que acontece em cada oficina do jogo: quem conduz, o que é ensinado, as perguntas, os minijogos
e os desafios da bancada. Serve para a equipe do LABe revisar o conteúdo e comparar com as oficinas
de verdade.

Jogar online: <https://bliss-vital.github.io/labe-jogo/>. Para abrir todas as oficinas sem jogar na
ordem, coloque `#livre` no fim do link, ou digite `123juliavital` no lugar do nome.

## A equipe no jogo

| Personagem | Papel | Desenho (quadro do Piskel) | Onde aparece |
| --- | --- | --- | --- |
| Profª Alejandra | professora, coordena o projeto | 6 | abertura e fechamento das oficinas, Lei de Ohm, divisor de tensão |
| Suzanne | monitora | `monitoras.piskel`, 2º quadro | oficinas 2 e 4 |
| Aline | monitora | 9 | oficinas 1, 3 e 5 |
| Letícia | monitora | 8 | oficinas 1 e 4 |
| Julia | monitora | 12 | oficina 6 (nas oficinas 7, 8 e 9 ela usa o uniforme da robótica) |
| Técnica Marta | técnica do laboratório | 11 | oficinas 1, 3, 7 e 9 |
| Técnica Lívia | técnica do laboratório | 3 | oficinas 2, 5, 6 e 9 |
| Aline, Letícia e Julia de uniforme verde | equipe de robótica **Project Neon** | 13, 14 e 15 | oficinas 7 e 8 (a Julia também na 9) |

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
- **Perguntas:** valor de três resistores (220 Ω, 20 kΩ e 10 kΩ).
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

## Oficina 6 · Circuitos equivalentes

**Equipe:** Profª Alejandra, Julia e técnica Lívia.

Feita a partir do capítulo 1 do livro *A Arte da Eletrônica* (Horowitz e Hill).

- A Julia explica a ideia de **circuito equivalente** com uma “caixa fechada” de resistores vista por dois pontos, A e B.
- A Lívia apresenta o **ohmímetro**: seletor em Ω, circuito desligado e **OL** quando não há caminho.
  Na bancada, o seletor do multímetro gira com um clique entre V⎓ e Ω.
- **Série:** R = R1 + R2. **Paralelo:** R = (R1 × R2) ÷ (R1 + R2), dois iguais valem a metade, e um
  resistor grande em paralelo com um pequeno vale quase o pequeno.
- **Desafios:** montar 3,2 kΩ com dois resistores em série (1 kΩ + 2,2 kΩ) e 500 Ω com dois de 1 kΩ em
  paralelo, medindo com o ohmímetro.
- A Profª Alejandra apresenta o **divisor de tensão**: Vsaída = Vfonte × R2 ÷ (R1 + R2).
- **Desafio:** montar um divisor que dê 2,5 V (metade da fonte) e medir.
- A Julia apresenta o **equivalente de Thévenin**: a fonte de Thévenin é a tensão sem carga e o resistor
  de Thévenin é R1 em paralelo com R2. O jogo usa os valores que a jogadora mediu.
- **Desafio:** ligar uma carga no divisor sem deixar a saída cair abaixo de 2,3 V (só a de 10 kΩ serve),
  e a regra prática: a carga deve ser pelo menos 10 vezes maior que o resistor de Thévenin.
- **Perguntas:** o que fazer antes de medir resistência; 220 Ω + 330 Ω em série; dois de 1 kΩ em paralelo;
  10 kΩ em paralelo com 100 Ω; um divisor de 1 kΩ e 4 kΩ; um Thévenin de 2,5 V e 500 Ω com carga de
  500 Ω; por que o divisor não serve para alimentar o motor.

## Oficina 7 · Motores elétricos

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

## Oficina 8 · Arduino: primeiros passos

**Equipe:** Profª Alejandra e Aline, Letícia e Julia de uniforme da robótica.

- O que é o Arduino (texto do slide da oficina), o microcontrolador e o **pinout**.
- Estrutura do programa: `setup()` roda uma vez e `loop()` repete para sempre.
- Comandos: `pinMode`, `digitalWrite`, `delay`, `tone` e `noTone`, montados em blocos.
- **Desafios:** pisca LED no pino 13 (o LED "L" da placa pisca junto); fazer o buzzer apitar no pino 8.
- **Perguntas:** o que é o Arduino; qual pino liga e desliga um LED; quanto tempo é `delay(500)`;
  o que muda trocando `delay(1000)` por `delay(250)`.
- No fim, a Profª Alejandra lembra que as próximas oficinas do LABe usam sensores e anuncia o chefão final.

## Oficina 9 · Chefão final: o osciloscópio

**Equipe:** Profª Alejandra, técnica Marta, técnica Lívia e Julia (de uniforme da robótica).

- O osciloscópio aparece como o **chefão final** do laboratório. No alto da cena fica a barra de vida dele:
  cada pergunta certa e cada rodada do minijogo vencida tira um pedaço (são 10 ao todo).
- A Marta explica o que o osciloscópio faz: **desenha a tensão ao longo do tempo**. A tela tem uma grade
  de 10 × 8 **divisões**, com a tensão na vertical e o tempo na horizontal.
- A Lívia liga um **gerador de funções** e mostra a **ponta de prova**: o gancho no sinal e o jacaré no terra (GND).
- **Minijogo do osciloscópio**, em quatro rodadas, girando os botões com ◀ ▶:
  1. **VOLTS/DIV**: deixar uma senoide de 6 V caber inteira na tela e ocupar mais da metade da altura (1 V/div).
  2. **TEMPO/DIV**: mostrar de 2 a 4 ondas de 250 Hz (1 ms/div).
  3. **TRIGGER**: o nível começa em 6 V, acima da onda, e a imagem corre; trazer o nível para dentro da
     onda para ela parar.
  4. **Golpe final**, com os três botões: o PWM do Arduino (`analogWrite(9, 64)`, 490 Hz, 25%), de 0 a 5 V,
     com a linha do 0 V mais para baixo.
- A Lívia ensina a tensão **pico a pico** (divisões × VOLTS/DIV), o **período** (divisões × TEMPO/DIV)
  e a **frequência** (f = 1 ÷ T).
- **Perguntas:** o que o eixo vertical mostra; onde vai o jacaré da ponta de prova; Vpp de uma onda de
  4 divisões com 2 V/div; frequência de uma onda de 2 ms; qual botão ajustar quando a onda corre;
  ciclo de trabalho do PWM na tela.
- O chefão é vencido, a tela mostra um sorriso e a equipe parabeniza a jogadora antes do certificado.

## Pontos para a equipe revisar

- **Resistores de 4 ou 5 faixas:** a tabela da aula é a de 5 faixas, mas os resistores do jogo têm 4.
  As colunas da tabela no jogo têm o nome da função de cada faixa, com uma nota explicando.
- **Oficina de Arduino:** só deu para aproveitar os slides 5 a 7 da apresentação do Canva. O resto foi
  escrito a partir dos cartazes e precisa ser comparado com a aula. Exportar os slides em PDF ajuda.
- **Oficina de circuitos equivalentes:** não veio de uma oficina do LABe, foi escrita a partir dos
  conceitos do livro. Conferir com o livro e decidir se ela vira uma oficina de verdade.
- **Oficina do osciloscópio:** também não veio de uma oficina do LABe. Os valores (senoide de 6 V,
  500 Hz e 250 Hz, PWM de 490 Hz) e o jeito de explicar o trigger podem ser ajustados ao osciloscópio
  que o laboratório tem de verdade.
- **Ordem das práticas do Arduino:** o pisca LED e o buzzer foram escolhidos a partir do cartaz
  ("Prática 2: ativando o buzzer"). Conferir se a oficina segue essa ordem.
