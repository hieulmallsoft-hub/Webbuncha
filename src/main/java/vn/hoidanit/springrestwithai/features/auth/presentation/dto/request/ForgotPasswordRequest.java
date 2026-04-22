package vn.hoidanit.springrestwithai.features.auth.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ForgotPasswordRequest {

    @NotBlank(message = "So dien thoai khong duoc de trong")
    @Pattern(regexp = "^\\+?\\d{10,15}$", message = "So dien thoai khong hop le (10-15 chu so, co the co +)")
    private String phone;

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
