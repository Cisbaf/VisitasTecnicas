package com.visitaservice.service.relato;

import com.visitaservice.entity.RelatoEntity;
import com.visitaservice.entity.dto.relato.RelatoRequest;
import com.visitaservice.entity.dto.relato.RelatoResponse;
import com.visitaservice.repository.VisitaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RelatoMapper {
    private final VisitaRepository visitaRepository;

    protected RelatoEntity toEntity(RelatoRequest request) {
        var visita = visitaRepository.findById(request.id_visita()).orElseThrow(() -> new IllegalArgumentException("Visita não encontrada com o id: " + request.id_visita()));

        return RelatoEntity.builder()
                .autor(request.autor())
                .mensagem(request.mensagem())
                .tema(request.tema())
                .data(request.data())
                .visitas(visita)
                .build();
    }

    protected static RelatoResponse toResponse(RelatoEntity relato) {
        return RelatoResponse.builder()
                .autor(relato.getAutor())
                .mensagem(relato.getMensagem())
                .tema(relato.getTema())
                .data(relato.getData())
                .visitas(relato.getVisitas())
                .baseId(relato.getVisitas().getIdBase())
                .id(relato.getId())
                .build();
    }
}
