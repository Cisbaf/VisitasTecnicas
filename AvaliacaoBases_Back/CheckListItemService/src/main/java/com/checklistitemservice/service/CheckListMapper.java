package com.checklistitemservice.service;

import com.checklistitemservice.entity.CheckDescription;
import com.checklistitemservice.entity.CheckListEntity;
import com.checklistitemservice.entity.dto.CheckDescriptionResponse;
import com.checklistitemservice.entity.dto.CheckListRequest;
import com.checklistitemservice.entity.dto.CheckListResponse;
import com.checklistitemservice.entity.enums.TipoConformidade;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
class CheckListMapper {

    public CheckListResponse toResponse(CheckListEntity entity) {
        if (entity == null) {
            return null;
        }
        return CheckListResponse.builder()
                .id(entity.getId())
                .categoria(entity.getCategoria())
                .descricao(toDescriptionResponseList(entity.getDescricao()))
                .build();
    }

    public List<CheckDescriptionResponse> toDescriptionResponseList(List<CheckDescription> entities) {
        if (entities == null) {
            return new ArrayList<>();
        }
        return entities.stream()
                .map(this::toDescriptionResponse)
                .collect(Collectors.toList());
    }

    private CheckDescriptionResponse toDescriptionResponse(CheckDescription entity) {
        if (entity == null) {
            return null;
        }
        return CheckDescriptionResponse.builder()
                .id(entity.getId())
                .descricao(entity.getDescricao())
                .conformidadePercent(entity.getConformidadePercent())
                .observacao(entity.getObservacao())
                .visitaId(entity.getVisitaId() != null ? entity.getVisitaId() : null)
                .tipoConformidade(entity.getTipoConformidade())
                .criticidade(entity.getCriticidade())
                .checklistId(entity.getChecklist() != null ? entity.getChecklist().getId() : null)
                .build();
    }

    CheckListEntity toEntity(CheckListRequest request) {
        if (request == null) {
            return null;
        }

        CheckListEntity parentEntity = CheckListEntity.builder()
                .categoria(request.categoria())
                .build();

        List<CheckDescription> childEntities = request.descricao().stream()
                .map(descRequest -> {
                    CheckDescription childEntity = CheckDescription.builder()
                            .descricao(descRequest.getDescricao())
                            .conformidadePercent(descRequest.getConformidadePercent())
                            .observacao(descRequest.getObservacao())
                            .criticidade(descRequest.getCriticidade())
                            .build();

                    // Lógica para definir TipoConformidade
                    if (childEntity.getConformidadePercent() <= 44) {
                        childEntity.setTipoConformidade(TipoConformidade.NAO_CONFORME);
                    } else if (childEntity.getConformidadePercent() >= 70) {
                        childEntity.setTipoConformidade(TipoConformidade.CONFORME);
                    } else {
                        childEntity.setTipoConformidade(TipoConformidade.PARCIAL);
                    }

                    childEntity.setChecklist(parentEntity);
                    return childEntity;
                })
                .collect(Collectors.toList());

        parentEntity.setDescricao(childEntities);
        return parentEntity;
    }
}