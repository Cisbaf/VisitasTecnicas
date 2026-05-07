package com.avaliacaoservice.inspecao.service;

import com.avaliacaoservice.inspecao.entity.CidadeProntidao;
import com.avaliacaoservice.inspecao.entity.CidadeTempo;
import com.avaliacaoservice.inspecao.entity.RelatorioVTR;
import com.avaliacaoservice.inspecao.entity.VTR;
import com.avaliacaoservice.inspecao.entity.dto.*;
import com.avaliacaoservice.inspecao.respository.ProtidaoRepository;
import com.avaliacaoservice.inspecao.respository.TempoRepository;
import com.avaliacaoservice.inspecao.respository.VtrRespository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CidadeService {

    private final ProtidaoRepository prontidaoRepository;
    private final TempoRepository tempoRepository;
    private final VtrRespository vtrRespository;

    public void processarPlanilhaProntidao(List<CidadeProntidaoRequest> dados) {
        try {
            for (CidadeProntidaoRequest dado : dados) {
                LocalDate dataVigencia = dado.getDataVigencia();
                CidadeProntidao cidadeProntidao = this.prontidaoRepository.findByCidadeAndDataVigencia(dado.getCidade(), dataVigencia).orElse(null);

                if (cidadeProntidao != null) {
                    cidadeProntidao.setDataEnvio(LocalDate.now());
                    this.prontidaoRepository.save(cidadeProntidao);
                    continue;
                }

                CidadeProntidao novoCidadeProntidao = CidadeProntidao.builder()
                        .cidade(dado.getCidade())
                        .dataEnvio(LocalDate.now())
                        .dataVigencia(dataVigencia)
                        .saidaEquipe(dado.getSaidaEquipe())
                        .build();
                this.prontidaoRepository.save(novoCidadeProntidao);
            }
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }

    public void processarPlanilhaTempos(List<CidadeTempoDTO> dados, LocalDate dataVigencia) {
        for (CidadeTempoDTO dado : dados) {
            CidadeTempo cidadeTempo = this.tempoRepository.findByCidadeAndDataVigencia(dado.getCidade(), dataVigencia).orElse(null);
            if (cidadeTempo != null) {
                cidadeTempo.setTempoMinimo(dado.getTempoMinimo());
                cidadeTempo.setTempoMedio(dado.getTempoMedio());
                cidadeTempo.setTempoMaximo(dado.getTempoMaximo());
                cidadeTempo.setDataEnvio(LocalDate.now());
                this.tempoRepository.save(cidadeTempo);
                continue;
            }

            CidadeTempo novoCidadeTempo = CidadeTempo.builder()
                    .cidade(dado.getCidade())
                    .tempoMinimo(dado.getTempoMinimo())
                    .tempoMedio(dado.getTempoMedio())
                    .tempoMaximo(dado.getTempoMaximo())
                    .dataEnvio(LocalDate.now())
                    .dataVigencia(dataVigencia)
                    .build();
            this.tempoRepository.save(novoCidadeTempo);
        }
    }

    public void processarPlanilhaVTR(List<VtrRequest> viaturasDoMunicipio, LocalDate dataVigencia) {
        if (viaturasDoMunicipio == null || viaturasDoMunicipio.isEmpty()) {
            return;
        }

        String municipioNome = viaturasDoMunicipio.getFirst().getCidade();

        RelatorioVTR relatorio = vtrRespository.findByCidadeAndDataVigencia(municipioNome, dataVigencia)
                .orElse(RelatorioVTR.builder()
                        .cidade(municipioNome)
                        .dataVigencia(dataVigencia)
                        .VTR(new ArrayList<>())
                        .build());

        List<VTR> vtrList = viaturasDoMunicipio.stream()
                .map(vtrReq -> VTR.builder()
                        .placa(vtrReq.getPlaca())
                        .CNES(vtrReq.getCNES())
                        .viatura(vtrReq.getViatura())
                        .ativa(vtrReq.getAtiva() != null ? vtrReq.getAtiva() : 0L)
                        .build())
                .toList();

        relatorio.setVTR(vtrList);
        relatorio.setDataEnvio(LocalDate.now());

        vtrRespository.save(relatorio);
    }

    public List<RelatorioVTR> getAllVTR(LocalDate mes) {
        // Se não passar o mês, pega o mês atual (forçando o dia 1 para bater com a vigência)
        if (mes == null) {
            mes = LocalDate.now().withDayOfMonth(1);
        }

        return vtrRespository.findByDataVigencia(mes).stream()
                .sorted((c1, c2) -> c1.getCidade().compareToIgnoreCase(c2.getCidade()))
                .toList();
    }

    public List<CidadeTempoDTO> getAllCidadesTempo(LocalDate mes) {
        if (mes == null) {
            mes = LocalDate.now().withDayOfMonth(1);
        }

        List<CidadeTempo> cidadesTempo = this.tempoRepository.findByDataVigencia(mes);

        return cidadesTempo.stream().map(cidadeTempo -> CidadeTempoDTO.builder()
                        .cidade(cidadeTempo.getCidade())
                        .tempoMinimo(String.valueOf(cidadeTempo.getTempoMinimo()))
                        .tempoMedio(String.valueOf(cidadeTempo.getTempoMedio()))
                        .tempoMaximo(String.valueOf(cidadeTempo.getTempoMaximo()))
                        .dataEnvio(cidadeTempo.getDataEnvio())
                        .dataVigencia(cidadeTempo.getDataVigencia())
                        .build())
                .toList();
    }

    public List<VtrMediaDto> getVtrMedia(LocalDate mes) {
        if (mes == null) {
            mes = LocalDate.now().withDayOfMonth(1);
        }

        List<RelatorioVTR> relatorios = this.vtrRespository.findByDataVigencia(mes);
        Map<String, List<VTR>> viaturasPorCidade = new HashMap<>();

        for (RelatorioVTR relatorio : relatorios) {
            String cidade = relatorio.getCidade();
            List<VTR> vtrs = relatorio.getVTR();

            if (vtrs == null || vtrs.isEmpty()) continue;

            viaturasPorCidade.computeIfAbsent(cidade, k -> new ArrayList<>()).addAll(vtrs);
        }

        Map<String, Double> mediaPorCidade = new HashMap<>();

        for (Map.Entry<String, List<VTR>> entry : viaturasPorCidade.entrySet()) {
            String cidade = entry.getKey();
            List<VTR> todasViaturas = entry.getValue();

            List<VTR> regulares = todasViaturas.stream()
                    .filter(vtr -> vtr.getViatura() != null && !vtr.getViatura().toUpperCase().contains("RESERVA"))
                    .toList();

            if (regulares.isEmpty()) {
                mediaPorCidade.put(cidade, 0.0);
                continue;
            }

            double somaPorcentagens = todasViaturas.stream()
                    .mapToDouble(vtr -> vtr.getAtiva() != null ? vtr.getAtiva() : 0.0)
                    .sum();

            double media = somaPorcentagens / regulares.size();

            mediaPorCidade.put(cidade, media);
        }

        return mediaPorCidade.entrySet().stream()
                .map(entry ->
                        VtrMediaDto.builder()
                                .cidade(entry.getKey())
                                .ativa(Math.round(entry.getValue() * 100.0) / 100.0)
                                .dataEnvio(LocalDate.now())
                                .build())
                .toList();
    }

    public HashMap<String, String> getCidadesTempoMedia(LocalDate mes) {
        if (mes == null) {
            mes = LocalDate.now().withDayOfMonth(1);
        }

        List<CidadeTempo> cidadesTempo = this.tempoRepository.findByDataVigencia(mes);
        HashMap<String, String> mapaTempos = new HashMap<>();

        cidadesTempo.forEach(cidadeTempo -> mapaTempos.put(cidadeTempo.getCidade(), cidadeTempo.getTempoMedio()));

        return mapaTempos;
    }

    public List<CidadeProntidaoResponse> getAllCidadesProntidao(LocalDate mes) {
        if (mes == null) {
            mes = LocalDate.now(); // Usa a data atual para determinar o mês
        }

        // Calcula o primeiro e o último dia do mês
        LocalDate startDate = mes.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endDate = mes.with(TemporalAdjusters.lastDayOfMonth());

        List<CidadeProntidao> cidadesProntidao = this.prontidaoRepository.findByDataVigenciaBetween(startDate, endDate);

        return cidadesProntidao.stream()
                .map(cidadeProntidao ->
                        CidadeProntidaoResponse.builder()
                                .cidade(cidadeProntidao.getCidade())
                                .dataEnvio(cidadeProntidao.getDataEnvio())
                                .saidaEquipe(cidadeProntidao.getSaidaEquipe())
                                .dataVigencia(cidadeProntidao.getDataVigencia())
                                .build())
                .toList();
    }
}