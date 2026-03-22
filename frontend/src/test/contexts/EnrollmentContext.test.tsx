import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { EnrollmentProvider, useEnrollment } from '@/contexts/EnrollmentContext';
import { AuthProvider } from '@/contexts/AuthContext';
import React from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <EnrollmentProvider>{children}</EnrollmentProvider>
  </AuthProvider>
);

describe('EnrollmentContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('useEnrollment hook', () => {
    it('should throw error when used outside EnrollmentProvider', () => {
      expect(() => {
        renderHook(() => useEnrollment());
      }).toThrow('useEnrollment must be used within an EnrollmentProvider');
    });
  });

  describe('Initial State', () => {
    it('should have empty enrollments initially', () => {
      const { result } = renderHook(() => useEnrollment(), { wrapper });
      expect(result.current.enrollments).toEqual([]);
    });
  });

  describe('enrollCourse()', () => {
    it('should enroll user in a course', () => {
      const { result } = renderHook(() => useEnrollment(), { wrapper });
      
      act(() => {
        result.current.enrollCourse('user_1', 'course_1');
      });
      
      expect(result.current.enrollments).toHaveLength(1);
      expect(result.current.enrollments[0].courseId).toBe('course_1');
      expect(result.current.enrollments[0].userId).toBe('user_1');
    });

    it('should set initial progress to 0', () => {
      const { result } = renderHook(() => useEnrollment(), { wrapper });
      
      act(() => {
        result.current.enrollCourse('user_1', 'course_1');
      });
      
      expect(result.current.enrollments[0].progress).toBe(0);
    });

    it('should set status to active', () => {
      const { result } = renderHook(() => useEnrollment(), { wrapper });
      
      act(() => {
        result.current.enrollCourse('user_1', 'course_1');
      });
      
      expect(result.current.enrollments[0].status).toBe('active');
    });

    it('should have empty completedLessons array', () => {
      const { result } = renderHook(() => useEnrollment(), { wrapper });
      
      act(() => {
        result.current.enrollCourse('user_1', 'course_1');
      });
      
      expect(result.current.enrollments[0].completedLessons).toEqual([]);
    });
  });

  describe('isEnrolled()', () => {
    it('should return true if user is enrolled', () => {
      const { result } = renderHook(() => useEnrollment(), { wrapper });
      
      act(() => {
        result.current.enrollCourse('user_1', 'course_1');
      });
      
      expect(result.current.isEnrolled('course_1')).toBe(true);
    });

    it('should return false if user is not enrolled', () => {
      const { result } = renderHook(() => useEnrollment(), { wrapper });
      
      expect(result.current.isEnrolled('course_1')).toBe(false);
    });
  });

  describe('getEnrollment()', () => {
    it('should return enrollment for a course', () => {
      const { result } = renderHook(() => useEnrollment(), { wrapper });
      
      act(() => {
        result.current.enrollCourse('user_1', 'course_1');
      });
      
      const enrollment = result.current.getEnrollment('course_1');
      expect(enrollment).toBeDefined();
      expect(enrollment?.courseId).toBe('course_1');
    });

    it('should return undefined if not enrolled', () => {
      const { result } = renderHook(() => useEnrollment(), { wrapper });
      
      const enrollment = result.current.getEnrollment('course_1');
      expect(enrollment).toBeUndefined();
    });
  });

  describe('updateProgress()', () => {
    it('should add lesson to completedLessons', () => {
      const { result } = renderHook(() => useEnrollment(), { wrapper });
      
      act(() => {
        result.current.enrollCourse('user_1', '7'); // Course 7 has 6 lessons
      });
      
      act(() => {
        result.current.updateProgress('7', 'l19');
      });
      
      const enrollment = result.current.getEnrollment('7');
      expect(enrollment?.completedLessons).toContain('l19');
    });

    it('should not duplicate completed lessons', () => {
      const { result } = renderHook(() => useEnrollment(), { wrapper });
      
      act(() => {
        result.current.enrollCourse('user_1', '7');
      });
      
      act(() => {
        result.current.updateProgress('7', 'l19');
        result.current.updateProgress('7', 'l19');
      });
      
      const enrollment = result.current.getEnrollment('7');
      expect(enrollment?.completedLessons.filter(l => l === 'l19')).toHaveLength(1);
    });

    it('should update progress percentage', () => {
      const { result } = renderHook(() => useEnrollment(), { wrapper });
      
      act(() => {
        result.current.enrollCourse('user_1', '7');
      });
      
      act(() => {
        result.current.updateProgress('7', 'l19');
      });
      
      // Course 7 has 6 lessons, 1 completed = ~17%
      const enrollment = result.current.getEnrollment('7');
      expect(enrollment?.progress).toBeGreaterThan(0);
    });
  });

  describe('getProgress()', () => {
    it('should return 0 for non-enrolled course', () => {
      const { result } = renderHook(() => useEnrollment(), { wrapper });
      
      expect(result.current.getProgress('course_1')).toBe(0);
    });

    it('should return correct progress', () => {
      const { result } = renderHook(() => useEnrollment(), { wrapper });
      
      act(() => {
        result.current.enrollCourse('user_1', '7');
      });
      
      act(() => {
        result.current.updateProgress('7', 'l19');
        result.current.updateProgress('7', 'l20');
        result.current.updateProgress('7', 'l21');
      });
      
      // 3 out of 6 lessons = 50%
      expect(result.current.getProgress('7')).toBe(50);
    });
  });
});
