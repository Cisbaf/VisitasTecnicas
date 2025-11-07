package com.avaliacaoservice.inspecao.respository;

import com.avaliacaoservice.inspecao.entity.CidadeTempo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TempoRepository extends JpaRepository<CidadeTempo, Long> {
    CidadeTempo findByCidade(String paramString);
}