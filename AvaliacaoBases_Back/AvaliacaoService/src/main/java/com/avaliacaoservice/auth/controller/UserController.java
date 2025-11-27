package com.avaliacaoservice.auth.controller;

import com.avaliacaoservice.auth.entity.userDto.LoginRequest;
import com.avaliacaoservice.auth.entity.userDto.UserRequest;
import com.avaliacaoservice.auth.entity.userDto.UserResponse;
import com.avaliacaoservice.auth.service.capsule.UserService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {


    private final UserService userService;
    @Value("${jwt.expire}")
    private String expiration;
    @Value("${app.cookie.secure:false}")
    private boolean secureCookie;
    @Value("${app.cookie.samesite:Strict}")
    private String sameSite;

    @GetMapping({"/username/{username}"})
    @Operation(summary = "Get user by username")
    public ResponseEntity<UserResponse> getUserByUsername(@PathVariable String username) {

        UserResponse userResponse = this.userService.findByUsername(username);
        log.info("Fetching user by username: {}", username);

        if (userResponse != null) {

            return ResponseEntity.ok(userResponse);
        }

        return ResponseEntity.notFound().build();
    }


    @GetMapping({"/{id}"})
    @Operation(summary = "Get user by ID")
    public ResponseEntity<UserResponse> findById(@PathVariable Long id) {

        UserResponse userResponse = this.userService.findById(id);

        if (userResponse != null) {

            return ResponseEntity.ok(userResponse);
        }

        return ResponseEntity.notFound().build();
    }


    @GetMapping({"/exists/{username}"})
    @Operation(summary = "Check if user exists by username")
    public ResponseEntity<Boolean> existsByUsername(@PathVariable String username) {

        boolean exists = this.userService.existsByUsername(username);

        return ResponseEntity.ok(exists);
    }

    @GetMapping
    @Operation(summary = "Get all users")
    public ResponseEntity<List<UserResponse>> findAll() {

        List<UserResponse> users = this.userService.findAll();

        if (users.isEmpty()) {

            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(users);
    }


    @GetMapping
    @Operation(summary = "Get all users by Base ID")
    @RequestMapping({"/base/{idBase}"})
    public ResponseEntity<List<UserResponse>> findAllByBaseId(@PathVariable Long idBase) {

        List<UserResponse> users = this.userService.findAllByBaseId(idBase);
        log.info("Fetching all users for base ID: {}, count: {}", idBase, users.size());

        if (users.isEmpty()) {

            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(users);
    }


    @DeleteMapping({"/{id}"})
    @Operation(summary = "Delete user by ID")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {

        this.userService.deleteById(id);

        return ResponseEntity.noContent().build();
    }

    @PostMapping({"/registro"})
    @Operation(summary = "Save a new user")
    public ResponseEntity<String> save(@RequestBody UserRequest request) {

        if (request == null) {

            return ResponseEntity.badRequest().build();
        }

        String savedUser = this.userService.register(request);

        return ResponseEntity.ok(savedUser);
    }

    @PostMapping({"/login"})
    @Operation(summary = "Login user")
    public ResponseEntity<String> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {

        if (request == null) {

            return ResponseEntity.badRequest().build();
        }


        String accessToken = this.userService.login(request);


        ResponseCookie cookie = ResponseCookie.from("token", accessToken).httpOnly(true).secure(false).path("/").maxAge(Long.parseLong(this.expiration)).sameSite(this.sameSite).build();


        return ResponseEntity.ok().header("Set-Cookie", cookie.toString()).body("Login feito com sucesso");
    }


    @PostMapping({"/logout"})
    @Operation(summary = "Logout user")
    public ResponseEntity<String> logout() {

        ResponseCookie cookie = ResponseCookie.from("token", "").httpOnly(true).secure(false).path("/").maxAge(Duration.ZERO).sameSite(this.sameSite).build();


        return ResponseEntity.ok().header("Set-Cookie", cookie.toString()).body("Logout feito com sucesso");
    }


    @PutMapping({"/{id}"})
    @Operation(summary = "Update an existing user")
    public ResponseEntity<UserResponse> update(@PathVariable Long id, @RequestBody UserRequest request) {

        if (request == null) {
            ResponseEntity.badRequest().build();
        }

        UserResponse updatedUser = this.userService.updateUser(id, request);

        return ResponseEntity.ok(updatedUser);
    }
}