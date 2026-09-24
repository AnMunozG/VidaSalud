# syntax=docker/dockerfile:1

# ── Etapa de build: compila el jar con Maven ──────────────
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q package -DskipTests && mv target/*.jar app.jar

# ── Etapa de runtime: imagen liviana con solo el jar ──────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/app.jar app.jar
ENV SERVER_PORT=8082
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]