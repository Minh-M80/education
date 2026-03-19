package com.example.educationbackend.repository;

import com.example.educationbackend.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, String> {
    List<Exercise> findByLessonId(String lessonId);
}
