package com.authservice.service.jwt;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JtwUtils {

    @Value("${jwt.expire}")
    private String expiration;
    private final SecretKey secretKey;

    public JtwUtils(@Value("${jwt.secret}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String username, String role) {
        long expireToken = Long.parseLong(expiration) * 1000;
        var expirationDate = new Date(System.currentTimeMillis() + expireToken);

        return Jwts.builder().claim("role", role)
                .subject(username)
                .issuedAt(new Date())
                .expiration(expirationDate)
                .signWith(secretKey)
                .compact();
    }
}
