package com.example.educationbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.sql.Timestamp;

@Data
@Entity
@Table(name = "assignments")
public class Assignment {
    @Id
    private String id;
    
    @Column(name = "lesson_id")
    private String lessonId;
    
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "due_date")
    private Timestamp dueDate;
    
    @Column(name = "max_file_size_mb")
    private Integer maxFileSizeMb;
    
    @Column(name = "allowed_formats")
    private String allowedFormats;
    
    @Column(name = "max_score")
    private Integer maxScore;
}
