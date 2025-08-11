// src/pages/GamePage.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { socket } from '../services/SocketManager';
import { gameStateAtom, isHostAtom, userNicknameAtom, playersAtom } from '../state/gameState';

// Import your view components
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

    // State hooks
    const setGameState = useSetRecoilState(gameStateAtom);
    const setIsHost = useSetRecoilState(isHostAtom);
    const setNickname = useSetRecoilState(userNicknameAtom);
    const setPlayers = useSetRecoilState(playersAtom); // To reset on leave
    const gameState = useRecoilValue(gameStateAtom);
    const isHost = useRecoilValue(isHostAtom);

    // This effect runs only ONCE when the component first mounts.
    useEffect(() => {
        const locationState = location.state;

        // --- Simplified Join Logic ---
        // We ONLY join if the user navigated here from another page.
        // We NO LONGER check localStorage.
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
            // If there's no state, the user either refreshed or typed the URL directly.
            // Kick them out.
            console.log("No navigation state found. Redirecting to home.");
            navigate('/');
            return; // Stop the effect
        }

        // This is the cleanup function that runs when the user leaves the page
        return () => {
            console.log("Leaving game page, resetting state.");
            // Reset all Recoil state to its default value
            setGameState('Connecting...');
            setPlayers([]);
            setIsHost(false);
            setNickname('');
            // Optional: tell the server the player is intentionally leaving
            socket.emit('player:leave', { gameCode });
        };
        // The dependency array is empty on purpose. It should only run on mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    
    // --- Render Logic ---
    const renderContent = () => {
        // If gameState hasn't been set to 'Lobby' yet, show a loading spinner
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
            // ... add your other game states here
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