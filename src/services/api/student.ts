import { apiClient } from './config';
import type { ApiResponse } from '../../types/api';

export interface StudentDashboardData {
  enrolled_classes: number;
  assignments_due: number;
  completed_assignments: number;
  overall_grade: number;
  upcoming_classes: Array<{
    id: number;
    name: string;
    subject: string;
    time: string;
  }>;
  recent_grades: Array<{
    id: number;
    assignment_name: string;
    grade: number;
    max_points: number;
    date: string;
  }>;
}

export interface Class {
  id: number;
  name: string;
  subject: string;
  tutor_name: string;
  schedule: string;
}

export interface ClassDetails {
  id: number;
  name: string;
  code: string;
  tutor_id: number;
  description: string;
  category: string;
  level: string;
  capacity: number;
  enrolled: number;
  credits: number;
  duration: string;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  pivot?: {
    student_id: number;
    class_id: number;
  };
  tutor: {
    id: number;
    user_id: number;
    department: string;
    specialization: string[];
    hourly_rate: string;
    bio: string;
    qualifications: string;
    experience_years: number;
    is_available: boolean;
    created_at: string;
    updated_at: string;
    user: {
      id: number;
      name: string;
      email: string;
      email_verified_at: string | null;
      role: string;
      avatar: string | null;
      phone: string | null;
      date_of_birth: string | null;
      address: string | null;
      is_active: boolean;
      created_at: string;
      updated_at: string;
    };
  };
  schedules: Array<{
    id: number;
    class_id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
    room: string | null;
    meeting_link: string | null;
    created_at: string;
    updated_at: string;
  }>;
  assignments: Array<{
    id: number;
    title: string;
    description: string;
    instructions: string;
    class_id: number;
    tutor_id: number;
    due_date: string;
    max_points: number;
    submission_type: string;
    allowed_file_types: string[];
    status: string;
    created_at: string;
    updated_at: string;
  }>;
  resources: Array<{
    id: number;
    title: string;
    description: string;
    type: string;
    category: string;
    tags: string;
    url: string;
    file_path: string | null;
    file_size: number | null;
    uploaded_by: number;
    class_id: number;
    is_public: boolean;
    downloads: number;
    created_at: string;
    updated_at: string;
  }>;
  sessions: any[];
  lessons: any[];
  materials: Array<{
    id: number;
    title: string;
    description: string;
    type: string;
    category: string;
    url: string;
    file_path: string | null;
    file_size: number | null;
    downloads: number;
    created_at: string;
  }>;
}

export interface Assignment {
  id: number;
  title: string;
  class: string;
  due_date: string;
  status: string;
  grade?: number;
}

export interface AssignmentDetails {
  id: number;
  title: string;
  description: string;
  instructions: string;
  class_id: number;
  tutor_id: number;
  due_date: string;
  max_points: number;
  submission_type: string;
  allowed_file_types: string[] | null;
  status: string;
  priority?: string;
  created_at: string;
  updated_at: string;
  class?: {
    id: number;
    name: string;
    subject: string;
  };
  class_model?: {
    id: number;
    name: string;
    code: string;
    category: string;
    tutor?: {
      id: number;
      user: {
        id: number;
        name: string;
        email: string;
      };
    };
  };
  tutor?: {
    id: number;
    user_id: number;
    user: {
      id: number;
      name: string;
      email: string;
    };
  };
  submissions?: any[];
}

export interface Grade {
  id: number;
  student_id: number;
  assignment_id: number;
  class_id: number;
  subject: string;
  assessment: string;
  grade: string;
  max_grade: string;
  category: string;
  date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  assignment?: {
    id: number;
    title: string;
    description: string;
    instructions: string;
    class_id: number;
    tutor_id: number;
    due_date: string;
    max_points: number;
    submission_type: string;
    allowed_file_types: string[];
    status: string;
    created_at: string;
    updated_at: string;
  };
}

export interface GradesResponse {
  data: {
    current_page: number;
    data: Grade[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      page: number | null;
      active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
  overall_average: number;
}

export interface AttendanceData {
  data: Array<{
    id: number;
    date: string;
    class: string;
    status: string;
    time: string;
  }>;
  stats: {
    total_sessions: number;
    present_count: number;
    absent_count: number;
    late_count: number;
    excused_count: number;
    attendance_rate: number;
  };
}

export const studentService = {
  // Dashboard
  getDashboard: async (): Promise<ApiResponse<StudentDashboardData>> => {
    const response = await apiClient.get<ApiResponse<StudentDashboardData>>(
      '/student/dashboard',
    );
    return response.data;
  },

  // Classes
  getClasses: async (): Promise<ApiResponse<Class[]>> => {
    const response = await apiClient.get<ApiResponse<Class[]>>(
      '/student/classes',
    );
    return response.data;
  },

  getClassDetails: async (id: number): Promise<ApiResponse<ClassDetails>> => {
    const response = await apiClient.get<ApiResponse<ClassDetails>>(
      `/student/classes/${id}`,
    );
    return response.data;
  },

  enrollInClass: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(
      `/student/classes/${id}/enroll`,
    );
    return response.data;
  },

  unenrollFromClass: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(
      `/student/classes/${id}/unenroll`,
    );
    return response.data;
  },

  // Assignments
  getAssignments: async (): Promise<ApiResponse<Assignment[]>> => {
    const response = await apiClient.get<ApiResponse<Assignment[]>>(
      '/student/assignments',
    );
    return response.data;
  },

  getAssignmentDetails: async (
    id: number,
  ): Promise<ApiResponse<AssignmentDetails>> => {
    const response = await apiClient.get<ApiResponse<AssignmentDetails>>(
      `/student/assignments/${id}`,
    );
    return response.data;
  },

  submitAssignment: async (
    assignmentId: number,
    data: { text_submission?: string; file?: any },
  ): Promise<ApiResponse<any>> => {
    const formData = new FormData();

    if (data.text_submission) {
      formData.append('text_submission', data.text_submission);
    }

    if (data.file) {
      const fileData: any = {
        uri: data.file.uri,
        type: data.file.type || 'application/octet-stream',
        name: data.file.name || 'file',
      };
      formData.append('file', fileData);
    }

    const response = await apiClient.post<ApiResponse<any>>(
      `/student/assignments/${assignmentId}/submit`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },

  getSubmissionDetails: async (
    assignmentId: number,
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/student/assignments/${assignmentId}/submission`,
    );
    return response.data;
  },

  submitQuestion: async (questionData: {
    subject: string;
    question: string;
    class_id?: number;
    attachments?: any[];
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(
      '/student/questions',
      questionData,
    );
    console.log('questionData', questionData);
    return response.data;
  },

  getQuestions: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/student/questions',
    );
    return response.data;
  },

  // Grades
  getGrades: async (): Promise<ApiResponse<GradesResponse>> => {
    const response = await apiClient.get<ApiResponse<GradesResponse>>(
      '/student/grades',
    );
    return response.data;
  },

  getGradeDetails: async (id: number): Promise<ApiResponse<Grade>> => {
    const response = await apiClient.get<ApiResponse<Grade>>(
      `/student/grades/${id}`,
    );
    return response.data;
  },

  // Attendance
  getAttendance: async (): Promise<ApiResponse<AttendanceData>> => {
    const response = await apiClient.get<ApiResponse<AttendanceData>>(
      '/student/attendance',
    );
    return response.data;
  },
};
