package com.avaliacaoservice.service.exists;

import com.avaliacaoservice.config.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "checklist", configuration = FeignClientConfig.class)
public interface CheckListExists {
    @GetMapping("/exists/{id}")
    boolean existsCheckListById(@PathVariable("id") Long id);
}
