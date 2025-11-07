 package com.avaliacaoservice.auth.service.jwt;
 
 import io.jsonwebtoken.Jwts;
 import io.jsonwebtoken.security.Keys;
 import java.util.Date;
 import javax.crypto.SecretKey;
 import org.springframework.beans.factory.annotation.Value;
 import org.springframework.stereotype.Service;
 
 
 @Service
 public class JtwUtils
 {
   @Value("${jwt.expire}")
   private String expiration;
   private final SecretKey secretKey;
   
   public JtwUtils(@Value("${jwt.secret}") String secret) {
     this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
   }
   
   public String generateToken(String username, String role, String base) {
     long expireToken = Long.parseLong(this.expiration);
     Date expirationDate = new Date(System.currentTimeMillis() + expireToken);
     
     return Jwts.builder()
       .claim("role", role)
       .claim("base", base)
       .subject(username)
       .issuedAt(new Date())
       .expiration(expirationDate)
       .signWith(this.secretKey)
       .compact();
   }
 }

