package com.sneakyghost.twentyplots;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Collections;

import com.sneakyghost.twentyplots.db.UserRepository;
import com.sneakyghost.twentyplots.entities.User;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User existingUser = userRepository.findByUsername(username);
        if (existingUser != null) {
            return new org.springframework.security.core.userdetails.User(existingUser.getUsername(), existingUser.getPassword(), Collections.emptyList());
        }
        throw new UsernameNotFoundException("User not found: " + username);
    }
}