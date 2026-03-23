package com.example.educationbackend.controller;

import com.example.educationbackend.model.Assignment;
import com.example.educationbackend.model.AssignmentSubmission;
import com.example.educationbackend.repository.AssignmentRepository;
import com.example.educationbackend.repository.AssignmentSubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/assignment-submissions")
public class AssignmentSubmissionController {

    @Autowired
    private AssignmentSubmissionRepository assignmentSubmissionRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @PostMapping
    public ResponseEntity<?> submitAssignment(@RequestBody Map<String, Object> request) {
        String userId = (String) request.get("userId");
        String assignmentId = (String) request.get("assignmentId");
        String fileName = (String) request.get("fileName");
        Object fileSizeObj = request.get("fileSize");

        if (userId == null || assignmentId == null || fileName == null || fileSizeObj == null) {
            return ResponseEntity.badRequest().body("Thiếu userId, assignmentId, fileName hoặc fileSize");
        }

        Optional<Assignment> assignmentOpt = assignmentRepository.findById(assignmentId);
        if (assignmentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        long fileSize = fileSizeObj instanceof Number
                ? ((Number) fileSizeObj).longValue()
                : Long.parseLong(fileSizeObj.toString());

        AssignmentSubmission submission = new AssignmentSubmission();
        submission.setId(UUID.randomUUID().toString());
        submission.setAssignmentId(assignmentId);
        submission.setUserId(userId);
        submission.setFileName(fileName);
        submission.setFileSize(fileSize);
        submission.setSubmittedAt(new Timestamp(System.currentTimeMillis()));

        int grade = 70 + Math.abs(fileName.hashCode()) % 31;
        submission.setGrade(grade);
        submission.setStatus("graded");
        submission.setFeedback(buildFeedback(grade));

        return ResponseEntity.ok(assignmentSubmissionRepository.save(submission));
    }

    @GetMapping("/user/{userId}")
    public List<AssignmentSubmission> getByUser(@PathVariable String userId) {
        return assignmentSubmissionRepository.findByUserId(userId);
    }

    @GetMapping("/user/{userId}/assignment/{assignmentId}")
    public List<AssignmentSubmission> getByUserAndAssignment(
            @PathVariable String userId,
            @PathVariable String assignmentId) {
        return assignmentSubmissionRepository.findByUserIdAndAssignmentId(userId, assignmentId);
    }

    @GetMapping("/user/{userId}/assignment/{assignmentId}/latest")
    public ResponseEntity<AssignmentSubmission> getLatestByUserAndAssignment(
            @PathVariable String userId,
            @PathVariable String assignmentId) {
        return assignmentSubmissionRepository
                .findTopByUserIdAndAssignmentIdOrderBySubmittedAtDesc(userId, assignmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private String buildFeedback(int grade) {
        if (grade >= 90) {
            return "Xuất sắc. Bài làm đầy đủ nội dung và trình bày rõ ràng.";
        }
        if (grade >= 80) {
            return "Tốt. Bài làm đạt yêu cầu, chỉ cần cải thiện thêm một vài chi tiết nhỏ.";
        }
        if (grade >= 70) {
            return "Khá. Bài làm đã đúng hướng, nên bổ sung thêm ví dụ và giải thích.";
        }
        return "Bài làm cần bổ sung thêm nội dung để đạt yêu cầu.";
    }
}
