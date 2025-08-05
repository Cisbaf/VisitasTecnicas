package com.checklistitemservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class CheckListEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String categoria;
    @ElementCollection(fetch = jakarta.persistence.FetchType.EAGER)
    private List<CheckDescription> descricao;
    private Long visitaId;
}
