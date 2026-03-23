import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Calendar, CheckCircle2, XCircle, BookOpen, Upload, Code } from 'lucide-react';

const API = 'http://localhost:8080/api';

interface QuizResult {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  answers: number[] | string;
  submittedAt: string;
}

interface AssignmentResult {
  id: string;
  userId: string;
  assignmentId: string;
  fileName: string;
  fileSize: number;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  status: 'pending' | 'graded';
}

interface ExerciseResult {
  id: string;
  userId: string;
  exerciseId: string;
  totalScore: number;
  maxScore: number;
  submittedAt: string;
  timeSpent: number;
}

const MyResults: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [assignmentResults, setAssignmentResults] = useState<AssignmentResult[]>([]);
  const [exerciseResults, setExerciseResults] = useState<ExerciseResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    Promise.all([
      fetch(`${API}/quiz-results/user/${user.id}`).then(r => r.ok ? r.json() : []),
      fetch(`${API}/assignment-submissions/user/${user.id}`).then(r => r.ok ? r.json() : []),
      fetch(`${API}/exercise-submissions/user/${user.id}`).then(r => r.ok ? r.json() : []),
    ])
      .then(([quizData, assignmentData, exerciseData]) => {
        setQuizResults(Array.isArray(quizData) ? quizData : []);
        setAssignmentResults(Array.isArray(assignmentData) ? assignmentData : []);
        setExerciseResults(Array.isArray(exerciseData) ? exerciseData : []);
      })
      .catch(() => {
        setQuizResults([]);
        setAssignmentResults([]);
        setExerciseResults([]);
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const totalCount = quizResults.length + assignmentResults.length + exerciseResults.length;

  const sortedQuizzes = useMemo(() =>
    quizResults.slice().sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
  , [quizResults]);

  const sortedAssignments = useMemo(() =>
    assignmentResults.slice().sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
  , [assignmentResults]);

  const sortedExercises = useMemo(() =>
    exerciseResults.slice().sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
  , [exerciseResults]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container flex flex-1 items-center justify-center py-20">
          <div className="text-center">
            <h1 className="mb-4 font-display text-2xl font-bold">Vui lÃ²ng Ä‘Äƒng nháº­p</h1>
            <Button onClick={() => navigate('/login')}>ÄÄƒng nháº­p ngay</Button>
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
        <section className="border-b bg-muted/30 py-10">
          <div className="container">
            <Badge className="mb-3">Káº¿t quáº£</Badge>
            <h1 className="mb-2 font-display text-3xl font-bold md:text-4xl">Káº¿t quáº£ há»c táº­p</h1>
            <p className="text-muted-foreground">Xem láº¡i káº¿t quáº£ quiz, bÃ i táº­p online vÃ  bÃ i ná»™p file cá»§a báº¡n.</p>
          </div>
        </section>

        <section className="py-10">
          <div className="container max-w-4xl space-y-8">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : totalCount === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
                <BookOpen className="mb-4 h-14 w-14 text-muted-foreground" />
                <h3 className="mb-1 text-lg font-semibold">ChÆ°a cÃ³ káº¿t quáº£ nÃ o</h3>
                <p className="mb-5 text-center text-sm text-muted-foreground">
                  HÃ£y vÃ o cÃ¡c khÃ³a há»c vÃ  thá»±c hiá»‡n quiz, bÃ i táº­p online hoáº·c ná»™p bÃ i Ä‘á»ƒ xem káº¿t quáº£ á»Ÿ Ä‘Ã¢y.
                </p>
                <Button onClick={() => navigate('/my-courses')} className="btn-gradient">
                  KhÃ³a há»c cá»§a tÃ´i
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">{totalCount} káº¿t quáº£</p>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Quiz</h2>
                  </div>
                  {sortedQuizzes.length === 0 ? (
                    <Card><CardContent className="py-6 text-sm text-muted-foreground">ChÆ°a cÃ³ káº¿t quáº£ quiz.</CardContent></Card>
                  ) : sortedQuizzes.map(result => {
                    const pct = Math.round((result.score / result.totalQuestions) * 100);
                    const passed = pct >= 70;
                    return (
                      <Card key={result.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <CardTitle className="text-base">Quiz #{result.quizId}</CardTitle>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(result.submittedAt).toLocaleString('vi-VN')}
                              </div>
                            </div>
                            <Badge className={passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              {passed ? 'Äáº¡t' : 'ChÆ°a Ä‘áº¡t'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="rounded-lg bg-muted p-3">
                              <div className="text-2xl font-bold text-primary">{pct}%</div>
                              <div className="text-xs text-muted-foreground">Äiá»ƒm sá»‘</div>
                            </div>
                            <div className="rounded-lg bg-muted p-3">
                              <div className="text-2xl font-bold text-green-600">{result.score}</div>
                              <div className="text-xs text-muted-foreground">CÃ¢u Ä‘Ãºng</div>
                            </div>
                            <div className="rounded-lg bg-muted p-3">
                              <div className="text-2xl font-bold text-red-500">{result.totalQuestions - result.score}</div>
                              <div className="text-xs text-muted-foreground">CÃ¢u sai</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">BÃ i táº­p online</h2>
                  </div>
                  {sortedExercises.length === 0 ? (
                    <Card><CardContent className="py-6 text-sm text-muted-foreground">ChÆ°a cÃ³ káº¿t quáº£ bÃ i táº­p online.</CardContent></Card>
                  ) : sortedExercises.map(result => {
                    const pct = result.maxScore > 0 ? Math.round((result.totalScore / result.maxScore) * 100) : 0;
                    return (
                      <Card key={result.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <CardTitle className="text-base">Exercise #{result.exerciseId}</CardTitle>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(result.submittedAt).toLocaleString('vi-VN')}
                              </div>
                            </div>
                            <Badge variant="outline">{pct}%</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="rounded-lg bg-muted p-3">
                              <div className="text-2xl font-bold text-primary">{result.totalScore}/{result.maxScore}</div>
                              <div className="text-xs text-muted-foreground">Tá»•ng Ä‘iá»ƒm</div>
                            </div>
                            <div className="rounded-lg bg-muted p-3">
                              <div className="text-2xl font-bold">{pct}%</div>
                              <div className="text-xs text-muted-foreground">Tá»· lá»‡</div>
                            </div>
                            <div className="rounded-lg bg-muted p-3">
                              <div className="text-2xl font-bold">{Math.round((result.timeSpent || 0) / 60)}p</div>
                              <div className="text-xs text-muted-foreground">Thá»i gian</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">BÃ i ná»™p file</h2>
                  </div>
                  {sortedAssignments.length === 0 ? (
                    <Card><CardContent className="py-6 text-sm text-muted-foreground">ChÆ°a cÃ³ káº¿t quáº£ bÃ i ná»™p file.</CardContent></Card>
                  ) : sortedAssignments.map(result => {
                    const isGraded = result.status === 'graded' && typeof result.grade === 'number';
                    return (
                      <Card key={result.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <CardTitle className="text-base">Assignment #{result.assignmentId}</CardTitle>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(result.submittedAt).toLocaleString('vi-VN')}
                              </div>
                            </div>
                            <Badge className={isGraded ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                              {isGraded ? 'ÄÃ£ cháº¥m' : 'Chá» cháº¥m'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="rounded-lg bg-muted p-3 text-sm">
                            <div className="font-medium">{result.fileName}</div>
                            <div className="text-muted-foreground">{(result.fileSize / 1024).toFixed(1)} KB</div>
                          </div>
                          {isGraded && (
                            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                              <div className="text-2xl font-bold text-primary">{result.grade}</div>
                              {result.feedback && (
                                <p className="mt-1 text-sm text-muted-foreground">{result.feedback}</p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MyResults;
