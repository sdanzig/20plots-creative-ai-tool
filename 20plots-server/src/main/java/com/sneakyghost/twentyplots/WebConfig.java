package com.sneakyghost.twentyplots;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Value;

@Configuration
public class WebConfig {

	@Value("${frontend.url}")
    private String frontendUrl;

	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/api/**").allowedOrigins(frontendUrl).allowedMethods("GET", "POST",
						"PUT", "DELETE", "OPTIONS");
			}
		};
	}
/*
	@Bean
	public Jackson2ObjectMapperBuilderCustomizer customizeJackson() {
		return builder -> {
			builder.mixIn(Plot.class, PlotMixin.Mixin.class);
		};
	}
*/
}
