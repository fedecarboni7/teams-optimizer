# Frontend Maintenance Checklist

Esta guía ayuda a mantener el código frontend organizado y consistente.

## Estructura de Archivos

### Templates (HTML)
- `base.html` - Plantilla base con estructura comum
- `_sidebar.html` - Barra lateral reutilizable
- `_navbar.html` - Barra de navegación reutilizable  
- `_modal.html` - Modal genérico reutilizable

### JavaScript Modular
- `common.js` - Funciones compartidas y configuración DOM
- `sidebar.js` - Funcionalidad específica del sidebar
- `playerSelection.js` - Selección y gestión de jugadores
- `sliders.js` - Manejo de sliders de habilidades
- `navigation.js` - Navegación y scroll
- `uiHelpers.js` - Utilidades diversas de UI

### CSS Variables (base.css)
```css
:root {
    --primary-bg: #1c1c1c;
    --secondary-bg: #2a2a2a;
    --text-primary: #e0e0e0;
    --text-secondary: #ccc;
    --text-white: #ffffff;
    --accent-color: #1a73e8;
    --accent-hover: #1557b0;
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    --border-radius: 8px;
    --border-radius-lg: 12px;
}
```

## Rutina de Mantenimiento

### Antes de agregar nueva funcionalidad:
1. **¿Ya existe un módulo para esto?** Revisa los archivos JS existentes
2. **¿Puedo reutilizar componentes existentes?** Mira templates/partials y CSS
3. **¿Estoy usando las variables CSS?** No hardcodees colores o espaciados

### Agregando nuevas páginas:
1. Extiende `base.html` con `{% extends "base.html" %}`
2. Define `{% set active_page = 'nombre' %}` para el sidebar
3. Usa `{% block head %}` para CSS específico
4. Usa `{% block scripts %}` para JS específico
5. Incluye sidebar/navbar con `{% set include_sidebar = True %}`

### Agregando nuevos componentes JS:
1. Crea un archivo específico en `/static/js/`
2. Usa `document.addEventListener('DOMContentLoaded', () => {})` 
3. Exporta funciones que otros módulos puedan usar
4. Agrega el script en el template correspondiente

### Agregando nuevos estilos:
1. Usa variables CSS existentes en lugar de valores hardcodeados
2. Agrupa estilos relacionados en el mismo archivo
3. Usa clases con prefijos claros (`.btn-`, `.modal-`, `.nav-`)
4. Mantén la especificidad baja para facilitar reutilización

### Validación rápida:
- [ ] ¿Funciona el sidebar en todas las páginas?
- [ ] ¿Los modales se abren y cierran correctamente?
- [ ] ¿Los estilos son consistentes entre páginas?
- [ ] ¿No hay errores en la consola del navegador?
- [ ] ¿Los nombres de clases y funciones son descriptivos?

## Mejoras Futuras Sugeridas

### Corto plazo:
- [ ] Migrar templates restantes a usar `base.html`
- [ ] Consolidar funciones duplicadas en `ui.js` hacia módulos específicos
- [ ] Crear componentes CSS para botones, inputs, cards comunes

### Largo plazo:
- [ ] Considerar bundler básico (Vite/Parcel) para ES6 modules
- [ ] Implementar testing básico con Jest para funciones JS puras
- [ ] Migrar CSS a Sass para mejor organización
- [ ] Implementar linting con ESLint + Prettier

## Recursos

- Variables CSS: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
- Jinja2 Template Inheritance: https://jinja.palletsprojects.com/en/3.1.x/templates/#template-inheritance
- JavaScript Modules: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules