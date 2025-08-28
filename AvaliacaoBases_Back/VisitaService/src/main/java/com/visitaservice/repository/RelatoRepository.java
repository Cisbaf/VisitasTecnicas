package com.visitaservice.repository;

import com.visitaservice.entity.RelatoEntity;
import com.visitaservice.entity.VisitaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RelatoRepository  extends JpaRepository<RelatoEntity, Long> {
    List<RelatoEntity> findAllByVisitas(VisitaEntity visitas);
    List<RelatoEntity> findAllByBaseId(Long baseId);
}
