# Dockerfile for 20plots-server

# Stage 1: Build the application
FROM gradle:8.1.1-jdk17 AS build
WORKDIR /home/gradle/20plots-server
COPY --chown=gradle:gradle . .
RUN gradle build --no-daemon -x test

# Stage 2: Run the application
FROM openjdk:17-oracle
EXPOSE 8080

COPY --from=build /home/gradle/20plots-server/build/libs/*.jar /20plots-server.jar

ENTRYPOINT ["java", "-jar", "/20plots-server.jar"]
