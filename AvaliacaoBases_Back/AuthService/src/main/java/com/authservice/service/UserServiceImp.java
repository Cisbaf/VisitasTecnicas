package com.authservice.service;

import com.authservice.entity.userDto.LoginRequest;
import com.authservice.entity.userDto.UserRequest;
import com.authservice.entity.userDto.UserResponse;
import com.authservice.respository.UserRepository;
import com.authservice.service.capsule.UserService;
import com.authservice.service.jwt.JtwUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImp implements UserService {
    private final UserRepository userRepository;
    private final JtwUtils jtwUtils;

    public boolean existsByUsername(String username) {
        return userRepository.existsByUser(username);
    }

    public String register(UserRequest request) {
        var entity = UserMapper.toEntity(request);
        entity.setPassword(BCrypt.hashpw(request.password(), BCrypt.gensalt()));

        var accessToken = jtwUtils.generateToken(entity.getUser(), entity.getRole(), entity.getBase() != null ? entity.getBase() : "");

        userRepository.save(entity);

        return accessToken ;
    }

    public String login(LoginRequest request) {
        var entity = userRepository.findByUser(request.user());
        if (entity == null || !BCrypt.checkpw(request.password(), entity.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }
        return jtwUtils.generateToken(entity.getUser(), entity.getRole(), entity.getBase() != null ? entity.getBase() : "");
    }


    public UserResponse findByUsername(String username) {
        var entity = userRepository.findByUser(username);
        if (entity == null) {
            return null;
        }
        return UserMapper.toResponse(entity);
    }
    public UserResponse findById(Long id) {
        var entity = userRepository.findById(id).orElse(null);
        if (entity == null) {
            return null;
        }
        return UserMapper.toResponse(entity);
    }

    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
                .map(UserMapper::toResponse)
                .toList();
    }

    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }
    public UserResponse updateUser(Long id, UserRequest request) {
        var entity = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        BeanUtils.copyProperties(request,entity);
        userRepository.save(entity);
        return UserMapper.toResponse(entity);
    }

}
