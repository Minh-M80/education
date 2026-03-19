package com.example.educationbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "quizzes")
public class Quiz {
    @Id
    private String id;
    
    @Column(name = "lesson_id")
    private String lessonId;
    
    private String title;
    
    @Column(name = "duration_minutes")
    private Integer durationMinutes;
    
    @Transient // We will populate this manually in the controller or use @OneToMany mapping
    private List<QuizQuestion> questions;
}
