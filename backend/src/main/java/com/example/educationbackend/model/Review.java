package com.example.educationbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.sql.Timestamp;

@Data
@Entity
@Table(name = "reviews")
public class Review {
    @Id
    private String id;
    
    @Column(name = "user_id")
    private String userId;
    
    @Column(name = "course_id")
    private String courseId;
    
    private Integer rating;
    
    @Column(columnDefinition = "TEXT")
    private String comment;
    
    @Column(name = "created_at")
    private Timestamp createdAt;
    
    @Column(name = "user_name")
    private String userName;
}
