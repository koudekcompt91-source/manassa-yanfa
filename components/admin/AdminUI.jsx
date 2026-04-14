export function AdminCard({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card ${className}`}>
      {title ? (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
          </div>
          {action || null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function AdminToolbar({ children }) {
  return <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_auto_auto_auto]">{children}</div>;
}

export function AdminInput(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
        props.className || ""
      }`}
    />
  );
}

export function AdminSelect(props) {
  return (
    <select
      {...props}
      className={`rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
        props.className || ""
      }`}
    />
  );
}

export function AdminEmptyState({ title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">
      <p className="text-sm font-bold text-slate-700">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function AdminBadge({ children, tone = "slate" }) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-100 text-emerald-700"
      : tone === "warning"
      ? "bg-amber-100 text-amber-700"
      : tone === "brand"
      ? "bg-brand-100 text-brand-700"
      : "bg-slate-100 text-slate-700";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${toneClass}`}>{children}</span>;
}

export function AdminPageHeader({ title, subtitle, action }) {
  return <AdminCard title={title} subtitle={subtitle} action={action} />;
}

export function AdminSectionCard({ title, subtitle, action, children, className = "" }) {
  return (
    <AdminCard title={title} subtitle={subtitle} action={action} className={className}>
      {children}
    </AdminCard>
  );
}

export function AdminFormField({ label, children, className = "" }) {
  return (
    <label className={`space-y-1 text-sm text-slate-700 ${className}`}>
      <span className="font-semibold">{label}</span>
      {children}
    </label>
  );
}

export function AdminActionButton({ children, tone = "default", className = "", ...props }) {
  const toneClass =
    tone === "primary"
      ? "bg-brand-600 text-white hover:bg-brand-700"
      : tone === "danger"
      ? "border border-red-200 text-red-700 hover:bg-red-50"
      : "border border-slate-200 text-slate-700 hover:bg-slate-50";

  return (
    <button
      {...props}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${toneClass} ${className}`}
    >
      {children}
    </button>
  );
}

export function AdminListCard({ children, className = "" }) {
  return <article className={`rounded-xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm ${className}`}>{children}</article>;
}
