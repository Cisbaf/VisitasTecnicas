package com.checklistitemservice.service.capsule;

import com.checklistitemservice.config.FeignClientConfig;
import com.checklistitemservice.entity.dto.BaseRankingDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.List;


@FeignClient(name = "relatorio", configuration = FeignClientConfig.class )
public interface RelatorioServiceClient {

    @GetMapping("/relatorios/ranking")
    List<BaseRankingDTO> getRankingVisitas(@RequestParam LocalDate inicio,
                                           @RequestParam LocalDate fim);

}