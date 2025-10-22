package com.relatorioservice.entity.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BaseRankingDTO implements Comparable<BaseRankingDTO> {
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

    @Override
    public int compareTo(BaseRankingDTO outra) {
        if (this.score != null && outra != null && outra.getScore() != null) {
            return Double.compare(outra.getScore(), this.score);
        }
        return Double.compare(outra.mediaConformidade, this.mediaConformidade);
    }
}