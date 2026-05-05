package com.increff.returngenie.controller;

import com.increff.returngenie.security.JwtAuthFilter;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

/**
 * Proxies sync requests to n8n webhook.
 * Uses raw HttpURLConnection to send multipart/form-data EXACTLY
 * like a browser would (no extra Content-Type on text parts),
 * ensuring n8n parses text fields into $json.body correctly.
 */
@RestController
@RequestMapping("/api/sync")
public class SyncController {

    private static final Logger log = LoggerFactory.getLogger(SyncController.class);

    private final String n8nWebhookUrl;
    private final int timeoutMillis;

    public SyncController(@Value("${n8n.webhook.url}") String n8nWebhookUrl,
                           @Value("${n8n.timeout-millis}") int timeoutMillis) {
        this.n8nWebhookUrl = n8nWebhookUrl;
        this.timeoutMillis = timeoutMillis;
    }

    @PostMapping(value = "/initialize", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> initialize(@RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "marketplace", required = false) String marketplace,
            @RequestParam(value = "email", required = false) String email,
            HttpServletRequest request) {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "File is required"));
        }
        if (!StringUtils.hasText(marketplace)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Marketplace is required"));
        }

        if (!StringUtils.hasText(n8nWebhookUrl)) {
            log.error("N8N_WEBHOOK_URL is disconnected. Failing sync.");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("success", false,
                            "message", "n8n is disconnected. Cannot process reconciliation."));
        }

        // Extract userId from JWT or use the email provided
        Claims claims = (Claims) request.getAttribute(JwtAuthFilter.CLAIMS_ATTRIBUTE);
        String jwtUserId = claims != null ? claims.get("userId", String.class) : null;
        String userId = StringUtils.hasText(email) ? email : jwtUserId;

        log.info(">>> Sync request: marketplace={}, userId={}, fileName={}, fileSize={}",
                marketplace, userId, file.getOriginalFilename(), file.getSize());

        try {
            String boundary = "----N8nBoundary" + UUID.randomUUID().toString().replace("-", "");
            byte[] body = buildMultipartBody(boundary, marketplace, userId, file);

            log.info(">>> Sending to n8n: url={}, bodySize={}", n8nWebhookUrl, body.length);

            // Use raw HttpURLConnection for precise control over multipart encoding
            HttpURLConnection conn = (HttpURLConnection) URI.create(n8nWebhookUrl).toURL().openConnection();
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);
            conn.setConnectTimeout(60_000);
            conn.setReadTimeout(timeoutMillis);
            conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);
            conn.setRequestProperty("Content-Length", String.valueOf(body.length));

            try (OutputStream os = conn.getOutputStream()) {
                os.write(body);
                os.flush();
            }

            int status = conn.getResponseCode();
            String responseBody;
            try (var is = (status >= 200 && status < 300) ? conn.getInputStream() : conn.getErrorStream()) {
                responseBody = is != null ? new String(is.readAllBytes(), StandardCharsets.UTF_8) : "";
            }

            log.info(">>> n8n response: status={}, body={}", status,
                    responseBody.length() > 500 ? responseBody.substring(0, 500) + "..." : responseBody);

            if (status >= 200 && status < 300) {
                // Parse response JSON
                var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                Object data = Map.of();
                try { data = mapper.readValue(responseBody, Object.class); } catch (Exception ignored) {}
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Sync initialized successfully",
                        "data", data));
            } else {
                // n8n returned an error
                String errorMsg = "n8n processing error (HTTP " + status + ")";
                try {
                    var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    var node = mapper.readTree(responseBody);
                    if (node.has("message")) {
                        errorMsg = node.get("message").asText();
                    }
                } catch (Exception ignored) {}
                log.error("N8N returned error status {}: {}", status, responseBody);
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(Map.of("success", false, "message", errorMsg));
            }

        } catch (java.net.ConnectException | java.net.SocketTimeoutException ex) {
            log.error("N8N is unreachable: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("success", false,
                            "message", "n8n is disconnected. Cannot process reconciliation."));
        } catch (Exception ex) {
            log.error("Sync error: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to initialize sync with n8n"));
        }
    }

    /**
     * Builds a multipart/form-data body EXACTLY like a browser would.
     * Text parts have NO Content-Type header — just Content-Disposition.
     * This ensures n8n's busboy parser puts them in $json.body (not $binary).
     */
    private byte[] buildMultipartBody(String boundary, String marketplace,
                                       String userId, MultipartFile file) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        String crlf = "\r\n";

        // --- Text part: marketplace (NO Content-Type header!) ---
        baos.write(("--" + boundary + crlf).getBytes(StandardCharsets.UTF_8));
        baos.write(("Content-Disposition: form-data; name=\"marketplace\"" + crlf).getBytes(StandardCharsets.UTF_8));
        baos.write(crlf.getBytes(StandardCharsets.UTF_8));
        baos.write(marketplace.getBytes(StandardCharsets.UTF_8));
        baos.write(crlf.getBytes(StandardCharsets.UTF_8));

        // --- Text part: userId (NO Content-Type header!) ---
        if (StringUtils.hasText(userId)) {
            baos.write(("--" + boundary + crlf).getBytes(StandardCharsets.UTF_8));
            baos.write(("Content-Disposition: form-data; name=\"userId\"" + crlf).getBytes(StandardCharsets.UTF_8));
            baos.write(crlf.getBytes(StandardCharsets.UTF_8));
            baos.write(userId.getBytes(StandardCharsets.UTF_8));
            baos.write(crlf.getBytes(StandardCharsets.UTF_8));
        }

        // --- File part: file (WITH Content-Type header) ---
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload";
        String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
        baos.write(("--" + boundary + crlf).getBytes(StandardCharsets.UTF_8));
        baos.write(("Content-Disposition: form-data; name=\"file\"; filename=\"" + filename + "\"" + crlf)
                .getBytes(StandardCharsets.UTF_8));
        baos.write(("Content-Type: " + contentType + crlf).getBytes(StandardCharsets.UTF_8));
        baos.write(crlf.getBytes(StandardCharsets.UTF_8));
        baos.write(file.getBytes());
        baos.write(crlf.getBytes(StandardCharsets.UTF_8));

        // --- End boundary ---
        baos.write(("--" + boundary + "--" + crlf).getBytes(StandardCharsets.UTF_8));

        return baos.toByteArray();
    }
}
