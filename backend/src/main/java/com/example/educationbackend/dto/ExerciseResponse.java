package com.example.educationbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class ExerciseResponse {
    private String id;
    private String lessonId;
    private String title;
    private String description;
    private String type;
    private Integer timeLimit;
    private List<ExerciseQuestionResponse> questions;
}
