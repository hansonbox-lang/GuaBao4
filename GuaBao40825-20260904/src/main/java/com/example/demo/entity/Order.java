package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Integer orderId;
    
    @Column(name = "member_id")
    private String memberId;
    
    @Column(name = "total_amount")
    private Integer totalAmount;
    
    @Column(name = "earned_points")
    private Integer earnedPoints;
    
    @Column(name = "gift_count")
    private Integer giftCount;
}
