# ===== STAGE 1: Build =====
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml ./
RUN mvn -B dependency:go-offline
COPY src ./src
# Adiciona flags de otimização no build
RUN mvn -B package -DskipTests -Dmaven.compiler.showWarnings=false

# ===== STAGE 2: Runtime =====
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 9006
ENTRYPOINT exec java -jar /app/app.jar