import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/authService';

// ─── helpers ─────────────────────────────────────────────────────────────────
function loadFromStorage() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    return { user, accessToken, refreshToken };
  } catch {
    return { user: null, accessToken: null, refreshToken: null };
  }
}

function saveToStorage({ user, accessToken, refreshToken }) {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

function clearStorage() {
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

// ─── initial state ────────────────────────────────────────────────────────────
const { user, accessToken, refreshToken } = loadFromStorage();

const initialState = {
  user: user || null,
  accessToken: accessToken || null,
  refreshToken: refreshToken || null,
  loading: false,
  error: null,
};

// ─── thunks ───────────────────────────────────────────────────────────────────

/** تسجيل الدخول */
export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ identifier, password }, { rejectWithValue }) => {
    try {
      const data = await authService.login(identifier, password);
      return data;
    } catch (err) {
      // sendFail  → { status:'fail',  data: { message } }
      // sendError → { status:'error', message }
      const message =
        err.response?.data?.data?.message ||
        err.response?.data?.message ||
        'حدث خطأ في الاتصال بالخادم. يرجى المحاولة لاحقاً.';
      return rejectWithValue(message);
    }
  }
);

/** تسجيل الخروج */
export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logoutAll();
    } catch {
      // نسجل الخروج محلياً حتى لو فشل الطلب
    }
  }
);

// ─── slice ────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    // لو احتجنا نحدث البيانات محلياً
    setUser(state, action) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // ── Login ──────────────────────────────────────────────────
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        saveToStorage(action.payload);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── Logout ─────────────────────────────────────────────────
    builder
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
        clearStorage();
      })
      .addCase(logoutThunk.rejected, (state) => {
        // حتى لو الطلب فشل — نمسح المحلي
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        clearStorage();
      });
  },
});

export const { clearError, setUser } = authSlice.actions;

// ─── selectors ────────────────────────────────────────────────────────────────
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => !!state.auth.accessToken;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
