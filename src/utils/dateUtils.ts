
/**
 * Formata uma data para o formato YYYY-MM-DD garantindo que o dia selecionado seja preservado
 * independente do fuso horário - CORRIGIDO para timezone de Brasília
 */
export const formatDateForDatabase = (date: Date): string => {
  console.log('formatDateForDatabase - Data recebida:', date);
  
  // Converter para timezone de Brasília (UTC-3)
  const brasiliaOffset = -3 * 60; // -3 horas em minutos
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const brasiliaTime = new Date(utc + (brasiliaOffset * 60000));
  
  const year = brasiliaTime.getFullYear();
  const month = String(brasiliaTime.getMonth() + 1).padStart(2, '0');
  const day = String(brasiliaTime.getDate()).padStart(2, '0');
  
  const formattedDate = `${year}-${month}-${day}`;
  console.log('formatDateForDatabase - Data formatada (Brasília):', formattedDate);
  
  return formattedDate;
};

/**
 * Converte uma string de data do banco (YYYY-MM-DD) para um objeto Date local de Brasília
 */
export const parseDatabaseDate = (dateString: string): Date => {
  console.log('parseDatabaseDate - String recebida:', dateString);
  
  const [year, month, day] = dateString.split('-').map(Number);
  // Criar data no timezone de Brasília
  const brasiliaDate = new Date(year, month - 1, day, 12, 0, 0); // Meio-dia para evitar problemas de DST
  
  console.log('parseDatabaseDate - Data Brasília criada:', brasiliaDate);
  
  return brasiliaDate;
};

/**
 * Retorna a data atual no formato YYYY-MM-DD para usar em inputs HTML
 * Garante que seja sempre a data local de Brasília
 */
export const getCurrentDateForInput = (): string => {
  const now = new Date();
  
  // Converter para timezone de Brasília
  const brasiliaOffset = -3 * 60; // -3 horas em minutos
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const brasiliaTime = new Date(utc + (brasiliaOffset * 60000));
  
  const year = brasiliaTime.getFullYear();
  const month = String(brasiliaTime.getMonth() + 1).padStart(2, '0');
  const day = String(brasiliaTime.getDate()).padStart(2, '0');
  
  const currentDate = `${year}-${month}-${day}`;
  console.log('getCurrentDateForInput - Data atual Brasília:', currentDate);
  
  return currentDate;
};

/**
 * Converte uma data do banco para o formato de input HTML (YYYY-MM-DD)
 * Mantém a data local de Brasília sem conversão para UTC
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
  const now = new Date();
  
  // Converter para timezone de Brasília
  const brasiliaOffset = -3 * 60; // -3 horas em minutos
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const brasiliaTime = new Date(utc + (brasiliaOffset * 60000));
  
  return brasiliaTime.toISOString();
};

/**
 * Retorna data atual no formato do banco (YYYY-MM-DD) 
 * Sempre usa a data local de Brasília
 */
export const getCurrentDate = (): string => {
  return getCurrentDateForInput();
};
