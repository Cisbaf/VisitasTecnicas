package com.formservice.respository;

import com.formservice.entity.IndicadorOpEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IndicadorRepository extends JpaRepository<IndicadorOpEntity, Long> {
}
