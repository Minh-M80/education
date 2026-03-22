import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Calendar, CheckCircle2, XCircle, BookOpen } from 'lucide-react';

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

const MyResults: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API}/quiz-results/user/${user.id}`)
      .then(r => r.json())
      .then(data => setResults(Array.isArray(data) ? data : []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container flex flex-1 items-center justify-center py-20">
          <div className="text-center">
            <h1 className="mb-4 font-display text-2xl font-bold">Vui lòng đăng nhập</h1>
            <Button onClick={() => navigate('/login')}>Đăng nhập ngay</Button>
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
        {/* Header */}
        <section className="border-b bg-muted/30 py-10">
          <div className="container">
            <Badge className="mb-3">Kết quả</Badge>
            <h1 className="mb-2 font-display text-3xl font-bold md:text-4xl">Lịch sử bài kiểm tra</h1>
            <p className="text-muted-foreground">Xem lại toàn bộ kết quả các bài quiz bạn đã làm.</p>
          </div>
        </section>

        <section className="py-10">
          <div className="container max-w-3xl">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
                <BookOpen className="mb-4 h-14 w-14 text-muted-foreground" />
                <h3 className="mb-1 text-lg font-semibold">Chưa có kết quả nào</h3>
                <p className="text-center text-sm text-muted-foreground mb-5">
                  Hãy vào các khóa học và làm bài kiểm tra để xem kết quả ở đây.
                </p>
                <Button onClick={() => navigate('/my-courses')} className="btn-gradient">
                  Khóa học của tôi
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{results.length} kết quả</p>
                {results
                  .slice()
                  .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                  .map(result => {
                    const pct = Math.round((result.score / result.totalQuestions) * 100);
                    const passed = pct >= 70;
                    return (
                      <Card key={result.id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${passed ? 'bg-yellow-100' : 'bg-muted'}`}>
                                <Trophy className={`h-5 w-5 ${passed ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                              </div>
                              <div>
                                <CardTitle className="text-base">Quiz #{result.quizId}</CardTitle>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(result.submittedAt).toLocaleString('vi-VN')}
                                </div>
                              </div>
                            </div>
                            <Badge className={passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              {passed ? '✓ Đạt' : '✗ Chưa đạt'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="rounded-lg bg-muted p-3">
                              <div className="text-2xl font-bold text-primary">{pct}%</div>
                              <div className="text-xs text-muted-foreground">Điểm số</div>
                            </div>
                            <div className="rounded-lg bg-muted p-3">
                              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-600">
                                <CheckCircle2 className="h-5 w-5" />{result.score}
                              </div>
                              <div className="text-xs text-muted-foreground">Câu đúng</div>
                            </div>
                            <div className="rounded-lg bg-muted p-3">
                              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-red-500">
                                <XCircle className="h-5 w-5" />{result.totalQuestions - result.score}
                              </div>
                              <div className="text-xs text-muted-foreground">Câu sai</div>
                            </div>
                          </div>

                          {/* Score bar */}
                          <div className="mt-3">
                            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${passed ? 'bg-green-500' : 'bg-red-400'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                              <span>0%</span>
                              <span className="text-yellow-600">70% (đạt)</span>
                              <span>100%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MyResults;
