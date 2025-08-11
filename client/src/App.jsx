import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import SocketManager from './services/SocketManager';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CreateQuizPage from './pages/CreateQuizPage'; 
import GamePage from './pages/GamePage';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <SocketManager />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/dashboard" element={<DashboardPage />} /> 
          <Route path="/create-quiz" element={<CreateQuizPage />} />
          
          <Route path="/game/:gameCode" element={<GamePage />} /> 
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;