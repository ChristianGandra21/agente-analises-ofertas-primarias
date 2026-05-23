import { Check, X } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/Badge";
import type { OfertaSchema } from "@/lib/types";

interface AtivoPreviewProps {
  ativo: OfertaSchema;
  side: "A" | "B";
}

export function AtivoPreview({ ativo, side }: AtivoPreviewProps) {
  const borderColor = side === "A" ? "#003087" : "#C8A951";

  return (
    <div
      className="bg-white border border-mono-200 rounded-lg p-4 space-y-2.5"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      <div className="flex items-center gap-2">
        {ativo.tipo && <Badge tipo={ativo.tipo} />}
        <span className="font-sora font-medium text-sm text-mono-900">
          {ativo.emissor}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <span className="font-dm-mono text-mono-600">Taxa</span>
        <span className="font-dm-mono font-medium text-green-600 text-right">
          {ativo.taxa_bruta ?? "—"}
        </span>

        <span className="font-dm-mono text-mono-600">Vencimento</span>
        <span className="font-dm-mono text-mono-600 text-right">
          {ativo.data_vencimento ?? "—"}
        </span>

        <span className="font-dm-mono text-mono-600">FGC</span>
        <span className="flex justify-end">
          {ativo.com_fgc ? (
            <span className="flex items-center gap-1 text-green-600 font-dm-mono">
              <Check size={12} weight="bold" /> Com cobertura
            </span>
          ) : (
            <span className="flex items-center gap-1 text-mono-300 font-dm-mono">
              <X size={12} weight="bold" /> Sem cobertura
            </span>
          )}
        </span>

        <span className="font-dm-mono text-mono-600">Emissor</span>
        <span className="font-sora text-mono-600 text-right">{ativo.emissor}</span>

        <span className="font-dm-mono text-mono-600">Fonte</span>
        <span className="font-sora text-mono-600 text-right">{ativo.fonte}</span>
      </div>
    </div>
  );
}
