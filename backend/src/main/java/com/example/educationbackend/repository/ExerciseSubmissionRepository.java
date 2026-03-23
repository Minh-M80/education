package com.example.educationbackend.repository;

import com.example.educationbackend.model.ExerciseSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExerciseSubmissionRepository extends JpaRepository<ExerciseSubmission, String> {
    List<ExerciseSubmission> findByUserId(String userId);
    List<ExerciseSubmission> findByUserIdAndExerciseId(String userId, String exerciseId);
    Optional<ExerciseSubmission> findTopByUserIdAndExerciseIdOrderBySubmittedAtDesc(String userId, String exerciseId);
}
