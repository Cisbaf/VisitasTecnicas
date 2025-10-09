package com.inspecaoservice.service;

import com.inspecaoservice.entity.RelatorioVTR;
import com.inspecaoservice.entity.Saidas;
import com.inspecaoservice.entity.VTR;
import com.inspecaoservice.entity.dto.*;
import com.inspecaoservice.respository.ProtidaoRepository;
import com.inspecaoservice.respository.TempoRepository;
import com.inspecaoservice.respository.VtrRespository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@AllArgsConstructor
public class CidadeService {
    private final ProtidaoRepository prontidaoRepository;
    private final TempoRepository tempoRepository;
    private final VtrRespository vtrRespository;


    public void processarPlanilhaProntidao(List<CidadeProntidaoRequest> dados) {
        prontidaoRepository.deleteAll();
        try {
            for (var dado : dados) {
                var cidadeProntidao = prontidaoRepository.findByCidade(dado.getCidade());
                var saida = Saidas.builder().saidaEquipe(dado.getSaidaEquipe()).mesAno(dado.getMesAno()).build();
                if (cidadeProntidao != null) {
                    cidadeProntidao.getSaidas().clear();
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
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }

        System.out.println("Fim" + dados);
    }

    public void processarPlanilhaTempos(List<CidadeTempoDTO> dados) {
        tempoRepository.deleteAll();
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
    }

    public void processarPlanilhaVTR(List<VtrRequest> dados) {
        vtrRespository.deleteAll();
        List<RelatorioVTR> relatorios = new ArrayList<>();
        try {
            // Filtrar e manter apenas as VTRs com maior valor de "ativa" para cada viatura
            Map<String, VtrRequest> vtrsFiltradas = new HashMap<>();

            for (var dado : dados) {
                if (dado.getPlaca() != null && dado.getCNES() != null && dado.getAtiva() != null && dado.getViatura() != null) {
                    String nomeViatura = dado.getViatura();

                    // Se já existe uma viatura com esse nome, mantém a que tem maior valor de "ativa"
                    if (vtrsFiltradas.containsKey(nomeViatura)) {
                        VtrRequest vtrExistente = vtrsFiltradas.get(nomeViatura);
                        if (dado.getAtiva() > vtrExistente.getAtiva()) {
                            vtrsFiltradas.put(nomeViatura, dado);
                        }
                    } else {
                        // Primeira ocorrência desta viatura
                        vtrsFiltradas.put(nomeViatura, dado);
                    }
                }
            }

            // Agora processa apenas as VTRs filtradas
            for (var dado : vtrsFiltradas.values()) {
                var relatorioVtr = vtrRespository.findByCidade(dado.getCidade());
                var vtr = VTR.builder()
                        .ativa(dado.getAtiva())
                        .CNES(dado.getCNES())
                        .placa(dado.getPlaca())
                        .viatura(dado.getViatura())
                        .build();

                if (relatorioVtr != null) {
                    relatorioVtr.getVTR().add(vtr);
                    vtrRespository.save(relatorioVtr);
                } else {
                    List<VTR> listaVtr = new ArrayList<>();
                    listaVtr.add(vtr);
                    var novoRelatorioVrt = RelatorioVTR.builder()
                            .cidade(dado.getCidade())
                            .VTR(listaVtr)
                            .build();
                    relatorios.add(novoRelatorioVrt);
                }
            }

            vtrRespository.saveAll(relatorios);
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }
    public List<RelatorioVTR> getAllVTR() {
        return vtrRespository.findAll();
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
    public List<VtrMediaDto> getVtrMedia() {
        var relatorios = vtrRespository.findAll();
        var media = relatorios.stream().map(relatorio -> {
            var mediaAtiva = relatorio.getVTR().stream()
                    .collect(Collectors.averagingLong(VTR::ativa));

            return VtrMediaDto.builder()
                    .cidade(relatorio.getCidade())
                    .ativa(Math.round(mediaAtiva * 100.0) / 100.0)
                    .build();
        }).toList();

        log.info(media.toString());

        return media;
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
