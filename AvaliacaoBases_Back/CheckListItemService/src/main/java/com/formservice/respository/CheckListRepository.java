package com.formservice.respository;

import com.formservice.entity.CheckListEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CheckListRepository extends JpaRepository<CheckListEntity, Long> {
    boolean existsByCategoria(String categoria);

}
