import { Check, X } from "@phosphor-icons/react";
import { Badge } from "./Badge";

interface Oferta {
  emissor: string;
  tipo: string;
  indexador: string;
  taxa: number;
  vencimento: string;
  fonte: string;
  com_fgc: boolean;
}

function taxaColor(valor: number): string {
  if (valor >= 14) return "#0D7A4E";
  if (valor >= 11) return "#C8A951";
  return "#6B6E7A";
}

interface OfertasTableProps {
  data: Oferta[];
}

export function OfertasTable({ data }: OfertasTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            {["EMISSOR", "TIPO", "INDEXADOR", "TAXA", "VENCIMENTO", "FONTE", "FGC"].map(
              (h) => (
                <th
                  key={h}
                  className="font-dm-mono text-[10px] uppercase text-mono-600 tracking-widest bg-white border-b-2 border-btg-800 px-4 py-2.5"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className={`transition-colors duration-150 ${
                i % 2 === 0 ? "bg-white" : "bg-mono-50"
              } hover:bg-[#F2F5FC] border-b border-mono-200`}
            >
              <td className="font-sora font-medium text-[13px] text-mono-900 px-4 py-3">
                {row.emissor}
              </td>
              <td className="px-4 py-3">
                <Badge tipo={row.tipo} />
              </td>
              <td className="font-sora text-xs text-mono-600 px-4 py-3">
                {row.indexador}
              </td>
              <td
                className="font-dm-mono font-medium text-[13px] px-4 py-3"
                style={{ color: taxaColor(row.taxa) }}
              >
                {row.taxa.toFixed(2)}%
              </td>
              <td className="font-dm-mono text-xs text-mono-600 px-4 py-3">
                {row.vencimento}
              </td>
              <td className="font-sora text-xs text-mono-600 px-4 py-3">
                {row.fonte}
              </td>
              <td className="px-4 py-3">
                {row.com_fgc ? (
                  <Check size={14} weight="bold" className="text-green-600" />
                ) : (
                  <X size={14} weight="bold" className="text-mono-300" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
