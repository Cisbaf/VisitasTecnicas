package com.checklistitemservice.service;

import com.checklistitemservice.entity.CheckDescription;
import com.checklistitemservice.entity.dto.CheckListRequest;
import com.checklistitemservice.entity.enums.TipoConformidade;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class TestDataUtil {

    public static CheckDescription createCheckDescription(String descricao, int percent, com.checklistitemservice.entity.enums.TipoConformidade tipo, String observacao) {
        return CheckDescription.builder()
                .descricao(descricao)
                .conformidadePercent(percent)
                .tipoConformidade(tipo)
                .observacao(observacao)
                .build();
    }

    public static CheckListRequest createValidRequest() {
        return new CheckListRequest(
                "Segurança",
                Arrays.asList(
                        createCheckDescription("Verificar extintores", 100, TipoConformidade.CONFORME, "OK"),
                        createCheckDescription("Checar saídas de emergência", 50, TipoConformidade.PARCIAL, "Falta sinalização")
                )
        );
    }

    public static CheckListRequest createInvalidRequest() {
        return new CheckListRequest(
                "",  // categoria inválida
                null // descricao inválida
        );
    }

    public static List<CheckListRequest> createValidRequests() {
        return Arrays.asList(
                createValidRequest(),
                new CheckListRequest(
                        "Limpeza",
                        Collections.singletonList(
                                createCheckDescription("Verificar piso", 100, TipoConformidade.CONFORME, "Limpo")
                        )
                )
        );
    }
}