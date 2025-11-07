
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

        System.out.println("Fim" + dados);

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


    public void processarPlanilhaVTR(List<VtrRequest> dados) {
        this.vtrRespository.deleteAll();
        List<RelatorioVTR> relatorios = new ArrayList<>();


        try {
            Map<String, VtrRequest> vtrsFiltradas = new HashMap<>();

            for (VtrRequest dado : dados) {
                if (dado.getPlaca() != null && dado.getCNES() != null && dado.getAtiva() != null && dado.getViatura() != null) {
                    String nomeViatura = dado.getViatura();


                    if (vtrsFiltradas.containsKey(nomeViatura)) {
                        VtrRequest vtrExistente = vtrsFiltradas.get(nomeViatura);
                        if (dado.getAtiva() > vtrExistente.getAtiva()) {
                            vtrsFiltradas.put(nomeViatura, dado);

                        }

                        continue;

                    }
                    vtrsFiltradas.put(nomeViatura, dado);

                }

            }


            for (VtrRequest dado : vtrsFiltradas.values()) {
                RelatorioVTR relatorioVtr = this.vtrRespository.findByCidade(dado.getCidade());


                VTR vtr = VTR.builder().ativa(dado.getAtiva()).CNES(dado.getCNES()).placa(dado.getPlaca()).viatura(dado.getViatura()).build();

                if (relatorioVtr != null) {
                    relatorioVtr.getVTR().add(vtr);
                    this.vtrRespository.save(relatorioVtr);
                    continue;

                }
                List<VTR> listaVtr = new ArrayList<>();
                listaVtr.add(vtr);


                RelatorioVTR novoRelatorioVrt = RelatorioVTR.builder().cidade(dado.getCidade()).VTR(listaVtr).dataEnvio(LocalDate.now()).build();
                relatorios.add(novoRelatorioVrt);

            }


            this.vtrRespository.saveAll(relatorios);
        } catch (Exception e) {
            System.out.println(e.getMessage());

        }

    }


    public List<RelatorioVTR> getAllVTR() {
        return this.vtrRespository.findAll();

    }


    public List<CidadeTempoDTO> getAllCidadesTempo() {
        List<CidadeTempo> cidadesTempo = this.tempoRepository.findAll();
        return cidadesTempo.stream().map(cidadeTempo -> CidadeTempoDTO.builder().cidade(cidadeTempo.getCidade()).tempoMinimo(String.valueOf(cidadeTempo.getTempoMinimo())).tempoMedio(String.valueOf(cidadeTempo.getTempoMedio())).tempoMaximo(String.valueOf(cidadeTempo.getTempoMaximo())).dataEnvio(cidadeTempo.getDataEnvio()).build())


                .toList();

    }


    public List<VtrMediaDto> getVtrMedia() {
        List<RelatorioVTR> relatorios = this.vtrRespository.findAll();

        Map<String, Double> mediaPorCidade = relatorios.stream()
                .filter(relatorio -> (relatorio.getVTR() != null))
                .flatMap(relatorio -> relatorio.getVTR().stream().map(vtr -> Map.entry(relatorio.getCidade(), vtr)))
                .filter(entry -> (entry.getValue() != null && entry.getValue().ativa() != null))
                .collect(Collectors.groupingBy(Map.Entry::getKey, Collectors.averagingLong(entry -> entry.getValue().ativa())));


        return mediaPorCidade.entrySet().stream()
                .map(entry ->
                        VtrMediaDto.builder()
                                .cidade(entry.getKey()).ativa(Math.round(entry.getValue() * 100.0D) / 100.0D)
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