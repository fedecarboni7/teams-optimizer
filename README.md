# Armar Equipos

Este proyecto tiene como objetivo proporcionar una aplicación web que ayude a optimizar la composición de equipos de fútbol para obtener partidos más competitivos y parejos.

## Funcionalidades

* **Creación de jugadores:** La aplicación te permite crear los perfiles de jugadores puntuando cada una de sus habilidades específicas, y guardarlos para futuros partidos.
* **Composición de Equipos:** El algoritmo analizará perfiles individuales y sugerirá combinaciones óptimas de equipos basadas en sus habilidades.
* **Emparejamiento de Habilidades:** Identificará y emparejará a individuos con habilidades complementarias para mejorar el rendimiento del equipo.
* **Visualización de Habilidades del Equipo:** Proporciona una visualización en una tabla de habilidades y un gráfico de radar comparando las habilidades de los equipos sugeridos, permitiendo una evaluación rápida de las fortalezas y debilidades del equipo.

## Beneficios

* **Mejora del Rendimiento del Equipo:** Al optimizar la composición del equipo, la herramienta puede mejorar el rendimiento y la productividad general del equipo.
* **Mayor Eficiencia:** Puede ahorrar tiempo y esfuerzo al automatizar el proceso de selección de equipos.
* **Selección Justa y Objetiva:** La herramienta utilizará análisis basados en datos para asegurar una selección de equipos justa y objetiva.
* **Colaboración Mejorada:** Puede fomentar una mejor colaboración entre los miembros del equipo al identificar individuos con habilidades complementarias.

## Uso

La herramienta puede ser utilizada por cualquier persona responsable de formar equipos y que tenga un conocimiento mínimo de las habilidades de los jugadores.

## Desarrollo Futuro

El proyecto continuará desarrollándose para incorporar características y funcionalidades adicionales. Estas pueden incluir:

* **Seguimiento del Rendimiento del Equipo:** Hará un seguimiento del rendimiento del equipo a lo largo del tiempo para identificar áreas de mejora y realizar los ajustes necesarios.
* **Nuevas habilidades**: Permitirá crear tu propio set de habilidades a comparar entre los equipos.
* **Colaboración entre jugadores**: La puntuación de las habilidades sería calculada entre los inputs de distintos jugadores para lograr una evaluación más equilibrada y consensuada.

## Desarrollo

### Ejecutar la aplicación

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Checklist de Verificación

Después de realizar cambios en el frontend, verifica que todo funcione correctamente:

#### ✅ Funcionalidad del Sidebar
- [ ] El sidebar se abre y cierra correctamente con el botón de menú (☰)
- [ ] Los enlaces de navegación funcionan (Armar Equipos, Jugadores, Clubes, Mi Perfil)
- [ ] El overlay del sidebar cierra el menú al hacer clic
- [ ] Las páginas activas se resaltan correctamente en el sidebar

#### ✅ JavaScript sin Errores
- [ ] Abrir la consola del navegador (F12) y verificar que no hay errores en rojo
- [ ] Los eventos de click funcionan sin usar `onclick` inline
- [ ] Los módulos JavaScript se cargan correctamente
- [ ] Las funciones de navegación y UI responden apropiadamente

#### ✅ Estilos Consistentes
- [ ] Los colores siguen las variables CSS definidas en `base.css`
- [ ] No hay estilos duplicados o conflictivos
- [ ] Los botones y componentes mantienen el diseño consistente
- [ ] La tipografía y espaciado es uniforme en todas las páginas

#### ✅ Funcionalidad de Páginas
- [ ] **Jugadores**: La tabla ordena y filtra correctamente
- [ ] **Armar Equipos**: Los formularios y selección de jugadores funcionan
- [ ] **Clubes**: La gestión de clubes y miembros opera sin problemas
- [ ] **Perfil**: Los formularios de cambio de contraseña y email funcionan
- [ ] **Home**: El formulario principal y la lógica de equipos está operativa

#### ✅ Responsividad
- [ ] Las páginas se ven bien en diferentes tamaños de pantalla
- [ ] El sidebar funciona correctamente en dispositivos móviles
- [ ] Los formularios son accesibles en pantallas pequeñas

### Estructura del Proyecto

```
├── templates/
│   ├── base.html              # Template base con estructura común
│   ├── _sidebar.html          # Componente sidebar reutilizable
│   ├── _navbar.html           # Componente navbar reutilizable
│   ├── _modals.html           # Modales comunes
│   ├── index.html             # Página principal (extends base.html)
│   ├── players.html           # Gestión de jugadores (extends base.html)
│   ├── armar_equipos.html     # Armar equipos (extends base.html)
│   ├── clubs.html             # Gestión de clubes (extends base.html)
│   └── profile.html           # Perfil de usuario (extends base.html)
├── static/
│   ├── css/
│   │   ├── base.css           # Variables CSS y estilos base
│   │   ├── components.css     # Componentes reutilizables
│   │   └── ...                # Otros archivos CSS
│   └── js/
│       ├── modules/
│       │   ├── common.js      # Utilidades comunes
│       │   ├── sidebar.js     # Lógica del sidebar
│       │   └── players-table.js # Tabla de jugadores
│       └── ...                # Otros archivos JS
```

## Contribuir

Las contribuciones a este proyecto son bienvenidas. Por favor, consultá las [Guías de Contribución](CONTRIBUTING.md) para más información.

## Licencia

Este proyecto está licenciado bajo la [Licencia MIT](LICENSE).
