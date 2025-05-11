import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './components/Home';
import Results from './components/Results';
import Login from './components/Login';
import Signup from './components/Signup';

function Redirect({ to }) {
  useEffect(() => {
    window.location.href = to;
  }, [to]);
  return null;
}

function App() {
  return (
    <Routes>
      {/* Páginas migradas a React */}
      <Route path="/index" element={<Home />} />
      <Route path="/results" element={<Results />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Redirecciones a páginas HTML estáticas */}
      <Route path="/" element={<Redirect to="/landing-page.html" />} />
    </Routes>
  );
}

export default App;