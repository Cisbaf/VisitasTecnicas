package com.formservice.respository;

import com.formservice.entity.CheckDescription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CheckDescRepository extends JpaRepository<CheckDescription, Long> {
    List<CheckDescription> findAllByVisitaId(Long visitaId);
    List<CheckDescription> findAllByViaturaId(Long viaturaId);

}
