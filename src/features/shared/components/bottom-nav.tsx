const navItems = [
  { label: "Today", active: true },
  { label: "Calendar", active: false },
  { label: "Logs", active: false },
  { label: "Insights", active: false },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-4 mx-auto w-[calc(100%-2rem)] max-w-md rounded-full border border-white/60 bg-white/92 p-2 shadow-[0_18px_50px_rgba(34,27,40,0.12)] backdrop-blur">
      <ul className="grid grid-cols-4 gap-2">
        {navItems.map((item) => (
          <li key={item.label}>
            <button
              className={[
                "w-full rounded-full px-3 py-3 text-sm font-medium transition",
                item.active
                  ? "bg-accent text-white shadow-[0_10px_24px_rgba(169,52,86,0.24)]"
                  : "text-foreground/62 hover:bg-surface-muted",
              ].join(" ")}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
