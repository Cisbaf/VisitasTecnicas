package com.arquivomidia.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class MidiasEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String tipoArquivo;
    private String url;
    private LocalDate dataUpload;
    private Long idVisita;
    private Long idInconformidade;
}
