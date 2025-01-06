package com.sneakyghost.twentyplots.services;

import com.sneakyghost.twentyplots.llm.GPTClient;
import com.sneakyghost.twentyplots.AwsConfig;
import com.sneakyghost.twentyplots.JwtProvider;
import com.sneakyghost.twentyplots.entities.User;
import com.sneakyghost.twentyplots.db.UserRepository;
import com.sneakyghost.twentyplots.dtos.AiQueryRequest;
import com.sneakyghost.twentyplots.dtos.DbQueryRequest;

import com.fasterxml.jackson.databind.ObjectMapper;

import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient;
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest;
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import com.fasterxml.jackson.core.type.TypeReference;

import java.util.*;

@Service
public class AdminService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AdminService.class);

    @Autowired
    private GPTClient gptClient;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DataSource dataSource;

    @Autowired
    private AwsConfig awsConfig;

    @PersistenceContext
    private EntityManager entityManager;

    public class AdminUserInfo {
        private String username;
        private String password;
        private String email;
    
        public String getUsername() {
            return username;
        }
        public void setUsername(String username) {
            this.username = username;
        }
        public String getPassword() {
            return password;
        }
        public void setPassword(String password) {
            this.password = password;
        }
        public String getEmail() {
            return email;
        }
        public void setEmail(String email) {
            this.email = email;
        }
    }

    public boolean isAdmin(String token) {
        String secretAdminName = fetchSecretAdminName();
        return checkIfTokenIsForAdminUser(token, secretAdminName);
    }

    public AdminUserInfo fetchSecretAdminInfoFromAWS() {
        SecretsManagerClient client = SecretsManagerClient.builder().build();
        GetSecretValueRequest getSecretValueRequest = GetSecretValueRequest.builder()
            .secretId("twentyplots-sensitive-data")
            .build();
        GetSecretValueResponse getSecretValueResponse = client.getSecretValue(getSecretValueRequest);
        String secretJson = getSecretValueResponse.secretString();

        AdminUserInfo adminUserInfo = new AdminUserInfo();

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, String> secretData = objectMapper.readValue(secretJson, new TypeReference<Map<String, String>>() {});


            adminUserInfo.setUsername(secretData.get("twentyplots.admin.username"));
            adminUserInfo.setPassword(secretData.get("twentyplots.admin.password"));
            adminUserInfo.setEmail(secretData.get("twentyplots.admin.email"));
        } catch (Exception e) {
            log.error("Error fetching admin info from AWS Secrets Manager", e);
            return null;
        }

        return adminUserInfo;
    }

    private boolean checkIfTokenIsForAdminUser(String token, String secretAdminName) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        if (userId == null)
            return false;
        Optional<User> user = userRepository.findById(userId);
        return user.isPresent() && user.get().getUsername().equals(secretAdminName);
    }

    public String sendAiQuery(String token, AiQueryRequest request) throws Exception {
        if (!isAdmin(token))
            return "Forbidden";
        return gptClient.sendAdminPrompt("You will answer without special characters.", request.getUserPrompt(),
                request.getModel());
    }

    @Transactional
    public String sendDbQuery(String token, DbQueryRequest request) throws Exception {
        if (!isAdmin(token))
            return "Forbidden";
        String query = request.getDbQueryString();
        if (query.toLowerCase().startsWith("select")) {
            return executeSelectQuery(query);
        } else {
            return executeUpdateQuery(query);
        }
    }

    private String executeSelectQuery(String query) throws Exception {
        try (Connection connection = dataSource.getConnection();
                PreparedStatement preparedStatement = connection.prepareStatement(query);
                ResultSet resultSet = preparedStatement.executeQuery()) {

            ResultSetMetaData metadata = resultSet.getMetaData();
            List<Map<String, Object>> jsonList = new ArrayList<>();
            while (resultSet.next()) {
                Map<String, Object> jsonRow = new LinkedHashMap<>();
                for (int i = 1; i <= metadata.getColumnCount(); i++) {
                    String columnName = metadata.getColumnName(i);
                    jsonRow.put(columnName, resultSet.getObject(columnName));
                }
                jsonList.add(jsonRow);
            }
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.writeValueAsString(jsonList);
        }
    }

    private String executeUpdateQuery(String query) {
        jakarta.persistence.Query dbQuery = entityManager.createNativeQuery(query);
        int affectedRows = dbQuery.executeUpdate();
        return "Query executed successfully. Affected rows: " + affectedRows;
    }

    private String fetchSecretAdminName() {
        if (awsConfig.isInProdMode()) {
            return fetchSecretAdminInfoFromAWS().getUsername();
        } else {
            String adminUsername = "your-admin-username"; // hard-coded value for dev mode
            if ("your-admin-username".equals(adminUsername)) {
                throw new IllegalStateException("Admin username is not configured. Please replace 'your-admin-username' with your admin username in AdminService.java.");
            }
            return adminUsername;
        }
    }
    
}
