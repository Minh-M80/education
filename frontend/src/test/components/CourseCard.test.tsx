import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { MemoryRouter } from 'react-router-dom';
import CourseCard from '@/components/courses/CourseCard';
import { AuthProvider } from '@/contexts/AuthContext';
import { EnrollmentProvider } from '@/contexts/EnrollmentContext';
import { CartProvider } from '@/contexts/CartContext';
import { Course } from '@/types/lms';
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

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockCourse: Course = {
  id: 'course_1',
  title: 'React Fundamentals',
  description: 'Learn React from scratch',
  instructor: 'John Doe',
  thumbnail: 'https://example.com/thumb.jpg',
  price: 999000,
  duration: '10 giờ',
  level: 'Beginner',
  category: 'Programming',
  rating: 4.5,
  totalStudents: 1500,
  totalLessons: 20,
  lessons: []
};

const renderCourseCard = (course: Course = mockCourse) => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <EnrollmentProvider>
          <CartProvider>
            <CourseCard course={course} />
          </CartProvider>
        </EnrollmentProvider>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('CourseCard Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render course title', () => {
      renderCourseCard();
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
    });

    it('should render instructor name', () => {
      renderCourseCard();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should render course thumbnail', () => {
      renderCourseCard();
      const img = screen.getByAltText('React Fundamentals');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/thumb.jpg');
    });

    it('should render category badge', () => {
      renderCourseCard();
      expect(screen.getByText('Programming')).toBeInTheDocument();
    });

    it('should render level badge', () => {
      renderCourseCard();
      expect(screen.getByText('Beginner')).toBeInTheDocument();
    });

    it('should render rating', () => {
      renderCourseCard();
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });

    it('should render student count', () => {
      renderCourseCard();
      expect(screen.getByText('1,500')).toBeInTheDocument();
    });

    it('should render duration', () => {
      renderCourseCard();
      expect(screen.getByText('10 giờ')).toBeInTheDocument();
    });

    it('should render lesson count', () => {
      renderCourseCard();
      expect(screen.getByText('20 bài')).toBeInTheDocument();
    });

    it('should render formatted price', () => {
      renderCourseCard();
      expect(screen.getByText(/999\.000/)).toBeInTheDocument();
    });
  });

  describe('Level Badge Colors', () => {
    it('should have correct color for Beginner level', () => {
      renderCourseCard({ ...mockCourse, level: 'Beginner' });
      const badge = screen.getByText('Beginner');
      expect(badge.className).toContain('success');
    });

    it('should have correct color for Intermediate level', () => {
      renderCourseCard({ ...mockCourse, level: 'Intermediate' });
      const badge = screen.getByText('Intermediate');
      expect(badge.className).toContain('warning');
    });

    it('should have correct color for Advanced level', () => {
      renderCourseCard({ ...mockCourse, level: 'Advanced' });
      const badge = screen.getByText('Advanced');
      expect(badge.className).toContain('destructive');
    });
  });

  describe('Cart Interactions', () => {
    it('should show "Thêm vào giỏ" button initially', () => {
      renderCourseCard();
      expect(screen.getByText('Thêm vào giỏ')).toBeInTheDocument();
    });

    it('should navigate to course detail on card click', () => {
      renderCourseCard();
      const card = screen.getByText('React Fundamentals').closest('div[class*="cursor-pointer"]');
      fireEvent.click(card!);
      expect(mockNavigate).toHaveBeenCalledWith('/courses/course_1');
    });
  });

  describe('Price Formatting', () => {
    it('should format price with Vietnamese locale', () => {
      renderCourseCard({ ...mockCourse, price: 1500000 });
      expect(screen.getByText(/1\.500\.000/)).toBeInTheDocument();
    });

    it('should format zero price', () => {
      renderCourseCard({ ...mockCourse, price: 0 });
      expect(screen.getByText('0 ₫')).toBeInTheDocument();
    });

    it('should format large price', () => {
      renderCourseCard({ ...mockCourse, price: 10000000 });
      expect(screen.getByText(/10\.000\.000/)).toBeInTheDocument();
    });
  });

  describe('Long Text Handling', () => {
    it('should handle long course title', () => {
      const longTitle = 'This is a very long course title that should be truncated or handled properly by the component';
      renderCourseCard({ ...mockCourse, title: longTitle });
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle long instructor name', () => {
      const longName = 'Professor Doctor John Smith PhD MBA';
      renderCourseCard({ ...mockCourse, instructor: longName });
      expect(screen.getByText(longName)).toBeInTheDocument();
    });
  });
});
