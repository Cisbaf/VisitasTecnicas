package com.inspecaoservice.respository;

import com.inspecaoservice.entity.FormEntity;
import com.inspecaoservice.entity.emuns.TipoForm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FormRepository extends JpaRepository<FormEntity,Long> {
    List<FormEntity> findByTipoForm(TipoForm tipoForm);
}
