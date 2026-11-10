import type { ImageMetadata } from 'astro';
import estrela from '../assets/img/mascotes/estrela.png';
import tartaruga from '../assets/img/mascotes/tartaruga.png';
import polvo from '../assets/img/mascotes/polvo.png';
import peixe from '../assets/img/mascotes/peixe.png';
import leaoMarinho from '../assets/img/mascotes/leao-marinho.png';
import tubarao from '../assets/img/mascotes/tubarao.png';
import golfinho from '../assets/img/mascotes/golfinho.png';

// Faixas etárias conforme a página "Método" do site antigo. As páginas individuais
// dos níveis traziam faixas diferentes para os bebês (6–30 e 31–42 meses) —
// pendente de confirmação com a academia.

export type Nivel = {
  id: string; // slug da página antiga — vira âncora em /metodo/
  mascote: string;
  nivel: string;
  faixa: string;
  aprende: string;
  objetivos: string;
  imagem: ImageMetadata;
};

const BASE_BEBE =
  'Aulas com a presença de acompanhante. Objetivos gerais de aprendizagem: ambientação e adaptação ao meio líquido, sociabilização, equilíbrio, mergulhos e sobrevivência.';
const BASE_15 =
  'Ambientação, sociabilização, controle da respiração, sobrevivência. Nesta fase deverão apresentar: deslize frontal e dorsal, sustentação 15” (na piscina grande), submersão/apneia (percorrer um trecho na piscina), estilo crawl completo e respiração bilateral, mergulho saída de crawl, batimento de perna de costas, braçada de costas, estilo costas completo, 1 piscina crawl completo e costas completo (sem interrupção).';
const PEITO =
  'Aperfeiçoamento dos nados crawl e costas, mergulho com saída para estilo costas, iniciação da perna e braçada do nado peito, coordenação braço e respiração do nado peito, coordenação braço e perna do nado peito, movimento da filipina (saída do nado peito), estilo nado peito completo, mergulho';
const VIRADAS =
  ', saída/chegada e virada simples do nado crawl, saída/chegada e virada simples do nado costas, saída/chegada e virada simples do nado peito, ondulação (iniciação ao estilo nado borboleta), ondulação com respiração frontal e borboleta nado completo';

export const niveis: Nivel[] = [
  {
    id: 'estrela',
    mascote: 'Estrela do mar',
    nivel: 'Bebê 1',
    faixa: '6 a 36 meses',
    aprende: 'Adaptação ao meio líquido, com acompanhante',
    objetivos: BASE_BEBE,
    imagem: estrela,
  },
  {
    id: 'tartaruguinha',
    mascote: 'Tartaruguinha',
    nivel: 'Bebê 2',
    faixa: '37 a 48 meses',
    aprende: 'Equilíbrio, mergulhos e sobrevivência',
    objetivos: BASE_BEBE,
    imagem: tartaruga,
  },
  {
    id: 'polvo',
    mascote: 'Polvo',
    nivel: 'Adaptação',
    faixa: '4 a 5 anos',
    aprende: 'Flutuação, respiração e primeiras braçadas',
    objetivos:
      'Ambientação, sociabilização, controle da respiração, sobrevivência. Nesta fase deverão apresentar: sustentação 10” (manter o corpo na vertical sem afundar), pegar objetos no fundo da piscina, flutuação dorsal, ventral e grupada, deslize frontal e dorsal, propulsão de perna crawl, braçada crawl, respiração lateral, iniciação ao mergulho, submersão. Fase onde irá desenvolver o gosto pela atividade na água, em clima de muita motivação, atividades lúdicas e recreativas.',
    imagem: polvo,
  },
  {
    id: 'peixe',
    mascote: 'Peixe',
    nivel: 'Iniciação',
    faixa: '6 e 7 anos',
    aprende: 'Crawl completo e nado costas',
    objetivos: BASE_15,
    imagem: peixe,
  },
  {
    id: 'leaomarinho',
    mascote: 'Leão-marinho',
    nivel: 'Aprendizagem',
    faixa: '8 a 10 anos',
    aprende: 'Nado peito completo',
    objetivos: `${BASE_15} ${PEITO}.`,
    imagem: leaoMarinho,
  },
  {
    id: 'tubarao',
    mascote: 'Tubarão',
    nivel: 'Aperfeiçoamento I',
    faixa: '11 a 12 anos',
    aprende: 'Viradas e nado borboleta',
    objetivos: `${BASE_15} ${PEITO}${VIRADAS}.`,
    imagem: tubarao,
  },
  {
    id: 'golfinho',
    mascote: 'Golfinho',
    nivel: 'Aperfeiçoamento II',
    faixa: '13 a 14 anos',
    aprende: 'Os 4 estilos, viradas olímpicas e medley',
    objetivos:
      'Aperfeiçoamento dos 4 estilos de nados, saída/chegada e viradas olímpicas dos 4 estilos, sequência do estilo medley e do revezamento, resistência global e participação em eventos esportivos.',
    imagem: golfinho,
  },
];

export const citacaoMetodo =
  'Nadar está muito além de realizar imersões, bater perna e rodar braços. Tem um significado próprio para cada indivíduo e é ‘construído’ por cada um de acordo com seus interesses, necessidades e habilidades.';

export const metodo = {
  ensino: {
    titulo: 'Aprendizagem por aproximações sucessivas',
    objetivo:
      'Trabalhar com o lúdico (ludicidade), utilizando-o como um facilitador no processo do ensino e aprendizagem para o desenvolvimento, a sobrevivência e técnica no meio aquático, além de diversas vantagens como: social, fisiológicas, psicológicas e motoras, buscando sempre o resultado baseado na visão exploratória, descritiva e qualitativa.',
    principio:
      'Para que o aluno tenha condições de mudar de fase, a condição é realizar bem a anterior, ou seja, conforme a ficha de avaliação, alcançar nos itens propostos o índice de 75% do aprendizado.',
  },
  bebes: {
    objetivo: 'Saltar, movimentar-se por baixo da água, emergir e segurar na borda (6 a 48 meses).',
    exercicios: [
      'Ser afundado, ser retirado do fundo.',
      'Ser afundado – espernear – ser retirado do fundo.',
      'Ser afundado – espernear – perceber nossas mãos, agarrá-las – ser retirado do fundo.',
      'Ser afundado – espernear – perceber nossas mãos, agarrá-las – ser puxado por nossas mãos.',
      'Saltar – mergulhar – movimentar-se por baixo da água – emergir e segurar na borda da piscina.',
    ],
  },
  estilos: {
    objetivo: 'Aprendizagem dos estilos crawl, costas, peito e golfinho (borboleta).',
    etapas: [
      'Adaptação ao meio líquido e ambiente',
      'Respiração geral',
      'Flutuação ventral, dorsal e vertical',
      'Propulsão das pernas',
      'Propulsão dos braços',
      'Coordenação dos braços e das pernas',
      'Respiração específica',
      'Coordenação braço-perna-respiração (nado completo)',
    ],
  },
  fases: [
    {
      titulo: 'Adaptação ao meio líquido',
      itens: ['Técnica: caminhar, rosto na água, abrir os olhos, prazer.', 'Estratégias: jogos, brincadeiras, toque do professor, confiança.'],
    },
    {
      titulo: 'Respiração geral',
      itens: ['Objetivo: controlar a inspiração e a expiração.', 'Técnicas: nariz – boca – abrir os olhos – noções de espaço.', 'Estratégias: afundar a cabeça.'],
    },
    {
      titulo: 'Flutuação',
      itens: [
        'Técnica: bloqueio da respiração – retenção do ar nos pulmões – olhos voltados para baixo.',
        'Estratégias: imitar uma boia – inflar os pulmões – relaxamento (adulto), auxílio do professor.',
      ],
    },
  ],
  faixas: [
    {
      idade: '6 a 36 meses',
      texto: 'Espera-se que os alunos nesta faixa etária desenvolvam adaptação ao meio líquido – bloqueio da respiração, movimentos de pernas, saltos, imersão e deslocamentos.',
    },
    {
      idade: '37 a 48 meses',
      texto: 'Adaptação ao meio líquido, respiração geral, flutuação ventral e dorsal, propulsão das pernas, braçada do estilo crawl e costas, mergulho elementar. Desenvolver o gosto pela atividade na água, com aulas em clima de muita motivação, atividades lúdicas e recreativas.',
    },
    {
      idade: '4 a 5 anos',
      texto: 'Continuidade das atividades anteriores, ou início para os alunos que iniciam nesta faixa etária. Propulsão das pernas, braços, respiração específica para o estilo peito, além da continuidade dos estilos crawl e costas, mergulho elementar. Podemos também ministrar exercícios de pernada de golfinho nesta fase.',
    },
    {
      idade: '6 a 7 anos',
      texto: 'Continuidade das atividades anteriores ou início para os alunos que começam a partir desta faixa etária. Mergulho elementar, aprendizagem do estilo golfinho, viradas simples, aperfeiçoamento dos estilos, detalhes técnicos – introdução à competição. 1ª fase: festival interno do clube ou da escola – todos ganham prêmios. 2ª fase: competição ou festival com uma ou mais escolas do mesmo nível.',
    },
    {
      idade: '8 a 10 anos',
      texto: 'Continuidade das atividades anteriores, dando maior ênfase a detalhes técnicos, iniciação e continuidade competitiva, ou o gosto pela natação, principalmente para os que não gostam de competir.',
    },
    {
      idade: '11 a 14 anos',
      texto: 'Aprimoramento técnico e principalmente do condicionamento aeróbico. Alguns alunos optarão por competição de natação, outros por esportes ligados à natação como biathlon, triátlon, surf etc. Aprendizagem dos 4 estilos, viradas, mergulho elementar, saídas, noções de frequência cardíaca, acompanhar tempos de séries.',
    },
    {
      idade: 'Acima de 15 anos',
      texto: 'Trabalho individualizado, conforme as necessidades dos alunos. Quando já vêm com um trabalho e desenvolvimento contínuo, deve-se aprimorar e melhorar o seu condicionamento para o dia a dia.',
    },
  ],
  avaliacao: {
    texto:
      'As crianças mudam de nível conforme a avaliação feita pelos professores e pela coordenação (semana específica). Após a avaliação, as crianças que mudarem de nível recebem um certificado e devem adquirir a touca que identifica o seu nível de aprendizado. Não existe relação do nível de aprendizagem com a faixa etária do aluno.',
    regras: [
      'O aluno deve estar matriculado há mais de 4 meses.',
      'A frequência deve ser de no mínimo 70% no decorrer desses 4 meses.',
      'Na ausência do aluno na data estabelecida pela direção, ele fará a avaliação subsequente, ou seja, 4 meses após.',
      'Em caso de doença, deve apresentar atestado e a data será agendada pela coordenação da academia.',
      'Pode ocorrer exceção de data quando o aluno não atingir todos os itens no dia da avaliação e tiver boa evolução no período seguinte: a avaliação é feita pelo próprio professor junto com o professor líder.',
    ],
  },
  adultos: [
    { nivel: 'Adaptação / Iniciação', texto: 'Adaptação ao meio líquido, respiração geral, nados elementares, submersão e sobrevivência.' },
    { nivel: 'Iniciação 2', texto: 'Aperfeiçoamento da técnica dos nados crawl e costas, aumento da tonicidade muscular, manutenção da qualidade de vida e bem-estar.' },
    { nivel: 'Intermediário', texto: 'Aprimoramento da técnica dos nados, aumento da tonicidade muscular, manutenção da qualidade de vida e bem-estar, socialização e participação em eventos esportivos.' },
    { nivel: 'Avançado', texto: 'Condicionamento aquático, aprimoramento das técnicas de nado, saídas e viradas, melhora do condicionamento aeróbico e muscular, manutenção da qualidade de vida e bem-estar, socialização e integração.' },
  ],
};
