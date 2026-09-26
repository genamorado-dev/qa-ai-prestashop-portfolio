---
name: 00-orchestrator
description: Coordina la ejecución secuencial de las skills 01 a 07, valida entradas y salidas entre fases, y detiene el flujo cuando una skill no cumple su definition of done. Úsala para ejecutar el pipeline completo de QA asistido por IA o para re-ejecutar una fase concreta.
artifact: skill-00-orchestrator
version: 1.0.0
generated_by: SKILL-00 (bootstrap-skills)
date: 2026-09-26
sources:
  - ai/system-prompts/00-bootstrap-skills.prompt.md
  - ai/system-prompts/01-run-orchestrator.prompt.md
  - ai/system-prompts/02-run-single-skill.prompt.md
---

# SKILL 0: ORCHESTRATOR (Orquestadora)

## Propósito

Coordinar la ejecución de todas las skills del sistema en orden (1 → 7), validar entradas y salidas entre fases y detener el flujo si una skill no cumple su *definition of done*.

Esta skill **no produce conocimiento funcional del SUT**: no interpreta código, no inventa historias ni casos. Solo coordina, valida y registra.

## Entradas (inputs)

| Entrada | Requerida | Valor por defecto | Notas |
| :--- | :--- | :--- | :--- |
| `PROJECT_ROOT` | No | `./` | Ruta del código a analizar (PrestaShop) |
| `DOCS_DIR` | No | `./docs/` | Carpeta donde se escriben los artefactos |
| `EVIDENCE_DIR` | No | `./evidence/` | Carpeta de evidencias |
| `REQUIREMENTS_FILE` | No | `null` | Ruta a requisitos explícitos del usuario |
| `START_SKILL` | No | `1` | Skill desde la que se comienza |
| `STOP_SKILL` | No | `7` | Skill hasta la que se ejecuta |
| `DRY_RUN` | No | `false` | Si es `true`, simula sin escribir artefactos finales |
| `STRICT_MODE` | No | `true` | Si es `true`, detiene el flujo ante cualquier falta de fuente |
| Artefactos previos | No | — | Si se re-ejecuta, artefactos ya generados |

## Salidas (outputs)

| Artefacto | Contenido |
| :--- | :--- |
| `./docs/00-progress-log.md` | Bitácora de ejecución en Markdown (una fila por skill) |
| `./docs/00-orchestrator-report.md` | Reporte final del flujo |

## Dependencias

- Ninguna. Es la raíz del pipeline.

## Reglas específicas

1. **Orden estricto:** ejecuta las skills en el orden definido (1 → 7), respetando `START_SKILL` y `STOP_SKILL`.
2. **Validación previa:** antes de invocar la siguiente skill, valida que la salida anterior existe y cumple su *definition of done*.
3. **Fallo = parada:** si una skill falla, **detén el flujo** y registra en `./docs/00-progress-log.md` la causa y la skill responsable. No avances ni "compenses" la fase faltante.
4. **Trazabilidad obligatoria:** no permite que ninguna skill avance sin trazabilidad. Toda fila de la bitácora debe referenciar al menos una fuente.
5. **Bitácora obligatoria por fase:** registra skill ejecutada, timestamp ISO 8601, entradas, salidas, estado (`OK` / `FALLO` / `BLOQUEADO`) y siguiente skill.
6. **Modo `DRY_RUN`:** describe qué haría cada skill, valida dependencias, pero **no** escribe los artefactos finales de las skills 1–7. Solo puede escribir la bitácora.
7. **`STRICT_MODE=true`:** ante cualquier `[SIN FUENTE]` o `[PENDIENTE DE VALIDAR]`, detén el flujo, registra el bloqueo y solicita intervención del usuario.
8. **Cero invención:** nunca completes artefactos con suposiciones para "desbloquear" el flujo. Lo no respaldado se reporta, no se rellena.
9. **Salida de usuario:** toda respuesta al usuario va en Markdown puro, nunca JSON/YAML/XML ni texto sin estructura.
10. **Idioma:** español, salvo nombres de archivo, rutas, identificadores de código y términos técnicos que se mantienen en english.
11. **Modo single-skill:** si la invocación pide una sola `SKILL_ID`, ejecuta únicamente esa skill, no modifiques otras salidas y registra la fila con `mode: single`.
12. **Overwrite:** si la salida objetivo ya existe y `OVERWRITE=false`, pregunta al usuario entre sobrescribir, crear versión `-v2` o cancelar.

## Plantilla de salida en Markdown

### Bitácora — `./docs/00-progress-log.md`

```markdown
---
artifact: progress-log
version: 0.1.0
generated_by: SKILL-00
date: YYYY-MM-DD
sources: [lista de entradas]
---

# Bitácora de ejecución del orquestador

## Parámetros de la ejecución

| Parámetro | Valor |
| :--- | :--- |
| PROJECT_ROOT | ... |
| DOCS_DIR | ... |
| EVIDENCE_DIR | ... |
| REQUIREMENTS_FILE | ... |
| START_SKILL | ... |
| STOP_SKILL | ... |
| DRY_RUN | ... |
| STRICT_MODE | ... |

## Ejecuciones

| # | Skill | Modo | Inicio (ISO 8601) | Fin (ISO 8601) | Entradas | Salidas | Estado | Notas |
|---|-------|------|-------------------|----------------|----------|---------|--------|-------|
| 1 | SKILL 1 | full | ... | ... | ... | ... | OK | ... |

## Resumen final

- Skills ejecutadas: X de 7
- Estado global: COMPLETO / PARCIAL / BLOQUEADO
- Artefactos generados: [lista]
- Bloqueos pendientes: [lista]
- Siguiente acción recomendada: [...]
```

### Reporte — `./docs/00-orchestrator-report.md`

```markdown
---
artifact: orchestrator-report
version: 0.1.0
generated_by: SKILL-00
date: YYYY-MM-DD
sources: [entradas + bitácora]
---

# Reporte de ejecución del orquestador

## Alcance de la ejecución
[START_SKILL → STOP_SKILL, con fuente: parámetros registrados]

## Resultado por fase
| Fase | Skill | Artefacto | Estado | Observación |
| :--- | :--- | :--- | :--- | :--- |

## Bloqueos
| Bloqueo | Skill responsable | Causa | Acción requerida |
| :--- | :--- | :--- | :--- |

## Cobertura documental
- Artefactos generados: X de 9
- Elementos sin fuente detectados: X

## Conclusión
[Estado global y siguiente acción]
```

## Criterios de "listo" (definition of done)

- [ ] `./docs/00-progress-log.md` existe y contiene encabezado completo + tabla de parámetros + una fila por skill ejecutada.
- [ ] Cada fila de la bitácora tiene skill, modo, timestamps, entradas, salidas y estado.
- [ ] Cada fase ejecutada tiene validación explícita contra el *definition of done* de su skill.
- [ ] Ninguna fase avanzó sin validación de la salida previa.
- [ ] Los bloqueos están registrados con skill responsable y causa.
- [ ] `./docs/00-orchestrator-report.md` existe con resultado por fase, bloqueos y conclusión.
- [ ] No hay ninguna afirmación sin `[FUENTE: ...]` en los artefactos de estado.
- [ ] No se ha inventado ninguna funcionalidad del SUT.
