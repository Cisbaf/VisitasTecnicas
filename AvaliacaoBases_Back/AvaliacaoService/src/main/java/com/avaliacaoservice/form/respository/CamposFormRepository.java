package com.avaliacaoservice.form.respository;

import com.avaliacaoservice.form.entity.CamposFormEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CamposFormRepository extends JpaRepository<CamposFormEntity, Long> {

    List<CamposFormEntity> findByFormId(Long formId);
}

