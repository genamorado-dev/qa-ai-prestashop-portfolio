---
artifact: orchestrator-flow
version: 1.0.0
generated_by: SKILL-00 (bootstrap-skills)
date: 2026-09-26
sources:
  - ai/system-prompts/00-bootstrap-skills.prompt.md
  - ai/system-prompts/01-run-orchestrator.prompt.md
  - ai/system-prompts/02-run-single-skill.prompt.md
---

# Flujo de ejecución del orquestador

Referencia operativa para la **SKILL 0**. Define el orden de ejecución, las entradas y salidas de cada fase y los puntos de validación que impiden avanzar con una fase incompleta.

---

## 1. Orden de ejecución

```text
SKILL 0 (Orquestador)
  └─ 1 → 2 → 3 → 4 → 5 → 6 → 7
```

Secuencial y estricta. `START_SKILL` y `STOP_SKILL` permiten ejecutar un subtramo, pero **nunca se salta una fase intermedia** sin que exista su artefacto previo y validado.

> La SKILL 4 depende de la 1 y la 2, no de la 3. Puede ejecutarse en paralelo con la 3 siempre que ambas entradas estén listas; el orquestador secuencial mantiene el orden 1→7.

---

## 2. Fases: entradas, salidas y validación

### Fase 1 — SKILL 1: Code Extractor

| Aspecto | Detalle |
| :--- | :--- |
| **Definición** | `ai/skills/01-code-extractor/SKILL.md` |
| **Entradas** | `PROJECT_ROOT` (código fuente), `REQUIREMENTS_FILE` (opcional), evidencia existente |
| **Salida** | `docs/01-inventario-fuentes.md` |
| **Validación (V1)** | Existe el archivo · tiene tabla de fuentes con `ruta:línea` · tiene sección de requisitos del usuario · tiene sección de evidencia · tiene sección de vacíos detectados |
| **Si falla V1** | Estado `FALLO`. Detener. No ejecutar la fase 2. |
| **Consumidores** | Fases 2, 4, 5 |

### Fase 2 — SKILL 2: User Story Inventory

| Aspecto | Detalle |
| :--- | :--- |
| **Definición** | `ai/skills/02-user-story-inventory/SKILL.md` |
| **Entradas** | `docs/01-inventario-fuentes.md` |
| **Salida** | `docs/02-inventario-historias-usuario.md` |
| **Validación (V2)** | Cada historia tiene: fuente, condiciones verificables, reglas de negocio (si aplica), criterios de aceptación con fuente y estado |
| **Si falla V2** | Estado `FALLO`. Detener. |
| **Consumidores** | Fases 3, 4, 5, 6 |

### Fase 3 — SKILL 3: Test Scenarios

| Aspecto | Detalle |
| :--- | :--- |
| **Definición** | `ai/skills/03-test-scenarios/SKILL.md` |
| **Entradas** | `docs/02-inventario-historias-usuario.md` |
| **Salida** | `docs/03-escenarios-y-casos.md` |
| **Validación (V3)** | Cada historia validada tiene ≥1 caso positivo, ≥1 negativo y ≥1 de valor límite, o justificación con fuente de por qué no aplica. Los límites sin fuente están en sección propia y excluidos del conteo. |
| **Si falla V3** | Estado `FALLO`. Detener. |
| **Consumidores** | Fases 5, 6 |

### Fase 4 — SKILL 4: Business Rules

| Aspecto | Detalle |
| :--- | :--- |
| **Definición** | `ai/skills/04-business-rules/SKILL.md` |
| **Entradas** | `docs/02-inventario-historias-usuario.md`, `docs/01-inventario-fuentes.md` |
| **Salida** | `docs/04-reglas-de-negocio.md` |
| **Validación (V4)** | Cada `RN-XXX` tiene fuente, campo comprobabilidad (Sí/No), método de verificación e historias afectadas. Sin duplicados. No comprobables en sección propia. |
| **Si falla V4** | Estado `FALLO`. Detener. |
| **Consumidores** | Fases 5, 6 |

### Fase 5 — SKILL 5: Traceability Matrix

| Aspecto | Detalle |
| :--- | :--- |
| **Definición** | `ai/skills/05-traceability-matrix/SKILL.md` |
| **Entradas** | `docs/01`, `docs/02`, `docs/03`, `docs/04` |
| **Salida** | `docs/05-matriz-trazabilidad.md` |
| **Validación (V5)** | La tabla tiene las 7 columnas obligatorias · toda fila tiene `[FUENTE: ...]` · requisitos sin cobertura marcados con ⚠️ · existe resumen de cobertura con denominadores · existe listado de huecos |
| **Si falla V5** | Estado `FALLO`. Detener. |
| **Consumidores** | Fases 6, 7 |

### Fase 6 — SKILL 6: Test Plan

| Aspecto | Detalle |
| :--- | :--- |
| **Definición** | `ai/skills/06-test-plan/SKILL.md` |
| **Entradas** | `docs/02`, `docs/03`, `docs/04`, `docs/05` |
| **Salida** | `docs/06-plan-de-pruebas.md` |
| **Validación (V6)** | Están las 9 secciones obligatorias · cada punto de alcance existe en el inventario de historias y tiene fuente · no hay módulos ni features inventados · cronograma en marcas relativas, sin fechas de calendario |
| **Si falla V6** | Estado `FALLO`. Detener. |
| **Consumidores** | Fase 7 |

### Fase 7 — SKILL 7: Test Strategy

| Aspecto | Detalle |
| :--- | :--- |
| **Definición** | `ai/skills/07-test-strategy/SKILL.md` |
| **Entradas** | `docs/06-plan-de-pruebas.md`, `docs/05-matriz-trazabilidad.md` |
| **Salida** | `docs/07-estrategia-de-pruebas.md` |
| **Validación (V7)** | Están las 9 secciones obligatorias · cada decisión estratégica justificada con plan o matriz · supuestos marcados `[SUPUESTO]` · IA con límites de delegación definidos |
| **Si falla V7** | Estado `FALLO`. Última fase: cerrar con estado global `PARCIAL` o `BLOQUEADO`. |
| **Consumidores** | — (cierre del pipeline) |

---

## 3. Matriz de dependencias

| Skill | Requiere | Produce |
| :--- | :--- | :--- |
| **SKILL 1** | código, requisitos (opcional) | `docs/01-inventario-fuentes.md` |
| **SKILL 2** | `docs/01` | `docs/02-inventario-historias-usuario.md` |
| **SKILL 3** | `docs/02` | `docs/03-escenarios-y-casos.md` |
| **SKILL 4** | `docs/02`, `docs/01` | `docs/04-reglas-de-negocio.md` |
| **SKILL 5** | `docs/01`, `docs/02`, `docs/03`, `docs/04` | `docs/05-matriz-trazabilidad.md` |
| **SKILL 6** | `docs/02`, `docs/03`, `docs/04`, `docs/05` | `docs/06-plan-de-pruebas.md` |
| **SKILL 7** | `docs/06`, `docs/05` | `docs/07-estrategia-de-pruebas.md` |
| **SKILL 0** | parámetros del usuario | `docs/00-progress-log.md`, `docs/00-orchestrator-report.md` |

---

## 4. Puntos de control del orquestador

| Control | Momento | Acción si se incumple |
| :--- | :--- | :--- |
| Definiciones de skills existen | Antes de iniciar | `DETENER` y reportar qué falta |
| Entradas de la fase existen | Antes de cada fase | `BLOQUEADO` con skill responsable |
| `definition of done` de la fase previa | Antes de cada fase | `DETENER` sin avanzar |
| `STRICT_MODE` + `[SIN FUENTE]` | Durante cada fase | `BLOQUEADO`, pedir intervención del usuario |
| Salida existe tras la fase | Después de cada fase | `FALLO`, registrar y no avanzar |
| `DRY_RUN=true` | Durante todo el flujo | No escribir artefactos finales; solo describir y registrar en bitácora |
| Salida previa ya existe | Al inicio de cada fase | Preguntar: sobrescribir / crear `-v2` / cancelar |

---

## 5. Reglas de la bitácora

Por cada fase ejecutada se añade una fila a `docs/00-progress-log.md`:

```markdown
| # | Skill | Modo | Inicio (ISO 8601) | Fin (ISO 8601) | Entradas | Salidas | Estado | Notas |
|---|-------|------|-------------------|----------------|----------|---------|--------|-------|
| 1 | SKILL 1 | full | 2026-09-26T10:00:00Z | 2026-09-26T10:12:00Z | ./ (código) | docs/01-inventario-fuentes.md | OK | 24 fuentes, 0 sin fuente |
```

Estados permitidos: `OK` · `FALLO` · `BLOQUEADO`.

Al terminar (o al detenerse) se añade la sección **Resumen final** con: skills ejecutadas (X de 7), estado global (`COMPLETO` / `PARCIAL` / `BLOQUEADO`), artefactos generados, bloqueos pendientes y siguiente acción recomendada.

---

## 6. Modo single-skill

Para re-ejecutar una fase concreta sin correr el pipeline completo:

1. Validar `SKILL_ID` (entero entre 1 y 7).
2. Verificar que las entradas requeridas existen y cumplen su *definition of done*.
3. Si la salida ya existe y `OVERWRITE=false`, preguntar al usuario: **sobrescribir**, **crear versión `-v2`** o **cancelar**.
4. Ejecutar **solo** esa skill. No modificar otras salidas.
5. Validar la salida contra su *definition of done*.
6. Registrar la fila en la bitácora con `mode: single`.
7. Reportar el resultado en Markdown: entradas leídas, salida generada, checklist de validación, bloqueos, métricas y estado final.

> Los artefactos de fases posteriores quedan potencialmente **desalineados**. Tras una re-ejecución single-skill, el orquestador debe marcar en la bitácora qué fases deben re-ejecutarse para mantener la coherencia de la cadena.
