---
name: 00-orchestrator-tasks
description: Coordina la ejecución de las skills de tarea TSK-01 a TSK-12 según un pipeline configurable (nueva-historia, revision-suite, post-ejecución, pre-release, pre-ejecución o una lista explícita), valida la salida de cada skill contra su definition of done antes de pasar a la siguiente, detiene el flujo si una falla y deja bitácora en Markdown. Úsala para automatizar el trabajo diario del QA.
artifact: skill-00-orchestrator-tasks
version: 1.0.0
generated_by: TSK-00 (bootstrap-qa-task-skills)
date: 2026-09-27
sources:
  - ai/system-prompts/03-run-repetitive-tasks-skill.prompt.md
---

# TSK-00: ORQUESTADORA DE TAREAS

## Propósito

Coordinar la ejecución de las skills de tarea (`TSK-01` … `TSK-12`) en el orden que impone un pipeline, validar la salida de cada una contra su *definition of done* antes de invocar la siguiente, detener el flujo en cuanto una falla y registrar todo en una bitácora en Markdown. Es la única skill que conoce el catálogo completo: las demás no saben ni qué pipelines existen ni qué skills hay.

Esta skill **no produce conocimiento del producto**: no interpreta código, no redacta casos, no diagnostica fallos. Solo coordina, valida y registra.

## Cuándo usarla (disparadores)

- "Ejecuta el pipeline nueva-historia."
- "Quiero el post-ejecución completo: análisis de fallos, flakiness y bugs."
- "Necesito revisar la suite antes de automatizar más."
- "Vamos a preparar el release: selección de regresión y resumen."
- "Antes de correr la suite, hazme el healthcheck y genera los datos."
- Cualquier ejecución de dos o más `TSK-XX` que deba quedar registrada de forma uniforme.

## Entradas (inputs)

| Entrada | Requerida | Notas |
| :--- | :--- | :--- |
| `PIPELINE` (nombre) o `SKILL_LIST` | Sí | Uno de los dos. Ver tabla de pipelines |
| `PROJECT_ROOT` | No | `./` |
| `DOCS_TASKS_DIR` | No | `./docs/tasks/` |
| `EVIDENCE_TASKS_DIR` | No | `./evidence/tasks/` |
| Parámetros específicos de las skills | No | Se pasan tal cual; cada skill declara los suyos |
| `DRY_RUN` | No | `false` — si es `true`, no escribe los artefactos de las skills |
| `STRICT_MODE` | No | `true` — detiene el flujo ante cualquier `[SIN FUENTE]` |
| `OVERWRITE` | No | `false` — comportamiento si la salida ya existe |
| `STOP_ON_FAILURE` | No | `true` — detiene el pipeline en la primera skill que falle |

## Salidas (outputs)

| Artefacto | Contenido |
| :--- | :--- |
| `./docs/tasks/00-orchestrator-tasks-log.md` | Bitácora del pipeline: parámetros, tabla de ejecución por skill, validaciones y resultado |
| Artefactos de cada `TSK-XX` | Los que cada skill declare en su sección de salidas |

## Dependencias

- **Todas las `TSK-XX`** del catálogo (`TSK-01` … `TSK-12`).
- Es independiente de las skills `00-orchestrator` … `07-test-strategy` de `ai/skills/`: consume sus artefactos, no los ejecuta.

## Pipelines predefinidos

| Pipeline | Secuencia | Uso típico |
| :--- | :--- | :--- |
| `pre-ejecución` | `TSK-10` → `TSK-11` | Antes de correr la suite: entorno operativo y datos aislados |
| `nueva-historia` | `TSK-01` → `TSK-02` → `TSK-14` | Historia nueva: revisión, casos y cobertura funcional |
| `revision-suite` | `TSK-04` → `TSK-17` → `TSK-20` | Revisión de la suite: antipatrones, redundancia y localizadores |
| `post-ejecución` | `TSK-05` → `TSK-06` → `TSK-07` | Después de correr: qué falló, qué es inestable, qué bugs se abren |
| `pre-release` | `TSK-08` → `TSK-09` → `TSK-19` | Antes de publicar: regresión, resumen y métricas |

> **Nota de catálogo:** los pipelines `nueva-historia`, `revision-suite` y `pre-release` referencian `TSK-14`, `TSK-17`, `TSK-19` y `TSK-20`, que **no están definidas** en el catálogo confirmado. Mientras no existan, esos pipelines se ejecutan con las skills disponibles y la etapa ausente se registra como `NO DEFINIDA` en la bitácora, nunca se omite en silencio. Ver la sección "Pipelines con etapas pendientes".

## Proceso paso a paso

1. **Interpretar la petición.** Si el usuario da un nombre de pipeline, expande la secuencia. Si da una lista de `TSK-XX`, respeta ese orden. Si no es claro: pregunta y no ejecutes.
2. **Verificar el catálogo.** Para cada skill del pipeline, confirma que `ai/skills/tasks/TSK-XX-<nombre>/SKILL.md` existe. Si falta: registra la etapa como `NO DEFINIDA`, y si es bloqueante para el pipeline, detén.
3. **Verificar las entradas de cada skill,** contra la sección "Entradas" de su `SKILL.md`. Una entrada ausente produce un estado `BLOQUEADO` para esa etapa, no un artefacto parcial.
4. **Registrar los parámetros** del pipeline en la bitácora antes de ejecutar nada.
5. **Ejecutar las skills en orden,** una por vez. Entre una y otra, **valida la salida de la anterior** contra su *definition of done*:
   - ¿Existe el archivo de salida declarado?
   - ¿Tiene el encabezado completo (`artifact`, `version`, `generated_by`, `date`, `sources`)?
   - ¿Cumple la lista de criterios de "listo" de esa skill?
   - ¿Contiene algo marcado `[SIN FUENTE]` o `[BLOQUEADO]`?
6. **Decidir la continuación** según el resultado de la validación:

   | Resultado de la validación | Acción |
   | :--- | :--- |
   | Todos los criterios cumplidos | Continúa con la siguiente skill. |
   | Algún criterio incumplido, no bloqueante | Continúa, pero registra la desviación como observación. |
   | Algún criterio incumplido y bloqueante | **Detén el pipeline**, registra `FALLO` y reporta. |
   | `[BLOQUEADO: ...]` presente | **Detén el pipeline** (salvo `STRICT_MODE=false`, y entonces se marca `PARCIAL`). |
   | `[SIN FUENTE]` presente | **Detén el pipeline** si `STRICT_MODE=true`. |

7. **No inventes para desbloquear.** Si una etapa falla, la siguiente que dependa de ella **no se ejecuta**: se registra como `OMITIDA POR DEPENDENCIA`. No se rellena el hueco ni se genera un artefacto provisional.
8. **Escribir la bitácora** con una fila por etapa: skill, modo, inicio, fin, entradas, salidas, estado, observaciones y siguiente paso.
9. **Emitir el reporte de ejecución** al usuario en Markdown, con el resultado por etapa, los bloqueos, la siguiente acción y la pregunta sobre qué ejecutar a continuación.

## Reglas específicas

1. **Orden estricto.** Ejecuta en el orden del pipeline. Si una skill necesita ejecutarse antes de otra de la secuencia, es un error de diseño del pipeline: repórtalo, no lo reordenes por tu cuenta.
2. **Validación obligatoria entre etapas.** Ninguna etapa avanza sin validar la salida de la anterior contra su *definition of done*.
3. **Fallo = parada.** Con `STOP_ON_FAILURE=true`, la primera etapa fallida detiene el pipeline completo.
4. **Estandar de estado.** Cada etapa queda en uno de: `OK`, `FALLO`, `BLOQUEADO`, `OMITIDA`, `NO DEFINIDA`.
5. **Cero invención.** Nunca completes el artefacto de una etapa fallida con suposiciones para "desbloquear" el pipeline. Lo no respaldado se reporta.
6. **`DRY_RUN`:** valida dependencias, describe qué haría cada skill y escribe **solo** la bitácora. No genera los artefactos de las skills.
7. **`OVERWRITE`:** si el artefacto de una skill existe y `OVERWRITE=false`, pregunta al usuario entre sobrescribir, crear una versión con sufijo de fecha o saltar la etapa.
8. **Aislamiento.** Esta skill no modifica los artefactos de las `TSK-XX` ni los de `ai/skills/`. Solo escribe su bitácora.
9. **Idempotencia de la bitácora.** La tabla de ejecución se regenera completa en cada corrida; no se acumulan filas de ejecuciones anteriores en el mismo informe.
10. **Cero secretos.** Ninguna credencial, token o cookie aparece en la bitácora ni en el reporte, aunque venga en los logs de entrada.
11. **Markdown puro.** Bitácora y reporte en Markdown. Sin JSON, YAML ni XML.
12. **Idioma:** español, salvo rutas, identificadores y términos técnicos.

### Pipelines con etapas pendientes

Cuando un pipeline referencia una skill no definida en el catálogo actual, se ejecuta así:

| Situación | Comportamiento |
| :--- | :--- |
| Etapa `TSK-XX` no existe en `ai/skills/tasks/` | Estado `NO DEFINIDA`. Si es la última, el pipeline continúa; si es intermedia, se detiene y se reporta. |
| Ejemplo: `nueva-historia` incluye `TSK-14` | Se ejecutan `TSK-01` y `TSK-02`; `TSK-14` queda `NO DEFINIDA` y se pide al usuario decidir si se omite. |
| Ejemplo: `pre-release` incluye `TSK-19` | Se ejecutan `TSK-08` y `TSK-09`; `TSK-19` queda `NO DEFINIDA` y no se sustituye por nada parecido. |

## Plantilla de salida en Markdown

### Bitácora — `./docs/tasks/00-orchestrator-tasks-log.md`

```markdown
---
artifact: orchestrator-tasks-log
version: 0.1.0
generated_by: TSK-00
date: YYYY-MM-DD
sources: [ai/system-prompts/05-run-task-pipeline.prompt.md]
---

# Bitácora de ejecución de tareas

## Parámetros del pipeline
| Parámetro | Valor |
| :--- | :--- |
| Pipeline | post-ejecución |
| Secuencia | TSK-05 → TSK-06 → TSK-07 |
| PROJECT_ROOT | ./ |
| DOCS_TASKS_DIR | ./docs/tasks/ |
| EVIDENCE_TASKS_DIR | ./evidence/tasks/ |
| DRY_RUN | false |
| STRICT_MODE | true |
| OVERWRITE | false |
| STOP_ON_FAILURE | true |

## Ejecución por etapa
| # | Skill | Modo | Inicio (ISO 8601) | Fin (ISO 8601) | Entradas | Salida | Estado | Observaciones |
|---|-------|------|-------------------|----------------|----------|--------|--------|--------------|
| 1 | TSK-05 | full | 2026-09-27T10:00:00Z | 2026-09-27T10:03:12Z | reports/junit/results.xml | docs/tasks/TSK-05-analisis-fallos.md | OK | 3 fallos clasificados, 1 pendiente de validar |
| 2 | TSK-06 | full | 2026-09-27T10:03:12Z | 2026-09-27T10:05:40Z | reports/junit/*.xml | docs/tasks/TSK-06-analisis-flaky.md | OK | 2 tests intermitentes |
| 3 | TSK-07 | full | — | — | TSK-05, TSK-06 | docs/tasks/TSK-07-defectos/BUG-001.md | OMITIDA | Dependencia no satisfecha: TSK-05 dejó candidatos sin evidencia suficiente |

## Validaciones de definition of done
| # | Skill | Criterios cumplidos | Criterios incumplidos | Resultado |
|---|-------|--------------------|-----------------------|-----------|
| 1 | TSK-05 | 9/9 | — | VÁLIDA |
| 2 | TSK-06 | 9/9 | — | VÁLIDA |

## Resumen
| Métrica | Valor |
| :--- | :--- |
| Etapas planificadas | 3 |
| Etapas ejecutadas | 2 |
| Etapas con estado OK | 2 |
| Artefactos generados | 2 |
| Bloqueos | 0 |

## Estado global
COMPLETO / PARCIAL / BLOQUEADO

## Siguiente acción recomendada
[…]
```

### Reporte al usuario

```markdown
## Reporte de ejecución del pipeline `post-ejecución`

| # | Skill | Estado | Artefacto | Observación |
|---|-------|--------|-----------|-------------|
| 1 | TSK-05 | OK | `docs/tasks/TSK-05-analisis-fallos.md` | … |
| 2 | TSK-06 | OK | `docs/tasks/TSK-06-analisis-flaky.md` | … |
| 3 | TSK-07 | OMITIDA | — | … |

**Estado global:** PARCIAL
**Bloqueos:** [lista]
**Siguiente acción:** […]
```

## Criterios de "listo" (definition of done)

- [ ] `./docs/tasks/00-orchestrator-tasks-log.md` existe con encabezado completo.
- [ ] La tabla de parámetros del pipeline está completa, con los valores realmente usados.
- [ ] Existe una fila por etapa del pipeline, incluidas las omitidas y las no definidas, con estado.
- [ ] Cada etapa ejecutada tiene su entrada, su salida, su hora de inicio y fin, y su estado.
- [ ] Existe la tabla de validaciones contra el *definition of done* de cada skill ejecutada, con el recuento de criterios.
- [ ] Ninguna etapa se ejecutó sin haber validado la salida de la anterior.
- [ ] Los bloqueos están registrados con la etapa responsable y la causa.
- [ ] El estado global (`COMPLETO` / `PARCIAL` / `BLOQUEADO`) está declarado con su justificación.
- [ ] Las etapas `NO DEFINIDA` están visibles en la bitácora y no se sustituyen por tareas parecidas.
- [ ] Ningún artefacto de una `TSK-XX` fue modificado por esta skill.
- [ ] No hay secretos en la bitácora ni en el reporte.

## Ejemplos de invocación

| Objetivo | Invocación |
| :--- | :--- |
| Pipeline de historia nueva | `Ejecuta TSK-00 con PIPELINE=nueva-historia` |
| Pipeline tras una corrida | `Ejecuta TSK-00 con PIPELINE=post-ejecución y LOGS=./reports/junit` |
| Revisión de la suite | `Ejecuta TSK-00 con PIPELINE=revision-suite` |
| Lista explícita | `Ejecuta TSK-00 con SKILL_LIST=[TSK-10, TSK-01]` |
| Solo una etapa | `Ejecuta TSK-00 con SKILL_LIST=[TSK-05]` |
| Sin escribir artefactos | `Ejecuta TSK-00 con PIPELINE=pre-release y DRY_RUN=true` |
