const SUGGESTED = [
  "Quais CRAs estão disponíveis?",
  "Como está a Selic?",
  "Compare CDB BTG vs XP",
  "Qual o cenário macro atual?",
  "Quais ofertas têm FGC?",
  "Melhores taxas IPCA+ disponíveis",
];

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {SUGGESTED.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="px-3 py-1.5 rounded-full text-xs font-sora bg-[#E8EEF8] text-btg-800 border border-[#E8EEF8] hover:bg-btg-800 hover:text-white transition-all duration-150"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
