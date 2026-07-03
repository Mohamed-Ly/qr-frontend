import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attendanceService } from '../services/attendanceService';

export const fetchAttendanceRecords = createAsyncThunk(
  'attendance/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const res = await attendanceService.getAll(params);
      return res; // { attendances, pagination }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل جلب سجلات الحضور');
    }
  }
);

export const updateAttendanceRecord = createAsyncThunk(
  'attendance/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await attendanceService.update(id, data);
      return res.attendance;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل تحديث سجل الحضور');
    }
  }
);

export const removeAttendanceRecord = createAsyncThunk(
  'attendance/remove',
  async (id, { rejectWithValue }) => {
    try {
      await attendanceService.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل حذف سجل الحضور');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    records: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    loading: false,
    actionLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendanceRecords.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAttendanceRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload?.attendances || [];
        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchAttendanceRecords.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(updateAttendanceRecord.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(updateAttendanceRecord.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.records.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.records[index] = action.payload;
        }
      })
      .addCase(updateAttendanceRecord.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; })

      .addCase(removeAttendanceRecord.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(removeAttendanceRecord.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.records = state.records.filter(r => r.id !== action.payload);
      })
      .addCase(removeAttendanceRecord.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; });
  },
});

export const { clearError } = attendanceSlice.actions;

export const selectAttendanceRecords = (state) => state.attendance.records;
export const selectAttendancePagination = (state) => state.attendance.pagination;
export const selectAttendanceLoading = (state) => state.attendance.loading;
export const selectAttendanceActionLoading = (state) => state.attendance.actionLoading;

export default attendanceSlice.reducer;
