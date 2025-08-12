package com.avaliacaoservice.repository;

import com.avaliacaoservice.entity.AvaliacaoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AvaliacaoRepository extends JpaRepository<AvaliacaoEntity, Long> {
    List<AvaliacaoEntity> findByIdVisita(Long idVisita);

    boolean existsByIdVisitaAndIdCheckListAndIdViatura(Long idVisita, Long idCheckList, Long idViatura);
}
