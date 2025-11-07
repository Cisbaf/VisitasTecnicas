package com.avaliacaoservice.viatura.service;

import com.avaliacaoservice.base.entity.BaseResponse;
import com.avaliacaoservice.base.service.capsule.BaseService;
import com.avaliacaoservice.viatura.entity.ViaturaEntity;
import com.avaliacaoservice.viatura.entity.ViaturaRequest;
import com.avaliacaoservice.viatura.entity.ViaturaResponse;
import com.avaliacaoservice.viatura.entity.api.Cidade;
import com.avaliacaoservice.viatura.entity.api.RegistroApi;
import com.avaliacaoservice.viatura.entity.api.Veiculo;
import com.avaliacaoservice.viatura.entity.dto.VeiculoDto;
import com.avaliacaoservice.viatura.repository.ViaturaRepository;
import com.avaliacaoservice.viatura.service.capsule.RegistroApiService;
import com.avaliacaoservice.viatura.service.capsule.ViaturaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ViaturaServiceImp implements ViaturaService {

    private final ViaturaRepository viaturaRepository;
    private final ViaturaMapper mapper;
    private final RegistroApiService registroApiService;
    private final BaseService baseService;

    public ViaturaResponse createViatura(ViaturaRequest viaturaRequest) {
        try {
            ViaturaEntity entity = this.mapper.toEntity(viaturaRequest);
            entity.setDataInclusao(LocalDate.now());
            ViaturaEntity savedEntity = this.viaturaRepository.save(entity);
            return ViaturaMapper.toDTO(savedEntity);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Erro ao criar viatura: " + e.getMessage(), e);
        }
    }


    public ViaturaResponse getViaturaById(Long id) {
        return this.viaturaRepository.findById(id)
                .map(ViaturaMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Viatura não encontrada."));
    }


    public List<ViaturaResponse> getAllViaturasByIdBase(Long idBase) {
        return this.viaturaRepository.findAllByIdBase(idBase).stream()
                .map(ViaturaMapper::toDTO).toList();
    }

    public VeiculoDto getVeiculoFromApi(String placa) {
        Veiculo veiculo = this.registroApiService.getVeiculos(placa);
        if (veiculo != null && veiculo.getIdentificacao() != null) {
            return new VeiculoDto(veiculo
                    .getIdentificacao(), veiculo
                    .getPreenchimentos(), veiculo
                    .getKM());
        }

        return new VeiculoDto("Veículo não encontrado", new ArrayList<>(), "0");
    }


    public List<ViaturaResponse> getVeiculoFromApiByPeriodo(Long baseId, String data_inicio, String data_final) {
        BaseResponse base = this.baseService.getById(baseId);
        if (base == null) {
            throw new RuntimeException("Base não encontrada.");
        }

        RegistroApi registros = this.registroApiService.getVeiculosPeriodo(data_inicio, data_final);
        log.info("Registros API recebidos: {}", registros);

        List<ViaturaResponse> viaturas = new ArrayList<>();

        if (registros != null && registros.getCidades() != null) {
            String nomeBaseNormalizado = normalizarTexto(base.nome());

            Cidade cidade = encontrarCidadeCorrespondente(registros.getCidades(), nomeBaseNormalizado);

            if (cidade != null && cidade.getVeiculos() != null) {
                for (Map.Entry<String, Veiculo> veiculoEntry : cidade.getVeiculos().entrySet()) {
                    Veiculo veiculo = veiculoEntry.getValue();
                    ViaturaResponse viaturaResponse = getViaturaResponse(veiculoEntry, veiculo, base);
                    viaturas.add(viaturaResponse);
                }
            }
        }
        return viaturas;
    }

    public List<ViaturaResponse> getVeiculoFromApiByPeriodo(String data_inicio, String data_final) {
        RegistroApi registros = this.registroApiService.getVeiculosPeriodo(data_inicio, data_final);
        List<ViaturaResponse> viaturas = new ArrayList<>();

        if (registros != null && registros.getCidades() != null) {

            List<BaseResponse> bases = this.baseService.getAll();
            for (BaseResponse base : bases) {
                String nomeBaseNormalizado = normalizarTexto(base.nome());
                Cidade cidade = encontrarCidadeCorrespondente(registros.getCidades(), nomeBaseNormalizado);

                if (cidade != null && cidade.getVeiculos() != null) {
                    for (Map.Entry<String, Veiculo> veiculoEntry : cidade.getVeiculos().entrySet()) {
                        Veiculo veiculo = veiculoEntry.getValue();
                        ViaturaResponse viaturaResponse = getViaturaResponse(veiculoEntry, veiculo, base);
                        viaturas.add(viaturaResponse);
                    }
                }
            }
        }
        return viaturas;
    }

    private static ViaturaResponse getViaturaResponse(Map.Entry<String, Veiculo> veiculoEntry, Veiculo veiculo, BaseResponse base) {
        ViaturaResponse viaturaResponse = new ViaturaResponse();
        viaturaResponse.setPlaca((veiculoEntry.getKey() != null) ? veiculoEntry.getKey() : "Não encontrado!");
        viaturaResponse.setKm((veiculo.getKM() != null && !veiculo.getKM().equals("Não encontrado!") && veiculo.getKM().startsWith("0")) ? veiculo.getKM().replaceAll("\\D", "") : "0");
        viaturaResponse.setTipoViatura(veiculo.getIdentificacao());
        viaturaResponse.setIdBase(base.id());
        viaturaResponse.setStatusOperacional(!veiculo.getPreenchimentos().isEmpty() ? "Operacional" : "Indefinido");
        viaturaResponse.setDataUltimaAlteracao(!veiculo.getPreenchimentos().isEmpty() ? veiculo.getPreenchimentos().getFirst().getDia() : null);
        viaturaResponse.setDataInclusao(!veiculo.getPreenchimentos().isEmpty() ? veiculo.getPreenchimentos().getLast().getDia() : null);
        return viaturaResponse;
    }


    public boolean existsViaturaById(Long id) {
        return this.viaturaRepository.existsById(id);
    }

    public List<ViaturaResponse> getAllViaturas() {
        return this.viaturaRepository.findAll().stream()
                .map(ViaturaMapper::toDTO)
                .collect(Collectors.toList());
    }

    public ViaturaResponse updateViatura(Long id, ViaturaRequest viaturaRequest) {
        ViaturaEntity viatura = this.viaturaRepository.findById(id).orElseThrow(() -> new RuntimeException("Viatura inexistente."));
        ViaturaEntity entity = this.mapper.toEntity(viaturaRequest);
        entity.setId(id);
        entity.setDataInclusao(viatura.getDataInclusao());

        ViaturaEntity updatedEntity = this.viaturaRepository.save(entity);
        return ViaturaMapper.toDTO(updatedEntity);
    }

    @Transactional
    public void deleteViatura(Long id) {
        if (!this.viaturaRepository.existsById(id)) {
            throw new RuntimeException("Viatura não encontrada para exclusão.");
        }
        this.viaturaRepository.deleteById(id);
    }

    @Transactional
    public void deleteAllByBaseId(Long idBase) {
        try {
            this.viaturaRepository.deleteAllByIdBase(idBase);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Erro ao deletar viaturas da base: " + e.getMessage(), e);
        }
    }


    private String normalizarTexto(String texto) {
        if (texto == null) return null;

        return Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .trim();
    }

    private Cidade encontrarCidadeCorrespondente(Map<String, Cidade> cidades, String nomeBaseNormalizado) {
        for (Map.Entry<String, Cidade> entry : cidades.entrySet()) {
            String nomeCidadeNormalizado = normalizarTexto(entry.getKey());
            if (nomeBaseNormalizado.equals(nomeCidadeNormalizado)) {
                return entry.getValue();
            }
        }
        return null;
    }
}