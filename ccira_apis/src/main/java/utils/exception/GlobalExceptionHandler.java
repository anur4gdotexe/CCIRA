package utils.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(NoSuchElementException ex) {
        return ResponseEntity.status(404)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<Map<String, String>> handleSecurity(SecurityException ex) {
        return ResponseEntity.status(401)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException ex) {
        String message = ex.getMessage();

        // Auth failures — return 401
        if (message != null && (message.equals("Invalid credentials") || message.equals("No user found"))) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", message));
        }

        // Complaint routing — return 422 (request was valid but area isn't serviceable)
        if (message != null && message.equals("area not serviceable")) {
            return ResponseEntity.status(422)
                    .body(Map.of("error", "No admin body found for your location and complaint category."));
        }

        // Complaint not found
        if (message != null && message.startsWith("Complaint not found")) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", message));
        }

        // Fallback — 500
        return ResponseEntity.status(500)
                .body(Map.of("error", "An unexpected error occurred. Please try again."));
    }
}
