package com.example.educationbackend.controller.component;

import com.example.educationbackend.controller.ExerciseSubmissionController;
import com.example.educationbackend.controller.QuizResultController;
import com.example.educationbackend.exception.GlobalExceptionHandler;
import com.example.educationbackend.model.Exercise;
import com.example.educationbackend.model.ExerciseSubmission;
import com.example.educationbackend.model.QuizQuestion;
import com.example.educationbackend.model.QuizResult;
import com.example.educationbackend.repository.ExerciseRepository;
import com.example.educationbackend.repository.ExerciseSubmissionRepository;
import com.example.educationbackend.repository.QuizQuestionRepository;
import com.example.educationbackend.repository.QuizResultRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Component test + unit test:
 * - Gom cac controller co logic cham diem/serialize JSON.
 */
@ExtendWith(MockitoExtension.class)
class AssessmentControllerComponentTest {

    @Mock private ExerciseSubmissionRepository exerciseSubmissionRepository;
    @Mock private ExerciseRepository exerciseRepository;
    @Mock private QuizResultRepository quizResultRepository;
    @Mock private QuizQuestionRepository quizQuestionRepository;

    private MockMvc exerciseMockMvc;
    private MockMvc quizMockMvc;

    @BeforeEach
    void setUp() {
        ExerciseSubmissionController exerciseController = new ExerciseSubmissionController();
        ReflectionTestUtils.setField(exerciseController, "exerciseSubmissionRepository", exerciseSubmissionRepository);
        ReflectionTestUtils.setField(exerciseController, "exerciseRepository", exerciseRepository);
        ReflectionTestUtils.setField(exerciseController, "objectMapper", new ObjectMapper());
        exerciseMockMvc = MockMvcBuilders.standaloneSetup(exerciseController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        QuizResultController quizController = new QuizResultController();
        ReflectionTestUtils.setField(quizController, "quizResultRepository", quizResultRepository);
        ReflectionTestUtils.setField(quizController, "quizQuestionRepository", quizQuestionRepository);
        quizMockMvc = MockMvcBuilders.standaloneSetup(quizController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("component/unit: exercise submission fail khi score khong phai so")
    void submitExerciseShouldRejectNonNumericScores() throws Exception {
        exerciseMockMvc.perform(post("/api/exercise-submissions")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": "u1",
                                  "exerciseId": "ex1",
                                  "answers": ["answer"],
                                  "totalScore": "bad",
                                  "maxScore": 10
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("component/unit: exercise submission serialize answers truoc khi save")
    void submitExerciseShouldSerializeAnswers() throws Exception {
        Exercise exercise = new Exercise();
        exercise.setId("ex1");
        when(exerciseRepository.findById("ex1")).thenReturn(Optional.of(exercise));
        when(exerciseSubmissionRepository.save(any(ExerciseSubmission.class))).thenAnswer(invocation -> invocation.getArgument(0));

        exerciseMockMvc.perform(post("/api/exercise-submissions")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": "u1",
                                  "exerciseId": "ex1",
                                  "answers": ["answer 1", "answer 2"],
                                  "totalScore": 8,
                                  "maxScore": 10,
                                  "timeSpent": 120
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalScore").value(8));

        ArgumentCaptor<ExerciseSubmission> captor = ArgumentCaptor.forClass(ExerciseSubmission.class);
        verify(exerciseSubmissionRepository).save(captor.capture());
        assertThat(captor.getValue().getAnswers()).isEqualTo("[\"answer 1\",\"answer 2\"]");
    }

    @Test
    @DisplayName("component/unit: quiz result tinh dung score theo dap an")
    void submitQuizShouldCalculateScore() throws Exception {
        QuizQuestion q1 = new QuizQuestion();
        q1.setCorrectAnswer(1);
        QuizQuestion q2 = new QuizQuestion();
        q2.setCorrectAnswer(2);
        when(quizQuestionRepository.findByQuizId("q1")).thenReturn(List.of(q1, q2));
        when(quizResultRepository.save(any(QuizResult.class))).thenAnswer(invocation -> invocation.getArgument(0));

        quizMockMvc.perform(post("/api/quiz-results")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": "u1",
                                  "quizId": "q1",
                                  "answers": [1, 0]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").value(1))
                .andExpect(jsonPath("$.totalQuestions").value(2));
    }

    @Test
    @DisplayName("component/unit: quiz result fail khi answers khong phai mang")
    void submitQuizShouldRejectInvalidAnswerFormat() throws Exception {
        QuizQuestion q1 = new QuizQuestion();
        q1.setCorrectAnswer(1);
        when(quizQuestionRepository.findByQuizId("q1")).thenReturn(List.of(q1));

        quizMockMvc.perform(post("/api/quiz-results")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": "u1",
                                  "quizId": "q1",
                                  "answers": {"value": 1}
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }
}
