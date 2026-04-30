package com.increff.returngenie.controller;

import com.increff.returngenie.security.JwtAuthFilter;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/sync")
public class SyncController {

    private static final Logger log = LoggerFactory.getLogger(SyncController.class);

    private final RestTemplate n8nRestTemplate;
    private final String n8nWebhookUrl;

    public SyncController(RestTemplate n8nRestTemplate,
                          @Value("${n8n.webhook.url}") String n8nWebhookUrl) {
        this.n8nRestTemplate = n8nRestTemplate;
        this.n8nWebhookUrl = n8nWebhookUrl;
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

        Claims claims = (Claims) request.getAttribute(JwtAuthFilter.CLAIMS_ATTRIBUTE);
        String clientId = claims != null ? claims.get("clientId", String.class) : null;
        String jwtUserId = claims != null ? claims.get("userId", String.class) : null;

        if (!StringUtils.hasText(n8nWebhookUrl)) {
            log.error("N8N_WEBHOOK_URL is disconnected. Failing sync.");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("success", false,
                            "message", "n8n is disconnected. Cannot process reconciliation."));
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> form = new LinkedMultiValueMap<>();
            form.add("file", buildFilePart(file));
            form.add("marketplace", marketplace);
            if (StringUtils.hasText(clientId)) {
                form.add("clientId", clientId);
            }
            String finalUserId = StringUtils.hasText(email) ? email : jwtUserId;
            if (StringUtils.hasText(finalUserId)) {
                form.add("userId", finalUserId);
            }

            HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(form, headers);
            ResponseEntity<Object> n8nResponse =
                    n8nRestTemplate.postForEntity(n8nWebhookUrl, entity, Object.class);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Sync initialized successfully",
                    "data", n8nResponse.getBody() != null ? n8nResponse.getBody() : Map.of()
            ));
        } catch (Exception ex) {
            log.error("Sync error: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to initialize sync with n8n"));
        }
    }

    private ByteArrayResource buildFilePart(MultipartFile file) throws IOException {
        byte[] bytes = file.getBytes();
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload";
        return new ByteArrayResource(bytes) {
            @Override
            public String getFilename() {
                return filename;
            }

            @Override
            public long contentLength() {
                return bytes.length;
            }
        };
    }
}
