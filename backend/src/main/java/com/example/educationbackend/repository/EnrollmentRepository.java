package com.example.educationbackend.repository;

import com.example.educationbackend.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, String> {
    List<Enrollment> findByUserId(String userId);
    Optional<Enrollment> findByUserIdAndCourseId(String userId, String courseId);
}
