package com.viaturaservice.repository;

import com.viaturaservice.entity.ViaturaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ViaturaRepository extends JpaRepository<ViaturaEntity, Long> {
}
