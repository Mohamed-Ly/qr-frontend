import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adminDashboardReducer from './slices/adminDashboardSlice';
import usersReducer from './slices/usersSlice';
import departmentsReducer from './slices/departmentsSlice';
import coursesReducer from './slices/coursesSlice';
import lecturesReducer from './slices/lecturesSlice';
import enrollmentsReducer from './slices/enrollmentsSlice';
import reportsReducer from './slices/reportsSlice';
import attendanceReducer from './slices/attendanceSlice';
import instructorReducer from './slices/instructorSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminDashboard: adminDashboardReducer,
    users: usersReducer,
    departments: departmentsReducer,
    courses: coursesReducer,
    lectures: lecturesReducer,
    enrollments: enrollmentsReducer,
    reports: reportsReducer,
    attendance: attendanceReducer,
    instructor: instructorReducer,
  },
  devTools: import.meta.env.DEV,
});

export default store;
