export default function LoadingPage() {
  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
        <h1 className="text-xl font-bold text-slate-900">جاري التحميل...</h1>
        <p className="mt-3 text-sm text-slate-600">يرجى الانتظار قليلًا حتى تجهز الصفحة.</p>
        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-brand-500" />
        </div>
      </div>
    </div>
  );
}
