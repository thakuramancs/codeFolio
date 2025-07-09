package com.codefolio.contestService.Clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import com.codefolio.contestService.model.CodeforcesResponse;

@FeignClient(name = "codeforces-api", url = "https://codeforces.com/api")
public interface CodeforcesClient {
    @GetMapping("/contest.list")
    CodeforcesResponse getContests();
}