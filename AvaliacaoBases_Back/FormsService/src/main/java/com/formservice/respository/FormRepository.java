package com.formservice.respository;

import com.formservice.entity.FormEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormRepository extends JpaRepository<FormEntity,Long> {
}
