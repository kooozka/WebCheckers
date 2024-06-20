# Use the official Keycloak Quarkus base image
FROM quay.io/keycloak/keycloak:25.0.0

# Set environment variables for Keycloak configuration
ENV KEYCLOAK_ADMIN=admin
ENV KEYCLOAK_ADMIN_PASSWORD=checkers
#ENV KC_DB=postgres
#ENV KC_DB_URL=jdbc:postgresql://localhost:5432/keycloak
#ENV KC_DB_USERNAME=keycloak
#ENV KC_DB_PASSWORD=password
ENV KC_HTTP_PORT=8888
ENV KC_HTTP_HOST=0.0.0.0

# Set the working directory inside the container
WORKDIR /opt/keycloak

# Copy any custom themes, configurations, or scripts if needed
# COPY custom-themes /opt/keycloak/themes/

# Install and configure Keycloak
RUN /opt/keycloak/bin/kc.sh build

# Expose the default Keycloak port
EXPOSE 8888
EXPOSE 9000
EXPOSE 8443

# Set the command to start Keycloak with the necessary options
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start-dev"]

# Healthcheck to ensure the service is running
#HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
#  CMD curl -f http://localhost:8888/ || exit 1
