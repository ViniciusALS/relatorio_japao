interface StatusBadgeProps {
  status: "active" | "inactive" | "pending" | "generated" | "sent";
}

const config: Record<string, { label: string; className: string }> = {
  active: { label: "Ativo", className: "bg-status-active/10 text-status-active" },
  inactive: { label: "Inativo", className: "bg-status-inactive/10 text-status-inactive" },
  pending: { label: "Pendente", className: "bg-status-warning/10 text-status-warning" },
  generated: { label: "Gerado", className: "bg-accent/10 text-accent" },
  sent: { label: "Enviado", className: "bg-status-active/10 text-status-active" },
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
