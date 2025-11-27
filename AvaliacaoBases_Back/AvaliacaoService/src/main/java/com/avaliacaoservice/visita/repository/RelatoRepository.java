package com.avaliacaoservice.visita.repository;

import com.avaliacaoservice.visita.entity.RelatoEntity;
import com.avaliacaoservice.visita.entity.VisitaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RelatoRepository extends JpaRepository<RelatoEntity, Long> {
    List<RelatoEntity> findAllByVisitas(VisitaEntity paramVisitaEntity);

    List<RelatoEntity> findAllByBaseId(Long paramLong);
}

