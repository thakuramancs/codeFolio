import questionAPIs from './questionAPIs';
import { useState} from 'react';

export default function usePracticeAPI() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generic fetcher function
  const callApi = async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    // You expose individual methods, all calling `callApi` wrapper
    fetchDSAQuestions: () => callApi(questionAPIs.getDSAQuestions),
    fetchDSAQuestionById: (id) => callApi(questionAPIs.getDSAQuestionById, id),
    fetchDSAQuestionByDifficulty: (difficulty) => callApi(questionAPIs.getDSAQuestionByDifficulty, difficulty),
    fetchDSAQuestionByTags: (tags) => callApi(questionAPIs.getDSAQuestionByTags, tags),
    deleteDSAQuestion: (id) => callApi(questionAPIs.deleteDSAQuestion, id),
    addDSAQuestion: (question) => callApi(questionAPIs.addDSAQuestion, question),

    fetchAptitudeQuestions: () => callApi(questionAPIs.getAptitudeQuestions),
    fetchAptitudeQuestionById: (id) => callApi(questionAPIs.getAptitudeQuestionById, id),
    fetchAptitudeQuestionByTags: (tags) => callApi(questionAPIs.getAptitudeQuestionByTags, tags),
    deleteAptitudeQuestion: (id) => callApi(questionAPIs.deleteAptitudeQuestion, id),
    addAptitudeQuestion: (question) => callApi(questionAPIs.addAptitudeQuestion, question),

    data,
    loading,
    error,
  };
}