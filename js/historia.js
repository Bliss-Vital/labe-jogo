/*
 * historia.js — personagens e roteiro das oficinas. É aqui que se edita o conteúdo!
 *
 * Cada oficina tem uma lista de "passos", que acontecem em ordem:
 *
 *   { quem: 'bia', texto: 'Oi, {nome}!' }            fala (clique para avançar)
 *       quem: id de PERSONAGENS, 'voce' (a jogadora) ou 'narrador'
 *       no texto: {nome} vira o nome da jogadora, **negrito** destaca palavras
 *   ilustracao: 'agua'                               mostra uma ilustração (veja arte.js);
 *                                                    ela fica na tela até outra ou ilustracao: null
 *   cenario: 'corredor' | 'laboratorio'              troca o fundo
 *
 *   { tipo: 'quiz', quem, pergunta, opcoes: [{ texto, certa: true, resposta }] }
 *       as opções aparecem embaralhadas; "resposta" é o comentário depois do clique
 *       opções com icone: 'resistor' | 'led' | 'capacitor' | 'multimetro' | 'fonte' | 'protoboard'
 *   { tipo: 'resistor', quem, texto, alvo: 4700 }     minijogo de montar o resistor pelas cores
 *   { tipo: 'desafio', id: 'primeiro-led' }           abre a bancada (veja desafios.js)
 */

const PERSONAGENS = {
  helena: {
    nome: 'Profª Helena', cor: '#3d1f5f',
    aparencia: { pele: '#e0a682', cabelo: '#2b1b2e', estilo: 'cacheado', oculos: true, camisa: '#2d2536', cracha: true },
  },
  bia: {
    nome: 'Bia', cor: '#7b3fb0',
    aparencia: { pele: '#7b4a2d', cabelo: '#1d1210', estilo: 'black', camisa: '#7b3fb0', logo: true, brincos: true },
  },
  nina: {
    nome: 'Nina', cor: '#b0458a',
    aparencia: { pele: '#f2d0b8', cabelo: '#17121c', pontas: '#3b9be0', estilo: 'liso', oculos: true, camisa: '#dcaaf0', logo: true, corLogo: '#3d1f5f' },
  },
};

const OFICINAS = [
  {
    id: 'o1',
    titulo: 'Bem-vinda ao laboratório',
    resumo: 'Conheça a bancada, as monitoras e três palavras que vão te acompanhar: tensão, corrente e resistência.',
    passos: [
      { cenario: 'corredor', quem: 'narrador', texto: 'Sábado, 9 horas da manhã. Você chega ao bloco de laboratórios da universidade.' },
      { quem: 'narrador', texto: 'Na porta do laboratório 405-1 tem um cartaz roxo: **LABe — Mulheres no Laboratório de Eletrônica**.' },
      { quem: 'voce', texto: 'É aqui! Eu nunca mexi com circuitos... mas vim justamente para aprender.' },
      { cenario: 'laboratorio', quem: 'helena', texto: 'Bom dia! Seja muito bem-vinda ao LABe! Eu sou a Helena, professora que coordena o projeto.' },
      { quem: 'helena', texto: 'Aqui ninguém precisa saber nada antes. A ideia é colocar a mão na massa num ambiente acolhedor, tirar dúvidas e errar sem medo.' },
      { quem: 'helena', texto: 'Essas são a Bia e a Nina, monitoras da oficina. Elas vão te acompanhar na bancada.' },
      { quem: 'bia', texto: 'Oi, {nome}! Que bom que você veio! Senta aqui nessa bancada comigo.' },
      { quem: 'bia', ilustracao: 'componentes', texto: 'Na sua bancada tem tudo o que a gente vai usar. Dá uma olhada!' },
      { quem: 'bia', texto: 'A **fonte de alimentação** fornece energia para o circuito. A **protoboard** é a placa cheia de furinhos onde a gente monta tudo sem precisar soldar.' },
      { quem: 'bia', texto: 'Os **resistores** são os cilindrinhos listrados, os **LEDs** são as luzinhas, os **jumpers** são os fios, e o **multímetro** é o aparelho laranja que mede as grandezas elétricas.' },
      {
        tipo: 'quiz', quem: 'bia', ilustracao: null, pergunta: 'Rapidinho: qual destes é o **resistor**?',
        opcoes: [
          { icone: 'resistor', texto: 'Este', certa: true, resposta: 'Isso! O resistor tem faixas coloridas que dizem o valor dele.' },
          { icone: 'led', texto: 'Este', resposta: 'Esse é o LED, a luzinha! O resistor é o cilindrinho listrado.' },
          { icone: 'capacitor', texto: 'Este', resposta: 'Esse é um capacitor, ele guarda energia. O resistor é o listrado.' },
          { icone: 'multimetro', texto: 'Este', resposta: 'Esse é o multímetro, nosso aparelho de medir. Procura o cilindrinho listrado!' },
        ],
      },
      { quem: 'bia', texto: 'Antes de montar, três palavrinhas que vão aparecer o tempo todo: **tensão**, **corrente** e **resistência**. A Nina explica melhor que ninguém!' },
      { quem: 'nina', ilustracao: 'agua', texto: 'Eu gosto de pensar numa caixa d’água. A **tensão**, medida em volts (V), é como a pressão da água: é o que empurra as cargas elétricas.' },
      { quem: 'nina', texto: 'A **corrente**, em ampères (A), é a quantidade de carga passando por segundo, como a vazão de água no cano.' },
      { quem: 'nina', texto: 'E a **resistência**, em ohms (Ω), é o quanto o caminho dificulta a passagem, como um cano mais fino.' },
      {
        tipo: 'quiz', quem: 'nina', pergunta: 'Se a gente troca o resistor por um de valor **maior**, com a mesma tensão, o que acontece com a corrente?',
        opcoes: [
          { texto: 'Diminui', certa: true, resposta: 'Exato! Mais resistência, menos corrente, como um cano mais fino deixa passar menos água.' },
          { texto: 'Aumenta', resposta: 'Pensa no cano: se ele fica mais fino, passa mais ou menos água?' },
          { texto: 'Continua igual', resposta: 'A resistência muda a corrente sim! Pensa no cano ficando mais fino.' },
        ],
      },
      { quem: 'bia', ilustracao: 'circuito-fechado', texto: 'Último conceito de hoje: para a corrente circular, o circuito precisa estar **fechado**. Ela sai do positivo (+) da fonte, passa pelos componentes e volta para o negativo (−).' },
      { quem: 'bia', texto: 'Se tiver qualquer interrupção no caminho, o circuito está **aberto** e nada funciona. É assim que um interruptor apaga a luz!' },
      {
        tipo: 'quiz', quem: 'bia', pergunta: 'Para o LED acender, o caminho da corrente precisa ser:',
        opcoes: [
          { texto: 'Fechado, saindo do + e voltando ao −', certa: true, resposta: 'Isso aí! Sem caminho completo, nada de luz.' },
          { texto: 'Aberto, com uma parte desconectada', resposta: 'Com o circuito aberto a corrente não tem por onde passar...' },
          { texto: 'Ligado só no +', resposta: 'Só o + não basta: a corrente precisa voltar para o − da fonte.' },
        ],
      },
      { ilustracao: null, quem: 'helena', texto: 'Muito bem, {nome}! Você terminou a primeira oficina. Na próxima, vamos descobrir como ler o valor dos resistores.' },
    ],
  },

  {
    id: 'o2',
    titulo: 'O código de cores',
    resumo: 'Descubra o valor de um resistor só olhando as faixas coloridas, e conheça a Lei de Ohm.',
    passos: [
      { cenario: 'laboratorio', quem: 'nina', texto: 'Oi de novo, {nome}! Hoje a missão é descobrir a identidade de cada resistor.' },
      { quem: 'nina', ilustracao: 'resistor:marrom,preto,vermelho', texto: 'Os resistores são pequenos demais para escrever números neles. Por isso usam **faixas coloridas**: cada cor representa um número.' },
      { quem: 'nina', ilustracao: 'codigo-cores', texto: 'Essa é a tabela: preto 0, marrom 1, vermelho 2, laranja 3, amarelo 4, verde 5, azul 6, violeta 7, cinza 8 e branco 9.' },
      { quem: 'nina', texto: 'A 1ª faixa é o primeiro dígito, a 2ª é o segundo dígito e a 3ª é o **multiplicador**: quantos zeros a gente coloca depois.' },
      { quem: 'nina', ilustracao: 'resistor-explicado:marrom,preto,vermelho', texto: 'Por exemplo: marrom (1), preto (0) e vermelho (2 zeros) dá 1 0 00 = **1000 Ω**, que também se escreve 1 kΩ.' },
      { quem: 'nina', texto: 'A 4ª faixa, geralmente dourada, é a **tolerância**: o valor real pode variar 5% pra mais ou pra menos.' },
      { quem: 'bia', texto: 'Dica de quem já errou muito: a faixa da tolerância fica mais afastada das outras. Comece a ler sempre pelo outro lado!' },
      {
        tipo: 'quiz', quem: 'nina', ilustracao: 'resistor:vermelho,vermelho,marrom', pergunta: 'Sua vez! Qual o valor deste resistor?',
        opcoes: [
          { texto: '220 Ω', certa: true, resposta: 'Vermelho (2), vermelho (2), marrom (1 zero): 220 Ω. Esse é o resistor que mais vamos usar com LEDs!' },
          { texto: '22 Ω', resposta: 'Quase! A 3ª faixa é marrom: ela manda colocar **um** zero depois do 22.' },
          { texto: '2200 Ω', resposta: 'Marrom no multiplicador quer dizer 1 zero, não 2.' },
          { texto: '122 Ω', resposta: 'A 3ª faixa não é um dígito, é o multiplicador!' },
        ],
      },
      {
        tipo: 'quiz', quem: 'nina', ilustracao: 'resistor:laranja,laranja,marrom', pergunta: 'E este aqui?',
        opcoes: [
          { texto: '330 Ω', certa: true, resposta: 'Laranja (3), laranja (3), marrom (1 zero): 330 Ω. Arrasou!' },
          { texto: '33 Ω', resposta: 'Lembra do zero que o marrom pede no final!' },
          { texto: '3300 Ω', resposta: 'Marrom no multiplicador é só 1 zero.' },
          { texto: '331 Ω', resposta: 'A 3ª faixa é o multiplicador, não um dígito.' },
        ],
      },
      {
        tipo: 'quiz', quem: 'nina', ilustracao: 'resistor:marrom,preto,laranja', pergunta: 'Agora um mais difícil:',
        opcoes: [
          { texto: '10 kΩ', certa: true, resposta: 'Marrom (1), preto (0), laranja (3 zeros): 10 000 Ω = 10 kΩ!' },
          { texto: '1 kΩ', resposta: 'Laranja é 3, então são **três** zeros depois do 10.' },
          { texto: '103 Ω', resposta: 'A 3ª faixa é o multiplicador: laranja pede três zeros.' },
          { texto: '100 kΩ', resposta: 'Conta de novo: 10 seguido de três zeros.' },
        ],
      },
      { tipo: 'resistor', quem: 'bia', ilustracao: null, alvo: 4700, texto: 'Agora o contrário: monte um resistor de **4,7 kΩ** (4700 Ω) escolhendo as cores das faixas.', dica: 'Pensa: 47 seguido de quantos zeros?' },
      { ilustracao: null, quem: 'bia', texto: 'Na oficina de verdade a gente também confere com o multímetro. Teve gente que saiu dizendo: “descobri minha resistência!”' },
      { quem: 'helena', ilustracao: 'vri', texto: 'Agora, a lei mais famosa da eletrônica: a **Lei de Ohm**. Ela diz que **V = R × I**.' },
      { quem: 'helena', texto: 'Ou seja: a tensão sobre um resistor é a resistência multiplicada pela corrente. Sabendo duas, você descobre a terceira: I = V ÷ R e R = V ÷ I.' },
      { quem: 'helena', texto: 'Um truque: cubra com o dedo a letra que você quer descobrir no triângulo. O que sobra é a conta!' },
      {
        tipo: 'quiz', quem: 'helena', pergunta: 'Um resistor de **100 Ω** está ligado em **5 V**. Qual é a corrente?',
        opcoes: [
          { texto: '0,05 A (50 mA)', certa: true, resposta: 'I = V ÷ R = 5 ÷ 100 = 0,05 A, ou seja, 50 miliampères.' },
          { texto: '500 A', resposta: 'Essa seria V × R. Para a corrente, é V ÷ R!' },
          { texto: '20 A', resposta: 'Essa seria R ÷ V. Para a corrente, é V ÷ R.' },
          { texto: '0,5 A', resposta: 'Quase! Confere a conta: 5 ÷ 100.' },
        ],
      },
      {
        tipo: 'quiz', quem: 'helena', pergunta: 'Passa **10 mA** (0,01 A) por um resistor de **1 kΩ**. Qual a tensão sobre ele?',
        opcoes: [
          { texto: '10 V', certa: true, resposta: 'V = R × I = 1000 × 0,01 = 10 V.' },
          { texto: '1 V', resposta: 'Lembra que 1 kΩ são 1000 Ω: 1000 × 0,01.' },
          { texto: '0,1 V', resposta: 'Para a tensão, é R × I: 1000 × 0,01.' },
          { texto: '100 V', resposta: 'Confere: 1000 × 0,01 dá quanto?' },
        ],
      },
      { ilustracao: null, quem: 'nina', texto: 'Mandou muito bem, {nome}! Na próxima oficina a gente finalmente vai para a bancada montar o primeiro circuito.' },
    ],
  },

  {
    id: 'o3',
    titulo: 'Protoboard e o primeiro LED',
    resumo: 'Entenda como os furos da protoboard se conectam e acenda seu primeiro LED na bancada.',
    passos: [
      { cenario: 'laboratorio', quem: 'bia', texto: 'Chegou o dia, {nome}! Hoje você monta seu primeiro circuito.' },
      { quem: 'bia', ilustracao: 'protoboard', texto: 'Essa é a protoboard. Por dentro, ela tem tirinhas de metal que ligam alguns furos entre si.' },
      { quem: 'bia', texto: 'No meio, cada **coluna de 5 furos** (de a até e, e de f até j) é ligada por dentro. O canal do meio separa a parte de cima da parte de baixo.' },
      { quem: 'bia', texto: 'Nas bordas ficam as **trilhas de alimentação**: a vermelha (+) e a azul (−). Elas são ligadas na horizontal. A fonte da bancada já está ligada nelas.' },
      { quem: 'bia', texto: 'Na bancada, quando você passar o mouse (ou tocar) num furo, eu mostro quais furos estão conectados com ele. Vamos testar encaixando uma peça?' },
      { tipo: 'desafio', id: 'primeira-peca' },
      { quem: 'bia', ilustracao: null, texto: 'Viu? Se as duas pernas ficam na mesma coluna, o componente fica “em curto” e a corrente passa por dentro da placa, não por ele.' },
      { quem: 'nina', ilustracao: 'led', texto: 'Agora conheça o LED. LED quer dizer Diodo Emissor de Luz, e ele tem **polaridade**: só funciona num sentido.' },
      { quem: 'nina', texto: 'A perna **mais longa** é o ânodo (+) e vai para o lado positivo. A mais curta é o cátodo (−). O lado do cátodo também tem um chanfro, uma parte achatada.' },
      { quem: 'nina', texto: 'E muito importante: o LED **nunca** pode ser ligado direto na fonte. Ele precisa de um **resistor em série** para limitar a corrente. Senão... queima!' },
      {
        tipo: 'quiz', quem: 'nina', pergunta: 'Por que colocamos um resistor junto com o LED?',
        opcoes: [
          { texto: 'Para limitar a corrente e não queimar o LED', certa: true, resposta: 'Isso! O resistor controla quanta corrente passa.' },
          { texto: 'Para o LED brilhar mais', resposta: 'Na verdade o resistor diminui a corrente. Ele protege o LED.' },
          { texto: 'Porque o LED não tem polaridade', resposta: 'O LED tem polaridade sim (perna longa no +). O resistor é para outra coisa.' },
        ],
      },
      { quem: 'bia', ilustracao: null, texto: 'Sua vez! Monte um circuito com um resistor e um LED, ligue a fonte e faça ele acender. Se der errado, tudo bem: na bancada a gente aprende errando!' },
      { tipo: 'desafio', id: 'primeiro-led' },
      { quem: 'helena', texto: 'Parabéns, {nome}! Repare: com resistores maiores o LED brilha menos, porque passa menos corrente. É a Lei de Ohm acontecendo na sua frente.' },
      {
        tipo: 'quiz', quem: 'helena', pergunta: 'Se você trocar o resistor de 220 Ω por um de **10 kΩ**, o LED vai:',
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
      { cenario: 'laboratorio', quem: 'nina', ilustracao: 'serie', texto: 'Existem duas formas principais de ligar vários componentes: em **série** e em **paralelo**.' },
      { quem: 'nina', texto: 'Em **série**, os componentes ficam um depois do outro, num caminho único. A mesma corrente passa por todos, e a tensão da fonte se divide entre eles.' },
      { quem: 'nina', ilustracao: 'paralelo', texto: 'Em **paralelo**, cada componente tem seu próprio caminho entre os mesmos dois pontos. A tensão é a mesma para todos e a corrente se divide.' },
      { quem: 'bia', texto: 'As tomadas e lâmpadas da sua casa são ligadas em paralelo. Já naqueles pisca-piscas antigos de Natal, ligados em série, uma lampadinha queimada apagava todas!' },
      {
        tipo: 'quiz', quem: 'bia', pergunta: 'Num circuito em **série**, se um LED queimar e abrir o circuito, o que acontece com os outros?',
        opcoes: [
          { texto: 'Apagam também', certa: true, resposta: 'Isso! Com o caminho único interrompido, a corrente para em todo o circuito.' },
          { texto: 'Continuam acesos', resposta: 'Isso aconteceria em paralelo! Em série só existe um caminho.' },
          { texto: 'Brilham mais forte', resposta: 'Sem caminho, não passa corrente nenhuma...' },
        ],
      },
      { quem: 'bia', ilustracao: null, texto: 'Desafio: acenda **dois LEDs em série** com um resistor.' },
      { tipo: 'desafio', id: 'serie' },
      { quem: 'nina', texto: 'Viu que eles brilham menos? Os dois LEDs “usam” uns 4 V juntos, sobra só 1 V no resistor, e a corrente diminui.' },
      { quem: 'bia', texto: 'Agora o contrário: acenda **dois LEDs em paralelo**. Dica: um resistor para cada LED!' },
      { tipo: 'desafio', id: 'paralelo' },
      {
        tipo: 'quiz', quem: 'nina', pergunta: 'Na ligação em **paralelo**, a corrente que sai da fonte é:',
        opcoes: [
          { texto: 'A soma das correntes de cada LED', certa: true, resposta: 'Exato! Cada caminho puxa sua corrente, e a fonte entrega tudo junto. Dá para ver no visor da fonte.' },
          { texto: 'A mesma de um LED só', resposta: 'Cada caminho leva sua parte. A fonte precisa entregar todas elas!' },
          { texto: 'Zero', resposta: 'Se os LEDs acenderam, tem corrente saindo da fonte!' },
        ],
      },
      { quem: 'helena', texto: 'Ótimo trabalho, {nome}! Na última oficina vamos usar o multímetro para medir tudo isso.' },
    ],
  },

  {
    id: 'o5',
    titulo: 'Medindo com o multímetro',
    resumo: 'Meça tensões de verdade no seu circuito e use a Lei de Ohm para descobrir a corrente.',
    passos: [
      { cenario: 'laboratorio', quem: 'nina', ilustracao: 'multimetro', texto: 'Hoje é dia do meu aparelho favorito: o **multímetro**! Ele mede tensão, corrente e resistência.' },
      { quem: 'nina', texto: 'Para medir **tensão**, a gente gira o seletor para V⎓ (tensão contínua), coloca a ponta **preta** no COM e a **vermelha** no VΩ.' },
      { quem: 'nina', texto: 'O mais importante: tensão se mede **em paralelo**, encostando as pontas nos dois lados do componente. A vermelha no lado mais positivo, a preta no mais negativo.' },
      { quem: 'bia', texto: 'Se você inverter as pontas, não estraga nada: o visor só mostra o valor com um sinal de menos na frente.' },
      {
        tipo: 'quiz', quem: 'nina', pergunta: 'Para medir a tensão no LED, as pontas do multímetro devem ficar:',
        opcoes: [
          { texto: 'Uma de cada lado do LED (em paralelo)', certa: true, resposta: 'Isso! O multímetro “compara” os dois lados do LED.' },
          { texto: 'As duas no mesmo furo', resposta: 'No mesmo ponto não tem diferença nenhuma para medir: dá 0 V.' },
          { texto: 'Longe do circuito', resposta: 'As pontas precisam encostar no circuito para medir!' },
        ],
      },
      { quem: 'nina', ilustracao: null, texto: 'Bora medir! Monte o circuito do LED e meça a tensão sobre ele.' },
      { tipo: 'desafio', id: 'medir-led' },
      { quem: 'nina', texto: 'Você mediu **{tensaoLed} V** no LED. Agora, sem desmontar nada, vamos medir o resistor.' },
      { tipo: 'desafio', id: 'medir-resistor' },
      { quem: 'helena', ilustracao: 'vri', texto: 'Você mediu **{medidaV} V** num resistor de **{medidaR}**. Pela Lei de Ohm: I = V ÷ R, que dá cerca de **{medidaI} mA**.' },
      { quem: 'helena', texto: 'E repara: essa é praticamente a mesma corrente que aparece no visor da fonte. A teoria e a prática batendo!' },
      {
        tipo: 'quiz', quem: 'helena', pergunta: 'O LED ficou com uns 2 V e a fonte tem 5 V. Para onde foi o resto da tensão?',
        opcoes: [
          { texto: 'Ficou no resistor', certa: true, resposta: 'Isso! Em série, a soma das tensões é igual à tensão da fonte: LED + resistor = 5 V.' },
          { texto: 'Se perdeu no ar', resposta: 'A tensão não some! Mede o resistor e soma com a do LED.' },
          { texto: 'Voltou para a fonte', resposta: 'Ela fica nos componentes do caminho. Qual outro componente está no circuito?' },
        ],
      },
      { ilustracao: null, quem: 'bia', texto: '{nome}, você montou, mediu e calculou. Isso é ser engenheira na prática!' },
      { quem: 'helena', texto: 'Você completou todas as oficinas do LABe. Obrigada por vir. E lembre: o laboratório também é lugar de mulher!' },
    ],
  },
];
