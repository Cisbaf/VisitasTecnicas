package com.avaliacaoservice.viatura.service.capsule;

import com.avaliacaoservice.viatura.entity.api.RegistroApi;
import com.avaliacaoservice.viatura.entity.api.Veiculo;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Service
@FeignClient(name = "viaturas", url = "https://checklist.cisbaf.org.br/api/relatorios")
public interface RegistroApiService {
  @GetMapping
  RegistroApi getRegistros();
  
  @GetMapping
  Veiculo getVeiculos(@RequestParam String paramString);
  
  @GetMapping
  RegistroApi getVeiculosPeriodo(@RequestParam String paramString1, @RequestParam String paramString2);
}

