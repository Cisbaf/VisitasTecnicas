package com.inspecaoservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class InspecaoServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(InspecaoServiceApplication.class, args);
    }

}
