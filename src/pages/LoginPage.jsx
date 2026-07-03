import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FiEye, FiEyeOff, FiLogIn, FiCamera, FiBarChart2, FiShield, FiArrowRight } from 'react-icons/fi';
import {
  loginThunk,
  selectAuthLoading,
  selectAuthError,
  clearError,
} from '../store/slices/authSlice';

// خريطة الدور → المسار
const ROLE_PATHS = {
  ADMIN: '/admin',
  INSTRUCTOR: '/instructor',
  STUDENT: '/student',
};

const FEATURES_MINI = [
  { icon: FiCamera, text: 'تسجيل الحضور عبر QR' },
  { icon: FiBarChart2, text: 'تقارير وإحصائيات فورية' },
  { icon: FiShield, text: 'نظام آمن ومشفر' },
];

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectAuthLoading);
  const serverError = useSelector(selectAuthError);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Validation ────────────────────────────────────────────────
  function validate() {
    const errors = {};
    if (!identifier.trim()) errors.identifier = 'هذا الحقل مطلوب';
    if (!password) errors.password = 'هذا الحقل مطلوب';
    else if (password.length < 8) errors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ── Submit ────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    dispatch(clearError());
    if (!validate()) return;

    const result = await dispatch(loginThunk({ identifier: identifier.trim(), password }));

    if (loginThunk.fulfilled.match(result)) {
      const role = result.payload.user.role; // e.g. 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
      const path = ROLE_PATHS[role] || '/';
      toast.success(`أهلاً بك، ${result.payload.user.name}!`);
      navigate(path, { replace: true });
    } else {
      toast.error(result.payload || 'فشل تسجيل الدخول، يرجى المحاولة مجدداً.');
    }
  }

  // ── Field change helper ───────────────────────────────────────
  function handleFieldChange(setter, field) {
    return (e) => {
      setter(e.target.value);
      if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: '' }));
      if (serverError) dispatch(clearError());
    };
  }

  return (
    <div className="min-h-screen w-full flex">

      {/* ── Left (Visual) Panel — hidden on mobile ─── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-red-700 items-center justify-center p-12 relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute top-0 start-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 end-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-white text-center"
        >
          <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20">
            <FiCamera className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold mb-4 leading-tight">
            نظام الحضور الذكي
          </h2>
          <p className="text-red-100 text-base leading-relaxed mb-10 max-w-sm mx-auto">
            منصة متكاملة لإدارة حضور الطلاب باستخدام تقنية رموز QR الآمنة.
          </p>
          <div className="space-y-4">
            {FEATURES_MINI.map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl px-5 py-3 border border-white/10">
                <f.icon className="w-5 h-5 text-red-200 flex-shrink-0" />
                <span className="text-sm font-medium text-white">{f.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Right (Form) Panel ───────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm mb-6 font-medium">
              <FiArrowRight className="w-4 h-4" />
              العودة للرئيسية
            </Link>
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
              <FiCamera className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">تسجيل الدخول</h1>
            <p className="text-gray-500 text-sm mt-1">أدخل بياناتك للوصول إلى حسابك</p>
          </div>

          {/* Server error alert */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium"
            >
              {serverError}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 sm:p-8 space-y-5">

            {/* Identifier */}
            <div>
              <label htmlFor="identifier" className="block text-sm font-semibold text-gray-700 mb-1.5">
                البريد الإلكتروني أو رقم الهاتف
              </label>
              <input
                id="identifier"
                type="text"
                dir="ltr"
                value={identifier}
                onChange={handleFieldChange(setIdentifier, 'identifier')}
                placeholder="example@uni.edu"
                disabled={loading}
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all bg-gray-50 focus:bg-white placeholder:text-gray-400
                  ${fieldErrors.identifier
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
              />
              {fieldErrors.identifier && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.identifier}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  dir="ltr"
                  value={password}
                  onChange={handleFieldChange(setPassword, 'password')}
                  placeholder="••••••••"
                  disabled={loading}
                  className={`w-full border rounded-xl px-4 py-3 ps-12 text-sm outline-none transition-all bg-gray-50 focus:bg-white
                    ${fieldErrors.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-bold text-base hover:bg-red-600 transition-all shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/40 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جارٍ تسجيل الدخول...
                </>
              ) : (
                <>
                  <FiLogIn className="w-5 h-5" />
                  دخول
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            نظام إدارة الحضور الذكي &copy; {new Date().getFullYear()}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
