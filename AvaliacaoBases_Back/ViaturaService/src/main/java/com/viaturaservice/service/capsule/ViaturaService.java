package com.viaturaservice.service.capsule;

import com.viaturaservice.entity.ViaturaRequest;
import com.viaturaservice.entity.ViaturaResponse;
import com.viaturaservice.entity.api.RegistroApi;
import com.viaturaservice.entity.dto.VeiculoDto;

import java.util.List;

public interface ViaturaService {
    ViaturaResponse createViatura(ViaturaRequest viaturaRequest);

    ViaturaResponse getViaturaById(Long id);

    List<ViaturaResponse> getAllViaturasByIdBase(Long idBase);

    List<ViaturaResponse> getVeiculoFromApiByPeriodo(Long baseId, String data_inicio, String data_final);
    List<ViaturaResponse> getVeiculoFromApiByPeriodo( String data_inicio, String data_final);


    VeiculoDto getVeiculoFromApi(String placa);

    boolean existsViaturaById(Long id);

    List<ViaturaResponse> getAllViaturas();

    ViaturaResponse updateViatura(Long id, ViaturaRequest viaturaRequest);

    void deleteViatura(Long id);

    void deleteAllByBaseId(Long idBase);
}
