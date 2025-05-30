
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  dateRange?: {
    start: string;
    end: string;
  };
  includeHeaders?: boolean;
  filename?: string;
}

export const exportToCSV = (data: any[], headers: string[], filename: string) => {
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header.toLowerCase().replace(' ', '')];
        return typeof value === 'string' ? `"${value}"` : value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (data: any[], headers: string[], filename: string, title: string) => {
  const pdf = new jsPDF();
  
  // Título
  pdf.setFontSize(16);
  pdf.text(title, 20, 20);
  
  // Data de geração
  pdf.setFontSize(10);
  pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
  
  // Tabela
  const tableData = data.map(row => 
    headers.map(header => {
      const value = row[header.toLowerCase().replace(' ', '')];
      return value?.toString() || '';
    })
  );

  (pdf as any).autoTable({
    head: [headers],
    body: tableData,
    startY: 40,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202] }
  });

  pdf.save(`${filename}.pdf`);
};

export const exportToExcel = (data: any[], headers: string[], filename: string) => {
  // Simulação de export Excel usando CSV com separador de tabulação
  const tsvContent = [
    headers.join('\t'),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header.toLowerCase().replace(' ', '')];
        return value?.toString() || '';
      }).join('\t')
    )
  ].join('\n');

  const blob = new Blob([tsvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xlsx`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
