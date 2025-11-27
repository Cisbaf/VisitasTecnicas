
package com.avaliacaoservice.inspecao.service;

import com.avaliacaoservice.inspecao.entity.*;
import com.avaliacaoservice.inspecao.entity.dto.*;
import com.avaliacaoservice.inspecao.respository.ProtidaoRepository;
import com.avaliacaoservice.inspecao.respository.TempoRepository;
import com.avaliacaoservice.inspecao.respository.VtrRespository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class CidadeService {

    private final ProtidaoRepository prontidaoRepository;
    private final TempoRepository tempoRepository;
    private final VtrRespository vtrRespository;


    public void processarPlanilhaProntidao(List<CidadeProntidaoRequest> dados) {
        this.prontidaoRepository.deleteAll();

        try {
            for (CidadeProntidaoRequest dado : dados) {
                CidadeProntidao cidadeProntidao = this.prontidaoRepository.findByCidade(dado.getCidade());
                Saidas saida = Saidas.builder().saidaEquipe(dado.getSaidaEquipe()).mesAno(dado.getMesAno()).build();
                if (cidadeProntidao != null) {
                    cidadeProntidao.getSaidas().clear();
                    cidadeProntidao.getSaidas().add(saida);
                    cidadeProntidao.setDataEnvio(LocalDate.now());
                    this.prontidaoRepository.save(cidadeProntidao);

                    continue;

                }
                List<Saidas> listaSaidas = new ArrayList<>();
                listaSaidas.add(saida);


                CidadeProntidao novoCidadeProntidao = CidadeProntidao.builder().cidade(dado.getCidade()).saidas(listaSaidas).dataEnvio(LocalDate.now()).build();
                this.prontidaoRepository.save(novoCidadeProntidao);

            }

        } catch (Exception e) {
            System.out.println(e.getMessage());

        }
    }


    public void processarPlanilhaTempos(List<CidadeTempoDTO> dados) {
        this.tempoRepository.deleteAll();
        for (CidadeTempoDTO dado : dados) {
            CidadeTempo cidadeTempo = this.tempoRepository.findByCidade(dado.getCidade());
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
                    .build();
            this.tempoRepository.save(novoCidadeTempo);

        }

    }


    public void processarPlanilhaVTR(List<VtrRequest> viaturasDoMunicipio) {
        if (viaturasDoMunicipio == null || viaturasDoMunicipio.isEmpty()) {
            return;
        }

        // Pegar o município da primeira viatura (todas são do mesmo município)
        String municipioNome = viaturasDoMunicipio.getFirst().getCidade();

        // Buscar ou criar o RelatorioVTR para este município
        RelatorioVTR relatorio = vtrRespository.findByCidade(municipioNome)
                .orElse(RelatorioVTR.builder()
                        .cidade(municipioNome)
                        .VTR(new ArrayList<>())
                        .build());

        // Converter VtrRequest para VTR e adicionar à lista
        List<VTR> vtrList = viaturasDoMunicipio.stream()
                .map(vtrReq -> VTR.builder()
                        .placa(vtrReq.getPlaca())
                        .CNES(vtrReq.getCNES())
                        .viatura(vtrReq.getViatura())
                        .ativa(vtrReq.getAtiva() != null ? vtrReq.getAtiva() : 0L)
                        .build())
                .toList();

        // Atualizar a lista de viaturas
        relatorio.setVTR(vtrList);

        // Salvar o relatório completo do município
        vtrRespository.save(relatorio);
    }


    public List<RelatorioVTR> getAllVTR() {
        var all = vtrRespository.findAll();
        return all.stream()
                .sorted((c1, c2) -> c1.getCidade().compareToIgnoreCase(c2.getCidade()))
                .toList();
    }


    public List<CidadeTempoDTO> getAllCidadesTempo() {
        List<CidadeTempo> cidadesTempo = this.tempoRepository.findAll();
        return cidadesTempo.stream().map(cidadeTempo -> CidadeTempoDTO.builder().cidade(cidadeTempo.getCidade()).tempoMinimo(String.valueOf(cidadeTempo.getTempoMinimo())).tempoMedio(String.valueOf(cidadeTempo.getTempoMedio())).tempoMaximo(String.valueOf(cidadeTempo.getTempoMaximo())).dataEnvio(cidadeTempo.getDataEnvio()).build())


                .toList();

    }


    public List<VtrMediaDto> getVtrMedia() {
        List<RelatorioVTR> relatorios = this.vtrRespository.findAll();

        // Agrupar todas as viaturas por município
        Map<String, List<VTR>> viaturasPorCidade = new HashMap<>();

        for (RelatorioVTR relatorio : relatorios) {
            String cidade = relatorio.getCidade();
            List<VTR> vtrs = relatorio.getVTR();

            if (vtrs == null || vtrs.isEmpty()) continue;

            // Cada RelatorioVTR tem apenas 1 viatura, pegamos a primeira
            VTR vtr = vtrs.getFirst();

            viaturasPorCidade.computeIfAbsent(cidade, k -> new ArrayList<>()).add(vtr);
        }

        Map<String, Double> mediaPorCidade = new HashMap<>();

        for (Map.Entry<String, List<VTR>> entry : viaturasPorCidade.entrySet()) {
            String cidade = entry.getKey();
            List<VTR> todasViaturas = entry.getValue();

            // Separar viaturas regulares
            List<VTR> regulares = todasViaturas.stream()
                    .filter(vtr -> vtr.viatura() != null && !vtr.viatura().toUpperCase().contains("RESERVA"))
                    .toList();

            if (regulares.isEmpty()) {
                mediaPorCidade.put(cidade, 0.0);
                continue;
            }

            // Somar as porcentagens de TODAS as viaturas (regulares + reservas)
            double somaPorcentagens = todasViaturas.stream()
                    .mapToDouble(vtr -> vtr.ativa() != null ? vtr.ativa() : 0.0)
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


    public HashMap<String, String> getCidadesTempoMedia() {
        List<CidadeTempo> cidadesTempo = this.tempoRepository.findAll();
        HashMap<String, String> mapaTempos = new HashMap<>();
        cidadesTempo.forEach(cidadeTempo -> mapaTempos.put(cidadeTempo.getCidade(), cidadeTempo.getTempoMedio()));


        return mapaTempos;

    }


    public List<CidadeProntidaoResponse> getAllCidadesProntidao() {
        List<CidadeProntidao> cidadesProntidao = this.prontidaoRepository.findAll();
        return cidadesProntidao.stream().
                map(cidadeProntidao ->
                        CidadeProntidaoResponse.builder()
                                .cidade(cidadeProntidao.getCidade())
                                .saida(cidadeProntidao.getSaidas())
                                .dataEnvio(cidadeProntidao.getDataEnvio())
                                .build())
                .toList();

    }

}