package com.example.educationbackend.repository;

import com.example.educationbackend.model.ExerciseQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseQuestionRepository extends JpaRepository<ExerciseQuestion, String> {
    List<ExerciseQuestion> findByExerciseId(String exerciseId);
}
