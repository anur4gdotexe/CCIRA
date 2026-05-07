package utils.auth;

import com.ccira_apis.admin_bodies.AdminBodyRepository;
import com.ccira_apis.users.RegisterDTO;
import com.ccira_apis.users.User;
import com.ccira_apis.users.UserRepository;
import com.ccira_apis.users.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final JwtUtil jwtUtil;
    private final AdminBodyRepository adminBodyRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public AuthController(JwtUtil jwtUtil,
                          AdminBodyRepository adminBodyRepository,
                          UserRepository userRepository,
                          UserService userService) {
        this.jwtUtil = jwtUtil;
        this.adminBodyRepository = adminBodyRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    // ─── Login ────────────────────────────────────────────────────────────────
    // Accepts userId OR email in the "identifier" field
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginDTO request) {
        if (request.getIdentifier() == null || request.getIdentifier().isBlank() ||
            request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Identifier and password are required");
        }

        String identifier = request.getIdentifier().trim();
        String password;
        List<String> roles;

        // Check admins first (admins only log in by ID)
        if (adminBodyRepository.existsById(identifier)) {
            password = adminBodyRepository.findById(identifier).get().getPassword();
            roles = List.of("ROLE_ADMIN");

        } else {
            // Try user by ID, then by email
            final String lookupKey = identifier;
            Optional<User> userOpt = userRepository.findById(lookupKey)
                    .or(() -> userRepository.findByEmail(lookupKey));

            User user = userOpt.orElseThrow(() -> new RuntimeException("No user found"));
            password = user.getPassword();
            roles = List.of("ROLE_USER");
            identifier = user.getUserId(); // always put userId in the token
        }

        if (!password.equals(request.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return ResponseEntity.ok(jwtUtil.generateToken(identifier, roles));
    }

    // ─── Register step 1: send OTP ────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody RegisterDTO dto) {
        userService.initiateRegistration(dto);
        return ResponseEntity.ok(Map.of("message", "OTP sent to " + dto.getEmail()));
    }

    // ─── Register step 2: verify OTP and create account ──────────────────────
    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(@RequestBody VerifyOtpDTO dto) {
        User user = userService.completeRegistration(dto.toRegisterDTO(), dto.getOtp());
        return ResponseEntity.status(201).body(Map.of(
                "message", "Registration successful",
                "userId", user.getUserId()
        ));
    }
}
