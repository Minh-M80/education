import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Course } from '@/types/lms';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CourseCard from '@/components/courses/CourseCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Play, 
  Users, 
  Award, 
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Star
} from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  
  useEffect(() => {
    fetch('http://localhost:8080/api/courses')
      .then(res => res.json())
      .then(data => {
        setFeaturedCourses(data.slice(0, 3));
      })
      .catch(err => console.error('Failed to fetch courses:', err));
  }, []);

  const stats = [
    { icon: BookOpen, value: '500+', label: 'Khóa học' },
    { icon: Users, value: '100K+', label: 'Học viên' },
    { icon: Award, value: '50+', label: 'Giảng viên' },
    { icon: Star, value: '4.8', label: 'Đánh giá' },
  ];

  const features = [
    'Học mọi lúc, mọi nơi trên mọi thiết bị',
    'Nội dung được cập nhật liên tục',
    'Chứng chỉ sau khi hoàn thành',
    'Hỗ trợ 24/7 từ đội ngũ chuyên gia',
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32" style={{ background: 'var(--gradient-hero)' }}>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          
          <div className="container relative">
            <div className="mx-auto max-w-3xl text-center">
              <Badge className="mb-6 bg-secondary/20 text-secondary backdrop-blur-sm">
                🎓 Nền tảng học trực tuyến #1 Việt Nam
              </Badge>
              
              <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl lg:text-6xl animate-fade-in">
                Nâng cao kỹ năng,{' '}
                <span className="text-secondary">Mở rộng tương lai</span>
              </h1>
              
              <p className="mb-8 text-lg text-primary-foreground/80 md:text-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
                Khám phá hàng trăm khóa học chất lượng cao từ các chuyên gia hàng đầu. 
                Học theo tốc độ của riêng bạn và nhận chứng chỉ được công nhận.
              </p>
              
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/courses')}
                  className="btn-gradient h-14 px-8 text-base"
                >
                  Khám phá khóa học
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-14 border-primary-foreground/30 bg-transparent px-8 text-base text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Xem giới thiệu
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="glass-card flex flex-col items-center rounded-xl p-6 text-center"
                >
                  <stat.icon className="mb-3 h-8 w-8 text-secondary" />
                  <div className="text-2xl font-bold text-primary-foreground md:text-3xl">{stat.value}</div>
                  <div className="text-sm text-primary-foreground/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section className="py-20">
          <div className="container">
            <div className="mb-12 text-center">
              <Badge className="mb-4">Phổ biến nhất</Badge>
              <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl">
                Khóa học nổi bật
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Những khóa học được yêu thích nhất, giúp bạn nhanh chóng nắm vững kiến thức và kỹ năng cần thiết.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredCourses.map((course, index) => (
                <div 
                  key={course.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CourseCard course={course} />
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/courses')}
              >
                Xem tất cả khóa học
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="border-y border-border bg-muted/30 py-20">
          <div className="container">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <Badge className="mb-4">Tại sao chọn chúng tôi</Badge>
                <h2 className="mb-6 font-display text-3xl font-bold md:text-4xl">
                  Trải nghiệm học tập{' '}
                  <span className="text-primary">tốt nhất</span>
                </h2>
                <p className="mb-8 text-muted-foreground">
                  EduMaster được thiết kế để mang đến trải nghiệm học tập hiệu quả và thú vị nhất cho bạn.
                </p>

                <ul className="space-y-4">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/20">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className="mt-8 btn-gradient" onClick={() => navigate('/register')}>
                  Bắt đầu miễn phí
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="relative">
                <div className="aspect-video overflow-hidden rounded-2xl shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
                    alt="Students learning"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 rounded-xl bg-card p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success">
                      <GraduationCap className="h-6 w-6 text-success-foreground" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">95%</div>
                      <div className="text-sm text-muted-foreground">Tỷ lệ hoàn thành</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container">
            <div className="overflow-hidden rounded-2xl" style={{ background: 'var(--gradient-hero)' }}>
              <div className="p-8 text-center md:p-16">
                <h2 className="mb-4 font-display text-3xl font-bold text-primary-foreground md:text-4xl">
                  Sẵn sàng bắt đầu hành trình học tập?
                </h2>
                <p className="mx-auto mb-8 max-w-xl text-primary-foreground/80">
                  Tham gia cùng hàng nghìn học viên đang phát triển sự nghiệp của họ mỗi ngày.
                </p>
                <Button 
                  size="lg" 
                  className="h-14 bg-secondary px-8 text-secondary-foreground hover:bg-secondary/90"
                  onClick={() => navigate('/register')}
                >
                  Đăng ký ngay
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
