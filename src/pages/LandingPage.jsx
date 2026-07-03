import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheckCircle, FiZap, FiShield, FiBarChart2,
  FiChevronRight, FiChevronLeft, FiCamera, FiUsers, FiBook, FiArrowLeft
} from 'react-icons/fi';

// ── بيانات الـ Slider ──────────────────────────────────────────
const SLIDES = [
  {
    id: 1,
    badge: 'نظام متطور',
    title: 'إدارة الحضور بذكاء',
    subtitle: 'عبر رموز QR',
    description:
      'نظام متكامل يُمكّن المؤسسات التعليمية من تتبع حضور الطلاب لحظةً بلحظة باستخدام تقنية رموز الاستجابة السريعة.',
    gradient: 'from-primary/10 via-white to-secondary',
    accentColor: 'text-primary',
    icon: FiCamera,
  },
  {
    id: 2,
    badge: 'تقارير فورية',
    title: 'تحليلات شاملة',
    subtitle: 'في متناول يدك',
    description:
      'لوحات تحكم تفاعلية مع رسوم بيانية توضح نسب الحضور والغياب لكل مادة وطالب وأستاذ على حدة.',
    gradient: 'from-blue-50 via-white to-indigo-50',
    accentColor: 'text-blue-600',
    icon: FiBarChart2,
  },
  {
    id: 3,
    badge: 'أمان عالي',
    title: 'رموز QR مؤقتة',
    subtitle: 'آمنة ومشفرة',
    description:
      'كل رمز QR صالح لفترة محدودة مع تشفير كامل للبيانات، مما يمنع أي محاولة تلاعب أو تسجيل وهمي.',
    gradient: 'from-green-50 via-white to-emerald-50',
    accentColor: 'text-green-600',
    icon: FiShield,
  },
];

// ── الميزات الرئيسية ───────────────────────────────────────────
const FEATURES = [
  {
    icon: FiCamera,
    title: 'مسح QR فوري',
    description: 'يمسح الطالب رمز QR المعروض في القاعة ليُسجَّل حضوره تلقائياً خلال ثوانٍ.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: FiShield,
    title: 'رموز آمنة ومؤقتة',
    description: 'كل رمز QR فريد وصالح لوقت محدد فقط لمنع التلاعب والتسجيل الوهمي.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: FiBarChart2,
    title: 'تقارير تفصيلية',
    description: 'إحصائيات وتقارير شاملة عن الحضور لكل طالب ومادة وقسم ومحاضرة.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: FiUsers,
    title: 'أدوار متعددة',
    description: 'واجهات مخصصة للمدير والأستاذ والطالب، كل منهم يرى ما يخصه فقط.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: FiBook,
    title: 'إدارة المقررات',
    description: 'إنشاء وإدارة المقررات والمحاضرات والتسجيلات بسهولة تامة.',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    icon: FiZap,
    title: 'سرعة فائقة',
    description: 'واجهة سريعة الاستجابة مبنية بأحدث تقنيات الويب لتجربة مستخدم سلسة.',
    color: 'bg-orange-100 text-orange-600',
  },
];

// ── إحصائيات ──────────────────────────────────────────────────
const STATS = [
  { value: '+1000', label: 'طالب مسجل' },
  { value: '+50', label: 'مادة دراسية' },
  { value: '99%', label: 'دقة التسجيل' },
  { value: '+30', label: 'أستاذ نشط' },
];

// ── خطوات العمل ───────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'ينشئ الأستاذ رمز QR',
    description: 'يبدأ الأستاذ المحاضرة وينشئ رمز QR آمناً يعرضه في القاعة.',
  },
  {
    step: '02',
    title: 'يمسح الطالب الرمز',
    description: 'يقوم الطالب بمسح رمز QR باستخدام هاتفه لتسجيل حضوره فوراً.',
  },
  {
    step: '03',
    title: 'تُسجَّل البيانات تلقائياً',
    description: 'يُسجِّل النظام الحضور مع الوقت الدقيق ويُحدِّث قاعدة البيانات.',
  },
  {
    step: '04',
    title: 'تقارير فورية',
    description: 'يمكن الاطلاع على التقارير والإحصائيات فور انتهاء المحاضرة.',
  },
];

// ═════════════════════════════════════════════════════════════════
//  Landing Page Component
// ═════════════════════════════════════════════════════════════════
export function LandingPage() {
  const [activeSlide, setActiveSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = SLIDES[activeSlide];

  return (
    <div className="w-full">

      {/* ══════════ HERO SLIDER ══════════════════════════════════ */}
      <section className={`relative min-h-[85vh] bg-gradient-to-br ${slide.gradient} flex items-center transition-all duration-700`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Text Side */}
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold ${slide.accentColor} bg-white shadow-sm border border-gray-100`}>
                  <FiZap className="w-4 h-4" />
                  {slide.badge}
                </span>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                  {slide.title}
                  <br />
                  <span className={slide.accentColor}>{slide.subtitle}</span>
                </h1>

                <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                  {slide.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5"
                  >
                    ابدأ الآن
                    <FiArrowLeft className="w-5 h-5" />
                  </Link>
                  <a
                    href="#features"
                    className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-all border border-gray-200 shadow-sm"
                  >
                    اكتشف المزايا
                  </a>
                </div>

                {/* Slide Indicators */}
                <div className="flex items-center gap-3 pt-4">
                  {SLIDES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSlide(i)}
                      className={`transition-all duration-300 rounded-full ${
                        i === activeSlide
                          ? 'w-8 h-2.5 bg-primary'
                          : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Visual Side */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`icon-${slide.id}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="hidden lg:flex items-center justify-center"
              >
                <div className="relative">
                  <div className="w-80 h-80 rounded-3xl bg-white shadow-2xl border border-gray-100 flex items-center justify-center">
                    <slide.icon className={`w-40 h-40 ${slide.accentColor} opacity-20`} />
                  </div>
                  {/* Floating badges */}
                  <div className="absolute -top-4 -end-4 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <FiCheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">آخر تسجيل</p>
                      <p className="text-sm font-bold text-gray-800">قبل 2 دقيقة</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -start-4 bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
                    <p className="text-xs text-gray-500 mb-1">نسبة الحضور</p>
                    <p className="text-2xl font-extrabold text-primary">92%</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Arrow Controls */}
        <button
          onClick={prevSlide}
          className="absolute start-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:text-primary hover:border-primary transition-colors"
        >
          <FiChevronRight className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute end-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:text-primary hover:border-primary transition-colors"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>
      </section>

      {/* ══════════ STATS BAR ════════════════════════════════════ */}
      <section className="bg-primary py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="text-3xl sm:text-4xl font-extrabold text-white">{stat.value}</p>
                <p className="text-sm sm:text-base text-red-100 mt-1 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES ═════════════════════════════════════ */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-secondary text-primary text-sm font-bold rounded-full mb-4">
              المزايا الرئيسية
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              كل ما تحتاجه في مكان واحد
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              منظومة متكاملة لإدارة حضور الطلاب تجمع بين السهولة والدقة والأمان.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ═════════════════════════════════ */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-secondary text-primary text-sm font-bold rounded-full mb-4">
              كيف يعمل النظام
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              أربع خطوات بسيطة
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center relative"
              >
                {/* Connector line */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-10 start-[60%] w-full h-0.5 bg-gray-200 z-0" />
                )}
                <div className="relative z-10 w-20 h-20 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center mx-auto mb-5">
                  <span className="text-2xl font-extrabold text-primary">{item.step}</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════════════════════════════════════ */}
      <section className="py-20 bg-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
            ابدأ تجربتك اليوم مجاناً
          </h2>
          <p className="text-red-100 text-lg mb-10">
            سجّل دخولك الآن وابدأ بإدارة حضور طلابك بشكل ذكي وسريع.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-white text-primary px-10 py-4 rounded-xl font-extrabold text-lg hover:bg-red-50 transition-all shadow-xl hover:-translate-y-0.5"
          >
            تسجيل الدخول
            <FiArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
//  404 Page Component
// ═════════════════════════════════════════════════════════════════
export function NotFoundPage() {
  return (
    <div className="text-center px-4 py-20">
      <p className="text-8xl mb-4">🔍</p>
      <h1 className="text-7xl font-extrabold text-primary mb-4">404</h1>
      <p className="text-2xl text-gray-800 mb-3 font-bold">عذراً!</p>
      <p className="text-lg text-gray-600 mb-10">الصفحة التي تبحث عنها غير موجودة.</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors"
      >
        العودة للرئيسية
        <FiArrowLeft className="w-5 h-5" />
      </Link>
    </div>
  );
}
