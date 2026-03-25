package com.example.educationbackend.controller.integration;

import com.example.educationbackend.support.IntegrationTestSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration test:
 * - Phu EnrollmentController va LessonProgressController.
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class ProgressAndEnrollmentIntegrationTest extends IntegrationTestSupport {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void enrollmentEndpointsShouldCreateReadUpdateAndRejectDuplicate() throws Exception {
        saveCourse("c1", "Java Basics");
        saveEnrollment("e1", "u1", "c1");

        mockMvc.perform(get("/api/enrollments/user/u1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("e1"));

        mockMvc.perform(post("/api/enrollments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": "u1",
                                  "courseId": "c1"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("User is already enrolled in this course"));

        mockMvc.perform(post("/api/enrollments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": "u2",
                                  "courseId": "c1"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("active"))
                .andExpect(jsonPath("$.progress").value(0))
                .andExpect(jsonPath("$.completedLessons").value("[]"));

        mockMvc.perform(put("/api/enrollments/progress")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": "u1",
                                  "courseId": "c1",
                                  "progress": 65,
                                  "completedLessons": ["l1"],
                                  "status": "in-progress"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.progress").value(65))
                .andExpect(jsonPath("$.status").value("in-progress"))
                .andExpect(jsonPath("$.completedLessons").value("[\"l1\"]"));
    }

    @Test
    void updateProgressShouldReturnNotFoundForMissingEnrollment() throws Exception {
        mockMvc.perform(put("/api/enrollments/progress")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": "missing",
                                  "courseId": "c1",
                                  "progress": 10
                                }
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Enrollment not found"));
    }

    @Test
    void lessonProgressEndpointsShouldCreateReadDuplicateAndNotFound() throws Exception {
        saveLessonProgress("lp1", "u1", "l1", "c1");

        mockMvc.perform(post("/api/lesson-progress")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": "u1",
                                  "lessonId": "l1",
                                  "courseId": "c1"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Bài học đã được đánh dấu trước đó"));

        mockMvc.perform(post("/api/lesson-progress")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": "u2",
                                  "lessonId": "l2",
                                  "courseId": "c1"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lessonId").value("l2"));

        mockMvc.perform(get("/api/lesson-progress/user/u1/course/c1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("lp1"));

        mockMvc.perform(get("/api/lesson-progress/user/u1/lesson/l1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.courseId").value("c1"));

        mockMvc.perform(get("/api/lesson-progress/user/u9/lesson/l9"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Lesson progress not found"));
    }
}
