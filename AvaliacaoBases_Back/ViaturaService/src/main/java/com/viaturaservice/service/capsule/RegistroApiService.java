package com.viaturaservice.service.capsule;

import com.viaturaservice.entity.api.RegistroApi;
import com.viaturaservice.entity.api.Veiculo;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Service
@FeignClient(name = "viaturas", url = "https://checklist.cisbaf.org.br/api/relatorios")
public interface RegistroApiService {

    @GetMapping()
    RegistroApi getRegistros();

    @GetMapping()
    Veiculo getVeiculos(@RequestParam String placa_vtr);

    @GetMapping
    RegistroApi getVeiculosPeriodo(@RequestParam String data_inicio, @RequestParam String data_final);
}
