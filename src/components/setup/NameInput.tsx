import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onRemove?: () => void;
  placeholder?: string;
}

export default function NameInput({ value, onChange, onRemove, placeholder }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
      />
      {onRemove && (
        <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label="Remove">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
