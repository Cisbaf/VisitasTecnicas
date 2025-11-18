package com.avaliacaoservice.form.entity;

import com.avaliacaoservice.form.entity.emuns.Tipo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class CamposFormEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(columnDefinition = "TEXT")
    private String titulo;
    @Enumerated(EnumType.STRING)
    private Tipo tipo;

    @OneToMany(cascade = {CascadeType.ALL}, mappedBy = "campo", orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Resposta> resposta = new ArrayList<>();
    @ManyToOne
    @JoinColumn(name = "form_id")
    @JsonIgnore
    private FormEntity form;

}