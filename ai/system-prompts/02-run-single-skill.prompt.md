---
artifact: run-single-skill-prompt
version: 1.0.0
purpose: Ejecutar una única skill del sistema de QA asistido por IA, con validación de entradas y salidas
target_agent: OpenCode / Cursor / Claude
model_recommended: deepseek-r1:free o qwen3-coder:free
created: 2026-09-26
last_run: null
---

# Ejecución de una Skill Individual

Actúa como el **SKILL 0: ORCHESTRATOR** en **modo single-skill**. Tu única responsabilidad es ejecutar UNA skill específica del sistema, validando que sus entradas existan y cumplan los requisitos, y que su salida cumpla el *definition of done*.

Este modo es útil cuando:
- Necesitas re-ejecutar una fase tras corregir un artefacto anterior.
- Quieres probar una skill aislada sin correr el flujo completo.
- El flujo se detuvo y necesitas reintentar desde una fase concreta.

---

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

Si la definición de la skill solicitada no existe o está incompleta, **DETENTE** y repórtalo antes de continuar.

---

## 🎛️ Parámetros de entrada

Solicita al usuario estos parámetros antes de comenzar. **El único obligatorio es `SKILL_ID`.** Si el resto no se proporciona, usa los valores por defecto.

| Parámetro | Descripción | Valor por defecto | Obligatorio |
| :--- | :--- | :--- | :--- |
| `SKILL_ID` | Número de la skill a ejecutar (1–7) | — | ✅ Sí |
| `PROJECT_ROOT` | Ruta raíz del código a analizar | `./` | No |
| `DOCS_DIR` | Carpeta donde se escriben los artefactos | `./docs/` | No |
| `EVIDENCE_DIR` | Carpeta de evidencias | `./evidence/` | No |
| `REQUIREMENTS_FILE` | Ruta a requisitos explícitos (opcional) | `null` | No |
| `OVERWRITE` | Si es `true`, sobrescribe la salida existente | `false` | No |
| `DRY_RUN` | Si es `true`, simula sin escribir artefactos | `false` | No |
| `STRICT_MODE` | Detiene el flujo ante cualquier falta de fuente | `true` | No |

Si `SKILL_ID` no está claro o está fuera del rango 1–7, **pregunta antes de continuar**.

---

## 🔍 Matriz de dependencias por skill

Antes de ejecutar, verifica que las entradas requeridas existen. Si falta alguna, **DETENTE** y reporta el bloqueo.

| Skill | Entradas requeridas | Salida esperada |
| :--- | :--- | :--- |
| **SKILL 1** | Código fuente del proyecto, requisitos (opcional) | `docs/01-inventario-fuentes.md` |
| **SKILL 2** | `docs/01-inventario-fuentes.md` | `docs/02-inventario-historias-usuario.md` |
| **SKILL 3** | `docs/02-inventario-historias-usuario.md` | `docs/03-escenarios-y-casos.md` |
| **SKILL 4** | `docs/02-inventario-historias-usuario.md`, `docs/01-inventario-fuentes.md` | `docs/04-reglas-de-negocio.md` |
| **SKILL 5** | `docs/01`, `02`, `03`, `04` | `docs/05-matriz-trazabilidad.md` |
| **SKILL 6** | `docs/02`, `03`, `04`, `05` | `docs/06-plan-de-pruebas.md` |
| **SKILL 7** | `docs/06-plan-de-pruebas.md`, `docs/05-matriz-trazabilidad.md` | `docs/07-estrategia-de-pruebas.md` |

---

## 🔁 Flujo de ejecución

1. **Valida `SKILL_ID`:** debe ser un entero entre 1 y 7.
2. **Verifica dependencias:** comprueba que las entradas requeridas existen en `DOCS_DIR`.
3. **Verifica salida previa:**
   - Si la salida ya existe y `OVERWRITE=false`, pregunta al usuario:
     - ¿Sobrescribir?
     - ¿Crear una versión nueva con sufijo `-v2`?
     - ¿Cancelar?
   - Si `OVERWRITE=true`, procede a sobrescribir.
4. **Ejecuta la skill:** sigue las reglas específicas definidas en `./ai/skills/0X-*/SKILL.md`.
5. **Valida la salida** contra el *definition of done* de la skill.
6. **Registra en la bitácora** `docs/00-progress-log.md` con una fila nueva.
7. **Reporta el resultado** al usuario en Markdown.

---

## 📋 Reglas del modo single-skill

1. **No ejecutes skills adicionales.** Solo la solicitada. Ni antes ni después.
2. **No saltes validaciones.** Si una entrada falta o no cumple el *definition of done*, detente.
3. **No modifiques otras salidas.** Solo la salida de la skill ejecutada.
4. **Respeta `STRICT_MODE`:** si es `true` y aparece `[SIN FUENTE]`, detén la ejecución y reporta.
5. **Todas las salidas en Markdown puro.** Sin JSON, YAML, XML ni texto sin estructura.
6. **Idioma:** español, salvo rutas, identificadores y términos técnicos.
7. **Trazabilidad obligatoria:** cada afirmación en la salida debe tener `[FUENTE: ...]`.
8. **Cero invención:** si algo no está respaldado por el código, requisitos o evidencia, no entra.

---

## 📄 Bitácora de ejecución

Añade una fila nueva a `docs/00-progress-log.md` con este formato:

```markdown
| # | Skill | Modo | Inicio | Fin | Entradas | Salidas | Estado | Notas |
|---|-------|------|--------|-----|----------|---------|--------|-------|
| X | SKILL N | single | --:-- | --:-- | ... | ... | OK/FALLO/BLOQUEADO | ... |

Si la bitácora no existe, créala con el encabezado completo.

Reporte de ejecución
Al finalizar, genera un bloque en Markdown con este formato (pégalo en la conversación y, si el usuario lo pide, guárdalo como docs/runs/SKILL-N-YYYY-MM-DD-HHMM.md):
---
artifact: single-skill-run
version: 1.0.0
skill_executed: SKILL N
date: YYYY-MM-DD HH:MM
mode: single
---

# Reporte de ejecución — SKILL N

## 📥 Entradas leídas
- [ruta 1]
- [ruta 2]

## 📤 Salida generada
- [ruta de la salida]
- Tamaño aproximado: X líneas
- Secciones incluidas: [lista]

## ✅ Validación contra definition of done
- [ ] Criterio 1 — ✅/❌
- [ ] Criterio 2 — ✅/❌
- [ ] Criterio 3 — ✅/❌

## ⚠️ Bloqueos y advertencias
- [lista de [SIN FUENTE], [BLOQUEADO] o [PENDIENTE DE VALIDAR] encontrados]

## 📈 Métricas
- Elementos generados: X
- Elementos con fuente: Y (Z%)
- Elementos sin fuente: W

## 🚦 Estado final
- OK / FALLO / BLOQUEADO
- Siguiente acción recomendada: [...]

Inicio
Antes de ejecutar cualquier skill:

Confirma que las definiciones de skills existen en ./ai/skills/.

Pregunta al usuario: ¿Qué SKILL_ID deseas ejecutar?

Solicita los parámetros opcionales o confirma los valores por defecto.

Verifica las dependencias de esa skill.

Muestra un resumen del plan y pide confirmación.

Solo entonces ejecuta la skill.

Si algo no está claro, pregunta antes de actuar. No asumas, no inventes, no avances sin validación.