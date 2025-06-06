
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export type SortOption = 'alphabetical' | 'newest' | 'oldest';

interface SortSelectorProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  label?: string;
  className?: string;
}

export const SortSelector = ({ 
  value, 
  onChange, 
  label = "Ordenar por",
  className 
}: SortSelectorProps) => {
  return (
    <div className={className}>
      <Label htmlFor="sort">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="sort">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="alphabetical">Ordem Alfabética</SelectItem>
          <SelectItem value="newest">Mais Recente</SelectItem>
          <SelectItem value="oldest">Mais Antigo</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
