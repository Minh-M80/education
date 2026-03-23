import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEnrollment } from '@/contexts/EnrollmentContext';
import { useCart } from '@/contexts/CartContext';
import { useAssignment } from '@/contexts/AssignmentContext';
import { mockAssignments, mockCourses, mockExercises } from '@/data/mockData';
import { getAuthHeaders } from '@/lib/authFetch';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AssignmentUpload from '@/components/assignment/AssignmentUpload';
import ExerciseComponent from '@/components/exercise/ExerciseComponent';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Clock, Users, Star, BookOpen, Play, Lock, CheckCircle2,
  FileText, ArrowLeft, ShoppingCart, Check, Upload, Code,
  Trophy, XCircle, ArrowRight, Send, Trash2, Pencil, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

const API = 'http://localhost:8080/api';

const fallbackVideoMap: Record<string, string> = {
  l1: 'https://www.youtube.com/embed/ysEN5RaKOlA',
  l2: 'https://www.youtube.com/embed/kUMe1FH4CHE',
  l3: 'https://www.youtube.com/embed/OXGznpKZ_sA',
  l4: 'https://www.youtube.com/embed/PkZNo7MFNFg',
  l5: 'https://www.youtube.com/embed/bMknfKXIFA8',
  l6: 'https://www.youtube.com/embed/ua-CiDNNj30',
  l7: 'https://www.youtube.com/embed/rfscVS0vtbw',
  l8: 'https://www.youtube.com/embed/vmEHCJofslg',
  l9: 'https://www.youtube.com/embed/Gv9_4yMHFhI',
};

// ─── Types ──────────────────────────────────────────────────────────────────
interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  videoType: 'youtube' | 'upload';
  lessonOrder: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  price: number;
  duration: string;
  level: string;
  category: string;
  rating: number;
  totalStudents: number;
  totalLessons: number;
}

interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  durationMinutes: number;
  questions: QuizQuestion[];
}

interface ExerciseQuestion {
  id: string;
  question: string;
  type: 'coding' | 'fill-blank' | 'short-answer';
  placeholder?: string;
  expectedAnswer?: string;
  hints?: string[];
  points: number;
}

interface ExerciseData {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  type: 'coding' | 'fill-blank' | 'short-answer';
  timeLimit: number;
  questions: ExerciseQuestion[];
}

interface AssignmentData {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  dueDate: Date;
  maxFileSize: number;
  allowedFormats: string[];
  maxScore: number;
}

interface QuizResult {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  answers: number[];
  submittedAt: string;
}

interface Review {
  id: string;
  userId: string;
  courseId: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
}

const buildFallbackLessons = (courseId: string): Lesson[] => {
  const fallbackCourse = mockCourses.find(course => course.id === courseId);
  if (!fallbackCourse) return [];

  return fallbackCourse.lessons.map(lesson => ({
    id: lesson.id,
    courseId: lesson.courseId,
    title: lesson.title,
    description: lesson.description,
    duration: lesson.duration,
    videoUrl: fallbackVideoMap[lesson.id] || 'https://www.youtube.com/embed/ysz5S6PUM-U',
    videoType: 'youtube',
    lessonOrder: lesson.order,
  }));
};

const defaultExerciseByLesson: Record<string, Omit<ExerciseData, 'lessonId'>> = {
  l1: {
    id: 'fallback-exercise-l1',
    title: 'Cau hoi tong quan cong nghe web',
    description: 'Tra loi cac cau hoi co ban ve frontend, backend va cach trinh duyet tai trang web.',
    type: 'short-answer',
    timeLimit: 15,
    questions: [
      { id: 'fallback-eq-l1-1', question: 'Frontend la phan nao cua ung dung web ma nguoi dung truc tiep tuong tac?', type: 'short-answer', placeholder: 'Nhap cau tra loi ngan...', expectedAnswer: 'giao dien', hints: ['Lien quan den UI nguoi dung nhin thay'], points: 10 },
      { id: 'fallback-eq-l1-2', question: 'Backend thuong dam nhiem xu ly logic va ... du lieu?', type: 'fill-blank', placeholder: 'Nhap tu con thieu...', expectedAnswer: 'luu tru', hints: ['Dong nghia voi storage'], points: 10 },
    ],
  },
  l2: {
    id: 'fallback-exercise-l2',
    title: 'Bai tap HTML co ban',
    description: 'On tap cau truc trang HTML va cac the co ban.',
    type: 'fill-blank',
    timeLimit: 15,
    questions: [
      { id: 'fallback-eq-l2-1', question: 'The HTML nao dung de tao doan van ban?', type: 'fill-blank', placeholder: 'Nhap ten the...', expectedAnswer: 'p', hints: ['Viet tat cua paragraph'], points: 10 },
      { id: 'fallback-eq-l2-2', question: 'Thuoc tinh nao dung de dat duong dan cho the a?', type: 'fill-blank', placeholder: 'Nhap ten thuoc tinh...', expectedAnswer: 'href', hints: ['Chua URL dich'], points: 10 },
    ],
  },
  l3: {
    id: 'fallback-exercise-l3',
    title: 'Bai tap CSS co ban',
    description: 'On tap selector, color va flexbox.',
    type: 'fill-blank',
    timeLimit: 20,
    questions: [
      { id: 'fallback-eq-l3-1', question: 'Thuoc tinh CSS nao dung de doi mau chu?', type: 'fill-blank', placeholder: 'Nhap ten thuoc tinh...', expectedAnswer: 'color', hints: ['Thuoc tinh doi mau text'], points: 10 },
      { id: 'fallback-eq-l3-2', question: 'Gia tri nao cua display dung cho Flexbox?', type: 'fill-blank', placeholder: 'Nhap gia tri...', expectedAnswer: 'flex', hints: ['Lien quan bo cuc mot chieu'], points: 10 },
    ],
  },
  l4: {
    id: 'fallback-exercise-l4',
    title: 'Bai tap JavaScript',
    description: 'Viet cac doan code JavaScript nho de cung co kien thuc.',
    type: 'coding',
    timeLimit: 30,
    questions: [
      { id: 'fallback-eq-l4-1', question: 'Viet ham tinh tong cac so tu 1 den n.', type: 'coding', placeholder: 'function sum(n) {\n  // your code\n}', expectedAnswer: 'for,let,sum,return', hints: ['Dung vong lap for'], points: 20 },
      { id: 'fallback-eq-l4-2', question: 'Viet ham dao nguoc chuoi.', type: 'coding', placeholder: 'function reverseString(str) {\n  // your code\n}', expectedAnswer: 'split,reverse,join', hints: ['Co the tach chuoi thanh mang'], points: 20 },
    ],
  },
  l5: {
    id: 'fallback-exercise-l5',
    title: 'Bai tap React can ban',
    description: 'Kiem tra kien thuc ve component, props va state.',
    type: 'short-answer',
    timeLimit: 20,
    questions: [
      { id: 'fallback-eq-l5-1', question: 'Hook nao duoc dung de quan ly state trong function component?', type: 'fill-blank', placeholder: 'Nhap ten hook...', expectedAnswer: 'useState', hints: ['Bat dau bang use'], points: 15 },
      { id: 'fallback-eq-l5-2', question: 'Props trong React dung de lam gi?', type: 'short-answer', placeholder: 'Nhap cau tra loi...', expectedAnswer: 'truyen du lieu', hints: ['Du lieu di tu component cha xuong con'], points: 15 },
    ],
  },
  l6: {
    id: 'fallback-exercise-l6',
    title: 'Cau hoi nhap mon Data Science',
    description: 'On tap cac khai niem nhap mon ve quy trinh xu ly du lieu.',
    type: 'short-answer',
    timeLimit: 15,
    questions: [
      { id: 'fallback-eq-l6-1', question: 'Data Science ket hop lap trinh, thong ke va ...?', type: 'fill-blank', placeholder: 'Nhap tu con thieu...', expectedAnswer: 'nghiep vu', hints: ['Hieu biet domain'], points: 10 },
      { id: 'fallback-eq-l6-2', question: 'Buoc nao thuong duoc dung de tim hieu du lieu truoc khi mo hinh hoa?', type: 'short-answer', placeholder: 'Nhap ten buoc...', expectedAnswer: 'phan tich', hints: ['Thuong goi la exploratory data analysis'], points: 10 },
    ],
  },
  l7: {
    id: 'fallback-exercise-l7',
    title: 'Bai tap Python cho Data Analysis',
    description: 'Luyen tap syntax Python co ban phuc vu phan tich du lieu.',
    type: 'coding',
    timeLimit: 25,
    questions: [
      { id: 'fallback-eq-l7-1', question: 'Viet ham tinh trung binh cong cua danh sach so.', type: 'coding', placeholder: 'def average(numbers):\n    # your code', expectedAnswer: 'sum,len,return', hints: ['Tong chia cho so luong phan tu'], points: 20 },
      { id: 'fallback-eq-l7-2', question: 'Viet ham dem so lan xuat hien cua mot ky tu trong chuoi.', type: 'coding', placeholder: 'def count_char(text, ch):\n    # your code', expectedAnswer: 'for,if,return', hints: ['Duyet qua tung ky tu'], points: 20 },
    ],
  },
  l8: {
    id: 'fallback-exercise-l8',
    title: 'Bai tap Pandas co ban',
    description: 'Tra loi cau hoi ve doc file va xem du lieu trong Pandas.',
    type: 'short-answer',
    timeLimit: 20,
    questions: [
      { id: 'fallback-eq-l8-1', question: 'Ham nao trong Pandas dung de doc file CSV?', type: 'short-answer', placeholder: 'Nhap ten ham...', expectedAnswer: 'read_csv', hints: ['Bat dau bang read_'], points: 15 },
      { id: 'fallback-eq-l8-2', question: 'Phuong thuc nao dung de xem 5 dong dau tien cua DataFrame?', type: 'short-answer', placeholder: 'Nhap ten phuong thuc...', expectedAnswer: 'head', hints: ['Ten tieng Anh cua dau'], points: 15 },
    ],
  },
  l9: {
    id: 'fallback-exercise-l9',
    title: 'Bai tap nhap mon Machine Learning',
    description: 'On tap cac khai niem regression, classification va tap du lieu.',
    type: 'short-answer',
    timeLimit: 20,
    questions: [
      { id: 'fallback-eq-l9-1', question: 'Du doan gia nha thuong thuoc regression hay classification?', type: 'short-answer', placeholder: 'Nhap cau tra loi...', expectedAnswer: 'regression', hints: ['Ket qua la gia tri so'], points: 15 },
      { id: 'fallback-eq-l9-2', question: 'Tap du lieu dung de kiem tra mo hinh sau khi huan luyen goi la gi?', type: 'short-answer', placeholder: 'Nhap ten tap du lieu...', expectedAnswer: 'test', hints: ['Thuong ghep voi tu set'], points: 15 },
    ],
  },
};

const defaultAssignmentByLesson: Record<string, Omit<AssignmentData, 'lessonId'>> = {
  l1: { id: 'fallback-assignment-l1', title: 'Bao cao tong quan ve Web', description: 'Tom tat vai tro cua frontend, backend va co so du lieu trong mot he thong web.', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), maxFileSize: 10, allowedFormats: ['.pdf', '.docx', '.pptx'], maxScore: 100 },
  l2: { id: 'fallback-assignment-l2', title: 'Thuc hanh tao trang HTML ca nhan', description: 'Tao mot trang gioi thieu ban than bang HTML voi tieu de, doan van va lien ket.', dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), maxFileSize: 10, allowedFormats: ['.html', '.zip'], maxScore: 100 },
  l3: { id: 'fallback-assignment-l3', title: 'Thiet ke landing page bang CSS', description: 'Hoan thien mot landing page voi header, hero, feature va footer.', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), maxFileSize: 10, allowedFormats: ['.html', '.css', '.zip'], maxScore: 100 },
  l4: { id: 'fallback-assignment-l4', title: 'Bai tap JavaScript DOM', description: 'Xay dung trang nho thao tac DOM va xu ly su kien bang JavaScript.', dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), maxFileSize: 15, allowedFormats: ['.html', '.js', '.zip'], maxScore: 100 },
  l5: { id: 'fallback-assignment-l5', title: 'Xay dung Todo App bang React', description: 'Tao ung dung Todo su dung component, props va state.', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), maxFileSize: 20, allowedFormats: ['.zip', '.rar'], maxScore: 100 },
  l6: { id: 'fallback-assignment-l6', title: 'Bao cao nhap mon Data Science', description: 'Trinh bay quy trinh Data Science va mot vi du ung dung thuc te.', dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), maxFileSize: 10, allowedFormats: ['.pdf', '.docx'], maxScore: 100 },
  l7: { id: 'fallback-assignment-l7', title: 'Phan tich du lieu voi Python', description: 'Xu ly mot bo du lieu nho bang Python va trinh bay ket qua.', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), maxFileSize: 15, allowedFormats: ['.ipynb', '.py', '.zip'], maxScore: 100 },
  l8: { id: 'fallback-assignment-l8', title: 'Lam sach du lieu voi Pandas', description: 'Doc CSV, xu ly gia tri thieu va xuat bao cao tong hop.', dueDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000), maxFileSize: 15, allowedFormats: ['.ipynb', '.py', '.zip'], maxScore: 100 },
  l9: { id: 'fallback-assignment-l9', title: 'Mini report ve Machine Learning', description: 'Mo ta mot bai toan supervised learning va cach danh gia mo hinh.', dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), maxFileSize: 10, allowedFormats: ['.pdf', '.docx', '.pptx'], maxScore: 100 },
};

const buildFallbackExercise = (lessonId: string): ExerciseData | null => {
  const fallbackExercise = mockExercises.find(exercise => exercise.lessonId === lessonId);
  if (!fallbackExercise) {
    const generatedExercise = defaultExerciseByLesson[lessonId];
    return generatedExercise ? { ...generatedExercise, lessonId } : null;
  }

  return {
    id: fallbackExercise.id,
    lessonId: fallbackExercise.lessonId,
    title: fallbackExercise.title,
    description: fallbackExercise.description,
    type: fallbackExercise.type,
    timeLimit: fallbackExercise.timeLimit || 30,
    questions: fallbackExercise.questions.map(question => ({
      id: question.id,
      question: question.question,
      type: question.type,
      placeholder: question.placeholder,
      expectedAnswer: question.expectedAnswer,
      hints: question.hints,
      points: question.points,
    })),
  };
};

const buildFallbackAssignment = (lessonId: string): AssignmentData | null => {
  const fallbackAssignment = mockAssignments.find(assignment => assignment.lessonId === lessonId);
  if (!fallbackAssignment) {
    const generatedAssignment = defaultAssignmentByLesson[lessonId];
    return generatedAssignment ? { ...generatedAssignment, lessonId } : null;
  }

  return {
    id: fallbackAssignment.id,
    lessonId: fallbackAssignment.lessonId,
    title: fallbackAssignment.title,
    description: fallbackAssignment.description,
    dueDate: new Date(fallbackAssignment.dueDate),
    maxFileSize: fallbackAssignment.maxFileSize,
    allowedFormats: fallbackAssignment.allowedFormats,
    maxScore: fallbackAssignment.maxScore,
  };
};

// ─── Video Player Component ───────────────────────────────────────────────────
const VideoPlayer: React.FC<{ lesson: Lesson }> = ({ lesson }) => {
  if (!lesson.videoUrl) {
    return (
      <div className="aspect-video flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center text-muted-foreground">
          <Play className="h-12 w-12 mx-auto mb-2 opacity-40" />
          <p>Chưa có video cho bài học này</p>
        </div>
      </div>
    );
  }

  if (lesson.videoType === 'youtube') {
    return (
      <div className="aspect-video rounded-lg overflow-hidden bg-black shadow-xl">
        <iframe
          src={`${lesson.videoUrl}?rel=0&modestbranding=1`}
          title={lesson.title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  // upload type
  return (
    <div className="aspect-video rounded-lg overflow-hidden bg-black shadow-xl">
      <video
        src={lesson.videoUrl}
        controls
        className="w-full h-full"
        controlsList="nodownload"
      >
        Trình duyệt của bạn không hỗ trợ video.
      </video>
    </div>
  );
};

// ─── Quiz Component ───────────────────────────────────────────────────────────
interface QuizProps {
  quiz: Quiz;
  userId: string;
  onClose: () => void;
}

const QuizView: React.FC<QuizProps> = ({ quiz, userId, onClose }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(quiz.questions.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(quiz.durationMinutes * 60);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleSubmit = useCallback(async () => {
    if (submitted || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/quiz-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          quizId: quiz.id,
          answers: answers.map(a => a ?? -1),
        }),
      });
      const data: QuizResult = await res.json();
      setResult(data);
      setSubmitted(true);
      toast.success(`Nộp bài thành công! ${data.score}/${data.totalQuestions} câu đúng`);
    } catch {
      toast.error('Nộp bài thất bại, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  }, [submitted, submitting, userId, quiz.id, answers]);

  // Countdown timer
  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [submitted, handleSubmit]);

  const answeredCount = answers.filter(a => a !== null).length;
  const q = quiz.questions[currentQ];

  // ── Results screen ──
  if (submitted && result) {
    const pct = Math.round((result.score / result.totalQuestions) * 100);
    const passed = pct >= 70;
    // Parse answers from API (stored as JSON string possibly)
    const userAnswers: number[] = Array.isArray(result.answers)
      ? result.answers
      : JSON.parse(result.answers as unknown as string ?? '[]');

    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader className="text-center">
          <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${passed ? 'bg-yellow-100' : 'bg-muted'}`}>
            <Trophy className={`h-10 w-10 ${passed ? 'text-yellow-500' : 'text-muted-foreground'}`} />
          </div>
          <CardTitle className="font-display text-2xl">Kết quả bài kiểm tra</CardTitle>
          <p className="text-muted-foreground">{quiz.title}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="mb-1 text-5xl font-bold text-primary">{pct}%</div>
            <div className="mb-2 text-lg text-muted-foreground">{result.score}/{result.totalQuestions} câu đúng</div>
            <Badge className={passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
              {passed ? '✓ Đạt' : '✗ Chưa đạt'}
            </Badge>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Chi tiết câu trả lời</h4>
            {quiz.questions.map((qs, idx) => {
              const ua = userAnswers[idx] ?? -1;
              const correct = ua === qs.correctAnswer;
              return (
                <div key={qs.id} className={`rounded-lg border p-3 ${correct ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                  <div className="flex items-start gap-2">
                    {correct
                      ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />}
                    <div className="text-sm">
                      <p className="font-medium">{qs.question}</p>
                      <p className={`mt-1 ${correct ? 'text-green-700' : 'text-red-600'}`}>
                        Bạn chọn: {ua >= 0 ? qs.options[ua] : 'Chưa trả lời'}
                      </p>
                      {!correct && (
                        <p className="mt-0.5 text-green-700">
                          Đáp án đúng: {qs.options[qs.correctAnswer]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button className="flex-1 btn-gradient" onClick={onClose}>
              Quay lại bài học
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Quiz form ──
  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-xl">{quiz.title}</CardTitle>
          <Badge variant="outline" className={`flex items-center gap-1 ${timeLeft <= 60 ? 'animate-pulse border-destructive text-destructive' : ''}`}>
            <Clock className="h-3.5 w-3.5" />
            {formatTime(timeLeft)}
          </Badge>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Câu {currentQ + 1}/{quiz.questions.length}</span>
            <span>{answeredCount} đã trả lời</span>
          </div>
          <Progress value={(answeredCount / quiz.questions.length) * 100} className="h-1.5" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <h3 className="text-base font-medium">{q.question}</h3>

        <RadioGroup
          value={answers[currentQ]?.toString() ?? ''}
          onValueChange={val => {
            const next = [...answers];
            next[currentQ] = parseInt(val);
            setAnswers(next);
          }}
        >
          {q.options.map((opt, idx) => (
            <div
              key={idx}
              className={`flex cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 ${answers[currentQ] === idx ? 'border-primary bg-primary/5' : ''}`}
              onClick={() => { const n = [...answers]; n[currentQ] = idx; setAnswers(n); }}
            >
              <RadioGroupItem value={idx.toString()} id={`opt-${idx}`} />
              <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer">{opt}</Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" onClick={() => setCurrentQ(p => Math.max(0, p - 1))} disabled={currentQ === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" />Câu trước
          </Button>

          {currentQ === quiz.questions.length - 1 ? (
            <Button className="btn-gradient" onClick={handleSubmit} disabled={answeredCount < quiz.questions.length || submitting}>
              {submitting ? 'Đang nộp...' : 'Nộp bài'}
            </Button>
          ) : (
            <Button onClick={() => setCurrentQ(p => Math.min(quiz.questions.length - 1, p + 1))}>
              Câu tiếp <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigator dots */}
        <div className="flex flex-wrap gap-1.5 border-t pt-3">
          {quiz.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQ(idx)}
              className={`flex h-7 w-7 items-center justify-center rounded text-xs font-medium transition-colors ${
                currentQ === idx ? 'bg-primary text-primary-foreground'
                : answers[idx] !== null ? 'bg-green-100 text-green-700'
                : 'bg-muted text-muted-foreground'
              }`}
            >{idx + 1}</button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Review Section Component ────────────────────────────────────────────────
interface ReviewSectionProps {
  courseId: string;
  userId: string | undefined;
  userName: string | undefined;
  enrolled: boolean;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ courseId, userId, userName, enrolled }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`${API}/reviews/course/${courseId}`);
      setReviews(await res.json());
    } catch {
      console.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  const handleSubmitReview = async () => {
    if (!userId || !comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, courseId, rating, comment, userName: userName || 'Ẩn danh' }),
      });
      if (!res.ok) throw new Error();
      toast.success('Đã gửi đánh giá thành công!');
      setComment('');
      setRating(5);
      fetchReviews();
    } catch {
      toast.error('Gửi đánh giá thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await fetch(`${API}/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: editRating, comment: editComment }),
      });
      toast.success('Đã cập nhật đánh giá');
      setEditingId(null);
      fetchReviews();
    } catch {
      toast.error('Cập nhật thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    try {
      await fetch(`${API}/reviews/${id}`, { method: 'DELETE' });
      toast.success('Đã xóa đánh giá');
      fetchReviews();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const StarRow = ({ value, onChange, disabled = false }: { value: number; onChange?: (v: number) => void; disabled?: boolean }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" disabled={disabled} onClick={() => onChange?.(s)} className="disabled:cursor-default">
          <Star className={`h-5 w-5 transition-colors ${s <= value ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-6 rounded-xl border bg-muted/30 p-5">
        <div className="text-center">
          <div className="text-5xl font-bold text-primary">{avgRating}</div>
          <StarRow value={parseFloat(avgRating)} disabled />
          <div className="mt-1 text-sm text-muted-foreground">{reviews.length} đánh giá</div>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map(star => {
            const count = reviews.filter(r => r.rating === star).length;
            const pct = reviews.length ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-4 text-muted-foreground">{star}</span>
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 rounded-full bg-muted h-2 overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-right text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write Review */}
      {enrolled && userId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4" />
              Viết đánh giá của bạn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StarRow value={rating} onChange={setRating} />
            <Textarea
              placeholder="Chia sẻ trải nghiệm học tập của bạn với khóa học này..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
            />
            <Button
              onClick={handleSubmitReview}
              disabled={!comment.trim() || submitting}
              className="btn-gradient"
            >
              <Send className="mr-2 h-4 w-4" />
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center text-muted-foreground py-8">Đang tải đánh giá...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Chưa có đánh giá nào. Hãy là người đầu tiên!</div>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <Card key={review.id}>
              <CardContent className="p-4">
                {editingId === review.id ? (
                  <div className="space-y-3">
                    <StarRow value={editRating} onChange={setEditRating} />
                    <Textarea value={editComment} onChange={e => setEditComment(e.target.value)} rows={2} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleUpdate(review.id)}>Lưu</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Hủy</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      {(review.userName || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">{review.userName}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="my-1 flex">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                    {userId === review.userId && (
                      <div className="flex gap-1 shrink-0">
                        <button
                          className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground"
                          onClick={() => { setEditingId(review.id); setEditRating(review.rating); setEditComment(review.comment); }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className="rounded p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(review.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main CourseDetail Page ───────────────────────────────────────────────────
const CourseDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isEnrolled, getEnrollment, updateProgress, getProgress } = useEnrollment();
  const { addToCart, isInCart } = useCart();
  const { submitExercise } = useAssignment();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [quizForLesson, setQuizForLesson] = useState<Quiz | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showAssignment, setShowAssignment] = useState(false);
  const [showExercise, setShowExercise] = useState(false);
  const [exerciseForLesson, setExerciseForLesson] = useState<ExerciseData | null>(null);
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [assignmentForLesson, setAssignmentForLesson] = useState<AssignmentData | null>(null);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch course + lessons from real API
  useEffect(() => {
    if (!id) {
      setCourse(null);
      setLessons([]);
      setActiveLesson(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadCourseDetail = async () => {
      setLoading(true);

      try {
        const courseRes = await fetch(`${API}/courses/${id}`, { signal: controller.signal });

        if (courseRes.status === 404) {
          setCourse(null);
          setLessons([]);
          setActiveLesson(null);
          return;
        }

        if (!courseRes.ok) {
          throw new Error(`Failed to load course ${id}: ${courseRes.status}`);
        }

        const courseData: Course = await courseRes.json();
        setCourse(courseData);

        try {
          const lessonRes = await fetch(`${API}/lessons/course/${id}`, { signal: controller.signal });
          if (!lessonRes.ok) {
            throw new Error(`Failed to load lessons for course ${id}: ${lessonRes.status}`);
          }

          const lessonData = await lessonRes.json();
          const ls: Lesson[] = Array.isArray(lessonData) && lessonData.length > 0
            ? lessonData
            : buildFallbackLessons(id);
          setLessons(ls);
          setActiveLesson(ls.length > 0 ? ls[0] : null);
        } catch (lessonError) {
          if (!controller.signal.aborted) {
            console.error(lessonError);
            const fallbackLessons = buildFallbackLessons(id);
            setLessons(fallbackLessons);
            setActiveLesson(fallbackLessons.length > 0 ? fallbackLessons[0] : null);
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          const fallbackCourse = mockCourses.find(course => course.id === id);
          if (fallbackCourse) {
            setCourse({
              id: fallbackCourse.id,
              title: fallbackCourse.title,
              description: fallbackCourse.description,
              instructor: fallbackCourse.instructor,
              thumbnail: fallbackCourse.thumbnail,
              price: fallbackCourse.price,
              duration: fallbackCourse.duration,
              level: fallbackCourse.level,
              category: fallbackCourse.category,
              rating: fallbackCourse.rating,
              totalStudents: fallbackCourse.totalStudents,
              totalLessons: fallbackCourse.totalLessons,
            });
            const fallbackLessons = buildFallbackLessons(id);
            setLessons(fallbackLessons);
            setActiveLesson(fallbackLessons.length > 0 ? fallbackLessons[0] : null);
          } else {
            setCourse(null);
            setLessons([]);
            setActiveLesson(null);
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadCourseDetail();

    return () => controller.abort();
  }, [id]);

  const enrolled = course ? isEnrolled(course.id) : false;
  const inCart = course ? isInCart(course.id) : false;
  const enrollment = course ? getEnrollment(course.id) : undefined;
  const progress = course ? getProgress(course.id) : 0;
  const completedLessons: string[] = enrollment?.completedLessons
    ? (typeof enrollment.completedLessons === 'string'
      ? JSON.parse(enrollment.completedLessons)
      : enrollment.completedLessons)
    : [];

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price);

  const handleLessonClick = async (lesson: Lesson) => {
    if (!enrolled) {
      toast.error('Bạn cần đăng ký khóa học để xem bài giảng này');
      return;
    }
    setActiveLesson(lesson);
    setShowQuiz(false);
    setShowAssignment(false);
    setShowExercise(false);
    setQuizForLesson(null);
    setExerciseForLesson(null);
    setAssignmentForLesson(null);
    updateProgress(course!.id, lesson.id);

    // Đánh dấu đã xem bài (lesson progress API)
    if (user?.id) {
      fetch(`${API}/lesson-progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ userId: user.id, lessonId: lesson.id, courseId: course!.id }),
      }).catch(() => {});
    }

    // Tải quiz cho bài học này
    try {
      const res = await fetch(`${API}/quizzes/lesson/${lesson.id}`);
      const data: Quiz[] = await res.json();
      setQuizForLesson(data.length > 0 ? data[0] : null);
    } catch {
      setQuizForLesson(null);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để mua khóa học');
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }
    addToCart(course!);
    navigate('/checkout');
  };

  const handleAddToCart = () => {
    if (enrolled) { toast.info('Bạn đã đăng ký khóa học này'); return; }
    if (inCart) { navigate('/cart'); return; }
    addToCart(course!);
    toast.success('Đã thêm vào giỏ hàng');
  };

  const handleOpenExercise = async () => {
    if (!activeLesson) {
      toast.error('Vui lòng chọn một bài học trước');
      return;
    }

    setShowAssignment(false);
    setShowQuiz(false);
    setExerciseLoading(true);

    try {
      const res = await fetch(`${API}/exercises/lesson/${activeLesson.id}`, {
        headers: {
          ...getAuthHeaders(),
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to load exercises for lesson ${activeLesson.id}`);
      }

      const data = await res.json();
      const exercises: ExerciseData[] = Array.isArray(data) ? data : [];
      if (exercises.length === 0) {
        const fallbackExercise = buildFallbackExercise(activeLesson.id);
        if (!fallbackExercise) {
          toast.info('Bài học này chưa có bài tập online');
          setShowExercise(false);
          setExerciseForLesson(null);
          return;
        }
        setExerciseForLesson(fallbackExercise);
        setShowExercise(true);
        return;
      }

      setExerciseForLesson(exercises[0]);
      setShowExercise(true);
    } catch (error) {
      console.error(error);
      const fallbackExercise = buildFallbackExercise(activeLesson.id);
      if (fallbackExercise) {
        setExerciseForLesson(fallbackExercise);
        setShowExercise(true);
        toast.info('Đang dùng bài tập dự phòng cho bài học này.');
      } else {
        toast.error('Không tải được bài tập online. Vui lòng kiểm tra dữ liệu trong database.');
        setShowExercise(false);
        setExerciseForLesson(null);
      }
    } finally {
      setExerciseLoading(false);
    }
  };

  const handleOpenAssignment = async () => {
    if (!activeLesson) {
      toast.error('Vui lòng chọn một bài học trước');
      return;
    }

    setShowExercise(false);
    setShowQuiz(false);
    setAssignmentLoading(true);

    try {
      const res = await fetch(`${API}/assignments/lesson/${activeLesson.id}`, {
        headers: {
          ...getAuthHeaders(),
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to load assignments for lesson ${activeLesson.id}`);
      }

      const data = await res.json();
      const assignments: AssignmentData[] = Array.isArray(data)
        ? data.map((assignment: any) => ({
            id: assignment.id,
            lessonId: assignment.lessonId,
            title: assignment.title,
            description: assignment.description,
            dueDate: new Date(assignment.dueDate),
            maxFileSize: assignment.maxFileSizeMb,
            allowedFormats: typeof assignment.allowedFormats === 'string'
              ? assignment.allowedFormats.split(',').map((item: string) => item.trim().startsWith('.') ? item.trim() : `.${item.trim()}`)
              : [],
            maxScore: assignment.maxScore,
          }))
        : [];

      if (assignments.length === 0) {
        const fallbackAssignment = buildFallbackAssignment(activeLesson.id);
        if (!fallbackAssignment) {
          toast.info('Bài học này chưa có bài tập nộp file');
          setShowAssignment(false);
          setAssignmentForLesson(null);
          return;
        }
        setAssignmentForLesson(fallbackAssignment);
        setShowAssignment(true);
        return;
      }

      setAssignmentForLesson(assignments[0]);
      setShowAssignment(true);
    } catch (error) {
      console.error(error);
      const fallbackAssignment = buildFallbackAssignment(activeLesson.id);
      if (fallbackAssignment) {
        setAssignmentForLesson(fallbackAssignment);
        setShowAssignment(true);
        toast.info('Đang dùng bài tập nộp file dự phòng cho bài học này.');
      } else {
        toast.error('Không tải được bài tập nộp file.');
        setShowAssignment(false);
        setAssignmentForLesson(null);
      }
    } finally {
      setAssignmentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container flex flex-1 items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Đang tải khóa học...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container flex flex-1 items-center justify-center py-20">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">Không tìm thấy khóa học</h1>
            <Button onClick={() => navigate('/courses')}><ArrowLeft className="mr-2 h-4 w-4" />Quay lại</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Render ──
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-10" style={{ background: 'var(--gradient-hero)' }}>
          <div className="container">
            <Button variant="ghost" className="mb-5 text-primary-foreground/80 hover:text-primary-foreground" onClick={() => navigate('/courses')}>
              <ArrowLeft className="mr-2 h-4 w-4" />Quay lại
            </Button>
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Info */}
              <div className="lg:col-span-2">
                <Badge className="mb-3 bg-secondary/20 text-secondary">{course.category}</Badge>
                <h1 className="mb-4 font-display text-3xl font-bold text-primary-foreground md:text-4xl">{course.title}</h1>
                <p className="mb-5 text-primary-foreground/80">{course.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-primary-foreground/80">
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-300 text-yellow-300" /><b className="text-primary-foreground">{course.rating}</b></span>
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" />{course.totalStudents.toLocaleString()} học viên</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{course.duration}</span>
                  <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{course.totalLessons} bài học</span>
                </div>
                <p className="mt-3 text-sm text-primary-foreground/70">Giảng viên: <b className="text-primary-foreground">{course.instructor}</b></p>
              </div>

              {/* Sticky card */}
              <div>
                <Card className="sticky top-24 overflow-hidden">
                  <div className="aspect-video overflow-hidden">
                    <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                  </div>
                  <CardContent className="p-5">
                    {enrolled ? (
                      <>
                        <div className="mb-4 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tiến độ</span>
                            <span className="font-semibold">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                        <Button className="w-full btn-gradient" onClick={() => activeLesson && handleLessonClick(activeLesson)}>
                          Tiếp tục học
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="mb-4 text-center text-3xl font-bold text-primary">{formatPrice(course.price)}</div>
                        <div className="space-y-2">
                          <Button className="w-full btn-gradient" onClick={handleBuyNow}>Mua ngay</Button>
                          <Button variant="outline" className={`w-full ${inCart ? 'border-primary text-primary' : ''}`} onClick={handleAddToCart}>
                            {inCart ? <><Check className="mr-2 h-4 w-4" />Trong giỏ hàng</> : <><ShoppingCart className="mr-2 h-4 w-4" />Thêm vào giỏ</>}
                          </Button>
                        </div>
                        <p className="mt-3 text-center text-xs text-muted-foreground">Bao gồm chứng chỉ hoàn thành</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-10">
          <div className="container">
            {/* Quiz view */}
            {showQuiz && quizForLesson ? (
              <div className="space-y-4">
                <Button variant="outline" onClick={() => setShowQuiz(false)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />Quay lại bài học
                </Button>
                <QuizView quiz={quizForLesson} userId={user?.id || ''} onClose={() => setShowQuiz(false)} />
              </div>

            ) : showAssignment && activeLesson ? (
              <div className="space-y-4">
                <Button variant="outline" onClick={() => setShowAssignment(false)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />Quay lại bài học
                </Button>
                {assignmentLoading ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
                      Đang tải bài tập nộp file...
                    </CardContent>
                  </Card>
                ) : assignmentForLesson ? (
                  <AssignmentUpload
                    assignment={assignmentForLesson as any}
                    onComplete={() => setShowAssignment(false)}
                  />
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
                      Không có bài tập nộp file cho bài học này.
                    </CardContent>
                  </Card>
                )}
              </div>

            ) : showExercise ? (
              <div className="space-y-4">
                <Button variant="outline" onClick={() => setShowExercise(false)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />Quay lại bài học
                </Button>
                {exerciseLoading ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
                      Đang tải bài tập online...
                    </CardContent>
                  </Card>
                ) : exerciseForLesson ? (
                  <ExerciseComponent
                    exercise={exerciseForLesson as any}
                    onComplete={s => { submitExercise(s); setShowExercise(false); }}
                  />
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
                      Không có bài tập online cho bài học này.
                    </CardContent>
                  </Card>
                )}
              </div>

            ) : activeLesson && enrolled ? (
              /* ── Video Player View ── */
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Main player */}
                <div className="lg:col-span-2 space-y-4">
                  <VideoPlayer lesson={activeLesson} />

                  <div>
                    <h2 className="text-xl font-bold">{activeLesson.title}</h2>
                    <p className="mt-1 text-muted-foreground">{activeLesson.description}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 border-t pt-4">
                    {quizForLesson && (
                      <Button onClick={() => setShowQuiz(true)}>
                        <FileText className="mr-2 h-4 w-4" />Làm bài kiểm tra
                      </Button>
                    )}
                    <Button variant="secondary" onClick={handleOpenExercise}>
                      <Code className="mr-2 h-4 w-4" />Bài tập online
                    </Button>
                    <Button variant="outline" onClick={handleOpenAssignment}>
                      <Upload className="mr-2 h-4 w-4" />Nộp bài tập
                    </Button>
                    <Button variant="ghost" onClick={() => { setActiveLesson(null); setQuizForLesson(null); }}>
                      <ArrowLeft className="mr-2 h-4 w-4" />Tổng quan
                    </Button>
                  </div>
                </div>

                {/* Lesson list sidebar */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Danh sách bài học</h3>
                  {lessons.map((lesson, idx) => {
                    const done = completedLessons.includes(lesson.id);
                    const isActive = activeLesson?.id === lesson.id;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson)}
                        className={`w-full text-left flex items-center gap-3 rounded-lg border p-3 transition-all hover:bg-muted/60 ${isActive ? 'border-primary/50 bg-primary/5' : ''}`}
                      >
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${done ? 'bg-green-100 text-green-700' : isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                          {done ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isActive ? 'text-primary' : ''}`}>{lesson.title}</p>
                          <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                        </div>
                        <Play className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              </div>

            ) : (
              /* ── Course Overview Tabs ── */
              <Tabs defaultValue="curriculum" className="space-y-6">
                <TabsList className="w-full justify-start bg-muted/50">
                  <TabsTrigger value="curriculum">Nội dung</TabsTrigger>
                  <TabsTrigger value="reviews">
                    Đánh giá
                    <Badge variant="outline" className="ml-2 text-xs">{0}</Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="curriculum" className="space-y-3">
                  <h3 className="font-display text-xl font-semibold">Nội dung khóa học</h3>
                  {lessons.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">Chưa có bài học nào</div>
                  ) : lessons.map((lesson, idx) => {
                    const done = completedLessons.includes(lesson.id);
                    return (
                      <Card
                        key={lesson.id}
                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${!enrolled ? 'opacity-80' : ''}`}
                        onClick={() => handleLessonClick(lesson)}
                      >
                        <CardContent className="flex items-center gap-4 p-4">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${done ? 'bg-green-100 text-green-700' : 'bg-muted'}`}>
                            {done ? <CheckCircle2 className="h-5 w-5" /> : enrolled ? <Play className="h-5 w-5" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
                          </div>
                          <div className="flex-1">
                            <span className="text-xs text-muted-foreground">Bài {idx + 1}</span>
                            <h4 className="font-medium">{lesson.title}</h4>
                          </div>
                          <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                        </CardContent>
                      </Card>
                    );
                  })}
                </TabsContent>

                <TabsContent value="reviews">
                  <ReviewSection
                    courseId={id!}
                    userId={user?.id}
                    userName={user?.fullName}
                    enrolled={enrolled}
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CourseDetail;
