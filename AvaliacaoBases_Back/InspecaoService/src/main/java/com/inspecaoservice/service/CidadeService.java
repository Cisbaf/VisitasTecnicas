package com.inspecaoservice.service;

import com.inspecaoservice.entity.dto.CidadeProntidaoDTO;
import com.inspecaoservice.entity.dto.CidadeTempoDTO;
import com.inspecaoservice.respository.ProtidaoRepository;
import com.inspecaoservice.respository.TempoRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class CidadeService {
    private final ProtidaoRepository prontidaoRepository;
    private final TempoRepository tempoRepository;


    public List<CidadeProntidaoDTO> processarPlanilhaProntidao(List<CidadeProntidaoDTO> dados) {
        System.out.println(dados);
        


        return null;
    }

    public List<CidadeTempoDTO> processarPlanilhaTempos(List<CidadeTempoDTO> dados) {
        System.out.println(dados);

        for (var dado: dados){
            var cidadeTempo = tempoRepository.findByCidade(dado.getCidade());
            if (cidadeTempo != null){
                cidadeTempo.setTempoMinimo(Integer.parseInt(dado.getTempoMinimo()));
                cidadeTempo.setTempoMedio(Double.parseDouble(dado.getTempoMedio()));
                cidadeTempo.setTempoMaximo(Integer.parseInt(dado.getTempoMaximo()));
                tempoRepository.save(cidadeTempo);
            } else {
                var novoCidadeTempo = com.inspecaoservice.entity.CidadeTempo.builder()
                        .cidade(dado.getCidade())
                        .tempoMinimo(Integer.parseInt(dado.getTempoMinimo()))
                        .tempoMedio(Double.parseDouble(dado.getTempoMedio()))
                        .tempoMaximo(Integer.parseInt(dado.getTempoMaximo()))
                        .build();
                tempoRepository.save(novoCidadeTempo);
            }
        }

        return dados;
    }
}
