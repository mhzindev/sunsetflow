
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Loader2 } from "lucide-react";
import { useAccessCode } from "@/hooks/useAccessCode";

interface AccessCodeModalProps {
  open: boolean;
  onSuccess: () => void;
  userEmail?: string;
}

export const AccessCodeModal = ({ open, onSuccess, userEmail }: AccessCodeModalProps) => {
  const [code, setCode] = useState('');
  const { useCode, loading } = useAccessCode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      return;
    }

    const result = await useCode(code.trim());
    
    if (result.success) {
      setCode('');
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Código de Acesso da Empresa
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border">
            <p className="text-sm text-blue-800">
              Para completar seu cadastro e ter acesso ao sistema, você precisa inserir o código de acesso fornecido pela sua empresa.
            </p>
            {userEmail && (
              <p className="text-xs text-blue-600 mt-2">
                Usuário: {userEmail}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="access-code">Código de Acesso</Label>
              <Input
                id="access-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Digite o código fornecido pela empresa"
                disabled={loading}
                className="uppercase"
                maxLength={30}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={loading || !code.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Usar Código
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="text-xs text-slate-500">
            <p>💡 Se você não possui um código de acesso, entre em contato com o administrador da sua empresa.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
