export default function ContactPage() {
  return (
    <section className="container-page py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">تواصل معنا</h1>
        <p className="mt-3 text-slate-600">
          فريق منصة ينفع جاهز لدعم رحلتك في الأدب العربي. لأي استفسار أكاديمي أو فني، يمكنك التواصل معنا عبر القنوات التالية.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">البريد الأكاديمي</p>
            <p className="mt-1 font-bold text-slate-900">contact@maerifah.app</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">مواعيد الدعم</p>
            <p className="mt-1 font-bold text-slate-900">الأحد - الخميس | 09:00 - 18:00</p>
          </div>
        </div>
      </div>
    </section>
  );
}
