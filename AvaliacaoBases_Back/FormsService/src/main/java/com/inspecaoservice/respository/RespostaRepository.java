package com.inspecaoservice.respository;

import com.inspecaoservice.entity.CamposFormEntity;
import com.inspecaoservice.entity.Resposta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RespostaRepository extends JpaRepository<Resposta, Long> {

    List<Resposta> findAllByVisitaIdAndCampo(Long visitaId, CamposFormEntity campo);

    Optional<Resposta> getByCampoAndVisitaId(CamposFormEntity campo, Long visitaId);

    List<Resposta> findAllByVisitaId(Long visitaId);

    void deleteAllByVisitaId(Long visitaId);
}
