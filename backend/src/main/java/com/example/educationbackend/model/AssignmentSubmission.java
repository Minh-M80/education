package com.example.educationbackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.sql.Timestamp;

@Data
@Entity
@Table(name = "assignment_submissions")
public class AssignmentSubmission {

    @Id
    private String id;

    @Column(name = "assignment_id", nullable = false)
    private String assignmentId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "submitted_at", nullable = false)
    private Timestamp submittedAt;

    private Integer grade;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    private String status;
}
