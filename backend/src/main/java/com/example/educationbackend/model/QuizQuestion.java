package com.example.educationbackend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "quiz_questions")
public class QuizQuestion {
    @Id
    private String id;
    
    @Column(name = "quiz_id")
    private String quizId;
    
    @Column(columnDefinition = "TEXT")
    private String question;
    
    @Column(columnDefinition = "JSON")
    private String options; // Stored as JSON string
    
    @Column(name = "correct_answer")
    private Integer correctAnswer;
}
