package com.avaliacaoservice.relatorio.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BaseRankingDTO {
    private String nomeBase;
    private Long idBase;
    private double mediaConformidade;
    private LocalDate dataUltimaVisita;
    private int posicaoRanking;
    private Double porcentagemVtrAtiva;
    private String tempoMedioProntidao;
    private String tempoMedioAtendimento;
    private Double score;

    public BaseRankingDTO(String nomeBase, Long idBase, double mediaConformidade, LocalDate dataUltimaVisita) {
        this.nomeBase = nomeBase;
        this.idBase = idBase;
        this.mediaConformidade = mediaConformidade;
        this.dataUltimaVisita = dataUltimaVisita;
    }
}