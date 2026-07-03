export const MOCK_USERS = [
  { id: 1, name: 'مدير النظام', email: 'admin@uni.edu', role: 'admin', avatar: 'https://i.pravatar.cc/150?u=admin' },
  { id: 2, name: 'د. أحمد عبدالله', email: 'ahmed.a@uni.edu', role: 'instructor', avatar: 'https://i.pravatar.cc/150?u=john' },
  { id: 3, name: 'د. سارة محمد', email: 'sarah.m@uni.edu', role: 'instructor', avatar: 'https://i.pravatar.cc/150?u=sarah' },
  { id: 4, name: 'علي حسن', email: 'ali.h@student.uni.edu', role: 'student', avatar: 'https://i.pravatar.cc/150?u=alice' },
  { id: 5, name: 'عمر خالد', email: 'omar.k@student.uni.edu', role: 'student', avatar: 'https://i.pravatar.cc/150?u=bob' },
];

export const MOCK_COURSES = [
  { id: 101, code: 'CS101', name: 'مقدمة في علوم الحاسب', department: 'علوم الحاسب', instructorId: 2, enrolled: 120 },
  { id: 102, code: 'SE200', name: 'هندسة البرمجيات', department: 'هندسة البرمجيات', instructorId: 2, enrolled: 85 },
  { id: 103, code: 'AI301', name: 'الذكاء الاصطناعي', department: 'علوم الحاسب', instructorId: 3, enrolled: 60 },
];

export const MOCK_LECTURES = [
  { id: 1, courseId: 101, title: 'مقدمة في الخوارزميات', date: '2026-06-05', startTime: '09:00', endTime: '10:30', room: 'قاعة أ' },
  { id: 2, courseId: 101, title: 'هياكل البيانات', date: '2026-06-07', startTime: '09:00', endTime: '10:30', room: 'قاعة أ' },
  { id: 3, courseId: 102, title: 'منهجيات أجايل', date: '2026-06-06', startTime: '11:00', endTime: '12:30', room: 'معمل 3' },
];

export const MOCK_ATTENDANCE = [
  { id: 1, lectureId: 1, studentId: 4, status: 'حاضر', time: '08:55' },
  { id: 2, lectureId: 1, studentId: 5, status: 'متأخر', time: '09:15' },
  { id: 3, lectureId: 2, studentId: 4, status: 'غائب', time: '-' },
];

export const DASHBOARD_STATS = {
  admin: {
    totalStudents: 1250,
    totalInstructors: 85,
    totalCourses: 120,
    averageAttendance: '88%',
  },
  instructor: {
    activeCourses: 3,
    totalStudents: 265,
    upcomingLectures: 4,
    averageAttendance: '92%',
  },
  student: {
    enrolledCourses: 5,
    totalLectures: 45,
    attendedLectures: 40,
    attendanceRate: '89%',
  }
};
