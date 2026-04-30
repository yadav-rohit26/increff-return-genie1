package com.increff.returngenie.controller;

import com.increff.returngenie.dto.CreateClientRequest;
import com.increff.returngenie.dto.LoginRequest;
import com.increff.returngenie.dto.ToggleStatusRequest;
import com.increff.returngenie.dto.UpdateClientRequest;
import com.increff.returngenie.dto.UserResponse;
import com.increff.returngenie.model.User;
import com.increff.returngenie.repository.UserRepository;
import com.increff.returngenie.service.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository,
                          BCryptPasswordEncoder passwordEncoder,
                          JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest body) {
        try {
            Optional<User> userOpt = userRepository.findByUsername(body.getUsername());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Invalid Credentials"));
            }
            User user = userOpt.get();

            if (!user.isActive()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("success", false, "message", "Account Deactivated"));
            }

            if (!passwordEncoder.matches(body.getPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Invalid Credentials"));
            }

            Map<String, Object> claims = new HashMap<>();
            claims.put("userId", user.getUsername());
            claims.put("username", user.getUsername());
            claims.put("clientId", user.getClientId());
            claims.put("dbId", user.getDbId());
            claims.put("id", user.getId());
            claims.put("role", user.getRole());

            String token = jwtService.generateToken(claims);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "token", token,
                    "user", UserResponse.from(user)
            ));
        } catch (Exception e) {
            log.error("Login error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Server error"));
        }
    }

    @PostMapping("/toggle-status")
    public ResponseEntity<?> toggleStatus(@RequestBody ToggleStatusRequest body) {
        try {
            Optional<User> userOpt = userRepository.findById(body.getClientId());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "User not found"));
            }
            User user = userOpt.get();
            user.setActive(!user.isActive());
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("success", true, "isActive", user.isActive()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Server error"));
        }
    }

    @PostMapping("/client")
    public ResponseEntity<?> createClient(@RequestBody CreateClientRequest body) {
        try {
            if (userRepository.existsByUsername(body.getUsername())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "Username already exists"));
            }

            User user = new User();
            user.setUsername(body.getUsername());
            user.setPassword(passwordEncoder.encode(body.getPassword()));
            user.setClientName(body.getClientName());
            user.setDbId(body.getDbId());
            user.setThemeColor(body.getThemeColor() != null ? body.getThemeColor() : "#000000");
            user.setRole("client");
            user.setPod(body.getPod() != null ? body.getPod() : "POD 2");
            if (body.getMarketplaces() != null) {
                user.setMarketplaces(body.getMarketplaces());
            }

            User saved = userRepository.save(user);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("success", true, "user", saved));
        } catch (Exception e) {
            log.error("Create client error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Server error"));
        }
    }

    @PutMapping("/client/{id}")
    public ResponseEntity<?> updateClient(@PathVariable("id") String id, @RequestBody UpdateClientRequest body) {
        try {
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "User not found"));
            }
            User user = userOpt.get();
            
            if (body.getPassword() != null && !body.getPassword().trim().isEmpty()) {
                user.setPassword(passwordEncoder.encode(body.getPassword()));
            }
            if (body.getMarketplaces() != null) {
                user.setMarketplaces(body.getMarketplaces());
            }
            
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("success", true, "user", UserResponse.from(user)));
        } catch (Exception e) {
            log.error("Update client error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Server error"));
        }
    }

    @DeleteMapping("/client/{id}")
    public ResponseEntity<?> deleteClient(@PathVariable("id") String id) {
        try {
            if (!userRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Client not found"));
            }
            userRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Client deleted successfully"));
        } catch (Exception e) {
            log.error("Delete client error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Server error"));
        }
    }

    @GetMapping("/clients")
    public ResponseEntity<?> getClients() {
        try {
            List<UserResponse> clients = userRepository.findByRole("client").stream()
                    .map(UserResponse::from)
                    .toList();
            return ResponseEntity.ok(Map.of("success", true, "clients", clients));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Server error"));
        }
    }
}
