import { describe, it, expect } from 'vitest';
import { mockCourses, mockQuizzes, mockAssignments, mockExercises } from '@/data/mockData';

describe('Mock Data', () => {
  describe('mockCourses', () => {
    it('should have courses array', () => {
      expect(Array.isArray(mockCourses)).toBe(true);
      expect(mockCourses.length).toBeGreaterThan(0);
    });

    it('each course should have required fields', () => {
      mockCourses.forEach(course => {
        expect(course.id).toBeDefined();
        expect(course.title).toBeDefined();
        expect(course.description).toBeDefined();
        expect(course.instructor).toBeDefined();
        expect(course.thumbnail).toBeDefined();
        expect(course.price).toBeGreaterThanOrEqual(0);
        expect(course.duration).toBeDefined();
        expect(['Beginner', 'Intermediate', 'Advanced']).toContain(course.level);
        expect(course.category).toBeDefined();
        expect(course.rating).toBeGreaterThanOrEqual(0);
        expect(course.rating).toBeLessThanOrEqual(5);
        expect(course.totalStudents).toBeGreaterThanOrEqual(0);
        expect(course.totalLessons).toBeGreaterThanOrEqual(0);
        expect(Array.isArray(course.lessons)).toBe(true);
      });
    });

    it('each lesson should have required fields', () => {
      mockCourses.forEach(course => {
        course.lessons.forEach(lesson => {
          expect(lesson.id).toBeDefined();
          expect(lesson.courseId).toBe(course.id);
          expect(lesson.title).toBeDefined();
          expect(lesson.description).toBeDefined();
          expect(lesson.duration).toBeDefined();
          expect(lesson.order).toBeGreaterThan(0);
        });
      });
    });

    it('lessons should be ordered correctly', () => {
      mockCourses.forEach(course => {
        const orders = course.lessons.map(l => l.order);
        const sortedOrders = [...orders].sort((a, b) => a - b);
        expect(orders).toEqual(sortedOrders);
      });
    });

    it('should have unique course IDs', () => {
      const ids = mockCourses.map(c => c.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('should have unique lesson IDs across all courses', () => {
      const allLessonIds = mockCourses.flatMap(c => c.lessons.map(l => l.id));
      const uniqueIds = [...new Set(allLessonIds)];
      expect(allLessonIds.length).toBe(uniqueIds.length);
    });
  });

  describe('mockQuizzes', () => {
    it('should have quizzes array', () => {
      expect(Array.isArray(mockQuizzes)).toBe(true);
      expect(mockQuizzes.length).toBeGreaterThan(0);
    });

    it('each quiz should have required fields', () => {
      mockQuizzes.forEach(quiz => {
        expect(quiz.id).toBeDefined();
        expect(quiz.lessonId).toBeDefined();
        expect(quiz.title).toBeDefined();
        expect(quiz.duration).toBeGreaterThan(0);
        expect(Array.isArray(quiz.questions)).toBe(true);
        expect(quiz.questions.length).toBeGreaterThan(0);
      });
    });

    it('each question should have valid structure', () => {
      mockQuizzes.forEach(quiz => {
        quiz.questions.forEach(q => {
          expect(q.id).toBeDefined();
          expect(q.question).toBeDefined();
          expect(Array.isArray(q.options)).toBe(true);
          expect(q.options.length).toBeGreaterThanOrEqual(2);
          expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
          expect(q.correctAnswer).toBeLessThan(q.options.length);
        });
      });
    });
  });

  describe('mockAssignments', () => {
    it('should have assignments array', () => {
      expect(Array.isArray(mockAssignments)).toBe(true);
      expect(mockAssignments.length).toBeGreaterThan(0);
    });

    it('each assignment should have required fields', () => {
      mockAssignments.forEach(assignment => {
        expect(assignment.id).toBeDefined();
        expect(assignment.lessonId).toBeDefined();
        expect(assignment.title).toBeDefined();
        expect(assignment.description).toBeDefined();
        expect(assignment.dueDate).toBeDefined();
        expect(assignment.maxFileSize).toBeGreaterThan(0);
        expect(Array.isArray(assignment.allowedFormats)).toBe(true);
        expect(assignment.maxScore).toBeGreaterThan(0);
      });
    });
  });

  describe('mockExercises', () => {
    it('should have exercises array', () => {
      expect(Array.isArray(mockExercises)).toBe(true);
      expect(mockExercises.length).toBeGreaterThan(0);
    });

    it('each exercise should have required fields', () => {
      mockExercises.forEach(exercise => {
        expect(exercise.id).toBeDefined();
        expect(exercise.lessonId).toBeDefined();
        expect(exercise.title).toBeDefined();
        expect(exercise.description).toBeDefined();
        expect(['coding', 'fill-blank', 'short-answer']).toContain(exercise.type);
        expect(Array.isArray(exercise.questions)).toBe(true);
      });
    });

    it('each exercise question should have valid structure', () => {
      mockExercises.forEach(exercise => {
        exercise.questions.forEach(q => {
          expect(q.id).toBeDefined();
          expect(q.question).toBeDefined();
          expect(['coding', 'fill-blank', 'short-answer']).toContain(q.type);
          expect(q.points).toBeGreaterThan(0);
        });
      });
    });
  });
});
