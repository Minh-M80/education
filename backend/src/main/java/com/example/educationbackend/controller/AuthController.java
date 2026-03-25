package com.example.educationbackend.controller;

import com.example.educationbackend.dto.JwtResponse;
import com.example.educationbackend.dto.LoginRequest;
import com.example.educationbackend.exception.BadRequestException;
import com.example.educationbackend.exception.ResourceNotFoundException;
import com.example.educationbackend.exception.UnauthorizedException;
import com.example.educationbackend.model.User;
import com.example.educationbackend.repository.UserRepository;
import com.example.educationbackend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern PASSWORD_SPECIAL_CHAR_PATTERN =
            Pattern.compile(".*[^A-Za-z0-9].*");

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        String email = loginRequest.getEmail();
        String password = loginRequest.getPassword();

        if (isBlank(email) && isBlank(password)) {
            throw new BadRequestException("Cả email và mật khẩu không được để trống");
        }
        if (isBlank(email)) {
            throw new BadRequestException("Email không được để trống");
        }
        if (isBlank(password)) {
            throw new BadRequestException("Mật khẩu không được để trống");
        }
        if (!email.equals(email.trim())) {
            throw new BadRequestException("Email không được có khoảng trắng ở đầu hoặc cuối");
        }
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new BadRequestException("Email sai định dạng");
        }
        if (password.length() < 6) {
            throw new BadRequestException("Mật khẩu quá ngắn");
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
                throw new BadRequestException("Email phân biệt chữ hoa và chữ thường");
            }
            throw new ResourceNotFoundException("Email không tồn tại");
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password));
        } catch (BadCredentialsException ex) {
            throw new UnauthorizedException("Sai mật khẩu");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        User user = userOpt.get();
        return ResponseEntity.ok(new JwtResponse(jwt, user.getId(), user.getEmail(), user.getFullName()));
    }
 

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User signUpRequest) {
        String email = signUpRequest.getEmail();
        String password = signUpRequest.getPassword();
        String fullName = signUpRequest.getFullName();

        if (isBlank(email) && isBlank(password)) {
            throw new BadRequestException("Ca email va mat khau khong duoc de trong");
        }
        if (isBlank(email)) {
            throw new BadRequestException("Email khong duoc de trong");
        }
        if (isBlank(password)) {
            throw new BadRequestException("Mat khau khong duoc de trong");
        }
        if (isBlank(fullName)) {
            throw new BadRequestException("Ho ten khong duoc de trong");
        }
        if (!email.equals(email.trim())) {
            throw new BadRequestException("Email khong duoc co khoang trang o dau hoac cuoi");
        }
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new BadRequestException("Email sai dinh dang");
        }
        if (password.length() < 6 || !PASSWORD_SPECIAL_CHAR_PATTERN.matcher(password).matches()) {
            throw new BadRequestException("Mat khau phai co it nhat 6 ky tu va chua ky tu dac biet");
        }
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new BadRequestException("Email da duoc su dung");
        }

        // Create new user's account
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setEmail(email);
        user.setFullName(fullName.trim());
        user.setPassword(password); // Real prod should encode
        
        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
