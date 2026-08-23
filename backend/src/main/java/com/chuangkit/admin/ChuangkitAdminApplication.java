package com.chuangkit.admin;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.chuangkit.admin.mapper")
public class ChuangkitAdminApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChuangkitAdminApplication.class, args);
    }
}
