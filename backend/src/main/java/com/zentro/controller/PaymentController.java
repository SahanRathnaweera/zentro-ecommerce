package com.zentro.controller;

import com.zentro.entity.Order;
import com.zentro.entity.PaymentStatus;
import com.zentro.repository.OrderRepository;
import com.zentro.service.PayHereService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PayHereService payHere;
    private final OrderRepository orderRepository;

    public PaymentController(PayHereService payHere, OrderRepository orderRepository) {
        this.payHere = payHere;
        this.orderRepository = orderRepository;
    }

    // Public: form fields for the PayHere page. Order id + email must match.
    @GetMapping("/payhere-form")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> form(@RequestParam Long orderId,
                                                    @RequestParam String email,
                                                    @RequestParam String returnUrl,
                                                    @RequestParam String cancelUrl) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!order.getContactEmail().equalsIgnoreCase(email.trim())
                || order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        Map<String, String> fields = payHere.buildFormFields(
                order.getId(), order.getTotalAmount(), order.getShippingName(),
                order.getContactEmail(), order.getShippingPhone(), order.getShippingAddress(),
                returnUrl, cancelUrl);
        return ResponseEntity.ok(Map.of("url", payHere.checkoutUrl(), "fields", fields));
    }

    // Called by PayHere's server (not the browser)
    @PostMapping("/notify")
    @Transactional
    public ResponseEntity<Void> notify(@RequestParam("merchant_id") String merchantId,
                                       @RequestParam("order_id") String orderId,
                                       @RequestParam("payhere_amount") String amount,
                                       @RequestParam("payhere_currency") String currency,
                                       @RequestParam("status_code") String statusCode,
                                       @RequestParam("md5sig") String md5sig) {
        if (!payHere.verifyNotify(merchantId, orderId, amount, currency, statusCode, md5sig)) {
            return ResponseEntity.badRequest().build();
        }
        Order order = orderRepository.findById(Long.parseLong(orderId)).orElse(null);
        if (order == null || !PayHereService.format(order.getTotalAmount()).equals(amount)) {
            return ResponseEntity.badRequest().build();
        }
        // status_code 2 = success
        order.setPaymentStatus("2".equals(statusCode) ? PaymentStatus.PAID : PaymentStatus.FAILED);
        return ResponseEntity.ok().build();
    }
}
