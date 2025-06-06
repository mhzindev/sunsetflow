
/**
 * Formata uma data para o formato YYYY-MM-DD garantindo que o dia selecionado seja preservado
 * independente do fuso horário
 */
export const formatDateForDatabase = (date: Date): string => {
  console.log('formatDateForDatabase - Data recebida:', date);
  console.log('formatDateForDatabase - Timezone offset:', date.getTimezoneOffset());
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const formattedDate = `${year}-${month}-${day}`;
  console.log('formatDateForDatabase - Data formatada:', formattedDate);
  
  return formattedDate;
};

/**
 * Converte uma string de data do banco (YYYY-MM-DD) para um objeto Date local
 */
export const parseDatabaseDate = (dateString: string): Date => {
  console.log('parseDatabaseDate - String recebida:', dateString);
  
  const [year, month, day] = dateString.split('-').map(Number);
  const localDate = new Date(year, month - 1, day);
  
  console.log('parseDatabaseDate - Data local criada:', localDate);
  
  return localDate;
};

/**
 * Retorna a data atual no formato YYYY-MM-DD para usar em inputs HTML
 * Garante que a data seja sempre local, sem conversão para UTC
 */
export const getCurrentDateForInput = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  const currentDate = `${year}-${month}-${day}`;
  console.log('getCurrentDateForInput - Data atual local:', currentDate);
  
  return currentDate;
};

/**
 * Converte uma data do banco para o formato de input HTML (YYYY-MM-DD)
 * Mantém a data local sem conversão para UTC
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
 * Retorna timestamp atual para registros do banco
 * Garante que seja sempre a data/hora local atual
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Retorna data atual no formato do banco (YYYY-MM-DD) 
 * Sempre usa a data local atual
 */
export const getCurrentDate = (): string => {
  return getCurrentDateForInput();
};
