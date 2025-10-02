package com.arquivomidia;

import com.arquivomidia.config.FileStorageProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
@EnableConfigurationProperties(FileStorageProperties.class)
public class ArquivoMidiaApplication {

    public static void main(String[] args) {
        SpringApplication.run(ArquivoMidiaApplication.class, args);
    }

}
