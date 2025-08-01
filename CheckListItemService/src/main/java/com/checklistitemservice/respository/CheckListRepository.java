package com.checklistitemservice.respository;

import com.checklistitemservice.entity.CheckListEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CheckListRepository extends JpaRepository<CheckListEntity, Long> {
}
