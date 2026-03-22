import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AssignmentSubmission, ExerciseSubmission } from '@/types/lms';

interface AssignmentContextType {
  submissions: AssignmentSubmission[];
  exerciseSubmissions: ExerciseSubmission[];
  submitAssignment: (submission: Omit<AssignmentSubmission, 'id' | 'submittedAt' | 'status'>) => void;
  submitExercise: (submission: Omit<ExerciseSubmission, 'id' | 'submittedAt'>) => void;
  getAssignmentSubmission: (assignmentId: string, userId: string) => AssignmentSubmission | undefined;
  getExerciseSubmission: (exerciseId: string, userId: string) => ExerciseSubmission | undefined;
  getUserSubmissions: (userId: string) => AssignmentSubmission[];
  getUserExerciseSubmissions: (userId: string) => ExerciseSubmission[];
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);

export const useAssignment = () => {
  const context = useContext(AssignmentContext);
  if (!context) {
    throw new Error('useAssignment must be used within an AssignmentProvider');
  }
  return context;
};

export const AssignmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(() => {
    const saved = localStorage.getItem('lms_assignment_submissions');
    return saved ? JSON.parse(saved) : [];
  });

  const [exerciseSubmissions, setExerciseSubmissions] = useState<ExerciseSubmission[]>(() => {
    const saved = localStorage.getItem('lms_exercise_submissions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('lms_assignment_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('lms_exercise_submissions', JSON.stringify(exerciseSubmissions));
  }, [exerciseSubmissions]);

  const submitAssignment = (submission: Omit<AssignmentSubmission, 'id' | 'submittedAt' | 'status'>) => {
    // Simulate grading after 2 seconds
    const newSubmission: AssignmentSubmission = {
      ...submission,
      id: 'as_' + Date.now(),
      submittedAt: new Date(),
      status: 'pending'
    };
    setSubmissions(prev => [...prev.filter(s => 
      !(s.assignmentId === submission.assignmentId && s.userId === submission.userId)
    ), newSubmission]);

    // Auto-grade simulation after delay
    setTimeout(() => {
      setSubmissions(prev => prev.map(s => {
        if (s.id === newSubmission.id) {
          const randomGrade = Math.floor(Math.random() * 30) + 70; // 70-100
          return {
            ...s,
            status: 'graded' as const,
            grade: randomGrade,
            feedback: randomGrade >= 90 
              ? 'Xuất sắc! Bài làm rất tốt, đầy đủ nội dung và trình bày rõ ràng.'
              : randomGrade >= 80 
                ? 'Tốt! Bài làm khá đầy đủ, cần cải thiện một số chi tiết nhỏ.'
                : 'Khá! Bài làm cơ bản đạt yêu cầu, cần bổ sung thêm nội dung.'
          };
        }
        return s;
      }));
    }, 3000);
  };

  const submitExercise = (submission: Omit<ExerciseSubmission, 'id' | 'submittedAt'>) => {
    const newSubmission: ExerciseSubmission = {
      ...submission,
      id: 'es_' + Date.now(),
      submittedAt: new Date()
    };
    setExerciseSubmissions(prev => [...prev, newSubmission]);
  };

  const getAssignmentSubmission = (assignmentId: string, userId: string) => {
    return submissions.find(s => s.assignmentId === assignmentId && s.userId === userId);
  };

  const getExerciseSubmission = (exerciseId: string, userId: string) => {
    return exerciseSubmissions.find(s => s.exerciseId === exerciseId && s.userId === userId);
  };

  const getUserSubmissions = (userId: string) => {
    return submissions.filter(s => s.userId === userId);
  };

  const getUserExerciseSubmissions = (userId: string) => {
    return exerciseSubmissions.filter(s => s.userId === userId);
  };

  return (
    <AssignmentContext.Provider value={{
      submissions,
      exerciseSubmissions,
      submitAssignment,
      submitExercise,
      getAssignmentSubmission,
      getExerciseSubmission,
      getUserSubmissions,
      getUserExerciseSubmissions
    }}>
      {children}
    </AssignmentContext.Provider>
  );
};
