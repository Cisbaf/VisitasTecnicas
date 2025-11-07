package com.avaliacaoservice.form.respository;

import com.avaliacaoservice.form.entity.CamposFormEntity;
import com.avaliacaoservice.form.entity.Resposta;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RespostaRepository extends JpaRepository<Resposta, Long> {
  List<Resposta> findAllByVisitaIdAndCampo(Long paramLong, CamposFormEntity paramCamposFormEntity);

  List<Resposta> findByCampoAndVisitaId(CamposFormEntity paramCamposFormEntity, Long paramLong);
  
  List<Resposta> findAllByVisitaId(Long paramLong);
  
  void deleteAllByVisitaId(Long paramLong);

}