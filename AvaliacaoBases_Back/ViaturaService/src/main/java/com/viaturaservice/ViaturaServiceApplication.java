package com.viaturaservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@EnableFeignClients
@SpringBootApplication
@EnableScheduling
public class ViaturaServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ViaturaServiceApplication.class, args);
    }

}
