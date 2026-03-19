package com.example.educationbackend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "exercises")
public class Exercise {
    @Id
    private String id;
    
    @Column(name = "lesson_id")
    private String lessonId;
    
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String type; // ENUM: coding, fill-blank, short-answer
    
    @Column(name = "time_limit_minutes")
    private Integer timeLimitMinutes;

    @Transient
    private List<ExerciseQuestion> questions;
}
