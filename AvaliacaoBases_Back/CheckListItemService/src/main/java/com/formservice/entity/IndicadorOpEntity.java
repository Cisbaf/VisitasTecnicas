package com.formservice.entity;

import jakarta.persistence.*;
import lombok.*;

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

}
