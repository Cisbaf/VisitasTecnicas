package com.visitaservice.repository;

import com.visitaservice.entity.VisitaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface VisitaRepository extends JpaRepository<VisitaEntity, Long> {
    List<VisitaEntity> findAllByIdBaseAndDataVisitaBetween(Long idBase, LocalDate dataVisita, LocalDate dataVisita2);
}
