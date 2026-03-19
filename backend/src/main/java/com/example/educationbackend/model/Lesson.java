package com.example.educationbackend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "lessons")
public class Lesson {
    @Id
    private String id;

    @Column(name = "course_id")
    private String courseId;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String duration;

    @Column(name = "video_url", length = 500)
    private String videoUrl;

    /**
     * Loại video: "youtube" hoặc "upload"
     * - youtube: video_url là YouTube embed URL (https://www.youtube.com/embed/xxx)
     *            Frontend render bằng <iframe>
     * - upload:  video_url là đường dẫn file local (/videos/filename.mp4)
     *            Frontend render bằng <video> tag
     */
    @Column(name = "video_type")
    private String videoType;

    @Column(name = "lesson_order")
    private Integer lessonOrder;
}
