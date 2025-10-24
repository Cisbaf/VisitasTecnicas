package com.visitaservice.service.visita;

import com.visitaservice.entity.EquipeTecnica;
import com.visitaservice.entity.VisitaEntity;
import com.visitaservice.entity.dto.visita.VisitaRequest;
import com.visitaservice.entity.dto.visita.VisitaResponse;
import com.visitaservice.repository.VisitaRepository;
import com.visitaservice.service.capsule.VisitaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static com.visitaservice.service.visita.VisitaMapper.toResponse;

@Service
@RequiredArgsConstructor
public class VisitaServiceImp implements VisitaService {
    private final VisitaRepository visitaRepository;
    private final VisitaMapper mapper;
    private final IdBaseExists exists;
    private final DeleteRespostas deleteRespostas;
    private final String visitNotFoundMessage = "Visita não encontrada com esse id: ";


    @Override
    public VisitaResponse createVisita(VisitaRequest request) {
        if (exists.existsById(request.getIdBase())) {
            var visitaEntity = mapper.toEntity(request);
            var savedVisit = visitaRepository.save(visitaEntity);
            return toResponse(savedVisit);
        }
        throw new IllegalArgumentException("Base não existe: " + request.getIdBase());
    }

    public VisitaResponse addMembroToVisita(Long visitaId, EquipeTecnica membro) {
        var visita = visitaRepository.findById(visitaId)
                .orElseThrow(() -> new IllegalArgumentException(visitNotFoundMessage + visitaId));
        visita.getMembros().add(membro);
        visitaRepository.save(visita);
        return toResponse(visita);
    }
    public VisitaResponse removeMembroFromVisita(Long visitaId, EquipeTecnica membro) {
        var visita = visitaRepository.findById(visitaId)
                .orElseThrow(() -> new IllegalArgumentException(visitNotFoundMessage + visitaId));
        visita.getMembros().removeIf(Oldmembro -> Oldmembro.equals(membro));
        visitaRepository.save(visita);
        return toResponse(visita);
    }

    @Override
    public VisitaResponse getById(Long id) {
        var visit = visitaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(visitNotFoundMessage + id));
        return toResponse(visit);
    }

    @Override
    public List<VisitaResponse> getAll() {
        return visitaRepository.findAll().stream().map(VisitaMapper::toResponse).toList();
    }
    public List<VisitaResponse> getBaseByPeriod(Long idBase, LocalDate dataInicio, LocalDate dataFim) {
        if (exists.existsById(idBase)) {
            return visitaRepository.findAllByIdBaseAndDataVisitaBetween(idBase, dataInicio, dataFim)
                    .stream()
                    .map(VisitaMapper::toResponse)
                    .toList();
        }
        throw new IllegalArgumentException("Base não existe: " + idBase);
    }

    public List<VisitaResponse> getAllByPeriod(LocalDate dataInicio, LocalDate dataFim) {
        try{
            return visitaRepository.getByDataVisitaBetween( dataInicio, dataFim)
                    .stream()
                    .map(VisitaMapper::toResponse)
                    .toList();
        }catch (Exception e ){
            throw new IllegalArgumentException("Erro ao buscar visitas no período: " + e.getMessage());
        }
    }

    @Override
    public List<EquipeTecnica> getAllMembrosByVisitaId(Long visitaId) {
        return visitaRepository.findById(visitaId)
                .map(VisitaEntity::getMembros)
                .orElseThrow(() -> new IllegalArgumentException(visitNotFoundMessage + visitaId));
    }

    @Override
    public VisitaResponse updateVisita(Long id, VisitaRequest request) {
        if(existsVisitaById(id)) {
            var existingVisit = visitaRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException(visitNotFoundMessage + id));
            existingVisit.setIdBase(request.getIdBase());
            existingVisit.setDataVisita(request.getDataVisita());
            existingVisit.setMembros(request.getMembros());
            existingVisit.setTipoVisita(request.getTipoVisita());
            var updatedVisit = visitaRepository.save(existingVisit);
            return toResponse(updatedVisit);
        }
        throw new IllegalArgumentException(visitNotFoundMessage + request);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (existsVisitaById(id)) {
            visitaRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException(visitNotFoundMessage + id);
        }

    }
    @Transactional
    public void deleteAllByBaseId(Long idBase) {
        if (exists.existsById(idBase)) {
            var visitas = visitaRepository.findVisitaEntitiesByIdBase(idBase);
            visitas.forEach(visita -> deleteRespostas.deleteRespostasByVisitaId(visita.getId()));
            visitaRepository.deleteAll(visitas);
        } else {
            throw new IllegalArgumentException("Base não existe: " + idBase);
        }
    }

    @Override
    public Boolean existsVisitaById(Long id) {
        return visitaRepository.existsById(id);
    }

    @Override
    public List<VisitaResponse> getVisitaByIdBase(Long idBase) {
        if (exists.existsById(idBase)) {
            return visitaRepository.findVisitaEntitiesByIdBase(idBase)
                    .stream()
                    .map(VisitaMapper::toResponse)
                    .toList();
        }
        throw new IllegalArgumentException("Base não existe: " + idBase);
    }
}
