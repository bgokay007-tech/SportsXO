import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const token = useSelector(state => state.auth.token);

  return (
    <Routes>
      <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/feed" />} />
      <Route path="/register" element={!token ? <RegisterPage /> : <Navigate to="/feed" />} />
      <Route path="/feed" element={token ? <FeedPage /> : <Navigate to="/login" />} />
      <Route path="/profile/:username" element={token ? <ProfilePage /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to={token ? "/feed" : "/login"} />} />
    </Routes>
  );
}

export default App;