package vn.hoidanit.springrestwithai.features.auth.presentation.dto.response;

public class RegisterResponse {
    private Long id;
    private String email;
    private String name;

    public RegisterResponse(Long id, String email, String name) {
        this.email = email;
        this.name = name;
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }
}

