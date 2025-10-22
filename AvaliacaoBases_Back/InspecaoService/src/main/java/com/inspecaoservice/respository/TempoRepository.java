package com.inspecaoservice.respository;

import com.inspecaoservice.entity.CidadeTempo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TempoRepository extends JpaRepository<CidadeTempo, Long> {
    CidadeTempo findByCidade(String cidade);
}
