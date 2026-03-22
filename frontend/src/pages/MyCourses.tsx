import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Course } from '@/types/lms';
import { useAuth } from '@/contexts/AuthContext';
import { useEnrollment } from '@/contexts/EnrollmentContext';
import { mockCourses } from '@/data/mockData';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CourseCard from '@/components/courses/CourseCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight } from 'lucide-react';

const MyCourses: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { enrollments } = useEnrollment();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetch('http://localhost:8080/api/courses')
      .then(res => res.json())
      .then((data: Course[]) => {
        const filtered = data.filter((course: Course) =>
          enrollments.some(e => e.courseId === course.id)
        );
        setEnrolledCourses(filtered);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch enrolled courses:', err);
        const fallback = mockCourses.filter((course: Course) =>
          enrollments.some(e => e.courseId === course.id)
        );
        setEnrolledCourses(fallback);
        setLoading(false);
      });
  }, [isAuthenticated, enrollments]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container flex flex-1 items-center justify-center py-20">
          <div className="text-center">
            <h1 className="mb-4 font-display text-2xl font-bold">Vui lòng đăng nhập</h1>
            <p className="mb-6 text-muted-foreground">
              Bạn cần đăng nhập để xem các khóa học đã đăng ký
            </p>
            <Button onClick={() => navigate('/login')}>
              Đăng nhập ngay
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="border-b border-border bg-muted/30 py-12">
          <div className="container">
            <Badge className="mb-4">Học tập</Badge>
            <h1 className="mb-4 font-display text-3xl font-bold md:text-4xl">
              Khóa học của tôi
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Tiếp tục hành trình học tập của bạn với các khóa học đã đăng ký.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            {loading ? (
              <div className="text-center py-12">Đang tải khóa học...</div>
            ) : enrolledCourses.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {enrolledCourses.map((course, index) => (
                  <div 
                    key={course.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CourseCard course={course} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
                <BookOpen className="mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 text-xl font-semibold">Chưa có khóa học nào</h3>
                <p className="mb-6 text-center text-muted-foreground">
                  Bạn chưa đăng ký khóa học nào. Hãy khám phá và bắt đầu học ngay!
                </p>
                <Button onClick={() => navigate('/courses')} className="btn-gradient">
                  Khám phá khóa học
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MyCourses;
