package com.example.educationbackend.controller.component;

import com.example.educationbackend.controller.AuthController;
import com.example.educationbackend.exception.GlobalExceptionHandler;
import com.example.educationbackend.model.User;
import com.example.educationbackend.repository.UserRepository;
import com.example.educationbackend.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Component test + unit test:
 * - Test rieng AuthController bang Mockito va MockMvc standalone.
 */
@ExtendWith(MockitoExtension.class)
class AuthControllerComponentTest {

    @Mock private AuthenticationManager authenticationManager;
    @Mock private UserRepository userRepository;
    @Mock private JwtUtils jwtUtils;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        AuthController controller = new AuthController();
        ReflectionTestUtils.setField(controller, "authenticationManager", authenticationManager);
        ReflectionTestUtils.setField(controller, "userRepository", userRepository);
        ReflectionTestUtils.setField(controller, "jwtUtils", jwtUtils);

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("component/unit: register thanh cong va trim fullName truoc khi save")
    void registerShouldPersistTrimmedFullName() throws Exception {
        when(userRepository.findByEmailIgnoreCase("new_user@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "new_user@example.com",
                                  "password": "Pass@123",
                                  "fullName": "  New User  "
                                }
                                """))
                .andExpect(status().isOk());

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getFullName()).isEqualTo("New User");
        assertThat(captor.getValue().getId()).isNotBlank();
    }

    @Test
    @DisplayName("component/unit: register fail khi email da duoc su dung")
    void registerShouldRejectDuplicateEmail() throws Exception {
        when(userRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(new User()));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "test@example.com",
                                  "password": "Pass@123",
                                  "fullName": "Duplicate User"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email da duoc su dung"));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("component/unit: login thanh cong tra ve jwt response")
    void loginShouldReturnJwtResponse() throws Exception {
        User existingUser = new User();
        existingUser.setId("u1");
        existingUser.setEmail("test@example.com");
        existingUser.setFullName("Test User");
        existingUser.setPassword("password123");

        UserDetails principal = org.springframework.security.core.userdetails.User
                .withUsername("test@example.com")
                .password("password123")
                .authorities(AuthorityUtils.NO_AUTHORITIES)
                .build();
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                principal,
                null,
                principal.getAuthorities()
        );

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(existingUser));
        when(authenticationManager.authenticate(any(Authentication.class))).thenReturn(authentication);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("jwt-token");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "test@example.com",
                                  "password": "password123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.fullName").value("Test User"));
    }

    @Test
    @DisplayName("component/unit: login fail khi sai mat khau")
    void loginShouldReturnUnauthorizedWhenPasswordIsWrong() throws Exception {
        User existingUser = new User();
        existingUser.setEmail("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(existingUser));
        when(authenticationManager.authenticate(any(Authentication.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        String responseBody = mockMvc.perform(post("/api/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "test@example.com",
                                  "password": "wrongpass"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertThat(responseBody).contains("Sai");
    }
}
