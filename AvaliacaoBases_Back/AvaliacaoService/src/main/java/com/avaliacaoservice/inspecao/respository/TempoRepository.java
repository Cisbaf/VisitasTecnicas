package com.avaliacaoservice.inspecao.respository;

import com.avaliacaoservice.inspecao.entity.CidadeTempo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TempoRepository extends JpaRepository<CidadeTempo, Long> {
    Optional<CidadeTempo> findByCidade(String paramString);
    Optional<CidadeTempo> findByCidadeAndDataVigencia(String cidade, LocalDate dataVigencia);
    List<CidadeTempo> findByDataVigencia(LocalDate dataVigencia);
    void deleteByDataVigencia(LocalDate dataVigencia);
}
