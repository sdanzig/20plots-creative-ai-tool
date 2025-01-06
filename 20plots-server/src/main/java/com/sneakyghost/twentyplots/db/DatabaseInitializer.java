package com.sneakyghost.twentyplots.db;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import com.sneakyghost.twentyplots.AwsConfig;
import com.sneakyghost.twentyplots.services.AdminService;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.sneakyghost.twentyplots.entities.User;

@Component
public class DatabaseInitializer implements ApplicationRunner {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(DatabaseInitializer.class);

    @Autowired
    private AwsConfig awsConfig;

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        log.info("Initializing database");
        if (awsConfig.isInProdMode()) {
            log.info("In prod mode. Fetching admin info from AWS");
            AdminService.AdminUserInfo adminInfo = adminService.fetchSecretAdminInfoFromAWS();
            log.info("Creating admin user {} if it doesn't exist", adminInfo.getUsername());
            createUserIfNotExists(adminInfo.getUsername(), adminInfo.getEmail(), adminInfo.getPassword());
        }
    }

    private void createUserIfNotExists(String username, String email, String password) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            log.info("Creating user {} which does not exist", username);
            User newUser = new User(username, email, password);
            newUser.setPassword(password, passwordEncoder);
            userRepository.save(newUser);
        }
    }
}
