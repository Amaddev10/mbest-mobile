// Navigation Types
import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Tutor: NavigatorScreenParams<TutorStackParamList>;
  Student: NavigatorScreenParams<StudentStackParamList>;
  Parent: NavigatorScreenParams<ParentStackParamList>;
  Subscription: NavigatorScreenParams<SubscriptionStackParamList>;
  Profile: undefined; // Profile accessible from Header but not in bottom tabs
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type TutorTabParamList = {
  TutorDashboard: undefined;
  TutorCalendar: undefined;
  TutorStudents: undefined;
  TutorAssignments: undefined;
  TutorMore: undefined;
  Messages: undefined;
  Settings: undefined;
};

export type TutorStackParamList = {
  TutorTabs: NavigatorScreenParams<TutorTabParamList>;
  TutorClasses: undefined;
  TutorClassDetails: { classId: number };
  TutorStudentDetails: { studentId: number };
  TutorAssignmentDetails: { assignmentId: number };
  TutorLessonRequests: undefined;
  TutorSessions: undefined;
  TutorSessionDetails: { sessionId: number };
  AddLesson: { sessionId?: number } | undefined;
  TutorAvailability: undefined;
  TutorAttendance: undefined;
  TutorHours: undefined;
  TutorInvoices: undefined;
  TutorLessonHistory: undefined;
  TutorQuestions: undefined;
  TutorResources: undefined;
};

export type StudentTabParamList = {
  StudentDashboard: undefined;
  StudentClasses: undefined;
  StudentAssignments: undefined;
  StudentGrades: undefined;
  StudentAttendance: undefined;
  Messages: undefined;
  Settings: undefined;
  StudentResources: undefined;
};

export type StudentStackParamList = {
  StudentTabs: NavigatorScreenParams<StudentTabParamList>;
  ClassDetails: { classId: number };
  GradeDetails: { gradeId: number };
  MyQuestions: undefined;
  StudentResources: undefined;
};

export type SubscriptionStackParamList = {
  SubscriptionPackages: undefined;
  SubscriptionPayment: undefined;
  SubscriptionPending: undefined;
};

export type ParentTabParamList = {
  ParentDashboard: undefined;
  ParentClasses: undefined;
  ParentAssignments: undefined;
  ParentGrades: undefined;
  ParentAttendance: undefined;
  ParentBilling: undefined;
  Messages: undefined;
  Settings: undefined;
};

export type ParentStackParamList = {
  ParentTabs: NavigatorScreenParams<ParentTabParamList>;
  AddStudent: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
