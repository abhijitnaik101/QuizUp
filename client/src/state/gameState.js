import { atom } from 'recoil';

export const gameStateAtom = atom({
  key: 'gameState', 
  default: 'Connecting...', 
});


export const playersAtom = atom({
  key: 'players',
  default: [],
});

export const currentQuestionAtom = atom({
  key: 'currentQuestion',
  default: null, 
});

export const resultsAtom = atom({
  key: 'results',
  default: {
    correctAnswer: '',
    leaderboard: [],
  },
});

export const isHostAtom = atom({
  key: 'isHost',
  default: false,
});

export const userNicknameAtom = atom({
  key: 'userNickname',
  default: '',
});