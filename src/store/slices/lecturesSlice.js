import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { lecturesService } from '../services/lecturesService';

const extractOne  = (res) => res.data?.data?.lecture  ?? res.data?.data ?? res.data;

export const fetchLectures = createAsyncThunk(
  'lectures/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const res = await lecturesService.getAll(params);
      return res.data?.data; // { lectures, pagination }
    } catch (err) {
      return rejectWithValue(err.response?.data?.data?.message || err.response?.data?.message || 'فشل جلب المحاضرات');
    }
  }
);

export const addLecture = createAsyncThunk(
  'lectures/add',
  async (data, { rejectWithValue }) => {
    try {
      const res = await lecturesService.create(data);
      return extractOne(res);
    } catch (err) {
      return rejectWithValue(err.response?.data?.data?.message || err.response?.data?.message || 'فشل إضافة المحاضرة');
    }
  }
);

export const editLecture = createAsyncThunk(
  'lectures/edit',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await lecturesService.update(id, data);
      return extractOne(res);
    } catch (err) {
      return rejectWithValue(err.response?.data?.data?.message || err.response?.data?.message || 'فشل تعديل المحاضرة');
    }
  }
);

export const removeLecture = createAsyncThunk(
  'lectures/remove',
  async (id, { rejectWithValue }) => {
    try {
      await lecturesService.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.data?.message || err.response?.data?.message || 'فشل حذف المحاضرة');
    }
  }
);

export const closeLecture = createAsyncThunk(
  'lectures/close',
  async (id, { rejectWithValue }) => {
    try {
      const res = await lecturesService.close(id);
      return extractOne(res);
    } catch (err) {
      return rejectWithValue(err.response?.data?.data?.message || err.response?.data?.message || 'فشل إغلاق المحاضرة');
    }
  }
);

const lecturesSlice = createSlice({
  name: 'lectures',
  initialState: { 
    list: [], 
    pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    loading: false, 
    actionLoading: false, 
    error: null 
  },
  reducers: {
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLectures.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchLectures.fulfilled, (s, a) => { 
        s.loading = false; 
        s.list = a.payload?.lectures || []; 
        if (a.payload?.pagination) s.pagination = a.payload.pagination;
      })
      .addCase(fetchLectures.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(addLecture.pending,   (s) => { s.actionLoading = true; s.error = null; })
      .addCase(addLecture.fulfilled, (s, a) => { s.actionLoading = false; s.list.unshift(a.payload); })
      .addCase(addLecture.rejected,  (s, a) => { s.actionLoading = false; s.error = a.payload; })

      .addCase(editLecture.pending,   (s) => { s.actionLoading = true; s.error = null; })
      .addCase(editLecture.fulfilled, (s, a) => {
        s.actionLoading = false;
        const i = s.list.findIndex(l => l.id === a.payload.id);
        if (i !== -1) s.list[i] = a.payload;
      })
      .addCase(editLecture.rejected, (s, a) => { s.actionLoading = false; s.error = a.payload; })

      .addCase(removeLecture.pending,   (s) => { s.actionLoading = true; s.error = null; })
      .addCase(removeLecture.fulfilled, (s, a) => { s.actionLoading = false; s.list = s.list.filter(l => l.id !== a.payload); })
      .addCase(removeLecture.rejected,  (s, a) => { s.actionLoading = false; s.error = a.payload; })

      .addCase(closeLecture.pending,   (s) => { s.actionLoading = true; s.error = null; })
      .addCase(closeLecture.fulfilled, (s, a) => {
        s.actionLoading = false;
        const i = s.list.findIndex(l => l.id === a.payload.id);
        if (i !== -1) s.list[i] = a.payload;
      })
      .addCase(closeLecture.rejected, (s, a) => { s.actionLoading = false; s.error = a.payload; });
  },
});

export const { clearError } = lecturesSlice.actions;
export const selectLectures        = (state) => state.lectures.list;
export const selectLecturesPagination = (state) => state.lectures.pagination;
export const selectLecturesLoading = (state) => state.lectures.loading;
export const selectLecturesActionLoading = (state) => state.lectures.actionLoading;

export default lecturesSlice.reducer;
