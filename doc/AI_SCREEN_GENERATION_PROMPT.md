# AI Screen Generation Prompt for MBEST Mobile App

## 🎯 Instructions for AI

You are tasked with generating complete, production-ready React Native screens for the MBEST Mobile Application. This document provides all the specifications, patterns, and requirements needed to create any screen from the application.

**IMPORTANT:** When generating a screen, you MUST:
1. Follow the exact file structure and naming conventions
2. Use TypeScript with proper type definitions
3. Implement all UI elements and features specified
4. Include proper error handling and loading states
5. Use React Query for data fetching
6. Follow the design guidelines exactly
7. Include proper navigation integration
8. Add comprehensive comments

---

## 📦 Technology Stack

```typescript
// Required Dependencies
- React Native CLI 0.72.6
- TypeScript
- React Navigation 6.x (@react-navigation/native, @react-navigation/stack, @react-navigation/bottom-tabs)
- Zustand (State Management)
- Axios (HTTP Client)
- React Query (@tanstack/react-query)
- AsyncStorage (@react-native-async-storage/async-storage)
```

---

## 📁 File Structure Template

```
src/
├── screens/
│   ├── auth/              # Authentication screens
│   ├── admin/             # Admin screens
│   ├── tutor/             # Tutor screens
│   ├── student/           # Student screens
│   ├── parent/            # Parent screens
│   └── common/            # Common screens (all roles)
├── components/
│   ├── common/            # Reusable components
│   └── parent/            # Parent-specific components
├── services/
│   └── api/               # API service files
├── store/                 # Zustand stores
├── types/                 # TypeScript types
└── constants/             # App constants
```

---

## 🎨 Design System

### Colors
```typescript
// src/constants/colors.ts
export const colors = {
  primary: '#3B82F6',      // Blue
  secondary: '#8B5CF6',    // Purple
  success: '#10B981',      // Green
  warning: '#F59E0B',      // Orange
  error: '#EF4444',        // Red
  background: '#FFFFFF',
  surface: '#F9FAFB',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};
```

### Typography
```typescript
// Font families
- Headings: 'Inter-Bold'
- Body: 'Inter-Regular'
- Button: 'Inter-SemiBold'

// Font sizes
- h1: 32px
- h2: 24px
- h3: 20px
- body: 16px
- caption: 14px
- small: 12px
```

### Spacing
```typescript
// Base unit: 8px
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

---

## 📝 Screen Component Template

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/api/[role].ts'; // Replace [role] with actual role
import { colors } from '../../constants/colors';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface [ScreenName]ScreenProps {
  // Navigation props if needed
}

export const [ScreenName]Screen: React.FC<[ScreenName]ScreenProps> = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { user, token } = useAuthStore();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});

  // Data fetching with React Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['[queryKey]'],
    queryFn: () => apiService.[method](),
    enabled: !!token,
  });

  // Mutations
  const mutation = useMutation({
    mutationFn: (data) => apiService.[mutationMethod](data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['[queryKey]'] });
      Alert.alert('Success', 'Operation completed successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Something went wrong');
    },
  });

  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error loading data</Text>
        <Button title="Retry" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Screen content */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
});
```

---

## 🔌 API Service Pattern

```typescript
// src/services/api/[role].ts
import axios from 'axios';
import { apiClient } from './config';

export const [role]Service = {
  // GET request example
  getDashboard: async () => {
    const response = await apiClient.get('/[role]/dashboard');
    return response.data;
  },

  // POST request example
  createItem: async (data: CreateItemData) => {
    const response = await apiClient.post('/[role]/items', data);
    return response.data;
  },

  // PUT request example
  updateItem: async (id: number, data: UpdateItemData) => {
    const response = await apiClient.put(`/[role]/items/${id}`, data);
    return response.data;
  },

  // DELETE request example
  deleteItem: async (id: number) => {
    const response = await apiClient.delete(`/[role]/items/${id}`);
    return response.data;
  },
};
```

---

## 📋 Common Component Patterns

### Statistics Card
```typescript
<Card style={styles.statCard}>
  <Text style={styles.statLabel}>Total Students</Text>
  <Text style={styles.statValue}>{data.total_students}</Text>
</Card>
```

### List Item
```typescript
<TouchableOpacity
  style={styles.listItem}
  onPress={() => navigation.navigate('DetailScreen', { id: item.id })}
>
  <View style={styles.listItemContent}>
    <Text style={styles.listItemTitle}>{item.title}</Text>
    <Text style={styles.listItemSubtitle}>{item.subtitle}</Text>
  </View>
  <Text style={styles.listItemArrow}>›</Text>
</TouchableOpacity>
```

### Filter Bar
```typescript
<View style={styles.filterBar}>
  <Input
    placeholder="Search..."
    value={searchQuery}
    onChangeText={setSearchQuery}
    style={styles.searchInput}
  />
  <TouchableOpacity style={styles.filterButton}>
    <Text>Filter</Text>
  </TouchableOpacity>
</View>
```

### Empty State
```typescript
<View style={styles.emptyState}>
  <Text style={styles.emptyStateText}>No items found</Text>
  <Button title="Add New" onPress={() => {}} />
</View>
```

---

## 🎯 Screen Specifications

### Authentication Screens

#### 1. SplashScreen
**File:** `src/screens/auth/SplashScreen.tsx`
- Check authentication status
- Navigate to Login or Dashboard based on auth state
- Show app logo/branding
- Auto-navigate after 2-3 seconds

#### 2. LoginScreen
**File:** `src/screens/auth/LoginScreen.tsx`
**UI Elements:**
- Email Input (with validation)
- Password Input (with show/hide toggle)
- "Remember Me" Checkbox
- "Forgot Password?" Link
- "Sign In" Button
- "Don't have an account? Sign Up" Link

**API:** `POST /api/v1/auth/login`
**Request:** `{ email, password }`
**Response:** `{ success, data: { user, token } }`

#### 3. SignUpScreen
**File:** `src/screens/auth/SignUpScreen.tsx`
**UI Elements:**
- Name Input
- Email Input
- Password Input
- Confirm Password Input
- Role Picker (Student/Tutor/Parent)
- Terms & Conditions Checkbox
- "Sign Up" Button

**API:** `POST /api/v1/auth/register`
**Request:** `{ name, email, password, password_confirmation, role }`

#### 4. ForgotPasswordScreen
**File:** `src/screens/auth/ForgotPasswordScreen.tsx`
**UI Elements:**
- Email Input
- "Send Reset Link" Button
- Back to Login Link

---

### Admin Screens

#### 1. AdminDashboardScreen
**File:** `src/screens/admin/AdminDashboardScreen.tsx`
**UI Components:**
- 4 Statistics Cards (2x2 grid):
  - Total Students
  - Total Tutors
  - Total Classes
  - Monthly Revenue
- Recent Activities List (last 10 items)
- Quick Actions (buttons to navigate to main sections)

**API:** `GET /api/v1/admin/dashboard`
**Response:** `{ success, data: { total_students, total_tutors, total_classes, monthly_revenue, recent_activities } }`

#### 2. AdminUsersScreen
**File:** `src/screens/admin/AdminUsersScreen.tsx`
**Features:**
- Search bar
- Filter by role (All/Students/Tutors/Parents)
- User list with:
  - Avatar
  - Name
  - Email
  - Role badge
  - Actions (Edit/Delete)
- Floating Action Button (FAB) to create new user
- Create/Edit User Modal/Form

**API Endpoints:**
- `GET /api/v1/admin/users` - List users
- `POST /api/v1/admin/users` - Create user
- `PUT /api/v1/admin/users/{id}` - Update user
- `DELETE /api/v1/admin/users/{id}` - Delete user

#### 3. AdminClassesScreen
**File:** `src/screens/admin/AdminClassesScreen.tsx`
**Features:**
- Class list with search
- Create/Edit/Delete actions
- Class card showing:
  - Class name
  - Subject
  - Tutor name
  - Student count
  - Status

**API Endpoints:**
- `GET /api/v1/admin/classes` - List classes
- `POST /api/v1/admin/classes` - Create class
- `PUT /api/v1/admin/classes/{id}` - Update class
- `DELETE /api/v1/admin/classes/{id}` - Delete class

#### 4. AdminCalendarScreen
**File:** `src/screens/admin/AdminCalendarScreen.tsx`
**Features:**
- Calendar view (use react-native-calendars)
- Session cards showing:
  - Date & Time
  - Tutor name
  - Students (list)
  - Subject
  - Location
  - Status
- Filters: Tutor, Subject, Location, Status
- Create/Edit session modal

**API Endpoints:**
- `GET /api/v1/admin/calendar/sessions` - List sessions
- `POST /api/v1/admin/calendar/sessions` - Create session
- `PUT /api/v1/admin/calendar/sessions/{id}` - Update session

#### 5. AdminAnalyticsScreen
**File:** `src/screens/admin/AdminAnalyticsScreen.tsx`
**Features:**
- Revenue chart (line/bar chart)
- Enrollment trends chart
- User growth chart
- Class performance metrics
- Date range picker (start_date, end_date)

**API:** `GET /api/v1/admin/analytics?start_date={date}&end_date={date}`

#### 6. AdminBillingScreen
**File:** `src/screens/admin/AdminBillingScreen.tsx`
**Features:**
- Invoice list with filters (status: pending/paid/overdue)
- Invoice card showing:
  - Invoice number
  - Customer name
  - Amount
  - Due date
  - Status badge
- Create invoice button
- View invoice details

**API Endpoints:**
- `GET /api/v1/admin/billing/invoices` - List invoices
- `POST /api/v1/admin/billing/invoices` - Create invoice
- `GET /api/v1/admin/billing/invoices/{id}` - Get invoice
- `PUT /api/v1/admin/billing/invoices/{id}` - Update invoice

#### 7. AdminAttendanceScreen
**File:** `src/screens/admin/AdminAttendanceScreen.tsx`
**Features:**
- Attendance list with filters (date, tutor, class, status)
- Attendance record showing:
  - Session date/time
  - Tutor name
  - Student name
  - Status (Present/Absent/Late/Excused)
- Approve timesheets button
- Update attendance action

**API Endpoints:**
- `GET /api/v1/admin/attendance` - List attendance
- `GET /api/v1/admin/attendance/{id}` - Get attendance
- `PUT /api/v1/admin/attendance/{id}` - Update attendance
- `POST /api/v1/admin/attendance/timesheets/approve` - Approve timesheets

---

### Tutor Screens

#### 1. TutorDashboardScreen
**File:** `src/screens/tutor/TutorDashboardScreen.tsx`
**UI Components:**
- 4 Statistics Cards:
  - Upcoming Classes
  - Pending Assignments to Grade
  - Unread Messages
  - Total Students
- Upcoming Sessions List (next 5)
- Quick Actions

**API:** `GET /api/v1/tutor/dashboard`
**Response:** `{ success, data: { upcoming_classes, pending_assignments, unread_messages, total_students } }`

#### 2. TutorCalendarScreen
**File:** `src/screens/tutor/TutorCalendarScreen.tsx`
**Features:**
- Calendar view
- Session list for selected date
- Create session button
- Session form fields:
  - Date picker
  - Start Time picker
  - End Time picker
  - Subject input
  - Year Level input
  - Location (online/centre/home) picker
  - Session Type (1:1/group) picker
  - Students (multi-select)
- Edit/Delete session actions
- Add lesson notes button
- Mark attendance button

**API Endpoints:**
- `GET /api/v1/tutor/sessions` - List sessions
- `POST /api/v1/tutor/sessions` - Create session
- `PUT /api/v1/tutor/sessions/{id}` - Update session
- `DELETE /api/v1/tutor/sessions/{id}` - Delete session
- `POST /api/v1/tutor/sessions/{id}/notes` - Add notes
- `POST /api/v1/tutor/sessions/{id}/attendance` - Mark attendance

#### 3. TutorStudentsScreen
**File:** `src/screens/tutor/TutorStudentsScreen.tsx`
**Features:**
- Student list with search
- Filter by class
- Student card showing:
  - Avatar
  - Name
  - Class
  - Grade average
- Tap to view student details
- Navigate to student grades/assignments

**API Endpoints:**
- `GET /api/v1/tutor/students` - List students
- `GET /api/v1/tutor/students/{id}` - Get student details
- `GET /api/v1/tutor/students/{id}/grades` - Get student grades
- `GET /api/v1/tutor/students/{id}/assignments` - Get student assignments

#### 4. TutorAssignmentsScreen
**File:** `src/screens/tutor/TutorAssignmentsScreen.tsx`
**Features:**
- Assignment list
- Create assignment button
- Assignment card showing:
  - Title
  - Class
  - Due date
  - Submission count
  - Status
- Edit/Delete actions
- View submissions button

**API Endpoints:**
- `GET /api/v1/tutor/assignments` - List assignments
- `POST /api/v1/tutor/assignments` - Create assignment
- `PUT /api/v1/tutor/assignments/{id}` - Update assignment
- `DELETE /api/v1/tutor/assignments/{id}` - Delete assignment
- `GET /api/v1/tutor/assignments/{id}/submissions` - Get submissions

**Assignment Form Fields:**
- Title (required)
- Description
- Instructions
- Class (optional, dropdown)
- Due Date/Time (date-time picker)
- Max Points (number input)
- Submission Type (file/text/link) picker
- Allowed File Types (if file submission, multi-select)

#### 5. TutorAssignmentDetailScreen
**File:** `src/screens/tutor/TutorAssignmentDetailScreen.tsx`
**Features:**
- Assignment information display
- Submissions list with:
  - Student name
  - Submission date
  - Status (submitted/graded)
  - Grade (if graded)
- Tap submission to grade
- Grading form:
  - Grade input (number, max = assignment.max_points)
  - Feedback text area
  - Submit grade button
- Download submission files button

**API Endpoints:**
- `GET /api/v1/tutor/assignments/{id}` - Get assignment
- `GET /api/v1/tutor/assignments/{id}/submissions` - Get submissions
- `PUT /api/v1/tutor/submissions/{id}/grade` - Grade submission

---

### Student Screens

#### 1. StudentDashboardScreen
**File:** `src/screens/student/StudentDashboardScreen.tsx`
**UI Components:**
- 4 Statistics Cards:
  - Enrolled Classes
  - Assignments Due
  - Completed Assignments
  - Overall Grade
- Upcoming Classes List (next 5)
- Recent Grades List (last 5)
- Quick Actions

**API:** `GET /api/v1/student/dashboard`
**Response:** `{ success, data: { enrolled_classes, assignments_due, completed_assignments, overall_grade, upcoming_classes, recent_grades } }`

#### 2. StudentClassesScreen
**File:** `src/screens/student/StudentClassesScreen.tsx`
**Features:**
- Enrolled classes list
- Browse available classes section
- Class card showing:
  - Class name
  - Subject
  - Tutor name
  - Schedule
  - Enroll/Unenroll button
- View class details

**API Endpoints:**
- `GET /api/v1/student/classes` - List classes
- `GET /api/v1/student/classes/{id}` - Get class details
- `POST /api/v1/student/classes/{id}/enroll` - Enroll in class
- `POST /api/v1/student/classes/{id}/unenroll` - Unenroll from class

#### 3. StudentAssignmentsScreen
**File:** `src/screens/student/StudentAssignmentsScreen.tsx`
**Features:**
- Filter tabs: All/Due/Submitted/Graded
- Assignment list
- Assignment card showing:
  - Title
  - Class
  - Due date
  - Status badge
  - Grade (if graded)
- Tap to view details or submit

**API Endpoints:**
- `GET /api/v1/student/assignments` - List assignments
- `GET /api/v1/student/assignments/{id}` - Get assignment details
- `GET /api/v1/student/assignments/{id}/submission` - Get submission

#### 4. SubmitAssignmentScreen
**File:** `src/screens/student/SubmitAssignmentScreen.tsx`
**Features:**
- Assignment details display
- Submission form based on type:
  - **File Upload**: Document picker (PDF, DOC, DOCX, images), preview
  - **Text Submission**: Text area
  - **Link Submission**: URL input
- Submit button
- Update submission (if allowed)

**API:** `POST /api/v1/student/assignments/{id}/submit`
**Request:** `{ submission_type, content/file_url, text }`

#### 5. StudentGradesScreen
**File:** `src/screens/student/StudentGradesScreen.tsx`
**Features:**
- Grades list
- Filters: Class, Subject, Category
- Grade card showing:
  - Assignment/Exam name
  - Class
  - Grade (points/total)
  - Percentage
  - Date
- Overall average display
- Performance chart (optional)

**API Endpoints:**
- `GET /api/v1/student/grades` - List grades
- `GET /api/v1/student/grades/{id}` - Get grade details

#### 6. StudentAttendanceScreen
**File:** `src/screens/student/StudentAttendanceScreen.tsx`
**Features:**
- Attendance statistics cards:
  - Total Sessions
  - Present Count
  - Absent Count
  - Late Count
  - Attendance Rate (%)
- Attendance list with filters (date range, class, status)
- Attendance record showing:
  - Date
  - Class/Session
  - Status badge
  - Time

**API:** `GET /api/v1/student/attendance`
**Response:** `{ success, data: { data: [...], stats: { total_sessions, present_count, absent_count, late_count, excused_count, attendance_rate } } }`

#### 7. StudentQuestionsScreen
**File:** `src/screens/student/StudentQuestionsScreen.tsx`
**Features:**
- Questions list
- Ask new question button
- Question card showing:
  - Question text
  - Status (open/answered/closed)
  - Replies count
  - Date
- Tap to view question details and replies

**API Endpoints:**
- `GET /api/v1/student/questions` - List questions
- `POST /api/v1/student/questions` - Ask question
- `GET /api/v1/student/questions/{id}` - Get question details

#### 8. StudentResourcesScreen
**File:** `src/screens/student/StudentResourcesScreen.tsx`
**Features:**
- Resource list
- Search bar
- Filters: Class, Type, Category
- Resource card showing:
  - Title
  - Type icon
  - Class
  - File size
  - Download button
- Download functionality

**API Endpoints:**
- `GET /api/v1/resources` - List resources
- `GET /api/v1/resources/{id}` - Get resource details
- `GET /api/v1/resources/{id}/download` - Download resource

---

### Parent Screens

#### 1. ParentDashboardScreen
**File:** `src/screens/parent/ParentDashboardScreen.tsx`
**UI Components:**
- Child Switcher component at top (dropdown/picker)
- 4 Statistics Cards for selected child:
  - Overall Grade
  - Attendance Rate
  - Enrolled Classes
  - Active Assignments
- Recent Activities List
- Quick Links

**API:** `GET /api/v1/parent/dashboard`
**Response:** `{ success, data: { children: [...], active_child: {...}, stats: {...} } }`

**Note:** Must use ChildSwitcher component to switch between children.

#### 2. ParentClassesScreen
**File:** `src/screens/parent/ParentClassesScreen.tsx`
**Features:**
- Child Switcher at top
- Classes list for selected child
- Class card showing:
  - Class name
  - Subject
  - Tutor name
  - Schedule
- View class details
- View class schedule

**API:** `GET /api/v1/parent/children/{childId}/classes`

#### 3. ParentAssignmentsScreen
**File:** `src/screens/parent/ParentAssignmentsScreen.tsx`
**Features:**
- Child Switcher at top
- Assignments list for selected child
- Filter by status
- Assignment card showing:
  - Title
  - Class
  - Due date
  - Submission status
  - Grade (if graded)
- View assignment details

**API Endpoints:**
- `GET /api/v1/parent/children/{childId}/assignments` - List assignments
- `GET /api/v1/parent/children/{childId}/assignments/{assignmentId}` - Get assignment

#### 4. ParentGradesScreen
**File:** `src/screens/parent/ParentGradesScreen.tsx`
**Features:**
- Child Switcher at top
- Grades list for selected child
- Filters: Class, Subject, Category
- Statistics:
  - Overall average
  - Highest grade
  - Lowest grade
- Average by subject breakdown
- Grade cards

**API:** `GET /api/v1/parent/children/{childId}/grades`

#### 5. ParentAttendanceScreen
**File:** `src/screens/parent/ParentAttendanceScreen.tsx`
**Features:**
- Child Switcher at top
- Attendance statistics cards
- Attendance records list
- Filters: Date range, Class, Status

**API:** `GET /api/v1/parent/children/{childId}/attendance`

#### 6. ParentLessonHistoryScreen
**File:** `src/screens/parent/ParentLessonHistoryScreen.tsx`
**Features:**
- Child Switcher at top
- Sessions list for selected child
- Filters: Date, Status, Subject, Tutor
- Session card showing:
  - Date & Time
  - Subject
  - Tutor name
  - Duration
  - Status
- View session details
- View lesson notes and student notes

**API Endpoints:**
- `GET /api/v1/parent/children/{childId}/sessions` - List sessions
- `GET /api/v1/parent/children/{childId}/sessions/{sessionId}` - Get session

#### 7. ParentBillingScreen
**File:** `src/screens/parent/ParentBillingScreen.tsx`
**Features:**
- Invoice list
- Filter by child, status
- Invoice card showing:
  - Invoice number
  - Amount
  - Due date
  - Status
  - Child name
- View invoice details
- Download invoice PDF button

**API Endpoints:**
- `GET /api/v1/parent/billing/invoices` - List invoices
- `GET /api/v1/parent/billing/invoices/{id}` - Get invoice
- `GET /api/v1/parent/billing/invoices/{id}/pdf` - Download PDF

---

### Common Screens (All Roles)

#### 1. MessagesScreen
**File:** `src/screens/common/MessagesScreen.tsx`
**Features:**
- Message threads list
- Thread card showing:
  - Contact name/avatar
  - Last message preview
  - Unread count badge
  - Timestamp
- Tap to open chat
- Chat interface:
  - Message list
  - Input field
  - Send button
  - Attach file button
- Mark as read
- Delete message

**API Endpoints:**
- `GET /api/v1/messages/threads` - List threads
- `GET /api/v1/messages?thread_id={threadId}` - Get messages
- `POST /api/v1/messages` - Send message
- `PUT /api/v1/messages/{id}/read` - Mark as read
- `DELETE /api/v1/messages/{id}` - Delete message

#### 2. NotificationsScreen
**File:** `src/screens/common/NotificationsScreen.tsx`
**Features:**
- Notification list
- Filter by type (Payment/Class/Grade/Assignment/General)
- Notification card showing:
  - Icon (type-based)
  - Title
  - Message
  - Timestamp
  - Unread indicator
- Mark as read (swipe or tap)
- Mark all as read button
- Delete notification
- Unread count badge

**API Endpoints:**
- `GET /api/v1/notifications` - List notifications
- `GET /api/v1/notifications/unread-count` - Get unread count
- `PUT /api/v1/notifications/{id}/read` - Mark as read
- `PUT /api/v1/notifications/read-all` - Mark all as read
- `DELETE /api/v1/notifications/{id}` - Delete notification

#### 3. ResourcesScreen
**File:** `src/screens/common/ResourcesScreen.tsx`
**Features:**
- Resource list
- Search bar
- Filters: Class, Type, Category
- Resource card showing:
  - Title
  - Type icon
  - Class
  - File size
  - Upload date
- Download button
- Upload button (tutor/admin only)
- View resource details

**API Endpoints:**
- `GET /api/v1/resources` - List resources
- `GET /api/v1/resources/{id}` - Get resource
- `POST /api/v1/resources` - Upload (tutor/admin)
- `GET /api/v1/resources/{id}/download` - Download
- `PUT /api/v1/resources/{id}` - Update (tutor/admin)
- `DELETE /api/v1/resources/{id}` - Delete (tutor/admin)

#### 4. ProfileScreen
**File:** `src/screens/common/ProfileScreen.tsx`
**Features:**
- Profile header with avatar
- Edit profile button
- Profile information:
  - Name
  - Email
  - Phone
  - Date of Birth
  - Address
- Role-specific fields:
  - **Tutor**: Department, Specialization, Hourly Rate, Bio, Qualifications
  - **Student**: Grade, School, Enrollment ID, Emergency Contact
  - **Parent**: Relationship
- Change password section
- Upload avatar button

**API Endpoints:**
- `GET /api/v1/profile` - Get profile
- `PUT /api/v1/profile` - Update profile
- `POST /api/v1/profile/avatar` - Upload avatar
- `PUT /api/v1/profile/password` - Change password

#### 5. SettingsScreen
**File:** `src/screens/common/SettingsScreen.tsx`
**Features:**
- Theme toggle (Light/Dark) switch
- Notification preferences:
  - Push notifications toggle
  - Email notifications toggle
  - Notification types checkboxes
- Language settings (picker)
- About section:
  - App version
  - Terms & Conditions link
  - Privacy Policy link
- Logout button (with confirmation)

---

## 🔧 Required Imports Pattern

```typescript
// React Native core
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';

// Navigation
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp, RouteProp } from '@react-navigation/native';

// Data fetching
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// State management
import { useAuthStore } from '../../store/authStore';

// API services
import { [role]Service } from '../../services/api/[role]';

// Components
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

// Constants
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';

// Types
import type { [Type] } from '../../types/api';
```

---

## ✅ Checklist for Generated Screens

When generating a screen, ensure:

- [ ] File is placed in correct directory (`src/screens/[role]/`)
- [ ] File name follows convention (`[Role][ScreenName]Screen.tsx`)
- [ ] TypeScript types are properly defined
- [ ] All UI elements from specification are implemented
- [ ] API integration using React Query
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Empty states handled
- [ ] Navigation integrated
- [ ] Styles follow design system
- [ ] Proper spacing and layout
- [ ] Accessibility labels added
- [ ] Comments added for complex logic
- [ ] Form validation implemented (if applicable)
- [ ] Success/error alerts implemented
- [ ] Refresh functionality (pull-to-refresh)
- [ ] Search/filter functionality (if specified)

---

## 🚀 Usage Instructions

To generate a screen using this prompt:

1. **Specify the screen name** you want to generate (e.g., "AdminDashboardScreen")
2. **AI will:**
   - Find the specification in this document
   - Generate complete TypeScript React Native component
   - Include all required imports
   - Implement all UI elements
   - Add API integration
   - Include proper error handling
   - Follow design guidelines
   - Add comprehensive comments

3. **Example prompt to AI:**
   ```
   Generate the StudentDashboardScreen based on the specifications in 
   AI_SCREEN_GENERATION_PROMPT.md
   ```

---

## 📝 Notes

- All API calls should use the base URL from `src/services/api/config.ts`
- Authentication token is automatically added via API client interceptor
- Use React Query for all data fetching (no direct axios calls in components)
- All screens should handle loading, error, and empty states
- Use the provided color constants, don't hardcode colors
- Follow the spacing system (8px base unit)
- Add proper TypeScript types for all data structures
- Include proper error messages and user feedback
- Implement pull-to-refresh where appropriate
- Add proper navigation types if using TypeScript navigation

---

**Version:** 1.0.0  
**Last Updated:** 2024

