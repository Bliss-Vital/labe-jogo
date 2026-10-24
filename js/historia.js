/*
 * historia.js — personagens e roteiro das oficinas. É aqui que se edita o conteúdo!
 *
 * Cada oficina tem uma lista de "passos", que acontecem em ordem:
 *
 *   { quem: 'suzanne', texto: 'Oi, {nome}!' }        fala (clique para avançar)
 *       quem: id de PERSONAGENS, 'voce' (a jogadora) ou 'narrador'
 *       quem fala aparece na cena; na narração ela continua lá
 *   sozinha: true                                    tira a monitora da cena (ex.: no corredor)
 *   grupo: ['aline-robotica', 'julia-robotica']      várias da equipe juntas na frente da sala;
 *                                                    saem com grupo: null ou quando outra pessoa fala
 *       no texto: {nome} vira o nome da jogadora, **negrito** destaca palavras
 *   ilustracao: 'agua'                               mostra uma ilustração (veja arte.js);
 *                                                    ela fica na tela até outra ou ilustracao: null
 *   cenario: 'corredor' | 'laboratorio' | 'computadores'   troca o fundo
 *
 *   { tipo: 'quiz', quem, pergunta, opcoes: [{ texto, certa: true, resposta }] }
 *       as opções aparecem embaralhadas; "resposta" é o comentário depois do clique
 *       opções com icone: 'resistor' | 'led' | 'capacitor' | 'multimetro' | 'fonte' | 'protoboard' | 'arduino' | 'buzzer' | 'motor'
 *   { tipo: 'resistor', quem, texto, alvo: 4700 }     minijogo de montar o resistor pelas cores
 *   { tipo: 'pwm', quem, texto, faixa: [40, 60], segundos: 4, sucesso }
 *                                                    minijogo do PWM: segurar = motor ligado; {cicloPWM} = % ligado
 *   { tipo: 'osciloscopio', quem, texto, sinal, inicio, meta, controles, zero, sucesso }
 *                                                    minijogo dos botões do osciloscópio (veja osciloscopio.js);
 *                                                    meta: 'volts' | 'tempo' | 'trigger' | 'tudo'
 *   { tipo: 'desafio', id: 'primeiro-led' }           abre a bancada (veja desafios.js)
 *
 * Uma oficina com chefao: 'Nome' mostra a barra de vida do chefão no alto da cena:
 * cada pergunta e cada rodada do osciloscópio acertada tira um pedaço dela.
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
  leticia: { nome: 'Letícia', cor: '#c2417f', folha: 'personagens', sprite: 7 },
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
      { quem: 'alejandra', texto: 'Hoje quem te acompanha na bancada são a Letícia e a Aline, monitoras, e a Marta, técnica do laboratório. Nas próximas oficinas você vai conhecer o resto da equipe!' },
      { quem: 'leticia', texto: 'Oi, {nome}! Eu sou a Letícia. Que bom que você veio! Senta aqui nessa bancada comigo.' },
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
      { quem: 'leticia', texto: 'Antes de montar, três palavrinhas que vão aparecer o tempo todo: **tensão**, **corrente** e **resistência**. A Aline explica melhor que ninguém!' },
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
      { quem: 'leticia', ilustracao: 'circuito-fechado', texto: 'Último conceito de hoje: para a corrente circular, o circuito precisa estar **fechado**. Ela sai do positivo (+) da fonte, passa pelos componentes e volta para o negativo (−).' },
      { quem: 'leticia', texto: 'Se tiver qualquer interrupção no caminho, o circuito está **aberto** e nada funciona. É assim que um interruptor apaga a luz!' },
      {
        tipo: 'quiz', quem: 'leticia', pergunta: 'Para o LED acender, o caminho da corrente precisa ser:',
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
      { cenario: 'laboratorio', quem: 'suzanne', texto: 'Oi, {nome}! Eu sou a Suzanne, monitora do LABe. Hoje a missão é descobrir a identidade de cada resistor.' },
      { quem: 'suzanne', ilustracao: 'resistor:marrom,preto,vermelho', texto: 'Os resistores são pequenos demais para escrever números neles. Por isso usam **faixas coloridas**: cada cor representa um número.' },
      { quem: 'suzanne', ilustracao: 'codigo-cores', texto: 'Essa é a tabela: preto 0, marrom 1, vermelho 2, laranja 3, amarelo 4, verde 5, azul 6, violeta 7, cinza 8 e branco 9.' },
      { quem: 'suzanne', texto: 'A 1ª faixa é o primeiro dígito, a 2ª é o segundo dígito e a 3ª é o **multiplicador**: quantos zeros a gente coloca depois.' },
      { quem: 'suzanne', ilustracao: 'resistor-explicado:marrom,preto,vermelho', texto: 'Por exemplo: marrom (1), preto (0) e vermelho (2 zeros) dá 1 0 00 = **1000 Ω**, que também se escreve 1 kΩ.' },
      { quem: 'suzanne', texto: 'A 4ª faixa, geralmente dourada, é a **tolerância**: o valor real pode variar 5% pra mais ou pra menos.' },
      { quem: 'livia', texto: 'Oi! Eu sou a Lívia, técnica do laboratório. Dica de quem já leu muito resistor: a faixa da tolerância fica mais afastada das outras. Comece a ler sempre pelo outro lado!' },
      {
        tipo: 'quiz', quem: 'suzanne', ilustracao: 'resistor:vermelho,vermelho,marrom', pergunta: 'Sua vez! Qual o valor deste resistor?',
        opcoes: [
          { texto: '220 Ω', certa: true, resposta: 'Vermelho (2), vermelho (2), marrom (1 zero): 220 Ω. Esse é o resistor que mais vamos usar com LEDs!' },
          { texto: '22 Ω', resposta: 'Quase! A 3ª faixa é marrom: ela manda colocar **um** zero depois do 22.' },
          { texto: '2200 Ω', resposta: 'Marrom no multiplicador quer dizer 1 zero, não 2.' },
          { texto: '122 Ω', resposta: 'A 3ª faixa não é um dígito, é o multiplicador!' },
        ],
      },
      {
        tipo: 'quiz', quem: 'suzanne', ilustracao: 'resistor:vermelho,preto,laranja', pergunta: 'E este aqui?',
        opcoes: [
          { texto: '20 000 Ω', certa: true, resposta: 'Vermelho (2), preto (0), laranja (3 zeros): 20 000 Ω = 20 kΩ. Arrasou!' },
          { texto: '2000 Ω', resposta: 'Laranja é 3, então são **três** zeros depois do 20.' },
          { texto: '200 Ω', resposta: 'Lembra dos zeros que o laranja pede no final: são três!' },
          { texto: '203 Ω', resposta: 'A 3ª faixa é o multiplicador, não um dígito.' },
        ],
      },
      {
        tipo: 'quiz', quem: 'suzanne', ilustracao: 'resistor:marrom,preto,laranja', pergunta: 'Agora um mais difícil:',
        opcoes: [
          { texto: '10 kΩ', certa: true, resposta: 'Marrom (1), preto (0), laranja (3 zeros): 10 000 Ω = 10 kΩ!' },
          { texto: '1 kΩ', resposta: 'Laranja é 3, então são **três** zeros depois do 10.' },
          { texto: '103 Ω', resposta: 'A 3ª faixa é o multiplicador: laranja pede três zeros.' },
          { texto: '100 kΩ', resposta: 'Conta de novo: 10 seguido de três zeros.' },
        ],
      },
      { tipo: 'resistor', quem: 'suzanne', ilustracao: null, alvo: 4700, texto: 'Agora o contrário: monte um resistor de **4,7 kΩ** (4700 Ω) escolhendo as cores das faixas.', dica: 'Pensa: 47 seguido de quantos zeros?' },
      { ilustracao: null, quem: 'livia', texto: 'Na oficina de verdade a gente também confere com o multímetro. Teve gente que saiu dizendo: “descobri minha resistência!”' },
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
      { ilustracao: null, quem: 'suzanne', texto: 'Mandou muito bem, {nome}! Na próxima oficina a gente finalmente vai para a bancada montar o primeiro circuito.' },
    ],
  },

  {
    id: 'o3',
    titulo: 'Protoboard e o primeiro LED',
    resumo: 'Entenda como os furos da protoboard se conectam e acenda seu primeiro LED na bancada.',
    passos: [
      { cenario: 'laboratorio', quem: 'marta', texto: 'Chegou o dia, {nome}! Hoje você monta seu primeiro circuito.' },
      { quem: 'marta', ilustracao: 'protoboard', texto: 'Essa é a protoboard. Por dentro, ela tem tirinhas de metal que ligam alguns furos entre si.' },
      { quem: 'marta', texto: 'No meio, cada **coluna de 5 furos** (de a até e, e de f até j) é ligada por dentro. O canal do meio separa a parte de cima da parte de baixo.' },
      { quem: 'marta', texto: 'Nas bordas ficam as **trilhas de alimentação**: a vermelha (+) e a azul (−). Elas são ligadas na horizontal. A fonte da bancada já está ligada nelas.' },
      { quem: 'marta', texto: 'Na bancada, quando você passar o mouse (ou tocar) num furo, eu mostro quais furos estão conectados com ele. Vamos testar encaixando uma peça?' },
      { tipo: 'desafio', id: 'primeira-peca' },
      { quem: 'marta', ilustracao: null, texto: 'Viu? Se as duas pernas ficam na mesma coluna, o componente fica “em curto” e a corrente passa por dentro da placa, não por ele.' },
      { quem: 'aline', texto: 'Oi de novo, {nome}! Agora eu vou te apresentar o LED!' },
      { quem: 'aline', ilustracao: 'led', texto: 'LED quer dizer Diodo Emissor de Luz, e ele tem **polaridade**: só funciona num sentido.' },
      { quem: 'aline', texto: 'A perna **mais longa** é o ânodo (+) e vai para o lado positivo. A mais curta é o cátodo (−). O lado do cátodo também tem um chanfro, uma parte achatada.' },
      { quem: 'aline', texto: 'E muito importante: o LED **nunca** pode ser ligado direto na fonte. Ele precisa de um **resistor em série** para limitar a corrente. Senão... queima!' },
      {
        tipo: 'quiz', quem: 'aline', pergunta: 'Por que colocamos um resistor junto com o LED?',
        opcoes: [
          { texto: 'Para limitar a corrente e não queimar o LED', certa: true, resposta: 'Isso! O resistor controla quanta corrente passa.' },
          { texto: 'Para o LED brilhar mais', resposta: 'Na verdade o resistor diminui a corrente. Ele protege o LED.' },
          { texto: 'Porque o LED não tem polaridade', resposta: 'O LED tem polaridade sim (perna longa no +). O resistor é para outra coisa.' },
        ],
      },
      { quem: 'marta', ilustracao: null, texto: 'Sua vez! Monte um circuito com um resistor e um LED, ligue a fonte e faça ele acender. Se der errado, tudo bem: na bancada a gente aprende errando!' },
      { tipo: 'desafio', id: 'primeiro-led' },
      { quem: 'aline', texto: 'Parabéns, {nome}! Repare: com resistores maiores o LED brilha menos, porque passa menos corrente. É a Lei de Ohm acontecendo na sua frente.' },
      {
        tipo: 'quiz', quem: 'aline', pergunta: 'Se você trocar o resistor de 220 Ω por um de **10 kΩ**, o LED vai:',
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
      { cenario: 'laboratorio', quem: 'leticia', ilustracao: 'serie', texto: 'Oi de novo, {nome}! Existem duas formas principais de ligar vários componentes: em **série** e em **paralelo**.' },
      { quem: 'leticia', texto: 'Em **série**, os componentes ficam um depois do outro, num caminho único. A mesma corrente passa por todos, e a tensão da fonte se divide entre eles.' },
      { quem: 'leticia', ilustracao: 'paralelo', texto: 'Em **paralelo**, cada componente tem seu próprio caminho entre os mesmos dois pontos. A tensão é a mesma para todos e a corrente se divide.' },
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
      { quem: 'leticia', texto: 'Viu que eles brilham menos? Os dois LEDs “usam” uns 4 V juntos, sobra só 1 V no resistor, e a corrente diminui.' },
      { quem: 'suzanne', texto: 'Agora o contrário: acenda **dois LEDs em paralelo**. Dica: um resistor para cada LED!' },
      { tipo: 'desafio', id: 'paralelo' },
      {
        tipo: 'quiz', quem: 'leticia', pergunta: 'Na ligação em **paralelo**, a corrente que sai da fonte é:',
        opcoes: [
          { texto: 'A soma das correntes de cada LED', certa: true, resposta: 'Exato! Cada caminho puxa sua corrente, e a fonte entrega tudo junto. Dá para ver no visor da fonte.' },
          { texto: 'A mesma de um LED só', resposta: 'Cada caminho leva sua parte. A fonte precisa entregar todas elas!' },
          { texto: 'Zero', resposta: 'Se os LEDs acenderam, tem corrente saindo da fonte!' },
        ],
      },
      { quem: 'leticia', texto: 'Ótimo trabalho, {nome}! Na próxima oficina vamos usar o multímetro para medir tudo isso.' },
    ],
  },

  {
    id: 'o5',
    titulo: 'Medindo com o multímetro',
    resumo: 'Meça tensões de verdade no seu circuito e use a Lei de Ohm para descobrir a corrente.',
    passos: [
      { cenario: 'laboratorio', quem: 'livia', texto: 'Oi de novo, {nome}! Lembra de mim, a Lívia? Hoje é dia do meu aparelho favorito!' },
      { quem: 'livia', ilustracao: 'multimetro', texto: 'Esse é o **multímetro**! Ele mede tensão, corrente e resistência.' },
      { quem: 'livia', texto: 'Para medir **tensão**, a gente gira o seletor para V⎓ (tensão contínua), coloca a ponta **preta** no COM e a **vermelha** no VΩ.' },
      { quem: 'livia', texto: 'O mais importante: tensão se mede **em paralelo**, encostando as pontas nos dois lados do componente. A vermelha no lado mais positivo, a preta no mais negativo.' },
      { quem: 'aline', texto: 'Se você inverter as pontas, não estraga nada: o visor só mostra o valor com um sinal de menos na frente.' },
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
      { ilustracao: null, quem: 'aline', texto: '{nome}, você montou, mediu e calculou. Isso é ser engenheira na prática!' },
      { quem: 'alejandra', texto: 'Na próxima oficina o multímetro vai medir **resistência**, e você vai aprender um truque que os engenheiros usam o tempo todo: os **circuitos equivalentes**.' },
    ],
  },

  {
    id: 'eq1',
    titulo: 'Circuitos equivalentes',
    resumo: 'Meça resistência com o multímetro, troque vários resistores por um só e descubra o equivalente de Thévenin.',
    passos: [
      { cenario: 'laboratorio', quem: 'alejandra', texto: 'Oi, {nome}! Você já liga componentes em série e em paralelo e mede tudo com o multímetro. Hoje vamos aprender a **simplificar** circuitos.' },
      { quem: 'alejandra', texto: 'É um truque que aparece logo no começo de **A Arte da Eletrônica**, um livro clássico que muita engenheira tem na estante. E hoje quem conduz a aula é a Julia, monitora do LABe!' },
      { quem: 'julia', texto: 'Oi, {nome}! Eu sou a Julia. Vou te contar um segredo: um monte de resistores juntos pode ser trocado por **um resistor só**, sem o resto do circuito perceber a diferença.' },
      { quem: 'julia', ilustracao: 'caixa-preta', texto: 'Imagina uma caixa fechada com dois fios para fora, A e B. Se tudo o que você mede entre A e B é igual ao de um resistor só, para o resto do circuito a caixa **é** esse resistor.' },
      { quem: 'julia', texto: 'Esse resistor único se chama **resistor equivalente**, e o circuito simplificado é um **circuito equivalente**.' },
      { quem: 'livia', ilustracao: 'ohmimetro', texto: 'Oi, {nome}! Para descobrir o que tem dentro da caixa, a gente usa outra função do multímetro: o **ohmímetro**. É só girar o seletor para **Ω**.' },
      { quem: 'livia', texto: 'Ele faz passar uma correntinha usando a bateria dele mesmo e calcula a resistência. Por isso a regra de ouro: resistência se mede com o circuito **desligado**!' },
      { quem: 'livia', texto: 'E se não existir caminho entre as pontas, o visor mostra **OL**: é o multímetro avisando que a resistência é grande demais para medir.' },
      {
        tipo: 'quiz', quem: 'livia', pergunta: 'Antes de medir a resistência de um circuito com o ohmímetro, você deve:',
        opcoes: [
          { texto: 'Desligar a fonte', certa: true, resposta: 'Isso! O ohmímetro usa a própria bateria. Com a fonte ligada, a leitura não vale e ainda pode estragar o aparelho.' },
          { texto: 'Ligar a fonte para ter corrente', resposta: 'O ohmímetro já manda a corrente dele. A fonte ligada atrapalha a medida!' },
          { texto: 'Deixar o seletor em V⎓', resposta: 'V⎓ mede tensão. Para resistência, o seletor vai no **Ω**.' },
        ],
      },
      { quem: 'julia', ilustracao: 'serie-resistores', texto: 'Começando pelo mais fácil: em **série**, a corrente atravessa um resistor e depois o outro. As dificuldades se somam: **R = R1 + R2**.' },
      {
        tipo: 'quiz', quem: 'julia', pergunta: 'Qual é a resistência equivalente de **220 Ω e 330 Ω em série**?',
        opcoes: [
          { texto: '550 Ω', certa: true, resposta: '220 + 330 = 550 Ω. Em série é só somar!' },
          { texto: '132 Ω', resposta: 'Esse seria o resultado em **paralelo**. Em série, as resistências se somam.' },
          { texto: '110 Ω', resposta: 'Em série a resistência só aumenta: some as duas.' },
          { texto: '330 Ω', resposta: 'Em série a corrente passa pelos dois, então os dois contam: 220 + 330.' },
        ],
      },
      { quem: 'julia', ilustracao: null, texto: 'Agora na bancada! A gaveta não tem um resistor de 3,2 kΩ... mas dá para montar um com dois resistores em série.' },
      { tipo: 'desafio', id: 'equivalente-serie' },
      { quem: 'julia', ilustracao: 'paralelo-resistores', texto: 'Em **paralelo** é o contrário: a corrente ganha mais de um caminho e fica **mais fácil** passar. A resistência equivalente fica **menor que a menor** delas.' },
      { quem: 'julia', texto: 'Para dois resistores, a conta é o **produto dividido pela soma**: R = (R1 × R2) ÷ (R1 + R2). E um atalho: dois resistores **iguais** em paralelo valem a **metade** de um.' },
      {
        tipo: 'quiz', quem: 'julia', pergunta: 'Dois resistores de **1 kΩ em paralelo** valem:',
        opcoes: [
          { texto: '500 Ω', certa: true, resposta: 'Isso! (1000 × 1000) ÷ (1000 + 1000) = 500 Ω. Dois iguais: metade.' },
          { texto: '2 kΩ', resposta: 'Essa seria em **série**. Em paralelo a resistência diminui.' },
          { texto: '1 kΩ', resposta: 'Com dois caminhos fica mais fácil passar, então a resistência diminui.' },
        ],
      },
      { quem: 'julia', ilustracao: null, texto: 'Desafio: monte **500 Ω** usando dois resistores em paralelo.' },
      { tipo: 'desafio', id: 'equivalente-paralelo' },
      { quem: 'julia', texto: 'Um atalho que engenheiras usam o tempo todo: um resistor **grande** em paralelo com um **pequeno** vale quase o pequeno. A corrente vai quase toda pelo caminho mais fácil!' },
      {
        tipo: 'quiz', quem: 'julia', pergunta: 'Quanto vale, mais ou menos, **10 kΩ em paralelo com 100 Ω**?',
        opcoes: [
          { texto: 'Um pouquinho menos de 100 Ω', certa: true, resposta: 'Isso! A conta dá uns 99 Ω: o resistor grande quase não faz diferença.' },
          { texto: 'Uns 10 kΩ', resposta: 'Em paralelo, o resultado é sempre **menor** que o menor dos dois.' },
          { texto: 'Uns 5 kΩ', resposta: 'A metade só vale para dois resistores **iguais**. Aqui quem manda é o pequeno.' },
        ],
      },
      { quem: 'alejandra', ilustracao: 'divisor', texto: 'Agora, um circuito famoso: dois resistores em série ligados na fonte formam um **divisor de tensão**.' },
      { quem: 'alejandra', texto: 'A tensão da fonte se divide na proporção das resistências. No ponto do meio: **Vsaída = Vfonte × R2 ÷ (R1 + R2)**, onde R2 é o resistor de baixo, que vai para o −.' },
      {
        tipo: 'quiz', quem: 'alejandra', pergunta: 'Um divisor tem **R1 = 1 kΩ** em cima e **R2 = 4 kΩ** embaixo, ligado em **5 V**. Quanto dá no ponto do meio?',
        opcoes: [
          { texto: '4 V', certa: true, resposta: '5 × 4 ÷ (1 + 4) = 4 V. O resistor maior fica com a maior parte da tensão.' },
          { texto: '1 V', resposta: 'Esse 1 V fica no resistor de **cima**. No meio, medindo até o −, sobra a tensão do R2.' },
          { texto: '2,5 V', resposta: 'Metade da fonte só quando os dois resistores são **iguais**.' },
        ],
      },
      { quem: 'julia', ilustracao: null, texto: 'Sua vez: monte um divisor que entregue **metade da fonte**, 2,5 V, e meça. Ah, e lembre de girar o seletor de volta para **V⎓**!' },
      { tipo: 'desafio', id: 'divisor' },
      { quem: 'julia', ilustracao: 'thevenin', texto: 'Agora o truque mais poderoso de hoje: o **equivalente de Thévenin**. Qualquer circuito de fontes e resistores, visto por dois pontos, se comporta como **uma fonte só em série com um resistor só**.' },
      { quem: 'julia', texto: 'A **fonte de Thévenin** é a tensão entre os dois pontos sem nada ligado neles: no seu divisor, os **{divisorV} V** que você mediu.' },
      { quem: 'julia', texto: 'O **resistor de Thévenin** é a resistência vista pelos dois pontos quando a gente troca a fonte por um fio (só na conta!). Aí os dois resistores do divisor ficam em **paralelo**: no seu, dá **{divisorRth}**.' },
      { quem: 'alejandra', ilustracao: 'carga', texto: 'E isso explica um mistério: quando a gente liga uma **carga** na saída do divisor, a tensão cai. A carga e o resistor de Thévenin formam um novo divisor!' },
      {
        tipo: 'quiz', quem: 'alejandra', pergunta: 'Um circuito tem equivalente de Thévenin de **2,5 V** e **500 Ω**. Ligando uma carga de **500 Ω**, quanto fica na carga?',
        opcoes: [
          { texto: '1,25 V', certa: true, resposta: 'Isso! Carga e resistor de Thévenin iguais: a tensão se divide no meio.' },
          { texto: '2,5 V', resposta: 'Essa é a tensão sem carga. Com a carga, parte da tensão fica no resistor de Thévenin.' },
          { texto: '5 V', resposta: 'A fonte de Thévenin tem só 2,5 V, e ainda divide com o resistor de Thévenin.' },
        ],
      },
      { quem: 'julia', ilustracao: null, texto: 'Bora testar na bancada? Sem desmontar o seu divisor, ligue uma carga na saída sem deixar a tensão cair muito.' },
      { tipo: 'desafio', id: 'carga' },
      { quem: 'julia', texto: 'A regra prática dos engenheiros: a carga deve ser pelo menos **10 vezes maior** que o resistor de Thévenin. Assim a tensão cai menos de 10%.' },
      {
        tipo: 'quiz', quem: 'julia', pergunta: 'O motor da próxima oficina se comporta como uns **25 Ω**. Dá para alimentar ele com o seu divisor de tensão?',
        opcoes: [
          { texto: 'Não: a tensão no motor despencaria', certa: true, resposta: 'Isso! 25 Ω é bem menor que o resistor de Thévenin do divisor: quase toda a tensão ficaria nele, e o motor nem sairia do lugar.' },
          { texto: 'Sim, ele recebe os 2,5 V certinho', resposta: 'Os 2,5 V são sem carga! Com uma carga tão pequena, a tensão cai muito. Lembre da regra das 10 vezes.' },
          { texto: 'Sim, se o motor girar devagar', resposta: 'O problema é a resistência baixa do motor: ela derruba a tensão do divisor, e ele nem sai do lugar.' },
        ],
      },
      { quem: 'julia', texto: 'Arrasou, {nome}! Agora você sabe trocar um pedaço do circuito por um equivalente mais simples: em série, em paralelo e até com a fonte junto.' },
      { quem: 'alejandra', texto: 'Você completou as oficinas de eletrônica básica do LABe! Agora você está pronta para colocar as coisas em movimento: a próxima oficina é de **motores elétricos**. E lembre: o laboratório também é lugar de mulher!' },
    ],
  },

  {
    id: 'm1',
    titulo: 'Motores elétricos',
    resumo: 'Descubra como o motor transforma eletricidade em movimento, inverta o sentido do giro e controle a velocidade.',
    passos: [
      { cenario: 'laboratorio', quem: 'alejandra', texto: 'Oi, {nome}! Nessa aula vamos aprender sobre **motores elétricos**. Mas antes, as meninas vão falar um pouco sobre o grupo de robótica!' },
      { quem: 'julia-robotica', grupo: ['aline-robotica', 'leticia-robotica', 'julia-robotica'], texto: 'Além do projeto LABe, fazemos parte da equipe de robótica **Project Neon**, e hoje vamos aprender mais sobre motores elétricos, alguns que usamos também em nossos robôs! Sigam a nossa equipe no Instagram: **@projectneon**' },
      { quem: 'aline-robotica', texto: 'Até agora a eletricidade acendeu luzes. Hoje ela vai fazer as coisas **se mexerem**!' },
      { quem: 'marta', ilustracao: 'motor', texto: 'Separei um **motor de corrente contínua** para cada bancada. É o mesmo tipo que tem em carrinhos de brinquedo, ventiladores e robôs.' },
      { quem: 'marta', texto: 'O motor transforma **energia elétrica** em **movimento**: quando passa corrente por ele, o **eixo** gira, e a hélice gira junto.' },
      { quem: 'marta', ilustracao: 'motor-dentro', texto: 'Por dentro ele tem **ímãs** e uma **bobina**, que é um fio de cobre enrolado muitas vezes. Quando passa corrente, a bobina vira um **eletroímã**.' },
      { quem: 'marta', texto: 'Polos iguais se repelem e polos diferentes se atraem. Os ímãs empurram um lado da bobina para cima e o outro para baixo, e ela gira junto com o eixo.' },
      { quem: 'marta', texto: 'A cada meia volta, uma pecinha chamada **comutador** inverte a corrente na bobina. Assim a força continua girando para o mesmo lado e o motor não para.' },
      {
        tipo: 'quiz', quem: 'marta', ilustracao: null, pergunta: 'O motor elétrico transforma:',
        opcoes: [
          { texto: 'Energia elétrica em movimento', certa: true, resposta: 'Isso! A corrente passa pela bobina, os ímãs empurram e o eixo gira.' },
          { texto: 'Movimento em energia elétrica', resposta: 'Esse é o contrário: é o que faz um **gerador**. Curiosidade: girando o eixo de um motor com a mão, ele vira um geradorzinho!' },
          { texto: 'Energia elétrica em luz', resposta: 'Quem faz isso é o LED! O motor transforma a energia em movimento.' },
        ],
      },
      { quem: 'julia-robotica', texto: 'Bora ver isso funcionando! Ligue o motor na fonte da bancada.' },
      { tipo: 'desafio', id: 'liga-motor' },
      { quem: 'julia-robotica', texto: 'Ele girou no sentido **{sentidoMotor}**. E olha o visor da fonte: o motor puxa uns **{correnteMotor} mA**, enquanto um LED aceso usa uns 15 mA!' },
      { quem: 'julia-robotica', texto: 'Diferente do LED, o motor funciona ligado dos dois jeitos. O que muda é o **sentido** do giro. Testa aí: faça ele girar para o outro lado.' },
      { tipo: 'desafio', id: 'inverte-motor' },
      {
        tipo: 'quiz', quem: 'julia-robotica', pergunta: 'Um robô tem uma roda de cada lado, cada uma com seu motor. Para ele andar **de ré**, o que a gente faz?',
        opcoes: [
          { texto: 'Inverte a polaridade dos dois motores', certa: true, resposta: 'Isso! Com a corrente ao contrário, as duas rodas giram para trás. Na robótica, um **driver de motor** (ponte H) faz essa troca pelo código.' },
          { texto: 'Desliga um dos motores', resposta: 'Assim o robô fica girando em volta da roda parada! Para dar ré, as duas rodas precisam girar ao contrário.' },
          { texto: 'Coloca um resistor maior', resposta: 'O resistor muda a velocidade, mas não o sentido. Para dar ré, é preciso inverter a corrente.' },
        ],
      },
      { quem: 'marta', ilustracao: 'motor-velocidade', texto: 'E a velocidade? Quanto **maior a tensão** no motor, mais rápido ele gira. Com menos tensão, ele gira mais devagar.' },
      { quem: 'marta', texto: 'A fonte da bancada é fixa em 5 V. Mas, com um **resistor em série**, parte da tensão fica no resistor e sobra menos para o motor.' },
      { quem: 'julia-robotica', ilustracao: null, texto: 'Desafio: faça o motor girar **mais devagar** usando um resistor.' },
      { tipo: 'desafio', id: 'motor-devagar' },
      { quem: 'julia-robotica', texto: 'Com o resistor de **{resistorMotor}**, sobraram **{tensaoMotor} V** para o motor. E com um resistor grande demais, ele nem consegue sair do lugar!' },
      { quem: 'leticia-robotica', ilustracao: 'pwm', texto: 'Nos nossos robôs a gente quase não usa resistor para mudar a velocidade: ele esquenta e desperdiça energia. A gente usa **PWM**!' },
      { quem: 'leticia-robotica', texto: 'No PWM o motor recebe a tensão toda, mas fica **ligando e desligando** bem rápido. Como ele tem inércia, não dá tempo de parar: ele gira numa velocidade média.' },
      { quem: 'aline-robotica', texto: 'A porcentagem do tempo em que ele fica ligado se chama **ciclo de trabalho** (duty cycle). Com 0% ele fica parado, com 100% vai na velocidade máxima.' },
      {
        tipo: 'pwm', quem: 'julia-robotica', ilustracao: null, faixa: [40, 60], segundos: 4,
        texto: 'Agora você é o PWM! **Segure** o botão para ligar o motor e **solte** para desligar. Dê toques no ritmo certo para deixar o carrinho entre **40% e 60%** da velocidade.',
        sucesso: 'Você deixou o motor ligado uns **{cicloPWM}%** do tempo, e o carrinho andou na metade da velocidade. Isso é PWM!',
      },
      { quem: 'julia-robotica', texto: 'O Arduino faz exatamente isso, só que umas **490 vezes por segundo**, com o comando **analogWrite**. Na oficina de Arduino você vai ver: os pinos com **~** são os que fazem PWM.' },
      {
        tipo: 'quiz', quem: 'aline-robotica', pergunta: 'Com PWM de **25%**, o motor:',
        opcoes: [
          { texto: 'Fica ligado 25% do tempo e gira devagar', certa: true, resposta: 'Isso! Ligado um quarto do tempo, ele anda mais ou menos a um quarto da velocidade.' },
          { texto: 'Recebe só 25% da tensão o tempo todo', resposta: 'Essa é a ideia do resistor! No PWM a tensão é sempre a toda; o que muda é o tempo ligado.' },
          { texto: 'Gira por 25 segundos e para', resposta: 'O PWM liga e desliga muitas vezes por segundo, sem parar. Os 25% são a parte do tempo em que ele fica ligado.' },
        ],
      },
      {
        tipo: 'quiz', quem: 'alejandra', pergunta: 'Um pino do Arduino fornece só uns **20 mA**. Dá para ligar o motor direto nele?',
        opcoes: [
          { texto: 'Não: o motor precisa de muito mais corrente', certa: true, resposta: 'Isso! O motor pede uns 200 mA. Por isso a gente usa um **transistor** ou um **driver de motor** entre o Arduino e o motor.' },
          { texto: 'Sim, sem problema nenhum', resposta: 'Lembra do visor da fonte: o motor puxou uns 200 mA, dez vezes mais do que o pino aguenta!' },
          { texto: 'Só se ele girar devagar', resposta: 'Mesmo devagar ele ainda puxa bem mais que 20 mA. A saída é usar um transistor ou um driver de motor.' },
        ],
      },
      { quem: 'alejandra', texto: 'Parabéns, {nome}! Agora você sabe como os motores colocam carrinhos, ventiladores e robôs em movimento.' },
      { quem: 'alejandra', texto: 'Na próxima oficina, a **equipe de robótica** vem te ensinar a programar o **Arduino**!' },
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
      { quem: 'alejandra', texto: 'E hoje quem te acompanha de novo é a **equipe de robótica Project Neon**: a Aline, a Letícia e a Julia!' },
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
      { quem: 'alejandra', texto: 'Nas próximas oficinas do LABe a gente vai usar sensores, como o sensor ultrassônico, que mede distâncias.' },
      { quem: 'alejandra', texto: 'Mas, antes, ainda falta um desafio: o **chefão final** do laboratório está te esperando!' },
    ],
  },

  {
    id: 'osc1',
    trilha: 'Chefão final',
    chefao: 'Osciloscópio',
    titulo: 'O osciloscópio',
    resumo: 'O chefão final do laboratório! Aprenda a usar o osciloscópio, o aparelho que desenha a tensão ao longo do tempo, um botão de cada vez.',
    passos: [
      { cenario: 'laboratorio', quem: 'alejandra', texto: '{nome}, você chegou à última oficina! Você já acendeu LEDs, mediu com o multímetro, fez motores girarem e programou o Arduino.' },
      { quem: 'alejandra', texto: 'Mas todo jogo tem um **chefão final**. E o do laboratório está ali no fundo, em cima da bancada...' },
      { quem: 'narrador', ilustracao: 'chefao', texto: 'Um aparelho cheio de botões, com uma telinha verde, parece te encarar. É o **osciloscópio**!' },
      { quem: 'voce', texto: 'Quanto botão! Por onde eu começo?' },
      { quem: 'marta', texto: 'Calma! Ele parece assustador, mas cada botão faz uma coisa só. A gente vai domar ele **um botão de cada vez**.' },
      { quem: 'marta', texto: 'Cada pergunta e cada ajuste que você acertar tira um pedaço da **vida do chefão**. Olha a barra lá em cima!' },
      { quem: 'marta', ilustracao: 'osciloscopio', texto: 'O multímetro mostra um número só. O osciloscópio **desenha a tensão ao longo do tempo**: é um gráfico ao vivo do que acontece no circuito.' },
      { quem: 'marta', ilustracao: 'tela-osc', texto: 'A tela tem uma grade. Na **vertical** fica a **tensão** e na **horizontal** fica o **tempo**. Cada quadradinho da grade se chama **divisão**.' },
      {
        tipo: 'quiz', quem: 'marta', ilustracao: null, pergunta: 'Na tela do osciloscópio, o eixo **vertical** mostra:',
        opcoes: [
          { texto: 'A tensão', certa: true, resposta: 'Isso! Quanto mais alto o desenho, maior a tensão naquele instante.' },
          { texto: 'O tempo', resposta: 'O tempo corre na horizontal, da esquerda para a direita.' },
          { texto: 'A resistência', resposta: 'O osciloscópio mostra tensão. A resistência a gente mede com o ohmímetro!' },
        ],
      },
      { quem: 'livia', ilustracao: 'ponta-de-prova', texto: 'Para ter o que olhar, liguei um **gerador de funções**. Ele cria sinais que sobem e descem sem parar, como a **onda senoidal**.' },
      { quem: 'livia', texto: 'O sinal entra no osciloscópio pela **ponta de prova**. O **gancho** vai no ponto que você quer medir e o **jacaré** vai no **terra** (GND), como a ponta preta do multímetro.' },
      {
        tipo: 'quiz', quem: 'livia', ilustracao: null, pergunta: 'Onde vai o **jacaré** da ponta de prova?',
        opcoes: [
          { texto: 'No terra (GND)', certa: true, resposta: 'Isso! O osciloscópio mede a tensão do gancho em relação ao terra, o 0 V.' },
          { texto: 'No ponto que eu quero medir', resposta: 'Nesse ponto vai o gancho. O jacaré fica no terra, a referência de 0 V.' },
          { texto: 'Em lugar nenhum', resposta: 'Sem o jacaré no terra, falta a referência de 0 V e a medida sai cheia de ruído.' },
        ],
      },
      { quem: 'marta', texto: 'Primeiro botão: **VOLTS/DIV**. Ele diz quantos volts vale cada divisão na vertical. Com um valor grande, a onda fica baixinha. Com um valor pequeno, ela cresce e pode até sair da tela.' },
      {
        tipo: 'osciloscopio', quem: 'marta', meta: 'volts', controles: ['volts'],
        sinal: { forma: 'seno', vpp: 6, f: 500 }, inicio: { volts: 10, tempo: 0.5, trigger: 0 },
        texto: 'Gire o **VOLTS/DIV** até a onda caber inteira na tela e ocupar **mais da metade** da altura.',
        sucesso: 'Com **1 V/div**, a onda ocupa **6 divisões** de cima a baixo: 6 × 1 V = **6 V**.',
      },
      { quem: 'livia', texto: 'Essa medida, do ponto mais alto ao mais baixo da onda, se chama tensão **pico a pico** (Vpp). É só contar as divisões e multiplicar pelo VOLTS/DIV.' },
      {
        tipo: 'quiz', quem: 'livia', ilustracao: 'pico-a-pico', pergunta: 'Com o VOLTS/DIV em **2 V**, esta onda ocupa **4 divisões** de pico a pico. Qual é a tensão pico a pico?',
        opcoes: [
          { texto: '8 V', certa: true, resposta: '4 divisões × 2 V = **8 V** de pico a pico.' },
          { texto: '4 V', resposta: 'Cada divisão vale 2 V, não 1 V. São 4 divisões de 2 V cada.' },
          { texto: '2 V', resposta: 'Esse é o valor de uma divisão só. A onda ocupa 4 delas!' },
        ],
      },
      { quem: 'marta', ilustracao: null, texto: 'Segundo botão: **TEMPO/DIV**. Ele diz quanto tempo vale cada divisão na horizontal. É como dar **zoom** no tempo.' },
      {
        tipo: 'osciloscopio', quem: 'marta', meta: 'tempo', controles: ['tempo'],
        sinal: { forma: 'seno', vpp: 6, f: 250 }, inicio: { volts: 1, tempo: 10, trigger: 0 },
        texto: 'A Lívia mudou a frequência do gerador e as ondas ficaram espremidas. Gire o **TEMPO/DIV** até aparecerem de **2 a 4 ondas** completas na tela.',
        sucesso: 'Com **1 ms/div**, cada onda ocupa **4 divisões**: ela leva 4 × 1 ms = **4 ms** para se repetir.',
      },
      { quem: 'livia', ilustracao: 'periodo', texto: 'O tempo de uma onda completa é o **período** (T). E quantas ondas acontecem em um segundo é a **frequência** (f), medida em **hertz** (Hz).' },
      { quem: 'livia', texto: 'Uma é o inverso da outra: **f = 1 ÷ T**. Com T = 4 ms, que é 0,004 s, a frequência é 1 ÷ 0,004 = **250 Hz**: 250 ondas por segundo!' },
      {
        tipo: 'quiz', quem: 'livia', ilustracao: null, pergunta: 'Uma onda tem período de **2 ms**. Qual é a frequência dela?',
        opcoes: [
          { texto: '500 Hz', certa: true, resposta: '1 ÷ 0,002 s = **500 Hz**. Período menor, frequência maior!' },
          { texto: '2 Hz', resposta: 'Cuidado com a unidade: 2 ms são 0,002 s. Quanto dá 1 ÷ 0,002?' },
          { texto: '200 Hz', resposta: 'Quase! 1 ÷ 0,002 dá 500, não 200.' },
        ],
      },
      { quem: 'marta', texto: 'Agora o botão mais traiçoeiro: o **TRIGGER**, ou gatilho. Sem ele, cada desenho da onda começa num ponto diferente, e a imagem fica **correndo** na tela.' },
      { quem: 'marta', ilustracao: 'trigger', texto: 'O trigger faz o desenho começar sempre no mesmo ponto: quando a onda **sobe** e passa por um **nível** de tensão que você escolhe. Se o nível fica fora da onda, ela nunca passa por ele.' },
      {
        tipo: 'osciloscopio', quem: 'marta', meta: 'trigger', controles: ['trigger'],
        sinal: { forma: 'seno', vpp: 6, f: 250 }, inicio: { volts: 1, tempo: 1, trigger: 6 },
        texto: 'O chefão contra-ataca: o nível do trigger está em **6 V**, acima da onda, e a imagem não para. Ajuste o **TRIGGER** para dentro da onda.',
        sucesso: 'A onda parou! Agora todo desenho começa no mesmo ponto, e dá para medir com calma.',
      },
      {
        tipo: 'quiz', quem: 'marta', ilustracao: null, pergunta: 'A onda está **correndo** na tela e não para. Qual botão você ajusta?',
        opcoes: [
          { texto: 'O TRIGGER', certa: true, resposta: 'Isso! Com o nível do trigger dentro da onda, a imagem fica parada.' },
          { texto: 'O VOLTS/DIV', resposta: 'Ele muda a altura da onda, mas ela continua correndo.' },
          { texto: 'O TEMPO/DIV', resposta: 'Ele muda quantas ondas aparecem, mas a imagem continua correndo.' },
        ],
      },
      { quem: 'alejandra', texto: 'O chefão está quase vencido! Para o golpe final, a Julia trouxe um velho conhecido...' },
      { quem: 'julia-robotica', texto: 'O **Arduino**! Ele está rodando **analogWrite(9, 64)**, um **PWM** no pino 9. Lembra da oficina de motores? Agora você vai **ver** o PWM de verdade.' },
      { quem: 'julia-robotica', texto: 'Esse sinal só vai de 0 a 5 V, então deixei a linha do 0 V mais para baixo: é a setinha amarela na esquerda da tela. E agora os **três botões** são seus!' },
      {
        tipo: 'osciloscopio', quem: 'julia-robotica', meta: 'tudo', controles: ['volts', 'tempo', 'trigger'], zero: -3,
        sinal: { forma: 'quadrada', alto: 5, baixo: 0, f: 490, ciclo: 0.25 }, inicio: { volts: 5, tempo: 5, trigger: -3 },
        texto: 'Golpe final! Deixe a onda **grande** e inteira na tela, com **2 a 4 ondas** e a imagem **parada**.',
        sucesso: 'Golpe certeiro! Com **1 V/div** e **0,5 ms/div** dá para ver o PWM: **5 V** por um tempinho e **0 V** no resto. Só falta mais um golpe!',
      },
      {
        tipo: 'quiz', quem: 'julia-robotica', pergunta: 'Na tela, a onda fica em **5 V** durante **1 divisão** e em **0 V** durante **3 divisões**. Qual é o ciclo de trabalho desse PWM?',
        opcoes: [
          { texto: '25%', certa: true, resposta: 'Isso! Ligado 1 de 4 divisões = **25%**. E 64 é um quarto de 255, o máximo do analogWrite!' },
          { texto: '75%', resposta: 'Esse é o tempo desligado. O ciclo de trabalho é a parte do tempo **ligado**: 1 de 4 divisões.' },
          { texto: '33%', resposta: 'O período inteiro tem 1 + 3 = 4 divisões. Ligado 1 de 4 é quanto?' },
        ],
      },
      { quem: 'narrador', ilustracao: 'chefao-vencido', texto: 'A telinha verde pisca... e mostra uma onda bem comportada. O **osciloscópio** foi vencido!' },
      { quem: 'marta', texto: 'E agora ele é seu aliado! Com o osciloscópio você enxerga sinais rápidos demais para o multímetro, como o PWM, o som de um buzzer e as mensagens que o Arduino manda.' },
      { quem: 'alejandra', ilustracao: null, grupo: ['livia', 'marta', 'julia-robotica', 'alejandra'], texto: 'Parabéns, {nome}! Você completou **todas as oficinas** do jogo LABe e venceu o chefão final!' },
      { quem: 'alejandra', texto: 'Seu certificado está te esperando. E lembre: o laboratório também é lugar de mulher. Até a próxima oficina!' },
    ],
  },
];
