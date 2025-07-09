const questionAPIs={
    getDSAQuestions: async ()=>{
        const response= await fetch('/practice/dsa-questions');
        if(!response.ok){
            throw new Error('Failed to fetch DSA questions');
        }
        return response.json();
    },
    getDSAQuestionById: async (id)=>{
        const response= await fetch(`/practice/dsa-questions/${id}`);
        if(!response.ok){
            throw new Error(`Failed to fetch DSA question with id ${id}`);
        }
        return response.json(); 
    },
    getDSAQuestionByDifficulty: async (difficulty)=>{
        const response= await fetch(`/practice/dsa-questions/difficulty/${difficulty}`);
        if(!response.ok){
            throw new Error(`Failed to fetch DSA questions with difficulty ${difficulty}`);
        }
        return response.json();
    },    
    getDSAQuestionByTags: async (tags)=>{   
        const response= await fetch(`/practice/dsa-questions/tags/${tags}`);
        if(!response.ok){
            throw new Error(`Failed to fetch DSA questions with tags ${tags}`);
        }
        return response.json();
    },
    deleteDSAQuestion: async (id)=>{
        const response= await fetch(`/practice/dsa-questions/${id}`, {
            method: 'DELETE',
        })
        if(!response.ok){
            throw new Error(`Failed to delete DSA question with id ${id}`);
        }
        return response.json();
    },
    addDSAQuestion: async (question)=>{
        const response= await fetch('/practice/dsa-questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(question),
        });
        if(!response.ok){
            throw new Error('Failed to add DSA question');
        }
        return response.json();
    },
    getAptitudeQuestions: async ()=>{
        const response= await fetch('/practice/aptitude-questions');
        if(!response.ok){
            throw new Error('Failed to fetch Aptitude questions');
        }
        return response.json();
    },
    getAptitudeQuestionById: async (id)=>{  
        const response= await fetch(`/practice/aptitude-questions/${id}`)
        if(!response.ok){
            throw new Error(`Failed to fetch Aptitude question with id ${id}`);
        }
        return response.json();
    },
    getAptitudeQuestionByTags:async (tags)=>{
        const response= await fetch(`/practice/aptitude-questions/tags/${tags}`);
        if(!response.ok){
            throw new Error(`Failed to fetch Aptitude questions with tags ${tags}`);
        }
        return response.json();
    },
    deleteAptitudeQuestion: async (id)=>{
        const response= await fetch(`/practice/aptitude-questions/${id}`, {
            method: 'DELETE',
        })
        if(!response.ok){
            throw new Error(`Failed to delete Aptitude question with id ${id}`);
        }
        return response.json();
    },
    addAptitudeQuestion: async (question)=>{
        const response= await fetch('/practice/aptitude-questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(question),
        });
        if(!response.ok){
            throw new Error('Failed to add Aptitude question');
        }
        return response.json();
    }
}
export default questionAPIs;