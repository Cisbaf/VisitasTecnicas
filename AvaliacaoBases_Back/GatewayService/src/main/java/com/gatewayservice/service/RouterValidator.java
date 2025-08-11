package com.gatewayservice.service;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;

@Service
public class RouterValidator {

    // Lista de endpoints que não precisam de autenticação
    public static final List<String> openEndpoints = Arrays.asList(
            "/auth/user/login",
            "/auth/user/registro"
    );

    public Predicate<ServerHttpRequest> isSecured = request -> {
        String path = request.getURI().getPath();

        return openEndpoints.stream()
                .noneMatch(path::startsWith);
    };
}