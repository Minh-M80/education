package com.example.educationbackend.controller.system;

import com.example.educationbackend.support.IntegrationTestSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * System test:
 * - Smoke test full stack HTTP cho flow register -> login.
 * - So luong it hon component/integration la chu y co y.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class AuthFlowSystemTest extends IntegrationTestSupport {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void registerThenLoginShouldReturnJwtAndPersistUser() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<String> registerResponse = restTemplate.postForEntity(
                baseUrl("/api/auth/register"),
                new HttpEntity<>(Map.of(
                        "email", "system_flow@example.com",
                        "password", "Pass@123",
                        "fullName", "System Flow User"
                ), headers),
                String.class
        );

        assertThat(registerResponse.getStatusCode().value()).isEqualTo(200);
        assertThat(registerResponse.getBody()).containsIgnoringCase("registered successfully");

        ResponseEntity<Map> loginResponse = restTemplate.postForEntity(
                baseUrl("/api/auth/login"),
                new HttpEntity<>(Map.of(
                        "email", "system_flow@example.com",
                        "password", "Pass@123"
                ), headers),
                Map.class
        );

        assertThat(loginResponse.getStatusCode().value()).isEqualTo(200);
        assertThat(loginResponse.getBody()).containsKeys("token", "id", "email", "fullName");
        assertThat(loginResponse.getBody().get("email")).isEqualTo("system_flow@example.com");
        assertThat(loginResponse.getBody().get("fullName")).isEqualTo("System Flow User");
        assertThat(loginResponse.getBody().get("token").toString()).isNotBlank();
    }

    private String baseUrl(String path) {
        return "http://localhost:" + port + path;
    }
}
