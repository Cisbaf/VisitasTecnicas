package com.avaliacaoservice.relatorio.entity;

import com.avaliacaoservice.visita.entity.dto.relato.RelatoResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record DashboardResponse(
        ResumoVisitas resumo,
        List<PerBaseConformidade> perBaseConformidade,
        List<PadronizacaoBase> padronizacaoByBaseLastVisit,
        List<RelatoResponse> relatos
) {
    public record ResumoVisitas(
            int totalBasesVisitadas,
            List<String> municipiosVisitados,
            List<LocalDate> datasVisitas,
            List<String> equipeTecnica,
            List<EquipeTecnicaPorBase> equipeTecnicaPorBase,
            int totalInconformidades,
            double indiceAprovacao,
            double indiceInspecao,
            double indicePadronizacao,
            List<VisitaDetalhada> visitasDetalhadas,
            Map<Long, List<ConformidadeSummary>> conformidadePorSummary,
            Map<Long, List<CampoNaoConforme>> camposNaoConformes
    ) {
    }

    public record EquipeTecnicaPorBase(
            String baseNome,
            List<EquipePorData> equipePorData
    ) {
    }

    public record EquipePorData(
            LocalDate data,
            List<String> membros
    ) {
    }

    public record VisitaDetalhada(
            Long id,
            LocalDate data,
            String municipio,
            Long baseId,
            String baseNome,
            String tipo,
            String periodo,
            List<RelatoResponse> relatos
    ) {
    }

    public record ConformidadeSummary(
            Long summaryId,
            String summaryNome,
            double porcentagem,
            List<ConformidadeCategoria> categorias
    ) {
    }

    public record ConformidadeCategoria(
            String nome,
            int conforme,
            int total,
            double porcentagem
    ) {
    }

    public record CampoNaoConforme(
            Long id,
            String titulo
    ) {
    }

    public record PerBaseConformidade(
            Long id,
            String nome,
            double avg
    ) {
    }

    public record PadronizacaoBase(
            Long id,
            String name,
            double conforme,
            double parcial,
            double naoConforme,
            double naoAvaliado,
            int totalCount,
            String statusPrincipal,
            List<PadronizacaoCategoria> categorias
    ) {
    }

    public record PadronizacaoCategoria(
            String categoria,
            double conforme,
            double parcial,
            double naoConforme,
            double naoAvaliado,
            PadronizacaoRaw raw,
            int total,
            String status
    ) {
    }

    public record PadronizacaoRaw(
            int conforme,
            int parcial,
            int naoConforme,
            int naoAvaliado
    ) {
    }
}
