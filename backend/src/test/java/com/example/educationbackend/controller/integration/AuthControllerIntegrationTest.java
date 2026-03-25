package com.example.educationbackend.controller.integration;

import com.example.educationbackend.support.AuthRegisterCsvLoader.RegisterCsvCase;
import com.example.educationbackend.support.IntegrationTestSupport;
import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.io.IOException;
import java.util.Locale;
import java.util.stream.Stream;

import static com.example.educationbackend.support.AuthRegisterCsvLoader.loadRegisterCases;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration test:
 * - Full Spring MVC + JPA + H2 cho AuthController.
 * - Co tham chieu du lieu mong doi tu CSV Postman cua use case register.
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class AuthControllerIntegrationTest extends IntegrationTestSupport {

    @Autowired
    private MockMvc mockMvc;

    static Stream<RegisterCsvCase> registerCases() throws IOException {
        return loadRegisterCases();
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("registerCases")
    void registerShouldMatchCsv(RegisterCsvCase testCase) throws Exception {
        seedRegisterData(testCase.testName());

        String responseBody = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(testCase.requestBody()))
                .andExpect(status().is(testCase.expectedStatus()))
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertThat(responseBody.toLowerCase(Locale.ROOT))
                .contains(testCase.expectedTextContains().toLowerCase(Locale.ROOT));

        if (testCase.expectedStatus() == 200) {
            JsonNode requestJson = objectMapper.readTree(testCase.requestBody());
            assertThat(userRepository.findByEmail(requestJson.get("email").asText())).isPresent();
        }
    }

    @Test
    void loginShouldReturnJwtForValidUser() throws Exception {
        saveUser("u1", "test@example.com", "password123", "Test User");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "test@example.com",
                                  "password": "password123"
                                }
                                """))
                .andExpect(status().isOk());
    }

    @Test
    void loginShouldReturnUnauthorizedForWrongPassword() throws Exception {
        saveUser("u1", "test@example.com", "password123", "Test User");

        String responseBody = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
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

    @Test
    void loginShouldReturnBadRequestForInvalidEmailFormat() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "invalid-email",
                                  "password": "password123"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    private void seedRegisterData(String testName) {
        if (testName.contains("trung user A")) {
            saveUser("dup-a", "pf_uc1_a_itest@example.com", "Pass@123", "PF UC1 A itest");
        }
        if (testName.contains("hoa thuong")) {
            saveUser("dup-case", "test@example.com", "Pass@123", "Existing User");
        }
    }
}
