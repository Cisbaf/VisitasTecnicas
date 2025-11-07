package com.gatewayservice.service;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;

@Service
public class RouterValidator {

    public static final List<String> openEndpoints = Arrays.asList(
            "/avaliacao/user/login",
            "/avaliacao/user/registro"
    );

    public final Predicate<ServerHttpRequest> isSecured = request -> {
        String path = request.getURI().getPath();

        return openEndpoints.stream()
                .noneMatch(path::startsWith);
    };
}