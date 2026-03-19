package com.example.educationbackend.repository;

import com.example.educationbackend.model.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizResultRepository extends JpaRepository<QuizResult, String> {

    List<QuizResult> findByUserId(String userId);

    List<QuizResult> findByUserIdAndQuizId(String userId, String quizId);

    Optional<QuizResult> findTopByUserIdAndQuizIdOrderBySubmittedAtDesc(String userId, String quizId);
}
