# Estagio 1: compila o modulo app/ (mesmo que "cd app && mvn package")
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /src

COPY pom.xml .
COPY app ./app

# -DskipTests: os testes de integracao usam Testcontainers (outro Postgres).
# Nao misturar isso no build da imagem.
RUN mvn -f app/pom.xml -q -DskipTests package

# Estagio 2: so o JRE + o JAR. Sem Maven, sem fonte, sem Playwright.
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /src/app/target/edu-platform-1.0.0.jar app.jar

EXPOSE 8150
ENTRYPOINT ["java", "-jar", "app.jar"]
