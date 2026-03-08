package com.apptemplate.api.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
@EntityListeners(com.apptemplate.api.audit.AuditEntityListener.class)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String role = "user";

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public String getFirstName() {
        if (name == null) return "";
        String[] parts = name.split(" ", 2);
        return parts[0];
    }

    public String getLastName() {
        if (name == null || !name.contains(" ")) return "";
        return name.substring(name.indexOf(" ") + 1);
    }

    public void setFullName(String firstName, String lastName) {
        if (firstName != null && lastName != null && !lastName.isEmpty()) {
            this.name = firstName + " " + lastName;
        } else if (firstName != null) {
            this.name = firstName;
        }
    }

    public boolean isAdmin() {
        return "admin".equalsIgnoreCase(this.role);
    }
}
