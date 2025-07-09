package com.codefolio.practiceService.service;

import com.codefolio.practiceService.model.AptitudeQuestion;
import com.codefolio.practiceService.repository.AptitudeRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AptitudeQuestionService {
    @Autowired
    private AptitudeRepository aptitudeRepository;

    public AptitudeQuestion getQuestionById(Long id) {
        return aptitudeRepository.findById(id).orElse(null);
    }

    public List<AptitudeQuestion> getAllQuestions() {
        return aptitudeRepository.findAll();
    }

    public AptitudeQuestion saveQuestion(AptitudeQuestion question) {
        return aptitudeRepository.save(question);
    }

    public void deleteQuestion(Long id) {
        aptitudeRepository.deleteById(id);
    }

    public List<AptitudeQuestion> getQuestionsByTag(String tag) {
        return aptitudeRepository.findByTag(tag);
    }

}
