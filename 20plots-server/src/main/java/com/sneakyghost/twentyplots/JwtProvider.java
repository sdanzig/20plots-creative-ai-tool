package com.sneakyghost.twentyplots;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.springframework.security.core.userdetails.UserDetails;
import io.jsonwebtoken.security.Keys;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SecurityException;

import java.util.Date;
import java.security.Key;

@Service
public class JwtProvider {
    private static final Logger logger = LoggerFactory.getLogger(JwtProvider.class);

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private int jwtExpirationMs;

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateJwtToken(String username, Long userId) {
        String subject = username + ":" + userId;
        return Jwts.builder()
                .setSubject(subject).setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public Long getUserIdFromJwtToken(String token) {
        if (!validateJwtToken(token)) {
            logger.error("Invalid JWT token: {}", token);
            return null;
        }

        String subject = Jwts.parserBuilder().setSigningKey(jwtSecret).build().parseClaimsJws(token).getBody()
                .getSubject();

        // Subject is expected to be formatted as username:userId
        String[] subjectParts = subject.split(":");
        String username = subjectParts[0];
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        if (!validateToken(token, userDetails)) {
            logger.error("Invalid JWT token: {}", token);
            return null;
        }

        return Long.parseLong(subjectParts[1]);
    }

    public String extractUsername(String token) {
        logger.debug("Starting extractUsername with token: {}", token);
        String subject = null;
        try {
            subject = Jwts.parserBuilder().setSigningKey(jwtSecret).build().parseClaimsJws(token).getBody()
                    .getSubject();
        } catch (Exception e) {
            logger.error("Error while extracting subject from token", e);
            throw e; // it's important to re-throw the exception, if it was being handled in your
                     // code
        }

        String username = subject.split(":")[0];
        logger.debug("Extracted username: {}", username);
        return username;
    }

    @Value("${app.jwt.secret}")
    private String encodedSecret;

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(jwtSecret).build().parseClaimsJws(authToken);
            return true;
        } catch (ExpiredJwtException e) {
            logger.error("Expired JWT token: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("Unsupported JWT token: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Malformed JWT token: {}", e.getMessage());
        } catch (SecurityException e) {
            logger.error("Invalid JWT signature: {}", e.getMessage());
        }

        return false;
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return Jwts.parserBuilder().setSigningKey(jwtSecret).build().parseClaimsJws(token).getBody().getExpiration();
    }
}
