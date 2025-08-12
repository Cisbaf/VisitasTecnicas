package com.checklistitemservice.entity;

import com.checklistitemservice.config.RankingBasesConverter;
import com.checklistitemservice.entity.dto.BaseRankingDTO;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.Map;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class IndicadorOpEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long TIHs;
    @ElementCollection(fetch = FetchType.EAGER)
    Map<String, Integer> atendimentos;
    @Column(columnDefinition = "JSON")
    @Convert(converter = RankingBasesConverter.class)

    private List<BaseRankingDTO> rankingBases;
}
