import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiLogOut, FiX } from 'react-icons/fi';
import { logoutThunk } from '../../store/slices/authSlice';

/**
 * Reusable Sidebar component — works for all roles.
 * Uses pure CSS transitions (no Framer Motion) for reliable mobile behavior.
 *
 * Props:
 *  - isOpen: bool — controls mobile open state
 *  - onClose: fn  — called when user closes sidebar or clicks overlay
 *  - title: string
 *  - navItems: [{ path, icon, label }]
 */
export default function Sidebar({ isOpen, onClose, title, navItems }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* ── Overlay (mobile only) ─────────────────────────────── */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0 z-40 bg-black/50 backdrop-blur-sm
          transition-opacity duration-300 md:hidden
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      />

      {/* ── Sidebar panel ────────────────────────────────────────
          Desktop: always visible (translate-x-0 forced via md:translate-x-0)
          Mobile:  slides in from the right
      ───────────────────────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 start-0 z-50 w-64 flex flex-col
          bg-white border-e border-gray-200
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          md:relative md:translate-x-0 md:z-auto md:flex-shrink-0
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-primary rounded-full" />
            <span className="text-lg font-bold text-gray-800">{title}</span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="إغلاق القائمة"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-0.5">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.end ?? false}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-white shadow-md shadow-primary/30'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100 flex-shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-primary rounded-xl transition-colors"
          >
            <FiLogOut className="w-5 h-5 text-gray-400" />
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}
