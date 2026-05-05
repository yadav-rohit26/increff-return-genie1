# Return Genie — Java Backend

Spring Boot port of the Node.js/Express backend. Same MongoDB schema, same REST contract, same JWT format, so the existing React frontend works against this server unchanged.  

## Stack
- Java 17
- Spring Boot 3.3 (Web, Data MongoDB)
- MongoDB
- JJWT (HS256 JWT)
- BCrypt (password hashing, compatible with bcryptjs hashes from the Node version)

## Configuration

Copy [`.env.example`](.env.example) to `.env` (or export the variables in your shell). The application reads them as standard env vars:

| Variable          | Default                                              | Notes                                  |
|-------------------|------------------------------------------------------|----------------------------------------|
| `PORT`            | `5000`                                               | HTTP port                              |
| `MONGODB_URI`     | `mongodb://127.0.0.1:27017/return-genie`             | Connection string                      |
| `JWT_SECRET`      | `supersecretjwtkey_please_change_in_production`      | HMAC key (auto-padded to 32 bytes)     |
| `N8N_WEBHOOK_URL` | _empty_                                              | Required for `/api/sync/initialize`    |

The application imports `.env` as a properties file via `spring.config.import=optional:file:.env[.properties]` in `application.properties`, so a `.env` next to where you launch the app is loaded automatically. You can also export the variables in your shell, set them in your IDE run configuration, or pass them via `-D` JVM args — those take precedence.

## Run

```bash
# Dev
mvn spring-boot:run

# Build a fat jar
mvn clean package
java -jar target/return-genie.jar

# Seed the users collection (mirrors `npm run seed`)
mvn spring-boot:run -Dspring-boot.run.arguments=--seed
# or
java -jar target/return-genie.jar --seed
```

## REST API

All endpoints match the original Node version one-for-one.

| Method | Path                        | Auth          | Body                                                  |
|--------|-----------------------------|---------------|-------------------------------------------------------|
| POST   | `/api/auth/login`           | none          | `{ username, password }`                              |
| POST   | `/api/auth/toggle-status`   | none*         | `{ clientId }` (the user's `_id`)                     |
| POST   | `/api/auth/client`          | none*         | `{ username, password, clientName, themeColor?, pod?, dbId? }` |
| DELETE | `/api/auth/client/{id}`     | none*         | —                                                     |
| GET    | `/api/auth/clients`         | none*         | —                                                     |
| POST   | `/api/sync/initialize`      | Bearer JWT    | `multipart/form-data` with `file`, `marketplace`, `email?` |

\* The original Node code only enforced JWT on `/api/sync/*` (admin endpoints had a TODO comment about adding it). This port preserves that exactly. Tighten it later if needed.

## Project layout

```
src/main/java/com/increff/returngenie/
├── ReturnGenieApplication.java   # entry point
├── config/                       # CORS, RestTemplate, password encoder
├── controller/                   # AuthController, SyncController
├── dto/                          # request/response payloads
├── model/User.java               # @Document mapped to `users` collection
├── repository/UserRepository.java
├── security/JwtAuthFilter.java   # protects /api/sync/**
├── service/JwtService.java
└── seed/DataSeeder.java          # runs only with --seed
```

## Notes

- BCrypt hashes from `bcryptjs` use `$2a$` / `$2b$` prefixes and are byte-compatible with Spring's `BCryptPasswordEncoder`. Existing users seeded by the Node version will continue to log in.
- The CORS policy is fully open (mirrors `app.use(cors())`). Lock it down before going to prod.
- Multipart upload size cap is 200 MB (`spring.servlet.multipart.max-file-size`). Adjust in `application.properties` if needed.
