package com.avaliacaoservice.form.entity;

import com.avaliacaoservice.form.entity.emuns.CheckBox;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Resposta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String texto;

    @Enumerated(EnumType.STRING)
    private CheckBox checkbox;
    @ManyToOne(cascade = {CascadeType.ALL}, fetch = FetchType.EAGER)
    @JsonIgnore
    private CamposFormEntity campo;


}

