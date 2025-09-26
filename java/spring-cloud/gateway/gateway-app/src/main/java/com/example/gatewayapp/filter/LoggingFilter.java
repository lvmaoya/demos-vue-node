package com.example.gatewayapp.filter;
//
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.cloud.gateway.filter.GlobalFilter;
//import org.springframework.core.Ordered;
//import org.springframework.stereotype.Component;
//import org.springframework.web.server.ServerWebExchange;
//import reactor.core.publisher.Mono;
//
//@Component
//public class LoggingFilter implements GlobalFilter, Ordered {
//    private static final Logger log = LoggerFactory.getLogger(LoggingFilter.class);
//
//    @Override
//    public Mono<Void> filter(ServerWebExchange exchange, org.springframework.cloud.gateway.filter.GatewayFilterChain chain) {
//        long start = System.currentTimeMillis();
//        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
//            long time = System.currentTimeMillis() - start;
//            log.info("Request {} took {}ms -> {}",
//                    exchange.getRequest().getURI(),
//                    time,
//                    exchange.getResponse().getStatusCode());
//        }));
//    }
//
//    @Override
//    public int getOrder() {
//        return 0;
//    }
//}
