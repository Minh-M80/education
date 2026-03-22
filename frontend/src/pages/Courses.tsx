import React from 'react';
import { Course } from '@/types/lms';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CourseList from '@/components/courses/CourseList';
import { Badge } from '@/components/ui/badge';

const Courses: React.FC = () => {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('http://localhost:8080/api/courses')
      .then(res => res.json())
      .then(data => {
        setCourses(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch courses:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="border-b border-border bg-muted/30 py-12">
          <div className="container">
            <Badge className="mb-4">Khám phá</Badge>
            <h1 className="mb-4 font-display text-3xl font-bold md:text-4xl">
              Tất cả khóa học
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Khám phá hàng trăm khóa học từ cơ bản đến nâng cao, được giảng dạy bởi các chuyên gia hàng đầu trong ngành.
            </p>
          </div>
        </section>

        {/* Course List */}
        <section className="py-12">
          <div className="container">
            {loading ? (
              <div className="text-center py-12">Đang tải danh sách khóa học...</div>
            ) : (
              <CourseList courses={courses} />
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Courses;
