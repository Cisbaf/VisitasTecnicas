package com.avaliacaoservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class AvaliacaoServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(com.avaliacaoservice.AvaliacaoServiceApplication.class, args);
    }
}

