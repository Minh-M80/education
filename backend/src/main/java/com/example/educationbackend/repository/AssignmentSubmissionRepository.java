package com.example.educationbackend.repository;

import com.example.educationbackend.model.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, String> {
    List<AssignmentSubmission> findByUserId(String userId);
    List<AssignmentSubmission> findByUserIdAndAssignmentId(String userId, String assignmentId);
    Optional<AssignmentSubmission> findTopByUserIdAndAssignmentIdOrderBySubmittedAtDesc(String userId, String assignmentId);
}
