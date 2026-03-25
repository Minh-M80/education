package com.example.educationbackend.support;

import com.example.educationbackend.model.Assignment;
import com.example.educationbackend.model.AssignmentSubmission;
import com.example.educationbackend.model.Course;
import com.example.educationbackend.model.Enrollment;
import com.example.educationbackend.model.Exercise;
import com.example.educationbackend.model.ExerciseQuestion;
import com.example.educationbackend.model.ExerciseSubmission;
import com.example.educationbackend.model.Lesson;
import com.example.educationbackend.model.LessonProgress;
import com.example.educationbackend.model.Quiz;
import com.example.educationbackend.model.QuizQuestion;
import com.example.educationbackend.model.QuizResult;
import com.example.educationbackend.model.Review;
import com.example.educationbackend.model.User;
import com.example.educationbackend.repository.AssignmentRepository;
import com.example.educationbackend.repository.AssignmentSubmissionRepository;
import com.example.educationbackend.repository.CourseRepository;
import com.example.educationbackend.repository.EnrollmentRepository;
import com.example.educationbackend.repository.ExerciseQuestionRepository;
import com.example.educationbackend.repository.ExerciseRepository;
import com.example.educationbackend.repository.ExerciseSubmissionRepository;
import com.example.educationbackend.repository.LessonProgressRepository;
import com.example.educationbackend.repository.LessonRepository;
import com.example.educationbackend.repository.QuizQuestionRepository;
import com.example.educationbackend.repository.QuizRepository;
import com.example.educationbackend.repository.QuizResultRepository;
import com.example.educationbackend.repository.ReviewRepository;
import com.example.educationbackend.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public abstract class IntegrationTestSupport {

    @Autowired protected ObjectMapper objectMapper;
    @Autowired protected UserRepository userRepository;
    @Autowired protected CourseRepository courseRepository;
    @Autowired protected LessonRepository lessonRepository;
    @Autowired protected AssignmentRepository assignmentRepository;
    @Autowired protected AssignmentSubmissionRepository assignmentSubmissionRepository;
    @Autowired protected ExerciseRepository exerciseRepository;
    @Autowired protected ExerciseQuestionRepository exerciseQuestionRepository;
    @Autowired protected ExerciseSubmissionRepository exerciseSubmissionRepository;
    @Autowired protected QuizRepository quizRepository;
    @Autowired protected QuizQuestionRepository quizQuestionRepository;
    @Autowired protected QuizResultRepository quizResultRepository;
    @Autowired protected EnrollmentRepository enrollmentRepository;
    @Autowired protected LessonProgressRepository lessonProgressRepository;
    @Autowired protected ReviewRepository reviewRepository;

    @BeforeEach
    void clearData() {
        assignmentSubmissionRepository.deleteAll();
        exerciseSubmissionRepository.deleteAll();
        quizResultRepository.deleteAll();
        lessonProgressRepository.deleteAll();
        reviewRepository.deleteAll();
        enrollmentRepository.deleteAll();
        exerciseQuestionRepository.deleteAll();
        assignmentRepository.deleteAll();
        quizQuestionRepository.deleteAll();
        exerciseRepository.deleteAll();
        quizRepository.deleteAll();
        lessonRepository.deleteAll();
        courseRepository.deleteAll();
        userRepository.deleteAll();
    }

    protected String toJson(Object value) throws JsonProcessingException {
        return objectMapper.writeValueAsString(value);
    }

    protected User saveUser(String id, String email, String password, String fullName) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setPassword(password);
        user.setFullName(fullName);
        return userRepository.save(user);
    }

    protected Course saveCourse(String id, String title) {
        Course course = new Course();
        course.setId(id);
        course.setTitle(title);
        course.setDescription("Description for " + title);
        course.setInstructor("Instructor");
        course.setThumbnail("thumb.png");
        course.setPrice(BigDecimal.valueOf(199000));
        course.setDuration("10h");
        course.setLevel("beginner");
        course.setCategory("programming");
        course.setRating(BigDecimal.valueOf(4.7));
        course.setTotalStudents(100);
        course.setTotalLessons(5);
        return courseRepository.save(course);
    }

    protected Lesson saveLesson(String id, String courseId, String title, int order) {
        Lesson lesson = new Lesson();
        lesson.setId(id);
        lesson.setCourseId(courseId);
        lesson.setTitle(title);
        lesson.setDescription("Lesson " + title);
        lesson.setDuration("15m");
        lesson.setVideoUrl("https://www.youtube.com/embed/demo");
        lesson.setVideoType("youtube");
        lesson.setLessonOrder(order);
        return lessonRepository.save(lesson);
    }

    protected Assignment saveAssignment(String id, String lessonId, String title) {
        Assignment assignment = new Assignment();
        assignment.setId(id);
        assignment.setLessonId(lessonId);
        assignment.setTitle(title);
        assignment.setDescription("Assignment " + title);
        assignment.setDueDate(Timestamp.from(Instant.parse("2026-04-01T00:00:00Z")));
        assignment.setMaxFileSizeMb(20);
        assignment.setAllowedFormats(".pdf,.docx");
        assignment.setMaxScore(100);
        return assignmentRepository.save(assignment);
    }

    protected Exercise saveExercise(String id, String lessonId, String title) {
        Exercise exercise = new Exercise();
        exercise.setId(id);
        exercise.setLessonId(lessonId);
        exercise.setTitle(title);
        exercise.setDescription("Exercise " + title);
        exercise.setType("coding");
        exercise.setTimeLimitMinutes(30);
        return exerciseRepository.save(exercise);
    }

    protected ExerciseQuestion saveExerciseQuestion(String id, String exerciseId, String question, String hintsJson) {
        ExerciseQuestion exerciseQuestion = new ExerciseQuestion();
        exerciseQuestion.setId(id);
        exerciseQuestion.setExerciseId(exerciseId);
        exerciseQuestion.setQuestion(question);
        exerciseQuestion.setType("short-answer");
        exerciseQuestion.setPlaceholder("Type here");
        exerciseQuestion.setExpectedAnswer("expected");
        exerciseQuestion.setHints(hintsJson);
        exerciseQuestion.setPoints(10);
        return exerciseQuestionRepository.save(exerciseQuestion);
    }

    protected Quiz saveQuiz(String id, String lessonId, String title) {
        Quiz quiz = new Quiz();
        quiz.setId(id);
        quiz.setLessonId(lessonId);
        quiz.setTitle(title);
        quiz.setDurationMinutes(20);
        return quizRepository.save(quiz);
    }

    protected QuizQuestion saveQuizQuestion(String id, String quizId, String question, int correctAnswer) {
        QuizQuestion quizQuestion = new QuizQuestion();
        quizQuestion.setId(id);
        quizQuestion.setQuizId(quizId);
        quizQuestion.setQuestion(question);
        quizQuestion.setOptions("[\"A\",\"B\",\"C\",\"D\"]");
        quizQuestion.setCorrectAnswer(correctAnswer);
        return quizQuestionRepository.save(quizQuestion);
    }

    protected Enrollment saveEnrollment(String id, String userId, String courseId) {
        Enrollment enrollment = new Enrollment();
        enrollment.setId(id);
        enrollment.setUserId(userId);
        enrollment.setCourseId(courseId);
        enrollment.setEnrolledAt(Timestamp.from(Instant.parse("2026-03-25T00:00:00Z")));
        enrollment.setProgress(BigDecimal.valueOf(10));
        enrollment.setStatus("active");
        enrollment.setCompletedLessons("[]");
        return enrollmentRepository.save(enrollment);
    }

    protected LessonProgress saveLessonProgress(String id, String userId, String lessonId, String courseId) {
        LessonProgress progress = new LessonProgress();
        progress.setId(id);
        progress.setUserId(userId);
        progress.setLessonId(lessonId);
        progress.setCourseId(courseId);
        progress.setWatchedAt(Timestamp.from(Instant.parse("2026-03-25T00:00:00Z")));
        return lessonProgressRepository.save(progress);
    }

    protected Review saveReview(String id, String userId, String courseId, int rating, String comment) {
        Review review = new Review();
        review.setId(id);
        review.setUserId(userId);
        review.setCourseId(courseId);
        review.setRating(rating);
        review.setComment(comment);
        review.setUserName("Reviewer");
        review.setCreatedAt(Timestamp.from(Instant.parse("2026-03-25T00:00:00Z")));
        return reviewRepository.save(review);
    }

    protected QuizResult saveQuizResult(String id, String userId, String quizId, int score, int totalQuestions) {
        QuizResult result = new QuizResult();
        result.setId(id);
        result.setUserId(userId);
        result.setQuizId(quizId);
        result.setScore(score);
        result.setTotalQuestions(totalQuestions);
        result.setAnswers("[0,1]");
        result.setSubmittedAt(new Timestamp(System.currentTimeMillis()));
        return quizResultRepository.save(result);
    }

    protected ExerciseSubmission saveExerciseSubmission(String id, String userId, String exerciseId) {
        ExerciseSubmission submission = new ExerciseSubmission();
        submission.setId(id);
        submission.setUserId(userId);
        submission.setExerciseId(exerciseId);
        submission.setAnswers("[\"ans\"]");
        submission.setTotalScore(8);
        submission.setMaxScore(10);
        submission.setTimeSpent(120);
        submission.setSubmittedAt(new Timestamp(System.currentTimeMillis()));
        return exerciseSubmissionRepository.save(submission);
    }

    protected AssignmentSubmission saveAssignmentSubmission(String id, String userId, String assignmentId, String fileName) {
        AssignmentSubmission submission = new AssignmentSubmission();
        submission.setId(id);
        submission.setUserId(userId);
        submission.setAssignmentId(assignmentId);
        submission.setFileName(fileName);
        submission.setFileSize(1024L);
        submission.setSubmittedAt(new Timestamp(System.currentTimeMillis()));
        submission.setGrade(88);
        submission.setFeedback("Good job");
        submission.setStatus("graded");
        return assignmentSubmissionRepository.save(submission);
    }

    protected String randomId() {
        return UUID.randomUUID().toString();
    }

    protected String jsonArray(List<String> values) throws JsonProcessingException {
        return objectMapper.writeValueAsString(values);
    }
}
