package com.gatewayservice.config;

import com.gatewayservice.service.JwtUtils;
import com.gatewayservice.service.RouterValidator;
import io.jsonwebtoken.JwtException;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
@RefreshScope
public class AuthenticationFilter implements GlobalFilter, Ordered {

    private final RouterValidator routerValidator;

    private final JwtUtils jwtUtils;

    public AuthenticationFilter(RouterValidator routerValidator, JwtUtils jwtUtils) {
        this.routerValidator = routerValidator;
        this.jwtUtils = jwtUtils;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        var request = exchange.getRequest();

        // Verifica se a rota precisa de autenticação
        if (routerValidator.isSecured.test(request)) {
            String token = request.getHeaders().getFirst("Authorization");

            if (token == null || jwtUtils.isTokenExpired(token)) {
                return unauthorized(exchange);
            }

            try {
                if (!jwtUtils.isValid(token)) {
                    return unauthorized(exchange);
                }

                exchange.getAttributes().put("token", token);

            } catch (JwtException e) {
                return unauthorized(exchange);
            }
        }

        return chain.filter(exchange);
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    @Override
    public int getOrder() {
        return -1; // Executa antes de outros filtros
    }
}

