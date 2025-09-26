package com.example.gatewayapp.filter;
//
//import org.springframework.cloud.gateway.filter.GlobalFilter;
//import org.springframework.core.Ordered;
//import org.springframework.http.HttpStatus;
//import org.springframework.stereotype.Component;
//import org.springframework.web.server.ServerWebExchange;
//import reactor.core.publisher.Mono;
//
//@Component
//public class AuthFilter implements GlobalFilter, Ordered {
//    @Override
//    public Mono<Void> filter(ServerWebExchange exchange, org.springframework.cloud.gateway.filter.GatewayFilterChain chain) {
//        String token = exchange.getRequest().getHeaders().getFirst("Authorization");
//        if (token == null || !token.equals("Bearer token123")) {
//            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
//            return exchange.getResponse().setComplete();
//        }
//        return chain.filter(exchange);
//    }
//
//    @Override
//    public int getOrder() {
//        return -100;
//    }
//}
//
