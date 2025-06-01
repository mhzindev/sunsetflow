
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
 * Formata uma data do banco para exibição (DD/MM/YYYY)
 */
export const formatDateForDisplay = (dateString: string): string => {
  const date = parseDatabaseDate(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};
