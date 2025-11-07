 package com.avaliacaoservice.visita.service.relato;
 import com.avaliacaoservice.visita.entity.RelatoEntity;
 import com.avaliacaoservice.visita.entity.VisitaEntity;
 import com.avaliacaoservice.visita.entity.dto.relato.RelatoRequest;
 import com.avaliacaoservice.visita.entity.dto.relato.RelatoResponse;
 import com.avaliacaoservice.visita.repository.VisitaRepository;
 import com.avaliacaoservice.visita.service.visita.VisitaMapper;
 import lombok.RequiredArgsConstructor;
 import org.springframework.stereotype.Service;

 @Service
 @RequiredArgsConstructor
 public class RelatoMapper {

   private final VisitaRepository visitaRepository;
   private final VisitaMapper visitaMapper;
   
   protected RelatoEntity toEntity(RelatoRequest request) {
     VisitaEntity visita = this.visitaRepository.findById(request.visitaId()).orElseThrow(() -> new IllegalArgumentException("Visita não encontrada com o id: " + request.visitaId()));
     
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
       .visitas(VisitaMapper.toResponse(relato.getVisitas()))
       .baseId(relato.getBaseId())
       .id(relato.getId())
       .build();
   }
 }


