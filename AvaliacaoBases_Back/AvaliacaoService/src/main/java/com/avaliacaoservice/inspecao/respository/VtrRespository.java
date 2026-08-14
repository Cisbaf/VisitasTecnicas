package com.avaliacaoservice.inspecao.respository;

import com.avaliacaoservice.inspecao.entity.RelatorioVTR;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface VtrRespository extends JpaRepository<RelatorioVTR, Long> {
  Optional<RelatorioVTR> findByCidade(String paramString);
  Optional<RelatorioVTR> findByCidadeAndDataVigencia(String cidade, LocalDate dataVigencia);
  List<RelatorioVTR> findByDataVigencia(LocalDate dataVigencia);
  void deleteByDataVigencia(LocalDate dataVigencia);
  
  void deleteAll();
}
