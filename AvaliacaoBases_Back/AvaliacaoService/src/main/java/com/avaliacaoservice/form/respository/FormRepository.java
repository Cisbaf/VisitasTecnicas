package com.avaliacaoservice.form.respository;

import com.avaliacaoservice.form.entity.FormEntity;
import com.avaliacaoservice.form.entity.emuns.TipoForm;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormRepository extends JpaRepository<FormEntity, Long> {
  List<FormEntity> findByTipoForm(TipoForm paramTipoForm);
}