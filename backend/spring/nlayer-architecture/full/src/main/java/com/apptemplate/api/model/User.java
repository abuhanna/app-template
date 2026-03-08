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

    @Column(name = "password_reset_token")
    private String passwordResetToken;

    @Column(name = "password_reset_token_expiry")
    private LocalDateTime passwordResetTokenExpiry;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Gets the first name derived from the name field.
     */
    public String getFirstName() {
        if (name == null) return "";
        String[] parts = name.split(" ", 2);
        return parts[0];
    }

    /**
     * Gets the last name derived from the name field.
     */
    public String getLastName() {
        if (name == null || !name.contains(" ")) return "";
        return name.substring(name.indexOf(" ") + 1);
    }

    /**
     * Sets first name and last name by combining them into the name field.
     */
    public void setFullName(String firstName, String lastName) {
        if (firstName != null && lastName != null && !lastName.isEmpty()) {
            this.name = firstName + " " + lastName;
        } else if (firstName != null) {
            this.name = firstName;
        }
    }

    /**
     * Records user login timestamp.
     */
    public void recordLogin() {
        this.lastLoginAt = LocalDateTime.now();
    }

    /**
     * Checks if user is admin.
     */
    public boolean isAdmin() {
        return "admin".equalsIgnoreCase(this.role);
    }
}
