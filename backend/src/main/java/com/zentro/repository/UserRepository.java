package com.zentro.repository;

import com.zentro.entity.Role;
import com.zentro.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    java.util.List<User> findByRoleOrderByCreatedAtDesc(Role role);

    boolean existsByEmail(String email);

    long countByRole(Role role);
}