package com.example.educationbackend.controller.integration;

import com.example.educationbackend.support.IntegrationTestSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration test:
 * - Phu ExerciseSubmission, AssignmentSubmission, QuizResult, Review.
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class SubmissionAndReviewIntegrationTest extends IntegrationTestSupport {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void exerciseSubmissionEndpointsShouldSubmitAndQuery() throws Exception {
        saveExercise("ex1", "l1", "Exercise 1");
        saveExerciseSubmission("es1", "u1", "ex1");

        mockMvc.perform(post("/api/exercise-submissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": "u2",
                                  "exerciseId": "ex1",
                                  "answers": ["ans1"],
                                  "totalScore": 9,
                                  "maxScore": 10,
                                  "timeSpent": 100
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exerciseId").value("ex1"))
                .andExpect(jsonPath("$.answers").value("[\"ans1\"]"));

        mockMvc.perform(post("/api/exercise-submissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": "u2",
                                  "exerciseId": "missing",
                                  "answers": ["ans1"],
                                  "totalScore": 9,
                                  "maxScore": 10
                                }
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Exercise not found"));

        mockMvc.perform(get("/api/exercise-submissions/user/u1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("es1"));

        mockMvc.perform(get("/api/exercise-submissions/user/u1/exercise/ex1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("es1"));

        mockMvc.perform(get("/api/exercise-submissions/user/u1/exercise/ex1/latest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("es1"));
    }

    @Test
    void assignmentSubmissionEndpointsShouldSubmitAndQuery() throws Exception {
        saveAssignment("a1", "l1", "Homework 1");
        saveAssignmentSubmission("as1", "u1", "a1", "old.pdf");

        mockMvc.perform(post("/api/assignment-submissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": "u2",
                                  "assignmentId": "a1",
                                  "fileName": "solution.pdf",
                                  "fileSize": 2048
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("graded"))
                .andExpect(jsonPath("$.grade").isNumber());

        mockMvc.perform(post("/api/assignment-submissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": "u2",
                                  "assignmentId": "missing",
                                  "fileName": "solution.pdf",
                                  "fileSize": 2048
                                }
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Assignment not found"));

        mockMvc.perform(get("/api/assignment-submissions/user/u1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("as1"));

        mockMvc.perform(get("/api/assignment-submissions/user/u1/assignment/a1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("as1"));

        mockMvc.perform(get("/api/assignment-submissions/user/u1/assignment/a1/latest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("as1"));
    }

    @Test
    void quizResultEndpointsShouldSubmitAndQuery() throws Exception {
        saveQuiz("q1", "l1", "Quiz 1");
        saveQuizQuestion("qq1", "q1", "Question 1", 1);
        saveQuizQuestion("qq2", "q1", "Question 2", 2);
        saveQuizResult("qr1", "u1", "q1", 2, 2);

        mockMvc.perform(post("/api/quiz-results")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": "u2",
                                  "quizId": "q1",
                                  "answers": [1, 0]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").value(1))
                .andExpect(jsonPath("$.totalQuestions").value(2));

        mockMvc.perform(post("/api/quiz-results")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": "u2",
                                  "quizId": "missing",
                                  "answers": [1]
                                }
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Quiz questions not found"));

        mockMvc.perform(get("/api/quiz-results/user/u1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("qr1"));

        mockMvc.perform(get("/api/quiz-results/user/u1/quiz/q1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("qr1"));

        mockMvc.perform(get("/api/quiz-results/user/u1/quiz/q1/latest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("qr1"));
    }

    @Test
    void reviewEndpointsShouldCreateUpdateDeleteAndQuery() throws Exception {
        saveReview("r1", "u1", "c1", 4, "Good course");

        mockMvc.perform(get("/api/reviews/course/c1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("r1"));

        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": "u2",
                                  "courseId": "c1",
                                  "rating": 5,
                                  "comment": "Excellent"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(5));

        mockMvc.perform(put("/api/reviews/r1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "rating": 3,
                                  "comment": "Updated comment"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(3))
                .andExpect(jsonPath("$.comment").value("Updated comment"));

        mockMvc.perform(delete("/api/reviews/r1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        assertThat(reviewRepository.findById("r1")).isEmpty();
    }
}
