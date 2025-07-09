package com.codefolio.contestService.Controllers;

import com.codefolio.contestService.service.ContestService;
import com.codefolio.contestService.model.Contest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/contests")
public class ContestController {
    private final ContestService contestService;

    @Autowired
    public ContestController(ContestService contestService) {
        this.contestService = contestService;
    }

    @GetMapping("/active")
    public ResponseEntity<List<Contest>> getActiveContests() {
        return ResponseEntity.ok(contestService.getActiveContests());
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Contest>> getUpcomingContests() {
        return ResponseEntity.ok(contestService.getUpcomingContests());
    }

    @GetMapping("/all")
    public ResponseEntity<List<Contest>> getAllContests() {
        return ResponseEntity.ok(contestService.getAllContests());
    }
}