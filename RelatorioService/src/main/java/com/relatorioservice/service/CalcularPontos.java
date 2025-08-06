package com.relatorioservice.service;

import com.relatorioservice.entity.fora.Visita.RelatoEntity;
import com.relatorioservice.entity.fora.checklist.CheckDescription;
import com.relatorioservice.entity.fora.checklist.CheckListEntity;
import com.relatorioservice.entity.fora.viatura.Itens;
import com.relatorioservice.entity.fora.viatura.ViaturaEntity;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

class CalcularPontos {

    protected static List<String> calcularPontosFortes(List<CheckListEntity> checklists,
                                                       List<ViaturaEntity> viaturas,
                                                       List<RelatoEntity> relatos) {

        List<String> pontos = new ArrayList<>();

        Optional.ofNullable(checklists).orElse(List.of()).stream()
                .filter(cl -> !cl.getDescricao().isEmpty())
                .max(Comparator.comparingDouble(cl ->
                        cl.getDescricao().stream()
                                .mapToDouble(CheckDescription::getConformidadePercent)
                                .average()
                                .orElse(0.0)
                ))
                .ifPresent(cl -> {
                    double media = cl.getDescricao().stream()
                            .mapToDouble(CheckDescription::getConformidadePercent)
                            .average()
                            .orElse(0.0);
                    pontos.add(String.format("Melhor categoria: %s (%.1f%%)", cl.getCategoria(), media));
                });

        Optional.ofNullable(checklists).orElse(List.of()).stream()
                .flatMap(cl -> cl.getDescricao().stream())
                .max(Comparator.comparingDouble(CheckDescription::getConformidadePercent))
                .ifPresent(item ->
                        pontos.add(String.format("Melhor item: %s %d)", item.getDescricao(), item.getConformidadePercent()))
                );

        Optional.ofNullable(viaturas).orElse(List.of()).stream()
                .filter(v -> !v.getItens().isEmpty())
                .max(Comparator.comparingDouble(v ->
                        v.getItens().stream()
                                .mapToDouble(Itens::getConformidade)
                                .average()
                                .orElse(0.0)
                ))
                .ifPresent(v -> {
                    double media = v.getItens().stream()
                            .mapToDouble(Itens::getConformidade)
                            .average()
                            .orElse(0.0);
                    pontos.add(String.format("Melhor viatura: %s (%.1f%%)", v.getPlaca(), media));
                });

        Optional.ofNullable(viaturas).orElse(List.of()).stream()
                .flatMap(v -> v.getItens().stream())
                .max(Comparator.comparingInt(Itens::getConformidade))
                .ifPresent(item ->
                        pontos.add(String.format("Melhor equipamento: %s (%d%%)", item.getNome(), item.getConformidade()))
                );


        long relatosResolvidos = Optional.ofNullable(relatos).orElse(List.of()).stream()
                .filter(RelatoEntity::getResolvido)
                .count();

        if (relatosResolvidos > 0) {
            pontos.add(relatosResolvidos + " relatos resolvidos");
        }

        return pontos.isEmpty() ?
                List.of("Nenhum destaque identificado") : pontos;
    }

    protected static List<String> calcularPontosCriticos(List<CheckListEntity> checklists,
                                                         List<RelatoEntity> relatos,
                                                         List<ViaturaEntity> viaturas) {

        List<String> criticos = new ArrayList<>();

        Optional.ofNullable(checklists).orElse(List.of()).stream()
                .filter(cl -> !cl.getDescricao().isEmpty())
                .min(Comparator.comparingDouble(cl ->
                        cl.getDescricao().stream()
                                .mapToDouble(CheckDescription::getConformidadePercent)
                                .average()
                                .orElse(100.0)
                ))
                .ifPresent(cl -> {
                    double media = cl.getDescricao().stream()
                            .mapToDouble(CheckDescription::getConformidadePercent)
                            .average()
                            .orElse(0.0);
                    criticos.add(String.format("Pior categoria: %s (%.1f%%)", cl.getCategoria(), media));
                });

        Optional.ofNullable(checklists).orElse(List.of()).stream()
                .flatMap(cl -> cl.getDescricao().stream())
                .min(Comparator.comparingDouble(CheckDescription::getConformidadePercent))
                .ifPresent(item ->
                        criticos.add(String.format("Pior item: %s %d)", item.getDescricao(), item.getConformidadePercent()))
                );

        Optional.ofNullable(viaturas).orElse(List.of()).stream()
                .filter(v -> !v.getItens().isEmpty())
                .min(Comparator.comparingDouble(v ->
                        v.getItens().stream()
                                .mapToDouble(Itens::getConformidade)
                                .average()
                                .orElse(100.0)
                ))
                .ifPresent(v -> {
                    double media = v.getItens().stream()
                            .mapToDouble(Itens::getConformidade)
                            .average()
                            .orElse(0.0);
                    criticos.add(String.format("Pior viatura: %s (%.1f%%)", v.getPlaca(), media));
                });

        Optional.ofNullable(viaturas).orElse(List.of()).stream()
                .flatMap(v -> v.getItens().stream())
                .min(Comparator.comparingInt(Itens::getConformidade))
                .ifPresent(item ->
                        criticos.add(String.format("Pior equipamento: %s (%d%%)", item.getNome(), item.getConformidade()))
                );

        long relatosNaoResolvidos = Optional.ofNullable(relatos).orElse(List.of()).stream()
                .filter(r -> !r.getResolvido())
                .count();

        if (relatosNaoResolvidos > 0) {
            criticos.add(relatosNaoResolvidos + " relatos pendentes");
        }

        return criticos.isEmpty() ?
                List.of("Nenhum ponto crítico identificado") : criticos;
    }
}

