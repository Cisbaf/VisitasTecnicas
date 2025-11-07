package com.avaliacaoservice.base.repository;

import com.avaliacaoservice.base.entity.BaseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BaseRepository extends JpaRepository<BaseEntity, Long> {
  BaseEntity findByNomeContainingIgnoreCase(String paramString);
}


