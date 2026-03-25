package com.example.educationbackend.integration;

import com.example.educationbackend.model.Course;
import com.example.educationbackend.repository.CourseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CourseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CourseRepository courseRepository;

    @BeforeEach
    void setUp() {
        courseRepository.deleteAll();

        Course course = new Course();
        course.setId("course-int-1");
        course.setTitle("Integration Testing");
        course.setInstructor("Teacher A");
        course.setPrice(BigDecimal.valueOf(299000));
        courseRepository.save(course);
    }

    @Test
    void getCourseById_returnsCourseStoredInDatabase() throws Exception {
        mockMvc.perform(get("/api/courses/course-int-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("course-int-1"))
                .andExpect(jsonPath("$.title").value("Integration Testing"))
                .andExpect(jsonPath("$.instructor").value("Teacher A"));
    }
}
