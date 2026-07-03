import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { instructorService } from '../services/instructorService';

export const fetchInstructorDashboardStats = createAsyncThunk(
  'instructor/fetchDashboardStats',
  async (params, { rejectWithValue }) => {
    try {
      const res = await instructorService.getDashboardStats(params);
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل جلب إحصائيات لوحة التحكم');
    }
  }
);

const instructorSlice = createSlice({
  name: 'instructor',
  initialState: {
    dashboardStats: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInstructorDashboardStats.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchInstructorDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchInstructorDashboardStats.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearError } = instructorSlice.actions;

export const selectInstructorStats = (state) => state.instructor.dashboardStats;
export const selectInstructorLoading = (state) => state.instructor.loading;

export default instructorSlice.reducer;
