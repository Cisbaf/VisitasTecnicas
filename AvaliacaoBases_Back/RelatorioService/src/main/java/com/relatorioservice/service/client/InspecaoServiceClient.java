package com.relatorioservice.service.client;

import com.relatorioservice.config.FeignClientConfig;
import com.relatorioservice.entity.dtos.VtrMediaDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.HashMap;
import java.util.List;

@FeignClient(name = "inspecao", configuration = FeignClientConfig.class)
public interface InspecaoServiceClient {

    @GetMapping("/vtr/media")
    List<VtrMediaDto> getVtrMedia();

    @GetMapping("/tempos/media")
    HashMap<String, String> getMediaTempos();

    @GetMapping("/prontidao/media")
    HashMap<String, String> getMediaProntidao();
}