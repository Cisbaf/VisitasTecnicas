package com.baseservice.service.capsule;

import com.baseservice.config.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "visita", configuration = FeignClientConfig.class)
public interface VisitaServiceClient {

    @DeleteMapping("/base/{idBase}")
    void deleteVisitasByBaseId(@PathVariable Long idBase);
}