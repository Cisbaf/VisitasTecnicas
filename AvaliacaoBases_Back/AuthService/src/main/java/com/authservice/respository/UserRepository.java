package com.authservice.respository;

import com.authservice.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<UserEntity,Long> {
    boolean existsByUser(String username);

    UserEntity findByUser(String username);

    List<UserEntity> findAllByBaseId(Long id);
}
