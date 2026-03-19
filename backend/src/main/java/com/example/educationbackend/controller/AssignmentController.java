package com.example.educationbackend.controller;

import com.example.educationbackend.model.Assignment;
import com.example.educationbackend.repository.AssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @GetMapping("/lesson/{lessonId}")
    public List<Assignment> getAssignmentsByLessonId(@PathVariable String lessonId) {
        return assignmentRepository.findByLessonId(lessonId);
    }
}
