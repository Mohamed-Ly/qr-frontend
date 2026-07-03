import { useState, useEffect } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { FiCamera, FiMenu, FiX } from 'react-icons/fi';

const NAV_LINKS = [
  { label: 'الرئيسية', sectionId: null, isHome: true },
  { label: 'المزايا', sectionId: 'features' },
  { label: 'كيف يعمل', sectionId: 'how-it-works' },
];

function scrollToSection(sectionId) {
  if (!sectionId) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export default function PublicLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── Sticky Navbar ──────────────────────────────────── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/30">
              <FiCamera className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-extrabold text-gray-900">الحضور الذكي</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollToSection(link.sectionId)}
                className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-600 transition-all shadow-md shadow-primary/20"
            >
              تسجيل الدخول
            </Link>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiMenu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-white flex flex-col">
            <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
              <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <FiCamera className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-gray-900">الحضور الذكي</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-500 hover:text-primary">
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 flex flex-col items-center justify-center gap-8">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => { scrollToSection(link.sectionId); setMobileOpen(false); }}
                  className="text-xl font-bold text-gray-700 hover:text-primary transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-lg mt-4"
              >
                تسجيل الدخول
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* ── Page Content ───────────────────────────────────── */}
      <main className="flex-grow pt-16">
        <Outlet />
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FiCamera className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">نظام الحضور الذكي</span>
            </div>
            <p className="text-sm text-center">
              &copy; {new Date().getFullYear()} نظام إدارة الحضور الذكي — جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
