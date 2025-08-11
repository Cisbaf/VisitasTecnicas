package com.authservice.respository;

import com.authservice.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity,Long> {
    boolean existsByUser(String username);

    UserEntity findByUser(String username);
}
