package com.authservice.controller;

import com.authservice.entity.userDto.LoginRequest;
import com.authservice.entity.userDto.UserRequest;
import com.authservice.entity.userDto.UserResponse;
import com.authservice.service.capsule.UserService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {
    private final UserService userService;
    @Value("${jwt.expire}")
    private String expiration;
    @Value("${app.cookie.secure:false}")
    private boolean secureCookie;
    @Value("${app.cookie.samesite:Strict}")
    private String sameSite;

    @GetMapping("/username/{username}")
    @Operation(summary = "Get user by username")
    public ResponseEntity<UserResponse> getUserByUsername(@PathVariable String username) {
        UserResponse userResponse = userService.findByUsername(username);
        if (userResponse != null) {
            return ResponseEntity.ok(userResponse);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<UserResponse> findById(@PathVariable Long id) {
        UserResponse userResponse = userService.findById(id);
        if (userResponse != null) {
            return ResponseEntity.ok(userResponse);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/exists/{username}")
    @Operation(summary = "Check if user exists by username")
    public ResponseEntity<Boolean> existsByUsername(@PathVariable String username) {
        boolean exists = userService.existsByUsername(username);
        return ResponseEntity.ok(exists);
    }

    @GetMapping
    @Operation(summary = "Get all users")
    public ResponseEntity<List<UserResponse>> findAll() {
        List<UserResponse> users = userService.findAll();
        if (users.isEmpty()) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.ok(users);
        }
    }

    @GetMapping
    @Operation(summary = "Get all users by Base ID")
    @RequestMapping("/base/{idBase}")
    public ResponseEntity<List<UserResponse>> findAllByBaseId(@PathVariable Long idBase) {
        List<UserResponse> users = userService.findAllByBaseId(idBase);
        if (users.isEmpty()) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.ok(users);
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user by ID")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        userService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/registro")
    @Operation(summary = "Save a new user")
    public ResponseEntity<String> save(@RequestBody UserRequest request) {
        if (request == null) {
            return ResponseEntity.badRequest().build();
        }
        var savedUser = userService.register(request);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    @Operation(summary = "Login user")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        if (request == null) {
            return ResponseEntity.badRequest().build();
        }
        String accessToken = userService.login(request);
        ResponseCookie cookie = ResponseCookie.from("token", accessToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(Long.parseLong(expiration))
                .sameSite(sameSite)
                .build();

        log.info("Token gerado: {}", accessToken);

        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("Login feito com sucesso");
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user")
    public ResponseEntity<String> logout() {

        ResponseCookie cookie = ResponseCookie.from("token", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(Duration.ZERO)
                .sameSite(sameSite)
                .build();

        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("Logout feito com sucesso");
    }


    @PutMapping("/{id}")
    @Operation(summary = "Update an existing user")
    public ResponseEntity<UserResponse> update(@PathVariable Long id, @RequestBody UserRequest request) {
        if (request == null) {
            return ResponseEntity.badRequest().build();
        }
        UserResponse updatedUser = userService.updateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    }
}
