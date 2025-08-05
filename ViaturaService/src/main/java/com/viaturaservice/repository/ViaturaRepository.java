package com.viaturaservice.repository;

import com.viaturaservice.entity.ViaturaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ViaturaRepository extends JpaRepository<ViaturaEntity, Long> {
    Optional<ViaturaEntity> findViaturaEntitiesByIdBase(Long idBase);
}
