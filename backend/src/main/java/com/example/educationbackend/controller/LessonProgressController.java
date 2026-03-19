package com.example.educationbackend.controller;

import com.example.educationbackend.model.LessonProgress;
import com.example.educationbackend.repository.LessonProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/lesson-progress")
public class LessonProgressController {

    @Autowired
    private LessonProgressRepository lessonProgressRepository;

    /**
     * POST /api/lesson-progress
     * Đánh dấu user đã xem/hoàn thành một bài học. Nếu đã xem rồi thì không ghi thêm.
     * Body: { "userId": "u1", "lessonId": "l1", "courseId": "1" }
     */
    @PostMapping
    public ResponseEntity<?> markLessonWatched(@RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        String lessonId = request.get("lessonId");
        String courseId = request.get("courseId");

        if (userId == null || lessonId == null || courseId == null) {
            return ResponseEntity.badRequest().body("Thiếu userId, lessonId hoặc courseId");
        }

        // Kiểm tra đã xem chưa (tránh trùng lặp)
        if (lessonProgressRepository.findByUserIdAndLessonId(userId, lessonId).isPresent()) {
            return ResponseEntity.ok(Map.of("message", "Bài học đã được đánh dấu trước đó"));
        }

        LessonProgress progress = new LessonProgress();
        progress.setId(UUID.randomUUID().toString());
        progress.setUserId(userId);
        progress.setLessonId(lessonId);
        progress.setCourseId(courseId);
        progress.setWatchedAt(new Timestamp(System.currentTimeMillis()));

        LessonProgress saved = lessonProgressRepository.save(progress);
        return ResponseEntity.ok(saved);
    }

    /**
     * GET /api/lesson-progress/user/{userId}/course/{courseId}
     * Lấy danh sách các bài học user đã xem trong một khóa học.
     */
    @GetMapping("/user/{userId}/course/{courseId}")
    public List<LessonProgress> getProgressByCourse(
            @PathVariable String userId,
            @PathVariable String courseId) {
        return lessonProgressRepository.findByUserIdAndCourseId(userId, courseId);
    }

    /**
     * GET /api/lesson-progress/user/{userId}/lesson/{lessonId}
     * Kiểm tra xem user đã xem bài học này chưa.
     */
    @GetMapping("/user/{userId}/lesson/{lessonId}")
    public ResponseEntity<LessonProgress> checkLessonProgress(
            @PathVariable String userId,
            @PathVariable String lessonId) {
        return lessonProgressRepository.findByUserIdAndLessonId(userId, lessonId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
