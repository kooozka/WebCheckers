FROM openjdk:17-jdk-alpine
WORKDIR /app
COPY target/checkersBackend-1.0.jar /app/backend.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "backend.jar"]
