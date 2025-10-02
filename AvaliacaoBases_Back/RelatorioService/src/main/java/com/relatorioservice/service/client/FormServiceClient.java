package com.relatorioservice.service.client;

import com.relatorioservice.config.FeignClientConfig;
import com.relatorioservice.entity.fora.forms.dto.CamposFormResponse;
import com.relatorioservice.entity.fora.forms.dto.FormResponse;
import com.relatorioservice.entity.fora.forms.dto.RespostaResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "form", configuration = FeignClientConfig.class)
public interface FormServiceClient  {

    @GetMapping("/{id}")
    FormResponse getById(@PathVariable Long id);

    @GetMapping()
    List<FormResponse> getAll();

    @GetMapping("/answers/visit/{visitaId}")
    List<RespostaResponse> getRespostasByVisitaId(@PathVariable Long visitaId) ;

    @GetMapping("/answers")
    List<RespostaResponse> findRespostasByCampoAndVisita(@RequestParam Long campoId, @RequestParam Long visitId);

    @GetMapping("/field/{id}")
    CamposFormResponse findCampoById(@PathVariable Long id);
}
