import Link from "next/link";

const container = "container-landing";

function IconLive(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function IconUser(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function IconShield(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function IconBook(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.245.477-4.5 1.253" />
    </svg>
  );
}

function IconStar(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export default function HomeLanding() {
  return (
    <div className="bg-slate-50 text-slate-900">
      <section
        id="hero"
        aria-labelledby="hero-title"
        className="relative overflow-hidden border-b border-slate-800/40 bg-slate-950 bg-hero-mesh"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/80 to-slate-950" />
        <div className="pointer-events-none absolute -top-24 -start-32 h-96 w-96 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -end-40 h-[28rem] w-[28rem] rounded-full bg-indigo-600/20 blur-3xl" />

        <div className={`${container} relative py-20 sm:py-24 lg:py-28`}>
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-2 text-sm font-medium text-slate-200 backdrop-blur-sm">
              <span className="size-2 shrink-0 rounded-full bg-emerald-400" />
              تحضير البكالوريا — مسار واضح من البداية للامتحان
            </p>
            <h1
              id="hero-title"
              className="text-balance text-3xl font-extrabold leading-[1.12] text-white sm:text-4xl md:text-5xl lg:text-[3.35rem]"
            >
              تعلّم بثقة مع{" "}
              <span className="bg-gradient-to-l from-sky-300 via-brand-300 to-indigo-300 bg-clip-text text-transparent">
                منصة ينفع
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
              منصة عربية للتعلم عن بُعد: دروس مباشرة، تمارين مصححة، ومتابعة تشجعك على الانتظام — بأسلوب هادئ ومنظم
              يناسب ضغط البكالوريا.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-base font-bold text-slate-900 no-underline shadow-xl shadow-slate-950/30 transition hover:bg-slate-100"
              >
                ابدأ الآن
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center justify-center rounded-2xl border border-white/25 bg-white/5 px-8 py-4 text-base font-semibold text-white no-underline backdrop-blur-sm transition hover:bg-white/10"
              >
                تصفّح الدورات
              </Link>
            </div>
            <p className="mt-8 text-sm text-slate-400">يمكنك تجربة المحتوى والتأكد من الأسلوب قبل الالتزام.</p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200/90 bg-white py-16 sm:py-20" aria-labelledby="features-title">
        <div className={container}>
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="features-title" className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
              لماذا منصة ينفع؟
            </h2>
            <p className="mt-3 text-slate-600 sm:text-lg">ثلاثة محاور نركز عليها يوميًا مع كل طالب.</p>
          </div>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <li className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-6 shadow-card transition hover:border-brand-200 hover:shadow-card-hover">
              <div className="inline-flex rounded-xl bg-gradient-to-br from-sky-500 to-brand-600 p-3 text-white shadow-md">
                <IconLive className="size-7" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">دروس مباشرة</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                حصص تفاعلية مع إمكانية طرح الأسئلة أثناء الشرح لتثبيت الفكرة مباشرة.
              </p>
            </li>
            <li className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-6 shadow-card transition hover:border-brand-200 hover:shadow-card-hover">
              <div className="inline-flex rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 p-3 text-white shadow-md">
                <IconUser className="size-7" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">متابعة شخصية</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                تغذية راجعة على التقدم ونصائح بسيطة تساعدك توزّع وقتك على ما يفيدك أكثر.
              </p>
            </li>
            <li className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-6 shadow-card transition hover:border-brand-200 hover:shadow-card-hover sm:col-span-2 lg:col-span-1">
              <div className="inline-flex rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3 text-white shadow-md">
                <IconShield className="size-7" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">نتائج مضمونة بجهدك</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                خطة تمارين ومراجعات منتظمة مصممة لتقوية النقاط الضعيفة قبل موعد الامتحان.
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section className="border-b border-slate-200/90 bg-slate-50 py-16 sm:py-20" aria-labelledby="journey-title">
        <div className={container}>
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="journey-title" className="text-2xl font-extrabold text-slate-900 sm:text-3xl md:text-4xl">
              رحلتك في ثلاث خطوات
            </h2>
            <p className="mt-3 text-slate-600 sm:text-lg">سجّل، تعلّم على إيقاعك، ثم ادخل الامتحان وأنت مطمئن أكثر.</p>
          </div>
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { n: "١", t: "سجّل", d: "أنشئ حسابك واختر المسار والمادة التي تناسب مستواك." },
              { n: "٢", t: "تعلّم", d: "احضر الحصص، راجع الملخصات، وحل التمارين مع التصحيح." },
              { n: "٣", t: "انجح", d: "تابع تقارير التقدم وركّز على المراجعة النهائية بثقة." },
            ].map((step) => (
              <li key={step.n} className="relative flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-card">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                  <IconBook className="size-8" />
                </span>
                <span className="mt-4 flex size-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {step.n}
                </span>
                <h3 className="mt-3 text-lg font-bold text-slate-900">{step.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-slate-800/50 bg-slate-950 py-14 sm:py-16" aria-label="أرقام المنصة">
        <div className={container}>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { v: "+5000", l: "طالب", s: "انضمّوا لمساراتنا" },
              { v: "+95%", l: "رضا وتقييم إيجابي", s: "وفق استبيانات ما بعد الحصص" },
              { v: "+200", l: "درسًا منظمًا", s: "محتوى متجدد عبر المواد" },
            ].map((row) => (
              <div
                key={row.l}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-8 text-center backdrop-blur-sm"
              >
                <p className="text-3xl font-black text-white sm:text-4xl">{row.v}</p>
                <p className="mt-2 text-base font-bold text-brand-200">{row.l}</p>
                <p className="mt-2 text-sm text-slate-400">{row.s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200/90 bg-white py-16 sm:py-20" aria-labelledby="reviews-title">
        <div className={container}>
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="reviews-title" className="text-2xl font-extrabold text-slate-900 sm:text-3xl md:text-4xl">
              آراء الطلاب
            </h2>
            <p className="mt-3 text-slate-600 sm:text-lg">تجارب مختصرة من زملائك في البكالوريا.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                name: "ياسمين العلوي",
                role: "علوم فيزيائية",
                q: "الشرح واضح والحصص المباشرة ساعدتني أرتّب المراجعة بدل العشوائية.",
              },
              {
                name: "أمين بنجلون",
                role: "علوم رياضية",
                q: "التمارين بعد كل درس كانت مفتاحًا؛ عرفت أين أغلق الثغرات قبل الفرض.",
              },
              {
                name: "سارة الإدريسي",
                role: "آداب",
                q: "المتابعة الأسبوعية خلّتني أحس بتحكم في الوقت، والدعم كان سريعًا.",
              },
            ].map((r) => (
              <figure key={r.name} className="flex h-full flex-col rounded-2xl border border-slate-200/90 bg-slate-50/50 p-6 shadow-card">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 text-sm font-bold text-white">
                    {r.name.charAt(0)}
                  </span>
                  <figcaption className="min-w-0 text-start">
                    <span className="block font-bold text-slate-900">{r.name}</span>
                    <span className="block text-xs text-slate-500">{r.role}</span>
                  </figcaption>
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-700 sm:text-base">«{r.q}»</blockquote>
                <div className="mt-4 flex gap-0.5 text-amber-400" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <IconStar key={i} className="size-4" />
                  ))}
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-b border-slate-200/90 bg-slate-50 py-16 sm:py-20" aria-labelledby="pricing-title">
        <div className={container}>
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="pricing-title" className="text-2xl font-extrabold text-slate-900 sm:text-3xl md:text-4xl">
              باقات الاشتراك
            </h2>
            <p className="mt-3 text-slate-600 sm:text-lg">اختر ما يناسبك — ترقية أو إيقاف مؤقت في أي وقت.</p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {[
              { name: "أساسي", price: "199", desc: "إيقاع مريح للمراجعة الأسبوعية.", feat: ["حصتان مباشرتان أسبوعيًا", "ملخصات جاهزة", "مجموعة نقاش"], hi: false },
              { name: "متقدم", price: "349", desc: "الأكثر طلبًا: عمق أكبر في التمارين.", feat: ["٤ حصص أسبوعيًا", "تصحيح تمارين", "متابعة أسبوعية"], hi: true },
              { name: "مكثف", price: "499", desc: "دفع قوي قبل الامتحان.", feat: ["حصص إضافية", "جلسات تقوية", "أولوية في الأسئلة"], hi: false },
            ].map((p) => (
              <div
                key={p.name}
                className={`relative flex flex-col rounded-2xl border p-6 shadow-card sm:p-8 ${
                  p.hi ? "border-brand-300 bg-white ring-2 ring-brand-500/20" : "border-slate-200/90 bg-white"
                }`}
              >
                {p.hi ? (
                  <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                    الأكثر شعبية
                  </span>
                ) : null}
                <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{p.desc}</p>
                <p className="mt-6">
                  <span className="text-4xl font-extrabold text-slate-900">{p.price}</span>
                  <span className="ms-1 text-sm font-medium text-slate-500">د.م / شهر</span>
                </p>
                <ul className="mt-6 flex flex-1 flex-col gap-2.5 text-sm text-slate-700">
                  {p.feat.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-bold no-underline transition ${
                    p.hi
                      ? "bg-gradient-to-l from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/20 hover:opacity-95"
                      : "border border-slate-200 bg-slate-50 text-slate-900 hover:border-brand-200 hover:bg-brand-50/60"
                  }`}
                >
                  اختر {p.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20" aria-labelledby="cta-title">
        <div className={container}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-brand-700 via-indigo-800 to-slate-900 px-6 py-12 text-center shadow-xl sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute -start-20 top-0 h-64 w-64 rounded-full bg-brand-400/30 blur-3xl" />
            <div className="pointer-events-none absolute -end-16 bottom-0 h-56 w-56 rounded-full bg-indigo-400/25 blur-3xl" />
            <div className="relative mx-auto max-w-2xl">
              <h2 id="cta-title" className="text-2xl font-extrabold text-white sm:text-3xl md:text-4xl">
                جاهز للخطوة التالية؟
              </h2>
              <p className="mt-4 text-slate-200 sm:text-lg">
                أنشئ حسابك وابدأ بتجربة منظمة — نحن هنا لدعمك طوال مسار البكالوريا.
              </p>
              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-3.5 text-base font-bold text-slate-900 no-underline shadow-lg hover:bg-slate-100"
                >
                  إنشاء حساب
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-8 py-3.5 text-base font-semibold text-white no-underline backdrop-blur-sm hover:bg-white/15"
                >
                  عرض الدورات
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="border-t border-slate-200 bg-slate-100/90">
        <div className={`${container} py-12 sm:py-14`}>
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-8">
            <div className="max-w-md">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-lg font-bold text-slate-900 no-underline hover:opacity-90"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-sm font-extrabold text-white">
                  م
                </span>
                منصة ينفع
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                تعليم عربي واضح للبكالوريا: دروس مباشرة، تمارين، ومتابعة تساعدك تبني عادة دراسية ثابتة.
              </p>
              <p className="mt-4 text-sm text-slate-600">
                تواصل:{" "}
                <a href="mailto:contact@maerifah.app" className="font-semibold text-brand-700 no-underline hover:underline">
                  contact@maerifah.app
                </a>
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold" aria-label="روابط التذييل">
              {[
                { href: "/#hero", label: "الرئيسية" },
                { href: "/courses", label: "الدورات" },
                { href: "/#pricing", label: "الأسعار" },
                { href: "/login", label: "تسجيل الدخول" },
                { href: "/register", label: "إنشاء حساب" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-slate-600 no-underline transition-colors hover:text-brand-700">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-8 text-center text-xs text-slate-500 sm:flex-row sm:text-start">
            <p>© {new Date().getFullYear()} منصة ينفع. جميع الحقوق محفوظة.</p>
            <p className="text-slate-400">صُممت لتعليم عربي واضح.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
