package com.example.educationbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class ExerciseQuestionResponse {
    private String id;
    private String question;
    private String type;
    private String placeholder;
    private String expectedAnswer;
    private List<String> hints;
    private Integer points;
}
