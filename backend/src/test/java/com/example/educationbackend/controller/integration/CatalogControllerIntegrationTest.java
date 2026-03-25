package com.example.educationbackend.controller.integration;

import com.example.educationbackend.support.IntegrationTestSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration test:
 * - Phu cac endpoint GET cua Course, Lesson, Assignment, Exercise, Quiz.
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class CatalogControllerIntegrationTest extends IntegrationTestSupport {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void courseEndpointsShouldReturnDataAndHandleNotFound() throws Exception {
        saveCourse("c1", "Java Basics");
        saveCourse("c2", "Spring Boot");

        mockMvc.perform(get("/api/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        mockMvc.perform(get("/api/courses/c1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Java Basics"));

        mockMvc.perform(get("/api/courses/missing"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Course not found"));
    }

    @Test
    void lessonEndpointsShouldReturnOrderedLessonsAndNotFound() throws Exception {
        saveCourse("c1", "Java Basics");
        saveLesson("l2", "c1", "Second Lesson", 2);
        saveLesson("l1", "c1", "First Lesson", 1);

        mockMvc.perform(get("/api/lessons/course/c1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("l1"))
                .andExpect(jsonPath("$[1].id").value("l2"));

        mockMvc.perform(get("/api/lessons/l1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("First Lesson"));

        mockMvc.perform(get("/api/lessons/missing"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Lesson not found"));
    }

    @Test
    void assignmentEndpointsShouldReturnAssignmentsByLesson() throws Exception {
        saveCourse("c1", "Java Basics");
        saveLesson("l1", "c1", "Lesson One", 1);
        saveAssignment("a1", "l1", "Homework 1");

        mockMvc.perform(get("/api/assignments/lesson/l1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("a1"))
                .andExpect(jsonPath("$[0].title").value("Homework 1"));
    }

    @Test
    void exerciseEndpointsShouldMapQuestionsAndHints() throws Exception {
        saveCourse("c1", "Java Basics");
        saveLesson("l1", "c1", "Lesson One", 1);
        saveExercise("ex1", "l1", "Exercise 1");
        saveExerciseQuestion("eq1", "ex1", "Question 1", "hint 1");

        mockMvc.perform(get("/api/exercises/lesson/l1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("ex1"))
                .andExpect(jsonPath("$[0].questions[0].hints[0]").value(containsString("hint 1")));

        mockMvc.perform(get("/api/exercises/ex1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questions[0].question").value("Question 1"));

        mockMvc.perform(get("/api/exercises/missing"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Exercise not found"));
    }

    @Test
    void quizEndpointsShouldReturnQuizWithQuestions() throws Exception {
        saveCourse("c1", "Java Basics");
        saveLesson("l1", "c1", "Lesson One", 1);
        saveQuiz("q1", "l1", "Quiz 1");
        saveQuizQuestion("qq1", "q1", "What is Java?", 1);

        mockMvc.perform(get("/api/quizzes/lesson/l1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("q1"))
                .andExpect(jsonPath("$[0].questions[0].id").value("qq1"));

        mockMvc.perform(get("/api/quizzes/q1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questions[0].question").value("What is Java?"));

        mockMvc.perform(get("/api/quizzes/missing"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Quiz not found"));
    }
}
