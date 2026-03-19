package com.example.educationbackend.repository;

import com.example.educationbackend.model.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, String> {

    List<LessonProgress> findByUserIdAndCourseId(String userId, String courseId);

    Optional<LessonProgress> findByUserIdAndLessonId(String userId, String lessonId);
}
