package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "order_details")
public class OrderDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "detail_id")
    private Integer detailId;
    
    @Column(name = "order_id")
    private Integer orderId;
    
    @Column(name = "item_name")
    private String itemName;
    
    @Column(name = "unit_price")
    private Integer unitPrice;
    
    private Integer quantity;
    private Integer subtotal;
}
