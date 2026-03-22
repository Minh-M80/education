import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Course } from '@/types/lms';
import { useEnrollment } from '@/contexts/EnrollmentContext';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Star, BookOpen, ShoppingCart, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const navigate = useNavigate();
  const { isEnrolled, getProgress } = useEnrollment();
  const { addToCart, isInCart } = useCart();
  const enrolled = isEnrolled(course.id);
  const inCart = isInCart(course.id);
  const progress = getProgress(course.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-success/10 text-success border-success/20';
      case 'Intermediate': return 'bg-warning/10 text-warning border-warning/20';
      case 'Advanced': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (enrolled) {
      toast.info('Bạn đã đăng ký khóa học này');
      return;
    }
    if (inCart) {
      navigate('/cart');
      return;
    }
    addToCart(course);
    toast.success('Đã thêm vào giỏ hàng');
  };

  return (
    <div 
      className="card-hover group cursor-pointer overflow-hidden rounded-xl border border-border bg-card"
      onClick={() => navigate(`/courses/${course.id}`)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={course.thumbnail} 
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Category Badge */}
        <Badge className="absolute left-3 top-3 bg-background/90 text-foreground backdrop-blur-sm">
          {course.category}
        </Badge>

        {/* Enrolled indicator */}
        {enrolled && (
          <div className="absolute right-3 top-3">
            <Badge className="bg-success text-success-foreground">
              Đã đăng ký
            </Badge>
          </div>
        )}

        {/* Price */}
        <div className="absolute bottom-3 right-3">
          <span className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-bold text-secondary-foreground">
            {formatPrice(course.price)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Level */}
        <Badge variant="outline" className={`mb-3 ${getLevelColor(course.level)}`}>
          {course.level}
        </Badge>

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 font-display text-lg font-semibold text-card-foreground transition-colors group-hover:text-primary">
          {course.title}
        </h3>

        {/* Instructor */}
        <p className="mb-3 text-sm text-muted-foreground">
          {course.instructor}
        </p>

        {/* Stats */}
        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="font-medium text-foreground">{course.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{course.totalStudents.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{course.totalLessons} bài</span>
          </div>
        </div>

        {/* Progress bar for enrolled courses */}
        {enrolled && progress > 0 ? (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Tiến độ</span>
              <span className="font-medium text-primary">{progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : !enrolled && (
          <Button 
            size="sm" 
            className={`w-full ${inCart ? 'bg-[#ae2070] hover:bg-[#8e1a5d]' : ''}`}
            onClick={handleAddToCart}
          >
            {inCart ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Trong giỏ hàng
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Thêm vào giỏ
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
