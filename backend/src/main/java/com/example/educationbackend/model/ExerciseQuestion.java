package com.example.educationbackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "exercise_questions")
public class ExerciseQuestion {
    @Id
    private String id;

    @Column(name = "exercise_id")
    private String exerciseId;

    @Column(columnDefinition = "TEXT")
    private String question;

    private String type;

    @Column(columnDefinition = "TEXT")
    private String placeholder;

    @Column(name = "expected_answer", columnDefinition = "TEXT")
    private String expectedAnswer;

    @Column(columnDefinition = "JSON")
    private String hints;

    private Integer points;
}
