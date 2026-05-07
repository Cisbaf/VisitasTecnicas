package com.avaliacaoservice.inspecao.respository;

import com.avaliacaoservice.inspecao.entity.CidadeProntidao;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ProtidaoRepository extends JpaRepository<CidadeProntidao, Long> {
    Optional<CidadeProntidao> findByCidade(String paramString);
    Optional<CidadeProntidao> findByCidadeAndDataVigencia(String cidade, LocalDate dataVigencia);
    List<CidadeProntidao> findByDataVigencia(LocalDate dataVigencia);

    // Novo método para buscar por um intervalo de datas (mês)
    @Query("SELECT c FROM CidadeProntidao c WHERE c.dataVigencia BETWEEN :startDate AND :endDate")
    List<CidadeProntidao> findByDataVigenciaBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}


