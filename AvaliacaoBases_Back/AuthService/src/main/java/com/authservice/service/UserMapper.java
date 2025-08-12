package com.authservice.service;

import com.authservice.entity.UserEntity;
import com.authservice.entity.userDto.UserRequest;
import com.authservice.entity.userDto.UserResponse;
import org.springframework.stereotype.Service;

@Service
public class UserMapper {
    protected static UserResponse toResponse(UserEntity entity) {
        return UserResponse.builder()
                .id(entity.getId())
                .user(entity.getUser())
                .password(entity.getPassword())
                .role(entity.getRole())
                .build();
    }

    protected static UserEntity toEntity(UserRequest request) {
        return UserEntity.builder()
                .user(request.user())
                .password(request.password())
                .role(request.role())
                .build();
    }
}
