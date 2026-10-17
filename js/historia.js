/*
 * historia.js — personagens e roteiro das oficinas. É aqui que se edita o conteúdo!
 *
 * Cada oficina tem uma lista de "passos", que acontecem em ordem:
 *
 *   { quem: 'suzanne', texto: 'Oi, {nome}!' }        fala (clique para avançar)
 *       quem: id de PERSONAGENS, 'voce' (a jogadora) ou 'narrador'
 *       quem fala aparece na cena; na narração ela continua lá
 *   sozinha: true                                    tira a monitora da cena (ex.: no corredor)
 *       no texto: {nome} vira o nome da jogadora, **negrito** destaca palavras
 *   ilustracao: 'agua'                               mostra uma ilustração (veja arte.js);
 *                                                    ela fica na tela até outra ou ilustracao: null
 *   cenario: 'corredor' | 'laboratorio' | 'computadores'   troca o fundo
 *
 *   { tipo: 'quiz', quem, pergunta, opcoes: [{ texto, certa: true, resposta }] }
 *       as opções aparecem embaralhadas; "resposta" é o comentário depois do clique
 *       opções com icone: 'resistor' | 'led' | 'capacitor' | 'multimetro' | 'fonte' | 'protoboard' | 'arduino' | 'buzzer'
 *   { tipo: 'resistor', quem, texto, alvo: 4700 }     minijogo de montar o resistor pelas cores
 *   { tipo: 'desafio', id: 'primeiro-led' }           abre a bancada (veja desafios.js)
 */

// A equipe do LABe no jogo.
// folha 'personagens' = img/personagens.png (desenhos de fotos/personagens/*.piskel);
// folha 'monitoras' = img/monitoras.png (fotos/personagens/monitoras.piskel).
// sprite = número do quadro contando do 0 (o quadro 6 do Piskel é o sprite 5).
// Os quadros usados aqui não aparecem na escolha de personagem da jogadora.
const PERSONAGENS = {
  alejandra: { nome: 'Profª Alejandra', cor: '#3d1f5f', folha: 'personagens', sprite: 5 },
  suzanne: { nome: 'Suzanne', cor: '#7b3fb0', folha: 'monitoras', sprite: 1 },
  aline: { nome: 'Aline', cor: '#b0458a', folha: 'personagens', sprite: 8 },
  julia: { nome: 'Julia', cor: '#a8326e', folha: 'personagens', sprite: 11 },
  marta: { nome: 'Técnica Marta', cor: '#2f6f62', folha: 'personagens', sprite: 10 },
  livia: { nome: 'Técnica Lívia', cor: '#8a4b16', folha: 'personagens', sprite: 2 },
  // com o uniforme da equipe de robótica (oficina de Arduino)
  'aline-robotica': { nome: 'Aline', cor: '#1f7a3a', folha: 'personagens', sprite: 12 },
  'leticia-robotica': { nome: 'Letícia', cor: '#1f7a3a', folha: 'personagens', sprite: 13 },
  'julia-robotica': { nome: 'Julia', cor: '#1f7a3a', folha: 'personagens', sprite: 14 },
};

const OFICINAS = [
  {
    id: 'o1',
    titulo: 'Bem-vinda ao laboratório',
    resumo: 'Conheça a bancada, a equipe do LABe e três palavras que vão te acompanhar: tensão, corrente e resistência.',
    passos: [
      { cenario: 'corredor', sozinha: true, quem: 'narrador', texto: 'Sábado, 9 horas da manhã. Você chega ao bloco de laboratórios da universidade.' },
      { quem: 'narrador', texto: 'Na porta do laboratório 405-1 tem um cartaz roxo: **LABe — Mulheres no Laboratório de Eletrônica**.' },
      { quem: 'voce', texto: 'É aqui! Eu nunca mexi com circuitos... mas vim justamente para aprender.' },
      { cenario: 'laboratorio', quem: 'alejandra', texto: 'Bom dia! Seja muito bem-vinda ao LABe! Eu sou a Alejandra, professora que coordena o projeto.' },
      { quem: 'alejandra', texto: 'Aqui ninguém precisa saber nada antes. A ideia é colocar a mão na massa num ambiente acolhedor, tirar dúvidas e errar sem medo.' },
      { quem: 'alejandra', texto: 'Essas são a Suzanne, a Aline e a Julia, monitoras da oficina, e a Marta e a Lívia, técnicas do laboratório. Elas vão te acompanhar na bancada.' },
      { quem: 'suzanne', texto: 'Oi, {nome}! Que bom que você veio! Senta aqui nessa bancada comigo.' },
      { quem: 'marta', ilustracao: 'componentes', texto: 'Oi! Eu sou a Marta, técnica do laboratório: eu cuido dos equipamentos. Na sua bancada tem tudo o que a gente vai usar. Dá uma olhada!' },
      { quem: 'marta', texto: 'A **fonte de alimentação** fornece energia para o circuito. A **protoboard** é a placa cheia de furinhos onde a gente monta tudo sem precisar soldar.' },
      { quem: 'marta', texto: 'Os **resistores** são os cilindrinhos listrados, os **LEDs** são as luzinhas, os **jumpers** são os fios, e o **multímetro** é o aparelho laranja que mede as grandezas elétricas.' },
      {
        tipo: 'quiz', quem: 'marta', ilustracao: null, pergunta: 'Rapidinho: qual destes é o **resistor**?',
        opcoes: [
          { icone: 'resistor', texto: 'Este', certa: true, resposta: 'Isso! O resistor tem faixas coloridas que dizem o valor dele.' },
          { icone: 'led', texto: 'Este', resposta: 'Esse é o LED, a luzinha! O resistor é o cilindrinho listrado.' },
          { icone: 'capacitor', texto: 'Este', resposta: 'Esse é um capacitor, ele guarda energia. O resistor é o listrado.' },
          { icone: 'multimetro', texto: 'Este', resposta: 'Esse é o multímetro, nosso aparelho de medir. Procura o cilindrinho listrado!' },
        ],
      },
      { quem: 'suzanne', texto: 'Antes de montar, três palavrinhas que vão aparecer o tempo todo: **tensão**, **corrente** e **resistência**. A Aline explica melhor que ninguém!' },
      { quem: 'aline', ilustracao: 'agua', texto: 'Eu gosto de pensar numa caixa d’água. A **tensão**, medida em volts (V), é como a pressão da água: é o que empurra as cargas elétricas.' },
      { quem: 'aline', texto: 'A **corrente**, em ampères (A), é a quantidade de carga passando por segundo, como a vazão de água no cano.' },
      { quem: 'aline', texto: 'E a **resistência**, em ohms (Ω), é o quanto o caminho dificulta a passagem, como um cano mais fino.' },
      {
        tipo: 'quiz', quem: 'aline', pergunta: 'Se a gente troca o resistor por um de valor **maior**, com a mesma tensão, o que acontece com a corrente?',
        opcoes: [
          { texto: 'Diminui', certa: true, resposta: 'Exato! Mais resistência, menos corrente, como um cano mais fino deixa passar menos água.' },
          { texto: 'Aumenta', resposta: 'Pensa no cano: se ele fica mais fino, passa mais ou menos água?' },
          { texto: 'Continua igual', resposta: 'A resistência muda a corrente sim! Pensa no cano ficando mais fino.' },
        ],
      },
      { quem: 'suzanne', ilustracao: 'circuito-fechado', texto: 'Último conceito de hoje: para a corrente circular, o circuito precisa estar **fechado**. Ela sai do positivo (+) da fonte, passa pelos componentes e volta para o negativo (−).' },
      { quem: 'suzanne', texto: 'Se tiver qualquer interrupção no caminho, o circuito está **aberto** e nada funciona. É assim que um interruptor apaga a luz!' },
      {
        tipo: 'quiz', quem: 'suzanne', pergunta: 'Para o LED acender, o caminho da corrente precisa ser:',
        opcoes: [
          { texto: 'Fechado, saindo do + e voltando ao −', certa: true, resposta: 'Isso aí! Sem caminho completo, nada de luz.' },
          { texto: 'Aberto, com uma parte desconectada', resposta: 'Com o circuito aberto a corrente não tem por onde passar...' },
          { texto: 'Ligado só no +', resposta: 'Só o + não basta: a corrente precisa voltar para o − da fonte.' },
        ],
      },
      { ilustracao: null, quem: 'alejandra', texto: 'Muito bem, {nome}! Você terminou a primeira oficina. Na próxima, vamos descobrir como ler o valor dos resistores.' },
    ],
  },

  {
    id: 'o2',
    titulo: 'O código de cores',
    resumo: 'Descubra o valor de um resistor só olhando as faixas coloridas, e conheça a Lei de Ohm.',
    passos: [
      { cenario: 'laboratorio', quem: 'aline', texto: 'Oi de novo, {nome}! Hoje a missão é descobrir a identidade de cada resistor.' },
      { quem: 'aline', ilustracao: 'resistor:marrom,preto,vermelho', texto: 'Os resistores são pequenos demais para escrever números neles. Por isso usam **faixas coloridas**: cada cor representa um número.' },
      { quem: 'aline', ilustracao: 'codigo-cores', texto: 'Essa é a tabela: preto 0, marrom 1, vermelho 2, laranja 3, amarelo 4, verde 5, azul 6, violeta 7, cinza 8 e branco 9.' },
      { quem: 'aline', texto: 'A 1ª faixa é o primeiro dígito, a 2ª é o segundo dígito e a 3ª é o **multiplicador**: quantos zeros a gente coloca depois.' },
      { quem: 'aline', ilustracao: 'resistor-explicado:marrom,preto,vermelho', texto: 'Por exemplo: marrom (1), preto (0) e vermelho (2 zeros) dá 1 0 00 = **1000 Ω**, que também se escreve 1 kΩ.' },
      { quem: 'aline', texto: 'A 4ª faixa, geralmente dourada, é a **tolerância**: o valor real pode variar 5% pra mais ou pra menos.' },
      { quem: 'suzanne', texto: 'Dica de quem já errou muito: a faixa da tolerância fica mais afastada das outras. Comece a ler sempre pelo outro lado!' },
      {
        tipo: 'quiz', quem: 'aline', ilustracao: 'resistor:vermelho,vermelho,marrom', pergunta: 'Sua vez! Qual o valor deste resistor?',
        opcoes: [
          { texto: '220 Ω', certa: true, resposta: 'Vermelho (2), vermelho (2), marrom (1 zero): 220 Ω. Esse é o resistor que mais vamos usar com LEDs!' },
          { texto: '22 Ω', resposta: 'Quase! A 3ª faixa é marrom: ela manda colocar **um** zero depois do 22.' },
          { texto: '2200 Ω', resposta: 'Marrom no multiplicador quer dizer 1 zero, não 2.' },
          { texto: '122 Ω', resposta: 'A 3ª faixa não é um dígito, é o multiplicador!' },
        ],
      },
      {
        tipo: 'quiz', quem: 'aline', ilustracao: 'resistor:laranja,laranja,marrom', pergunta: 'E este aqui?',
        opcoes: [
          { texto: '330 Ω', certa: true, resposta: 'Laranja (3), laranja (3), marrom (1 zero): 330 Ω. Arrasou!' },
          { texto: '33 Ω', resposta: 'Lembra do zero que o marrom pede no final!' },
          { texto: '3300 Ω', resposta: 'Marrom no multiplicador é só 1 zero.' },
          { texto: '331 Ω', resposta: 'A 3ª faixa é o multiplicador, não um dígito.' },
        ],
      },
      {
        tipo: 'quiz', quem: 'aline', ilustracao: 'resistor:marrom,preto,laranja', pergunta: 'Agora um mais difícil:',
        opcoes: [
          { texto: '10 kΩ', certa: true, resposta: 'Marrom (1), preto (0), laranja (3 zeros): 10 000 Ω = 10 kΩ!' },
          { texto: '1 kΩ', resposta: 'Laranja é 3, então são **três** zeros depois do 10.' },
          { texto: '103 Ω', resposta: 'A 3ª faixa é o multiplicador: laranja pede três zeros.' },
          { texto: '100 kΩ', resposta: 'Conta de novo: 10 seguido de três zeros.' },
        ],
      },
      { tipo: 'resistor', quem: 'suzanne', ilustracao: null, alvo: 4700, texto: 'Agora o contrário: monte um resistor de **4,7 kΩ** (4700 Ω) escolhendo as cores das faixas.', dica: 'Pensa: 47 seguido de quantos zeros?' },
      { ilustracao: null, quem: 'suzanne', texto: 'Na oficina de verdade a gente também confere com o multímetro. Teve gente que saiu dizendo: “descobri minha resistência!”' },
      { quem: 'alejandra', ilustracao: 'vri', texto: 'Agora, a lei mais famosa da eletrônica: a **Lei de Ohm**. Ela diz que **V = R × I**.' },
      { quem: 'alejandra', texto: 'Ou seja: a tensão sobre um resistor é a resistência multiplicada pela corrente. Sabendo duas, você descobre a terceira: I = V ÷ R e R = V ÷ I.' },
      { quem: 'alejandra', texto: 'Um truque: cubra com o dedo a letra que você quer descobrir no triângulo. O que sobra é a conta!' },
      {
        tipo: 'quiz', quem: 'alejandra', pergunta: 'Um resistor de **100 Ω** está ligado em **5 V**. Qual é a corrente?',
        opcoes: [
          { texto: '0,05 A (50 mA)', certa: true, resposta: 'I = V ÷ R = 5 ÷ 100 = 0,05 A, ou seja, 50 miliampères.' },
          { texto: '500 A', resposta: 'Essa seria V × R. Para a corrente, é V ÷ R!' },
          { texto: '20 A', resposta: 'Essa seria R ÷ V. Para a corrente, é V ÷ R.' },
          { texto: '0,5 A', resposta: 'Quase! Confere a conta: 5 ÷ 100.' },
        ],
      },
      {
        tipo: 'quiz', quem: 'alejandra', pergunta: 'Passa **10 mA** (0,01 A) por um resistor de **1 kΩ**. Qual a tensão sobre ele?',
        opcoes: [
          { texto: '10 V', certa: true, resposta: 'V = R × I = 1000 × 0,01 = 10 V.' },
          { texto: '1 V', resposta: 'Lembra que 1 kΩ são 1000 Ω: 1000 × 0,01.' },
          { texto: '0,1 V', resposta: 'Para a tensão, é R × I: 1000 × 0,01.' },
          { texto: '100 V', resposta: 'Confere: 1000 × 0,01 dá quanto?' },
        ],
      },
      { ilustracao: null, quem: 'aline', texto: 'Mandou muito bem, {nome}! Na próxima oficina a gente finalmente vai para a bancada montar o primeiro circuito.' },
    ],
  },

  {
    id: 'o3',
    titulo: 'Protoboard e o primeiro LED',
    resumo: 'Entenda como os furos da protoboard se conectam e acenda seu primeiro LED na bancada.',
    passos: [
      { cenario: 'laboratorio', quem: 'suzanne', texto: 'Chegou o dia, {nome}! Hoje você monta seu primeiro circuito.' },
      { quem: 'suzanne', ilustracao: 'protoboard', texto: 'Essa é a protoboard. Por dentro, ela tem tirinhas de metal que ligam alguns furos entre si.' },
      { quem: 'suzanne', texto: 'No meio, cada **coluna de 5 furos** (de a até e, e de f até j) é ligada por dentro. O canal do meio separa a parte de cima da parte de baixo.' },
      { quem: 'suzanne', texto: 'Nas bordas ficam as **trilhas de alimentação**: a vermelha (+) e a azul (−). Elas são ligadas na horizontal. A fonte da bancada já está ligada nelas.' },
      { quem: 'suzanne', texto: 'Na bancada, quando você passar o mouse (ou tocar) num furo, eu mostro quais furos estão conectados com ele. Vamos testar encaixando uma peça?' },
      { tipo: 'desafio', id: 'primeira-peca' },
      { quem: 'suzanne', ilustracao: null, texto: 'Viu? Se as duas pernas ficam na mesma coluna, o componente fica “em curto” e a corrente passa por dentro da placa, não por ele.' },
      { quem: 'julia', texto: 'Oi, {nome}! Eu sou a Julia, também sou monitora do LABe. Agora eu vou te apresentar o LED!' },
      { quem: 'julia', ilustracao: 'led', texto: 'LED quer dizer Diodo Emissor de Luz, e ele tem **polaridade**: só funciona num sentido.' },
      { quem: 'julia', texto: 'A perna **mais longa** é o ânodo (+) e vai para o lado positivo. A mais curta é o cátodo (−). O lado do cátodo também tem um chanfro, uma parte achatada.' },
      { quem: 'julia', texto: 'E muito importante: o LED **nunca** pode ser ligado direto na fonte. Ele precisa de um **resistor em série** para limitar a corrente. Senão... queima!' },
      {
        tipo: 'quiz', quem: 'julia', pergunta: 'Por que colocamos um resistor junto com o LED?',
        opcoes: [
          { texto: 'Para limitar a corrente e não queimar o LED', certa: true, resposta: 'Isso! O resistor controla quanta corrente passa.' },
          { texto: 'Para o LED brilhar mais', resposta: 'Na verdade o resistor diminui a corrente. Ele protege o LED.' },
          { texto: 'Porque o LED não tem polaridade', resposta: 'O LED tem polaridade sim (perna longa no +). O resistor é para outra coisa.' },
        ],
      },
      { quem: 'suzanne', ilustracao: null, texto: 'Sua vez! Monte um circuito com um resistor e um LED, ligue a fonte e faça ele acender. Se der errado, tudo bem: na bancada a gente aprende errando!' },
      { tipo: 'desafio', id: 'primeiro-led' },
      { quem: 'alejandra', texto: 'Parabéns, {nome}! Repare: com resistores maiores o LED brilha menos, porque passa menos corrente. É a Lei de Ohm acontecendo na sua frente.' },
      {
        tipo: 'quiz', quem: 'alejandra', pergunta: 'Se você trocar o resistor de 220 Ω por um de **10 kΩ**, o LED vai:',
        opcoes: [
          { texto: 'Ficar bem mais fraquinho', certa: true, resposta: 'Isso! Com 10 kΩ a corrente fica mais de 40 vezes menor.' },
          { texto: 'Brilhar mais forte', resposta: 'Mais resistência significa menos corrente, e menos corrente é menos luz.' },
          { texto: 'Queimar', resposta: 'Queimar acontece com corrente demais. Um resistor maior faz o contrário!' },
        ],
      },
    ],
  },

  {
    id: 'o4',
    titulo: 'Série e paralelo',
    resumo: 'Ligue vários LEDs de dois jeitos diferentes e veja o que muda na tensão e na corrente.',
    passos: [
      { cenario: 'laboratorio', quem: 'julia', ilustracao: 'serie', texto: 'Existem duas formas principais de ligar vários componentes: em **série** e em **paralelo**.' },
      { quem: 'julia', texto: 'Em **série**, os componentes ficam um depois do outro, num caminho único. A mesma corrente passa por todos, e a tensão da fonte se divide entre eles.' },
      { quem: 'julia', ilustracao: 'paralelo', texto: 'Em **paralelo**, cada componente tem seu próprio caminho entre os mesmos dois pontos. A tensão é a mesma para todos e a corrente se divide.' },
      { quem: 'suzanne', texto: 'As tomadas e lâmpadas da sua casa são ligadas em paralelo. Já naqueles pisca-piscas antigos de Natal, ligados em série, uma lampadinha queimada apagava todas!' },
      {
        tipo: 'quiz', quem: 'suzanne', pergunta: 'Num circuito em **série**, se um LED queimar e abrir o circuito, o que acontece com os outros?',
        opcoes: [
          { texto: 'Apagam também', certa: true, resposta: 'Isso! Com o caminho único interrompido, a corrente para em todo o circuito.' },
          { texto: 'Continuam acesos', resposta: 'Isso aconteceria em paralelo! Em série só existe um caminho.' },
          { texto: 'Brilham mais forte', resposta: 'Sem caminho, não passa corrente nenhuma...' },
        ],
      },
      { quem: 'suzanne', ilustracao: null, texto: 'Desafio: acenda **dois LEDs em série** com um resistor.' },
      { tipo: 'desafio', id: 'serie' },
      { quem: 'julia', texto: 'Viu que eles brilham menos? Os dois LEDs “usam” uns 4 V juntos, sobra só 1 V no resistor, e a corrente diminui.' },
      { quem: 'suzanne', texto: 'Agora o contrário: acenda **dois LEDs em paralelo**. Dica: um resistor para cada LED!' },
      { tipo: 'desafio', id: 'paralelo' },
      {
        tipo: 'quiz', quem: 'julia', pergunta: 'Na ligação em **paralelo**, a corrente que sai da fonte é:',
        opcoes: [
          { texto: 'A soma das correntes de cada LED', certa: true, resposta: 'Exato! Cada caminho puxa sua corrente, e a fonte entrega tudo junto. Dá para ver no visor da fonte.' },
          { texto: 'A mesma de um LED só', resposta: 'Cada caminho leva sua parte. A fonte precisa entregar todas elas!' },
          { texto: 'Zero', resposta: 'Se os LEDs acenderam, tem corrente saindo da fonte!' },
        ],
      },
      { quem: 'alejandra', texto: 'Ótimo trabalho, {nome}! Na última oficina vamos usar o multímetro para medir tudo isso.' },
    ],
  },

  {
    id: 'o5',
    titulo: 'Medindo com o multímetro',
    resumo: 'Meça tensões de verdade no seu circuito e use a Lei de Ohm para descobrir a corrente.',
    passos: [
      { cenario: 'laboratorio', quem: 'livia', texto: 'Oi, {nome}! Eu sou a Lívia, técnica do laboratório. Hoje é dia do meu aparelho favorito!' },
      { quem: 'livia', ilustracao: 'multimetro', texto: 'Esse é o **multímetro**! Ele mede tensão, corrente e resistência.' },
      { quem: 'livia', texto: 'Para medir **tensão**, a gente gira o seletor para V⎓ (tensão contínua), coloca a ponta **preta** no COM e a **vermelha** no VΩ.' },
      { quem: 'livia', texto: 'O mais importante: tensão se mede **em paralelo**, encostando as pontas nos dois lados do componente. A vermelha no lado mais positivo, a preta no mais negativo.' },
      { quem: 'suzanne', texto: 'Se você inverter as pontas, não estraga nada: o visor só mostra o valor com um sinal de menos na frente.' },
      {
        tipo: 'quiz', quem: 'livia', pergunta: 'Para medir a tensão no LED, as pontas do multímetro devem ficar:',
        opcoes: [
          { texto: 'Uma de cada lado do LED (em paralelo)', certa: true, resposta: 'Isso! O multímetro “compara” os dois lados do LED.' },
          { texto: 'As duas no mesmo furo', resposta: 'No mesmo ponto não tem diferença nenhuma para medir: dá 0 V.' },
          { texto: 'Longe do circuito', resposta: 'As pontas precisam encostar no circuito para medir!' },
        ],
      },
      { quem: 'livia', ilustracao: null, texto: 'Bora medir! Monte o circuito do LED e meça a tensão sobre ele.' },
      { tipo: 'desafio', id: 'medir-led' },
      { quem: 'livia', texto: 'Você mediu **{tensaoLed} V** no LED. Agora, sem desmontar nada, vamos medir o resistor.' },
      { tipo: 'desafio', id: 'medir-resistor' },
      { quem: 'alejandra', ilustracao: 'vri', texto: 'Você mediu **{medidaV} V** num resistor de **{medidaR}**. Pela Lei de Ohm: I = V ÷ R, que dá cerca de **{medidaI} mA**.' },
      { quem: 'alejandra', texto: 'E repara: essa é praticamente a mesma corrente que aparece no visor da fonte. A teoria e a prática batendo!' },
      {
        tipo: 'quiz', quem: 'alejandra', pergunta: 'O LED ficou com uns 2 V e a fonte tem 5 V. Para onde foi o resto da tensão?',
        opcoes: [
          { texto: 'Ficou no resistor', certa: true, resposta: 'Isso! Em série, a soma das tensões é igual à tensão da fonte: LED + resistor = 5 V.' },
          { texto: 'Se perdeu no ar', resposta: 'A tensão não some! Mede o resistor e soma com a do LED.' },
          { texto: 'Voltou para a fonte', resposta: 'Ela fica nos componentes do caminho. Qual outro componente está no circuito?' },
        ],
      },
      { ilustracao: null, quem: 'suzanne', texto: '{nome}, você montou, mediu e calculou. Isso é ser engenheira na prática!' },
      { quem: 'alejandra', texto: 'Você completou as oficinas de eletrônica básica do LABe! Agora você está pronta para a oficina de Arduino. E lembre: o laboratório também é lugar de mulher!' },
    ],
  },

  {
    id: 'a1',
    trilha: 'Arduino',
    titulo: 'Arduino: primeiros passos',
    resumo: 'Conheça o Arduino e os pinos dele, e escreva seus primeiros programas: piscar um LED e fazer um buzzer apitar.',
    passos: [
      { cenario: 'computadores', quem: 'alejandra', texto: 'Bem-vinda à oficina de Arduino, {nome}! Aqui você aprende sobre **microcontroladores** e **programação básica**.' },
      { quem: 'alejandra', texto: 'Hoje a bancada fica do lado do computador: além de montar o circuito, você vai escrever o código que controla ele.' },
      { quem: 'alejandra', texto: 'E hoje quem te acompanha são as monitoras da **equipe de robótica**: a Aline, a Letícia e a Julia. Repara no uniforme!' },
      { quem: 'aline-robotica', ilustracao: 'arduino', texto: 'Esse é o **Arduino UNO**! O Arduino é uma plataforma de prototipagem eletrônica **aberta** e de **baixo custo**.' },
      { quem: 'aline-robotica', texto: 'Ele é baseado em **hardware**, a placa com o microcontrolador, e em **software**, a IDE Arduino, o programa onde a gente escreve o código.' },
      { quem: 'aline-robotica', texto: 'Com ele dá para programar e controlar **sensores, motores, LEDs** e diversos dispositivos eletrônicos.' },
      { quem: 'leticia-robotica', texto: 'Ele é muito usado em educação, robótica, automação e IoT, a Internet das Coisas. É fácil de usar: ideal para iniciantes e também para projetos avançados.' },
      { quem: 'leticia-robotica', texto: 'O **microcontrolador** é o “cérebro” da placa: um computadorzinho que guarda o seu programa e executa uma instrução depois da outra.' },
      {
        tipo: 'quiz', quem: 'leticia-robotica', ilustracao: null, pergunta: 'Então, o que é o Arduino?',
        opcoes: [
          { texto: 'Uma plataforma de prototipagem: placa com microcontrolador + software', certa: true, resposta: 'Isso! Hardware e software trabalhando juntos.' },
          { texto: 'Um tipo de resistor', resposta: 'Resistor é um componente que limita corrente. O Arduino é uma placa que a gente programa!' },
          { texto: 'Um aplicativo de celular', resposta: 'Ele tem um software (a IDE), mas o Arduino em si é uma placa de verdade.' },
        ],
      },
      { quem: 'aline-robotica', ilustracao: 'arduino', texto: 'Agora o **pinout**, o mapa dos pinos. Em cima ficam os **pinos digitais**, de 0 a 13: eles ligam e desligam coisas.' },
      { quem: 'aline-robotica', texto: 'Embaixo ficam os pinos de **alimentação** (5V, 3.3V e GND) e os **pinos analógicos** (A0 a A5), que servem para ler sensores.' },
      { quem: 'leticia-robotica', texto: 'O **GND** é o terra, o 0 V: é o “negativo” do circuito. Tudo o que a gente liga no Arduino precisa voltar para o GND.' },
      {
        tipo: 'quiz', quem: 'leticia-robotica', ilustracao: null, pergunta: 'Para ligar e desligar um LED pelo código, usamos qual pino?',
        opcoes: [
          { texto: 'Um pino digital (0 a 13)', certa: true, resposta: 'Exato! O código coloca 5 V ou 0 V nesse pino.' },
          { texto: 'O pino GND', resposta: 'O GND é sempre 0 V: ele é o caminho de volta, não liga nem desliga nada.' },
          { texto: 'O botão reset', resposta: 'O reset reinicia o programa. Para controlar o LED usamos um pino digital.' },
        ],
      },
      { quem: 'alejandra', ilustracao: 'setup-loop', texto: 'Todo programa de Arduino tem duas partes. O **setup()** roda uma vez só, quando a placa liga: é onde a gente configura tudo.' },
      { quem: 'alejandra', texto: 'O **loop()** repete para sempre: termina a última linha e volta para a primeira, de novo e de novo.' },
      { quem: 'leticia-robotica', ilustracao: 'high-low', texto: 'Três comandos para começar. **pinMode(13, OUTPUT)** avisa que o pino 13 é uma saída. **digitalWrite(13, HIGH)** coloca 5 V no pino, e **LOW** coloca 0 V.' },
      { quem: 'leticia-robotica', texto: 'E **delay(1000)** faz o Arduino esperar 1000 milissegundos, ou seja, 1 segundo, antes de ir para a próxima linha.' },
      {
        tipo: 'quiz', quem: 'leticia-robotica', ilustracao: null, pergunta: 'Quanto tempo o Arduino espera com **delay(500)**?',
        opcoes: [
          { texto: 'Meio segundo', certa: true, resposta: '500 milissegundos = 0,5 segundo.' },
          { texto: '500 segundos', resposta: 'O delay conta em milissegundos: 1000 ms é 1 segundo.' },
          { texto: '5 segundos', resposta: 'Seriam 5000 ms. Lembre: 1000 ms = 1 s.' },
        ],
      },
      { quem: 'aline-robotica', texto: 'Bora para a prática! Monte o LED no pino 13 e escreva o código para ele piscar.' },
      { tipo: 'desafio', id: 'pisca-led' },
      { quem: 'alejandra', texto: 'Você pode brincar com os números do delay: com delay(100) ele pisca rápido; com delay(2000), devagar.' },
      {
        tipo: 'quiz', quem: 'alejandra', pergunta: 'Se trocar os dois **delay(1000)** por **delay(250)**, o LED vai:',
        opcoes: [
          { texto: 'Piscar mais rápido', certa: true, resposta: 'Isso! Ele espera menos tempo aceso e apagado.' },
          { texto: 'Piscar mais devagar', resposta: 'Um delay menor é uma espera menor...' },
          { texto: 'Ficar apagado', resposta: 'Ele continua piscando, só muda a velocidade.' },
        ],
      },
      { quem: 'julia-robotica', ilustracao: 'buzzer', texto: 'Agora a prática 2: o **buzzer**! Ele transforma eletricidade em som. Igual ao LED, ele tem perna + e perna −.' },
      { quem: 'julia-robotica', texto: 'Com digitalWrite em HIGH ele apita, e em LOW fica em silêncio. Com **tone(8, 440)** ele toca uma nota (440 Hz é a nota lá), e **noTone(8)** faz parar.' },
      { quem: 'julia-robotica', ilustracao: null, texto: 'Sua vez: ligue o buzzer no pino 8 e faça ele apitar. Cuidado com os ouvidos de quem está do seu lado!' },
      { tipo: 'desafio', id: 'buzzer' },
      { quem: 'alejandra', texto: 'Parabéns, {nome}! Você já sabe montar um circuito e programar o Arduino para controlá-lo.' },
      { quem: 'alejandra', texto: 'Na próxima oficina vamos usar sensores, como o sensor ultrassônico, que mede distâncias. Até lá!' },
    ],
  },
];
