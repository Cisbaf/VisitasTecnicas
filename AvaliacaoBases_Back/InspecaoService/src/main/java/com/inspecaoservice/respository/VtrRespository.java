package com.inspecaoservice.respository;

import com.inspecaoservice.entity.RelatorioVTR;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VtrRespository extends JpaRepository<RelatorioVTR, Long> {
    RelatorioVTR findByCidade(String cidade);
    void deleteAll();
}
