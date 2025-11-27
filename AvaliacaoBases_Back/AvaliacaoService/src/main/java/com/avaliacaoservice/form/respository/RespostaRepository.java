package com.avaliacaoservice.form.respository;

import com.avaliacaoservice.form.entity.CamposFormEntity;
import com.avaliacaoservice.form.entity.Resposta;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RespostaRepository extends JpaRepository<Resposta, Long> {
  List<Resposta> findAllByAndCampo(CamposFormEntity paramCamposFormEntity);

  List<Resposta> findAllByCampoIdIn(List<Long> paramList);

  List<Resposta> findByCampo(CamposFormEntity paramCamposFormEntity);

  void deleteAllByCampo(CamposFormEntity campo);

}