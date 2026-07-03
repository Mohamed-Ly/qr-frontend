import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { usersService } from '../services/usersService';

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await usersService.getUsers(params);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل جلب المستخدمين');
    }
  }
);

export const addUser = createAsyncThunk(
  'users/add',
  async (userData, { rejectWithValue }) => {
    try {
      return await usersService.createUser(userData);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل إضافة المستخدم');
    }
  }
);

export const editUser = createAsyncThunk(
  'users/edit',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      return await usersService.updateUser(id, userData);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل تعديل المستخدم');
    }
  }
);

export const toggleStatus = createAsyncThunk(
  'users/toggleStatus',
  async ({ id, newStatus }, { rejectWithValue }) => {
    try {
      return await usersService.toggleUserStatus(id, newStatus);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل تغيير حالة المستخدم');
    }
  }
);

export const removeUser = createAsyncThunk(
  'users/remove',
  async (id, { rejectWithValue }) => {
    try {
      await usersService.deleteUser(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل حذف المستخدم');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
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
      .addCase(fetchUsers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload?.users || [];
        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // Add
      .addCase(addUser.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(addUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.list.push(action.payload);
      })
      .addCase(addUser.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; })
      
      // Edit
      .addCase(editUser.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(editUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.list.findIndex(u => u.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(editUser.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; })
      
      // Toggle Status
      .addCase(toggleStatus.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(toggleStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.list.findIndex(u => u.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(toggleStatus.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; })
      
      // Remove
      .addCase(removeUser.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(removeUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.list = state.list.filter(u => u.id !== action.payload);
      })
      .addCase(removeUser.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; });
  },
});

export const { clearError } = usersSlice.actions;
export const selectUsers = (state) => state.users.list;
export const selectUsersPagination = (state) => state.users.pagination;
export const selectUsersLoading = (state) => state.users.loading;
export const selectUsersActionLoading = (state) => state.users.actionLoading;

export default usersSlice.reducer;
