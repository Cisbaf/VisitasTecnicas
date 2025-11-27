package com.avaliacaoservice.auth.service;

import com.avaliacaoservice.auth.entity.UserEntity;
import com.avaliacaoservice.auth.entity.userDto.LoginRequest;
import com.avaliacaoservice.auth.entity.userDto.UserRequest;
import com.avaliacaoservice.auth.entity.userDto.UserResponse;
import com.avaliacaoservice.auth.respository.UserRepository;
import com.avaliacaoservice.auth.service.capsule.UserService;
import com.avaliacaoservice.auth.service.jwt.JtwUtils;
import com.avaliacaoservice.base.service.capsule.BaseService;
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
    private final BaseService baseServiceClient;

    public boolean existsByUsername(String username) {
        return this.userRepository.existsByUser(username);
    }

    public String register(UserRequest request) {
        UserEntity entity = UserMapper.toEntity(request);
        entity.setPassword(BCrypt.hashpw(request.password(), BCrypt.gensalt()));

        if (entity.getBaseId() != null) {
            boolean baseExists = this.baseServiceClient.existsById(entity.getBaseId());
            if (!baseExists) {
                throw new RuntimeException("Base ID does not exist");
            }
        }
        if (this.userRepository.existsByUser(entity.getUser())) {
            throw new RuntimeException("Username already exists");
        }
        String accessToken = this.jtwUtils.generateToken(entity.getUser(), entity.getRole(), String.valueOf((entity.getBaseId() != null) ? entity.getBaseId() : ""));

        this.userRepository.save(entity);

        return accessToken;
    }

    public String login(LoginRequest request) {
        UserEntity entity = this.userRepository.findByUser(request.user().trim());
        if (entity == null || !BCrypt.checkpw(request.password(), entity.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }
        return this.jtwUtils.generateToken(entity.getUser(), entity.getRole(), String.valueOf((entity.getBaseId() != null) ? entity.getBaseId() : ""));
    }


    public UserResponse findByUsername(String username) {
        UserEntity entity = this.userRepository.findByUser(username);
        if (entity == null) {
            return null;
        }
        return UserMapper.toResponse(entity);
    }

    public UserResponse findById(Long id) {
        UserEntity entity = this.userRepository.findById(id).orElse(null);
        if (entity == null) {
            return null;
        }
        return UserMapper.toResponse(entity);
    }

    public List<UserResponse> findAll() {
        return this.userRepository.findAll().stream()
                .map(UserMapper::toResponse)
                .toList();
    }

    public List<UserResponse> findAllByBaseId(Long idBase) {
        return this.userRepository.findAllByBaseId(idBase).stream()
                .map(UserMapper::toResponse)
                .toList();
    }

    public void deleteById(Long id) {
        this.userRepository.deleteById(id);
    }

    public UserResponse updateUser(Long id, UserRequest request) {
        UserEntity entity = this.userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        String oldpass = entity.getPassword();


        if (!request.password().equals(oldpass) && request.role().equals(entity.getRole()) && request.baseId().equals(entity.getBaseId())) {
            System.out.println("New pass: " + request.password());
            System.out.println("Oldpass: " + oldpass);
            entity.setPassword(BCrypt.hashpw(request.password(), BCrypt.gensalt()));
        } else {
            entity.setPassword(oldpass);
        }
        BeanUtils.copyProperties(request, entity, "password");

        this.userRepository.save(entity);
        return UserMapper.toResponse(entity);
    }
}