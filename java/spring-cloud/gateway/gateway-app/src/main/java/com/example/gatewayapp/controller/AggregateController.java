package com.example.gatewayapp.controller;

//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RestController;
//import org.springframework.web.reactive.function.client.WebClient;
//import reactor.core.publisher.Mono;
//
//import java.util.Map;
//
//@RestController
//public class AggregateController {
//    private final WebClient webClient = WebClient.create();
//
//    @GetMapping("/aggregate/demo")
//    public Mono<Map<String, String>> aggregate() {
//        Mono<String> res1 = webClient.get().uri("http://localhost:8081/provider/hello").retrieve().bodyToMono(String.class);
//        Mono<String> res2 = webClient.get().uri("http://localhost:8082/provider/hello").retrieve().bodyToMono(String.class);
//
//        return Mono.zip(res1, res2).map(t -> Map.of("from8081", t.getT1(), "from8082", t.getT2()));
//    }
//}
