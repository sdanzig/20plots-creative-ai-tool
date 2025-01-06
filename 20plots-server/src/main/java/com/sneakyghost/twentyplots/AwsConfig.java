package com.sneakyghost.twentyplots;

import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.regions.providers.DefaultAwsRegionProviderChain;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class AwsConfig {
    Logger logger = LoggerFactory.getLogger(AwsConfig.class);

    @Autowired
    private Environment env;

    private String getActiveProfile() {
        return env.getProperty("spring.profiles.active");
    }

    public boolean isInProdMode() {
        return "prod".equals(getActiveProfile());
    }

    @PostConstruct
    public void fetchSecrets() {
        if (getActiveProfile().equals("prod")) {
            DefaultAwsRegionProviderChain regionProviderChain = new DefaultAwsRegionProviderChain();
            Region defaultRegion = regionProviderChain.getRegion();
            System.setProperty("aws.default.region", defaultRegion.toString());
        }
    }
}
