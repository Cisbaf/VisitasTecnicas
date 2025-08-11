package com.checklistitemservice.respository;

import com.checklistitemservice.entity.IndicadorOpEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IndicadorRepository extends JpaRepository<IndicadorOpEntity, Long> {
}
