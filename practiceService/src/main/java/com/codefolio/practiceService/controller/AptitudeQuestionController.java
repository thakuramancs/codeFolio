package com.codefolio.practiceService.controller;

import com.codefolio.practiceService.model.AptitudeQuestion;
import com.codefolio.practiceService.service.AptitudeQuestionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("practice/aptitude-questions")
public class AptitudeQuestionController {

    @Autowired
    private AptitudeQuestionService aptitudeQuestionService;

    @GetMapping("/{id}")
    public ResponseEntity<AptitudeQuestion> getQuestionById(@PathVariable Long id) {
        AptitudeQuestion question = aptitudeQuestionService.getQuestionById(id);
        return question != null ? ResponseEntity.ok(question) : ResponseEntity.notFound().build();
    }

    @GetMapping
    public ResponseEntity<List<AptitudeQuestion>> getAllQuestions() {
        List<AptitudeQuestion> questions = aptitudeQuestionService.getAllQuestions();
        return ResponseEntity.ok(questions);
    }

    @PostMapping
    public ResponseEntity<AptitudeQuestion> saveQuestion(@RequestBody AptitudeQuestion question) {
        AptitudeQuestion savedQuestion = aptitudeQuestionService.saveQuestion(question);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedQuestion);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        aptitudeQuestionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tags/{tag}")
    public ResponseEntity<List<AptitudeQuestion>> getQuestionsByTag(@PathVariable String tag) {
        List<AptitudeQuestion> questions = aptitudeQuestionService.getQuestionsByTag(tag);
        return ResponseEntity.ok(questions);
    }
}
