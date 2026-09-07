package com.example.demo.entity;

import lombok.Data;

@Data
public class OrderItem {
    private String itemName;
    private int unitPrice;
    private int quantity;
}
