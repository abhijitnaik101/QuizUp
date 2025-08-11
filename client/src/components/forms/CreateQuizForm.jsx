import React, { useState } from 'react';
import { Box, TextField, Button, IconButton, Paper, Typography, Divider, RadioGroup, FormControlLabel, Radio, FormControl, Snackbar, Alert, CircularProgress, Tooltip } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreateQuizForm() {
    const navigate = useNavigate();
    const [quizData, setQuizData] = useState({
        title: '',
        questions: [
            { id: Date.now(), questionText: '', timeLimit: 20, options: [{ id: Date.now() + 1, text: '' }, { id: Date.now() + 2, text: '' }], correctOptionId: null },
        ],
    });
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    // --- (Most handlers are the same) ---
    const handleTitleChange = (e) => setQuizData({ ...quizData, title: e.target.value });

    const handleQuestionChange = (qIndex, field, value) => {
        const newQuestions = [...quizData.questions];
        newQuestions[qIndex][field] = value;
        setQuizData({ ...quizData, questions: newQuestions });
    };

    const handleOptionTextChange = (qIndex, oIndex, value) => {
        const newQuestions = [...quizData.questions];
        newQuestions[qIndex].options[oIndex].text = value;
        setQuizData({ ...quizData, questions: newQuestions });
    };
  
    const handleCorrectOptionChange = (qIndex, event) => {
        const newQuestions = [...quizData.questions];
        newQuestions[qIndex].correctOptionId = parseInt(event.target.value, 10);
        setQuizData({ ...quizData, questions: newQuestions });
    };

    const handleAddOption = (qIndex) => {
        const newQuestions = [...quizData.questions];
        if (newQuestions[qIndex].options.length >= 6) return; // Limit options
        newQuestions[qIndex].options.push({ id: Date.now(), text: '' });
        setQuizData({ ...quizData, questions: newQuestions });
    };
  
    const handleRemoveOption = (qIndex, oIndex) => {
        const newQuestions = [...quizData.questions];
        newQuestions[qIndex].options.splice(oIndex, 1);
        setQuizData({ ...quizData, questions: newQuestions });
    };

    const handleAddQuestion = () => {
        setQuizData({
            ...quizData,
            questions: [
                ...quizData.questions,
                { id: Date.now(), questionText: '', timeLimit: 20, options: [{ id: Date.now() + 1, text: '' }, { id: Date.now() + 2, text: '' }], correctOptionId: null }
            ]
        });
    };

    const handleRemoveQuestion = (qIndex) => {
        const newQuestions = quizData.questions.filter((_, index) => index !== qIndex);
        setQuizData({ ...quizData, questions: newQuestions });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        const finalQuizData = {
            title: quizData.title.trim(),
            questions: quizData.questions.map(q => ({
                questionText: q.questionText.trim(),
                timeLimit: Number(q.timeLimit),
                options: q.options.map(opt => ({
                    text: opt.text.trim(),
                    isCorrect: q.correctOptionId === opt.id,
                })),
            })),
        };
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("Authentication required.");
            await axios.post('http://localhost:3000/api/quiz', finalQuizData, { headers: { Authorization: `Bearer ${token}` } });
            setNotification({ open: true, message: 'Quiz created successfully!', severity: 'success' });
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (error) {
            setNotification({ open: true, message: error.response?.data?.message || 'Failed to create quiz.', severity: 'error' });
            setLoading(false);
        }
    };

    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') return;
        setNotification({ ...notification, open: false });
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>
            <TextField label="Quiz Title" fullWidth required value={quizData.title} onChange={handleTitleChange} sx={{ mb: 4 }} disabled={loading} />
            {quizData.questions.map((q, qIndex) => (
                <Paper key={q.id} elevation={2} sx={{ p: 2, mb: 3, position: 'relative' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <TextField
                            label={`Question ${qIndex + 1}`}
                            fullWidth
                            required
                            value={q.questionText}
                            onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                            sx={{ flexGrow: 1 }}
                            disabled={loading}
                        />
                        <TextField
                            label="Time (s)"
                            type="number"
                            value={q.timeLimit}
                            onChange={(e) => handleQuestionChange(qIndex, 'timeLimit', e.target.value)}
                            sx={{ width: '100px' }}
                            inputProps={{ min: 5, max: 120 }}
                            disabled={loading}
                        />
                         <Tooltip title="Delete Question">
                            <IconButton onClick={() => handleRemoveQuestion(qIndex)} disabled={quizData.questions.length <= 1 || loading}><DeleteIcon /></IconButton>
                        </Tooltip>
                    </Box>
                    <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }} disabled={loading}>
                        <RadioGroup value={q.correctOptionId} onChange={(e) => handleCorrectOptionChange(qIndex, e)}>
                            {q.options.map((opt, oIndex) => (
                                <Box key={opt.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <FormControlLabel value={opt.id} control={<Radio />} label="" />
                                    <TextField label={`Option ${oIndex + 1}`} fullWidth size="small" required value={opt.text} onChange={(e) => handleOptionTextChange(qIndex, oIndex, e.target.value)} />
                                    <Tooltip title="Remove Option">
                                        <IconButton onClick={() => handleRemoveOption(qIndex, oIndex)} disabled={q.options.length <= 2}><CloseIcon /></IconButton>
                                    </Tooltip>
                                </Box>
                            ))}
                        </RadioGroup>
                    </FormControl>
                    <Button variant="text" startIcon={<AddCircleOutlineIcon />} onClick={() => handleAddOption(qIndex)} sx={{ mt: 1 }} disabled={loading}>Add Option</Button>
                </Paper>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button variant="outlined" onClick={handleAddQuestion} disabled={loading}>Add Another Question</Button>
                <Button type="submit" variant="contained" size="large" disabled={loading}>{loading ? <CircularProgress size={24} color="inherit" /> : 'Save Quiz'}</Button>
            </Box>
            <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}><Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>{notification.message}</Alert></Snackbar>
        </Box>
    );
}

export default CreateQuizForm;