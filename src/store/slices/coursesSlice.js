import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { coursesService } from '../services/coursesService';

export const fetchCourses = createAsyncThunk(
  'courses/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await coursesService.getCourses(params);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل جلب المواد');
    }
  }
);

export const addCourse = createAsyncThunk(
  'courses/add',
  async (courseData, { rejectWithValue }) => {
    try {
      return await coursesService.createCourse(courseData);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل إضافة المادة');
    }
  }
);

export const editCourse = createAsyncThunk(
  'courses/edit',
  async ({ id, courseData }, { rejectWithValue }) => {
    try {
      return await coursesService.updateCourse(id, courseData);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل تعديل المادة');
    }
  }
);

export const removeCourse = createAsyncThunk(
  'courses/remove',
  async (id, { rejectWithValue }) => {
    try {
      await coursesService.deleteCourse(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل حذف المادة');
    }
  }
);

const coursesSlice = createSlice({
  name: 'courses',
  initialState: {
    list: [],
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
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCourses.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload?.courses || [];
        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchCourses.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // Add
      .addCase(addCourse.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(addCourse.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.list.unshift(action.payload);
      })
      .addCase(addCourse.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; })
      
      // Edit
      .addCase(editCourse.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(editCourse.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.list.findIndex(c => c.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(editCourse.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; })
      
      // Remove
      .addCase(removeCourse.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(removeCourse.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.list = state.list.filter(c => c.id !== action.payload);
      })
      .addCase(removeCourse.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; });
  },
});

export const { clearError } = coursesSlice.actions;
export const selectCourses = (state) => state.courses.list;
export const selectCoursesPagination = (state) => state.courses.pagination;
export const selectCoursesLoading = (state) => state.courses.loading;
export const selectCoursesActionLoading = (state) => state.courses.actionLoading;

export default coursesSlice.reducer;
