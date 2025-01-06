package com.sneakyghost.twentyplots;

import com.google.common.util.concurrent.RateLimiter;
import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserRateLimitService {
    private final ConcurrentHashMap<String, RateLimiter> rateLimiterMap = new ConcurrentHashMap<>();

    public RateLimiter createRateLimiter(double permitsPerSecond) {
        return RateLimiter.create(permitsPerSecond);
    }

    public void attemptRequest(String ip, double permitsPerSecond) throws RateLimitException {
        rateLimiterMap.computeIfAbsent(ip, id -> createRateLimiter(permitsPerSecond)); // Create if not exists
        if (!rateLimiterMap.get(ip).tryAcquire()) { // Try to acquire a permit
            throw new RateLimitException("Rate limit exceeded");
        }
    }
}
