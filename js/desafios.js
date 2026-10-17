/*
 * desafios.js — as montagens que as participantes fazem na bancada.
 *
 * Cada desafio tem:
 *   titulo, objetivo   textos mostrados no topo da bancada
 *   monitora           quem dá as dicas (id de PERSONAGENS, em historia.js)
 *   intro              primeira fala da monitora na bancada
 *   gaveta             o que aparece na gaveta: resistores (valores em Ω), leds (cores),
 *                      fios (true/false) e multimetro (true/false)
 *   dicas              lista de dicas do botão "Pedir dica" (uma por clique)
 *   verificar(c)       devolve true quando o desafio foi cumprido
 *   dicaAoVivo(c)      (opcional) comentário da monitora sobre a montagem atual
 *   aoConcluir(c)      (opcional) guarda valores para usar na história, ex.: {medidaV: '3,2'}
 *   sucesso            fala da monitora quando dá certo
 *
 * "c" é o contexto da bancada: c.pecas, c.sondas, c.ligada, c.res (resultado do
 * simulador, só com a fonte ligada), c.leitura (multímetro), c.no(furo), c.mesmaColuna(peca).
 */

const fmt = (n, casas = 2) => n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
const acesos = c => (c.res ? c.res.leds.filter(l => l.aceso) : []);
const perto = (a, b, tolerancia) => Math.abs(a - b) <= tolerancia * Math.max(Math.abs(a), Math.abs(b), 1e-9);

// Pares de LEDs acesos que estão em série (mesma corrente, e é toda a corrente da fonte)
function ledsEmSerie(c) {
  const l = acesos(c);
  for (let i = 0; i < l.length; i++) for (let j = i + 1; j < l.length; j++) {
    if (perto(l[i].corrente, l[j].corrente, 0.02) && perto(c.res.correnteFonte, l[i].corrente, 0.05)) return true;
  }
  return false;
}
// Pares de LEDs acesos em paralelo (a fonte entrega a soma das duas correntes)
function ledsEmParalelo(c) {
  const l = acesos(c);
  for (let i = 0; i < l.length; i++) for (let j = i + 1; j < l.length; j++) {
    if (perto(c.res.correnteFonte, l[i].corrente + l[j].corrente, 0.05)) return true;
  }
  return false;
}
// Ponta vermelha na perna "a" e preta na perna "b" da peça (no LED, a = perna longa)
function sondasEm(c, p) {
  if (!c.sondas.v || !c.sondas.p) return false;
  return c.no(c.sondas.v) === c.no(p.a) && c.no(c.sondas.p) === c.no(p.b);
}
// Uma ponta de cada lado da peça, em qualquer ordem
function sondasNosLados(c, p) {
  if (!c.sondas.v || !c.sondas.p) return false;
  return sondasEm(c, p) || (c.no(c.sondas.v) === c.no(p.b) && c.no(c.sondas.p) === c.no(p.a));
}

// Comentários sobre o código do Arduino que deveria controlar o pino indicado
function dicaArduino(c, pino) {
  const a = c.arduino;
  if (!a) return null;
  const { setup, loop } = a.programa;
  const todos = [...setup, ...loop];
  if (!todos.length) return { tipo: 'info', texto: 'O código ainda está vazio. Use os botões de comando para montar o **setup()** e o **loop()**, depois clique em **Enviar código para o Arduino**.' };
  if (!a.rodando) return null;
  if (!todos.some(i => i.pino === pino)) return { tipo: 'aviso', texto: `O seu código não mexe no **pino ${pino}**. Confira os números dentro dos comandos!` };
  const usaTom = todos.some(i => i.cmd === 'tone');
  if (loop.length && !loop.some(i => i.cmd === 'delay')) return { tipo: 'aviso', texto: 'O loop() não tem nenhum **delay**: ele liga e desliga tão rápido que não dá para perceber. Coloque um delay depois de cada comando que liga ou desliga.' };
  const temPinMode = todos.some(i => i.cmd === 'pinMode' && i.pino === pino && i.modo === 'OUTPUT');
  if (!temPinMode && !usaTom && loop.some(i => i.cmd === 'digitalWrite' && i.pino === pino)) {
    return { tipo: 'aviso', texto: `Faltou o **pinMode(${pino}, OUTPUT);** no setup(). Sem ele o pino não consegue fornecer corrente e o componente quase não funciona.` };
  }
  const valores = new Set(loop.filter(i => i.cmd === 'digitalWrite' && i.pino === pino).map(i => i.valor));
  if (!usaTom && valores.size === 1) return { tipo: 'aviso', texto: `No loop() o pino ${pino} só recebe **${[...valores][0]}**. Para piscar, ele precisa de HIGH **e** de LOW, cada um com um delay depois.` };
  if (!loop.length) return { tipo: 'info', texto: 'O loop() está vazio: o Arduino roda o setup() e fica parado. Coloque no loop() o que deve se repetir.' };
  return null;
}

const DESAFIOS = {
  'primeira-peca': {
    titulo: 'Seu primeiro componente',
    objetivo: 'Encaixe um **resistor de 220 Ω** na protoboard, com cada perna em uma coluna diferente.',
    monitora: 'bia',
    intro: 'Clique no resistor de 220 Ω na gaveta e depois em dois furos da placa. Passe o mouse nos furos para ver quais estão ligados!',
    gaveta: { resistores: [220, 1000] },
    dicas: [
      'Escolha o resistor de **220 Ω** (vermelho, vermelho, marrom). Clique num furo da linha **c**, e depois em outro furo da mesma linha, umas 3 colunas para o lado.',
      'Os 5 furos de uma mesma coluna (a até e) são ligados por dentro. Se as duas pernas ficarem na mesma coluna, o resistor fica em curto e não serve pra nada.',
    ],
    verificar: c => c.pecas.some(p => p.tipo === 'resistor' && p.valor === 220 && !c.mesmaColuna(p)),
    dicaAoVivo(c) {
      if (c.pecas.some(p => p.tipo === 'resistor' && p.valor !== 220)) return { tipo: 'aviso', texto: 'Esse resistor não é o de 220 Ω. Confere as cores: o de 220 Ω é **vermelho, vermelho, marrom**.' };
    },
    sucesso: 'Encaixou direitinho! Cada perna ficou numa coluna diferente: é assim que se faz.',
  },

  'primeiro-led': {
    titulo: 'Acenda um LED',
    objetivo: 'Faça um caminho do **+** da fonte, passando por um **resistor** e por um **LED**, até o **−**. Depois ligue a fonte.',
    monitora: 'bia',
    intro: 'Dica de ouro: a trilha vermelha (+) e a azul (−) já estão ligadas na fonte. Use fios para levar a energia até as colunas onde estão as peças.',
    gaveta: { resistores: [220, 1000, 10000], leds: ['vermelho', 'verde', 'amarelo'], fios: true },
    dicas: [
      'Um jeito fácil: coloque o resistor entre as colunas 5 e 9 (linha c). Coloque o LED com a perna longa na coluna 9 e a curta na coluna 12.',
      'Agora os fios: um da **trilha +** até a coluna 5, e outro da coluna 12 até a **trilha −**. Depois é só ligar a fonte!',
      'Lembre: a perna **longa** do LED (+) fica do lado do positivo. Se ele não acender, selecione o LED e clique em “Inverter”.',
    ],
    verificar: c => acesos(c).length > 0,
    sucesso: 'AAAAH, acendeu! Esse é o “olá, mundo” da eletrônica! A corrente saiu do +, passou pelo resistor, pelo LED e voltou para o −.',
  },

  serie: {
    titulo: 'Dois LEDs em série',
    objetivo: 'Acenda **dois LEDs em série**: um depois do outro, num caminho só, junto com um resistor.',
    monitora: 'nina',
    intro: 'Em série a corrente não tem escolha: ela passa pelo primeiro LED e depois pelo segundo. A perna curta de um encontra a perna longa do outro na mesma coluna.',
    gaveta: { resistores: [100, 220, 1000], leds: ['vermelho', 'verde', 'amarelo', 'azul'], fios: true },
    dicas: [
      'Monte assim: + → resistor → LED 1 → LED 2 → −. A perna curta do LED 1 e a perna longa do LED 2 ficam na **mesma coluna**.',
      'Use o resistor de 220 Ω ou de 100 Ω. Com dois LEDs, sobra menos tensão para o resistor, então a corrente fica menor.',
    ],
    verificar: c => ledsEmSerie(c),
    dicaAoVivo(c) {
      if (!c.res) return;
      if (acesos(c).length >= 2 && ledsEmParalelo(c)) return { tipo: 'aviso', texto: 'Os dois acenderam, mas estão **em paralelo** (cada um no seu caminho). Em série, a corrente passa por um LED e **depois** pelo outro.' };
      const azuis = c.pecas.filter(p => p.tipo === 'led' && p.cor === 'azul').length;
      if (azuis >= 2 && !acesos(c).length) return { tipo: 'aviso', texto: 'Dois LEDs azuis precisam de quase 6 V juntos, e a fonte só tem 5 V! Troque um deles por outra cor.' };
    },
    sucesso: 'Isso! Os dois estão em série. Repara que eles brilham um pouco menos que um LED sozinho: os dois dividem a tensão da fonte.',
  },

  paralelo: {
    titulo: 'Dois LEDs em paralelo',
    objetivo: 'Acenda **dois LEDs em paralelo**: cada um com o seu próprio caminho entre o **+** e o **−**.',
    monitora: 'nina',
    intro: 'Pense em duas “pontes” independentes ligando a trilha + à trilha −. O ideal é cada LED ter o seu próprio resistor.',
    gaveta: { resistores: [220, 1000], leds: ['vermelho', 'verde', 'amarelo', 'azul'], fios: true },
    dicas: [
      'Monte dois circuitos iguais ao do primeiro LED, lado a lado: cada um com seu resistor, seu LED e seus fios até as trilhas + e −.',
      'Os dois caminhos começam na trilha + e terminam na trilha −. Assim a tensão é a mesma para os dois.',
    ],
    verificar: c => ledsEmParalelo(c),
    dicaAoVivo(c) {
      if (!c.res) return;
      if (acesos(c).length >= 2 && ledsEmSerie(c)) return { tipo: 'aviso', texto: 'Eles estão **em série** (um caminho só). Em paralelo, cada LED precisa do seu próprio caminho entre o + e o −.' };
      const apagadoMasCerto = c.res.leds.find(l => !l.aceso && l.vak > 1.2 && !l.peca.queimado);
      if (acesos(c).length === 1 && apagadoMasCerto) return { tipo: 'aviso', texto: 'Um LED ficou apagado: LEDs de cores diferentes dividindo o mesmo resistor não se dão bem. O que precisa de menos tensão “rouba” a corrente. Use **um resistor para cada LED**!' };
    },
    sucesso: 'Perfeito! Cada LED tem seu caminho. É assim que as lâmpadas da sua casa são ligadas: se uma queima, as outras continuam acesas.',
  },

  'medir-led': {
    titulo: 'Medindo a tensão do LED',
    objetivo: 'Monte o circuito do LED, ligue a fonte e meça a **tensão sobre o LED** com o multímetro.',
    monitora: 'nina',
    intro: 'Primeiro monte o circuito com resistor e LED. Depois encoste a ponta **vermelha** do lado da perna longa do LED e a **preta** do lado da perna curta.',
    gaveta: { resistores: [220, 1000], leds: ['vermelho', 'verde', 'amarelo'], fios: true, multimetro: true },
    dicas: [
      'As pontas do multímetro podem ir em qualquer furo da coluna onde está a perna do LED: a coluna inteira está ligada.',
      'Vermelha na coluna da perna **longa** do LED, preta na coluna da perna **curta**. E a fonte precisa estar ligada!',
    ],
    verificar: c => acesos(c).some(l => sondasEm(c, l.peca)),
    dicaAoVivo(c) {
      if (!c.res || c.leitura === null) return;
      const led = acesos(c)[0];
      if (led && c.sondas.v && c.sondas.p && c.no(c.sondas.v) === c.no(led.peca.b) && c.no(c.sondas.p) === c.no(led.peca.a)) {
        return { tipo: 'aviso', texto: 'O visor mostrou um valor **negativo**: as pontas estão invertidas! A vermelha vai do lado mais positivo (perna longa).' };
      }
      if (c.sondas.v && c.sondas.p && c.no(c.sondas.v) === c.no(c.sondas.p)) return { tipo: 'aviso', texto: 'As duas pontas estão no mesmo ponto do circuito, por isso o visor mostra 0. Coloque uma de cada lado do LED.' };
      if (c.res.resistores.some(r => sondasNosLados(c, r.peca))) {
        return { tipo: 'info', texto: 'Essa é a tensão sobre o **resistor**! Guarda esse número. Agora queremos a tensão sobre o **LED**.' };
      }
    },
    aoConcluir: c => ({ tensaoLed: fmt(c.leitura) }),
    sucesso: 'Isso! O LED fica com cerca de 2 V. O resto da tensão da fonte fica no resistor.',
  },

  'medir-resistor': {
    titulo: 'Medindo a tensão do resistor',
    objetivo: 'Agora, sem desmontar nada, meça a **tensão sobre o resistor**.',
    monitora: 'nina',
    intro: 'Mesma ideia: uma ponta de cada lado do resistor. A vermelha vai do lado que está ligado ao + da fonte.',
    gaveta: { resistores: [220, 1000], leds: ['vermelho', 'verde', 'amarelo'], fios: true, multimetro: true },
    manterMontagem: true,
    dicas: [
      'Mova as pontas: clique na ponta vermelha da gaveta e escolha um furo da coluna do resistor mais perto do +. Depois a preta, do outro lado do resistor.',
    ],
    verificar: c => acesos(c).length > 0 && c.leitura > 0.05 && c.res.resistores.some(r => Math.abs(r.corrente) > 0.0005 && sondasNosLados(c, r.peca)),
    dicaAoVivo(c) {
      if (c.res && c.leitura !== null && c.leitura < -0.05) return { tipo: 'aviso', texto: 'Deu negativo: inverta as pontas! A vermelha vai do lado mais positivo.' };
    },
    aoConcluir(c) {
      const r = c.res.resistores.find(x => Math.abs(x.corrente) > 0.0005 && sondasNosLados(c, x.peca));
      const v = c.leitura;
      return { medidaV: fmt(v), medidaR: Arte.ohms(r.peca.valor), medidaI: fmt(v / r.peca.valor * 1000, 1) };
    },
    sucesso: 'Mandou bem! Agora você tem a tensão sobre o resistor. Com a Lei de Ohm dá para descobrir a corrente!',
  },

  // ---------------------------------------------------------------- oficina de Arduino
  'pisca-led': {
    titulo: 'Prática 1: pisca LED',
    objetivo: 'Ligue um LED (com resistor) no **pino 13** e programe o Arduino para fazer ele **piscar**.',
    monitora: 'bia',
    intro: 'Primeiro o circuito: pino 13 → resistor → LED → GND. Depois o código: no setup(), o pino 13 vira OUTPUT; no loop(), liga, espera, desliga e espera.',
    gaveta: { arduino: true, resistores: [220, 1000], leds: ['vermelho', 'verde', 'amarelo'], fios: true, comandos: ['pinMode', 'digitalWrite', 'delay'] },
    dicas: [
      'Circuito: um fio do **pino 13** até a coluna 5 da protoboard. Resistor de 220 Ω da coluna 5 até a 9. LED com a perna longa na coluna 9 e a curta na 12. E um fio da coluna 12 até a trilha **−** (que já está ligada no GND).',
      'No setup(), adicione **pinMode(13, OUTPUT);**',
      'No loop(), em ordem: **digitalWrite(13, HIGH); delay(1000); digitalWrite(13, LOW); delay(1000);**',
      'Repare no LED **L** da placa: ele também está ligado no pino 13 e pisca junto!',
    ],
    verificar: c => !!c.arduino && Object.values(c.arduino.piscadas).some(n => n >= 2),
    dicaAoVivo: c => dicaArduino(c, 13),
    sucesso: 'Está piscando! Você acabou de programar um microcontrolador. Esse programa se chama **Blink** e é o primeiro que todo mundo faz com Arduino.',
  },

  buzzer: {
    titulo: 'Prática 2: ativando o buzzer',
    objetivo: 'Ligue o **buzzer** no **pino 8** e faça ele **apitar** pelo menos duas vezes.',
    monitora: 'nina',
    intro: 'O buzzer tem polaridade, igual ao LED: a perna + vai para o pino 8 e a − para o GND. No código, dá para usar digitalWrite com delay, ou tone e noTone.',
    gaveta: { arduino: true, buzzer: true, fios: true, resistores: [220], leds: ['vermelho'], comandos: ['pinMode', 'digitalWrite', 'delay', 'tone', 'noTone'] },
    dicas: [
      'Circuito: um fio do **pino 8** até a coluna 5. Buzzer com a perna + na coluna 5 e a − na coluna 8. E um fio da coluna 8 até a trilha **−**.',
      'Código: no setup(), **pinMode(8, OUTPUT);** e no loop(), **digitalWrite(8, HIGH); delay(500); digitalWrite(8, LOW); delay(500);**',
      'Quer tocar uma nota? No loop(): **tone(8, 440);** (a nota lá) **delay(500); noTone(8); delay(500);**',
    ],
    verificar: c => !!c.arduino && Object.values(c.arduino.bipes).some(n => n >= 2),
    dicaAoVivo: c => {
      if (c.res && c.res.buzzers.some(z => z.invertido)) return { tipo: 'aviso', texto: 'O buzzer parece estar **ao contrário**: a perna + precisa ir para o lado do pino 8. Selecione e clique em “Inverter”.' };
      return dicaArduino(c, 8);
    },
    sucesso: 'Bip, bip! O buzzer está apitando no ritmo do seu código. Com tone() dá até para tocar músicas!',
  },
};

// Comentários automáticos da monitora enquanto a participante monta (vale para todos os desafios).
function dicaAutomatica(c, desafio) {
  for (const p of c.pecas) {
    if (p.tipo !== 'fio' && c.mesmaColuna(p)) {
      return { tipo: 'aviso', texto: `${c.nomePeca(p)} está com as duas pernas no mesmo grupo de furos. Assim ele fica “em curto” e a corrente nem passa por ele. Coloque cada perna em uma coluna diferente.` };
    }
  }
  if (!c.ligada) return desafio && desafio.dicaAoVivo && c.arduino ? desafio.dicaAoVivo(c) : null;
  const r = c.res;
  if (r.curto) return { tipo: 'erro', texto: `**Curto-circuito!** Tem um fio ligando o + direto no −, sem nada no meio. ${c.arduino ? 'O Arduino desligou para se proteger.' : 'A fonte entrou em proteção.'} Remova esse fio!` };
  if (r.curtoPino) return { tipo: 'erro', texto: `**Curto no pino ${r.curtoPino.slice(1)}!** Ele está ligado direto no GND (ou no 5V), sem nada no meio. Remova esse fio antes que o pino estrague.` };
  if (r.queimouAgora.length) return { tipo: 'erro', texto: '**Puf!** O LED queimou: passou corrente demais. O LED sempre precisa de um **resistor em série** para limitar a corrente. Remova o LED queimado e tente de novo.' };
  if (c.pecas.some(p => p.queimado)) return { tipo: 'aviso', texto: 'Tem um LED queimado na placa (o cinza). Selecione ele e clique em “Remover”, depois coloque um novo — com resistor!' };
  const especifica = desafio && desafio.dicaAoVivo && desafio.dicaAoVivo(c);
  if (especifica) return especifica;
  if (r.leds.some(l => l.invertido)) return { tipo: 'aviso', texto: 'Um LED parece estar **ao contrário**. A perna longa (+) precisa ficar do lado do positivo. Selecione o LED e clique em “Inverter”.' };
  if (r.leds.some(l => !l.aceso && l.corrente > 1e-5)) return { tipo: 'aviso', texto: 'O LED está tão fraquinho que quase não dá para ver: o resistor é grande demais e passa pouca corrente. Tente um de **220 Ω**.' };
  // com o Arduino o LED apaga de propósito quando o pino está em LOW, então não dá para dizer que está "aberto"
  if (!c.arduino && r.leds.length && r.leds.every(l => !l.aceso) && r.correnteFonte < 1e-4) return { tipo: 'info', texto: 'A fonte está ligada, mas não sai corrente: o circuito ainda está **aberto**. Confira se existe um caminho completo do + até o −.' };
  return null;
}
