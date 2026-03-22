import React, { useState, useEffect, useCallback } from 'react';
import { Quiz, QuizSubmission } from '@/types/lms';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle, Trophy, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface QuizComponentProps {
  quiz: Quiz;
  onComplete: (submission: QuizSubmission) => void;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ quiz, onComplete }) => {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(quiz.questions.length).fill(null)
  );
  const [timeLeft, setTimeLeft] = useState(quiz.duration * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Timer
  useEffect(() => {
    if (isSubmitted) return;

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

  const handleAnswerSelect = (answerIndex: number) => {
    if (isSubmitted) return;
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = useCallback(() => {
    if (isSubmitted) return;

    // Calculate score
    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / quiz.questions.length) * 100);
    setScore(finalScore);
    setIsSubmitted(true);
    setShowResults(true);

    const submission: QuizSubmission = {
      id: 'qs_' + Date.now(),
      quizId: quiz.id,
      userId: user?.id || '',
      answers: answers.map(a => a ?? -1),
      score: finalScore,
      submittedAt: new Date(),
      timeSpent: quiz.duration * 60 - timeLeft
    };

    onComplete(submission);
    toast.success(`Bạn đã hoàn thành bài kiểm tra với điểm số ${finalScore}%!`);
  }, [answers, quiz, timeLeft, user, isSubmitted, onComplete]);

  const question = quiz.questions[currentQuestion];
  const answeredCount = answers.filter(a => a !== null).length;
  const progressPercent = (answeredCount / quiz.questions.length) * 100;

  if (showResults) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Trophy className={`h-10 w-10 ${score >= 70 ? 'text-warning' : 'text-muted-foreground'}`} />
          </div>
          <CardTitle className="font-display text-2xl">Kết quả bài kiểm tra</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score */}
          <div className="text-center">
            <div className="mb-2 text-5xl font-bold text-primary">{score}%</div>
            <Badge 
              className={score >= 70 ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}
            >
              {score >= 70 ? 'Đạt' : 'Chưa đạt'}
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg bg-muted p-4">
              <div className="text-2xl font-bold text-foreground">
                {answers.filter((a, i) => a === quiz.questions[i].correctAnswer).length}
              </div>
              <div className="text-sm text-muted-foreground">Đúng</div>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <div className="text-2xl font-bold text-foreground">
                {answers.filter((a, i) => a !== quiz.questions[i].correctAnswer && a !== null).length}
              </div>
              <div className="text-sm text-muted-foreground">Sai</div>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <div className="text-2xl font-bold text-foreground">
                {formatTime(quiz.duration * 60 - timeLeft)}
              </div>
              <div className="text-sm text-muted-foreground">Thời gian</div>
            </div>
          </div>

          {/* Question Review */}
          <div className="space-y-4">
            <h4 className="font-semibold">Chi tiết câu trả lời</h4>
            {quiz.questions.map((q, idx) => {
              const isCorrect = answers[idx] === q.correctAnswer;
              return (
                <div 
                  key={q.id} 
                  className={`rounded-lg border p-4 ${isCorrect ? 'border-success/50 bg-success/5' : 'border-destructive/50 bg-destructive/5'}`}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 text-destructive" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{q.question}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Đáp án của bạn: <span className={isCorrect ? 'text-success' : 'text-destructive'}>
                          {answers[idx] !== null ? q.options[answers[idx]] : 'Chưa trả lời'}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="mt-1 text-sm text-success">
                          Đáp án đúng: {q.options[q.correctAnswer]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-xl">{quiz.title}</CardTitle>
          <Badge 
            variant="outline" 
            className={`flex items-center gap-1 ${timeLeft <= 60 ? 'animate-pulse-soft border-destructive text-destructive' : ''}`}
          >
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Câu {currentQuestion + 1} / {quiz.questions.length}</span>
            <span>{answeredCount} câu đã trả lời</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{question.question}</h3>
          
          <RadioGroup
            value={answers[currentQuestion]?.toString() ?? ''}
            onValueChange={(val) => handleAnswerSelect(parseInt(val))}
          >
            {question.options.map((option, idx) => (
              <div
                key={idx}
                className={`flex cursor-pointer items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
                  answers[currentQuestion] === idx ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => handleAnswerSelect(idx)}
              >
                <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Câu trước
          </Button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <Button 
              onClick={handleSubmit}
              className="btn-gradient"
              disabled={answeredCount < quiz.questions.length}
            >
              Nộp bài
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))}
            >
              Câu tiếp
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="border-t border-border pt-4">
          <p className="mb-2 text-sm text-muted-foreground">Điều hướng câu hỏi:</p>
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  currentQuestion === idx
                    ? 'bg-primary text-primary-foreground'
                    : answers[idx] !== null
                    ? 'bg-success/20 text-success'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizComponent;
