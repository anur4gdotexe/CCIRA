package utils.auth;

public class LoginDTO {
    // Accepts either a userId (e.g. "U001") or an email address
    private String identifier;
    private String password;

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
