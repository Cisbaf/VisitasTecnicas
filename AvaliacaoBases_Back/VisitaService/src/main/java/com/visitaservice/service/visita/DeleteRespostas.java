package com.visitaservice.service.visita;


import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Service
@FeignClient(name = "form")
public interface DeleteRespostas {
    @DeleteMapping("/answers/visit/{visitaId}")
    void deleteRespostasByVisitaId(@PathVariable Long visitaId);
}