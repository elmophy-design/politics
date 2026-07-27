const stats = [
  { value: "48", label: "Wards Represented", unit: "wards" },
  { value: "120+", label: "Constituency Projects Logged" },
  { value: "3,400+", label: "Registered Volunteers" },
  { value: "₦0", label: "Raised Transparently", note: "updates live from the donation ledger" },
];

export function ImpactStrip() {
  return (
    <section className="bg-ink-900 py-16 text-parchment-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border-l border-parchment-100/15 pl-6">
            <p className="font-mono text-3xl font-medium text-gold-300">{stat.value}</p>
            <p className="mt-2 text-sm text-parchment-100/70">{stat.label}</p>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-10 max-w-6xl px-6 font-mono text-[11px] uppercase tracking-[0.18em] text-parchment-100/40">
        Figures shown are placeholders — connect the Admin Dashboard to display live numbers.
      </p>
    </section>
  );
}
