package com.visitaservice.service.relato;

import com.visitaservice.entity.RelatoEntity;
import com.visitaservice.entity.dto.relato.RelatoRequest;
import com.visitaservice.entity.dto.relato.RelatoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RelatoMapper {

    protected RelatoEntity toEntity(RelatoRequest request) {
        return RelatoEntity.builder()
                .autor(request.autor())
                .mensagem(request.mensagem())
                .tema(request.tema())
                .data(request.data())
                .gestorResponsavel(request.gestorResponsavel())
                .visitas(request.visitas())
                .resolvido(request.resolvido())
                .build();
    }

    protected static RelatoResponse toResponse(RelatoEntity relato) {
        return RelatoResponse.builder()
                .autor(relato.getAutor())
                .mensagem(relato.getMensagem())
                .tema(relato.getTema())
                .gestorResponsavel(relato.getGestorResponsavel())
                .data(relato.getData())
                .resolvido(relato.getResolvido())
                .visitas(relato.getVisitas())
                .id(relato.getId())
                .build();
    }
}
