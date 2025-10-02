package com.viaturaservice.service;

import com.viaturaservice.entity.ViaturaEntity;
import com.viaturaservice.entity.ViaturaRequest;
import com.viaturaservice.entity.ViaturaResponse;
import com.viaturaservice.entity.dto.VeiculoDto;
import com.viaturaservice.repository.ViaturaRepository;
import com.viaturaservice.service.capsule.RegistroApiService;
import com.viaturaservice.service.capsule.ViaturaService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static com.viaturaservice.service.ViaturaMapper.toDTO;

@Service
@RequiredArgsConstructor
public class ViaturaServiceImp implements ViaturaService {
    private final ViaturaRepository viaturaRepository;
    private final ViaturaMapper mapper;
    private final RegistroApiService registroApiService;

    public ViaturaResponse createViatura(ViaturaRequest viaturaRequest) {
        try {
            ViaturaEntity entity = mapper.toEntity(viaturaRequest);
            entity.setDataInclusao(LocalDate.now());
            ViaturaEntity savedEntity = viaturaRepository.save(entity);
            return toDTO(savedEntity);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Erro ao criar viatura: " + e.getMessage(), e);
        }
    }

    public ViaturaResponse getViaturaById(Long id) {

        return viaturaRepository.findById(id)
                .map(ViaturaMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Viatura não encontrada."));
    }

    @Override
    public List<ViaturaResponse> getAllViaturasByIdBase(Long idBase) {
        return viaturaRepository.findAllByIdBase(idBase).stream()
                .map(ViaturaMapper::toDTO).toList();
    }

    public VeiculoDto getVeiculoFromApi(String placa) {
        var veiculo = registroApiService.getVeiculos(placa);
        if (veiculo != null && veiculo.getIdentificacao() != null) {
            return new VeiculoDto(
                    veiculo.getIdentificacao(),
                    veiculo.getPreenchimentos(),
                    veiculo.getKM()
            );
        }
        return new VeiculoDto(
                "Veículo não encontrado",
                new ArrayList<>(),
                "0"
        );
    }

    @Override
    public boolean existsViaturaById(Long id) {
        return viaturaRepository.existsById(id);
    }

    public List<ViaturaResponse> getAllViaturas() {
        return viaturaRepository.findAll().stream()
                .map(ViaturaMapper::toDTO)
                .collect(Collectors.toList());
    }

    public ViaturaResponse updateViatura(Long id, ViaturaRequest viaturaRequest) {
        var viatura = viaturaRepository.findById(id).orElseThrow(() -> new RuntimeException("Viatura inexistente."));
        ViaturaEntity entity = mapper.toEntity(viaturaRequest);
        entity.setId(id);
        entity.setDataInclusao(viatura.getDataInclusao());

        ViaturaEntity updatedEntity = viaturaRepository.save(entity);
        return toDTO(updatedEntity);
    }

    @Transactional
    public void deleteViatura(Long id) {
        if (!viaturaRepository.existsById(id)) {
            throw new RuntimeException("Viatura não encontrada para exclusão.");
        }
        viaturaRepository.deleteById(id);
    }

    @Transactional
    public void deleteAllByBaseId(Long idBase) {
        try {
            viaturaRepository.deleteAllByIdBase(idBase);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Erro ao deletar viaturas da base: " + e.getMessage(), e);
        }

    }
}
