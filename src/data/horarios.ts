// Grades de turmas por modalidade. O site antigo da Casa Verde não publica uma grade
// própria (a imagem de horários dele é a da Vila Guilherme), então a lista começa vazia:
// o site mostra o funcionamento e manda consultar as turmas pelo WhatsApp.
// Quando a academia passar a grade, preencha `grades` seguindo o tipo abaixo.
// `dias` usa 0 = domingo … 6 = sábado.

export type Turno = 'Manhã' | 'Tarde' | 'Noite';
export type Aula = { hora: string; dias?: number[]; diasTexto?: string; turma?: string };
export type Grade = {
  id: string;
  titulo: string;
  publico?: string;
  modalidades: string[]; // slugs das páginas de modalidade que mostram esta grade
  aulas?: Aula[];
  faixa?: { texto: string; dias: number[]; inicio: string; fim: string }[];
  observacoes?: string[];
};

const SEG_SEX = [1, 2, 3, 4, 5];
// Turnos: manhã até 12:30, tarde até 17:00, noite a partir de 17:45.
const turno = (h: string): Turno => (h <= '12:30' ? 'Manhã' : h <= '17:00' ? 'Tarde' : 'Noite');

export const grades: Grade[] = [];

export const turnoDe = turno;
export const diasEfetivos = (a: Aula) => a.dias ?? SEG_SEX;
