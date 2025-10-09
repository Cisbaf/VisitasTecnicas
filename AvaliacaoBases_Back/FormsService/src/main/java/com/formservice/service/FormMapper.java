package com.formservice.service;

import com.formservice.entity.CamposFormEntity;
import com.formservice.entity.FormEntity;
import com.formservice.entity.Resposta;
import com.formservice.entity.dto.campos.CamposFormRequest;
import com.formservice.entity.dto.campos.CamposFormResponse;
import com.formservice.entity.dto.forms.FormRequest;
import com.formservice.entity.dto.forms.FormResponse;
import com.formservice.entity.dto.resposta.RespostaRequest;
import com.formservice.entity.dto.resposta.RespostaResponse;
import com.formservice.entity.emuns.CheckBox;
import com.formservice.entity.emuns.Tipo;
import com.formservice.entity.emuns.TipoForm;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
class FormMapper {

    FormResponse toFromResponse(FormEntity formEntity) {
        return new FormResponse(
                formEntity.getId(),
                formEntity.getCategoria(),
                formEntity.getSummaryId(),
                formEntity.getCampos(),
                formEntity.getTipoForm()
        );
    }

    FormEntity toFormEntity(FormRequest request) {
        FormEntity form = FormEntity.builder()
                .categoria(request.categoria())
                .summaryId(request.summaryId())
                .tipoForm(request.summaryId() == 2 ? TipoForm.PADRONIZACAO : TipoForm.INSPECAO)
                .build();

        if (form.getCampos() == null) {
            form.setCampos(new ArrayList<>());
        }

        List<CamposFormEntity> campos;
        if(request.campos() != null) {
            campos = request.campos().stream()
                    .map(c -> toCampoEntity(c, form))
                    .toList();
        } else {
            campos = List.of();
        }
        form.setCampos(campos);
        return form;
    }

    CamposFormResponse toCampoResponse(CamposFormEntity camposFormEntity) {
        return CamposFormResponse.builder()
                .formId(camposFormEntity.getForm().getId())
                .id(camposFormEntity.getId())
                .tipo(camposFormEntity.getTipo())
                .titulo(camposFormEntity.getTitulo())
                .build();
    }

    CamposFormEntity toCampoEntity(CamposFormRequest request, FormEntity formEntity) {

        return CamposFormEntity.builder()
                .titulo(request.titulo())
                .tipo(Tipo.valueOf(request.tipo()))
                .form(formEntity)
                .build();
    }
    RespostaResponse toRespostaResponse(Resposta entity) {
        try{
            return RespostaResponse.builder()
                    .texto(entity.getTexto() != null ? entity.getTexto() : "")
                    .visitaId(entity.getVisitaId())
                    .checkbox(entity.getCheckbox() != null ? entity.getCheckbox() : CheckBox.NOT_GIVEN)
                    .texto(entity.getTexto() != null ? entity.getTexto() : "")
                    .id(entity.getId())
                    .campoId(entity.getCampo().getId())
                    .build();
        }catch (Exception e){
            System.out.println(entity.toString());
            throw new IllegalArgumentException("Erro ao mapear Resposta entity para RespostaResponse: " + e.getMessage());
        }

    }
    Resposta toRespostaEntity(RespostaRequest request, CamposFormEntity campo) {
        return Resposta.builder()
                .texto(request.texto() != null ? request.texto() : "")
                .visitaId(request.visitaId())
                .checkbox(request.checkbox() != null ? request.checkbox() : CheckBox.NOT_GIVEN)
                .campo(campo)
                .build();
    }

}