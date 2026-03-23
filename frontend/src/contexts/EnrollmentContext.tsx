import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Enrollment } from '@/types/lms';
import { getAuthHeaders } from '@/lib/authFetch';
import { useAuth } from './AuthContext';

interface EnrollmentContextType {
  enrollments: Enrollment[];
  isEnrolled: (courseId: string) => boolean;
  enrollCourse: (userId: string, courseId: string) => Promise<Enrollment | null>;
  getEnrollment: (courseId: string) => Enrollment | undefined;
  updateProgress: (courseId: string, lessonId: string) => Promise<void>;
  getProgress: (courseId: string) => number;
  refreshEnrollments: (userId?: string) => Promise<void>;
}

const EnrollmentContext = createContext<EnrollmentContextType | undefined>(undefined);

const API_URL = 'http://localhost:8080/api';
const STORAGE_KEY = 'lms_enrollments';

const readStoredEnrollments = (): Enrollment[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeEnrollment = (value: any): Enrollment => ({
  ...value,
  enrolledAt: value?.enrolledAt ? new Date(value.enrolledAt) : new Date(),
  progress: Number(value?.progress || 0),
  completedLessons: Array.isArray(value?.completedLessons)
    ? value.completedLessons
    : value?.completedLessons
      ? JSON.parse(value.completedLessons)
      : [],
});

const saveStoredEnrollments = (items: Enrollment[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const mergeEnrollments = (remote: Enrollment[], local: Enrollment[]) => {
  const merged = new Map<string, Enrollment>();
  [...local, ...remote].forEach(item => {
    const normalized = normalizeEnrollment(item);
    merged.set(`${normalized.userId}:${normalized.courseId}`, normalized);
  });
  return Array.from(merged.values());
};

export const EnrollmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => readStoredEnrollments().map(normalizeEnrollment));

  const syncEnrollments = useCallback((updater: Enrollment[] | ((prev: Enrollment[]) => Enrollment[])) => {
    setEnrollments(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveStoredEnrollments(next);
      return next;
    });
  }, []);

  const refreshEnrollments = useCallback(async (targetUserId?: string) => {
    const userId = targetUserId || user?.id;
    if (!userId) {
      syncEnrollments([]);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/enrollments/user/${userId}`, {
        headers: { ...getAuthHeaders() },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch enrollments for user ${userId}`);
      }

      const data: any[] = await res.json();
      const remote = data.map(normalizeEnrollment);
      const local = readStoredEnrollments().filter(item => item.userId === userId).map(normalizeEnrollment);
      syncEnrollments(mergeEnrollments(remote, local));
    } catch (error) {
      const local = readStoredEnrollments().filter(item => item.userId === userId).map(normalizeEnrollment);
      syncEnrollments(local);
      console.error('Error fetching enrollments, using local fallback:', error);
    }
  }, [syncEnrollments, user?.id]);

  useEffect(() => {
    if (!user?.id) {
      syncEnrollments([]);
      return;
    }

    refreshEnrollments(user.id).catch(err => {
      console.error('Error fetching enrollments:', err);
    });
  }, [refreshEnrollments, syncEnrollments, user?.id]);

  const isEnrolled = useCallback((courseId: string) => {
    return enrollments.some(e => e.courseId === courseId);
  }, [enrollments]);

  const getEnrollment = useCallback((courseId: string) => {
    return enrollments.find(e => e.courseId === courseId);
  }, [enrollments]);

  const enrollCourse = useCallback(async (userId: string, courseId: string) => {
    const existing = enrollments.find(e => e.userId === userId && e.courseId === courseId);
    if (existing) {
      return existing;
    }

    try {
      const res = await fetch(`${API_URL}/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ userId, courseId })
      });

      if (!res.ok) {
        throw new Error(`Failed to enroll course ${courseId}`);
      }

      const data = normalizeEnrollment(await res.json());
      syncEnrollments(prev => prev.some(item => item.userId === userId && item.courseId === courseId) ? prev : [...prev, data]);
      return data;
    } catch (error) {
      const fallbackEnrollment: Enrollment = {
        id: `local-${userId}-${courseId}`,
        userId,
        courseId,
        enrolledAt: new Date(),
        progress: 0,
        status: 'active',
        completedLessons: [],
      };
      syncEnrollments(prev => prev.some(item => item.userId === userId && item.courseId === courseId) ? prev : [...prev, fallbackEnrollment]);
      console.error('Error enrolling in course, using local fallback:', error);
      return fallbackEnrollment;
    }
  }, [enrollments, syncEnrollments]);

  const updateProgress = useCallback(async (courseId: string, lessonId: string) => {
    if (!user?.id) return;

    let totalLessons = 1;
    try {
      const courseRes = await fetch(`${API_URL}/courses/${courseId}`, {
        headers: { ...getAuthHeaders() },
      });
      if (courseRes.ok) {
        const courseData = await courseRes.json();
        totalLessons = Math.max(1, Number(courseData?.totalLessons || 1));
      }
    } catch (error) {
      console.error('Error fetching course lesson count, using fallback:', error);
    }

    let payloadToSync: { completedLessons: string[]; progress: number; status: 'active' | 'completed' } | null = null;

    syncEnrollments(prev => {
      const updated = [...prev];
      const enrollmentIndex = updated.findIndex(e => e.courseId === courseId && e.userId === user.id);

      if (enrollmentIndex === -1) {
        return prev;
      }

      const currentEnrollment = updated[enrollmentIndex];
      const completedLessons = currentEnrollment.completedLessons.includes(lessonId)
        ? currentEnrollment.completedLessons
        : [...currentEnrollment.completedLessons, lessonId];

      const finalProgress = Math.min(100, Math.round((completedLessons.length / totalLessons) * 100));
      const finalStatus: 'active' | 'completed' = finalProgress >= 100 ? 'completed' : 'active';

      payloadToSync = {
        completedLessons,
        progress: finalProgress,
        status: finalStatus,
      };

      updated[enrollmentIndex] = {
        ...currentEnrollment,
        completedLessons,
        progress: finalProgress,
        status: finalStatus,
      };

      return updated;
    });

    if (!payloadToSync) return;

    try {
      await fetch(`${API_URL}/enrollments/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          userId: user.id,
          courseId,
          completedLessons: payloadToSync.completedLessons,
          progress: payloadToSync.progress,
          status: payloadToSync.status,
        })
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }, [syncEnrollments, user?.id]);

  const getProgress = useCallback((courseId: string) => {
    const enrollment = enrollments.find(e => e.courseId === courseId);
    return enrollment?.progress || 0;
  }, [enrollments]);

  return (
    <EnrollmentContext.Provider value={{
      enrollments,
      isEnrolled,
      enrollCourse,
      getEnrollment,
      updateProgress,
      getProgress,
      refreshEnrollments
    }}>
      {children}
    </EnrollmentContext.Provider>
  );
};

export const useEnrollment = () => {
  const context = useContext(EnrollmentContext);
  if (!context) {
    throw new Error('useEnrollment must be used within an EnrollmentProvider');
  }
  return context;
};
