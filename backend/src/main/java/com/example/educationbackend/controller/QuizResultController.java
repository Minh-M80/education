package com.example.educationbackend.controller;

import com.example.educationbackend.model.QuizQuestion;
import com.example.educationbackend.model.QuizResult;
import com.example.educationbackend.repository.QuizQuestionRepository;
import com.example.educationbackend.repository.QuizResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/quiz-results")
public class QuizResultController {

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private QuizQuestionRepository quizQuestionRepository;

    /**
     * POST /api/quiz-results
     * Nộp bài quiz: nhận đáp án của user, tự động tính điểm và lưu kết quả.
     * Body: { "userId": "u1", "quizId": "q1", "answers": [0, 1, 2] }
     */
    @PostMapping
    public ResponseEntity<?> submitQuiz(@RequestBody Map<String, Object> request) {
        String userId = (String) request.get("userId");
        String quizId = (String) request.get("quizId");
        Object answersObj = request.get("answers");

        if (userId == null || quizId == null || answersObj == null) {
            return ResponseEntity.badRequest().body("Thiếu userId, quizId hoặc answers");
        }

        // Lấy câu hỏi để chấm điểm
        List<QuizQuestion> questions = quizQuestionRepository.findByQuizId(quizId);
        if (questions.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // answersObj từ JSON sẽ là List<Integer>
        List<?> userAnswers;
        if (answersObj instanceof List) {
            userAnswers = (List<?>) answersObj;
        } else {
            return ResponseEntity.badRequest().body("Định dạng answers không hợp lệ, cần là mảng số nguyên");
        }

        // Tính điểm
        int score = 0;
        for (int i = 0; i < questions.size() && i < userAnswers.size(); i++) {
            Object ua = userAnswers.get(i);
            int userAnswer = (ua instanceof Number) ? ((Number) ua).intValue() : -1;
            if (userAnswer == questions.get(i).getCorrectAnswer()) {
                score++;
            }
        }

        // Chuyển answers sang JSON string
        String answersJson;
        try {
            answersJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(userAnswers);
        } catch (Exception e) {
            answersJson = answersObj.toString();
        }

        QuizResult result = new QuizResult();
        result.setId(UUID.randomUUID().toString());
        result.setUserId(userId);
        result.setQuizId(quizId);
        result.setScore(score);
        result.setTotalQuestions(questions.size());
        result.setAnswers(answersJson);
        result.setSubmittedAt(new Timestamp(System.currentTimeMillis()));

        QuizResult saved = quizResultRepository.save(result);
        return ResponseEntity.ok(saved);
    }

    /**
     * GET /api/quiz-results/user/{userId}
     * Lấy tất cả kết quả quiz của một user.
     */
    @GetMapping("/user/{userId}")
    public List<QuizResult> getResultsByUser(@PathVariable String userId) {
        return quizResultRepository.findByUserId(userId);
    }

    /**
     * GET /api/quiz-results/user/{userId}/quiz/{quizId}
     * Lấy tất cả lần làm quiz của user với 1 quiz cụ thể (có thể làm nhiều lần).
     */
    @GetMapping("/user/{userId}/quiz/{quizId}")
    public List<QuizResult> getResultsByUserAndQuiz(
            @PathVariable String userId,
            @PathVariable String quizId) {
        return quizResultRepository.findByUserIdAndQuizId(userId, quizId);
    }

    /**
     * GET /api/quiz-results/user/{userId}/quiz/{quizId}/latest
     * Lấy lần làm gần nhất của user với 1 quiz.
     */
    @GetMapping("/user/{userId}/quiz/{quizId}/latest")
    public ResponseEntity<QuizResult> getLatestResult(
            @PathVariable String userId,
            @PathVariable String quizId) {
        return quizResultRepository
                .findTopByUserIdAndQuizIdOrderBySubmittedAtDesc(userId, quizId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
