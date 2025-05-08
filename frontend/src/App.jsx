import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './components/Home';
import Results from './components/Results';

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
      
      {/* Redirecciones a páginas HTML estáticas */}
      <Route path="/" element={<Redirect to="/landing-page.html" />} />
      <Route path="/login" element={<Redirect to="/login.html" />} />
      <Route path="/signup" element={<Redirect to="/signup.html" />} />
    </Routes>
  );
}

export default App;