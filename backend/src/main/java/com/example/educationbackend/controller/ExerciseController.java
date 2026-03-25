package com.example.educationbackend.controller;

import com.example.educationbackend.dto.ExerciseQuestionResponse;
import com.example.educationbackend.dto.ExerciseResponse;
import com.example.educationbackend.exception.ResourceNotFoundException;
import com.example.educationbackend.model.Exercise;
import com.example.educationbackend.model.ExerciseQuestion;
import com.example.educationbackend.repository.ExerciseQuestionRepository;
import com.example.educationbackend.repository.ExerciseRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private ExerciseQuestionRepository exerciseQuestionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping("/lesson/{lessonId}")
    public List<ExerciseResponse> getExercisesByLessonId(@PathVariable String lessonId) {
        return exerciseRepository.findByLessonId(lessonId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{exerciseId}")
    public ResponseEntity<ExerciseResponse> getExerciseById(@PathVariable String exerciseId) {
        Optional<Exercise> exerciseOpt = exerciseRepository.findById(exerciseId);
        return exerciseOpt.map(exercise -> ResponseEntity.ok(toResponse(exercise)))
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));
    }

    private ExerciseResponse toResponse(Exercise exercise) {
        List<ExerciseQuestionResponse> questions = exerciseQuestionRepository.findByExerciseId(exercise.getId())
                .stream()
                .map(this::toQuestionResponse)
                .collect(Collectors.toList());

        return new ExerciseResponse(
                exercise.getId(),
                exercise.getLessonId(),
                exercise.getTitle(),
                exercise.getDescription(),
                exercise.getType(),
                exercise.getTimeLimitMinutes(),
                questions
        );
    }

    private ExerciseQuestionResponse toQuestionResponse(ExerciseQuestion question) {
        return new ExerciseQuestionResponse(
                question.getId(),
                question.getQuestion(),
                question.getType(),
                question.getPlaceholder(),
                question.getExpectedAnswer(),
                parseHints(question.getHints()),
                question.getPoints()
        );
    }

    private List<String> parseHints(String hintsJson) {
        if (hintsJson == null || hintsJson.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(hintsJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.singletonList(hintsJson);
        }
    }
}
