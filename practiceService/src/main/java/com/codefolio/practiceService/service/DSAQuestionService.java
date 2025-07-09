package com.codefolio.practiceService.service;

import com.codefolio.practiceService.model.DSAQuestion;
import com.codefolio.practiceService.repository.DSARepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class DSAQuestionService {
    @Autowired
    private DSARepository dsaRepository;

    public DSAQuestion getQuestionById(Long id) {
        return dsaRepository.findById(id).orElse(null);
    }

    public List<DSAQuestion> getAllQuestions() {
        return dsaRepository.findAll();
    }

    public DSAQuestion saveQuestion(DSAQuestion question) {
        return dsaRepository.save(question);
    }

    public void deleteQuestion(Long id) {
        dsaRepository.deleteById(id);
    }

    public List<DSAQuestion> getQuestionsByDifficulty(String difficulty) {
        return dsaRepository.findByDifficulty(difficulty);
    }

    public List<DSAQuestion> getQuestionsByTag(String tag) {
        return dsaRepository.findByTag(tag);
    }
}
