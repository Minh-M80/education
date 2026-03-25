package com.example.educationbackend.controller;

import com.example.educationbackend.exception.ResourceNotFoundException;
import com.example.educationbackend.model.Quiz;
import com.example.educationbackend.repository.QuizQuestionRepository;
import com.example.educationbackend.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizQuestionRepository quizQuestionRepository;

    /**
     * GET /api/quizzes/lesson/{lessonId}
     * Lấy tất cả bộ quiz của một bài học, kèm câu hỏi đầy đủ.
     * Lưu ý: correct_answer được trả về để frontend có thể chấm điểm phía client.
     * Nếu muốn ẩn đáp án đến khi nộp bài, hãy dùng DTO riêng.
     */
    @GetMapping("/lesson/{lessonId}")
    public List<Quiz> getQuizzesByLessonId(@PathVariable String lessonId) {
        List<Quiz> quizzes = quizRepository.findByLessonId(lessonId);
        for (Quiz quiz : quizzes) {
            quiz.setQuestions(quizQuestionRepository.findByQuizId(quiz.getId()));
        }
        return quizzes;
    }

    /**
     * GET /api/quizzes/{quizId}
     * Lấy chi tiết một bộ quiz cụ thể, kèm toàn bộ câu hỏi và đáp án.
     */
    @GetMapping("/{quizId}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable String quizId) {
        Optional<Quiz> quizOpt = quizRepository.findById(quizId);
        if (quizOpt.isEmpty()) {
            throw new ResourceNotFoundException("Quiz not found");
        }
        Quiz quiz = quizOpt.get();
        quiz.setQuestions(quizQuestionRepository.findByQuizId(quizId));
        return ResponseEntity.ok(quiz);
    }
}
