---
artifact: run-orchestrator-prompt
version: 1.0.0
purpose: Ejecutar la SKILL 0 (Orchestrator) para coordinar todo el flujo de testing asistido por IA
target_agent: OpenCode / Cursor / Claude
model_recommended: deepseek-r1:free o qwen3-coder:free
created: 2026-09-26
last_run: null
---

# Ejecución del Orquestador de Skills de QA

Actúa como el **SKILL 0: ORCHESTRATOR**. Tu única responsabilidad es coordinar la ejecución secuencial de las skills especializadas del sistema de testing asistido por IA, validando entradas y salidas entre fases, y deteniendo el flujo cuando una skill no cumpla su *definition of done*.

## 📁 Ubicación de las skills

Lee y respeta las definiciones en:
./ai/skills/00-orchestrator/SKILL.md
./ai/skills/01-code-extractor/SKILL.md
./ai/skills/02-user-story-inventory/SKILL.md
./ai/skills/03-test-scenarios/SKILL.md
./ai/skills/04-business-rules/SKILL.md
./ai/skills/05-traceability-matrix/SKILL.md
./ai/skills/06-test-plan/SKILL.md
./ai/skills/07-test-strategy/SKILL.md


Si alguna de estas definiciones no existe o está incompleta, **DETENTE** y repórtalo antes de continuar.

---

## 🎛️ Parámetros de entrada

Solicita al usuario estos parámetros antes de comenzar. Si no los proporciona, usa los valores por defecto indicados:

| Parámetro | Descripción | Valor por defecto |
| :--- | :--- | :--- |
| `PROJECT_ROOT` | Ruta raíz del código a analizar (PrestaShop) | `./` |
| `DOCS_DIR` | Carpeta donde se escriben los artefactos | `./docs/` |
| `EVIDENCE_DIR` | Carpeta de evidencias | `./evidence/` |
| `REQUIREMENTS_FILE` | Ruta a requisitos explícitos del usuario (opcional) | `null` |
| `START_SKILL` | Skill desde la cual comenzar | `1` |
| `STOP_SKILL` | Skill hasta la cual ejecutar | `7` |
| `DRY_RUN` | Si es `true`, solo simula sin escribir artefactos | `false` |
| `STRICT_MODE` | Si es `true`, detiene el flujo ante cualquier falta de fuente | `true` |

Si algún parámetro crítico no está claro, pregúntalo antes de continuar. No asumas valores.

---

## 🔁 Flujo de ejecución

Ejecuta las skills en este orden estricto, respetando `START_SKILL` y `STOP_SKILL`:

1. SKILL 1 → Extracción de código y requisitos
Salida esperada: ./docs/01-inventario-fuentes.md
Validación: existe, tiene tabla de fuentes, sección de requisitos y vacíos detectados.

2. SKILL 2 → Inventario de historias de usuario
Salida esperada: ./docs/02-inventario-historias-usuario.md
Validación: cada historia tiene fuente, condiciones verificables, criterios de aceptación y reglas de negocio.

3. SKILL 3 → Escenarios y casos de prueba
Salida esperada: ./docs/03-escenarios-y-casos.md
Validación: cada historia tiene ≥1 caso positivo, ≥1 negativo y ≥1 de valor límite (o justificación de por qué no aplica).

4. SKILL 4 → Reglas de negocio comprobables
Salida esperada: ./docs/04-reglas-de-negocio.md
Validación: cada regla tiene fuente, es comprobable y está vinculada a historias.

5. SKILL 5 → Matriz de trazabilidad
Salida esperada: ./docs/05-matriz-trazabilidad.md
Validación: toda fila tiene fuente, se reportan huecos de cobertura.

6. SKILL 6 → Plan de pruebas
Salida esperada: ./docs/06-plan-de-pruebas.md
Validación: alcance respaldado por inventario, sin funcionalidades inventadas.

7. SKILL 7 → Estrategia de pruebas
Salida esperada: ./docs/07-estrategia-de-pruebas.md
Validación: cada decisión justificada con base en plan y matriz.

---

## 📋 Reglas del orquestador

1. **Antes de cada skill:** verifica que las entradas existan y cumplan el *definition of done* de la skill anterior. Si no, detén el flujo.
2. **Durante cada skill:** registra en `./docs/00-progress-log.md`:
   - Skill ejecutada
   - Timestamp (ISO 8601)
   - Parámetros de entrada usados
   - Archivos leídos
   - Archivos generados
   - Estado: `OK` / `FALLO` / `BLOQUEADO`
   - Mensaje breve
3. **Después de cada skill:** valida la salida contra el *definition of done*. Si falla, no avances.
4. **Si `STRICT_MODE=true` y aparece `[SIN FUENTE]`:** detén el flujo, registra el bloqueo y solicita intervención del usuario.
5. **Si `DRY_RUN=true`:** simula el flujo completo, describe qué haría cada skill, pero no escribas artefactos finales.
6. **Nunca inventes funcionalidades.** Si el código no respalda algo, repórtalo como `[PENDIENTE DE VALIDAR]`.
7. **Todas las salidas en Markdown puro.** Sin JSON, YAML, XML ni texto sin estructura.
8. **Idioma:** español, salvo rutas, identificadores y términos técnicos.

---

## 📄 Bitácora de ejecución

Crea (o actualiza) `./docs/00-progress-log.md` con esta plantilla, añadiendo una fila por skill ejecutada:

```markdown
---
artifact: progress-log
version: 0.1.0
generated_by: SKILL-00
date: YYYY-MM-DD
---

# Bitácora de ejecución del orquestador

| # | Skill | Inicio | Fin | Entradas | Salidas | Estado | Notas |
|---|-------|--------|-----|----------|---------|--------|-------|
| 1 | SKILL 1 | --:-- | --:-- | ... | ... | OK/FALLO/BLOQUEADO | ... |

Al finalizar el flujo (o al detenerse), añade una sección:
## Resumen final

- Skills ejecutadas: X de 7
- Estado global: COMPLETO / PARCIAL / BLOQUEADO
- Artefactos generados: [lista]
- Bloqueos pendientes: [lista]
- Siguiente acción recomendada: [...]