package com.gatewayservice.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtUtils {

    private final SecretKey secretKey;

    public JwtUtils(@Value("${jwt.secret}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
    }

    public Claims getClaimsFromToken(String token) {
        String compactToken = token.startsWith("Bearer ") ? token.substring(7) : token;

        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(compactToken).getPayload();
    }

    public boolean isTokenExpired(String token) {
        return getClaimsFromToken(token).getExpiration().before(new Date());
    }

    public boolean isValid(String token) {
        try {

            String cleanToken = token.trim();
            Claims claims = getClaimsFromToken(cleanToken);
            return claims != null && !isTokenExpired(cleanToken);
        } catch (Exception e) {
            return false;
        }
    }
}