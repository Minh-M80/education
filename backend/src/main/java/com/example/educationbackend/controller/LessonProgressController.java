package com.example.educationbackend.controller;

import com.example.educationbackend.exception.BadRequestException;
import com.example.educationbackend.exception.ResourceNotFoundException;
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

    @PostMapping
    public ResponseEntity<?> markLessonWatched(@RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        String lessonId = request.get("lessonId");
        String courseId = request.get("courseId");

        if (userId == null || lessonId == null || courseId == null) {
            throw new BadRequestException("Thiếu userId, lessonId hoặc courseId");
        }

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

    @GetMapping("/user/{userId}/course/{courseId}")
    public List<LessonProgress> getProgressByCourse(
            @PathVariable String userId,
            @PathVariable String courseId) {
        return lessonProgressRepository.findByUserIdAndCourseId(userId, courseId);
    }

    @GetMapping("/user/{userId}/lesson/{lessonId}")
    public ResponseEntity<LessonProgress> checkLessonProgress(
            @PathVariable String userId,
            @PathVariable String lessonId) {
        return lessonProgressRepository.findByUserIdAndLessonId(userId, lessonId)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson progress not found"));
    }
}
