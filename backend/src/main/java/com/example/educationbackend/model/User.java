package com.example.educationbackend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import java.sql.Timestamp;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    private String id;
    private String email;
    private String fullName;
    private String avatar;
    private String password;
    private Timestamp createdAt;
}
