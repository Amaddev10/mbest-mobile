/**
 * App Navigator - Main Navigation Structure
 */

import React, { useEffect } from 'react';
import { Text, TouchableOpacity, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { Icon } from '../components/common/Icon';
import { ProfileHeaderButton } from '../components/common/ProfileHeaderButton';

// Screens
import { SplashScreen } from '../screens/auth/SplashScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';

// Tutor Screens
import { TutorDashboardScreen } from '../screens/tutor/TutorDashboardScreen';
import { TutorCalendarScreen } from '../screens/tutor/TutorCalendarScreen';
import { TutorStudentsScreen } from '../screens/tutor/TutorStudentsScreen';
import { TutorAssignmentsScreen } from '../screens/tutor/TutorAssignmentsScreen';
import { TutorMoreScreen } from '../screens/tutor/TutorMoreScreen';
import { TutorClassesScreen } from '../screens/tutor/TutorClassesScreen';
import { TutorClassDetailsScreen } from '../screens/tutor/TutorClassDetailsScreen';
import { TutorStudentDetailsScreen } from '../screens/tutor/TutorStudentDetailsScreen';
import { TutorAssignmentDetailsScreen } from '../screens/tutor/TutorAssignmentDetailsScreen';
import { TutorLessonRequestsScreen } from '../screens/tutor/TutorLessonRequestsScreen';
import { TutorSessionsScreen } from '../screens/tutor/TutorSessionsScreen';
import { TutorSessionDetailsScreen } from '../screens/tutor/TutorSessionDetailsScreen';
import { TutorAvailabilityScreen } from '../screens/tutor/TutorAvailabilityScreen';
import { TutorAttendanceScreen } from '../screens/tutor/TutorAttendanceScreen';
import { TutorHoursScreen } from '../screens/tutor/TutorHoursScreen';
import { TutorInvoicesScreen } from '../screens/tutor/TutorInvoicesScreen';
import { TutorLessonHistoryScreen } from '../screens/tutor/TutorLessonHistoryScreen';
import { TutorQuestionsScreen } from '../screens/tutor/TutorQuestionsScreen';
import { AddLessonScreen } from '../screens/tutor/AddLessonScreen';
import { TutorResourcesScreen } from '../screens/tutor/TutorResourcesScreen';

// Student Screens
import { StudentDashboardScreen } from '../screens/student/StudentDashboardScreen';
import { StudentClassesScreen } from '../screens/student/StudentClassesScreen';
import { StudentAssignmentsScreen } from '../screens/student/StudentAssignmentsScreen';
import { StudentGradesScreen } from '../screens/student/StudentGradesScreen';
import { StudentAttendanceScreen } from '../screens/student/StudentAttendanceScreen';
import { StudentGradeDetailsScreen } from '../screens/student/StudentGradeDetailsScreen';
import { StudentClassDetailsScreen } from '../screens/student/StudentClassDetailsScreen';
import { MyQuestionsScreen } from '../screens/student/MyQuestionsScreen';

// Parent Screens
import { ParentDashboardScreen } from '../screens/parent/ParentDashboardScreen';
import { ParentClassesScreen } from '../screens/parent/ParentClassesScreen';
import { ParentAssignmentsScreen } from '../screens/parent/ParentAssignmentsScreen';
import { ParentGradesScreen } from '../screens/parent/ParentGradesScreen';
import { ParentAttendanceScreen } from '../screens/parent/ParentAttendanceScreen';
import { ParentBillingScreen } from '../screens/parent/ParentBillingScreen';
import { AddStudentScreen } from '../screens/parent/AddStudentScreen';

// Common Screens
import { MessagesScreen } from '../screens/common/MessagesScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';
import { SettingsScreen } from '../screens/common/SettingsScreen';
import { ParentGate } from '../components/ParentGate';

import type { RootStackParamList, AuthStackParamList, TutorTabParamList, TutorStackParamList, StudentTabParamList, StudentStackParamList, ParentTabParamList, ParentStackParamList } from '../types/navigation';

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const TutorTab = createBottomTabNavigator<TutorTabParamList>();
const TutorStack = createStackNavigator<TutorStackParamList>();
const StudentTab = createBottomTabNavigator<StudentTabParamList>();
const StudentStack = createStackNavigator<StudentStackParamList>();
const ParentTab = createBottomTabNavigator<ParentTabParamList>();
const ParentStack = createStackNavigator<ParentStackParamList>();

// Auth Stack Navigator
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
};

// Tutor Tab Navigator (used inside TutorStack)
const TutorTabsNavigator = () => {
  const insets = useSafeAreaInsets();
  const safeBottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? spacing.sm : spacing.xs);
  const baseHeight = Platform.OS === 'ios' ? 60 : 64;
  
  return (
    <TutorTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        headerStyle: { 
          backgroundColor: colors.primary,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: colors.textInverse,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          letterSpacing: 0.5,
          includeFontPadding: false,
          lineHeight: 26,
        },
        headerRight: () => <ProfileHeaderButton />,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          paddingTop: spacing.sm,
          paddingBottom: safeBottomPadding,
          height: baseHeight + safeBottomPadding,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: Platform.OS === 'ios' ? -2 : -4 },
          shadowOpacity: 0.15,
          shadowRadius: Platform.OS === 'ios' ? 8 : 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
          includeFontPadding: false,
          lineHeight: 14,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <TutorTab.Screen 
        name="TutorDashboard" 
        component={TutorDashboardScreen} 
        options={{ 
          headerShown: false, // Use custom Header component
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size || 22} color={color} />
          ),
        }} 
      />
      <TutorTab.Screen 
        name="TutorCalendar" 
        component={TutorCalendarScreen} 
        options={{ 
          headerShown: false, // Use custom Header component
          tabBarLabel: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar" size={size || 20} color={color} />
          ),
        }} 
      />
      <TutorTab.Screen 
        name="TutorStudents" 
        component={TutorStudentsScreen} 
        options={{ 
          headerShown: false, // Use custom Header component
          tabBarLabel: 'Students',
          tabBarIcon: ({ color, size }) => (
            <Icon name="users" size={size || 20} color={color} />
          ),
        }} 
      />
      <TutorTab.Screen 
        name="TutorAssignments" 
        component={TutorAssignmentsScreen} 
        options={{ 
          headerShown: false, // Use custom Header component
          tabBarLabel: 'Assignments',
          tabBarIcon: ({ color, size }) => (
            <Icon name="file-text" size={size || 20} color={color} />
          ),
        }} 
      />
      <TutorTab.Screen 
        name="TutorMore" 
        component={TutorMoreScreen} 
        options={{ 
          headerShown: false, // Use custom Header component
          tabBarLabel: 'More', 
          tabBarIcon: ({ color, size }) => (
            <Icon name="more-vertical" size={size || 20} color={color} />
          ),
        }} 
      />
    </TutorTab.Navigator>
  );
};

// Tutor Stack Navigator (wraps tabs and includes detail screens)
const TutorNavigator = () => {
  return (
    <TutorStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <TutorStack.Screen name="TutorTabs" component={TutorTabsNavigator} />
      <TutorStack.Screen name="TutorClasses" component={TutorClassesScreen} />
      <TutorStack.Screen name="TutorClassDetails" component={TutorClassDetailsScreen} />
      <TutorStack.Screen name="TutorStudentDetails" component={TutorStudentDetailsScreen} />
      <TutorStack.Screen name="TutorAssignmentDetails" component={TutorAssignmentDetailsScreen} />
      <TutorStack.Screen name="TutorLessonRequests" component={TutorLessonRequestsScreen} />
      <TutorStack.Screen name="TutorSessions" component={TutorSessionsScreen} />
      <TutorStack.Screen name="TutorSessionDetails" component={TutorSessionDetailsScreen} />
      <TutorStack.Screen name="AddLesson" component={AddLessonScreen} />
      <TutorStack.Screen name="TutorAvailability" component={TutorAvailabilityScreen} />
      <TutorStack.Screen name="TutorAttendance" component={TutorAttendanceScreen} />
      <TutorStack.Screen name="TutorHours" component={TutorHoursScreen} />
      <TutorStack.Screen name="TutorInvoices" component={TutorInvoicesScreen} />
      <TutorStack.Screen name="TutorLessonHistory" component={TutorLessonHistoryScreen} />
      <TutorStack.Screen name="TutorQuestions" component={TutorQuestionsScreen} />
      <TutorStack.Screen name="TutorResources" component={TutorResourcesScreen} />
    </TutorStack.Navigator>
  );
};

// Student Tab Navigator
const StudentTabsNavigator = () => {
  const insets = useSafeAreaInsets();
  const safeBottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? spacing.sm : spacing.xs);
  const baseHeight = Platform.OS === 'ios' ? 60 : 64;
  
  return (
    <StudentTab.Navigator
      screenOptions={{
        headerShown: false, // We'll use custom Header component
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          paddingTop: spacing.sm,
          paddingBottom: safeBottomPadding,
          height: baseHeight + safeBottomPadding,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: Platform.OS === 'ios' ? -2 : -4 },
          shadowOpacity: 0.15,
          shadowRadius: Platform.OS === 'ios' ? 8 : 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
          includeFontPadding: false,
          lineHeight: 14,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <StudentTab.Screen 
        name="StudentDashboard" 
        component={StudentDashboardScreen} 
        options={{ 
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size || 22} color={color} />
          ),
        }} 
      />
      <StudentTab.Screen 
        name="StudentClasses" 
        component={StudentClassesScreen} 
        options={{ 
          title: 'Classes', 
          tabBarLabel: 'Classes',
          tabBarIcon: ({ color, size }) => (
            <Icon name="book" size={size || 20} color={color} />
          ),
        }} 
      />
      <StudentTab.Screen 
        name="StudentAssignments" 
        component={StudentAssignmentsScreen} 
        options={{ 
          title: 'Assignments', 
          tabBarLabel: 'Assignments',
          tabBarIcon: ({ color, size }) => (
            <Icon name="file-text" size={size || 20} color={color} />
          ),
        }} 
      />
      <StudentTab.Screen 
        name="StudentGrades" 
        component={StudentGradesScreen} 
        options={{ 
          title: 'Grades', 
          tabBarLabel: 'Grades',
          tabBarIcon: ({ color, size }) => (
            <Icon name="star" size={size || 20} color={color} />
          ),
        }} 
      />
      <StudentTab.Screen 
        name="StudentAttendance" 
        component={StudentAttendanceScreen} 
        options={{ 
          title: 'Attendance', 
          tabBarLabel: 'Attendance',
          tabBarIcon: ({ color, size }) => (
            <Icon name="check-circle" size={size || 20} color={color} />
          ),
        }} 
      />
    </StudentTab.Navigator>
  );
};

// Student Stack Navigator (wraps tabs and includes detail screens)
const StudentNavigator = () => {
  return (
    <StudentStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <StudentStack.Screen name="StudentTabs" component={StudentTabsNavigator} />
      <StudentStack.Screen 
        name="GradeDetails" 
        component={StudentGradeDetailsScreen}
        options={{
          headerShown: false,
          headerStyle: {
            backgroundColor: colors.primary,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTintColor: colors.textInverse,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 20,
            letterSpacing: 0.5,
            includeFontPadding: false,
            lineHeight: 26,
          },
          title: 'Grade Details',
        }}
      />
      <StudentStack.Screen 
        name="ClassDetails" 
        component={StudentClassDetailsScreen}
        options={{
          headerShown: false,
          headerStyle: {
            backgroundColor: colors.primary,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTintColor: colors.textInverse,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 20,
            letterSpacing: 0.5,
            includeFontPadding: false,
            lineHeight: 26,
          },
          title: 'Class Details',
        }}
      />
      <StudentStack.Screen 
        name="MyQuestions" 
        component={MyQuestionsScreen}
        options={{
          headerShown: false,
        }}
      />
    </StudentStack.Navigator>
  );
};

// Parent Tab Navigator (used inside ParentStack)
const ParentTabsNavigator = () => {
  const insets = useSafeAreaInsets();
  const safeBottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? spacing.sm : spacing.xs);
  const baseHeight = Platform.OS === 'ios' ? 60 : 64;
  
  return (
    <ParentTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        headerStyle: { 
          backgroundColor: colors.primary,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: colors.textInverse,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          letterSpacing: 0.5,
          includeFontPadding: false,
          lineHeight: 26,
        },
        headerRight: () => <ProfileHeaderButton />,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          paddingTop: spacing.sm,
          paddingBottom: safeBottomPadding,
          height: baseHeight + safeBottomPadding,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: Platform.OS === 'ios' ? -2 : -4 },
          shadowOpacity: 0.15,
          shadowRadius: Platform.OS === 'ios' ? 8 : 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
          includeFontPadding: false,
          lineHeight: 14,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <ParentTab.Screen 
        name="ParentDashboard" 
        component={ParentDashboardScreen} 
        options={{ 
          title: 'Parent Dashboard', 
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size || 22} color={color} />
          ),
        }} 
      />
      <ParentTab.Screen 
        name="ParentClasses" 
        component={ParentClassesScreen} 
        options={{ 
          title: 'Classes', 
          tabBarLabel: 'Classes',
          tabBarIcon: ({ color, size }) => (
            <Icon name="book" size={size || 20} color={color} />
          ),
        }} 
      />
      <ParentTab.Screen 
        name="ParentAssignments" 
        component={ParentAssignmentsScreen} 
        options={{ 
          title: 'Assignments', 
          tabBarLabel: 'Assignments',
          tabBarIcon: ({ color, size }) => (
            <Icon name="file-text" size={size || 20} color={color} />
          ),
        }} 
      />
      <ParentTab.Screen 
        name="ParentGrades" 
        component={ParentGradesScreen} 
        options={{ 
          title: 'Grades', 
          tabBarLabel: 'Grades',
          tabBarIcon: ({ color, size }) => (
            <Icon name="star" size={size || 20} color={color} />
          ),
        }} 
      />
      <ParentTab.Screen 
        name="ParentAttendance" 
        component={ParentAttendanceScreen} 
        options={{ 
          title: 'Attendance Tracking', 
          tabBarLabel: 'Attendance',
          tabBarIcon: ({ color, size }) => (
            <Icon name="activity" size={size || 20} color={color} />
          ),
        }} 
      />
      <ParentTab.Screen 
        name="ParentBilling" 
        component={ParentBillingScreen} 
        options={{ 
          title: 'Billing', 
          tabBarLabel: 'Billing',
          tabBarIcon: ({ color, size }) => (
            <Icon name="credit-card" size={size || 20} color={color} />
          ),
        }} 
      />
    </ParentTab.Navigator>
  );
};

// Parent Stack Navigator (wraps tabs and includes detail screens)
const ParentNavigator = () => {
  return (
    <ParentStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ParentStack.Screen name="ParentTabs" component={ParentTabsNavigator} />
      <ParentStack.Screen
        name="AddStudent"
        component={AddStudentScreen}
        options={{
          headerShown: false,
        }}
      />
    </ParentStack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const loadAuth = useAuthStore((state) => state.loadAuth);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    // Load auth state on mount
    if (loadAuth) {
      loadAuth().finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [loadAuth]);

  // Force re-render when authentication state changes
  useEffect(() => {
    // This ensures the NavigationContainer updates when auth state changes
  }, [isAuthenticated]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer key={isAuthenticated ? 'authenticated' : 'unauthenticated'}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            {user?.role === 'tutor' && <RootStack.Screen name="Tutor" component={TutorNavigator} />}
            {user?.role === 'student' && <RootStack.Screen name="Student" component={StudentNavigator} />}
            {user?.role === 'parent' && <RootStack.Screen name="Parent" component={ParentGate} />}
            <RootStack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{
                headerShown: false,
              }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export { AppNavigator, ParentNavigator };
export default AppNavigator;
