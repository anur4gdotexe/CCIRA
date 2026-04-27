package com.ccira_apis;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan({"com.ccira_apis", "utils"})
public class CciraApisApplication {

    public static void main(String[] args) {
        SpringApplication.run(CciraApisApplication.class, args);
    }

}
