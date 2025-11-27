package com.avaliacaoservice.inspecao.respository;

import com.avaliacaoservice.inspecao.entity.RelatorioVTR;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VtrRespository extends JpaRepository<RelatorioVTR, Long> {
  Optional<RelatorioVTR> findByCidade(String paramString);
  
  void deleteAll();
}