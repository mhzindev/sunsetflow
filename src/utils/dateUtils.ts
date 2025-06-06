
/**
 * Utilitários de data corrigidos para timezone de Brasília (America/Sao_Paulo)
 */

/**
 * Cria uma data no timezone de Brasília
 */
const createBrasiliaDate = (date?: Date): Date => {
  const targetDate = date || new Date();
  // Criar data no timezone de Brasília usando Intl API
  const brasiliaTime = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(targetDate);
  
  // Retornar como Date object local
  return new Date(brasiliaTime + 'T12:00:00');
};

/**
 * Formata uma data para o formato YYYY-MM-DD no timezone de Brasília
 */
export const formatDateForDatabase = (date: Date): string => {
  console.log('formatDateForDatabase - Data recebida:', date);
  
  const brasiliaDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
  
  console.log('formatDateForDatabase - Data formatada (Brasília):', brasiliaDateStr);
  return brasiliaDateStr;
};

/**
 * Converte uma string de data do banco (YYYY-MM-DD) para um objeto Date
 */
export const parseDatabaseDate = (dateString: string): Date => {
  console.log('parseDatabaseDate - String recebida:', dateString);
  
  const [year, month, day] = dateString.split('-').map(Number);
  // Criar data no timezone local às 12:00 para evitar problemas de DST
  const localDate = new Date(year, month - 1, day, 12, 0, 0);
  
  console.log('parseDatabaseDate - Data criada:', localDate);
  return localDate;
};

/**
 * Retorna a data atual no formato YYYY-MM-DD no timezone de Brasília
 */
export const getCurrentDateForInput = (): string => {
  const brasiliaDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
  
  console.log('getCurrentDateForInput - Data atual Brasília:', brasiliaDateStr);
  return brasiliaDateStr;
};

/**
 * Converte uma data do banco para o formato de input HTML (YYYY-MM-DD)
 */
export const formatDateForInput = (dateString: string): string => {
  console.log('formatDateForInput - String recebida:', dateString);
  
  // Se já está no formato correto YYYY-MM-DD, retorna como está
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    console.log('formatDateForInput - Já está no formato correto:', dateString);
    return dateString;
  }
  
  // Se é uma data completa (com hora), pega apenas a parte da data
  if (dateString.includes('T')) {
    const datePart = dateString.split('T')[0];
    console.log('formatDateForInput - Extraída parte da data:', datePart);
    return datePart;
  }
  
  // Tenta fazer parse e formatar
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    const formatted = formatDateForDatabase(date);
    console.log('formatDateForInput - Data formatada:', formatted);
    return formatted;
  }
  
  console.warn('formatDateForInput - Formato de data não reconhecido:', dateString);
  return dateString;
};

/**
 * Formata uma data do banco para exibição (DD/MM/YYYY)
 */
export const formatDateForDisplay = (dateString: string): string => {
  const date = parseDatabaseDate(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Formata uma data para exibição (DD/MM/YYYY)
 */
export const formatDate = (dateString: string): string => {
  return formatDateForDisplay(dateString);
};

/**
 * Formata um valor para moeda brasileira
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Retorna timestamp atual para registros do banco em timezone de Brasília
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Retorna data atual no formato do banco (YYYY-MM-DD) 
 * Sempre usa a data local de Brasília
 */
export const getCurrentDate = (): string => {
  return getCurrentDateForInput();
};
