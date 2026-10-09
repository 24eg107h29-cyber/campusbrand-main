package com.campusbrand.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.frontend-url:https://campusbrand-main.vercel.app,http://localhost:5174,http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        List<String> origins = new ArrayList<>(Arrays.asList(
            "https://campusbrand-main.vercel.app",
            "https://*.vercel.app",
            "https://*.onrender.com",
            "http://localhost:5174",
            "http://127.0.0.1:5174",
            "http://localhost:5173",
            "http://127.0.0.1:5173"
        ));

        if (frontendUrl != null) {
            for (String origin : frontendUrl.split(",")) {
                String trimmed = origin.trim();
                if (!trimmed.isBlank() && !origins.contains(trimmed)) {
                    origins.add(trimmed);
                }
            }
        }

        registry.addMapping("/**")
            .allowedOriginPatterns(origins.toArray(new String[0]))
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD")
            .allowedHeaders("*")
            .exposedHeaders("Content-Disposition", "Location")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
