package com.codefolio.contestService.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/health")
public class HealthController {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private CacheManager cacheManager;

    @GetMapping("/redis")
    public ResponseEntity<String> checkRedisHealth() {
        try {
            redisTemplate.opsForValue().set("health", "ok");
            String value = (String) redisTemplate.opsForValue().get("health");
            if ("ok".equals(value)) {
                return ResponseEntity.ok("Redis is working properly");
            } else {
                return ResponseEntity.status(500).body("Redis is not working properly");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Redis error: " + e.getMessage());
        }
    }

    @PostMapping("/clear-cache")
    public ResponseEntity<String> clearCache() {
        try {
            cacheManager.getCacheNames().forEach(cacheName -> {
                cacheManager.getCache(cacheName).clear();
            });
            return ResponseEntity.ok("Cache cleared successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error clearing cache: " + e.getMessage());
        }
    }
} 