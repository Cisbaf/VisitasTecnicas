package com.avaliacaoservice.relatorio.service;

import com.avaliacaoservice.base.entity.BaseResponse;
import com.avaliacaoservice.base.service.capsule.BaseService;
import com.avaliacaoservice.form.entity.CamposFormEntity;
import com.avaliacaoservice.form.entity.dto.campos.CamposFormResponse;
import com.avaliacaoservice.form.entity.dto.forms.FormResponse;
import com.avaliacaoservice.form.entity.dto.resposta.RespostaResponse;
import com.avaliacaoservice.form.entity.emuns.CheckBox;
import com.avaliacaoservice.form.entity.emuns.Tipo;
import com.avaliacaoservice.form.entity.emuns.TipoForm;
import com.avaliacaoservice.form.service.capsule.FormService;
import com.avaliacaoservice.form.service.capsule.RespostaService;
import com.avaliacaoservice.relatorio.entity.DashboardResponse;
import com.avaliacaoservice.visita.entity.dto.relato.RelatoResponse;
import com.avaliacaoservice.visita.entity.dto.visita.VisitaResponse;
import com.avaliacaoservice.visita.service.capsule.RelatoService;
import com.avaliacaoservice.visita.service.capsule.VisitaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final BaseService baseService;
    private final VisitaService visitaService;
    private final FormService formService;
    private final RespostaService respostaService;
    private final RelatoService relatoService;
    private final CalcularPontos calcularPontos;

    private record ChecklistCounts(int conforme, int parcial, int naoConforme, int naoAvaliado) {
        int total() {
            return conforme + parcial + naoConforme + naoAvaliado;
        }
    }

    public DashboardResponse gerarDashboard(LocalDate dataInicio, LocalDate dataFim, Long idBase) {
        List<BaseResponse> bases = buscarBases(idBase);
        List<VisitaResponse> visitasValidas = buscarVisitasValidas(dataInicio, dataFim, idBase);
        List<FormResponse> forms = Optional.ofNullable(formService.getAll()).orElse(List.of());
        List<RespostaResponse> respostas = buscarRespostas(visitasValidas);
        List<RelatoResponse> relatos = buscarRelatos(dataInicio, dataFim, idBase);

        Map<Long, List<VisitaResponse>> visitasPorBase = agruparPorBase(visitasValidas);
        Map<Long, List<FormResponse>> formsPorVisita = agruparFormsPorVisita(forms);
        Map<Long, List<RespostaResponse>> respostasPorVisita = agruparRespostasPorVisita(respostas);
        Map<Long, List<RelatoResponse>> relatosPorVisita = agruparRelatosPorVisita(relatos);

        DashboardAccumulator acc = new DashboardAccumulator();

        for (BaseResponse base : bases) {
            processarBase(base, visitasPorBase, formsPorVisita, respostasPorVisita, relatosPorVisita, acc);
        }

        return montarResposta(acc, relatos);
    }

    private List<BaseResponse> buscarBases(Long idBase) {
        return Optional.ofNullable(baseService.getAll()).orElse(List.of()).stream()
                .filter(base -> idBase == null || Objects.equals(base.id(), idBase))
                .toList();
    }

    private List<VisitaResponse> buscarVisitasValidas(LocalDate dataInicio, LocalDate dataFim, Long idBase) {
        List<VisitaResponse> visitasPeriodo = (idBase == null)
                ? Optional.ofNullable(visitaService.getAllByPeriod(dataInicio, dataFim)).orElse(List.of())
                : Optional.ofNullable(visitaService.getBaseByPeriod(idBase, dataInicio, dataFim)).orElse(List.of());

        return visitasPeriodo.stream()
                .filter(this::isVisitaInspecao)
                .sorted(Comparator.comparing(VisitaResponse::dataVisita, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    private List<RespostaResponse> buscarRespostas(List<VisitaResponse> visitas) {
        List<Long> visitaIds = visitas.stream()
                .map(VisitaResponse::id)
                .filter(Objects::nonNull)
                .toList();

        if (visitaIds.isEmpty()) {
            return List.of();
        }

        return Optional.ofNullable(respostaService.getRespostasByVisitaId(visitaIds)).orElse(List.of());
    }

    private List<RelatoResponse> buscarRelatos(LocalDate dataInicio, LocalDate dataFim, Long idBase) {
        return Optional.ofNullable(relatoService.getAll()).orElse(List.of()).stream()
                .filter(relato -> relato.data() != null)
                .filter(relato -> !relato.data().toInstant().atZone(ZoneId.systemDefault()).toLocalDate().isBefore(dataInicio))
                .filter(relato -> !relato.data().toInstant().atZone(ZoneId.systemDefault()).toLocalDate().isAfter(dataFim))
                .filter(relato -> idBase == null || Objects.equals(relato.baseId(), idBase))
                .toList();
    }

    private Map<Long, List<VisitaResponse>> agruparPorBase(List<VisitaResponse> visitas) {
        return visitas.stream()
                .filter(visita -> visita.idBase() != null)
                .collect(Collectors.groupingBy(VisitaResponse::idBase));
    }

    private Map<Long, List<FormResponse>> agruparFormsPorVisita(List<FormResponse> forms) {
        return forms.stream()
                .filter(form -> form.visitaId() != null)
                .collect(Collectors.groupingBy(FormResponse::visitaId));
    }

    private Map<Long, List<RespostaResponse>> agruparRespostasPorVisita(List<RespostaResponse> respostas) {
        return respostas.stream()
                .filter(resposta -> resposta.visitaId() != null)
                .filter(resposta -> resposta.checkbox() != CheckBox.NOT_GIVEN)
                .collect(Collectors.groupingBy(RespostaResponse::visitaId));
    }

    private Map<Long, List<RelatoResponse>> agruparRelatosPorVisita(List<RelatoResponse> relatos) {
        return relatos.stream()
                .filter(relato -> relato.visitaId() != null)
                .collect(Collectors.groupingBy(RelatoResponse::visitaId));
    }

    private void processarBase(
            BaseResponse base,
            Map<Long, List<VisitaResponse>> visitasPorBase,
            Map<Long, List<FormResponse>> formsPorVisita,
            Map<Long, List<RespostaResponse>> respostasPorVisita,
            Map<Long, List<RelatoResponse>> relatosPorVisita,
            DashboardAccumulator acc
    ) {
        List<VisitaResponse> visitasDaBase = visitasPorBase.getOrDefault(base.id(), List.of());

        if (!visitasDaBase.isEmpty()) {
            acc.totalBasesVisitadas++;
            acc.municipiosVisitados.add(base.nome());
        }

        addVisitasDetalhadas(base, visitasDaBase, relatosPorVisita, acc);
        addEquipe(base, visitasDaBase, acc);

        VisitaResponse ultimaVisita = ultimaVisitaComInspecao(visitasDaBase, formsPorVisita);
        if (ultimaVisita == null) {
            return;
        }

        List<FormResponse> formsUltimaVisita = formsPorVisita.getOrDefault(ultimaVisita.id(), List.of());
        List<RespostaResponse> respostasUltimaVisita = respostasPorVisita.getOrDefault(ultimaVisita.id(), List.of());

        processarInspecao(base, ultimaVisita, formsUltimaVisita, respostasUltimaVisita, acc);
        montarPadronizacao(base, formsUltimaVisita, respostasUltimaVisita).ifPresent(acc.padronizacao::add);
    }

    private void addVisitasDetalhadas(
            BaseResponse base,
            List<VisitaResponse> visitasDaBase,
            Map<Long, List<RelatoResponse>> relatosPorVisita,
            DashboardAccumulator acc
    ) {
        visitasDaBase.forEach(visita -> {
            if (visita.dataVisita() != null) {
                acc.datasVisitas.add(visita.dataVisita());
            }
            acc.visitasDetalhadas.add(new DashboardResponse.VisitaDetalhada(
                    visita.id(),
                    visita.dataVisita(),
                    base.nome(),
                    base.id(),
                    base.nome(),
                    visita.tipoVisita(),
                    "entre",
                    relatosPorVisita.getOrDefault(visita.id(), List.of())
            ));
        });
    }

    private void processarInspecao(
            BaseResponse base,
            VisitaResponse ultimaVisita,
            List<FormResponse> formsUltimaVisita,
            List<RespostaResponse> respostasUltimaVisita,
            DashboardAccumulator acc
    ) {
        List<FormResponse> inspecaoForms = formsUltimaVisita.stream()
                .filter(form -> form.tipoForm() == TipoForm.INSPECAO)
                .toList();
        CalcularPontos.ResultadosHierarquicos resultados = calcularPontos.calcularConformidadeHierarquica(inspecaoForms, respostasUltimaVisita, ultimaVisita);

        acc.perBase.add(new DashboardResponse.PerBaseConformidade(base.id(), base.nome(), arredondar(resultados.geral.porcentagem)));

        List<DashboardResponse.ConformidadeSummary> summaries = montarConformidadePorSummary(inspecaoForms, resultados);
        if (!summaries.isEmpty()) {
            acc.conformidadePorSummary.put(base.id(), summaries);
        }

        List<RespostaResponse> respostasForaConformidade = respostasUltimaVisita.stream()
                .filter(resposta -> resposta.checkbox() == CheckBox.FALSE)
                .toList();
        List<CamposFormResponse> campos = respostasForaConformidade.isEmpty()
                ? List.of()
                : respostaService.getCampoByResposta(respostasForaConformidade);

        if (!campos.isEmpty()) {
            acc.camposNaoConformes.put(base.id(), campos.stream()
                    .map(campo -> new DashboardResponse.CampoNaoConforme(campo.id(), campo.titulo()))
                    .toList());
        }
    }

    private VisitaResponse ultimaVisitaComInspecao(List<VisitaResponse> visitasDaBase, Map<Long, List<FormResponse>> formsPorVisita) {
        return visitasDaBase.stream()
                .filter(visita -> formsPorVisita.getOrDefault(visita.id(), List.of()).stream()
                        .anyMatch(form -> form.tipoForm() == TipoForm.INSPECAO))
                .max(Comparator.comparing(VisitaResponse::dataVisita).thenComparing(VisitaResponse::id))
                .orElse(null);
    }

    private DashboardResponse montarResposta(DashboardAccumulator acc, List<RelatoResponse> relatos) {
        double indiceInspecao = media(acc.perBase.stream().map(DashboardResponse.PerBaseConformidade::avg).toList());
        double indicePadronizacao = media(acc.padronizacao.stream().map(DashboardResponse.PadronizacaoBase::conforme).toList());
        List<Double> indicesDisponiveis = new ArrayList<>();
        if (!acc.perBase.isEmpty()) {
            indicesDisponiveis.add(indiceInspecao);
        }
        if (!acc.padronizacao.isEmpty()) {
            indicesDisponiveis.add(indicePadronizacao);
        }
        double indiceAprovacao = media(indicesDisponiveis);
        int totalInconformidades = acc.camposNaoConformes.values().stream().mapToInt(List::size).sum();

        DashboardResponse.ResumoVisitas resumo = new DashboardResponse.ResumoVisitas(
                acc.totalBasesVisitadas,
                new ArrayList<>(acc.municipiosVisitados),
                new ArrayList<>(acc.datasVisitas),
                new ArrayList<>(acc.equipeTecnica),
                acc.equipesPorBase,
                totalInconformidades,
                arredondar(indiceAprovacao),
                arredondar(indiceInspecao),
                arredondar(indicePadronizacao),
                acc.visitasDetalhadas.stream()
                        .sorted(Comparator.comparing(DashboardResponse.VisitaDetalhada::data, Comparator.nullsLast(Comparator.naturalOrder())))
                        .toList(),
                acc.conformidadePorSummary,
                acc.camposNaoConformes
        );

        return new DashboardResponse(resumo, acc.perBase, acc.padronizacao, relatos);
    }

    private List<DashboardResponse.ConformidadeSummary> montarConformidadePorSummary(List<FormResponse> forms, CalcularPontos.ResultadosHierarquicos resultados) {
        List<DashboardResponse.ConformidadeSummary> summaries = new ArrayList<>();

        for (Map.Entry<Long, CalcularPontos.ResultadosHierarquicos.PorSummary> entry : resultados.porSummary.entrySet()) {
            Long summaryId = entry.getKey();
            List<DashboardResponse.ConformidadeCategoria> categorias = forms.stream()
                    .filter(form -> Objects.equals(form.summaryId(), summaryId))
                    .map(form -> {
                        CalcularPontos.ResultadosHierarquicos.PorFormulario formData = resultados.porFormulario.get(form.id());
                        return new DashboardResponse.ConformidadeCategoria(
                                form.categoria() != null ? form.categoria() : "Form " + form.id(),
                                formData != null ? formData.conforme : 0,
                                formData != null ? formData.total : 0,
                                formData != null ? arredondar(formData.porcentagem) : 0
                        );
                    })
                    .collect(Collectors.collectingAndThen(
                            Collectors.toMap(DashboardResponse.ConformidadeCategoria::nome, Function.identity(), (a, b) -> a, LinkedHashMap::new),
                            map -> new ArrayList<>(map.values())
                    ));

            if (!categorias.isEmpty()) {
                summaries.add(new DashboardResponse.ConformidadeSummary(
                        summaryId,
                        summaryNome(summaryId),
                        arredondar(entry.getValue().porcentagem),
                        categorias
                ));
            }
        }

        return summaries;
    }

    private Optional<DashboardResponse.PadronizacaoBase> montarPadronizacao(BaseResponse base, List<FormResponse> formsUltimaVisita, List<RespostaResponse> respostasUltimaVisita) {
        List<FormResponse> formsPadronizacao = formsUltimaVisita.stream()
                .filter(form -> form.tipoForm() == TipoForm.PADRONIZACAO)
                .toList();

        if (formsPadronizacao.isEmpty()) {
            return Optional.empty();
        }

        Map<String, ChecklistCounts> contagemPorCategoria = new LinkedHashMap<>();

        for (FormResponse form : formsPadronizacao) {
            String categoria = Optional.ofNullable(form.categoria()).orElse("Sem categoria");
            ChecklistCounts atual = contagemPorCategoria.getOrDefault(categoria, new ChecklistCounts(0, 0, 0, 0));

            for (CamposFormEntity campo : Optional.ofNullable(form.campos()).orElse(List.of())) {
                if (campo.getId() == null || campo.getTipo() != Tipo.CHECKBOX) {
                    continue;
                }

                RespostaResponse resposta = respostasUltimaVisita.stream()
                        .filter(r -> Objects.equals(r.campoId(), campo.getId()))
                        .findFirst()
                        .orElse(null);
                atual = incrementar(atual, resposta);
            }

            contagemPorCategoria.put(categoria, atual);
        }

        ChecklistCounts total = contagemPorCategoria.values().stream()
                .reduce(new ChecklistCounts(0, 0, 0, 0), (a, b) -> new ChecklistCounts(
                        a.conforme() + b.conforme(),
                        a.parcial() + b.parcial(),
                        a.naoConforme() + b.naoConforme(),
                        a.naoAvaliado() + b.naoAvaliado()
                ));

        if (total.total() == 0) {
            return Optional.empty();
        }

        List<DashboardResponse.PadronizacaoCategoria> categorias = contagemPorCategoria.entrySet().stream()
                .map(entry -> montarPadronizacaoCategoria(entry.getKey(), entry.getValue()))
                .toList();

        double conforme = percentual(total.conforme(), total.total());
        double parcial = percentual(total.parcial(), total.total());
        double naoConforme = percentual(total.naoConforme(), total.total());
        double naoAvaliado = percentual(total.naoAvaliado(), total.total());

        return Optional.of(new DashboardResponse.PadronizacaoBase(
                base.id(),
                base.nome(),
                conforme,
                parcial,
                naoConforme,
                naoAvaliado,
                total.total(),
                statusPrincipal(conforme, parcial, naoConforme, naoAvaliado),
                categorias
        ));
    }

    private DashboardResponse.PadronizacaoCategoria montarPadronizacaoCategoria(String nome, ChecklistCounts counts) {
        int total = counts.total();
        double conforme = percentual(counts.conforme(), total);
        double parcial = percentual(counts.parcial(), total);
        double naoConforme = percentual(counts.naoConforme(), total);
        double naoAvaliado = percentual(counts.naoAvaliado(), total);

        return new DashboardResponse.PadronizacaoCategoria(
                nome,
                conforme,
                parcial,
                naoConforme,
                naoAvaliado,
                new DashboardResponse.PadronizacaoRaw(counts.conforme(), counts.parcial(), counts.naoConforme(), counts.naoAvaliado()),
                total,
                statusPrincipal(conforme, parcial, naoConforme, naoAvaliado)
        );
    }

    private ChecklistCounts incrementar(ChecklistCounts counts, RespostaResponse resposta) {
        if (resposta == null || resposta.checkbox() == null || resposta.checkbox() == CheckBox.NOT_GIVEN) {
            return new ChecklistCounts(counts.conforme(), counts.parcial(), counts.naoConforme(), counts.naoAvaliado() + 1);
        }

        if (resposta.checkbox() == CheckBox.TRUE) {
            return new ChecklistCounts(counts.conforme() + 1, counts.parcial(), counts.naoConforme(), counts.naoAvaliado());
        }

        return new ChecklistCounts(counts.conforme(), counts.parcial(), counts.naoConforme() + 1, counts.naoAvaliado());
    }

    private void addEquipe(BaseResponse base, List<VisitaResponse> visitasDaBase, DashboardAccumulator acc) {
        List<DashboardResponse.EquipePorData> equipePorData = visitasDaBase.stream()
                .filter(visita -> visita.membros() != null && !visita.membros().isEmpty())
                .sorted(Comparator.comparing(VisitaResponse::dataVisita, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(visita -> new DashboardResponse.EquipePorData(
                        visita.dataVisita(),
                        visita.membros().stream()
                                .filter(membro -> membro.nome() != null && !membro.nome().isBlank())
                                .filter(membro -> !Set.of("COORDENADOR MÉDICO", "COORDENADOR ADM", "RT DE ENFERMAGEM").contains(membro.cargo()))
                                .map(membro -> membro.cargo() == null ? membro.nome().trim() : membro.nome().trim() + " (" + membro.cargo() + ")")
                                .distinct()
                                .toList()
                ))
                .filter(grupo -> !grupo.membros().isEmpty())
                .toList();

        equipePorData.forEach(grupo -> acc.equipeTecnica.addAll(grupo.membros()));
        if (!equipePorData.isEmpty()) {
            acc.equipesPorBase.add(new DashboardResponse.EquipeTecnicaPorBase(base.nome(), equipePorData));
        }
    }

    private boolean isVisitaInspecao(VisitaResponse visita) {
        if (visita == null || visita.id() == null || visita.idBase() == null || visita.dataVisita() == null) {
            return false;
        }
        String tipo = visita.tipoVisita();
        return tipo == null || tipo.isBlank() || tipo.toUpperCase(Locale.forLanguageTag("pt-BR")).contains("INSPE");
    }

    private String summaryNome(Long summaryId) {
        if (summaryId == null) return "Summary";
        return switch (summaryId.intValue()) {
            case 1 -> "MANUTENÇÃO DA PADRONIZAÇÃO DA ESTRUTURA FÍSICA DA BASE DESCENTRALIZADA";
            case 2 -> "PADRONIZAÇÃO VISUAL DOS UNIFORMES DAS EQUIPES E DA BASE DESCENTRALIZADA";
            case 4 -> "CONDIÇÕES DE FUNCIONAMENTO DO SERVIÇO";
            case 5 -> "CHECKLIST DAS UNIDADES MÓVEIS";
            case 6 -> "GERAL";
            default -> "Summary " + summaryId;
        };
    }

    private String statusPrincipal(double conforme, double parcial, double naoConforme, double naoAvaliado) {
        if (naoAvaliado > 0 && conforme == 0 && parcial == 0 && naoConforme == 0) return "NAO_AVALIADO";
        if (naoConforme == 100) return "NAO_CONFORME";
        if (conforme == 100) return "CONFORME";
        if (parcial == 100) return "PARCIAL";
        if (naoConforme > 20) return "NAO_CONFORME";
        if (naoConforme > 0 || parcial > 0) return "PARCIAL";
        if (conforme > 0) return "CONFORME";
        return "NAO_AVALIADO";
    }

    private double percentual(int valor, int total) {
        return total > 0 ? arredondar((valor / (double) total) * 100.0D) : 0.0D;
    }

    private double media(List<Double> valores) {
        return valores.stream()
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0D);
    }

    private double arredondar(double valor) {
        return Math.round(valor * 100.0D) / 100.0D;
    }

    private static final class DashboardAccumulator {
        private final List<DashboardResponse.PerBaseConformidade> perBase = new ArrayList<>();
        private final List<DashboardResponse.PadronizacaoBase> padronizacao = new ArrayList<>();
        private final List<DashboardResponse.EquipeTecnicaPorBase> equipesPorBase = new ArrayList<>();
        private final List<DashboardResponse.VisitaDetalhada> visitasDetalhadas = new ArrayList<>();
        private final Map<Long, List<DashboardResponse.ConformidadeSummary>> conformidadePorSummary = new LinkedHashMap<>();
        private final Map<Long, List<DashboardResponse.CampoNaoConforme>> camposNaoConformes = new LinkedHashMap<>();
        private final Set<String> municipiosVisitados = new LinkedHashSet<>();
        private final Set<LocalDate> datasVisitas = new TreeSet<>();
        private final Set<String> equipeTecnica = new LinkedHashSet<>();
        private int totalBasesVisitadas;
    }
}
