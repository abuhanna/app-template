package com.apptemplate.api.common.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

/**
 * UserDetailsService for minimal variant (external auth).
 * Since there is no users table, this creates a minimal UserDetails from the provided identifier.
 * Authentication is handled by JWT validation in JwtAuthFilter.
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // In minimal variant, there is no users table.
        // Return a basic UserDetails for Spring Security compatibility.
        return new org.springframework.security.core.userdetails.User(
                email,
                "",
                new ArrayList<>()
        );
    }
}
