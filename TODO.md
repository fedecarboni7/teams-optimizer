# TODO - Teams Optimizer

## Próximos cambios pendientes para players_v2

### 🔍 Buscador de jugadores
- [ ] Agregar campo de búsqueda en la interfaz (input de texto)
- [ ] Implementar función de filtrado en tiempo real por nombre de jugador
- [ ] Mantener compatibilidad con el sistema de ordenamiento existente
- [ ] Agregar indicador visual cuando hay filtros activos
- [ ] Considerar búsqueda por habilidades específicas (opcional)

### ➕ Modal para creación de jugadores
- [ ] Reemplazar el `prompt()` actual por un modal completo
- [ ] Crear formulario con todos los campos de habilidades
- [ ] Mantener consistencia visual con el modal de edición existente
- [ ] Implementar validación de campos en tiempo real
- [ ] Agregar botones de "Guardar" y "Cancelar"
- [ ] Usar los mismos estilos CSS del modal de detalles

### 🎨 Mejoras adicionales (futuras)
- [ ] Animaciones de transición suaves
- [ ] Drag & drop para reordenar jugadores
- [ ] Exportar lista de jugadores (CSV/Excel)
- [ ] Importar jugadores masivamente
- [ ] Filtros avanzados (por rango de habilidades, fecha, etc.)

---

## Estado actual completado ✅
- ✅ Modal de detalles con radar chart
- ✅ Edición completa de jugadores dentro del modal
- ✅ Validación de rangos de habilidades (1-5 / 1-10)
- ✅ Sistema de ordenamiento por columnas (nombre, puntuación, fecha)
- ✅ Diseño responsive y tema dark
- ✅ Gestión de contextos (mis jugadores / clubes)
- ✅ Toast de confirmación al guardar
