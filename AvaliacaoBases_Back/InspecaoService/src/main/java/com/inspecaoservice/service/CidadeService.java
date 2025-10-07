package com.inspecaoservice.service;

import com.inspecaoservice.entity.Saidas;
import com.inspecaoservice.entity.dto.CidadeProntidaoRequest;
import com.inspecaoservice.entity.dto.CidadeProntidaoResponse;
import com.inspecaoservice.entity.dto.CidadeTempoDTO;
import com.inspecaoservice.respository.ProtidaoRepository;
import com.inspecaoservice.respository.TempoRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Service
@AllArgsConstructor
public class CidadeService {
    private final ProtidaoRepository prontidaoRepository;
    private final TempoRepository tempoRepository;


    public List<CidadeProntidaoRequest> processarPlanilhaProntidao(List<CidadeProntidaoRequest> dados) {
        System.out.println("Inicio" + dados);
        try {
            for (var dado : dados) {
                System.out.println("Looping " + dado);
                var cidadeProntidao = prontidaoRepository.findByCidade(dado.getCidade());
                var saida = Saidas.builder().saidaEquipe(dado.getSaidaEquipe()).mesAno(dado.getMesAno()).build();
                if (cidadeProntidao != null) {
                    cidadeProntidao.getSaidas().add(saida);
                    prontidaoRepository.save(cidadeProntidao);
                } else {

                    List<Saidas> listaSaidas = new ArrayList<>();
                            listaSaidas.add(saida);
                    var novoCidadeProntidao = com.inspecaoservice.entity.CidadeProntidao.builder()
                            .cidade(dado.getCidade())
                            .saidas(listaSaidas)
                            .build();
                    prontidaoRepository.save(novoCidadeProntidao);
                }
            }
        }catch (Exception e){
            System.out.println(e.getMessage());
        }

        System.out.println("Fim" + dados);
        return dados;
    }

    public List<CidadeTempoDTO> processarPlanilhaTempos(List<CidadeTempoDTO> dados) {
        System.out.println(dados);

        for (var dado : dados) {
            var cidadeTempo = tempoRepository.findByCidade(dado.getCidade());
            if (cidadeTempo != null) {
                cidadeTempo.setTempoMinimo(dado.getTempoMinimo());
                cidadeTempo.setTempoMedio(dado.getTempoMedio());
                cidadeTempo.setTempoMaximo(dado.getTempoMaximo());
                tempoRepository.save(cidadeTempo);
            } else {
                var novoCidadeTempo = com.inspecaoservice.entity.CidadeTempo.builder()
                        .cidade(dado.getCidade())
                        .tempoMinimo(dado.getTempoMinimo())
                        .tempoMedio(dado.getTempoMedio())
                        .tempoMaximo(dado.getTempoMaximo())
                        .build();
                tempoRepository.save(novoCidadeTempo);
            }
        }

        return dados;
    }

    public List<CidadeTempoDTO> getAllCidadesTempo() {
        var cidadesTempo = tempoRepository.findAll();
        return cidadesTempo.stream().map(cidadeTempo -> CidadeTempoDTO.builder()
                .cidade(cidadeTempo.getCidade())
                .tempoMinimo(String.valueOf(cidadeTempo.getTempoMinimo()))
                .tempoMedio(String.valueOf(cidadeTempo.getTempoMedio()))
                .tempoMaximo(String.valueOf(cidadeTempo.getTempoMaximo()))
                .build()).toList();
    }
    public HashMap<String, String> getCidadesTempoMedia() {
        var cidadesTempo = tempoRepository.findAll();
        HashMap<String, String> mapaTempos = new HashMap<>();
        cidadesTempo.forEach(cidadeTempo ->
                mapaTempos.put(cidadeTempo.getCidade(), cidadeTempo.getTempoMedio())
        );
        return mapaTempos;
    }



    public List<CidadeProntidaoResponse> getAllCidadesProntidao() {
        var cidadesProntidao = prontidaoRepository.findAll();
        return cidadesProntidao.stream().map(cidadeProntidao -> CidadeProntidaoResponse.builder()
                .cidade(cidadeProntidao.getCidade())
                .saida(cidadeProntidao.getSaidas())
                .build()).toList();
    }
}
