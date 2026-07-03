import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { enrollmentsService } from '../services/enrollmentsService';

export const enrollStudent = createAsyncThunk(
  'enrollments/enroll',
  async ({ studentId, courseId }, { rejectWithValue }) => {
    try {
      const res = await enrollmentsService.enroll(studentId, courseId);
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.data?.message || err.response?.data?.message || 'فشل تسجيل الطالب');
    }
  }
);

export const unenrollStudent = createAsyncThunk(
  'enrollments/unenroll',
  async ({ studentId, courseId }, { rejectWithValue }) => {
    try {
      await enrollmentsService.unenroll(studentId, courseId);
      return { studentId, courseId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.data?.message || err.response?.data?.message || 'فشل إلغاء تسجيل الطالب');
    }
  }
);

export const fetchCourseStudents = createAsyncThunk(
  'enrollments/fetchCourseStudents',
  async ({ courseId, params = {} }, { rejectWithValue }) => {
    try {
      const data = await enrollmentsService.getCourseStudents(courseId, params);
      return data; // { course, students, total, pagination }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل جلب طلاب المادة');
    }
  }
);

const enrollmentsSlice = createSlice({
  name: 'enrollments',
  initialState: {
    students: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1
    },
    loading: false,
    actionLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourseStudents.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchCourseStudents.fulfilled, (s, a) => {
        s.loading = false;
        s.students = a.payload?.students || [];
        if (a.payload?.pagination) {
          s.pagination = a.payload.pagination;
        }
      })
      .addCase(fetchCourseStudents.rejected,  (s, a) => { s.loading = false; s.error = a.payload; s.students = []; })

      .addCase(enrollStudent.pending,   (s) => { s.actionLoading = true; s.error = null; })
      .addCase(enrollStudent.fulfilled, (s) => { s.actionLoading = false; })
      .addCase(enrollStudent.rejected,  (s, a) => { s.actionLoading = false; s.error = a.payload; })

      .addCase(unenrollStudent.pending,   (s) => { s.actionLoading = true; s.error = null; })
      .addCase(unenrollStudent.fulfilled, (s) => { s.actionLoading = false; })
      .addCase(unenrollStudent.rejected,  (s, a) => { s.actionLoading = false; s.error = a.payload; });
  },
});

export const { clearError } = enrollmentsSlice.actions;
export const selectEnrollmentStudents = (state) => state.enrollments.students;
export const selectEnrollmentPagination = (state) => state.enrollments.pagination;
export const selectEnrollmentsLoading   = (state) => state.enrollments.loading;
export const selectEnrollmentsActionLoading = (state) => state.enrollments.actionLoading;

export default enrollmentsSlice.reducer;
