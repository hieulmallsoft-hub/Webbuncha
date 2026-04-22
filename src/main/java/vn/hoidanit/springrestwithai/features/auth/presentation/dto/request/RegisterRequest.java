package vn.hoidanit.springrestwithai.features.auth.presentation.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.Locale;

import vn.hoidanit.springrestwithai.model.User;

public class RegisterRequest {

    @NotBlank(message = "Name must not be blank")
    @Size(max = 255, message = "Name must be at most 255 characters")
    private String name;

    @NotBlank(message = "Email must not be blank")
    @Email(message = "Email must be a valid email address")
    private String email;

    @NotBlank(message = "Password must not be blank")
    @Size(min = 6, max = 255, message = "Password must be between 6 and 255 characters")
    private String password;

    @NotBlank(message = "Phone must not be blank")
    @Pattern(regexp = "^\\+?\\d{10,15}$", message = "Phone must be E.164 (10-15 digits, optional +)")
    private String phone;

    @Min(value = 1, message = "Age must be greater than 0")
    @Max(value = 150, message = "Age is not valid")
    private Integer age;

    @Size(max = 255, message = "Address must be at most 255 characters")
    private String address;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public User toUser() {
        User user = new User();
        user.setName(this.name);
        user.setEmail(normalizeEmail(this.email));
        user.setPassword(this.password);
        user.setPhone(normalizePhone(this.phone));
        user.setAge(this.age);
        user.setAddress(this.address);
        return user;
    }

    private String normalizeEmail(String value) {
        return value == null ? null : value.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizePhone(String value) {
        if (value == null) {
            return null;
        }
        return value.trim().replaceAll("\\s+", "");
    }
}
