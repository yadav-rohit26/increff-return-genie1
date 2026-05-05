# Return Genie - Comprehensive Technical Documentation

**Version:** 1.0.0
**Date:** April 2026
**Target Audience:** Software Engineers, DevOps Engineers, and System Architects maintaining and scaling the Return Genie ecosystem.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack (With Justification)](#3-technology-stack-with-justification)
4. [Project Structure](#4-project-structure)
5. [Backend Deep Dive (Spring Boot)](#5-backend-deep-dive-spring-boot)
6. [API Documentation](#6-api-documentation)
7. [Frontend Deep Dive (React.js)](#7-frontend-deep-dive-reactjs)
8. [UI/UX Structure](#8-uiux-structure)
9. [Database Design (MongoDB)](#9-database-design-mongodb)
10. [Database Connectivity](#10-database-connectivity)
11. [Module-wise Breakdown](#11-module-wise-breakdown)
12. [Method-Level Explanation](#12-method-level-explanation)
13. [Authentication & Authorization](#13-authentication--authorization)
14. [Error Handling & Validation](#14-error-handling--validation)
15. [Deployment Details](#15-deployment-details)
16. [Requirements](#16-requirements)
17. [Setup & Installation Guide](#17-setup--installation-guide)
18. [Challenges Faced](#18-challenges-faced)
19. [Future Enhancements](#19-future-enhancements)
20. [Conclusion](#20-conclusion)

---

## 1. Project Overview

### Purpose and Objectives
The **Return Genie** platform is an enterprise-grade reconciliation and return-management system designed for e-commerce aggregators and enterprise sellers (like Adidas, Puma). The core objective is to automate the reconciliation of marketplace return expectations against actual physical returns received at the warehouse.

### Problem Statement
Enterprise sellers dispatch thousands of orders daily across various marketplaces (Amazon, Flipkart, Myntra, TataCLiQ). A significant percentage of these result in Customer Returns or Returns-to-Origin (RTO). Marketplaces provide reports of returned items, but sellers often struggle to verify if every returned item mentioned in the marketplace report has been physically received in the warehouse management system (WMS/CIMS). Discrepancies result in revenue leakage. Furthermore, claiming Seller Protection Fund (SPF) for missing/damaged items requires extensive manual validation.

### Key Features
* **Multi-Tenant Architecture:** Admin portal to manage multiple client environments. Each client gets isolated credentials, specific Pod assignments (POD 1 - 4), and a dynamic theme color.
* **Return Reconciliation Automation:** File upload feature parsing `.csv`, `.xls`, and `.xlsx` files up to 3000 rows.
* **Integration with N8N:** A complex, automated pipeline triggered via a webhook that extracts data from uploaded spreadsheets, runs remote SQL queries against CIMS (Increff SaaS Webget APIs), calculates missing returns, and emails the compiled difference report directly to the client.
* **Dynamic JWT-Based Authorization:** Secure endpoints validating users based on Active/Inactive toggle states.

### Target Users and Usage Scenarios
* **Super Admins:** Access the `AdminPortal` to provision new clients, rotate credentials, and define operational Pods.
* **Client Operations Team:** Log into their dedicated portal, access the `SelectionHub`, and upload marketplace reports for automated reconciliation. They receive an email with an Excel file containing missing return orders.

---

## 2. System Architecture

The project employs a modern, decoupled layered architecture splitting responsibilities strictly across the UI, Backend API, and Automation Pipeline.

### High-Level Architecture (Frontend ↔ Backend ↔ Database)
1. **Frontend (React.js SPA):** Renders dynamic UIs. Uses Context API for global auth state. Connects to backend via REST APIs.
2. **Backend (Spring Boot):** Acts as the API Gateway and Auth Server. Manages business logic for user management and proxies reconciliation payloads to the automation engine.
3. **Database (MongoDB):** A NoSQL data store maintaining user identities, client configurations, and active statuses.
4. **Automation Engine (N8N):** A self-hosted/cloud N8N instance executing a Directed Acyclic Graph (DAG) for data extraction, SaaS DB querying, and SMTP (Gmail) transmission.

### Layered Architecture (Controller → Service → Repository)
The backend strictly follows the standard Spring Boot layered design pattern:
* **Controllers (`*Controller.java`):** Intercept HTTP requests, perform basic validation, and delegate to services.
* **Services (`JwtService.java`):** Contain domain-specific business logic (e.g., token generation, signing).
* **Repositories (`UserRepository.java`):** Interface with MongoDB using Spring Data abstractions, providing CRUD operations without boilerplate SQL/NoSQL statements.

### Request-Response Lifecycle
1. The React client intercepts user actions (e.g., "Initialize Sync").
2. An HTTP `POST` request (Multipart Form Data) is initiated via Axios/Fetch in `BaseSyncService.js`.
3. The Spring Boot `SyncController` receives the payload (`MultipartFile file`, `marketplace`, `email`).
4. The backend verifies the JWT token via `JwtAuthFilter`.
5. The backend validates payload limits and sends an HTTP `POST` to the remote N8N Webhook endpoint.
6. The Spring Boot controller immediately returns a `200 OK` to the frontend indicating the sync initialized.
7. The Frontend renders a "Processing Data..." terminal UI.
8. Asynchronously, N8N processes the logic, queries databases via Increff Webget, cross-references arrays, generates an XLSX, and emails the client via the Gmail API node.

---

## 3. Technology Stack (With Justification)

### 1. Java + Spring Boot (Backend)
**Why Chosen:** Spring Boot provides unparalleled dependency injection, robust security frameworks (Spring Security/Filters), and rapid REST API creation.
**Advantages:** Enterprise-ready, strongly typed, and highly scalable. Easily handles Multipart file uploads and serves as a secure proxy to N8N without exposing webhook URIs to the client side.

### 2. React.js (Frontend)
**Why Chosen:** The requirement for an interactive SPA (Single Page Application) with real-time UI updates (e.g., uploading, processing, and success animations) makes React ideal.
**Advantages:** Component reusability (like standard inputs, layout wrappers). The `Context API` provides a lightweight state management solution replacing heavy libraries like Redux for this specific scope.

### 3. MongoDB (Database)
**Why Chosen:** User and Client metadata schemas evolve over time. Adding dynamic fields (like `themeColor`, `dbId`, `marketplaces` array) without database migration scripts offers immense flexibility.
**Advantages:** JSON-like document structures map natively to REST API payloads and React state objects, avoiding ORM impedance mismatches.

### 4. N8N (Automation / ETL Pipeline)
**Why Chosen:** Writing complex chunking, batching, and external SQL querying logic directly in Java can be error-prone and hard to maintain. N8N visually orchestrates these ETL operations.
**Advantages:** Out-of-the-box nodes for Split-in-Batches, Read/Write XLSX files, and direct integration with Gmail API.

---

## 4. Project Structure

### Backend Folder Structure
```text
backend-java/
├── .env / application.properties      # Environment variables and config
├── pom.xml                            # Maven dependencies
└── src/main/java/com/increff/returngenie/
    ├── ReturnGenieApplication.java    # Main entry point
    ├── config/                        # Configuration classes (CORS, RestTemplate)
    ├── controller/                    # AuthController.java, SyncController.java
    ├── dto/                           # Data Transfer Objects for API requests/responses
    ├── model/                         # User.java (MongoDB Document mappings)
    ├── repository/                    # UserRepository.java (Extends MongoRepository)
    ├── security/                      # JwtAuthFilter.java
    └── service/                       # JwtService.java
```

### Frontend Folder Structure
```text
frontend/
└── src/
    ├── App.jsx / main.jsx             # React entry points & Router configuration
    ├── index.css / App.css            # Global CSS, Utility classes, animations
    ├── components/                    # Reusable components (e.g., Layout.jsx)
    ├── context/                       # AuthContext.jsx (Global State)
    ├── pages/                         # Route-level components
    │   ├── AdminPortal.jsx            # SuperAdmin dashboard
    │   ├── Dashboard.jsx              # Reconciliation sync UI
    │   ├── Login.jsx                  # User login view
    │   └── SelectionHub.jsx           # Hub to choose Reconciliation vs SPF Claim
    └── services/                      # API integration logic (BaseSyncService.js)
```

### File-Level Responsibilities
* **`AuthController.java`**: Handles `/api/auth/login`, `/client` (CRUD). Maps DTOs to Models.
* **`SyncController.java`**: Handles `/api/sync/initialize`. Parses Multipart form data, injects JWT claims, constructs request for N8N.
* **`AdminPortal.jsx`**: A massive state-driven component managing the creation, toggling, editing, and deletion of sub-clients.
* **`Dashboard.jsx`**: The primary user-facing reconciliation component. Handles File Drag-n-Drop, Validation, and multi-state UI (uploading, processing, success, error).

---

## 5. Backend Deep Dive (Spring Boot)

### Controllers
Controllers are mapped via `@RestController` and `@RequestMapping`.
* `SyncController`: Receives `MultipartFile`. Validates if `file` and `marketplace` are present. Retrieves claims from the HTTP Request (injected by `JwtAuthFilter`). Uses `RestTemplate` to forward the payload as a new multipart form to the defined `n8n.webhook.url`.

### Services
* `JwtService`: Encapsulates `io.jsonwebtoken.Jwts`. Secret key logic validates if the configured key is at least 32 bytes (for HMAC-SHA). If not, it pads the byte array dynamically to prevent application crash on short secrets. Methods include `generateToken` and `parseToken`.

### Repositories
* `UserRepository`: An interface extending Spring Data MongoDB repository. It defines custom query methods like `Optional<User> findByUsername(String username)`, `boolean existsByUsername(String username)`, and `List<User> findByRole(String role)`.

### Models/Entities
* `User.java`: Annotated with `@Document(collection = "users")`. Contains `@Id` for MongoDB ObjectIDs. Features custom serialization annotations like `@JsonIgnore` on passwords and `@JsonProperty` for specific schema mappings (e.g., mapping `active` to `isActive`).

### Configuration
* `CorsConfig.java`: Enables Cross-Origin Resource Sharing. Allows frontend (typically on port 5173 or 3000) to communicate with the Spring Boot backend on port 5000.
* `application.properties`: Manages sensitive keys like `jwt.secret`, `mongodb.uri`, and Tomcat servlet upload size limits (`spring.servlet.multipart.max-file-size=200MB`).

### Dependency Injection
Dependencies are strictly injected via Constructor Injection. (e.g., `public AuthController(UserRepository repo, JwtService jwt)`). This is best practice for Spring Boot to ensure immutability and ease of unit testing.

---

## 6. API Documentation

### 1. User Login
* **Endpoint:** `/api/auth/login`
* **Method:** `POST`
* **Request Body:**
  ```json
  {
    "username": "adidas_admin",
    "password": "secretpassword"
  }
  ```
* **Response Structure (200 OK):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "user": {
      "username": "adidas_admin",
      "role": "client",
      "clientId": "ADIDAS_INDIA"
    }
  }
  ```
* **Internal Flow:** Checks existence of user -> verifies `isActive` flag -> verifies Bcrypt password -> Generates JWT claims -> Returns response.

### 2. Initialize Sync (Reconciliation)
* **Endpoint:** `/api/sync/initialize`
* **Method:** `POST`
* **Content-Type:** `multipart/form-data`
* **Parameters:** `file` (Binary), `marketplace` (String), `email` (String)
* **Response Structure (200 OK):**
  ```json
  {
    "success": true,
    "message": "Sync initialized successfully",
    "data": { ... N8N webhook response ... }
  }
  ```
* **Internal Flow:** `SyncController` builds a `LinkedMultiValueMap`, attaches the `ByteArrayResource` (the file), and `POST`s to the N8N webhook.

### 3. Create Client (Admin Only)
* **Endpoint:** `/api/auth/client`
* **Method:** `POST`
* **Request Body:**
  ```json
  {
    "clientName": "Puma India",
    "dbId": "305",
    "username": "puma_admin",
    "password": "pwd",
    "themeColor": "#FF0000",
    "pod": "POD 1",
    "marketplaces": ["AMAZON_SC", "MYNTRAV4"]
  }
  ```

---

## 7. Frontend Deep Dive (React.js)

### Pages and Components Hierarchy
* `<App>`
  * `<AuthProvider>` (Context wrapper)
    * `<Layout>` (Navbar, sidebar logic)
      * `<Routes>`
        * `/login` -> `<Login>`
        * `/admin` -> `<AdminPortal>` (Protected, Role='admin')
        * `/selection` -> `<SelectionHub>` (Protected, Role='client')
        * `/reconciliation` -> `<Dashboard>` (Protected, Role='client')

### Routing and State Management
* **React Router:** Handles the SPA routing. PrivateRoutes check the `Context API` to see if a valid JWT token exists in `localStorage`.
* **State Management (Context API):** `AuthContext.jsx` manages the `activeClient`, `clients` list, `token`, and provides global functions like `fetchClients()`, `login()`, and `logout()`.
* **API Integration:** Uses Fetch API (wrapped in `BaseSyncService.js` and standard functions). The `BaseSyncService` accepts callbacks for updating terminal logs dynamically in the UI.

### Form Handling and Validation
* The `<Dashboard>` component implements strict validation:
  1. File presence check.
  2. Marketplace dropdown verification.
  3. Standard Email Regex verification (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
* The `<AdminPortal>` form validates client creation, providing a dynamic Password Generator function logic.

---

## 8. UI/UX Structure

### Visual Aesthetics
The application uses highly modern aesthetics utilizing CSS Utility classes.
* **Theme Colors:** The `themeColor` parameter in the DB is injected directly into inline styles within React components. E.g., The primary buttons and borders dynamically turn to the client's brand color (`#FF0000` for Puma).
* **Micro-Animations:** Employs CSS classes like `animate-fade-in`, `stagger-1`, `animate-slide-up`, and hover-glow effects (`box-shadow: 0 10px 40px {color}20`) to create a premium, interactive feel.

### User Journey
1. **Login:** User authenticates.
2. **Selection Hub:** User sees their personalized theme color. They select "Return Reconciliation" (Auto-Claim SPF is marked as "Coming Soon").
3. **Reconciliation Dashboard:** The user selects a marketplace, drops an `.xlsx` file, inputs their email, and clicks Sync.
4. **Processing Terminal:** A faux-terminal UI runs, simulating logs using a `pulse` animation, keeping the user engaged while N8N processes data in the background.
5. **Success View:** Displaying an animated checkmark, informing the user that an email is dispatched.

---

## 9. Database Design (MongoDB)

### Collections and Schema
The primary collection is `users`.
The document acts as both the Auth Credential and the Client Configuration Profile.

### Document Sample
```json
{
  "_id": { "$oid": "65b9e0f3..." },
  "username": "adidas_admin",
  "password": "$2a$10$encoded_bcrypt_hash",
  "clientId": "ADIDAS_INDIA",
  "dbId": "162",
  "clientName": "Adidas India",
  "themeColor": "#000000",
  "role": "client",
  "isActive": true,
  "pod": "POD 2",
  "marketplaces": ["FLIPKART", "MYNTRAV4"],
  "_class": "com.increff.returngenie.model.User",
  "createdAt": { "$date": "2026-04-24T10:00:00Z" },
  "updatedAt": { "$date": "2026-04-24T10:00:00Z" }
}
```

### Relationships and Indexing
* **Model:** Embedded document structure. No cross-referencing is used for Clients since a client's profile is atomic.
* **Indexes:** Though `spring.data.mongodb.auto-index-creation=false` is set in application properties, it is strictly recommended to create a Unique Index on the `username` field manually in production to prevent race conditions during client creation.

---

## 10. Database Connectivity

### Setup
Spring Boot handles connection via `spring-boot-starter-data-mongodb`.
**`application.properties` configuration:**
```properties
spring.data.mongodb.uri=${MONGODB_URI:mongodb://127.0.0.1:27017/return-genie}
```
* **Environment Variables:** The URI is injected at runtime using `${MONGODB_URI}`. If absent, it gracefully falls back to the localhost default.
* **Connection Pooling:** Managed internally by the underlying MongoDB Java Driver. Production environments should append `?maxPoolSize=50&w=majority` to the connection string for optimization and write-acknowledgment.

---

## 11. Module-wise Breakdown

### 1. Authentication & Admin Module
* **Flow:** Super Admin logs in -> Token validated -> Fetches list of all users from MongoDB -> Rendered in a grid grouped by `POD`.
* **Features:** Admin can toggle `isActive` (locks out clients), edit passwords, define operational Marketplaces, and permanently delete client entries.

### 2. Reconciliation Module (N8N Workflow)
The most critical backend automation module handled by N8N.
* **Webhook Entry (`Webhook1`):** Captures Multipart `file`, `marketplace`, `email`.
* **Routing (`Switch`):** Evaluates `={{ $json.body.marketplace.trim() }}`. Routes to Myntra or Flipkart workflows.
* **Myntra Extraction Pipeline:**
  1. `Myntra Extract` (XLSX node) parses the file.
  2. `Split Myntra` batches items in chunks of 3000 to prevent Webget API timeout.
  3. `Format Myntra IDs` executes JavaScript to map `seller_order_id` into a comma-separated SQL IN clause string (`'ID1','ID2'`).
  4. `Webget Myntra Query` makes an HTTP POST to Increff CIMS API (DB `162`), selecting from `cims.cims_return_order_pojo`.
  5. `Find Missing Myntra` runs Javascript to cross-reference Excel IDs against DB IDs. It formats the missing results (determining Customer Return vs Return To Origin).
  6. `File Myntra` creates a new XLSX from the missing JSON array.
  7. `Send Myntra` uses the Gmail API to email the XLSX back to the user defined by `$json.body.email`.

* **Flipkart Extraction Pipeline:**
  Operates similarly but involves a "Bridge" query.
  1. Validation node ensures `Order Item ID` exists.
  2. Queries DB `302` (Adidas Partner Order) to get the map of `channel_order_code` to `channel_order_line_id`.
  3. Uses the `line_id` to query DB `162` (CIMS).
  4. Javascript computes the missing diff and dispatches via Gmail.

---

## 12. Method-Level Explanation (CRITICAL)

### `AuthController.login()`
* **Purpose:** Authenticates user and issues JWT.
* **Input Parameters:** `@RequestBody LoginRequest body`
* **Internal Logic:**
  1. Calls `userRepository.findByUsername()`. Returns 401 if missing.
  2. Checks `user.isActive()`. Returns 403 Forbidden if deactivated.
  3. Executes `passwordEncoder.matches()` to compare plaintext vs Bcrypt hash.
  4. Constructs `HashMap` with claims (`clientId`, `dbId`, `role`).
  5. Calls `jwtService.generateToken(claims)`.
* **Output:** JSON containing `{ success: true, token: "...", user: {...} }`

### `SyncController.initialize()`
* **Purpose:** Acts as a secure proxy to N8N, appending JWT claims to the payload.
* **Input Parameters:** `@RequestParam MultipartFile file`, `marketplace`, `email`, `HttpServletRequest request`.
* **Internal Logic:**
  1. Basic validation (File empty? Marketplace null?).
  2. Extracts claims from `HttpServletRequest` attributes (placed there by `JwtAuthFilter`).
  3. Verifies `n8nWebhookUrl` config property exists.
  4. Uses `LinkedMultiValueMap` to reconstruct the `multipart/form-data` payload. Injects `clientId` securely from claims, preventing client-side spoofing.
  5. Executes `RestTemplate.postForEntity`.
* **Output:** `ResponseEntity` containing the proxy response from N8N.

### N8N JavaScript Node: `Find Missing Flipkart`
* **Purpose:** Computes the array difference between Database data and Excel Data.
* **Input:** Raw Webget TSV string and Original Excel JSON batch.
* **Internal Logic:**
  1. Splits raw data by tabs/newlines to construct `foundInCims` array.
  2. `.filter()` the original Excel rows. If the Excel ID (mapped through the FK Bridge object) is NOT included in `foundInCims`, keep it.
  3. `.map()` the filtered rows into a standardized schema: `channelOrderId`, `productId`, `returnOrderType` (RTO vs CUSTOMER_RETURN based on string parsing).
* **Output:** Clean JSON array representing purely the *Missing* return orders.

---

## 13. Authentication & Authorization

### JWT Implementation
The system utilizes Stateless JWT authentication.
* **Token Generation:** `JwtService.java` uses `io.jsonwebtoken` library. Signs payloads with HMAC-SHA encryption. Tokens expire after 12 hours (`jwt.expiration-hours`).
* **Validation & Authorization:** `JwtAuthFilter.java` intercepts every incoming request.
  * It extracts the `Bearer ` token from the `Authorization` header.
  * Parses claims. If expired or invalid, returns `401 Unauthorized`.
  * Passes claims down to Controllers via `request.setAttribute(CLAIMS_ATTRIBUTE, claims)`.
* **Role-Based Access Control (RBAC):** React frontend handles basic RBAC. The `/admin` path is heavily restricted to users whose claim indicates `role: 'admin'`.

---

## 14. Error Handling & Validation

### Backend Validation
* **Controllers:** Standard `if (file == null)` checks return `HttpStatus.BAD_REQUEST`.
* **Exception Handling:** Massive try/catch blocks wrap controller logic. Exceptions are logged via SLF4J (`log.error("Sync error", ex)`) and return generalized `HttpStatus.INTERNAL_SERVER_ERROR` payloads to prevent stack trace leaking.

### Frontend Validation
* **Form Logic:** Pre-flight checks inside `Dashboard.jsx`. Email string validation using robust regex. Marketplace dropdown defaults to an empty string to force manual selection.
* **API Error Responses:** The frontend explicitly looks for the `message` parameter inside the API payload. If N8N is disconnected, backend yields `503 Service Unavailable`, which frontend maps to a beautiful Red Error state UI.

---

## 15. Deployment Details

### Backend Deployment (Spring Boot)
* Process: `mvn clean package` generates a standalone `.jar` file containing embedded Tomcat.
* Execution: `java -jar target/returngenie-0.0.1-SNAPSHOT.jar`
* Environment Variables required: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `N8N_WEBHOOK_URL`.

### Frontend Deployment (React/Vite)
* Process: `npm run build` compiles React into static HTML/CSS/JS artifacts in the `/dist` folder.
* Execution: Deployed natively on an Nginx web server or cloud storage like AWS S3/CloudFront.

### N8N Deployment
* Should run via Docker or PM2. Requires custom HTTP auth credentials defined in the Webget HTTP request nodes.

---

## 16. Requirements

### Hardware Requirements
* **Backend Node:** Minimum 2 vCPU, 4GB RAM (Spring Boot can be memory-heavy during Multipart proxying).
* **Database:** Minimum 1GB RAM for MongoDB (No heavy relational joins).
* **N8N Instance:** 2 vCPU, 4GB RAM (In-memory array chunking of 3000 rows requires adequate RAM).

### Software Requirements
* Java Development Kit (JDK) 17+
* Node.js 18+ & NPM
* MongoDB 6.0+
* Maven 3.8+

---

## 17. Setup & Installation Guide

1. **Clone the Repository:**
   ```bash
   git clone <repository_url>
   cd "Return Genie in Java"
   ```

2. **Backend Setup:**
   ```bash
   cd backend-java
   # Create .env based on .env.example
   cp .env.example .env
   # Update MONGODB_URI and JWT_SECRET
   mvn clean install
   mvn spring-boot:run
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   # Ensure VITE_API_URL in .env points to backend
   npm run dev
   ```

4. **N8N Workflow Import:**
   Open your N8N UI, select `Import from File`, and upload the `workflow.json`. Update the Webhook URLs in your `.env`.

---

## 18. Challenges Faced

1. **Massive Payload Limits in Spring Boot:** Tomcat's default upload limit is 1MB. This was breaking large Excel file uploads.
   * *Solution:* Explicitly defined `spring.servlet.multipart.max-file-size=200MB` in `application.properties`.
2. **N8N Webhook Timeout:** Complex N8N workflows processing 3000+ rows take longer than the standard HTTP timeout.
   * *Solution:* Increased `n8n.timeout-millis` to `600000` (10 minutes) and implemented a "Processing..." terminal UI on the frontend so the user doesn't assume the app crashed.
3. **Database Relational Mapping in ETL:** Flipkart required mapping an `Order Item ID` to a `Channel Order Line ID` before it could query the central CIMS schema.
   * *Solution:* Engineered a two-step "Bridge" query node in N8N. The first DB call fetches a dictionary mapping, and JavaScript applies this dictionary dynamically to the second DB result.

---

## 19. Future Enhancements

* **Auto-Claim SPF Implementation:** Complete the "Coming Soon" feature in `SelectionHub.jsx`. This will require additional DB schema updates for Dispute configurations.
* **Horizontal Scalability:** Migrate N8N state to Redis or Postgres to allow multiple N8N worker nodes. Implement Spring Cloud Gateway if multiple Spring instances are required.
* **WebSocket Integration:** Replace the faux-terminal "Processing Data..." animation with actual real-time WebSocket logs streamed directly from N8N execution hooks.
* **Cloud Storage for Files:** Instead of passing binary files through Spring Boot Memory directly into N8N, upload files to S3 directly from React, and pass an S3 Pre-signed URL down the pipeline.

---

## 20. Conclusion

The **Return Genie** platform seamlessly bridges the gap between modern Web UX and complex enterprise ETL processes. By effectively splitting responsibilities—allowing React to handle dynamic aesthetics, Spring Boot to manage strict JWT security, and N8N to orchestrate heavy data array manipulation—the architecture ensures high maintainability, strict isolation, and impressive scalability. Its current design easily supports expanding to dozens of marketplaces and accommodating massive client bases with their specific database configurations.
