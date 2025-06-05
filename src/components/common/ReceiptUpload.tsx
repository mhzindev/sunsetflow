
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, FileImage } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToastFeedback } from '@/hooks/useToastFeedback';

interface ReceiptUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  label?: string;
}

export const ReceiptUpload = ({ value, onChange, label = "Comprovante" }: ReceiptUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const { user } = useAuth();
  const { showSuccess, showError } = useToastFeedback();

  const uploadReceipt = async (file: File) => {
    if (!user) {
      showError('Erro', 'Usuário não autenticado');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(fileName, file);

      if (error) {
        console.error('Erro no upload:', error);
        showError('Erro', 'Falha no upload do comprovante');
        return;
      }

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(data.path);

      console.log('Comprovante enviado:', urlData.publicUrl);
      setPreview(urlData.publicUrl);
      onChange(urlData.publicUrl);
      showSuccess('Sucesso', 'Comprovante enviado com sucesso!');
    } catch (error) {
      console.error('Erro no upload:', error);
      showError('Erro', 'Erro inesperado no upload');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      showError('Erro', 'Por favor, selecione apenas arquivos de imagem');
      return;
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Erro', 'Arquivo muito grande. Máximo 5MB');
      return;
    }

    uploadReceipt(file);
  };

  const removeReceipt = () => {
    setPreview(null);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {preview ? (
        <div className="relative">
          <div className="flex items-center space-x-2 p-3 border border-green-200 bg-green-50 rounded-lg">
            <FileImage className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-700 flex-1">Comprovante anexado</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeReceipt}
              className="text-red-600 hover:text-red-700 h-auto p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="mt-2">
            <img 
              src={preview} 
              alt="Comprovante" 
              className="max-w-full h-32 object-cover rounded border cursor-pointer"
              onClick={() => window.open(preview, '_blank')}
            />
          </div>
        </div>
      ) : (
        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id="receipt-upload"
          />
          <Label
            htmlFor="receipt-upload"
            className="flex items-center justify-center space-x-2 p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <Upload className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">
              {uploading ? 'Enviando...' : 'Clique para anexar comprovante'}
            </span>
          </Label>
        </div>
      )}
    </div>
  );
};
