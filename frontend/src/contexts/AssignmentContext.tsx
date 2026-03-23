import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AssignmentSubmission, ExerciseSubmission } from '@/types/lms';
import { getAuthHeaders } from '@/lib/authFetch';
import { useAuth } from './AuthContext';

interface AssignmentContextType {
  submissions: AssignmentSubmission[];
  exerciseSubmissions: ExerciseSubmission[];
  submitAssignment: (submission: Omit<AssignmentSubmission, 'id' | 'submittedAt' | 'status'>) => Promise<AssignmentSubmission>;
  submitExercise: (submission: Omit<ExerciseSubmission, 'id' | 'submittedAt'>) => Promise<ExerciseSubmission>;
  getAssignmentSubmission: (assignmentId: string, userId: string) => AssignmentSubmission | undefined;
  getExerciseSubmission: (exerciseId: string, userId: string) => ExerciseSubmission | undefined;
  getUserSubmissions: (userId: string) => AssignmentSubmission[];
  getUserExerciseSubmissions: (userId: string) => ExerciseSubmission[];
  refreshSubmissions: (userId?: string) => Promise<void>;
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);
const API_URL = 'http://localhost:8080/api';

const normalizeAssignmentSubmission = (value: any): AssignmentSubmission => ({
  ...value,
  submittedAt: new Date(value.submittedAt),
});

const normalizeExerciseSubmission = (value: any): ExerciseSubmission => ({
  ...value,
  submittedAt: new Date(value.submittedAt),
  answers: typeof value.answers === 'string' ? JSON.parse(value.answers || '[]') : value.answers,
});

export const useAssignment = () => {
  const context = useContext(AssignmentContext);
  if (!context) {
    throw new Error('useAssignment must be used within an AssignmentProvider');
  }
  return context;
};

export const AssignmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(() => {
    const saved = localStorage.getItem('lms_assignment_submissions');
    return saved ? JSON.parse(saved).map(normalizeAssignmentSubmission) : [];
  });

  const [exerciseSubmissions, setExerciseSubmissions] = useState<ExerciseSubmission[]>(() => {
    const saved = localStorage.getItem('lms_exercise_submissions');
    return saved ? JSON.parse(saved).map(normalizeExerciseSubmission) : [];
  });

  useEffect(() => {
    localStorage.setItem('lms_assignment_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('lms_exercise_submissions', JSON.stringify(exerciseSubmissions));
  }, [exerciseSubmissions]);

  const refreshSubmissions = useCallback(async (targetUserId?: string) => {
    const userId = targetUserId || user?.id;
    if (!userId) {
      setSubmissions([]);
      setExerciseSubmissions([]);
      return;
    }

    try {
      const [assignmentRes, exerciseRes] = await Promise.all([
        fetch(`${API_URL}/assignment-submissions/user/${userId}`, {
          headers: { ...getAuthHeaders() },
        }),
        fetch(`${API_URL}/exercise-submissions/user/${userId}`, {
          headers: { ...getAuthHeaders() },
        }),
      ]);

      const assignmentData = assignmentRes.ok ? await assignmentRes.json() : [];
      const exerciseData = exerciseRes.ok ? await exerciseRes.json() : [];

      setSubmissions(Array.isArray(assignmentData) ? assignmentData.map(normalizeAssignmentSubmission) : []);
      setExerciseSubmissions(Array.isArray(exerciseData) ? exerciseData.map(normalizeExerciseSubmission) : []);
    } catch (error) {
      console.error('Error fetching submissions, using local fallback:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshSubmissions().catch(error => console.error('Error refreshing submissions:', error));
  }, [refreshSubmissions]);

  const submitAssignment = useCallback(async (submission: Omit<AssignmentSubmission, 'id' | 'submittedAt' | 'status'>) => {
    try {
      const res = await fetch(`${API_URL}/assignment-submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(submission),
      });

      if (!res.ok) {
        throw new Error(`Failed to submit assignment ${submission.assignmentId}`);
      }

      const savedSubmission = normalizeAssignmentSubmission(await res.json());
      setSubmissions(prev => [
        ...prev.filter(item => !(item.assignmentId === savedSubmission.assignmentId && item.userId === savedSubmission.userId)),
        savedSubmission,
      ]);
      return savedSubmission;
    } catch (error) {
      console.error('Error submitting assignment, using local fallback:', error);
      const fallbackSubmission: AssignmentSubmission = {
        ...submission,
        id: `as_${Date.now()}`,
        submittedAt: new Date(),
        status: 'pending',
      };
      setSubmissions(prev => [
        ...prev.filter(item => !(item.assignmentId === fallbackSubmission.assignmentId && item.userId === fallbackSubmission.userId)),
        fallbackSubmission,
      ]);
      return fallbackSubmission;
    }
  }, []);

  const submitExercise = useCallback(async (submission: Omit<ExerciseSubmission, 'id' | 'submittedAt'>) => {
    try {
      const res = await fetch(`${API_URL}/exercise-submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(submission),
      });

      if (!res.ok) {
        throw new Error(`Failed to submit exercise ${submission.exerciseId}`);
      }

      const savedSubmission = normalizeExerciseSubmission(await res.json());
      setExerciseSubmissions(prev => [...prev, savedSubmission]);
      return savedSubmission;
    } catch (error) {
      console.error('Error submitting exercise, using local fallback:', error);
      const fallbackSubmission: ExerciseSubmission = {
        ...submission,
        id: `es_${Date.now()}`,
        submittedAt: new Date(),
      };
      setExerciseSubmissions(prev => [...prev, fallbackSubmission]);
      return fallbackSubmission;
    }
  }, []);

  const getAssignmentSubmission = (assignmentId: string, userId: string) =>
    submissions
      .filter(s => s.assignmentId === assignmentId && s.userId === userId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];

  const getExerciseSubmission = (exerciseId: string, userId: string) =>
    exerciseSubmissions
      .filter(s => s.exerciseId === exerciseId && s.userId === userId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];

  const getUserSubmissions = (userId: string) => submissions.filter(s => s.userId === userId);
  const getUserExerciseSubmissions = (userId: string) => exerciseSubmissions.filter(s => s.userId === userId);

  return (
    <AssignmentContext.Provider value={{
      submissions,
      exerciseSubmissions,
      submitAssignment,
      submitExercise,
      getAssignmentSubmission,
      getExerciseSubmission,
      getUserSubmissions,
      getUserExerciseSubmissions,
      refreshSubmissions
    }}>
      {children}
    </AssignmentContext.Provider>
  );
};
