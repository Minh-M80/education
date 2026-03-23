package com.example.educationbackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.sql.Timestamp;

@Data
@Entity
@Table(name = "exercise_submissions")
public class ExerciseSubmission {

    @Id
    private String id;

    @Column(name = "exercise_id", nullable = false)
    private String exerciseId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(columnDefinition = "JSON")
    private String answers;

    @Column(name = "total_score", nullable = false)
    private Integer totalScore;

    @Column(name = "max_score", nullable = false)
    private Integer maxScore;

    @Column(name = "submitted_at", nullable = false)
    private Timestamp submittedAt;

    @Column(name = "time_spent")
    private Integer timeSpent;
}
