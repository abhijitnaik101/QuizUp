import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { io } from 'socket.io-client';

import { 
  gameStateAtom, 
  playersAtom,
  currentQuestionAtom,
  resultsAtom 
} from '../state/gameState';

const socket = io("http://localhost:3000");

function SocketManager() {
    const setGameState = useSetRecoilState(gameStateAtom);
    const setPlayers = useSetRecoilState(playersAtom);
    const setCurrentQuestion = useSetRecoilState(currentQuestionAtom);
    const setResults = useSetRecoilState(resultsAtom);

    useEffect(() => {
        socket.on('update:lobby', (data) => {
            console.log('Event received: update:lobby', data);
            setPlayers(data.players); 
        });

        socket.on('game:started', () => {
            console.log('Event received: game:started');
            setGameState('Question');
        });

        socket.on('game:newQuestion', (data) => {
            console.log('Event received: game:newQuestion', data);
            setGameState('Question');
            setCurrentQuestion(data.question);
        });

        socket.on('game:results', (data) => {
            console.log('Event received: game:results', data);
            setResults(data);
            setGameState('Results');
        });

        socket.on('game:finished', (data) => {
            console.log('Event received: game:finished', data);
            setResults({ leaderboard: data.leaderboard, correctAnswer: null });
            setGameState('Finished');
        });

        return () => {
            socket.off('update:lobby');
            socket.off('game:started');
            socket.off('game:newQuestion');
            socket.off('game:results');
            socket.off('game:finished');
        };

    }, [setGameState, setPlayers, setCurrentQuestion, setResults]);
  
    return null;
}

export { socket }; 
export default SocketManager;