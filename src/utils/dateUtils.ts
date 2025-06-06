
/**
 * Utilitários de data corrigidos DEFINITIVAMENTE para timezone de Brasília (America/Sao_Paulo)
 * Versão 2.0 - Corrige TODOS os problemas de timezone
 */

/**
 * Obtém a data atual no timezone de Brasília
 */
const getBrasiliaDate = (): Date => {
  const now = new Date();
  
  // Converter para timezone de Brasília usando Intl API
  const brasiliaFormatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = brasiliaFormatter.formatToParts(now);
  const year = parseInt(parts.find(p => p.type === 'year')?.value || '0');
  const month = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1; // Month is 0-indexed
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '0');
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
  const second = parseInt(parts.find(p => p.type === 'second')?.value || '0');

  return new Date(year, month, day, hour, minute, second);
};

/**
 * Converte qualquer data para o timezone de Brasília
 */
const convertToBrasiliaTimezone = (date: Date): Date => {
  const brasiliaFormatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = brasiliaFormatter.formatToParts(date);
  const year = parseInt(parts.find(p => p.type === 'year')?.value || '0');
  const month = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1;
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '0');
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
  const second = parseInt(parts.find(p => p.type === 'second')?.value || '0');

  return new Date(year, month, day, hour, minute, second);
};

/**
 * Formata uma data para o formato YYYY-MM-DD no timezone de Brasília
 */
export const formatDateForDatabase = (date?: Date): string => {
  const targetDate = date || getBrasiliaDate();
  console.log('formatDateForDatabase - Data original:', targetDate);
  
  const brasiliaDate = convertToBrasiliaTimezone(targetDate);
  console.log('formatDateForDatabase - Data convertida para Brasília:', brasiliaDate);
  
  const year = brasiliaDate.getFullYear();
  const month = String(brasiliaDate.getMonth() + 1).padStart(2, '0');
  const day = String(brasiliaDate.getDate()).padStart(2, '0');
  
  const formatted = `${year}-${month}-${day}`;
  console.log('formatDateForDatabase - Data formatada:', formatted);
  
  return formatted;
};

/**
 * Converte uma string de data do banco (YYYY-MM-DD) para um objeto Date no timezone de Brasília
 */
export const parseDatabaseDate = (dateString: string): Date => {
  console.log('parseDatabaseDate - String recebida:', dateString);
  
  // Se é uma data ISO completa, parse diretamente
  if (dateString.includes('T')) {
    const isoDate = new Date(dateString);
    const brasiliaDate = convertToBrasiliaTimezone(isoDate);
    console.log('parseDatabaseDate - Data ISO convertida:', brasiliaDate);
    return brasiliaDate;
  }
  
  // Se é uma data no formato YYYY-MM-DD
  const [year, month, day] = dateString.split('-').map(Number);
  
  if (!year || !month || !day) {
    console.warn('parseDatabaseDate - Formato de data inválido:', dateString);
    return getBrasiliaDate();
  }
  
  // Criar data no timezone de Brasília (meio-dia para evitar problemas de DST)
  const brasiliaDate = new Date(year, month - 1, day, 12, 0, 0);
  
  console.log('parseDatabaseDate - Data criada:', brasiliaDate);
  return brasiliaDate;
};

/**
 * Retorna a data atual no formato YYYY-MM-DD no timezone de Brasília
 */
export const getCurrentDateForInput = (): string => {
  const brasiliaDate = getBrasiliaDate();
  console.log('getCurrentDateForInput - Data atual Brasília:', brasiliaDate);
  
  const year = brasiliaDate.getFullYear();
  const month = String(brasiliaDate.getMonth() + 1).padStart(2, '0');
  const day = String(brasiliaDate.getDate()).padStart(2, '0');
  
  const formatted = `${year}-${month}-${day}`;
  console.log('getCurrentDateForInput - Data formatada:', formatted);
  
  return formatted;
};

/**
 * Converte uma data do banco para o formato de input HTML (YYYY-MM-DD)
 */
export const formatDateForInput = (dateString: string): string => {
  console.log('formatDateForInput - String recebida:', dateString);
  
  // Se já está no formato correto YYYY-MM-DD
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
  try {
    const parsedDate = parseDatabaseDate(dateString);
    const formatted = formatDateForDatabase(parsedDate);
    console.log('formatDateForInput - Data formatada:', formatted);
    return formatted;
  } catch (error) {
    console.warn('formatDateForInput - Erro ao formatar data:', dateString, error);
    return getCurrentDateForInput();
  }
};

/**
 * Formata uma data para exibição (DD/MM/YYYY) - SEMPRE no timezone de Brasília
 */
export const formatDateForDisplay = (dateString: string): string => {
  try {
    const date = parseDatabaseDate(dateString);
    const brasiliaDate = convertToBrasiliaTimezone(date);
    
    const day = String(brasiliaDate.getDate()).padStart(2, '0');
    const month = String(brasiliaDate.getMonth() + 1).padStart(2, '0');
    const year = brasiliaDate.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.warn('formatDateForDisplay - Erro ao formatar data:', dateString, error);
    return '00/00/0000';
  }
};

/**
 * Alias para formatDateForDisplay
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
  const brasiliaDate = getBrasiliaDate();
  
  // Converter para ISO string mas mantendo o contexto de Brasília
  const year = brasiliaDate.getFullYear();
  const month = String(brasiliaDate.getMonth() + 1).padStart(2, '0');
  const day = String(brasiliaDate.getDate()).padStart(2, '0');
  const hours = String(brasiliaDate.getHours()).padStart(2, '0');
  const minutes = String(brasiliaDate.getMinutes()).padStart(2, '0');
  const seconds = String(brasiliaDate.getSeconds()).padStart(2, '0');
  
  // Offset de Brasília (UTC-3)
  const offset = '-03:00';
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offset}`;
};

/**
 * Retorna data atual no formato do banco (YYYY-MM-DD) - SEMPRE em Brasília
 */
export const getCurrentDate = (): string => {
  return formatDateForDatabase();
};

/**
 * Converte data de input HTML para formato do banco
 */
export const convertInputDateToDatabase = (inputDate: string): string => {
  console.log('convertInputDateToDatabase - Input recebido:', inputDate);
  
  if (!inputDate) {
    return getCurrentDate();
  }
  
  // Input já está no formato YYYY-MM-DD, só validar
  if (/^\d{4}-\d{2}-\d{2}$/.test(inputDate)) {
    console.log('convertInputDateToDatabase - Data válida:', inputDate);
    return inputDate;
  }
  
  console.warn('convertInputDateToDatabase - Formato inválido, usando data atual');
  return getCurrentDate();
};

/**
 * Verifica se uma data está no timezone correto de Brasília
 */
export const validateBrasiliaDate = (date: Date): boolean => {
  const brasiliaDate = convertToBrasiliaTimezone(date);
  const difference = Math.abs(date.getTime() - brasiliaDate.getTime());
  
  // Aceita diferença de até 1 minuto (60000ms)
  return difference <= 60000;
};

/**
 * Debug: mostra informações detalhadas sobre uma data
 */
export const debugDate = (date: Date | string, label: string = 'Debug'): void => {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const brasiliaDate = convertToBrasiliaTimezone(targetDate);
  
  console.group(`🗓️ ${label} - Debug de Data`);
  console.log('📅 Data original:', targetDate);
  console.log('🇧🇷 Data em Brasília:', brasiliaDate);
  console.log('📋 Formato banco:', formatDateForDatabase(targetDate));
  console.log('👁️ Formato exibição:', formatDateForDisplay(formatDateForDatabase(targetDate)));
  console.log('🕐 Timezone original:', targetDate.getTimezoneOffset());
  console.log('✅ Válida para Brasília:', validateBrasiliaDate(targetDate));
  console.groupEnd();
};
