package com.inspecaoservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class CheckListItemServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CheckListItemServiceApplication.class, args);
    }

}
