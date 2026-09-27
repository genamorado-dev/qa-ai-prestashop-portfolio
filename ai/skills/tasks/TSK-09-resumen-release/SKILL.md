---
name: TSK-09-resumen-release
description: Consolida los reportes de ejecución, el estado de los defectos y los riesgos conocidos en un informe de calidad de release con cobertura, defectos abiertos por severidad, riesgos y recomendación go/no-go sustentada en evidencia. Úsala al cerrar una iteración o antes de una reunión de salida de versión.
artifact: skill-tsk-09-resumen-release
version: 1.0.0
generated_by: TSK-00 (bootstrap-qa-task-skills)
date: 2026-09-27
sources:
  - ai/system-prompts/03-run-repetitive-tasks-skill.prompt.md
---

# TSK-09: RESUMEN DE RELEASE

## Propósito

Reunir en un solo documento el estado de calidad de una versión: qué se probó y con qué resultado, qué defectos siguen abiertos y con qué severidad, qué riesgos se asumen y si se recomienda publicar. La salida está pensada para consumirse en una reunión de salida de versión, por eso prioriza el veredicto y sus justificación por encima del detalle. No sustituye a los artefactos de origen: los cita.

## Cuándo usarla (disparadores)

- Se cierra una iteración o un sprint.
- Hay una reunión de salida de versión (release meeting).
- Piden "el resumen de calidad de la versión" o "¿lanzamos sí o no?".
- Antes de una decisión de publicación en producción.
- Después de la última corrida de regresión, para cerrar el ciclo.

## Entradas (inputs)

| Entrada | Requerida | Notas |
| :--- | :--- | :--- |
| Reportes de ejecución de la versión | Sí | `./reports/junit/results.xml` y/o `./reports/html/index.html` |
| Estado de los defectos | Sí | `./docs/tasks/TSK-07-defectos/README.md` o el gestor de incidencias indicado |
| Riesgos conocidos | No | Entrada del usuario; sin ella, se declaran `[PENDIENTE DE VALIDAR]` |
| Análisis de fallos | No | `./docs/tasks/TSK-05-analisis-fallos.md` |
| Análisis de flakiness | No | `./docs/tasks/TSK-06-analisis-flaky.md` |
| Plan de regresión ejecutado | No | `./docs/tasks/TSK-08-seleccion-regresion.md` |

## Salidas (outputs)

| Artefacto | Contenido |
| :--- | :--- |
| `./docs/tasks/TSK-09-resumen-release.md` | Estado de calidad, cobertura, defectos por severidad, riesgos y recomendación go/no-go |

## Dependencias

- **TSK-05**, **TSK-06**, **TSK-07**, **TSK-08** — recomendado. Ninguna es dura: el resumen se puede emitir con lo que exista y declarando lo que falte.
- Es la última skill del pipeline `pre-release`.

## Proceso paso a paso

1. **Declarar el alcance de la versión.** Identifica la versión o el rango de commits cubierto y la fecha de corte. Si el usuario no lo especifica: `[PENDIENTE DE VALIDAR]` y pide confirmación antes de seguir.
2. **Recopilar los resultados de ejecución.** De los reportes extrae: total de tests, passed, failed, skipped, flaky (si el reporte distingue reintentos) y duración. Cada cifra con su `[FUENTE: ...]`.
3. **Calcular la tasa de aprobación** sobre el total de tests ejecutados, declarando la base. Distingue "tests que fallan por defecto de producto" de "tests que fallan por automatización o entorno": una suite en rojo por infraestructura no significa que el producto esté mal.
4. **Consolidar los defectos abiertos** por severidad y prioridad desde el índice de `TSK-07` o del gestor de incidencias. Lista los defectos `Bloqueante` y `Críticos` con su ID, título, severidad, prioridad y estado. Los cerrados en la versión van en su propia tabla.
5. **Evaluar la cobertura.** Usa el plan de regresión ejecutado de `TSK-08` para saber qué se probó, y contrasta con los huecos que esa skill reportó. La cobertura se expresa sobre el alcance de la versión, no sobre el total de la suite.
6. **Identificar la calidad de la señal.** Si `TSK-06` reporta tests con flakiness crítica, restáyalo de la confianza: un verde con 30% de instabilidad no es un verde. Decláralo en la sección de riesgos.
7. **Enumerar los riesgos** con la fuente de cada uno: defectos abiertos en funcionalidad crítica, cobertura insuficiente del cambio, entorno no estable, datos no representativos, análisis de flakiness ausente. Cada riesgo con probabilidad, impacto y mitigación.
8. **Emitir el veredicto go / no-go / go con condiciones** aplicando la tabla de decisión.
9. **Redactar las condiciones.** Si el veredicto es condicionado, cada condición debe tener un responsable y una fecha. Un "go con condiciones" sin responsables no es un veredicto.

### Tabla de decisión

| Veredicto | Condiciones |
| :--- | :--- |
| **Go** | Cero defectos `Bloqueante` y `Crítico` abiertos; cobertura del alcance suficiente; sin fallos por defecto de producto. |
| **Go con condiciones** | Hay defectos abiertos pero ninguno `Bloqueante`; la cobertura es suficiente y las condiciones tienen responsable y fecha. |
| **No-Go** | Cualquier defecto `Bloqueante` o `Crítico` abierto en la funcionalidad del release; o la cobertura del alcance es insuficiente; o la señal de la suite no es fiable. |

## Reglas específicas

1. **Todo número tiene fuente.** Cada cifra (totales, porcentajes, conteos de defectos) cita el artefacto del que sale. Sin fuente: `[PENDIENTE DE VALIDAR]`, nunca un estimado.
2. **El veredicto es un juicio, pero la justificación es verificable.** "No-go porque BUG-014 es Crítico/P0 y sigue abierto" es aceptable. "No-go porque no me gusta" no lo es.
3. **Distingue calidad de producto de calidad de señal.** Reporta por separado los fallos por defecto, por automatización, por datos y por entorno. Consolida en el veredicto solo los que afectan al producto, pero no ocultes los demás.
4. **Cobertura sobre el alcance.** El porcentaje de cobertura se calcula sobre el alcance de la versión, no sobre el total histórico de la suite. Declara el denominador.
5. **Riesgos con dueño.** Todo riesgo de nivel Alto o Crítico tiene responsable o queda `[PENDIENTE DE VALIDAR]`.
6. **Sin defectos P0 abiertos y veredicto "Go".** Es una contradicción: o el defecto se cierra o el veredicto baja.
7. **Un archivo por release.** Si se reejecuta la skill para la misma versión, actualiza el mismo archivo y conserva el historial en la sección de versions.
8. **Aislamiento.** Escribe únicamente en `docs/tasks/TSK-09-resumen-release.md`. No cierres ni modifiques defectos.
9. **Markdown puro.** Sin JSON ni XML.
10. **Idioma:** español, salvo rutas, identificadores y términos técnicos.

## Plantilla de salida en Markdown

```markdown
---
artifact: tsk-09-resumen-release
version: 0.1.0
generated_by: TSK-09
date: YYYY-MM-DD
sources: [reports/junit/results.xml, docs/tasks/TSK-07-defectos/README.md, docs/tasks/TSK-08-seleccion-regresion.md]
---

# TSK-09 — Resumen de release

## Identificación
| Dato | Valor | Fuente |
| :--- | :--- | :--- |
| Versión / rango | v1.4.0 (abc1234..def5678) | [FUENTE: git log] |
| Fecha de corte | YYYY-MM-DD | [FUENTE: solicitud del usuario] |
| Ambiente | staging | [FUENTE: playwright.config.ts:L6] |
| Ejecución de referencia | run YYYY-MM-DD HH:MM | [FUENTE: reports/junit/results.xml] |

## Veredicto

> ## GO / NO-GO / GO CON CONDICIONES
> **Justificación en una frase.**

| Criterio | Estado | Evidencia |
| :--- | :--- | :--- |
| Defectos Bloqueantes abiertos | 0 ✅ | [FUENTE: docs/tasks/TSK-07-defectos/README.md] |
| Defectos Críticos abiertos | 0 ✅ | [FUENTE: docs/tasks/TSK-07-defectos/README.md] |
| Cobertura del alcance | X% ⚠️ | [FUENTE: docs/tasks/TSK-08-seleccion-regresion.md] |
| Fallos por defecto de producto | 0 ✅ | [FUENTE: docs/tasks/TSK-05-analisis-fallos.md] |
| Señal fiable (flakiness) | No ⚠️ | [FUENTE: docs/tasks/TSK-06-analisis-flaky.md] |

## Resultados de ejecución
| Métrica | Valor | Fuente |
| :--- | :--- | :--- |
| Tests ejecutados | X | [FUENTE: reports/junit/results.xml] |
| Passed | X | [FUENTE: reports/junit/results.xml] |
| Failed | X | [FUENTE: reports/junit/results.xml] |
| Skipped | X | [FUENTE: reports/junit/results.xml] |
| Tasa de aprobación | X% (base: X) | (calculado) |
| Duración | … | [FUENTE: reports/junit/results.xml] |

## Cobertura
| Módulo / historia | Probado | No probado | Fuente |
| :--- | :--- | :--- | :--- |
| Carrito | … | … | [FUENTE: docs/tasks/TSK-08-seleccion-regresion.md] |

## Defectos abiertos
| Severidad | Prioridad | ID | Título | Módulo | Estado | Fuente |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Crítica | P0 | BUG-014 | [Carrito] Aplicar cupón no reduce el total | Carrito | NUEVO | [FUENTE: docs/tasks/TSK-07-defectos/BUG-014.md] |

### Resumen por severidad
| Severidad | Abiertos | Cerrados en la versión |
| :--- | :--- | :--- |
| Bloqueante | X | X |
| Crítica | X | X |
| Mayor | X | X |
| Menor | X | X |
| Trivial | X | X |

## Defectos cerrados en la versión
| ID | Título | Severidad | Fecha de cierre | Versión del fix | Fuente |
| :--- | :--- | :--- | :--- | :--- | :--- |

## Riesgos
| # | Riesgo | Probabilidad | Impacto | Nivel | Mitigación | Responsable | Fuente |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Suite con 33% de flakiness en login | Alta | Medio | Alto | Cuarentena + refactor del localizador | [PENDIENTE DE VALIDAR] | [FUENTE: docs/tasks/TSK-06-analisis-flaky.md] |

## Condiciones (si el veredicto es condicionado)
| # | Condición | Responsable | Fecha límite | Verificable por |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Cerrar BUG-021 o mover su funcionalidad fuera del release | [PENDIENTE DE VALIDAR] | [PENDIENTE DE VALIDAR] | [FUENTE: docs/tasks/TSK-07-defectos/BUG-021.md] |

## Qué no se pudo verificar
| Ítem | Motivo | Fuente |
| :--- | :--- | :--- |
| Cobertura de `api/PriceRuleService.php` | Sin test asociado | [FUENTE: docs/tasks/TSK-08-seleccion-regresion.md#huecos] |

## Bloqueos
- [BLOQUEADO: ...]
```

## Criterios de "listo" (definition of done)

- [ ] `./docs/tasks/TSK-09-resumen-release.md` existe con encabezado completo.
- [ ] La sección de identificación declara versión o rango de commits, fecha de corte y ejecución de referencia, con `[FUENTE: ...]` o `[PENDIENTE DE VALIDAR]`.
- [ ] Existe un veredicto único (Go / No-Go / Go con condiciones) con su justificación en una frase.
- [ ] La tabla de criterios del veredicto tiene estado y evidencia para cada criterio, sin celdas vacías.
- [ ] Todas las cifras de ejecución y defectos tienen `[FUENTE: ...]`.
- [ ] Los defectos abiertos están listados con ID, severidad, prioridad y estado, y el resumen por severidad cuadra con la lista.
- [ ] Existe la sección de riesgos con probabilidad, impacto, mitigación y responsable para los riesgos altos.
- [ ] Si el veredicto es condicionado, cada condición tiene responsable, fecha y criterio de verificación.
- [ ] Existe la sección "Qué no se pudo verificar" con el motivo y la fuente de cada hueco.
- [ ] Ningún defecto fue modificado o cerrado por esta skill.

## Ejemplos de invocación

| Objetivo | Invocación |
| :--- | :--- |
| Resumen de la versión actual | `Ejecuta TSK-09 para la versión v1.4.0 (abc1234..def5678) con el JUnit de ./reports/junit` |
| Con análisis previos | `Ejecuta TSK-09 usando TSK-05, TSK-06, TSK-07 y TSK-08 como entradas` |
| Antes de reunión de salida | `Ejecuta el pipeline "pre-release" (TSK-08 → TSK-09 → TSK-19)` |
| Con riesgos aportados por el usuario | `Ejecuta TSK-09 con los riesgos: [lista de riesgos del usuario]` |
