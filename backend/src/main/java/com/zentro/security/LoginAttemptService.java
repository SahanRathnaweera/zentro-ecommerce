package com.zentro.security;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Service

public class LoginAttemptService {
    private static final int MAX_ATTEMPTS = 5;
    private static final Duration LOCK_TIME = Duration.ofMinutes(15);

    private record Attempt(int count, Instant firstFailure) {}

    private final ConcurrentHashMap<String, Attempt> attempts = new ConcurrentHashMap<>();

    public boolean isBlocked(String key) {
        Attempt a = attempts.get(key);
        if (a == null) return false;
        if (Instant.now().isAfter(a.firstFailure().plus(LOCK_TIME))) {
            attempts.remove(key);
            return false;
        }
        return a.count() >= MAX_ATTEMPTS;
    }

    public void recordFailure(String key) {
        attempts.merge(key, new Attempt(1, Instant.now()),
                (old, ignored) -> new Attempt(old.count() + 1, old.firstFailure()));
    }

    public void reset(String key) {
        attempts.remove(key);
    }
}
