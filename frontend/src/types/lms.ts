export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  createdAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  price: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  rating: number;
  totalStudents: number;
  totalLessons: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  duration: string;
  videoUrl?: string;
  order: number;
  isCompleted?: boolean;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  progress: number;
  status: 'active' | 'completed';
  completedLessons: string[];
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  duration: number; // in minutes
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  userId: string;
  answers: number[];
  score: number;
  submittedAt: Date;
  timeSpent: number;
}

export interface Review {
  id: string;
  userId: string;
  courseId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  userName: string;
}

export interface Assignment {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  dueDate: Date;
  maxFileSize: number; // in MB
  allowedFormats: string[];
  maxScore: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  userId: string;
  fileName: string;
  fileSize: number;
  submittedAt: Date;
  grade?: number;
  feedback?: string;
  status: 'pending' | 'graded';
}

// Exercise types for online exercises
export interface Exercise {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  type: 'coding' | 'fill-blank' | 'short-answer';
  timeLimit?: number; // in minutes
  questions: ExerciseQuestion[];
}

export interface ExerciseQuestion {
  id: string;
  question: string;
  type: 'coding' | 'fill-blank' | 'short-answer';
  placeholder?: string;
  expectedAnswer?: string;
  hints?: string[];
  points: number;
}

export interface ExerciseSubmission {
  id: string;
  exerciseId: string;
  userId: string;
  answers: ExerciseAnswer[];
  totalScore: number;
  maxScore: number;
  submittedAt: Date;
  timeSpent: number;
}

export interface ExerciseAnswer {
  questionId: string;
  answer: string;
  isCorrect?: boolean;
  score: number;
}
