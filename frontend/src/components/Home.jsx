import { useEffect } from 'react';
import '../assets/css/clubs.css';
import '../assets/css/styles.css';
import '../assets/css/formations.css';

function Home() {
    useEffect(() => {
      document.title = 'Armar Equipos';
    }, []);
    
    return (
      <div>
        <h1>Armar Equipos</h1>
        {/* Aquí irá el contenido migrado de index.html */}
      </div>
    );
}
  
export default Home;