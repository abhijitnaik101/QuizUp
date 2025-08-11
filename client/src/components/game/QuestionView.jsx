import React, { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { Box, Typography, Paper, Button, Grid, LinearProgress } from '@mui/material';
import { isHostAtom, currentQuestionAtom } from '../../state/gameState';
import { socket } from '../../services/SocketManager';
import { useParams } from 'react-router-dom';

function QuestionView() {
    const { gameCode } = useParams();
    const isHost = useRecoilValue(isHostAtom);
    const currentQuestion = useRecoilValue(currentQuestionAtom);

    const [hasAnswered, setHasAnswered] = useState(false);
    const [answerCount, setAnswerCount] = useState({ answered: 0, total: 0 });
    const [timeLeft, setTimeLeft] = useState(0);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        setHasAnswered(false);
        const timeLimit = currentQuestion?.timeLimit || 20;
        setTimeLeft(timeLimit);
        setProgress(100);

        const timerStartHandler = (data) => {
            const limit = data.timeLimit;
            setTimeLeft(limit);
            setProgress(100);
            
            const interval = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(interval);
                        setProgress(0);
                        return 0;
                    }
                    const newTime = prevTime - 1;
                    setProgress((newTime / limit) * 100);
                    return newTime;
                });
            }, 1000);
            
            socket.timerInterval = interval; 
        };

        socket.on('game:timerStart', timerStartHandler);
        
        const answerCountHandler = (data) => {
            setAnswerCount({ answered: data.answeredCount, total: data.totalPlayers });
        };
        
        if (isHost) {
            socket.on('host:updateAnswerCount', answerCountHandler);
        }

        return () => { // Cleanup function
            if (isHost) socket.off('host:updateAnswerCount', answerCountHandler);
            socket.off('game:timerStart', timerStartHandler);
            if (socket.timerInterval) {
                clearInterval(socket.timerInterval);
            }
        };
    }, [currentQuestion, isHost]);

    const handleAnswerClick = (answerText) => {
        if (hasAnswered) return;
        setHasAnswered(true);
        socket.emit('player:submitAnswer', { gameCode, answer: answerText });
    };

    const handleShowResults = () => {
        socket.emit('host:showResults', { gameCode });
    };

    if (!currentQuestion) {
        return <Typography>Waiting for question...</Typography>;
    }
    
    return (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" sx={{ p: 2, minHeight: '100vh', boxSizing: 'border-box' }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2, width: '100%', maxWidth: '900px', textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <LinearProgress variant="determinate" value={progress} sx={{ flexGrow: 1, height: 10, borderRadius: 5 }} />
                    <Typography variant="h5" sx={{ ml: 2, fontWeight: 'bold', width: '40px' }}>{timeLeft}</Typography>
                </Box>
                <Typography variant="h4" component="h1" sx={{ minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {currentQuestion.questionText}
                </Typography>
                <Box sx={{ mt: 4, minHeight: '220px' }}>
                    {isHost ? (
                        <Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="h6">{answerCount.answered} of {answerCount.total} answered</Typography>
                                <LinearProgress variant="determinate" value={(answerCount.answered / (answerCount.total || 1)) * 100} />
                            </Box>
                            <Button variant="contained" size="large" onClick={handleShowResults} fullWidth>
                                Show Results Now
                            </Button>
                        </Box>
                    ) : (
                        hasAnswered ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px'}}>
                                <Typography variant="h4">You've answered! Waiting for others...</Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={2}>
                                {currentQuestion.options.map((option, index) => (
                                <Grid item xs={12} sm={6} key={index}>
                                    <Button fullWidth variant="contained" sx={{ height: '100px', fontSize: '1.2rem' }} onClick={() => handleAnswerClick(option.text)}>
                                        {option.text}
                                    </Button>
                                </Grid>
                                ))}
                            </Grid>
                        )
                    )}
                </Box>
            </Paper>
        </Box>
    );
}

export default QuestionView;