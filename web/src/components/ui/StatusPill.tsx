type Status = "online" | "processing" | "offline";

const STATUS_CONFIG: Record<Status, { dot: string; text: string; bg: string }> = {
  online: { dot: "#0D7A4E", text: "Online", bg: "#E8F5EE" },
  processing: { dot: "#E67E22", text: "Processando", bg: "#FEF3E2" },
  offline: { dot: "#C0392B", text: "Offline", bg: "#FDECEA" },
};

interface StatusPillProps {
  status: Status;
}

export function StatusPill({ status }: StatusPillProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-sora"
      style={{ background: config.bg, color: config.dot }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ background: config.dot }}
      />
      {config.text}
    </span>
  );
}
