import { describe, it, expect } from 'vitest';
import type { 
  User, 
  Course, 
  Lesson, 
  Enrollment, 
  Quiz, 
  QuizQuestion, 
  QuizSubmission,
  Review,
  Assignment,
  AssignmentSubmission,
  Exercise,
  ExerciseQuestion,
  ExerciseSubmission,
  ExerciseAnswer
} from '@/types/lms';

describe('LMS Types', () => {
  describe('User type', () => {
    it('should have correct structure', () => {
      const user: User = {
        id: 'u_1',
        email: 'test@example.com',
        fullName: 'Test User',
        createdAt: new Date()
      };
      
      expect(user.id).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.fullName).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should allow optional avatar', () => {
      const userWithAvatar: User = {
        id: 'u_1',
        email: 'test@example.com',
        fullName: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        createdAt: new Date()
      };
      
      expect(userWithAvatar.avatar).toBeDefined();
    });
  });

  describe('Course type', () => {
    it('should have correct structure', () => {
      const course: Course = {
        id: 'c_1',
        title: 'Test Course',
        description: 'Test Description',
        instructor: 'Test Instructor',
        thumbnail: 'https://example.com/thumb.jpg',
        price: 999000,
        duration: '10 hours',
        level: 'Beginner',
        category: 'Programming',
        rating: 4.5,
        totalStudents: 100,
        totalLessons: 10,
        lessons: []
      };
      
      expect(course.id).toBeDefined();
      expect(course.level).toMatch(/Beginner|Intermediate|Advanced/);
    });
  });

  describe('Lesson type', () => {
    it('should have correct structure', () => {
      const lesson: Lesson = {
        id: 'l_1',
        courseId: 'c_1',
        title: 'Lesson 1',
        description: 'First lesson',
        duration: '30 min',
        order: 1
      };
      
      expect(lesson.id).toBeDefined();
      expect(lesson.courseId).toBeDefined();
      expect(lesson.order).toBeGreaterThan(0);
    });

    it('should allow optional videoUrl', () => {
      const lesson: Lesson = {
        id: 'l_1',
        courseId: 'c_1',
        title: 'Lesson 1',
        description: 'First lesson',
        duration: '30 min',
        order: 1,
        videoUrl: 'https://example.com/video.mp4'
      };
      
      expect(lesson.videoUrl).toBeDefined();
    });
  });

  describe('Enrollment type', () => {
    it('should have correct structure', () => {
      const enrollment: Enrollment = {
        id: 'e_1',
        userId: 'u_1',
        courseId: 'c_1',
        enrolledAt: new Date(),
        progress: 50,
        status: 'active',
        completedLessons: ['l_1', 'l_2']
      };
      
      expect(enrollment.status).toMatch(/active|completed/);
      expect(enrollment.progress).toBeGreaterThanOrEqual(0);
      expect(enrollment.progress).toBeLessThanOrEqual(100);
    });
  });

  describe('Quiz type', () => {
    it('should have correct structure', () => {
      const quiz: Quiz = {
        id: 'q_1',
        lessonId: 'l_1',
        title: 'Quiz 1',
        duration: 15,
        questions: [
          {
            id: 'qq_1',
            question: 'What is 1+1?',
            options: ['1', '2', '3', '4'],
            correctAnswer: 1
          }
        ]
      };
      
      expect(quiz.questions).toHaveLength(1);
      expect(quiz.duration).toBeGreaterThan(0);
    });
  });

  describe('QuizSubmission type', () => {
    it('should have correct structure', () => {
      const submission: QuizSubmission = {
        id: 'qs_1',
        quizId: 'q_1',
        userId: 'u_1',
        answers: [1, 0, 2],
        score: 80,
        submittedAt: new Date(),
        timeSpent: 600
      };
      
      expect(submission.score).toBeGreaterThanOrEqual(0);
      expect(submission.timeSpent).toBeGreaterThan(0);
    });
  });

  describe('Assignment type', () => {
    it('should have correct structure', () => {
      const assignment: Assignment = {
        id: 'a_1',
        lessonId: 'l_1',
        title: 'Assignment 1',
        description: 'Complete the homework',
        dueDate: new Date(),
        maxFileSize: 10,
        allowedFormats: ['pdf', 'docx'],
        maxScore: 100
      };
      
      expect(assignment.maxFileSize).toBeGreaterThan(0);
      expect(assignment.allowedFormats).toContain('pdf');
    });
  });

  describe('AssignmentSubmission type', () => {
    it('should have correct structure', () => {
      const submission: AssignmentSubmission = {
        id: 'as_1',
        assignmentId: 'a_1',
        userId: 'u_1',
        fileName: 'homework.pdf',
        fileSize: 1024,
        submittedAt: new Date(),
        status: 'pending'
      };
      
      expect(submission.status).toMatch(/pending|graded/);
    });

    it('should allow optional grade and feedback', () => {
      const submission: AssignmentSubmission = {
        id: 'as_1',
        assignmentId: 'a_1',
        userId: 'u_1',
        fileName: 'homework.pdf',
        fileSize: 1024,
        submittedAt: new Date(),
        status: 'graded',
        grade: 85,
        feedback: 'Good work!'
      };
      
      expect(submission.grade).toBeDefined();
      expect(submission.feedback).toBeDefined();
    });
  });

  describe('Exercise type', () => {
    it('should have correct structure', () => {
      const exercise: Exercise = {
        id: 'ex_1',
        lessonId: 'l_1',
        title: 'Coding Exercise',
        description: 'Write a function',
        type: 'coding',
        questions: []
      };
      
      expect(exercise.type).toMatch(/coding|fill-blank|short-answer/);
    });
  });

  describe('ExerciseSubmission type', () => {
    it('should have correct structure', () => {
      const submission: ExerciseSubmission = {
        id: 'es_1',
        exerciseId: 'ex_1',
        userId: 'u_1',
        answers: [
          { questionId: 'q1', answer: 'test', score: 10 }
        ],
        totalScore: 10,
        maxScore: 10,
        submittedAt: new Date(),
        timeSpent: 300
      };
      
      expect(submission.totalScore).toBeLessThanOrEqual(submission.maxScore);
    });
  });
});
