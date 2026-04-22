package vn.hoidanit.springrestwithai.features.auth.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {

    @NotBlank(message = "So dien thoai khong duoc de trong")
    @Pattern(regexp = "^\\+?\\d{10,15}$", message = "So dien thoai khong hop le (10-15 chu so, co the co +)")
    private String phone;

    @NotBlank(message = "OTP khong duoc de trong")
    @Pattern(regexp = "\\d{6}", message = "OTP phai gom 6 chu so")
    private String otp;

    @NotBlank(message = "Mat khau moi khong duoc de trong")
    @Size(min = 8, max = 72, message = "Mat khau moi phai tu 8 den 72 ky tu")
    private String newPassword;

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
