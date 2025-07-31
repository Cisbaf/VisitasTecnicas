package com.visitaservice.repository;

import com.visitaservice.entity.VisitaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VisitaRepository extends JpaRepository<VisitaEntity, Long> {
}
