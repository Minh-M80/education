package com.example.educationbackend.controller;

import com.example.educationbackend.model.Lesson;
import com.example.educationbackend.repository.LessonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/lessons")
public class LessonController {

    @Autowired
    private LessonRepository lessonRepository;

    /**
     * GET /api/lessons/course/{courseId}
     * Lấy danh sách tất cả bài học của một khóa học, sắp xếp theo thứ tự.
     * Mỗi bài có video_url và video_type để frontend render đúng loại player.
     */
    @GetMapping("/course/{courseId}")
    public List<Lesson> getLessonsByCourseId(@PathVariable String courseId) {
        return lessonRepository.findByCourseIdOrderByLessonOrderAsc(courseId);
    }

    /**
     * GET /api/lessons/{lessonId}
     * Lấy chi tiết một bài học cụ thể, bao gồm video_url và video_type.
     * Frontend dùng video_type để quyết định render <iframe> (youtube) hay <video> (upload).
     */
    @GetMapping("/{lessonId}")
    public ResponseEntity<Lesson> getLessonById(@PathVariable String lessonId) {
        return lessonRepository.findById(lessonId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
