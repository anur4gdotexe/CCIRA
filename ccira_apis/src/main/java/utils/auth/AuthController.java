package utils.auth;

import com.ccira_apis.admin_bodies.AdminBodyRepository;
import com.ccira_apis.users.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final JwtUtil jwtUtil;

    private final AdminBodyRepository adminBodyRepository;
    private final UserRepository userRepository;

    public AuthController (JwtUtil jwtUtil,
                           AdminBodyRepository adminBodyRepository,
                           UserRepository userRepository) {
        this.jwtUtil = jwtUtil;

        this.adminBodyRepository = adminBodyRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginDTO request) {
        if (request.getUserId() == null || request.getUserId().isBlank() ||
            request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("User ID and password are required");
        }

        String password;
        List<String> roles;

        if (adminBodyRepository.existsById(request.getUserId())) {
            password = adminBodyRepository.findById(request.getUserId()).get().getPassword();
            roles = List.of("ROLE_ADMIN");
        } else if (userRepository.existsById(request.getUserId())) {
            password = userRepository.findById(request.getUserId()).get().getPassword();
            roles = List.of("ROLE_USER");
        } else {
            throw new RuntimeException("No user found");
        }

        if (!password.equals(request.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return ResponseEntity.ok(jwtUtil.generateToken(request.getUserId(), roles));
    }
}
