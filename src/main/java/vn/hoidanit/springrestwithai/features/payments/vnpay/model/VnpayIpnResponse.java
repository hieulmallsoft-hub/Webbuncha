package vn.hoidanit.springrestwithai.features.payments.vnpay.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class VnpayIpnResponse {

    private String rspCode;
    private String message;

    public VnpayIpnResponse(String rspCode, String message) {
        this.rspCode = rspCode;
        this.message = message;
    }

    // VNPay expects exact field names: RspCode, Message
    @JsonProperty("RspCode")
    public String getRspCode() {
        return rspCode;
    }

    @JsonProperty("Message")
    public String getMessage() {
        return message;
    }
}
