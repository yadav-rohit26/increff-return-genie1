package com.increff.returngenie.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.increff.returngenie.service.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

/**
 * Mirrors the Node verifyToken middleware: only enforces a Bearer JWT on
 * routes that the original express server protected (currently /api/sync/**).
 * Verified claims are stored on the request as the "jwtClaims" attribute.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    public static final String CLAIMS_ATTRIBUTE = "jwtClaims";

    private final JwtService jwtService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        return !request.getRequestURI().startsWith("/api/sync");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            writeError(response, 401, "Access denied. No token provided.");
            return;
        }
        String token = authHeader.substring("Bearer ".length()).trim();
        try {
            Claims claims = jwtService.parseToken(token);
            request.setAttribute(CLAIMS_ATTRIBUTE, claims);
        } catch (Exception ex) {
            writeError(response, 401, "Invalid token.");
            return;
        }
        chain.doFilter(request, response);
    }

    private void writeError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), Map.of(
                "success", false,
                "message", message
        ));
    }
}
