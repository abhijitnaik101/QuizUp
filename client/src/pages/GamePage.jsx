import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { socket } from '../services/SocketManager';
import { gameStateAtom, isHostAtom, userNicknameAtom, playersAtom } from '../state/gameState';
import HostLobby from '../components/game/HostLobby';
import PlayerLobby from '../components/game/PlayerLobby';
import QuestionView from '../components/game/QuestionView';
import ResultsView from '../components/game/ResultsView';
import FinalPodium from '../components/game/FinalPodium';
import { Box, CircularProgress, Typography } from '@mui/material';

function GamePage() {
    const { gameCode } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const setGameState = useSetRecoilState(gameStateAtom);
    const setIsHost = useSetRecoilState(isHostAtom);
    const setNickname = useSetRecoilState(userNicknameAtom);
    const setPlayers = useSetRecoilState(playersAtom); 
    const gameState = useRecoilValue(gameStateAtom);
    const isHost = useRecoilValue(isHostAtom);
    useEffect(() => {
        const locationState = location.state;
        if (locationState?.isHost) {
            setIsHost(true);
            socket.emit('host:joinGame', { gameCode });
            setGameState('Lobby');
        } else if (locationState?.nickname) {
            setIsHost(false);
            setNickname(locationState.nickname);
            socket.emit('player:joinGame', { gameCode, nickname: locationState.nickname });
            setGameState('Lobby');
        } else {
            console.log("No navigation state found. Redirecting to home.");
            navigate('/');
            return;
        }
        return () => {
            console.log("Leaving game page, resetting state.");
            setGameState('Connecting...');
            setPlayers([]);
            setIsHost(false);
            setNickname('');
            socket.emit('player:leave', { gameCode });
        };
    }, []); 
    const renderContent = () => {
        if (gameState === 'Connecting...') {
             return (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Joining Lobby...</Typography>
                </Box>
            );
        }

        switch (gameState) {
            case 'Lobby':
                return isHost ? <HostLobby gameCode={gameCode} /> : <PlayerLobby />;
            case 'Question':
                return <QuestionView />;
            case 'Results':
                return <ResultsView />;
            case 'Finished':
                return <FinalPodium/>
            default:
                return <Typography>Unknown game state: {gameState}</Typography>;
        }
    };

    return <div>{renderContent()}</div>;
}

export default GamePage;