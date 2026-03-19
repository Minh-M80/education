package com.example.educationbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "courses")
public class Course {
    @Id
    private String id;
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String instructor;
    private String thumbnail;
    private BigDecimal price;
    private String duration;
    private String level;
    private String category;
    private BigDecimal rating;
    private Integer totalStudents;
    private Integer totalLessons;
}
