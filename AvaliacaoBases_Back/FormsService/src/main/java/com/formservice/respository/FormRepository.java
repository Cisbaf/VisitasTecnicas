package com.formservice.respository;

import com.formservice.entity.FormEntity;
import com.formservice.entity.emuns.TipoForm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FormRepository extends JpaRepository<FormEntity,Long> {
    List<FormEntity> findByTipoForm(TipoForm tipoForm);
}
