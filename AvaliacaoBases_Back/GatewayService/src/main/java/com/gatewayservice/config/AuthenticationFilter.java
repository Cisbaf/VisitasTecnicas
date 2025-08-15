package com.gatewayservice.config;

import com.gatewayservice.service.JwtUtils;
import com.gatewayservice.service.RouterValidator;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;

@Component
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

        if (routerValidator.isSecured.test(request)) {
            String authHeader = request.getHeaders().getFirst("Authorization");
            String token = null;

            if (authHeader != null && !authHeader.isBlank()) {
                token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
            } else {
                // tenta pegar token do cookie 'token'
                var cookie = request.getCookies().getFirst("token");
                if (cookie != null) token = cookie.getValue();
            }

            if (token == null || !jwtUtils.isValid(token) || jwtUtils.isTokenExpired(token)) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            // opcional: disponibiliza token para downstream (atributo)
            exchange.getAttributes().put("token", token);
        }

        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
