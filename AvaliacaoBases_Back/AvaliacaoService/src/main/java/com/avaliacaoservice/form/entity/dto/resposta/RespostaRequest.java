 package com.avaliacaoservice.form.entity.dto.resposta;
 
 import com.avaliacaoservice.form.entity.emuns.CheckBox;
 import jakarta.validation.constraints.NotNull;
 import jakarta.validation.constraints.Positive;
 import lombok.Builder;

 @Builder
 public  record RespostaRequest(
            String texto,
            CheckBox checkbox,
            @NotNull
            @Positive
            Long visitaId,
            Long campoId
 ) {

 }


