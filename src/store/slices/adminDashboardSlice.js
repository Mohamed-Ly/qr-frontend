import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminService } from '../services/adminService';

// Thunks
export const fetchDashboardStats = createAsyncThunk(
  'adminDashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getDashboardStats();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل جلب الإحصائيات');
    }
  }
);

const adminDashboardSlice = createSlice({
  name: 'adminDashboard',
  initialState: {
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const selectAdminStats = (state) => state.adminDashboard.stats;
export const selectAdminStatsLoading = (state) => state.adminDashboard.loading;

export default adminDashboardSlice.reducer;
