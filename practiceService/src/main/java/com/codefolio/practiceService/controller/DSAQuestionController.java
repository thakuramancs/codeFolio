package com.codefolio.practiceService.controller;

import com.codefolio.practiceService.model.DSAQuestion;
import com.codefolio.practiceService.service.DSAQuestionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("practice/dsa-questions")
public class DSAQuestionController {
    @Autowired
    private DSAQuestionService dsaQuestionService;

    @GetMapping("/{id}")
    public ResponseEntity<DSAQuestion> getQuestionById(@PathVariable Long id) {
        DSAQuestion question = dsaQuestionService.getQuestionById(id);
        return question != null ? ResponseEntity.ok(question) : ResponseEntity.notFound().build();
    }
    
    @GetMapping
    public ResponseEntity<List<DSAQuestion>> getAllQuestions() {
        List<DSAQuestion> questions = dsaQuestionService.getAllQuestions();
        return ResponseEntity.ok(questions);
    }
    @PostMapping
    public ResponseEntity<DSAQuestion> saveQuestion(@RequestBody DSAQuestion question) {
        DSAQuestion savedQuestion = dsaQuestionService.saveQuestion(question);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedQuestion);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        dsaQuestionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<DSAQuestion>> getQuestionsByDifficulty(@PathVariable String difficulty) {
        List<DSAQuestion> questions = dsaQuestionService.getQuestionsByDifficulty(difficulty);
        return ResponseEntity.ok(questions);
    }
    
    @GetMapping("/tags/{tag}")
    public ResponseEntity<List<DSAQuestion>> getQuestionsByTag(@PathVariable String tag) {
        List<DSAQuestion> questions = dsaQuestionService.getQuestionsByTag(tag);
        return ResponseEntity.ok(questions);
    }
    
}
