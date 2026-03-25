package com.example.educationbackend.controller.component;

import com.example.educationbackend.controller.EnrollmentController;
import com.example.educationbackend.exception.GlobalExceptionHandler;
import com.example.educationbackend.model.Enrollment;
import com.example.educationbackend.repository.EnrollmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Component test + unit test:
 * - Kiem tra validate va data transformation cua EnrollmentController.
 */
@ExtendWith(MockitoExtension.class)
class EnrollmentControllerComponentTest {

    @Mock private EnrollmentRepository enrollmentRepository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        EnrollmentController controller = new EnrollmentController();
        ReflectionTestUtils.setField(controller, "enrollmentRepository", enrollmentRepository);

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("component/unit: enroll fail khi user da dang ky khoa hoc")
    void enrollShouldRejectDuplicateEnrollment() throws Exception {
        when(enrollmentRepository.findByUserIdAndCourseId("u1", "c1")).thenReturn(Optional.of(new Enrollment()));

        mockMvc.perform(post("/api/enrollments")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": "u1",
                                  "courseId": "c1"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("User is already enrolled in this course"));
    }

    @Test
    @DisplayName("component/unit: update progress serialize completedLessons va save")
    void updateProgressShouldSerializeCompletedLessons() throws Exception {
        Enrollment enrollment = new Enrollment();
        enrollment.setId("e1");
        enrollment.setUserId("u1");
        enrollment.setCourseId("c1");
        enrollment.setProgress(BigDecimal.ZERO);
        enrollment.setCompletedLessons("[]");
        enrollment.setStatus("active");

        when(enrollmentRepository.findByUserIdAndCourseId("u1", "c1")).thenReturn(Optional.of(enrollment));
        when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(put("/api/enrollments/progress")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": "u1",
                                  "courseId": "c1",
                                  "progress": 75,
                                  "completedLessons": ["l1", "l2"],
                                  "status": "completed"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("completed"))
                .andExpect(jsonPath("$.progress").value(75));

        ArgumentCaptor<Enrollment> captor = ArgumentCaptor.forClass(Enrollment.class);
        verify(enrollmentRepository).save(captor.capture());
        assertThat(captor.getValue().getCompletedLessons()).isEqualTo("[\"l1\",\"l2\"]");
    }
}
