package com.inspecaoservice.respository;

import com.inspecaoservice.entity.CidadeProntidao;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProtidaoRepository extends JpaRepository<CidadeProntidao, Long> {
}
