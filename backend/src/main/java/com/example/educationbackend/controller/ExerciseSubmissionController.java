package com.example.educationbackend.controller;

import com.example.educationbackend.exception.BadRequestException;
import com.example.educationbackend.exception.ResourceNotFoundException;
import com.example.educationbackend.model.Exercise;
import com.example.educationbackend.model.ExerciseSubmission;
import com.example.educationbackend.repository.ExerciseRepository;
import com.example.educationbackend.repository.ExerciseSubmissionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
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
@RequestMapping("/api/exercise-submissions")
public class ExerciseSubmissionController {

    @Autowired
    private ExerciseSubmissionRepository exerciseSubmissionRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping
    public ResponseEntity<?> submitExercise(@RequestBody Map<String, Object> request) {
        String userId = (String) request.get("userId");
        String exerciseId = (String) request.get("exerciseId");
        Object answersObj = request.get("answers");
        Object totalScoreObj = request.get("totalScore");
        Object maxScoreObj = request.get("maxScore");
        Object timeSpentObj = request.get("timeSpent");

        if (userId == null || exerciseId == null || answersObj == null || totalScoreObj == null || maxScoreObj == null) {
            throw new BadRequestException("Thiếu userId, exerciseId, answers, totalScore hoặc maxScore");
        }

        if (!(totalScoreObj instanceof Number) || !(maxScoreObj instanceof Number)) {
            throw new BadRequestException("totalScore và maxScore phải là số");
        }

        Optional<Exercise> exerciseOpt = exerciseRepository.findById(exerciseId);
        if (exerciseOpt.isEmpty()) {
            throw new ResourceNotFoundException("Exercise not found");
        }

        ExerciseSubmission submission = new ExerciseSubmission();
        submission.setId(UUID.randomUUID().toString());
        submission.setUserId(userId);
        submission.setExerciseId(exerciseId);
        submission.setTotalScore(((Number) totalScoreObj).intValue());
        submission.setMaxScore(((Number) maxScoreObj).intValue());
        submission.setTimeSpent(timeSpentObj instanceof Number ? ((Number) timeSpentObj).intValue() : 0);
        submission.setSubmittedAt(new Timestamp(System.currentTimeMillis()));

        try {
            submission.setAnswers(objectMapper.writeValueAsString(answersObj));
        } catch (Exception e) {
            submission.setAnswers("[]");
        }

        return ResponseEntity.ok(exerciseSubmissionRepository.save(submission));
    }

    @GetMapping("/user/{userId}")
    public List<ExerciseSubmission> getByUser(@PathVariable String userId) {
        return exerciseSubmissionRepository.findByUserId(userId);
    }

    @GetMapping("/user/{userId}/exercise/{exerciseId}")
    public List<ExerciseSubmission> getByUserAndExercise(
            @PathVariable String userId,
            @PathVariable String exerciseId) {
        return exerciseSubmissionRepository.findByUserIdAndExerciseId(userId, exerciseId);
    }

    @GetMapping("/user/{userId}/exercise/{exerciseId}/latest")
    public ResponseEntity<ExerciseSubmission> getLatestByUserAndExercise(
            @PathVariable String userId,
            @PathVariable String exerciseId) {
        return exerciseSubmissionRepository
                .findTopByUserIdAndExerciseIdOrderBySubmittedAtDesc(userId, exerciseId)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise submission not found"));
    }
}
