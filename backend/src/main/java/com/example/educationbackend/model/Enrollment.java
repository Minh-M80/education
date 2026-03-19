package com.example.educationbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
@Entity
@Table(name = "enrollments")
public class Enrollment {
    @Id
    private String id;
    
    @Column(name = "user_id")
    private String userId;
    
    @Column(name = "course_id")
    private String courseId;
    
    private Timestamp enrolledAt;
    private BigDecimal progress;
    private String status;
    
    @Column(name = "completed_lessons", columnDefinition = "TEXT")
    private String completedLessons;
}
