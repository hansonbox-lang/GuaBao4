package com.example.demo.controller;

//package com.guabao.controller;

//import com.guabao.entity.*;
//import com.guabao.repository.*;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
//@CrossOrigin(origins = "*") // 允許前端跨域請求
//@CrossOrigin // 允許前端跨域請求
public class GuaBao4Controller {

    @Autowired private EmployeeRepository empRepo;
    @Autowired private MemberRepository memRepo;
    @Autowired private OrderRepository orderRepo;
    @Autowired private OrderDetailRepository detailRepo;

    // --- 1. 登入 REST API ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String id = payload.get("employee_id");
        String pass = payload.get("password");
        Optional<Employee> emp = empRepo.findById(id);
        if (emp.isPresent() && emp.get().getPassword().equals(pass)) {
            return ResponseEntity.ok(emp.get());
        }
        return ResponseEntity.status(401).body("帳號或密碼錯誤");
    }

    // --- 2. 員工管理 REST API ---
    @GetMapping("/employees")
    public List<Employee> getAllEmployees() { return empRepo.findAll(); }

    @PostMapping("/employees")
    public ResponseEntity<?> createEmployee(@RequestBody Employee emp) {
        if(empRepo.existsById(emp.getEmployeeId())) {
            return ResponseEntity.badRequest().body("員工帳號已存在");
        }
        return ResponseEntity.ok(empRepo.save(emp));
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable String id, @RequestBody Employee emp) {
        if (!empRepo.existsById(id)) return ResponseEntity.notFound().build();
        emp.setEmployeeId(id);
        return ResponseEntity.ok(empRepo.save(emp));
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable String id) {
        empRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // --- 3. 會員中心 REST API ---
    @GetMapping("/members/{id}")
    public ResponseEntity<?> getMember(@PathVariable String id) {
        return memRepo.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body("查無此會員"));
    }

    @GetMapping("/members")
    public List<Member> getAllMembers() { return memRepo.findAll(); }

    @PostMapping("/members")
    public ResponseEntity<?> createMember(@RequestBody Member member) {
        if (memRepo.existsById(member.getMemberId())) {
            return ResponseEntity.badRequest().body("該卡號已存在");
        }
        member.setTotalPoints(0);
        return ResponseEntity.ok(memRepo.save(member));
    }

    @PutMapping("/members/{id}")
    public ResponseEntity<?> updateMemberPoints(@PathVariable String id, @RequestBody Map<String, Integer> payload) {
        Optional<Member> opt = memRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Member m = opt.get();
        m.setTotalPoints(payload.get("total_points"));
        return ResponseEntity.ok(memRepo.save(m));
    }

    @DeleteMapping("/members/{id}")
    public ResponseEntity<?> deleteMember(@PathVariable String id) {
        memRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // --- 4. 結帳事務處理 (核心業務邏輯) ---
    @PostMapping("/checkout")
    @Transactional
    public ResponseEntity<?> checkout(@RequestBody CheckoutRequest req) {
        String memberId = req.getMemberId();
        int totalAmount = req.getTotalAmount();
        int earnedPoints = totalAmount / 100;
        int freeGuaBaoCount = 0;

        // 會員點數計算與扣除邏輯
        if (memberId != null && !memberId.isEmpty()) {
            Optional<Member> memOpt = memRepo.findById(memberId);
            if (memOpt.isPresent()) {
                Member m = memOpt.get();
                int newPoints = m.getTotalPoints() + earnedPoints;
                if (newPoints >= 10) {
                    freeGuaBaoCount = newPoints / 10;
                    newPoints -= (freeGuaBaoCount * 10);
                }
                m.setTotalPoints(newPoints);
                memRepo.save(m);
            }
        }

        // 寫入 Orders 主檔
        Order order = new Order();
        order.setMemberId(memberId);
        order.setTotalAmount(totalAmount);
        order.setEarnedPoints(earnedPoints);
        order.setGiftCount(freeGuaBaoCount);
        Order savedOrder = orderRepo.save(order);

        // 寫入 OrderDetails 明細檔
        for (OrderItem item : req.getItems()) {
            OrderDetail detail = new OrderDetail();
            detail.setOrderId(savedOrder.getOrderId());
            detail.setItemName(item.getItemName());
            detail.setUnitPrice(item.getUnitPrice());
            detail.setQuantity(item.getQuantity());
            detail.setSubtotal(item.getUnitPrice() * item.getQuantity());
            detailRepo.save(detail);
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("orderId", savedOrder.getOrderId());
        resp.put("earnedPoints", earnedPoints);
        resp.put("giftCount", freeGuaBaoCount);
        return ResponseEntity.ok(resp);
    }
}