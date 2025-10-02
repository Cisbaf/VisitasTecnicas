package com.formservice.respository;

import com.formservice.entity.CamposFormEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CamposFormRepository extends JpaRepository<CamposFormEntity, Long> {
}
