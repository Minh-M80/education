package com.example.educationbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.sql.Timestamp;

@Data
@Entity
@Table(name = "lesson_progress")
public class LessonProgress {

    @Id
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "lesson_id", nullable = false)
    private String lessonId;

    @Column(name = "course_id", nullable = false)
    private String courseId;

    @Column(name = "watched_at")
    private Timestamp watchedAt;
}
