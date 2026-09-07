package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "employees")
public class Employee {
    @Id
    @Column(name = "employee_id")
    private String employeeId;
    
    private String password;
    private String name;
    private String role;
}
