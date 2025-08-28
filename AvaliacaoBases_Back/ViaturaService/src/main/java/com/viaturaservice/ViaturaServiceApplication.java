package com.viaturaservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class ViaturaServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ViaturaServiceApplication.class, args);
    }

}
