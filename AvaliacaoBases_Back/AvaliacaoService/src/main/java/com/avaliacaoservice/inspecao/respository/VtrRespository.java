package com.avaliacaoservice.inspecao.respository;

import com.avaliacaoservice.inspecao.entity.RelatorioVTR;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VtrRespository extends JpaRepository<RelatorioVTR, Long> {
  RelatorioVTR findByCidade(String paramString);
  
  void deleteAll();
}