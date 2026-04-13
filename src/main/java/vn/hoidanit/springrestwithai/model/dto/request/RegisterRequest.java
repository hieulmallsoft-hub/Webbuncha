package vn.hoidanit.springrestwithai.model.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import vn.hoidanit.springrestwithai.model.User;

public class RegisterRequest {

    @NotBlank(message = "Name khong duoc de trong")
    @Size(max = 255, message = "Name khong duoc qua 255 ky tu")
    private String name;

    @NotBlank(message = "Email khong duoc de trong")
    @Email(message = "Email khong dung dinh dang")
    private String email;

    @NotBlank(message = "Password khong duoc de trong")
    @Size(min = 6, max = 255, message = "Password phai tu 6 den 255 ky tu")
    private String password;

    @Min(value = 1, message = "Tuoi phai lon hon 0")
    @Max(value = 150, message = "Tuoi khong hop le")
    private Integer age;

    @Size(max = 255, message = "Dia chi khong duoc qua 255 ky tu")
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
        user.setEmail(this.email);
        user.setPassword(this.password);
        user.setAge(this.age);
        user.setAddress(this.address);
        return user;
    }
}
