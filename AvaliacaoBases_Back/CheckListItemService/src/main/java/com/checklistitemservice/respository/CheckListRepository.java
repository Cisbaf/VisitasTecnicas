package com.checklistitemservice.respository;

import com.checklistitemservice.entity.CheckListEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CheckListRepository extends JpaRepository<CheckListEntity, Long> {
    boolean existsByCategoria(String categoria);

    List<CheckListEntity> findAllByVisitaId(Long visitaId);
}
