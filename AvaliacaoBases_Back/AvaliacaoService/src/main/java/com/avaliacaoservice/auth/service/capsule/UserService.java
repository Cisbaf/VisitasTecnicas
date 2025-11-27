package com.avaliacaoservice.auth.service.capsule;

import com.avaliacaoservice.auth.entity.userDto.LoginRequest;
import com.avaliacaoservice.auth.entity.userDto.UserRequest;
import com.avaliacaoservice.auth.entity.userDto.UserResponse;
import java.util.List;

public interface UserService {
  boolean existsByUsername(String paramString);
  
  String register(UserRequest paramUserRequest);
  
  String login(LoginRequest paramLoginRequest);
  
  UserResponse findByUsername(String paramString);
  
  List<UserResponse> findAll();
  
  UserResponse findById(Long paramLong);
  
  List<UserResponse> findAllByBaseId(Long paramLong);
  
  void deleteById(Long paramLong);
  
  UserResponse updateUser(Long paramLong, UserRequest paramUserRequest);
}