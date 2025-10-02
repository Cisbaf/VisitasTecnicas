package com.baseservice.repository;

import com.baseservice.entity.BaseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BaseRepository extends JpaRepository<BaseEntity, Long> {
    BaseEntity findByNomeContainingIgnoreCase(String nome);
}
