import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/tailwind.min.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordValid, setPasswordValid] = useState(false);
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    specialRequired: true,
  });
  const navigate = useNavigate();

  const checkPassword = (pwd) => {
    const minLength = pwd.length >= 8;
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasLowercase = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const specialCharRequired = pwd.length < 12;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    setRequirements({
      length: minLength,
      uppercase: hasUppercase,
      lowercase: hasLowercase,
      number: hasNumber,
      special: hasSpecialChar,
      specialRequired: specialCharRequired,
    });
    let valid = minLength && hasUppercase && hasLowercase && hasNumber;
    if (specialCharRequired) valid = valid && hasSpecialChar;
    setPasswordValid(valid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ username, password }).toString(),
        credentials: 'include',
      });
      if (response.redirected) {
        navigate('/index');
      } else {
        const text = await response.text();
        if (text.includes('Usuario ya registrado')) {
          setError('Usuario ya registrado');
        } else if (text.includes('Error al acceder a la base de datos')) {
          setError('Error al acceder a la base de datos. Inténtalo de nuevo más tarde.');
        } else if (text.includes('contraseña')) {
          // Mensaje de error de validación de contraseña
          const match = text.match(/<div class="bg-red-500 text-white p-2 rounded mb-4">([\s\S]*?)<\/div>/);
          setError(match ? match[1].trim() : 'Error en la contraseña.');
        } else {
          setError('Error desconocido.');
        }
      }
    } catch (err) {
      setError('Error de red.');
    }
  };

  return (
    <div className="justify-center flex h-screen items-center" style={{ backgroundColor: '#1d232a' }}>
      <div
        className="sm:w-96 w-full max-w-96 h-fit m-4 rounded-lg bg-gray-800 text-white"
        style={{ backgroundColor: '#2a323c' }}
      >
        <div className="p-4 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center">Crear cuenta</h1>
          <br />
          {error && (
            <div className="bg-red-500 text-white p-2 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
            <label
              className="flex items-center gap-2 p-2 border border-gray-600 rounded-lg bg-gray-700"
              htmlFor="username"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70"
              >
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
              </svg>
              <input
                type="text"
                className="grow bg-transparent focus:outline-none text-white"
                placeholder="Usuario"
                name="username"
                autoCapitalize="off"
                autoComplete="username"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </label>
            <label
              className="flex items-center gap-2 p-2 border border-gray-600 rounded-lg bg-gray-700"
              htmlFor="password"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70"
              >
                <path
                  fillRule="evenodd"
                  d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="password"
                className="grow bg-transparent focus:outline-none text-white"
                placeholder="Contraseña"
                name="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  checkPassword(e.target.value);
                }}
              />
            </label>
            <ul className="text-sm list-disc pl-5 mt-2" id="password-requirements">
              <li className={requirements.length ? "text-green-600" : "text-gray-600"}>Al menos 8 caracteres</li>
              <li className={requirements.uppercase ? "text-green-600" : "text-gray-600"}>Una letra mayúscula</li>
              <li className={requirements.lowercase ? "text-green-600" : "text-gray-600"}>Una letra minúscula</li>
              <li className={requirements.number ? "text-green-600" : "text-gray-600"}>Un número</li>
              {requirements.specialRequired && (
                <li className={requirements.special ? "text-green-600" : "text-gray-600"}>Un carácter especial (si tiene menos de 12 caracteres)</li>
              )}
            </ul>
            <br />
            <button
              type="submit"
              className="py-3 text-black rounded font-semibold"
              style={{ backgroundColor: '#7480ff' }}
              disabled={!passwordValid}
            >
              Crear cuenta
            </button>
          </form>
          {/* Login link */}
          <div className="mt-4 text-center">
            <a href="/login" style={{ color: '#7480ff' }}>
              Iniciar sesión
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
