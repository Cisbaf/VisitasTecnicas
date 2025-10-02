package com.formservice.respository;

import com.formservice.entity.CamposFormEntity;
import com.formservice.entity.Resposta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RespostaRepository extends JpaRepository<Resposta, Long> {

    List<Resposta> findAllByVisitaIdAndCampo(Long visitaId, CamposFormEntity campo);

    Optional<Resposta> getByCampoAndVisitaId(CamposFormEntity campo, Long visitaId);

    List<Resposta> findAllByVisitaId(Long visitaId);

    void deleteAllByVisitaId(Long visitaId);
}
