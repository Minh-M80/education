import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AssignmentProvider, useAssignment } from '@/contexts/AssignmentContext';
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
  <AssignmentProvider>{children}</AssignmentProvider>
);

describe('AssignmentContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('useAssignment hook', () => {
    it('should throw error when used outside AssignmentProvider', () => {
      expect(() => {
        renderHook(() => useAssignment());
      }).toThrow('useAssignment must be used within an AssignmentProvider');
    });
  });

  describe('Initial State', () => {
    it('should have empty submissions initially', () => {
      const { result } = renderHook(() => useAssignment(), { wrapper });
      expect(result.current.submissions).toEqual([]);
      expect(result.current.exerciseSubmissions).toEqual([]);
    });
  });

  describe('submitAssignment()', () => {
    it('should add assignment submission', () => {
      const { result } = renderHook(() => useAssignment(), { wrapper });
      
      act(() => {
        result.current.submitAssignment({
          assignmentId: 'a1',
          userId: 'user_1',
          fileName: 'homework.pdf',
          fileSize: 1024
        });
      });
      
      expect(result.current.submissions).toHaveLength(1);
      expect(result.current.submissions[0].assignmentId).toBe('a1');
      expect(result.current.submissions[0].status).toBe('pending');
    });

    it('should replace existing submission for same assignment', () => {
      const { result } = renderHook(() => useAssignment(), { wrapper });
      
      act(() => {
        result.current.submitAssignment({
          assignmentId: 'a1',
          userId: 'user_1',
          fileName: 'homework_v1.pdf',
          fileSize: 1024
        });
      });
      
      act(() => {
        result.current.submitAssignment({
          assignmentId: 'a1',
          userId: 'user_1',
          fileName: 'homework_v2.pdf',
          fileSize: 2048
        });
      });
      
      expect(result.current.submissions).toHaveLength(1);
      expect(result.current.submissions[0].fileName).toBe('homework_v2.pdf');
    });

    it('should set initial status to pending', () => {
      const { result } = renderHook(() => useAssignment(), { wrapper });
      
      act(() => {
        result.current.submitAssignment({
          assignmentId: 'a1',
          userId: 'user_1',
          fileName: 'homework.pdf',
          fileSize: 1024
        });
      });
      
      expect(result.current.submissions[0].status).toBe('pending');
    });
  });

  describe('submitExercise()', () => {
    it('should add exercise submission', () => {
      const { result } = renderHook(() => useAssignment(), { wrapper });
      
      act(() => {
        result.current.submitExercise({
          exerciseId: 'e1',
          userId: 'user_1',
          answers: [
            { questionId: 'q1', answer: 'test answer', score: 10 }
          ],
          totalScore: 10,
          maxScore: 10,
          timeSpent: 300
        });
      });
      
      expect(result.current.exerciseSubmissions).toHaveLength(1);
      expect(result.current.exerciseSubmissions[0].exerciseId).toBe('e1');
    });

    it('should allow multiple exercise submissions', () => {
      const { result } = renderHook(() => useAssignment(), { wrapper });
      
      act(() => {
        result.current.submitExercise({
          exerciseId: 'e1',
          userId: 'user_1',
          answers: [],
          totalScore: 5,
          maxScore: 10,
          timeSpent: 300
        });
      });
      
      act(() => {
        result.current.submitExercise({
          exerciseId: 'e1',
          userId: 'user_1',
          answers: [],
          totalScore: 8,
          maxScore: 10,
          timeSpent: 400
        });
      });
      
      expect(result.current.exerciseSubmissions).toHaveLength(2);
    });
  });

  describe('getAssignmentSubmission()', () => {
    it('should return submission for user and assignment', () => {
      const { result } = renderHook(() => useAssignment(), { wrapper });
      
      act(() => {
        result.current.submitAssignment({
          assignmentId: 'a1',
          userId: 'user_1',
          fileName: 'homework.pdf',
          fileSize: 1024
        });
      });
      
      const submission = result.current.getAssignmentSubmission('a1', 'user_1');
      expect(submission).toBeDefined();
      expect(submission?.fileName).toBe('homework.pdf');
    });

    it('should return undefined if no submission exists', () => {
      const { result } = renderHook(() => useAssignment(), { wrapper });
      
      const submission = result.current.getAssignmentSubmission('a1', 'user_1');
      expect(submission).toBeUndefined();
    });
  });

  describe('getExerciseSubmission()', () => {
    it('should return exercise submission for user', () => {
      const { result } = renderHook(() => useAssignment(), { wrapper });
      
      act(() => {
        result.current.submitExercise({
          exerciseId: 'e1',
          userId: 'user_1',
          answers: [],
          totalScore: 10,
          maxScore: 10,
          timeSpent: 300
        });
      });
      
      const submission = result.current.getExerciseSubmission('e1', 'user_1');
      expect(submission).toBeDefined();
      expect(submission?.totalScore).toBe(10);
    });
  });

  describe('getUserSubmissions()', () => {
    it('should return all submissions for a user', () => {
      const { result } = renderHook(() => useAssignment(), { wrapper });
      
      act(() => {
        result.current.submitAssignment({
          assignmentId: 'a1',
          userId: 'user_1',
          fileName: 'hw1.pdf',
          fileSize: 1024
        });
        result.current.submitAssignment({
          assignmentId: 'a2',
          userId: 'user_1',
          fileName: 'hw2.pdf',
          fileSize: 2048
        });
        result.current.submitAssignment({
          assignmentId: 'a3',
          userId: 'user_2',
          fileName: 'hw3.pdf',
          fileSize: 3072
        });
      });
      
      const userSubmissions = result.current.getUserSubmissions('user_1');
      expect(userSubmissions).toHaveLength(2);
    });
  });

  describe('getUserExerciseSubmissions()', () => {
    it('should return all exercise submissions for a user', () => {
      const { result } = renderHook(() => useAssignment(), { wrapper });
      
      act(() => {
        result.current.submitExercise({
          exerciseId: 'e1',
          userId: 'user_1',
          answers: [],
          totalScore: 10,
          maxScore: 10,
          timeSpent: 300
        });
        result.current.submitExercise({
          exerciseId: 'e2',
          userId: 'user_1',
          answers: [],
          totalScore: 8,
          maxScore: 10,
          timeSpent: 400
        });
      });
      
      const userExercises = result.current.getUserExerciseSubmissions('user_1');
      expect(userExercises).toHaveLength(2);
    });
  });
});
