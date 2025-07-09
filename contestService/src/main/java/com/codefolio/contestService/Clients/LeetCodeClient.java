package com.codefolio.contestService.Clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import com.codefolio.contestService.model.LeetCodeResponse;

@FeignClient(name = "leetcode-api", url = "https://leetcode.com")
public interface LeetCodeClient {
    @PostMapping(value = "/graphql", headers = {"Content-Type=application/json"})
    LeetCodeResponse getContests(@RequestBody String query, @RequestHeader("User-Agent") String userAgent);
} 