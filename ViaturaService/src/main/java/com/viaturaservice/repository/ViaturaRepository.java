package com.viaturaservice.repository;

import com.viaturaservice.entity.ViaturaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ViaturaRepository extends JpaRepository<ViaturaEntity, Long> {
    List<ViaturaEntity> findAllByIdBase(Long idBase);
}
