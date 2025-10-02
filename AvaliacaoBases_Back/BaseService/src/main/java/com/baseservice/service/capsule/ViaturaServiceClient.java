package com.baseservice.service.capsule;

import com.baseservice.config.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "viatura", configuration = FeignClientConfig.class)
public interface ViaturaServiceClient {

    @DeleteMapping("/base/{idBase}")
    void deleteViaturasByBaseId(@PathVariable Long idBase);
}