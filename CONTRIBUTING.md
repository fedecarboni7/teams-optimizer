# Contributing to Armar Equipos

¡Gracias por considerar contribuir a Armar Equipos! A continuación se detallan las pautas para contribuir a este proyecto.

## Cómo contribuir

### 1. Fork del repositorio  

Haz un fork del repositorio y clona el fork a tu máquina local para realizar cambios.

```bash
git clone https://github.com/fedecarboni7/teams-optimizer.git
```
    
### 2. Crea una rama para tu feature o bugfix
    
Crea una nueva rama en tu fork para trabajar en una nueva característica o corrección de errores. Usa un nombre de rama descriptivo.

```bash
git checkout -b nombre-de-la-rama
```

### 3. Realiza cambios

Realiza los cambios que consideres necesarios en tu rama. Asegúrate de seguir las mejores prácticas y de que tu código esté limpio y bien documentado.

### 4. Escribe pruebas

Si es necesario, añade o modifica pruebas para garantizar que tus cambios no rompan nada. Asegúrate de que todas las pruebas pasen antes de continuar.

### 5. Haz commit de tus cambios

Usa mensajes de commit descriptivos. Si estás siguiendo un formato de commits convencional, respétalo.

```bash
git commit -m "feat: descripción de tu cambio"
```

### 6. Sincroniza con el upstream

Antes de enviar tu pull request, asegúrate de que tu rama esté actualizada con la rama master del repositorio original.
```bash
git fetch upstream
git checkout master
git merge upstream/master
git checkout nombre-de-la-rama
git rebase master
```

### 7. Envía un Pull Request

Envía un pull request desde tu fork al repositorio original. Asegúrate de describir claramente los cambios y el propósito del PR. 
- Resuelve conflictos si los hay.
- Añade una descripción detallada sobre qué problema resuelve y cómo lo resuelve.
- Si tu cambio es relevante, actualiza la documentación del proyecto.

### 8. Revisión y Feedback
Tu PR será revisado. Puede que recibas feedback o se te pida realizar cambios antes de que se acepte.

## Estilo de código
- Sigue la convención de estilo de código de Python (PEP 8).
- Usa comentarios claros y concisos.
- Mantén el código lo más simple y legible posible.

## Comunicación
Si tenés alguna duda o necesitás discutir algo antes de empezar a trabajar en una contribución, no dudes en abrir un issue o escribirme por cualquier canal de comunicación.
