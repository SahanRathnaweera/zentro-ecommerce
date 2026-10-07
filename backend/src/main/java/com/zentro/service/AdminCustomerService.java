package com.zentro.service;

import com.zentro.dto.CustomerResponse;
import com.zentro.entity.OrderStatus;
import com.zentro.entity.Role;
import com.zentro.repository.OrderRepository;
import com.zentro.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminCustomerService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public AdminCustomerService(UserRepository userRepository, OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> getCustomers() {
        return userRepository.findByRoleOrderByCreatedAtDesc(Role.ROLE_CUSTOMER).stream()
                .map(u -> new CustomerResponse(
                        u.getId(),
                        u.getFullName(),
                        u.getEmail(),
                        u.getPhone(),
                        u.getCreatedAt(),
                        orderRepository.countByUserId(u.getId()),
                        orderRepository.sumSpentByUser(u.getId(), OrderStatus.CANCELLED)))
                .toList();
    }
}
