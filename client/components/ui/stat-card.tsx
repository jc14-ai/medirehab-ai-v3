export function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="card" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "20px" }}>
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          backgroundColor: "var(--color-primary-soft)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-primary)",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <h3 style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-secondary)", margin: "0 0 4px 0" }}>
          {title}
        </h3>
        <p style={{ fontSize: "24px", fontWeight: 700, color: "var(--color-text-primary)", margin: 0, lineHeight: 1 }}>
          {value}
        </p>
      </div>
    </div>
  );
}
