package com.example.educationbackend.controller;

import com.example.educationbackend.exception.BadRequestException;
import com.example.educationbackend.exception.ResourceNotFoundException;
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

    @GetMapping("/course/{courseId}")
    public List<Review> getReviewsByCourseId(@PathVariable String courseId) {
        return reviewRepository.findByCourseId(courseId);
    }

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody Review review) {
        if (review.getUserId() == null || review.getCourseId() == null) {
            throw new BadRequestException("Thiếu userId hoặc courseId");
        }
        if (review.getRating() == null || review.getRating() < 1 || review.getRating() > 5) {
            throw new BadRequestException("Rating phải từ 1 đến 5");
        }

        review.setId(UUID.randomUUID().toString());
        review.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        Review saved = reviewRepository.save(review);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReview(@PathVariable String id, @RequestBody Review updated) {
        Optional<Review> existing = reviewRepository.findById(id);
        if (existing.isEmpty()) {
            throw new ResourceNotFoundException("Review not found");
        }

        Review review = existing.get();
        if (updated.getRating() != null) {
            if (updated.getRating() < 1 || updated.getRating() > 5) {
                throw new BadRequestException("Rating phải từ 1 đến 5");
            }
            review.setRating(updated.getRating());
        }
        if (updated.getComment() != null) {
            review.setComment(updated.getComment());
        }

        return ResponseEntity.ok(reviewRepository.save(review));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable String id) {
        if (!reviewRepository.existsById(id)) {
            throw new ResourceNotFoundException("Review not found");
        }
        reviewRepository.deleteById(id);
        return ResponseEntity.ok(java.util.Map.of("message", "Đánh giá đã được xóa thành công"));
    }
}
