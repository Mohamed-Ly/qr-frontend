import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportsService } from '../services/reportsService';

export const fetchGeneralStats = createAsyncThunk(
  'reports/fetchGeneralStats',
  async (params, { rejectWithValue }) => {
    try {
      const res = await reportsService.getGeneralStats(params);
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل جلب الإحصائيات العامة');
    }
  }
);

export const fetchTopAbsentStudents = createAsyncThunk(
  'reports/fetchTopAbsentStudents',
  async (params, { rejectWithValue }) => {
    try {
      const res = await reportsService.getTopAbsentStudents(params);
      return res.topAbsentStudents || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل جلب الطلاب الأكثر غياباً');
    }
  }
);

export const fetchMostCommittedCourses = createAsyncThunk(
  'reports/fetchMostCommittedCourses',
  async (params, { rejectWithValue }) => {
    try {
      const res = await reportsService.getMostCommittedCourses(params);
      return res.mostCommittedCourses || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل جلب المواد الأكثر التزاماً');
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState: {
    generalStats: null,
    topAbsentStudents: [],
    mostCommittedCourses: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      // General Stats
      .addCase(fetchGeneralStats.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchGeneralStats.fulfilled, (state, action) => {
        state.loading = false;
        state.generalStats = action.payload;
      })
      .addCase(fetchGeneralStats.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // Top Absent
      .addCase(fetchTopAbsentStudents.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTopAbsentStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.topAbsentStudents = action.payload;
      })
      .addCase(fetchTopAbsentStudents.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // Most Committed
      .addCase(fetchMostCommittedCourses.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMostCommittedCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.mostCommittedCourses = action.payload;
      })
      .addCase(fetchMostCommittedCourses.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearError } = reportsSlice.actions;

export const selectGeneralStats = (state) => state.reports.generalStats;
export const selectTopAbsentStudents = (state) => state.reports.topAbsentStudents;
export const selectMostCommittedCourses = (state) => state.reports.mostCommittedCourses;
export const selectReportsLoading = (state) => state.reports.loading;

export default reportsSlice.reducer;
