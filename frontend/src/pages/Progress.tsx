import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mockCourses } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useEnrollment } from '@/contexts/EnrollmentContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Trophy,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

const ProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { enrollments } = useEnrollment();

  const enrolledCourses = mockCourses.filter(course =>
    enrollments.some(e => e.courseId === course.id)
  );

  const totalProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
    : 0;

  const completedCourses = enrollments.filter(e => e.progress >= 100).length;
  const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container flex flex-1 items-center justify-center py-20">
          <div className="text-center">
            <h1 className="mb-4 font-display text-2xl font-bold">Vui lòng đăng nhập</h1>
            <p className="mb-6 text-muted-foreground">
              Bạn cần đăng nhập để xem tiến độ học tập
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
            <Badge className="mb-4">Thống kê</Badge>
            <h1 className="mb-4 font-display text-3xl font-bold md:text-4xl">
              Tiến độ học tập
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Theo dõi tiến độ và thành tích học tập của bạn.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            {enrollments.length > 0 ? (
              <div className="space-y-8">
                {/* Stats Overview */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{enrollments.length}</div>
                        <div className="text-sm text-muted-foreground">Khóa học đã đăng ký</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                        <CheckCircle2 className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{completedCourses}</div>
                        <div className="text-sm text-muted-foreground">Đã hoàn thành</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                        <TrendingUp className="h-6 w-6 text-warning" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{inProgressCourses}</div>
                        <div className="text-sm text-muted-foreground">Đang học</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                        <Trophy className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{totalProgress}%</div>
                        <div className="text-sm text-muted-foreground">Tiến độ trung bình</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Course Progress List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Chi tiết tiến độ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {enrolledCourses.map((course) => {
                      const enrollment = enrollments.find(e => e.courseId === course.id);
                      const progress = enrollment?.progress || 0;
                      const completedLessons = enrollment?.completedLessons.length || 0;

                      return (
                        <div 
                          key={course.id}
                          className="space-y-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-medium">{course.title}</h4>
                              <p className="text-sm text-muted-foreground">{course.instructor}</p>
                            </div>
                            <Badge variant={progress >= 100 ? 'default' : 'outline'} className={progress >= 100 ? 'bg-success' : ''}>
                              {progress >= 100 ? 'Hoàn thành' : `${progress}%`}
                            </Badge>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {completedLessons} / {course.lessons.length} bài học
                              </span>
                              <span className="font-medium">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>

                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/courses/${course.id}`)}
                          >
                            {progress >= 100 ? 'Xem lại' : 'Tiếp tục học'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
                <BarChart3 className="mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 text-xl font-semibold">Chưa có dữ liệu</h3>
                <p className="mb-6 text-center text-muted-foreground">
                  Đăng ký khóa học để bắt đầu theo dõi tiến độ học tập
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

export default ProgressPage;
