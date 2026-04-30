package com.increff.returngenie;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class ReturnGenieApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReturnGenieApplication.class, args);
    }
}
