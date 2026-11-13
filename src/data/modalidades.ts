import type { ImageMetadata } from 'astro';
import conteudo from './modalidades-conteudo.json';

import natacaoInfantil from '../assets/img/modalidades/natacao-infantil.jpg';
import natacaoAdulto from '../assets/img/modalidades/natacao-adulto.jpg';
import hidroginastica from '../assets/img/modalidades/hidroginastica.jpg';
import musculacao from '../assets/img/modalidades/musculacao.jpg';
import danca from '../assets/img/modalidades/danca.jpg';
import jump from '../assets/img/modalidades/jump.jpg';
import funcionalKids from '../assets/img/modalidades/funcional-kids.jpg';
import ginastica from '../assets/img/modalidades/ginastica.jpg';
import localizada from '../assets/img/modalidades/ginastica-localizada.jpg';

export type Categoria = 'agua' | 'academia' | 'kids';

type Conteudo = {
  titulo: string;
  descricao: string;
  beneficios: { lista?: string[]; texto?: string };
};

// Aulas que existem dentro de uma modalidade (as aulas coletivas da Ginástica).
export type Aula = { id: string; nome: string; texto: string; imagem: ImageMetadata };

export type Modalidade = Conteudo & {
  slug: string;
  nome: string;
  resumo: string;
  // Cada modalidade fica em uma categoria só, para não aparecer repetida no menu.
  categorias: [Categoria];
  imagem: ImageMetadata;
  diferenciais: string[];
  aulas?: Aula[];
};

const DIF = {
  aguaKids: [
    'Metodologia Aquativa',
    'Piscina infantil exclusiva, separada da piscina dos adultos',
    'Número limitado de crianças por professor',
    'Avaliação periódica do nível das crianças',
    'Vestiário infantil',
    '3 estacionamentos: 2 gratuitos colados na academia e 1 conveniado',
  ],
  aguaAdulto: [
    'Piscinas aquecidas o ano inteiro',
    'Limite de alunos por professor',
    'Professores especializados',
    '3 estacionamentos: 2 gratuitos colados na academia e 1 conveniado',
  ],
  academia: [
    'Atendimento personalizado, com poucos alunos por professor',
    'Musculação climatizada',
    'Sala de ginástica com diversas opções de aulas',
    'Professores especializados',
    '3 estacionamentos: 2 gratuitos colados na academia e 1 conveniado',
  ],
  kids: [
    'Número limitado de crianças por professor',
    'Vestiário infantil',
    '3 estacionamentos: 2 gratuitos colados na academia e 1 conveniado',
  ],
};

const meta: Omit<Modalidade, keyof Conteudo>[] = [
  // Bebê e Infantil em páginas separadas, igual à Vila Guilherme (pedido do Ide em 13/11/2026).
  {
    slug: 'natacao-bebe',
    nome: 'Natação Bebê',
    resumo: 'Adaptação ao meio líquido com acompanhante, para bebês de 6 a 48 meses.',
    categorias: ['agua'],
    // Sem foto de bebê no site antigo: usa a da natação infantil até a academia mandar uma.
    imagem: natacaoInfantil,
    diferenciais: DIF.aguaKids,
  },
  {
    slug: 'natacao-infantil',
    nome: 'Natação Infantil',
    resumo: 'Da adaptação ao meio líquido aos quatro estilos, com a Metodologia Aquativa.',
    categorias: ['agua'],
    imagem: natacaoInfantil,
    diferenciais: DIF.aguaKids,
  },
  {
    slug: 'natacao-adulto',
    nome: 'Natação Adulto',
    resumo: 'Fortalece o corpo, ajuda a emagrecer e tira a mente da rotina.',
    categorias: ['agua'],
    imagem: natacaoAdulto,
    diferenciais: DIF.aguaAdulto,
  },
  {
    slug: 'hidroginastica',
    nome: 'Hidroginástica',
    resumo: 'Baixo impacto e até 500 calorias por hora. Para todas as idades.',
    categorias: ['agua'],
    imagem: hidroginastica,
    diferenciais: DIF.aguaAdulto,
  },
  {
    slug: 'musculacao',
    nome: 'Musculação',
    resumo: 'Treino personalizado, com poucos alunos por professor.',
    categorias: ['academia'],
    imagem: musculacao,
    diferenciais: DIF.academia,
  },
  {
    slug: 'ginastica-2',
    nome: 'Ginástica',
    resumo: 'Aulas coletivas de ginástica, localizada, danças e jump. Para todas as idades.',
    categorias: ['academia'],
    imagem: ginastica,
    diferenciais: DIF.academia,
    aulas: [
      {
        id: 'localizada',
        nome: 'Ginástica Localizada',
        texto: 'Exercícios com movimentos repetitivos, focados em determinados grupos musculares e organizados em séries com pausas para o descanso. Define os músculos, melhora o condicionamento físico e pode gastar até 500 kcal por aula.',
        imagem: localizada,
      },
      {
        id: 'dancas',
        nome: 'Danças',
        texto: 'Com tantos estilos diferentes, o exercício vira diversão e nem dá para ver o tempo passar. É uma atividade aeróbica que pode gastar até 700 kcal por hora, diminui a tensão e ajuda a fazer novos amigos.',
        imagem: danca,
      },
      {
        id: 'jump',
        nome: 'Jump',
        texto: 'Aula animada numa mini cama elástica, de fácil execução e alto gasto calórico. Fortalece e tonifica glúteos, pernas e abdômen.',
        imagem: jump,
      },
    ],
  },
  {
    slug: 'funcional-kids',
    nome: 'Funcional Kids',
    resumo: 'Agachar, pular, correr: exercício lúdico para os pequenos.',
    categorias: ['kids'],
    imagem: funcionalKids,
    diferenciais: DIF.kids,
  },
];

const textos = conteudo as Record<string, Conteudo>;

export const modalidades: Modalidade[] = meta.map((m) => ({ ...textos[m.slug], ...m }));

export const categoriaNome: Record<Categoria, string> = {
  agua: 'Na água',
  academia: 'Academia',
  kids: 'Kids',
};

export const mensagemModalidade = (nome: string) =>
  `Olá! Gostaria de agendar uma aula experimental de ${nome}.`;
