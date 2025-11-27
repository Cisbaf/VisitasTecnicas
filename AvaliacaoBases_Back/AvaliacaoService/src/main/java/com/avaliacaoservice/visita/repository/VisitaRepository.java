package com.avaliacaoservice.visita.repository;

import com.avaliacaoservice.visita.entity.VisitaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface VisitaRepository extends JpaRepository<VisitaEntity, Long> {
    List<VisitaEntity> findAllByIdBaseAndDataVisitaBetween(Long paramLong, LocalDate paramLocalDate1, LocalDate paramLocalDate2);

    List<VisitaEntity> getByDataVisitaBetween(LocalDate paramLocalDate1, LocalDate paramLocalDate2);

    List<VisitaEntity> findVisitaEntitiesByIdBase(Long paramLong);
}

