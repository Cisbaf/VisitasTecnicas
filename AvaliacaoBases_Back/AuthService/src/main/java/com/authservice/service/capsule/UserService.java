package com.authservice.service.capsule;

import com.authservice.entity.userDto.LoginRequest;
import com.authservice.entity.userDto.UserRequest;
import com.authservice.entity.userDto.UserResponse;

import java.util.List;

public interface UserService {
    boolean existsByUsername(String username);

    String register(UserRequest request);

    String login(LoginRequest request);


    UserResponse findByUsername(String username);

    List<UserResponse> findAll();

    UserResponse findById(Long id);
    List<UserResponse> findAllByBaseId(Long idBase);

    void deleteById(Long id);

    UserResponse updateUser(Long id, UserRequest request);
}
