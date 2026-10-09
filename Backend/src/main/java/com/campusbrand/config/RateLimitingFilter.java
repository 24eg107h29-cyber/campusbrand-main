package com.campusbrand.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final boolean enabled;
    private final int maxAttemptsPerMinute;
    private final ConcurrentHashMap<String, RequestBucket> buckets = new ConcurrentHashMap<>();

    public RateLimitingFilter(
        @Value("${app.security.rate-limit.enabled:true}") boolean enabled,
        @Value("${app.security.rate-limit.login-per-minute:30}") int maxAttemptsPerMinute
    ) {
        this.enabled = enabled;
        this.maxAttemptsPerMinute = maxAttemptsPerMinute;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        if (!enabled) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();
        if ("POST".equalsIgnoreCase(request.getMethod()) &&
            (path.endsWith("/api/auth/login") || path.endsWith("/api/auth/register"))) {

            String clientIp = resolveClientIp(request);
            long currentTime = System.currentTimeMillis();

            RequestBucket bucket = buckets.compute(clientIp, (key, existing) -> {
                if (existing == null || currentTime - existing.windowStart > 60000L) {
                    return new RequestBucket(currentTime, new AtomicInteger(1));
                }
                existing.count.incrementAndGet();
                return existing;
            });

            // Prevent memory buildup by periodically pruning old entries if map grows large
            if (buckets.size() > 2000) {
                buckets.entrySet().removeIf(entry -> currentTime - entry.getValue().windowStart > 120000L);
            }

            if (bucket.count.get() > maxAttemptsPerMinute) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.getWriter().write("{\"error\":\"Too many attempts. Please wait a minute before trying again.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }

    private static class RequestBucket {
        final long windowStart;
        final AtomicInteger count;

        RequestBucket(long windowStart, AtomicInteger count) {
            this.windowStart = windowStart;
            this.count = count;
        }
    }
}

