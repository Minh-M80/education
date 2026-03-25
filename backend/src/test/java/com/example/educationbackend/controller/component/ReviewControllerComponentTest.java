package com.example.educationbackend.controller.component;

import com.example.educationbackend.controller.ReviewController;
import com.example.educationbackend.exception.GlobalExceptionHandler;
import com.example.educationbackend.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Component test + unit test:
 * - Kiem tra validate rating va update review.
 */
@ExtendWith(MockitoExtension.class)
class ReviewControllerComponentTest {

    @Mock private ReviewRepository reviewRepository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        ReviewController controller = new ReviewController();
        ReflectionTestUtils.setField(controller, "reviewRepository", reviewRepository);

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("component/unit: create review fail khi rating ngoai khoang 1 den 5")
    void createReviewShouldRejectInvalidRating() throws Exception {
        mockMvc.perform(post("/api/reviews")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": "u1",
                                  "courseId": "c1",
                                  "rating": 6,
                                  "comment": "Too high"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Rating phải từ 1 đến 5"));
    }

    @Test
    @DisplayName("component/unit: update review fail khi review khong ton tai")
    void updateReviewShouldReturnNotFound() throws Exception {
        when(reviewRepository.findById("r1")).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/reviews/r1")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "rating": 5,
                                  "comment": "Updated"
                                }
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Review not found"));
    }
}
