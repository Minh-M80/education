import React, { useState, useMemo } from 'react';
import { Course } from '@/types/lms';
import CourseCard from './CourseCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface CourseListProps {
  courses: Course[];
  showFilters?: boolean;
}

const CourseList: React.FC<CourseListProps> = ({ courses, showFilters = true }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const categories = useMemo(() => {
    const cats = [...new Set(courses.map(c => c.category))];
    return ['all', ...cats];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        c.instructor.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (category !== 'all') {
      result = result.filter(c => c.category === category);
    }

    // Level filter
    if (level !== 'all') {
      result = result.filter(c => c.level === level);
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.totalStudents - a.totalStudents);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
    }

    return result;
  }, [courses, searchTerm, category, level, sortBy]);

  return (
    <div className="space-y-6">
      {showFilters && (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 md:flex-row md:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category */}
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.slice(1).map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Level */}
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-full md:w-[160px]">
              <SelectValue placeholder="Cấp độ" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">Tất cả cấp độ</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[160px]">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="popular">Phổ biến nhất</SelectItem>
              <SelectItem value="rating">Đánh giá cao</SelectItem>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="price-low">Giá thấp đến cao</SelectItem>
              <SelectItem value="price-high">Giá cao đến thấp</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Hiển thị <span className="font-semibold text-foreground">{filteredCourses.length}</span> khóa học
        </p>
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course, index) => (
            <div 
              key={course.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
          <Filter className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">Không tìm thấy khóa học</h3>
          <p className="text-sm text-muted-foreground">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </div>
      )}
    </div>
  );
};

export default CourseList;
