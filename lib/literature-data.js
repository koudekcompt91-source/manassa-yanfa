export const categories = [
  { id: "cat-nahw", slug: "النحو", title: "النحو" },
  { id: "cat-balagha", slug: "البلاغة", title: "البلاغة" },
  { id: "cat-shiir", slug: "الشعر", title: "الشعر" },
  { id: "cat-naqd", slug: "النقد", title: "النقد" },
  { id: "cat-old", slug: "الأدب القديم", title: "الأدب القديم" },
  { id: "cat-modern", slug: "الأدب الحديث", title: "الأدب الحديث" },
  { id: "cat-text", slug: "تحليل النصوص", title: "تحليل النصوص" },
  { id: "cat-arud", slug: "العروض", title: "العروض" },
  { id: "cat-schools", slug: "المدارس الأدبية", title: "المدارس الأدبية" },
];

export const teachers = [
  {
    id: "teacher-1",
    name: "الدكتور عبد الرحمن السالمي",
    specialization: "الأدب الجاهلي والأموي",
    bio: "باحث في الشعر القديم وتحليل البنية الفنية للقصيدة العربية.",
    avatar: "/teachers/t1.png",
    featured: true,
  },
  {
    id: "teacher-2",
    name: "الدكتورة مريم حداد",
    specialization: "البلاغة وتحليل النصوص",
    bio: "متخصصة في البيان والبديع وتطبيقاتهما في النصوص الأدبية.",
    avatar: "/teachers/t2.png",
    featured: true,
  },
  {
    id: "teacher-3",
    name: "الدكتور نزار العلواني",
    specialization: "النقد الأدبي والمدارس الحديثة",
    bio: "يركز على مناهج النقد القديم والحديث وبناء القراءة التحليلية.",
    avatar: "/teachers/t3.png",
    featured: false,
  },
];

export const courses = [
  {
    id: "course-balagha",
    slug: "البلاغة-العربية",
    title: "البلاغة العربية: البيان والبديع والمعاني",
    description: "مسار منظم لفهم أدوات البلاغة العربية وتطبيقها على نصوص شعرية ونثرية مختارة.",
    category: "البلاغة",
    level: "متوسط",
    teacherId: "teacher-2",
    lessonCount: 14,
    duration: "9 ساعات",
    coverImage: "/courses/balagha.jpg",
    featured: true,
    status: "published",
    learningOutcomes: [
      "تحليل الصور البيانية في النص الأدبي",
      "تمييز المحسنات البديعية ووظيفتها",
      "بناء تعليق بلاغي أكاديمي واضح",
    ],
    curriculum: [
      "مدخل إلى علم المعاني",
      "الصورة البيانية: تشبيه واستعارة وكناية",
      "البديع بين الجمال والدلالة",
      "تطبيقات تحليلية على نصوص شعرية",
    ],
  },
  {
    id: "course-jahili",
    slug: "الأدب-الجاهلي-الخصائص-والنصوص",
    title: "الأدب الجاهلي: الخصائص والنصوص",
    description: "قراءة منهجية في خصائص الأدب الجاهلي وبنية القصيدة ومكانة الشاعر في المجتمع.",
    category: "الأدب القديم",
    level: "متوسط",
    teacherId: "teacher-1",
    lessonCount: 12,
    duration: "8 ساعات",
    coverImage: "/courses/jahili.jpg",
    featured: true,
    status: "published",
    learningOutcomes: [
      "استيعاب البنية الفنية للقصيدة الجاهلية",
      "تحليل القيم الثقافية والاجتماعية في النص",
      "توظيف الشواهد الشعرية في الإجابات الأدبية",
    ],
    curriculum: [
      "مدخل تاريخي إلى العصر الجاهلي",
      "خصائص الشعر الجاهلي",
      "المعلقات: قراءة وتحليل",
      "مقارنة نصوص مختارة",
    ],
  },
  {
    id: "course-naqd",
    slug: "النقد-الأدبي-العربي",
    title: "النقد الأدبي العربي",
    description: "تدريب على مناهج النقد الأدبي وبناء قراءة نقدية متماسكة للنصوص القديمة والحديثة.",
    category: "النقد",
    level: "متقدم",
    teacherId: "teacher-3",
    lessonCount: 11,
    duration: "7 ساعات",
    coverImage: "/courses/naqd.jpg",
    featured: false,
    status: "published",
    learningOutcomes: [
      "تمييز المناهج النقدية الأساسية",
      "صياغة أحكام نقدية مدعومة بالشواهد",
      "تحليل النص وفق أداة منهجية واضحة",
    ],
    curriculum: [
      "مفهوم النقد الأدبي ووظائفه",
      "النقد القديم: المعايير والموازين",
      "النقد الحديث: الاتجاهات والمناهج",
      "تطبيقات على نصوص شعرية وسردية",
    ],
  },
  {
    id: "course-arud",
    slug: "العروض-والقافية",
    title: "العروض والقافية",
    description: "برنامج عملي لتقطيع الأبيات وفهم البحور الشعرية وبنية الإيقاع العربي.",
    category: "العروض",
    level: "مبتدئ",
    teacherId: "teacher-1",
    lessonCount: 10,
    duration: "6 ساعات",
    coverImage: "/courses/arud.jpg",
    featured: false,
    status: "published",
    learningOutcomes: [
      "تمييز البحور الشعرية الأساسية",
      "تقطيع البيت الشعري بدقة",
      "فهم أثر الإيقاع في المعنى",
    ],
    curriculum: ["مدخل إلى علم العروض", "التفعيلات الأساسية", "البحور الشائعة", "القافية وتطبيقات"],
  },
  {
    id: "course-modern-schools",
    slug: "المدارس-الأدبية-الحديثة",
    title: "المدارس الأدبية الحديثة",
    description: "رحلة تحليلية في الرومانسية والواقعية والرمزية وتأثيرها في الأدب العربي الحديث.",
    category: "الأدب الحديث",
    level: "متوسط",
    teacherId: "teacher-3",
    lessonCount: 9,
    duration: "5 ساعات",
    coverImage: "/courses/modern.jpg",
    featured: true,
    status: "published",
    learningOutcomes: [
      "فهم سمات المدارس الأدبية الحديثة",
      "تطبيق أدوات المقارنة بين النصوص",
      "ربط المدرسة بالتحولات الفكرية",
    ],
    curriculum: ["مفهوم المدرسة الأدبية", "الرومانسية", "الواقعية", "الرمزية", "تطبيقات نصية"],
  },
  {
    id: "course-khitaba",
    slug: "فن-المقالة-والخطابة",
    title: "فن المقالة والخطابة",
    description: "تطوير مهارات التعبير الأدبي والكتابة الأكاديمية والخطاب البلاغي المقنع.",
    category: "تحليل النصوص",
    level: "متوسط",
    teacherId: "teacher-2",
    lessonCount: 8,
    duration: "4.5 ساعات",
    coverImage: "/courses/khitaba.jpg",
    featured: false,
    status: "published",
    learningOutcomes: [
      "بناء مقالة أدبية متماسكة",
      "توظيف الأساليب البلاغية في الخطاب",
      "تحسين جودة الحجاج والتعبير",
    ],
    curriculum: ["بنية المقالة الأدبية", "مهارات الاستهلال والخاتمة", "بلاغة الإقناع", "تطبيقات كتابة"],
  },
];

export const lessons = [
  {
    id: "lesson-balagha-1",
    slug: "الصورة-البيانية",
    title: "الصورة البيانية",
    courseId: "course-balagha",
    type: "video",
    duration: 28,
    isPublished: true,
    attachments: ["ملف-تحليل-بلاغي.pdf"],
    order: 1,
    description: "مدخل إلى التشبيه والاستعارة والكناية مع تطبيق مباشر على مقاطع شعرية.",
    rhetoricalDevices: ["تشبيه", "استعارة", "كناية"],
  },
  {
    id: "lesson-balagha-2",
    slug: "الاستعارة-والكناية",
    title: "الاستعارة والكناية",
    courseId: "course-balagha",
    type: "video",
    duration: 35,
    isPublished: true,
    attachments: ["تدريب-استخراج-الصور.pdf"],
    order: 2,
    description: "تطبيقات تحليلية على نصوص أدبية مركزة في الدلالة البلاغية.",
    rhetoricalDevices: ["استعارة مكنية", "كناية عن صفة"],
  },
  {
    id: "lesson-jahili-1",
    slug: "خصائص-الشعر-الجاهلي",
    title: "خصائص الشعر الجاهلي",
    courseId: "course-jahili",
    type: "video",
    duration: 31,
    isPublished: true,
    attachments: ["نصوص-جاهلية-مختارة.pdf"],
    order: 1,
    description: "قراءة خصائص البناء الفني والموضوعي في القصيدة الجاهلية.",
    rhetoricalDevices: ["الوقوف على الأطلال", "الفخر", "الوصف"],
  },
  {
    id: "lesson-modern-1",
    slug: "المدارس-الأدبية-الحديثة-تمهيد",
    title: "تمهيد: المدارس الأدبية الحديثة",
    courseId: "course-modern-schools",
    type: "text",
    duration: 24,
    isPublished: true,
    attachments: ["خريطة-المدارس-الأدبية.pdf"],
    order: 1,
    description: "تمهيد مفاهيمي في أبرز المدارس الأدبية وأثرها في النص العربي الحديث.",
    rhetoricalDevices: ["الرمز", "الصور المركبة"],
  },
  {
    id: "lesson-arud-1",
    slug: "تقطيع-الأبيات",
    title: "تقطيع الأبيات",
    courseId: "course-arud",
    type: "quiz",
    duration: 20,
    isPublished: true,
    attachments: ["أبيات-للتقطيع.pdf"],
    order: 1,
    description: "تطبيقات مباشرة على التفعيلات والوزن والقافية.",
    rhetoricalDevices: ["إيقاع", "تفعيلة"],
  },
];

export const students = [
  {
    id: "student-1",
    name: "محمد الأندلسي",
    email: "mohamed@example.com",
    enrolledCourses: ["course-balagha", "course-jahili", "course-naqd", "course-modern-schools"],
    progress: 63,
    subscriptionStatus: "active",
  },
];

export const subscriptionPlans = [
  {
    id: "plan-monthly",
    name: "باقة شهرية",
    price: "199 دج",
    period: "شهري",
    features: ["وصول لجميع المسارات الأساسية", "جلسة مباشرة أسبوعية", "ملفات تحليل نصوص"],
    isActive: true,
  },
  {
    id: "plan-quarterly",
    name: "باقة فصلية",
    price: "549 دج",
    period: "كل 3 أشهر",
    features: ["ورش تطبيقية إضافية", "تقارير تقدم مفصلة", "أولوية في الأسئلة"],
    isActive: true,
  },
  {
    id: "plan-yearly",
    name: "باقة سنوية",
    price: "1,999 دج",
    period: "سنوي",
    features: ["وصول كامل لكل المسارات", "متابعة أكاديمية شهرية", "جلسات مراجعة قبل الاختبارات"],
    isActive: true,
  },
];

export const announcements = [
  { id: "ann-1", title: "إطلاق مسار الأدب الأندلسي", date: "2026-04-01" },
  { id: "ann-2", title: "جلسة مباشرة: تحليل نص شعري حديث", date: "2026-04-08" },
];

export function getTeacherById(teacherId) {
  return teachers.find((teacher) => teacher.id === teacherId) || null;
}

export function getCourseBySlug(slugOrId) {
  return courses.find((course) => course.slug === slugOrId || course.id === slugOrId) || null;
}

export function getLessonsByCourseId(courseId) {
  return lessons.filter((lesson) => lesson.courseId === courseId).sort((a, b) => a.order - b.order);
}
