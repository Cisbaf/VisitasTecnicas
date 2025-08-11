package com.checklistitemservice.entity.dto;

import java.io.Serializable;
import java.time.LocalDate;


public record BaseRankingDTO(
        String nomeBase,
        Long idBase,
        double mediaConformidade,
        LocalDate dataUltimaVisita,
        int posicaoRanking
) implements Serializable {
}