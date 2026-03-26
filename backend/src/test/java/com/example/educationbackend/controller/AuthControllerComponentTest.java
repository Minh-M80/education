package com.example.educationbackend.controller;

import com.example.educationbackend.model.User;
import com.example.educationbackend.repository.UserRepository;
import com.example.educationbackend.security.JwtUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import org.mockito.ArgumentCaptor;

import java.util.Optional;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerComponentTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @Test
    void registerEndpoint_returnsSuccessMessage_whenPayloadIsValid() throws Exception {
        when(userRepository.findByEmailIgnoreCase("component@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("Secret@1")).thenReturn("encoded-component-secret");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "component@example.com",
                                  "password": "Secret@1",
                                  "fullName": "Component User"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(content().string("User registered successfully!"));

        ArgumentCaptor<User> savedUserCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(savedUserCaptor.capture());
        verify(passwordEncoder).encode("Secret@1");
        assertThat(savedUserCaptor.getValue().getPassword()).isEqualTo("encoded-component-secret");
    }
}
