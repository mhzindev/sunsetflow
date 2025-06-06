
/**
 * Utilitários de data corrigidos DEFINITIVAMENTE para timezone de Brasília (America/Sao_Paulo)
 * Versão 3.0 - Corrige TODOS os problemas de timezone incluindo created_at
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
 * Converte qualquer data UTC para o timezone de Brasília - FUNÇÃO CRÍTICA
 * Esta função é usada para corrigir datas created_at vindas do banco
 */
export const convertToBrasiliaTimezone = (date: Date): Date => {
  if (!date || isNaN(date.getTime())) {
    console.warn('convertToBrasiliaTimezone: Data inválida recebida:', date);
    return getBrasiliaDate();
  }

  try {
    // Usar Intl.DateTimeFormat para converter corretamente para Brasília
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

    const brasiliaDate = new Date(year, month, day, hour, minute, second);
    
    console.log('convertToBrasiliaTimezone:', {
      original: date.toISOString(),
      converted: brasiliaDate.toISOString(),
      formatted: `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`
    });

    return brasiliaDate;
  } catch (error) {
    console.error('Erro em convertToBrasiliaTimezone:', error);
    return getBrasiliaDate();
  }
};

/**
 * Converte uma string de data UTC (do banco) para Date no timezone de Brasília
 * Usado especificamente para campos created_at, updated_at vindos do Supabase
 */
export const parseUTCStringToBrasilia = (utcString: string): Date => {
  if (!utcString) {
    console.warn('parseUTCStringToBrasilia: String vazia recebida');
    return getBrasiliaDate();
  }

  try {
    // Parse da string UTC para Date object
    const utcDate = new Date(utcString);
    
    if (isNaN(utcDate.getTime())) {
      console.warn('parseUTCStringToBrasilia: String de data inválida:', utcString);
      return getBrasiliaDate();
    }

    // Converter para Brasília
    return convertToBrasiliaTimezone(utcDate);
  } catch (error) {
    console.error('Erro em parseUTCStringToBrasilia:', error);
    return getBrasiliaDate();
  }
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
  
  // Se é uma data ISO completa, parse diretamente e converter timezone
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
 * Formata created_at/updated_at vindos do Supabase (UTC) para exibição em Brasília
 * Função específica para timestamps do banco que incluem hora
 */
export const formatCreatedAtForDisplay = (utcString: string): string => {
  if (!utcString) return 'N/A';
  
  try {
    const brasiliaDate = parseUTCStringToBrasilia(utcString);
    
    const day = String(brasiliaDate.getDate()).padStart(2, '0');
    const month = String(brasiliaDate.getMonth() + 1).padStart(2, '0');
    const year = brasiliaDate.getFullYear();
    const hours = String(brasiliaDate.getHours()).padStart(2, '0');
    const minutes = String(brasiliaDate.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.warn('formatCreatedAtForDisplay - Erro ao formatar:', utcString, error);
    return 'Data inválida';
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

/**
 * Utilitário para testar conversão de timezone com exemplos
 */
export const testTimezoneConversion = (): void => {
  console.group('🧪 Teste de Conversão de Timezone');
  
  // Exemplo de data UTC do banco
  const utcExample = '2025-06-06T01:00:00Z';
  console.log('Exemplo UTC do banco:', utcExample);
  
  const converted = parseUTCStringToBrasilia(utcExample);
  console.log('Convertido para Brasília:', converted);
  console.log('Formatado para exibição:', formatCreatedAtForDisplay(utcExample));
  
  console.groupEnd();
};
