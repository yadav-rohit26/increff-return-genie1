package com.increff.returngenie.seed;

import com.increff.returngenie.model.User;
import com.increff.returngenie.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Seeds the users collection. Runs only when the application is started with --seed,
 * mirroring `npm run seed` for the Node version. Wipes existing users first.
 */
@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!args.containsOption("seed")) {
            return;
        }

        log.info("Seeding database…");
        userRepository.deleteAll();
        log.info("Cleared existing users");

        List<ClientSpec> clients = List.of(
                new ClientSpec("adidas", "Adidas", "#000000"),
                new ClientSpec("puma", "Puma", "#d60000"),
                new ClientSpec("bata", "Bata", "#4ab75cff"),
                new ClientSpec("agilitas", "Agilitas", "#5c54a4"),
                new ClientSpec("xtep", "Xtep", "#88d11bff"),
                new ClientSpec("thck", "THCK", "#c5b358"),
                new ClientSpec("damensch", "Damensch", "#002554"),
                new ClientSpec("indianterrain", "Indian Terrain", "#2b2a29"),
                new ClientSpec("kisah", "Kisah", "#0b3d60"),
                new ClientSpec("cantabil", "Cantabil", "#004785"),
                new ClientSpec("celio", "Celio", "#4A4A4A"),
                new ClientSpec("baccarose", "Baccarose", "#A85A32"),
                new ClientSpec("whattheflex", "What The Flex", "#2563EB"),
                new ClientSpec("birkenstock", "Birkenstock", "#004D40"),
                new ClientSpec("miniklub", "Miniklub", "#D81B60"),
                new ClientSpec("fknits", "Fknits", "#6D28D9"),
                new ClientSpec("landmarkindia", "Landmark India", "#B91C1C"),
                new ClientSpec("piqit", "Piqit", "#059669"),
                new ClientSpec("eccoshoes", "Eccoshoes", "#1E3A8A")
        );

        String hashedDefault = passwordEncoder.encode("password123");

        List<User> toInsert = new ArrayList<>();
        for (ClientSpec spec : clients) {
            User u = new User();
            u.setUsername(spec.username());
            u.setPassword(hashedDefault);
            u.setClientName(spec.clientName());
            u.setThemeColor(spec.themeColor());
            u.setRole("client");
            u.setActive(true);
            u.setPod("POD 2");
            toInsert.add(u);
        }

        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(hashedDefault);
        admin.setClientName("Increff Admin");
        admin.setRole("admin");
        admin.setActive(true);
        toInsert.add(admin);

        userRepository.saveAll(toInsert);
        log.info("Database seeded successfully! Inserted {} users.", toInsert.size());
    }

    private record ClientSpec(String username, String clientName, String themeColor) {
    }
}
