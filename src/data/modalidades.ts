import type { ImageMetadata } from 'astro';
import conteudo from './modalidades-conteudo.json';

import natacaoInfantil from '../assets/img/modalidades/natacao-infantil.jpg';
import natacaoAdulto from '../assets/img/modalidades/natacao-adulto.jpg';
import hidroginastica from '../assets/img/modalidades/hidroginastica.jpg';
import musculacao from '../assets/img/modalidades/musculacao.jpg';
import bikeIndoor from '../assets/img/modalidades/bike-indoor.jpg';
import pilates from '../assets/img/modalidades/pilates.jpg';
import danca from '../assets/img/modalidades/danca.jpg';
import jump from '../assets/img/modalidades/jump.jpg';
import condicionamento from '../assets/img/modalidades/condicionamento.jpg';
import funcionalKids from '../assets/img/modalidades/funcional-kids.jpg';
import ginastica from '../assets/img/modalidades/ginastica.jpg';
import localizada from '../assets/img/modalidades/ginastica-localizada.jpg';

export type Categoria = 'agua' | 'academia' | 'kids';

type Conteudo = {
  titulo: string;
  descricao: string;
  beneficios: { lista?: string[]; texto?: string };
};

export type Modalidade = Conteudo & {
  slug: string;
  nome: string;
  resumo: string;
  categorias: Categoria[];
  imagem: ImageMetadata;
  diferenciais: string[];
};

const DIF = {
  aguaKids: [
    'Metodologia Gustavo Borges',
    'Piscina infantil exclusiva, separada da piscina dos adultos',
    'Número limitado de crianças por professor',
    'Avaliação periódica do nível dos alunos',
    'Vestiário infantil',
    'Estacionamento com manobrista',
  ],
  aguaAdulto: [
    'Piscinas aquecidas o ano inteiro',
    '2 professores por piscina',
    'Avaliação periódica do nível dos alunos',
    'Duchas aquecidas',
    'Vestiários adultos com mais de 50 armários',
    'Estacionamento com manobrista',
  ],
  academia: [
    'Atendimento personalizado, com poucos alunos por professor',
    'Sala de ginástica com diversas opções de aulas',
    'Duchas aquecidas',
    'Vestiários adultos com mais de 50 armários',
    'Estacionamento com manobrista',
  ],
  kids: [
    'Número limitado de crianças por professor',
    'Vestiário infantil',
    'Duchas aquecidas',
    'Estacionamento com manobrista',
  ],
};

const meta: Omit<Modalidade, keyof Conteudo>[] = [
  {
    slug: 'natacao-bebe-infantil',
    nome: 'Natação Bebê e Infantil',
    resumo: 'Da adaptação ao meio líquido aos quatro estilos, com a Metodologia Gustavo Borges.',
    categorias: ['agua', 'kids'],
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
    slug: 'bike-indoor',
    nome: 'Bike Indoor',
    resumo: 'Pedalada em grupo ao ritmo de músicas motivacionais.',
    categorias: ['academia'],
    imagem: bikeIndoor,
    diferenciais: DIF.academia,
  },
  {
    slug: 'pilates',
    nome: 'Pilates',
    resumo: '3 alunos por aula, em ambiente climatizado.',
    categorias: ['academia'],
    imagem: pilates,
    diferenciais: ['3 alunos por aula, maximizando resultados', 'Ambiente climatizado', ...DIF.academia.slice(2)],
  },
  {
    slug: 'dancas',
    nome: 'Danças',
    resumo: 'Exercício que vira diversão: até 700 kcal por hora.',
    categorias: ['academia'],
    imagem: danca,
    diferenciais: DIF.academia,
  },
  {
    slug: 'jump',
    nome: 'Jump',
    resumo: 'Mini cama elástica, aula animada e alto gasto calórico.',
    categorias: ['academia'],
    imagem: jump,
    diferenciais: DIF.academia,
  },
  {
    slug: 'condicionamento',
    nome: 'Condicionamento Físico',
    resumo: 'Força, resistência e flexibilidade para o dia a dia.',
    categorias: ['academia'],
    imagem: condicionamento,
    diferenciais: DIF.academia,
  },
  {
    slug: 'funcional-kids',
    nome: 'Funcional Kids',
    resumo: 'Agachar, pular, correr: exercício lúdico para os pequenos.',
    categorias: ['kids'],
    imagem: funcionalKids,
    diferenciais: DIF.kids,
  },
  {
    slug: 'ginastica-2',
    nome: 'Ginástica',
    resumo: 'Aquece, alonga e tonifica em pouco tempo. Para todas as idades.',
    categorias: ['academia'],
    imagem: ginastica,
    diferenciais: DIF.academia,
  },
  {
    slug: 'local',
    nome: 'Ginástica Localizada',
    resumo: 'Músculos definidos e até 500 kcal por aula.',
    categorias: ['academia'],
    imagem: localizada,
    diferenciais: DIF.academia,
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
