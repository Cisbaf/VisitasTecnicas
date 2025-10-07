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

                for (int i = 0; i < token.length(); i++) {
                    char c = token.charAt(i);
                    if (Character.isWhitespace(c)) {
                        System.out.println("Space found at position: " + i);
                    }
                }

            } else {
                var cookie = request.getCookies().getFirst("token");
                if (cookie != null) {
                    token = cookie.getValue();
                    token = token.trim();
                }
            }

            if (token == null || token.isBlank() || !jwtUtils.isValid(token) || jwtUtils.isTokenExpired(token)) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            exchange.getAttributes().put("token", token);
        }

        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
