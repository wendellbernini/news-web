import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Garante que uma data seja um objeto Date válido
 * @param date Data a ser validada (pode ser string, number, Date ou undefined)
 * @returns Date válida ou new Date() se inválida
 */
export function ensureDate(date: any): Date {
  if (date instanceof Date) return date;
  if (typeof date === 'string') return new Date(date);
  if (typeof date === 'number') return new Date(date);
  if (date?.seconds) return new Date(date.seconds * 1000);
  return new Date();
}

/**
 * Calcula o tempo estimado de leitura em minutos
 * @param content - Conteúdo do texto
 * @param wordsPerMinute - Palavras lidas por minuto (padrão: 200)
 * @returns Tempo estimado de leitura em minutos
 */
export function calculateReadTime(
  content: string,
  wordsPerMinute: number = 200
): number {
  // Remove caracteres especiais e quebras de linha
  const cleanText = content.replace(/[^\w\s]/g, '');

  // Conta o número de palavras
  const wordCount = cleanText.trim().split(/\s+/).length;

  // Calcula o tempo em minutos e arredonda para cima
  const minutes = Math.ceil(wordCount / wordsPerMinute);

  // Retorna no mínimo 1 minuto
  return Math.max(1, minutes);
}
