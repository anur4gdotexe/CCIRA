package utils.otp;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static final int OTP_EXPIRY_SECONDS = 600; // 10 minutes
    private static final SecureRandom random = new SecureRandom();

    // email → OtpEntry
    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();

    public String generate(String email) {
        String otp = String.format("%06d", random.nextInt(1_000_000));
        store.put(email, new OtpEntry(otp, Instant.now().plusSeconds(OTP_EXPIRY_SECONDS)));
        return otp;
    }

    public boolean verify(String email, String otp) {
        OtpEntry entry = store.get(email);
        if (entry == null) return false;
        if (Instant.now().isAfter(entry.expiry())) {
            store.remove(email);
            return false;
        }
        boolean match = entry.otp().equals(otp);
        if (match) store.remove(email);
        return match;
    }

    public void invalidate(String email) {
        store.remove(email);
    }

    private record OtpEntry(String otp, Instant expiry) {}
}
