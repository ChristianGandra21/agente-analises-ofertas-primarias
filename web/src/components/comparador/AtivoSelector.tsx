"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { useState, useMemo } from "react";
import type { OfertaSchema } from "@/lib/types";

const TIPOS = ["Todos", "CDB", "CRA", "CRI", "LCI", "LCA", "DEB"];
const INDEXADORES = ["Todos", "CDI+", "IPCA+", "Prefixado", "Selic"];
const INSTITUICOES = ["Todas", "BTG", "XP", "Itaú", "Bradesco", "Santander"];

interface AtivoSelectorProps {
  label: "A" | "B";
  onSelect: (oferta: OfertaSchema) => void;
}

const MOCK_ATIVOS: OfertaSchema[] = [
  { id: 1, fonte: "BTG", emissor: "BTG Pactual", instituicao: "BTG", nome: "CDB BTG Pactual CDI+", tipo: "CDB", indexador: "CDI+", taxa_bruta: "CDI + 1,85%", taxa_valor: 14.80, data_vencimento: "abr/2030", com_fgc: true, isento_ir: false },
  { id: 2, fonte: "XP", emissor: "XP Investimentos", instituicao: "XP", nome: "CDB XP CDI+", tipo: "CDB", indexador: "CDI+", taxa_bruta: "CDI + 1,40%", taxa_valor: 13.20, data_vencimento: "mar/2030", com_fgc: true, isento_ir: false },
  { id: 3, fonte: "Itaú", emissor: "Itaú Unibanco", instituicao: "Itaú", nome: "CDB Itaú IPCA+", tipo: "CDB", indexador: "IPCA+", taxa_bruta: "IPCA + 11,50%", taxa_valor: 11.50, data_vencimento: "dez/2031", com_fgc: true, isento_ir: false },
  { id: 4, fonte: "BTG", emissor: "BR Properties", instituicao: "BTG", nome: "CRI BR Properties IPCA+", tipo: "CRI", indexador: "IPCA+", taxa_bruta: "IPCA + 11,00%", taxa_valor: 11.00, data_vencimento: "mar/2032", com_fgc: false, isento_ir: false },
  { id: 5, fonte: "XP", emissor: "Rumo Logística", instituicao: "XP", nome: "CRA Rumo CDI+", tipo: "CRA", indexador: "CDI+", taxa_bruta: "CDI + 1,50%", taxa_valor: 14.20, data_vencimento: "set/2028", com_fgc: false, isento_ir: false },
  { id: 6, fonte: "BTG", emissor: "Caixa Econômica", instituicao: "BTG", nome: "LCI Caixa CDI+", tipo: "LCI", indexador: "CDI+", taxa_bruta: "CDI + 1,10%", taxa_valor: 10.80, data_vencimento: "out/2027", com_fgc: true, isento_ir: true },
  { id: 7, fonte: "Bradesco", emissor: "Bradesco", instituicao: "Bradesco", nome: "CDB Bradesco Pré", tipo: "CDB", indexador: "Prefixado", taxa_bruta: "13,95%", taxa_valor: 13.95, data_vencimento: "jan/2029", com_fgc: true, isento_ir: false },
  { id: 8, fonte: "Santander", emissor: "Santander", instituicao: "Santander", nome: "CDB Santander CDI+", tipo: "CDB", indexador: "CDI+", taxa_bruta: "CDI + 1,25%", taxa_valor: 12.50, data_vencimento: "jun/2030", com_fgc: true, isento_ir: false },
  { id: 9, fonte: "BTG", emissor: "Vale S.A.", instituicao: "BTG", nome: "DEB Vale CDI+", tipo: "DEB", indexador: "CDI+", taxa_bruta: "CDI + 1,70%", taxa_valor: 13.20, data_vencimento: "jun/2029", com_fgc: false, isento_ir: false },
  { id: 10, fonte: "XP", emissor: "EcoRodovias", instituicao: "XP", nome: "CRA EcoRodovias IPCA+", tipo: "CRA", indexador: "IPCA+", taxa_bruta: "IPCA + 10,50%", taxa_valor: 10.50, data_vencimento: "nov/2030", com_fgc: false, isento_ir: false },
  { id: 11, fonte: "Itaú", emissor: "Itaú Unibanco", instituicao: "Itaú", nome: "LCA Itaú CDI+", tipo: "LCA", indexador: "CDI+", taxa_bruta: "CDI + 1,05%", taxa_valor: 10.20, data_vencimento: "fev/2028", com_fgc: true, isento_ir: true },
  { id: 12, fonte: "Bradesco", emissor: "Bradesco", instituicao: "Bradesco", nome: "LCI Bradesco CDI+", tipo: "LCI", indexador: "CDI+", taxa_bruta: "CDI + 1,00%", taxa_valor: 9.80, data_vencimento: "ago/2028", com_fgc: true, isento_ir: true },
];

export function AtivoSelector({ label, onSelect }: AtivoSelectorProps) {
  const [query, setQuery] = useState("");
  const [tipo, setTipo] = useState("Todos");
  const [indexador, setIndexador] = useState("Todos");
  const [instituicao, setInstituicao] = useState("Todas");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return MOCK_ATIVOS.filter((a) => {
      if (tipo !== "Todos" && a.tipo !== tipo) return false;
      if (indexador !== "Todos" && a.indexador !== indexador) return false;
      if (instituicao !== "Todas" && a.instituicao !== instituicao) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          (a.nome?.toLowerCase().includes(q)) ||
          (a.emissor?.toLowerCase().includes(q)) ||
          (a.instituicao?.toLowerCase().includes(q))
        );
      }
      return true;
    }).slice(0, 8);
  }, [tipo, indexador, instituicao, query]);

  return (
    <div className="flex flex-col gap-3">
      <p className="font-dm-mono text-[10px] uppercase tracking-widest text-mono-600">
        ATIVO {label}
      </p>

      <div className="flex flex-wrap gap-2">
        <select
          value={tipo}
          onChange={(e) => { setTipo(e.target.value); setOpen(true); }}
          className="font-sora text-xs text-mono-900 bg-mono-50 border border-mono-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-btg-800 focus:ring-2 focus:ring-btg-800/20"
        >
          {TIPOS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select
          value={indexador}
          onChange={(e) => { setIndexador(e.target.value); setOpen(true); }}
          className="font-sora text-xs text-mono-900 bg-mono-50 border border-mono-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-btg-800 focus:ring-2 focus:ring-btg-800/20"
        >
          {INDEXADORES.map((i) => <option key={i}>{i}</option>)}
        </select>
        <select
          value={instituicao}
          onChange={(e) => { setInstituicao(e.target.value); setOpen(true); }}
          className="font-sora text-xs text-mono-900 bg-mono-50 border border-mono-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-btg-800 focus:ring-2 focus:ring-btg-800/20"
        >
          {INSTITUICOES.map((i) => <option key={i}>{i}</option>)}
        </select>
      </div>

      <div className="relative">
        <MagnifyingGlass
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-300"
        />
        <input
          type="text"
          placeholder="Buscar ativo..."
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-mono-50 border border-mono-200 rounded-md py-2.5 pl-9 pr-3 font-sora text-[13px] text-mono-900 placeholder-mono-300 focus:outline-none focus:border-btg-800 focus:ring-2 focus:ring-btg-800/20"
        />

        {open && filtered.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-mono-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
            {filtered.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  onSelect(a);
                  setOpen(false);
                  setQuery("");
                }}
                className="w-full text-left px-3 py-2.5 font-sora text-[13px] text-mono-900 border-b border-mono-200 last:border-b-0 hover:bg-[#F2F5FC] transition-colors"
              >
                <span className="font-medium">{a.tipo}</span>{" "}
                {a.emissor}{" "}
                <span className="text-mono-600">{a.indexador}</span>{" "}
                <span className="text-green-600 font-dm-mono">{a.taxa_bruta}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
