package com.inspecaoservice.respository;

import com.inspecaoservice.entity.CamposFormEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CamposFormRepository extends JpaRepository<CamposFormEntity, Long> {
}
