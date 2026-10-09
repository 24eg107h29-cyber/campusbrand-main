# Stage 1: Build Java application with Maven
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /workspace

# Copy pom and pre-fetch dependencies for fast builds
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and package
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal JRE runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create data directories and non-root user for security
RUN mkdir -p /app/uploads /app/data && \
    addgroup -S appgroup && \
    adduser -S appuser -G appgroup

COPY --from=build /workspace/target/campusbrand-backend-0.0.1-SNAPSHOT.jar app.jar

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8081

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
