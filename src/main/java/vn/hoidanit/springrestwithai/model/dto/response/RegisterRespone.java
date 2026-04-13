package vn.hoidanit.springrestwithai.model.dto.response;

public class RegisterRespone {
    private Long id;
    private String email;
    private String name;

    public RegisterRespone(Long id, String email, String name) {
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
