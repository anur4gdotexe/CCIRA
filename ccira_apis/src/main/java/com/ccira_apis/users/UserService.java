package com.ccira_apis.users;

import com.ccira_apis.counter.CounterService;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import utils.otp.OtpService;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CounterService counterService;
    private final OtpService otpService;
    private final JavaMailSender mailSender;

    public UserService(UserRepository userRepository,
                       CounterService counterService,
                       OtpService otpService,
                       JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.counterService = counterService;
        this.otpService = otpService;
        this.mailSender = mailSender;
    }

    /**
     * Step 1 — validate fields, check duplicates, send OTP.
     * The user is NOT saved yet at this point.
     */
    public void initiateRegistration(RegisterDTO dto) {
        if (dto.getUsername() == null || dto.getUsername().isBlank())
            throw new IllegalArgumentException("Username is required");
        if (dto.getEmail() == null || dto.getEmail().isBlank())
            throw new IllegalArgumentException("Email is required");
        if (dto.getPassword() == null || dto.getPassword().length() < 6)
            throw new IllegalArgumentException("Password must be at least 6 characters");

        if (userRepository.existsByEmail(dto.getEmail()))
            throw new IllegalArgumentException("An account with this email already exists");
        if (userRepository.existsByUsername(dto.getUsername()))
            throw new IllegalArgumentException("This username is already taken");

        String otp = otpService.generate(dto.getEmail());
        sendOtpEmail(dto.getEmail(), otp);
    }

    /**
     * Step 2 — verify OTP and save the user.
     * Returns the newly created User (with generated ID).
     */
    public User completeRegistration(RegisterDTO dto, String otp) {
        if (!otpService.verify(dto.getEmail(), otp))
            throw new IllegalArgumentException("Invalid or expired OTP");

        // Re-check duplicates in case someone registered between step 1 and step 2
        if (userRepository.existsByEmail(dto.getEmail()))
            throw new IllegalArgumentException("An account with this email already exists");
        if (userRepository.existsByUsername(dto.getUsername()))
            throw new IllegalArgumentException("This username is already taken");

        String userId = counterService.generateId("users_counter", "U", 3);

        User user = new User();
        user.setUserId(userId);
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());

        return userRepository.save(user);
    }

    private void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your CCIRA verification code");
        message.setText("Your OTP is: " + otp + "\n\nThis code expires in 10 minutes.");
        mailSender.send(message);
    }
}
