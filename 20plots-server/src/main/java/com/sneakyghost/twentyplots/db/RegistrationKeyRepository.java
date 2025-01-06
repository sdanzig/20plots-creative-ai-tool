package com.sneakyghost.twentyplots.db;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sneakyghost.twentyplots.entities.RegistrationKey;

public interface RegistrationKeyRepository extends JpaRepository<RegistrationKey, Long> {
    RegistrationKey findByKey(String key);
    void deleteByKey(String key);
}
