package com.avaliacaoservice.auth.respository;

import com.avaliacaoservice.auth.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    boolean existsByUser(String paramString);

    UserEntity findByUser(String paramString);

    List<UserEntity> findAllByBaseId(Long paramLong);
}

