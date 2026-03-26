package com.example.educationbackend.controller;

import com.example.educationbackend.dto.JwtResponse;
import com.example.educationbackend.dto.LoginRequest;
import com.example.educationbackend.model.Course;
import com.example.educationbackend.model.User;
import com.example.educationbackend.repository.CourseRepository;
import com.example.educationbackend.repository.UserRepository;
import com.example.educationbackend.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.mockito.ArgumentCaptor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthAndCourseUnitTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private CourseRepository courseRepository;

    @InjectMocks
    private AuthController authController;

    @InjectMocks
    private CourseController courseController;

    private User existingUser;

    @BeforeEach
    void setUp() {
        existingUser = new User();
        existingUser.setId("user-1");
        existingUser.setEmail("student@example.com");
        existingUser.setFullName("Student One");
        existingUser.setPassword("Secret@1");
    }

    @Test
    void authenticateUser_returnsJwtResponse_whenCredentialsValid() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("student@example.com");
        loginRequest.setPassword("Secret@1");

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                "student@example.com",
                "Secret@1",
                List.of()
        );

        when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.of(existingUser));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("test-jwt");

        ResponseEntity<?> response = authController.authenticateUser(loginRequest);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isInstanceOf(JwtResponse.class);

        JwtResponse jwtResponse = (JwtResponse) response.getBody();
        assertThat(jwtResponse.getToken()).isEqualTo("test-jwt");
        assertThat(jwtResponse.getEmail()).isEqualTo("student@example.com");
        assertThat(jwtResponse.getFullName()).isEqualTo("Student One");
    }

    @Test
    void registerUser_savesUser_whenRequestValid() {
        User newUser = new User();
        newUser.setEmail("newuser@example.com");
        newUser.setPassword("Secret@1");
        newUser.setFullName("New User");

        when(userRepository.findByEmailIgnoreCase("newuser@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("Secret@1")).thenReturn("encoded-secret");

        ResponseEntity<?> response = authController.registerUser(newUser);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isEqualTo("User registered successfully!");

        ArgumentCaptor<User> savedUserCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(savedUserCaptor.capture());
        verify(passwordEncoder).encode(eq("Secret@1"));
        assertThat(savedUserCaptor.getValue().getPassword()).isEqualTo("encoded-secret");
        assertThat(savedUserCaptor.getValue().getPassword()).isNotEqualTo("Secret@1");
    }

    @Test
    void getAllCourses_returnsCoursesFromRepository() {
        Course course = new Course();
        course.setId("course-1");
        course.setTitle("Spring Boot Basics");
        course.setPrice(BigDecimal.valueOf(199_000));

        when(courseRepository.findAll()).thenReturn(List.of(course));

        List<Course> courses = courseController.getAllCourses();

        assertThat(courses).hasSize(1);
        assertThat(courses.get(0).getTitle()).isEqualTo("Spring Boot Basics");
    }
}
