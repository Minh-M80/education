import React, { useState, useRef } from 'react';
import { Assignment, AssignmentSubmission } from '@/types/lms';
import { useAuth } from '@/contexts/AuthContext';
import { useAssignment } from '@/contexts/AssignmentContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  X,
  File,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface AssignmentUploadProps {
  assignment: Assignment;
  onComplete?: () => void;
}

const AssignmentUpload: React.FC<AssignmentUploadProps> = ({ assignment, onComplete }) => {
  const { user } = useAuth();
  const { submitAssignment, getAssignmentSubmission } = useAssignment();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const existingSubmission = user ? getAssignmentSubmission(assignment.id, user.id) : undefined;
  const isOverdue = new Date() > new Date(assignment.dueDate);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > assignment.maxFileSize * 1024 * 1024) {
      return `File quá lớn. Kích thước tối đa: ${assignment.maxFileSize}MB`;
    }

    // Check file format
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!assignment.allowedFormats.includes(extension)) {
      return `Định dạng không hợp lệ. Cho phép: ${assignment.allowedFormats.join(', ')}`;
    }

    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSubmit = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    submitAssignment({
      assignmentId: assignment.id,
      userId: user.id,
      fileName: selectedFile.name,
      fileSize: selectedFile.size
    });

    setIsUploading(false);
    setSelectedFile(null);
    toast.success('Nộp bài tập thành công!');
    onComplete?.();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Already submitted view
  if (existingSubmission) {
    const isGraded = existingSubmission.status === 'graded';
    const gradePercent = isGraded && existingSubmission.grade 
      ? Math.round((existingSubmission.grade / assignment.maxScore) * 100) 
      : 0;
    
    return (
      <Card className={isGraded ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}>
        <CardHeader>
          <div className="flex items-center gap-2">
            {isGraded ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <Clock className="h-5 w-5 text-warning animate-pulse" />
            )}
            <CardTitle className="text-lg">
              {isGraded ? 'Đã chấm điểm' : 'Đang chờ chấm điểm...'}
            </CardTitle>
          </div>
          <CardDescription>{assignment.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Score display for graded submissions */}
          {isGraded && existingSubmission.grade !== undefined && (
            <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-6 text-center">
              <div className="mb-2 text-sm font-medium text-muted-foreground">Điểm của bạn</div>
              <div className="flex items-center justify-center gap-2">
                <span className={`text-5xl font-bold ${
                  gradePercent >= 90 ? 'text-success' : 
                  gradePercent >= 70 ? 'text-primary' : 
                  gradePercent >= 50 ? 'text-warning' : 'text-destructive'
                }`}>
                  {existingSubmission.grade}
                </span>
                <span className="text-2xl text-muted-foreground">/ {assignment.maxScore}</span>
              </div>
              <div className="mt-3">
                <Progress 
                  value={gradePercent} 
                  className="h-3"
                />
              </div>
              <div className="mt-2">
                <Badge className={
                  gradePercent >= 90 ? 'bg-success text-success-foreground' : 
                  gradePercent >= 70 ? 'bg-primary text-primary-foreground' : 
                  gradePercent >= 50 ? 'bg-warning text-warning-foreground' : 'bg-destructive text-destructive-foreground'
                }>
                  {gradePercent >= 90 ? 'Xuất sắc' : 
                   gradePercent >= 80 ? 'Giỏi' : 
                   gradePercent >= 70 ? 'Khá' : 
                   gradePercent >= 50 ? 'Trung bình' : 'Cần cải thiện'}
                </Badge>
              </div>
            </div>
          )}

          {/* File info */}
          <div className="flex items-center gap-3 rounded-lg border bg-background p-3">
            <FileText className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <p className="font-medium">{existingSubmission.fileName}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(existingSubmission.fileSize)} • Nộp lúc {formatDate(new Date(existingSubmission.submittedAt))}
              </p>
            </div>
            {!isGraded && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-warning"></div>
                <span className="text-sm text-muted-foreground">Đang chấm...</span>
              </div>
            )}
          </div>

          {/* Feedback */}
          {existingSubmission.feedback && (
            <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-4">
              <p className="mb-1 text-sm font-semibold text-primary">💬 Nhận xét của giảng viên:</p>
              <p className="text-sm text-foreground">{existingSubmission.feedback}</p>
            </div>
          )}

          {!isOverdue && isGraded && (
            <Button variant="outline" onClick={() => {/* Allow resubmit */}}>
              Nộp lại bài
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{assignment.title}</CardTitle>
            <CardDescription>{assignment.description}</CardDescription>
          </div>
          <Badge variant={isOverdue ? 'destructive' : 'outline'} className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {isOverdue ? 'Quá hạn' : `Hạn nộp: ${formatDate(assignment.dueDate)}`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File info */}
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span>Kích thước tối đa: {assignment.maxFileSize}MB</span>
          <span>•</span>
          <span>Định dạng: {assignment.allowedFormats.join(', ')}</span>
          <span>•</span>
          <span>Điểm tối đa: {assignment.maxScore}</span>
        </div>

        {/* Drop zone */}
        <div
          className={`relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
            error 
              ? 'border-destructive bg-destructive/5' 
              : selectedFile 
                ? 'border-success bg-success/5' 
                : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={assignment.allowedFormats.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex flex-col items-center gap-2 p-4">
              <File className="h-10 w-10 text-success" />
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Xóa file
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-4 text-center">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="font-medium">Kéo thả file vào đây</p>
              <p className="text-sm text-muted-foreground">hoặc click để chọn file</p>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Upload progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Đang tải lên...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Submit button */}
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={!selectedFile || isUploading || isOverdue}
        >
          {isUploading ? 'Đang tải lên...' : 'Nộp bài tập'}
        </Button>

        {isOverdue && (
          <p className="text-center text-sm text-destructive">
            Bài tập đã quá hạn nộp
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AssignmentUpload;
