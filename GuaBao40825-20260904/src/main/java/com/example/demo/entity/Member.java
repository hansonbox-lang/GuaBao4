package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "members")
public class Member {
    @Id
    @Column(name = "member_id")
    private String memberId;
    
    @Column(name = "total_points")
    private Integer totalPoints;
}
