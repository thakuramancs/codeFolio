
import  { useEffect, useState } from "react";
import usePracticeAPI from "./practiceService";
import { Card, CardContent, Typography, Box, Button, Radio, RadioGroup, FormControlLabel, FormControl, Alert } from "@mui/material";

const AptitudePage = () => {
  const { fetchAptitudeQuestions, data, loading, error } = usePracticeAPI();
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedOption }
  const [showResult, setShowResult] = useState({}); // { [questionId]: true/false }

  useEffect(() => {
    fetchAptitudeQuestions();
    // eslint-disable-next-line
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  const handleSelect = (qid, option) => {
    setAnswers((prev) => ({ ...prev, [qid]: option }));
  };

  // Helper to resolve the correct answer string for a question
  const getCorrectAnswer = (q, options) => {
    // Support both 'answer' and 'correctAnswer' fields
    const ans = q.answer ?? q.correctAnswer;
    // If answer is the string itself and matches an option
    if (options.includes(ans)) return ans;
    // If answer is an index (0-based or 1-based)
    if (!isNaN(Number(ans))) {
      const idx = Number(ans);
      if (options[idx] !== undefined) return options[idx];
      if (options[idx - 1] !== undefined) return options[idx - 1];
    }
    // If answer is 'option1', 'option2', ...
    if (typeof ans === 'string' && ans.toLowerCase().startsWith('option')) {
      const idx = Number(ans.replace(/option/i, '')) - 1;
      if (options[idx] !== undefined) return options[idx];
    }
    // If answer is 'A', 'B', 'C', 'D'
    if (typeof ans === 'string' && /^[A-D]$/i.test(ans)) {
      const idx = ans.toUpperCase().charCodeAt(0) - 65;
      if (options[idx] !== undefined) return options[idx];
    }
    // Debug log for mapping failures
    // eslint-disable-next-line no-console
    console.warn('Could not resolve correct answer for question:', q, 'Options:', options);
    return undefined;
  };

  const handleSubmit = (qid, correct) => {
    setShowResult((prev) => ({ ...prev, [qid]: true }));
  };

  return (
    <Box sx={{
      maxWidth: 800,
      mx: "auto",
      mt: 4,
      px: { xs: 1, sm: 2 },
      height: 'calc(100vh - 80px)',
      overflowY: 'auto',
      overflowX: 'hidden',
      boxSizing: 'border-box',
      background: theme => theme.palette.background.default,
      borderRadius: 2,
      boxShadow: 'none'
    }}>
      
      <Box display="flex" flexDirection="column" gap={2} width="100%">
        {data.map((q) => {
          // Support both array and separate option fields
          let options = Array.isArray(q.options) && q.options.length > 0
            ? q.options
            : [q.option1, q.option2, q.option3, q.option4].filter(Boolean);

          return (
            <Card key={q.id} variant="outlined">
              <CardContent>
                <Typography variant="h6">{q.title}</Typography>
                {options.length > 0 ? (
                  <FormControl component="fieldset" sx={{ mt: 2 }}>
                    <RadioGroup
                      value={answers[q.id] || ''}
                      onChange={e => handleSelect(q.id, e.target.value)}
                    >
                      {options.map((opt, idx) => (
                        <FormControlLabel
                          key={idx}
                          value={opt}
                          control={<Radio />}
                          label={opt}
                          disabled={!!showResult[q.id]}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                ) : (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    No options found for this question. Raw data: {JSON.stringify(q)}
                  </Alert>
                )}
                {!showResult[q.id] && options.length > 0 && (
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    disabled={!answers[q.id]}
                    onClick={() => handleSubmit(q.id, q.answer)}
                  >
                    Submit
                  </Button>
                )}
                {showResult[q.id] && (
                  <Alert severity={answers[q.id] === getCorrectAnswer(q, options) ? "success" : "error"} sx={{ mt: 2 }}>
                    {answers[q.id] === getCorrectAnswer(q, options)
                      ? "Correct!"
                      : `Incorrect. Correct answer: ${getCorrectAnswer(q, options) ?? 'Not available'}`}
                  </Alert>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default AptitudePage;