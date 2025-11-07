package com.avaliacaoservice.visita.service.visita;


import com.avaliacaoservice.base.service.capsule.BaseService;
import com.avaliacaoservice.form.service.capsule.RespostaService;
import com.avaliacaoservice.visita.entity.EquipeTecnica;
import com.avaliacaoservice.visita.entity.VisitaEntity;
import com.avaliacaoservice.visita.entity.dto.visita.VisitaRequest;
import com.avaliacaoservice.visita.entity.dto.visita.VisitaResponse;
import com.avaliacaoservice.visita.repository.VisitaRepository;
import com.avaliacaoservice.visita.service.capsule.VisitaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;


@Slf4j
@Service
@RequiredArgsConstructor
public class VisitaServiceImp implements VisitaService {
    private final VisitaRepository visitaRepository;
    private final BaseService exists;
    private final RespostaService deleteRespostas;

    @Override
    public VisitaResponse createVisita(VisitaRequest paramVisitaRequest) {
        return null;
    }


    public VisitaResponse addMembroToVisita(Long visitaId, EquipeTecnica membro) {

        VisitaEntity visita = this.visitaRepository.findById(visitaId).orElseThrow(() -> new IllegalArgumentException("Visita não encontrada com esse id: " + visitaId));

        membro.setVisita(visita);

        visita.getMembros().add(membro);

        this.visitaRepository.save(visita);

        return VisitaMapper.toResponse(visita);

    }

    public VisitaResponse removeMembroFromVisita(Long visitaId, EquipeTecnica membro) {

        VisitaEntity visita = this.visitaRepository.findById(visitaId).orElseThrow(() -> new IllegalArgumentException("Visita não encontrada com esse id: " + visitaId));

        visita.getMembros().removeIf(Old -> Old.getNome().equals(membro.getNome()) && Old.getCargo().equals(membro.getCargo()));

        this.visitaRepository.save(visita);

        return VisitaMapper.toResponse(visita);
    }


    public VisitaResponse getById(Long id) {

        VisitaEntity visit = this.visitaRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Visita não encontrada com esse id: " + id));

        return VisitaMapper.toResponse(visit);

    }


    public List<VisitaResponse> getAll() {

        return this.visitaRepository.findAll().stream().map(VisitaMapper::toResponse).toList();

    }


    public List<VisitaResponse> getBaseByPeriod(Long idBase, LocalDate dataInicio, LocalDate dataFim) {

        if (this.exists.existsById(idBase)) {

            return this.visitaRepository.findAllByIdBaseAndDataVisitaBetween(idBase, dataInicio, dataFim).stream().map(VisitaMapper::toResponse).toList();

        }

        throw new IllegalArgumentException("Base não existe: " + idBase);

    }


    public List<VisitaResponse> getAllByPeriod(LocalDate dataInicio, LocalDate dataFim) {

        try {

            return this.visitaRepository.getByDataVisitaBetween(dataInicio, dataFim).stream().map(VisitaMapper::toResponse).toList();

        } catch (Exception e) {

            throw new IllegalArgumentException("Erro ao buscar visitas no período: " + e.getMessage());

        }

    }


    public List<EquipeTecnica> getAllMembrosByVisitaId(Long visitaId) {

        return this.visitaRepository.findById(visitaId).map(VisitaEntity::getMembros).orElseThrow(() -> new IllegalArgumentException("Visita não encontrada com esse id: " + visitaId));

    }


    public VisitaResponse updateVisita(Long id, VisitaRequest request) {

        if (existsVisitaById(id)) {


            VisitaEntity existingVisit = this.visitaRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Visita não encontrada com esse id: " + id));
            existingVisit.setIdBase(request.getIdBase());

            existingVisit.setDataVisita(request.getDataVisita());

            existingVisit.setMembros(request.getMembros());

            existingVisit.setTipoVisita(request.getTipoVisita());

            VisitaEntity updatedVisit = this.visitaRepository.save(existingVisit);

            return VisitaMapper.toResponse(updatedVisit);

        }

        throw new IllegalArgumentException("Visita não encontrada com esse id: " + request);

    }


    @Transactional
    public void delete(Long id) {

        if (existsVisitaById(id)) {

            this.visitaRepository.deleteById(id);

        } else {
            throw new IllegalArgumentException("Visita não encontrada com esse id: " + id);

        }

    }


    @Transactional
    public void deleteAllByBaseId(Long idBase) {

        if (this.exists.existsById(idBase)) {

            List<VisitaEntity> visitas = this.visitaRepository.findVisitaEntitiesByIdBase(idBase);

            visitas.forEach(visita -> this.deleteRespostas.deleteRespostasByVisitaId(visita.getId()));

            this.visitaRepository.deleteAll(visitas);

        } else {

            throw new IllegalArgumentException("Base não existe: " + idBase);

        }

    }


    public Boolean existsVisitaById(Long id) {

        return this.visitaRepository.existsById(id);

    }


    public List<VisitaResponse> getVisitaByIdBase(Long idBase) {

        if (this.exists.existsById(idBase)) {

            return this.visitaRepository.findVisitaEntitiesByIdBase(idBase).stream().map(VisitaMapper::toResponse).toList();

        }

        throw new IllegalArgumentException("Base não existe: " + idBase);

    }

}
