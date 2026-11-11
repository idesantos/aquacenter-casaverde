// Dados institucionais — fonte única. Tudo que aparece em mais de uma página mora aqui.

export const site = {
  nome: 'Aquacenter Casa Verde',
  nomeCurto: 'Aquacenter',
  desde: 1991,
  slogan: 'Uma academia para toda a família',
  descricao:
    'A Aquacenter atua no ramo esportivo desde 1991, atendendo ao público de todas as idades, com profissionais qualificados e atendimento personalizado. Nossas piscinas são aquecidas o ano inteiro e em ambiente amplo garantindo conforto para os nossos alunos.',
  endereco: {
    rua: 'Rua Bernardino Fanganiello, 201',
    bairro: 'Casa Verde',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '02512-000',
    lat: -23.5132839,
    lng: -46.6578728,
  },
  telefone: { exibicao: '(11) 3966-8331', link: 'tel:+551139668331' },
  whatsapp: { exibicao: '(11) 94867-5274', numero: '5511948675274' },
  // O site antigo não informa e-mail; com o campo vazio, os blocos de e-mail somem.
  email: '',
  instagram: 'https://www.instagram.com/aquacentercasaverde/',
  facebook: 'https://www.facebook.com/aquacentercasaverde',
  mapsRota:
    'https://www.google.com/maps/dir/?api=1&destination=Rua+Bernardino+Fanganiello,+201+-+Casa+Verde,+S%C3%A3o+Paulo+-+SP,+02512-000',
  mapsEmbed:
    'https://maps.google.com/maps?q=Rua%20Bernardino%20Fanganiello%2C%20201%20-%20Casa%20Verde%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%2002512-000&t=m&z=16&output=embed&iwloc=near',
};

// Funcionamento: dia da semana (0 = domingo) → [abre, fecha] em minutos.
export const funcionamento = {
  linhas: [
    { dias: 'Segunda a Sexta', horario: '06:30 às 22:00' },
    { dias: 'Sábado', horario: '08:00 às 12:00' },
    { dias: 'Domingo', horario: 'Fechado' },
  ],
  porDia: {
    0: null,
    1: [390, 1320],
    2: [390, 1320],
    3: [390, 1320],
    4: [390, 1320],
    5: [390, 1320],
    6: [480, 720],
  } as Record<number, [number, number] | null>,
};

export const MSG_AULA_GRATIS =
  'Olá! Gostaria de mais informação sobre dias e horários disponíveis para minha aula grátis';

export const MSG_INFO_ACADEMIA = 'Olá! Gostaria de mais informações da academia.';

export function whatsappLink(mensagem: string = MSG_AULA_GRATIS) {
  return `https://api.whatsapp.com/send?phone=${site.whatsapp.numero}&text=${encodeURIComponent(mensagem)}`;
}

export const diferenciaisAcademia = [
  'Know-how de mais de 30 anos no mercado',
  'Estacionamento com manobrista',
  'Metodologia Aquativa, própria e validada há mais de 20 anos',
  'Espaço da piscina com pé-direito alto, proporcionando amplitude e conforto',
  'Duas piscinas, uma para adultos e outra para crianças',
  '2 professores por piscina',
  'Vestiário infantil',
  'Vestiários adultos com mais de 50 armários',
  'Duchas aquecidas',
];

export const sobre = {
  titulo: 'Uma academia para toda a família!',
  paragrafos: [
    'A Aquacenter atua no ramo esportivo desde 1991, atendendo ao público de todas as idades, com profissionais qualificados e atendimento personalizado. Nossas piscinas são aquecidas o ano inteiro e em ambiente amplo garantindo conforto para os nossos alunos. Temos vestiários masculino, feminino e infantil.',
    'Nossa sala de musculação é pensada para atendimento personalizado, trabalhamos com poucos alunos por professor e também temos uma sala de ginástica com diversas opções de aulas.',
  ],
  missao:
    'Oferecer o que há de melhor na prática e aprendizagem de esportes aquáticos, ou apenas para relaxamento e diversão.',
  valores: [
    'Atendimento de qualidade',
    'Pontualidade',
    'Ambiente agradável e familiar',
    'Respeito aos alunos e atendimento humanizado',
  ],
};

export const planos = [
  { nome: 'Adulto piscina', destaque: 'Pode tudo', publico: 'Adulto' },
  { nome: 'Adulto musculação e ginástica', destaque: 'Academia completa', publico: 'Adulto' },
  { nome: 'Natação infantil', destaque: '2x na semana', publico: 'Infantil' },
  { nome: 'Natação bebê', destaque: 'Horários livres', publico: 'Bebê' },
];
