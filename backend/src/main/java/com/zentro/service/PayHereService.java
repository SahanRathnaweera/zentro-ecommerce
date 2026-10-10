package com.zentro.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class PayHereService {
    private final String merchantId;
    private final String merchantSecret;
    private final String checkoutUrl;
    private final String notifyUrl;

    public PayHereService(@Value("${payhere.merchant-id}") String merchantId,
                          @Value("${payhere.merchant-secret}") String merchantSecret,
                          @Value("${payhere.sandbox-url}") String checkoutUrl,
                          @Value("${payhere.notify-url}") String notifyUrl) {
        this.merchantId = merchantId;
        this.merchantSecret = merchantSecret;
        this.checkoutUrl = checkoutUrl;
        this.notifyUrl = notifyUrl;
    }

    public String checkoutUrl() {
        return checkoutUrl;
    }

    public Map<String, String> buildFormFields(Long orderId, BigDecimal total, String name,
                                               String email, String phone, String address,
                                               String returnUrl, String cancelUrl) {
        String amount = format(total);
        Map<String, String> f = new LinkedHashMap<>();
        f.put("merchant_id", merchantId);
        f.put("return_url", returnUrl);
        f.put("cancel_url", cancelUrl);
        f.put("notify_url", notifyUrl);
        f.put("order_id", String.valueOf(orderId));
        f.put("items", "Zentro Order #" + orderId);
        f.put("currency", "LKR");
        f.put("amount", amount);
        f.put("first_name", name);
        f.put("last_name", "-");
        f.put("email", email);
        f.put("phone", phone);
        f.put("address", address);
        f.put("city", "Sri Lanka");
        f.put("country", "Sri Lanka");
        f.put("hash", md5(merchantId + orderId + amount + "LKR" + md5(merchantSecret)));
        return f;
    }

    // Checks the signature PayHere sends us
    public boolean verifyNotify(String merchantIdIn, String orderId, String amount,
                                String currency, String statusCode, String md5sig) {
        if (md5sig == null) return false;
        String local = md5(merchantIdIn + orderId + amount + currency + statusCode + md5(merchantSecret));
        return local.equalsIgnoreCase(md5sig) && merchantId.equals(merchantIdIn);
    }

    public static String format(BigDecimal v) {
        return v.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    private static String md5(String text) {
        try {
            byte[] d = MessageDigest.getInstance("MD5").digest(text.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : d) sb.append(String.format("%02X", b));
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
