import { useEffect } from 'react';

function Results() {
  useEffect(() => {
    document.title = 'Armar Equipos - Resultados';
  }, []);

  return (
    <div>
      {/* Contenido migrado de results.html */}
      <h2>Resultados</h2>
        <p>Esta es la página de resultados.</p>
    </div>
  );
}

export default Results;