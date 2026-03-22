import React, { useState, useEffect, useCallback } from 'react';
import { Exercise, ExerciseSubmission, ExerciseAnswer } from '@/types/lms';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Lightbulb,
  Code,
  FileText,
  Trophy
} from 'lucide-react';
import { toast } from 'sonner';

interface ExerciseComponentProps {
  exercise: Exercise;
  onComplete: (submission: ExerciseSubmission) => void;
}

const ExerciseComponent: React.FC<ExerciseComponentProps> = ({ exercise, onComplete }) => {
  const { user } = useAuth();
  const questions = Array.isArray(exercise.questions) ? exercise.questions : [];
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(
    new Array(questions.length).fill('')
  );
  const [timeLeft, setTimeLeft] = useState((exercise.timeLimit || 30) * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<ExerciseAnswer[]>([]);
  const [showHint, setShowHint] = useState<boolean[]>(
    new Array(questions.length).fill(false)
  );

  // Timer
  useEffect(() => {
    if (isSubmitted || !exercise.timeLimit) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const toggleHint = (index: number) => {
    const newShowHint = [...showHint];
    newShowHint[index] = !newShowHint[index];
    setShowHint(newShowHint);
  };

  const handleSubmit = useCallback(() => {
    if (isSubmitted) return;

    // Calculate scores for each answer
    const exerciseResults: ExerciseAnswer[] = questions.map((q, idx) => {
      const userAnswer = answers[idx]?.trim().toLowerCase() || '';
      const expectedAnswer = q.expectedAnswer?.trim().toLowerCase() || '';
      
      let isCorrect = false;
      let score = 0;

      if (q.type === 'fill-blank' || q.type === 'short-answer') {
        // Simple comparison for fill-blank and short-answer
        isCorrect = userAnswer === expectedAnswer || 
                   userAnswer.includes(expectedAnswer) ||
                   expectedAnswer.includes(userAnswer);
        score = isCorrect ? q.points : 0;
      } else if (q.type === 'coding') {
        // For coding, check if key elements are present
        const keywords = expectedAnswer.split(/[,;]/).map(k => k.trim());
        const matchedKeywords = keywords.filter(k => userAnswer.includes(k));
        score = Math.round((matchedKeywords.length / keywords.length) * q.points);
        isCorrect = score >= q.points * 0.7; // 70% threshold
      }

      return {
        questionId: q.id,
        answer: answers[idx] || '',
        isCorrect,
        score
      };
    });

    const totalScore = exerciseResults.reduce((sum, r) => sum + r.score, 0);
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0);

    setResults(exerciseResults);
    setIsSubmitted(true);

    const submission: ExerciseSubmission = {
      id: 'es_' + Date.now(),
      exerciseId: exercise.id,
      userId: user?.id || '',
      answers: exerciseResults,
      totalScore,
      maxScore,
      submittedAt: new Date(),
      timeSpent: (exercise.timeLimit || 30) * 60 - timeLeft
    };

    onComplete(submission);
    toast.success(`Hoàn thành bài tập với điểm ${totalScore}/${maxScore}!`);
  }, [answers, exercise, timeLeft, user, isSubmitted, onComplete]);

  const question = questions[currentQuestion];
  const answeredCount = answers.filter(a => a.trim() !== '').length;
  const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (questions.length === 0) {
    return (
      <Card className="mx-auto max-w-4xl">
        <CardContent className="py-12 text-center text-muted-foreground">
          Bài tập này chưa có câu hỏi.
        </CardContent>
      </Card>
    );
  }

  // Results view
  if (isSubmitted) {
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = Math.round((totalScore / maxScore) * 100);

    return (
      <Card className="mx-auto max-w-4xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Trophy className={`h-10 w-10 ${percentage >= 70 ? 'text-warning' : 'text-muted-foreground'}`} />
          </div>
          <CardTitle className="text-2xl">Kết quả bài tập</CardTitle>
          <p className="text-muted-foreground">{exercise.title}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-primary/5">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{totalScore}/{maxScore}</div>
                <p className="text-sm text-muted-foreground">Tổng điểm</p>
              </CardContent>
            </Card>
            <Card className="bg-success/5">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-success">
                  {results.filter(r => r.isCorrect).length}
                </div>
                <p className="text-sm text-muted-foreground">Câu đúng</p>
              </CardContent>
            </Card>
            <Card className="bg-muted">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold">
                  {formatTime((exercise.timeLimit || 30) * 60 - timeLeft)}
                </div>
                <p className="text-sm text-muted-foreground">Thời gian làm bài</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed results */}
          <div className="space-y-4">
            <h3 className="font-semibold">Chi tiết kết quả</h3>
            {questions.map((q, idx) => {
              const result = results[idx];
              return (
                <Card key={q.id} className={result?.isCorrect ? 'border-success/30' : 'border-destructive/30'}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {result?.isCorrect ? (
                        <CheckCircle2 className="mt-1 h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="mt-1 h-5 w-5 text-destructive" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {q.type === 'coding' ? 'Code' : q.type === 'fill-blank' ? 'Điền từ' : 'Tự luận'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Điểm: {result?.score || 0}/{q.points}
                          </span>
                        </div>
                        <p className="mt-1 font-medium">{q.question}</p>
                        <div className="mt-2 space-y-1 text-sm">
                          <p>
                            <span className="text-muted-foreground">Câu trả lời của bạn: </span>
                            <span className={result?.isCorrect ? 'text-success' : 'text-destructive'}>
                              {result?.answer || '(Không trả lời)'}
                            </span>
                          </p>
                          {!result?.isCorrect && q.expectedAnswer && (
                            <p>
                              <span className="text-muted-foreground">Đáp án: </span>
                              <span className="text-success">{q.expectedAnswer}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="outline" className="mb-2">
              {exercise.type === 'coding' ? (
                <><Code className="mr-1 h-3 w-3" /> Bài tập lập trình</>
              ) : exercise.type === 'fill-blank' ? (
                <><FileText className="mr-1 h-3 w-3" /> Điền từ</>
              ) : (
                <><FileText className="mr-1 h-3 w-3" /> Tự luận ngắn</>
              )}
            </Badge>
            <CardTitle>{exercise.title}</CardTitle>
          </div>
          {exercise.timeLimit && (
            <div className={`flex items-center gap-2 rounded-full px-4 py-2 font-mono text-lg font-semibold ${
              timeLeft <= 60 ? 'bg-destructive text-destructive-foreground' : 'bg-muted'
            }`}>
              <Clock className="h-5 w-5" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
        <p className="text-muted-foreground">{exercise.description}</p>
        
        {/* Progress */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tiến độ: {answeredCount}/{questions.length} câu</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge>Câu {currentQuestion + 1} / {questions.length}</Badge>
            <span className="text-sm text-muted-foreground">Điểm: {question.points}</span>
          </div>

          <h3 className="text-lg font-medium">{question.question}</h3>

          {/* Answer input based on type */}
          {question.type === 'coding' ? (
            <div className="space-y-2">
              <Textarea
                value={answers[currentQuestion]}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder={question.placeholder || 'Nhập code của bạn...'}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          ) : question.type === 'fill-blank' ? (
            <Input
              value={answers[currentQuestion]}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder={question.placeholder || 'Nhập câu trả lời...'}
              className="text-lg"
            />
          ) : (
            <Textarea
              value={answers[currentQuestion]}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder={question.placeholder || 'Nhập câu trả lời...'}
              className="min-h-[100px]"
            />
          )}

          {/* Hints */}
          {question.hints && question.hints.length > 0 && (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleHint(currentQuestion)}
                className="text-muted-foreground"
              >
                <Lightbulb className="mr-1 h-4 w-4" />
                {showHint[currentQuestion] ? 'Ẩn gợi ý' : 'Xem gợi ý'}
              </Button>
              {showHint[currentQuestion] && (
                <div className="rounded-lg bg-warning/10 p-3 text-sm">
                  <ul className="list-inside list-disc space-y-1">
                    {question.hints.map((hint, idx) => (
                      <li key={idx}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(prev => prev - 1)}
            disabled={currentQuestion === 0}
          >
            Câu trước
          </Button>

          <div className="flex gap-1">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`h-8 w-8 rounded-full text-xs font-medium transition-colors ${
                  idx === currentQuestion
                    ? 'bg-primary text-primary-foreground'
                    : answers[idx]?.trim()
                      ? 'bg-success/20 text-success hover:bg-success/30'
                      : 'bg-muted hover:bg-muted-foreground/20'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentQuestion < questions.length - 1 ? (
            <Button onClick={() => setCurrentQuestion(prev => prev + 1)}>
              Câu tiếp
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              className="btn-gradient"
              disabled={answeredCount < exercise.questions.length}
            >
              Nộp bài
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseComponent;
