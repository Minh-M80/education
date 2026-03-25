package com.example.educationbackend.controller;

import com.example.educationbackend.exception.BadRequestException;
import com.example.educationbackend.exception.ResourceNotFoundException;
import com.example.educationbackend.model.Enrollment;
import com.example.educationbackend.repository.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @GetMapping("/user/{userId}")
    public List<Enrollment> getUserEnrollments(@PathVariable String userId) {
        return enrollmentRepository.findByUserId(userId);
    }

    @PostMapping
    public ResponseEntity<?> enrollUser(@RequestBody Enrollment request) {
        // Simple check
        if (enrollmentRepository.findByUserIdAndCourseId(request.getUserId(), request.getCourseId()).isPresent()) {
            throw new BadRequestException("User is already enrolled in this course");
        }

        request.setId(UUID.randomUUID().toString());
        request.setEnrolledAt(new Timestamp(System.currentTimeMillis()));
        request.setProgress(BigDecimal.ZERO);
        request.setStatus("active");
        request.setCompletedLessons("[]");
        
        Enrollment saved = enrollmentRepository.save(request);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/progress")
    public ResponseEntity<?> updateProgress(@RequestBody Map<String, Object> request) {
        String userId = (String) request.get("userId");
        String courseId = (String) request.get("courseId");
        
        Optional<Enrollment> enrollmentOpt = enrollmentRepository.findByUserIdAndCourseId(userId, courseId);
        if (enrollmentOpt.isEmpty()) {
            throw new ResourceNotFoundException("Enrollment not found");
        }

        Enrollment enrollment = enrollmentOpt.get();
        if (request.containsKey("progress")) {
            Object progObj = request.get("progress");
            if (progObj instanceof Number) {
                enrollment.setProgress(new BigDecimal(progObj.toString()));
            }
        }
        
        if (request.containsKey("completedLessons")) {
            Object clObj = request.get("completedLessons");
            if (clObj instanceof List) { // Frontend array
                try {
                    // Quick and dirty JSON stringify
                    String json = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(clObj);
                    enrollment.setCompletedLessons(json);
                } catch (Exception e) {
                    enrollment.setCompletedLessons(clObj.toString());
                }
            } else {
                enrollment.setCompletedLessons(clObj.toString());
            }
        }
        
        if (request.containsKey("status")) {
            enrollment.setStatus((String) request.get("status"));
        }

        return ResponseEntity.ok(enrollmentRepository.save(enrollment));
    }
}
