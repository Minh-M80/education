package com.example.educationbackend.controller;

import com.example.educationbackend.model.Review;
import com.example.educationbackend.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    /**
     * GET /api/reviews/course/{courseId}
     * Lấy tất cả đánh giá của một khóa học.
     */
    @GetMapping("/course/{courseId}")
    public List<Review> getReviewsByCourseId(@PathVariable String courseId) {
        return reviewRepository.findByCourseId(courseId);
    }

    /**
     * POST /api/reviews
     * Thêm đánh giá mới cho khóa học.
     * Body: { "userId": "u1", "courseId": "1", "rating": 5, "comment": "Rất hay!", "userName": "Nguyen Van A" }
     */
    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody Review review) {
        if (review.getUserId() == null || review.getCourseId() == null) {
            return ResponseEntity.badRequest().body("Thiếu userId hoặc courseId");
        }
        if (review.getRating() == null || review.getRating() < 1 || review.getRating() > 5) {
            return ResponseEntity.badRequest().body("Rating phải từ 1 đến 5");
        }

        review.setId(UUID.randomUUID().toString());
        review.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        Review saved = reviewRepository.save(review);
        return ResponseEntity.ok(saved);
    }

    /**
     * PUT /api/reviews/{id}
     * Cập nhật nội dung đánh giá (rating và/hoặc comment).
     * Body: { "rating": 4, "comment": "Nội dung cập nhật..." }
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateReview(@PathVariable String id, @RequestBody Review updated) {
        Optional<Review> existing = reviewRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Review review = existing.get();
        if (updated.getRating() != null) {
            if (updated.getRating() < 1 || updated.getRating() > 5) {
                return ResponseEntity.badRequest().body("Rating phải từ 1 đến 5");
            }
            review.setRating(updated.getRating());
        }
        if (updated.getComment() != null) {
            review.setComment(updated.getComment());
        }

        return ResponseEntity.ok(reviewRepository.save(review));
    }

    /**
     * DELETE /api/reviews/{id}
     * Xóa một đánh giá.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable String id) {
        if (!reviewRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        reviewRepository.deleteById(id);
        return ResponseEntity.ok(java.util.Map.of("message", "Đánh giá đã được xóa thành công"));
    }
}
