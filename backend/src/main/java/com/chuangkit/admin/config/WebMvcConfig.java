package com.chuangkit.admin.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${chuangkit.upload.base-url:http://localhost:8081/uploads}")
    private String uploadBaseUrl;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadDir = Path.of(System.getProperty("user.dir"), "uploads");
        registry.addResourceHandler("/uploads/**")
            .addResourceLocations(toResourceLocation(uploadDir));
    }

    static String toResourceLocation(Path uploadDir) {
        String location = uploadDir.toAbsolutePath().normalize().toUri().toString();
        return location.endsWith("/") ? location : location + "/";
    }
}
