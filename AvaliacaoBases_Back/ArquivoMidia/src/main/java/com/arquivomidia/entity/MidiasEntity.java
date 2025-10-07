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
    @Enumerated(EnumType.STRING)
    private TipoMidia tipoArquivo;
    private String caminhoArquivo;
    private LocalDate dataUpload;
    private Long idVisita;
    private String flag;

}
