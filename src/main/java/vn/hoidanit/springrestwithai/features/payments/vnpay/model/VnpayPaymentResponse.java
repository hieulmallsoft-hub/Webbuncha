package vn.hoidanit.springrestwithai.features.payments.vnpay.model;

public class VnpayPaymentResponse {

    private Long orderId;
    private String paymentUrl;
    private String txnRef;
    private Long amount;

    public VnpayPaymentResponse(Long orderId, String paymentUrl, String txnRef, Long amount) {
        this.orderId = orderId;
        this.paymentUrl = paymentUrl;
        this.txnRef = txnRef;
        this.amount = amount;
    }

    public Long getOrderId() {
        return orderId;
    }

    public String getPaymentUrl() {
        return paymentUrl;
    }

    public String getTxnRef() {
        return txnRef;
    }

    public Long getAmount() {
        return amount;
    }
}
