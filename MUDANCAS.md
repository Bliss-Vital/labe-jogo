# Mudanças no Jogo LABe

O que mudou no jogo, da mudança mais recente para a mais antiga. Serve para a equipe do LABe saber o
que conferir no site: <https://bliss-vital.github.io/labe-jogo/>. O conteúdo de cada oficina está em
[`CONTEUDO.md`](CONTEUDO.md).

## 24/10/2026

- **Nova oficina: Circuitos equivalentes** (oficina 6): o ohmímetro (seletor em Ω), resistência
  equivalente em série e em paralelo, divisor de tensão e equivalente de Thévenin. Baseada no capítulo 1
  do livro *A Arte da Eletrônica*.
- **Nova oficina: Chefão final, o osciloscópio** (oficina 9): o osciloscópio aparece como chefão, com uma
  barra de vida que cai a cada acerto, e um minijogo para girar os botões VOLTS/DIV, TEMPO/DIV e TRIGGER.
- Com as oficinas novas, **Motores elétricos** passa a ser a oficina 7 e **Arduino** a oficina 8.
- **Setas do teclado:** além do clique, da barra de espaço e do Enter, as setas → e ↓ passam as falas.
  O aviso da caixa de diálogo agora diz “clique ou aperte → para continuar”.
- **Código de cores (oficina 2):** a segunda pergunta passou a mostrar um resistor vermelho, preto e
  laranja, de 20 000 Ω (20 kΩ), no lugar do de 330 Ω.
- **Protoboard (oficina 3):** as trilhas de baixo têm duas fileiras e os rótulos não ficam mais um em
  cima do outro.
- Testes novos do ohmímetro, do divisor de tensão e do minijogo do osciloscópio.

## 18/10/2026

- Digitar `123juliavital` no lugar do nome libera todas as oficinas (modo monitora). Fica salvo no
  navegador até alguém entrar com outro nome ou clicar em recomeçar.

## 17/10/2026

Primeira versão do jogo, publicada no GitHub Pages.

- **Jogo e bancada virtual:** as oficinas viram uma história com diálogos, perguntas e desafios
  montados numa bancada (protoboard, fonte de 5 V, resistores, LEDs, fios e multímetro). O simulador
  calcula tensões e correntes. No fim aparece o certificado.
- **Oficinas 1 a 5:** bem-vinda ao laboratório, código de cores, protoboard e o primeiro LED, série e
  paralelo, medindo com o multímetro.
- **Visual em pixel art:** tela de apresentação, escolha de personagem (3 em cima e 3 embaixo, também no
  celular) e personagens desenhadas no Piskel.
- **Código de cores:** tabela de cores embaixo do resistor nas perguntas, na explicação e no minijogo de
  montar o resistor. Os números usam uma fonte mais legível (na anterior, o 2 e o 5 pareciam 8 e S).
- **Equipe do LABe no jogo:** Profª Alejandra, as monitoras Suzanne, Aline, Letícia e Julia e as técnicas
  Marta e Lívia, em rodízio entre as oficinas.
- **Oficina de Motores elétricos:** abre com a equipe de robótica Project Neon. Motor CC na bancada,
  inverter o sentido do giro, deixar o motor mais devagar com um resistor e o minijogo do PWM com o
  carrinho.
- **Oficina de Arduino:** Arduino UNO na bancada, código montado em blocos (`setup()`, `loop()`,
  `pinMode`, `digitalWrite`, `delay`, `tone` e `noTone`) e as práticas pisca LED e buzzer.
- **`CONTEUDO.md`:** guia das oficinas para a equipe revisar.
- `#livre` no fim do link libera todas as oficinas sem jogar na ordem.
