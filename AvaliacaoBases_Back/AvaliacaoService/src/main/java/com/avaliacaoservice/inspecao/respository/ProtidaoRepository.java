package com.avaliacaoservice.inspecao.respository;

import com.avaliacaoservice.inspecao.entity.CidadeProntidao;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProtidaoRepository extends JpaRepository<CidadeProntidao, Long> {
    CidadeProntidao findByCidade(String paramString);
}


