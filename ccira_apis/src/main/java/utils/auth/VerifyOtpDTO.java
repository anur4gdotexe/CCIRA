package utils.auth;

import com.ccira_apis.users.RegisterDTO;

public class VerifyOtpDTO {
    private String username;
    private String email;
    private String password;
    private String otp;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public RegisterDTO toRegisterDTO() {
        RegisterDTO dto = new RegisterDTO();
        dto.setUsername(this.username);
        dto.setEmail(this.email);
        dto.setPassword(this.password);
        return dto;
    }
}
