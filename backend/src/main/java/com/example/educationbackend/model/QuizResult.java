package com.example.educationbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.sql.Timestamp;

@Data
@Entity
@Table(name = "quiz_results")
public class QuizResult {

    @Id
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "quiz_id", nullable = false)
    private String quizId;

    @Column(nullable = false)
    private Integer score;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    // Mảng đáp án user chọn, lưu dưới dạng JSON, vd: [0, 1, 3]
    @Column(columnDefinition = "JSON")
    private String answers;

    @Column(name = "submitted_at")
    private Timestamp submittedAt;
}
