package com.checklistitemservice.respository;

import com.checklistitemservice.entity.CheckDescription;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CheckDescRepository extends JpaRepository<CheckDescription, Long> {
}
