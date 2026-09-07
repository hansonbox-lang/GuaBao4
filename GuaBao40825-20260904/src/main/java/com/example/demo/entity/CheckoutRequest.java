package com.example.demo.entity;

import lombok.Data;
import java.util.List;

@Data // Lombok 會自動產生 Getter, Setter, toString 等方法
public class CheckoutRequest {
    private String memberId;
    private int totalAmount;
    private List<OrderItem> items;
}
