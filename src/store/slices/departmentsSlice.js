import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { departmentsService } from '../services/departmentsService';

export const fetchDepartments = createAsyncThunk(
  'departments/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await departmentsService.getDepartments(params);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل جلب الأقسام');
    }
  }
);

export const addDepartment = createAsyncThunk(
  'departments/add',
  async (deptData, { rejectWithValue }) => {
    try {
      return await departmentsService.createDepartment(deptData);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل إضافة القسم');
    }
  }
);

export const editDepartment = createAsyncThunk(
  'departments/edit',
  async ({ id, deptData }, { rejectWithValue }) => {
    try {
      return await departmentsService.updateDepartment(id, deptData);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل تعديل القسم');
    }
  }
);

export const removeDepartment = createAsyncThunk(
  'departments/remove',
  async (id, { rejectWithValue }) => {
    try {
      await departmentsService.deleteDepartment(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل حذف القسم');
    }
  }
);

const departmentsSlice = createSlice({
  name: 'departments',
  initialState: {
    list: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1
    },
    loading: false,
    actionLoading: false, // For add/edit/delete operations
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
      .addCase(fetchDepartments.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload?.departments || [];
        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchDepartments.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Add
      .addCase(addDepartment.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(addDepartment.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.list.unshift(action.payload);
      })
      .addCase(addDepartment.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; })
      // Edit
      .addCase(editDepartment.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(editDepartment.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.list.findIndex(d => d.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(editDepartment.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; })
      // Remove
      .addCase(removeDepartment.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(removeDepartment.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.list = state.list.filter(d => d.id !== action.payload);
      })
      .addCase(removeDepartment.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; });
  },
});

export const { clearError } = departmentsSlice.actions;
export const selectDepartments = (state) => state.departments.list;
export const selectDepartmentsPagination = (state) => state.departments.pagination;
export const selectDepartmentsLoading = (state) => state.departments.loading;
export const selectDepartmentsActionLoading = (state) => state.departments.actionLoading;

export default departmentsSlice.reducer;
