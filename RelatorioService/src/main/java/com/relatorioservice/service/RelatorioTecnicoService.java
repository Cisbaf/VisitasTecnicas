package com.relatorioservice.service;

import com.relatorioservice.entity.dtos.*;
import com.relatorioservice.entity.fora.Visita.EquipeTecnica;
import com.relatorioservice.entity.fora.Visita.RelatoEntity;
import com.relatorioservice.entity.fora.Visita.VisitaEntity;
import com.relatorioservice.entity.fora.base.BaseEntity;
import com.relatorioservice.entity.fora.checklist.AvaliacaoEntity;
import com.relatorioservice.entity.fora.checklist.CheckDescription;
import com.relatorioservice.entity.fora.checklist.CheckListEntity;
import com.relatorioservice.entity.fora.checklist.enums.Criticidade;
import com.relatorioservice.entity.fora.checklist.enums.TipoConformidade;
import com.relatorioservice.entity.fora.viatura.ViaturaEntity;
import com.relatorioservice.service.client.BaseServiceClient;
import com.relatorioservice.service.client.ChecklistServiceClient;
import com.relatorioservice.service.client.ViaturaServiceClient;
import com.relatorioservice.service.client.VisitaServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RelatorioTecnicoService {

    private final BaseServiceClient baseService;
    private final VisitaServiceClient visitaService;
    private final ChecklistServiceClient checklistService;
    private final ViaturaServiceClient viaturaService;

    public RelatorioTecnicoResponse gerarRelatorio(Long visitaId) {
        // 1. Obter dados básicos
        VisitaEntity visita = visitaService.getVisitaById(visitaId);
        BaseEntity base = baseService.getBaseById(visita.getIdBase());

        // 2. Obter dados relacionados
        List<EquipeTecnica> equipe = visitaService.getAllMembrosByVisitaId(visitaId);
        List<RelatoEntity> relatos = visitaService.getRelatosByVisita(visitaId);
        List<ViaturaEntity> viaturas = viaturaService.getViaturasByBase(base.getId());

        // 3. Obter checklists e avaliações
        List<CheckListEntity> checklists = checklistService.findByVisitaId(visitaId);
        List<AvaliacaoEntity> avaliacoes = checklistService.getAvaliacoesByVisita(visitaId);

        // 4. Processar dados
        return processarRelatorio(visita, base, equipe, relatos, viaturas, checklists, avaliacoes);
    }

    private RelatorioTecnicoResponse processarRelatorio(VisitaEntity visita,
                                                        BaseEntity base,
                                                        List<EquipeTecnica> equipe,
                                                        List<RelatoEntity> relatos,
                                                        List<ViaturaEntity> viaturas,
                                                        List<CheckListEntity> checklists,
                                                        List<AvaliacaoEntity> avaliacoes) {

        RelatorioTecnicoResponse relatorio = new RelatorioTecnicoResponse();

        // Mapeamento básico
        relatorio.setVisitaId(visita.getId());
        relatorio.setDataVisita(visita.getDataVisita());
        relatorio.setBaseNome(base.getNome());
        relatorio.setMunicipio(base.getEndereco()); // Exemplo simples

        // Processar equipe
        relatorio.setEquipe(equipe.stream()
                .map(m -> new MembroDTO(m.getNome(), m.getCargo()))
                .collect(Collectors.toList()));

        // Cálculos principais
        relatorio.setPontosFortes(calcularPontosFortes(checklists, viaturas));
        relatorio.setPontosCriticos(calcularPontosCriticos(checklists, relatos, viaturas));
        relatorio.setConformidades(calcularConformidades(checklists, avaliacoes));

        // Detalhamentos
        relatorio.setViaturas(processarViaturas(viaturas));
        relatorio.setRelatos(processarRelatos(relatos));

        return relatorio;
    }


    private List<String> calcularPontosFortes(List<CheckListEntity> checklists,
                                              List<ViaturaEntity> viaturas) {
        List<String> pontos = new ArrayList<>();

        checklists.stream()
                .filter(cl -> cl.getDescricao().stream()
                        .allMatch(d -> d.getTipoConformidade() == TipoConformidade.CONFORME))
                .findFirst()
                .ifPresent(cl -> pontos.add("Checklist 100% conforme: " + cl.getCategoria()));

        // 2. Verificar viaturas com equipamentos perfeitos
        viaturas.stream()
                .filter(v -> v.getItens().stream()
                        .allMatch(i -> i.getConformidade() == 100))
                .findFirst()
                .ifPresent(v -> pontos.add("Viatura com equipamentos 100% conformes: " + v.getPlaca()));

        return pontos.isEmpty() ?
                List.of("Desempenho satisfatório em todas as áreas") : pontos;
    }

    private List<String> calcularPontosCriticos(List<CheckListEntity> checklists,
                                                List<RelatoEntity> relatos,
                                                List<ViaturaEntity> viaturas) {

        List<String> criticos = new ArrayList<>();

        // 1. Itens de checklist não conformes com alta criticidade
        checklists.forEach(cl -> cl.getDescricao().stream()
                .filter(d -> d.getTipoConformidade() == TipoConformidade.NAO_CONFORME &&
                        d.getCriticidade() == Criticidade.ALTA)
                .findFirst()
                .ifPresent(d -> criticos.add("Item crítico: " + d.getDescricao())));

        // 2. Equipamentos de viaturas com baixa conformidade
        viaturas.forEach(v -> v.getItens().stream()
                .filter(i -> i.getConformidade() < 70)
                .findFirst()
                .ifPresent(i -> criticos.add("Equipamento problemático: " + i.getNome() +
                        " na viatura " + v.getPlaca())));

        // 3. Relatos não resolvidos
        relatos.stream()
                .filter(r -> !r.getResolvido())
                .findFirst()
                .ifPresent(r -> criticos.add("Relato pendente: " + r.getTema()));

        return criticos.isEmpty() ?
                List.of("Nenhum ponto crítico identificado") : criticos;
    }

    private Map<String, Double> calcularConformidades(List<CheckListEntity> checklists,
                                                      List<AvaliacaoEntity> avaliacoes) {

        Map<String, Double> conformidades = new HashMap<>();

        // Conformidade geral por categoria
        checklists.forEach(cl -> {
            double percentual = cl.getDescricao().stream()
                    .mapToDouble(d -> {
                        if(d.getTipoConformidade() == null) return 0.0;
                        return switch(d.getTipoConformidade()) {
                            case CONFORME -> 1.0;
                            case PARCIAL -> 0.5;
                            case NAO_CONFORME -> 0.0;
                        };
                    })
                    .average()
                    .orElse(0.0) * 100;

            conformidades.put(cl.getCategoria(), percentual);
        });

        // Conformidade das viaturas (via avaliações)
        avaliacoes.stream()
                .filter(a -> a.getIdViatura() != null)
                .collect(Collectors.groupingBy(
                        a -> viaturaService.getViaturaById(a.getIdViatura()).getPlaca(),
                        Collectors.averagingDouble((a) -> {
                            var check = checklistService.getCheckListById(a.getIdCheckList());
                            return check.getDescricao().stream()
                                    .mapToDouble(CheckDescription::getConformidadePercent)
                                    .average()
                                    .orElse(0.0);
                        })
                ))
                .forEach((placa, percentual) ->
                        conformidades.put("Viatura " + placa, percentual));

        return conformidades;
    }

    private List<ViaturaDTO> processarViaturas(List<ViaturaEntity> viaturas) {
        return viaturas.stream().map(v -> {
            ViaturaDTO dto = new ViaturaDTO();
            dto.setPlaca(v.getPlaca());
            dto.setModelo(v.getModelo());
            dto.setStatus(v.getStatusOperacional());

            // Itens críticos
            dto.setItensCriticos(v.getItens().stream()
                    .filter(i -> i.getConformidade() < 80)
                    .map(i -> new ItemViaturaDTO(i.getNome(), i.getConformidade()))
                    .collect(Collectors.toList()));

            return dto;
        }).collect(Collectors.toList());
    }

    private List<RelatoDTO> processarRelatos(List<RelatoEntity> relatos) {
        return relatos.stream()
                .filter(r -> !r.getResolvido() || r.getData().after(Date.from(Instant.now().minus(7, ChronoUnit.DAYS))))
                .map(r -> new RelatoDTO(r.getTema(), r.getMensagem(), r.getResolvido()))
                .collect(Collectors.toList());
    }
}