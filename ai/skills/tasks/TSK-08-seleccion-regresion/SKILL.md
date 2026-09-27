---
name: TSK-08-seleccion-regresion
description: A partir de un diff de código, los servicios afectados y el histórico de defectos, recomienda el conjunto mínimo de tests a ejecutar en regresión, con justificación por cambio, criticidad y cobertura del cambio. Úsala antes de un despliegue, tras un merge o cuando la suite completa no cabe en el tiempo disponible.
artifact: skill-tsk-08-seleccion-regresion
version: 1.0.0
generated_by: TSK-00 (bootstrap-qa-task-skills)
date: 2026-09-27
sources:
  - ai/system-prompts/03-run-repetitive-tasks-skill.prompt.md
---

# TSK-08: SELECCIÓN DE TESTS PARA REGRESIÓN

## Propósito

Dado un cambio de código, determinar el conjunto mínimo de tests que hay que ejecutar para tener confianza en que el cambio no rompió nada relevante, priorizando por criticidad y trazabilidad entre el diff y la suite. La salida es un plan de regresión ejecutable, con un nivel básico obligatorio y un nivel completo opcional, cada test justificado por el cambio que cubre.

## Cuándo usarla (disparadores)

- Hay un merge o un commit a validar.
- La suite completa no cabe en el tiempo de la ventana de regresión.
- Piden "qué tests corro para este cambio" o "armame el plan de regresión".
- Un despliegue está planificado y hay que definir la validación previa.
- Un defecto crítico se corrigió y hay que decidir la alcance de la verificación.

## Entradas (inputs)

| Entrada | Requerida | Notas |
| :--- | :--- | :--- |
| Diff de código (`git diff`) | Sí | Parámetro `BASE_REF` (por defecto `main`) |
| Tests existentes | Sí | `./tests/**/*.spec.ts` y su mapa con el código que ejercitan |
| Servicios o módulos afectados | No | Parámetro `SERVICES`; si se omite, se derivan de las rutas del diff |
| Histórico de defectos | No | `./docs/tasks/TSK-07-defectos/README.md`; prioriza tests ya relacionados con bugs |
| Análisis de flakiness | No | `./docs/tasks/TSK-06-analisis-flaky.md`; evita depender de tests inestables |

## Salidas (outputs)

| Artefacto | Contenido |
| :--- | :--- |
| `./docs/tasks/TSK-08-seleccion-regresion.md` | Plan de regresión: nivel básico / completo, tabla de tests con motivo, criticidad y cobertura del cambio |

## Dependencias

- **TSK-06** — recomendada: para saber qué tests no son fiables como criterio de decisión.
- **TSK-07** — aporta el histórico de defectos.
- Alimenta a: `TSK-09` (resumen de release).

## Proceso paso a paso

1. **Obtener el diff.** Ejecuta `git diff <BASE_REF>...HEAD` (o el rango que indique el usuario) y registra el rango exacto y la fecha del commit base. Si el repositorio no está disponible, detén y reporta `[BLOQUEADO: no se puede obtener el diff]`.
2. **Clasificar los archivos cambiados** en categorías con impacto QA:
   - `pages/`, `utils/`, `fixtures/`, `config` → **Infraestructura de prueba**: afecta a todos los tests. Selección mínima = smoke.
   - `tests/e2e/**` → **Suite**: el propio test cambiado, más los que comparten fixture o helper.
   - Código de producto (cualquier otra ruta) → **Aplicación**: requiere mapear a los tests que la ejercitan.
3. **Mapear cambio → tests.** Para cada archivo de producto cambiado, identificar los tests que lo ejercitan. Solo es válido si hay evidencia: correspondencia explícita de la prueba, Page Object que lo usa, o ruta compartida en la prueba. Si no puedes mapear un cambio a ningún test, eso es un **hueco de cobertura** y se reporta como tal, no se ignora.
4. **Asignar criticidad** a cada test seleccionado:

   | Criticidad | Criterio |
   | :--- | :--- |
   | **C1 — Crítico** | Cubre un camino de negocio con defecto abierto P0/P1, o una historia marcada crítica en el inventario. |
   | **C2 — Alto** | Cubre el módulo cambiado directamente y su camino principal. |
   | **C3 — Medio** | Cubre un caso límite o una rama secundaria del módulo cambiado. |
   | **C4 — Bajo** | Solo se incluye para confirmar ausencia de regresión colateral. |

5. **Construir el plan en dos niveles:**
   - **Nivel básico (obligatorio):** smoke + todos los tests `C1` del diff + los tests de los módulos afectados directamente. Objetivo: terminar en el menor tiempo posible con la mayor señal.
   - **Nivel completo (opcional):** añade `C2` y `C3`, más los tests marcados por historial de defectos.
6. **Aplicar el filtro de fiabilidad.** Si un test seleccionado aparece en `TSK-06` con nivel Crítica de flakiness, **no lo incluyas en el nivel básico**: inclúyelo en el completo y anota que su resultado no es concluyente. Better fail signal than a green that means nothing.
7. **Documentar los huecos.** Lista los cambios sin test asociado y recomienda qué medir (test manual, logging, verificación visual) para cubrirlo en esta iteración.
8. **Calcular el coste.** Para cada nivel, suma la duración media observada en las corridas previas (de `TSK-06` o del JUnit) y cita la fuente. Si no hay dato, `[PENDIENTE DE VALIDAR]`.
9. **Emitir el informe** con la plantilla de salida.

## Reglas específicas

1. **Cero invención de dependencias.** Un test solo se incluye si puedes citar el archivo y la línea que lo vinculan al cambio. La correlación "este test parece relacionado" no es evidencia.
2. **Huecos visibles.** Todo archivo de producto modificado sin test asociado aparece en la sección de huecos, aunque el plan sea verde por diseño.
3. **No amplíes por intuición.** Si un módulo no aparece en el diff, sus tests no entran salvo que el cambio sea de infraestructura de prueba.
4. **Prioridad del historial.** Un test que ya detectó un defecto abierto tiene prioridad sobre un test equivalente sin historial, y la razón se cita.
5. **Severidad del plan:**

   | Nivel del plan | Condición |
   | :--- | :--- |
   | **Adecuado** | Cubre todos los cambios del diff, incluye todos los C1 y no depende de tests inestables en el nivel básico. |
   | **Parcial** | Cubre los cambios pero omite algún C1 o incluye un test inestable. |
   | **Insuficiente** | Hay cambios del diff sin cobertura, o el nivel básico depende de tests no concluyentes. |

6. **Coste con fuente.** Toda duración citada viene de un reporte de ejecución. Sin dato: `[PENDIENTE DE VALIDAR]`, nunca un número estimado.
7. **Reversibilidad.** Un plan de regresión debe caber en la ventana de tiempo dada. Si no cabe, reduce el nivel completo y **declara** lo que queda fuera; nunca presentes un plan inviable como suficiente.
8. **Aislamiento.** Escribe únicamente en `docs/tasks/TSK-08-seleccion-regresion.md`. No modifiques los tests ni el diff.
9. **Idempotencia.** El plan depende del commit base y del diff de entrada, no de la fecha de ejecución.
10. **Markdown puro.** Todo lo tabular en tablas Markdown.
11. **Idioma:** español, salvo rutas, identificadores y términos técnicos.

## Plantilla de salida en Markdown

```markdown
---
artifact: tsk-08-seleccion-regresion
version: 0.1.0
generated_by: TSK-08
date: YYYY-MM-DD
sources: [git diff main...HEAD, tests/e2e/checkout.spec.ts, pages/CartPage.ts, docs/tasks/TSK-07-defectos/README.md]
---

# TSK-08 — Selección de tests para regresión

## Alcance del cambio
| Dato | Valor | Fuente |
| :--- | :--- | :--- |
| Rango del diff | `main...HEAD` | [FUENTE: git diff main...HEAD] |
| Commit base | abc1234 (2026-09-26) | [FUENTE: git log] |
| Archivos de producto modificados | X | [FUENTE: git diff --stat] |
| Archivos de infraestructura de prueba | Y | [FUENTE: git diff --stat] |
| Servicios afectados | … | [PENDIENTE DE VALIDAR] |

## Archivos modificados y su impacto
| Archivo | Tipo | Impacto QA | Tests asociados | Fuente |
| :--- | :--- | :--- | :--- | :--- |
| pages/CartPage.ts | Infraestructura de prueba | Afecta a todos los tests que usan el carrito | login.spec.ts, checkout.spec.ts | [FUENTE: git diff --stat] |

## Plan de regresión

### Nivel básico (obligatorio) — duración estimada: X
| # | Test | Motivo | Criticidad | Cubre el cambio | Flakiness | Fuente del vínculo |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | checkout.spec.ts › total del carrito | El diff modifica el cálculo del total | C1 | `pages/CartPage.ts:L45` | Estable | [FUENTE: tests/e2e/checkout.spec.ts:L44] |

### Nivel completo (opcional) — duración estimada: X
| # | Test | Motivo | Criticidad | Cubre el cambio | Flakiness | Fuente del vínculo |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |

## Tests excluidos
| Test | Motivo de exclusión | Dónde se ejecuta en su lugar | Fuente |
| :--- | :--- | :--- | :--- |
| inventory.visual.spec.ts | Flakiness crítica detectada | Nivel completo | [FUENTE: docs/tasks/TSK-06-analisis-flaky.md#ranking] |

## Huecos de cobertura
| Cambio | Test ausente | Riesgo | Mitigación propuesta | Marca |
| :--- | :--- | :--- | :--- | :--- |
| `api/PriceRuleService.php` | Ningún test lo ejercita | Regresión en descuentos no detectada | Verificación manual en staging antes del deploy | [PENDIENTE DE VALIDAR] |

## Veredicto del plan
- **Nivel del plan:** Adecuado / Parcial / Insuficiente
- **Justificación:** [texto breve con fuentes]
- **Qué queda fuera y por qué:** [lista]
```

## Criterios de "listo" (definition of done)

- [ ] `./docs/tasks/TSK-08-seleccion-regresion.md` existe con encabezado completo.
- [ ] El alcance declara el rango del diff, el commit base y el número de archivos modificados con `[FUENTE: ...]`.
- [ ] Cada archivo de producto modificado aparece con su impacto y los tests asociados, o con la marca de hueco.
- [ ] El plan tiene nivel básico y nivel completo, y el básico incluye todos los tests `C1`.
- [ ] Cada test seleccionado tiene motivo, criticidad, el cambio que cubre con ruta y línea, y la fuente del vínculo.
- [ ] Los tests excluidos están justificados con su motivo y dónde se ejecutan.
- [ ] Las duraciones del plan tienen `[FUENTE: ...]` o están marcadas `[PENDIENTE DE VALIDAR]`.
- [ ] Existe un veredicto de plan (Adecuado / Parcial / Insuficiente) con justificación.
- [ ] Ningún test se incluye en el nivel básico si tiene flakiness crítica registrada.

## Ejemplos de invocación

| Objetivo | Invocación |
| :--- | :--- |
| Plan contra main | `Ejecuta TSK-08 con BASE_REF=main sobre el diff actual` |
| Tras corregir un bug crítico | `Ejecuta TSK-08 con BASE_REF=<commit del bug> para verificar la corrección de BUG-014` |
| Con servicios declarados | `Ejecuta TSK-08 con SERVICES=[carrito,checkout]` |
| En pipeline | `Ejecuta el pipeline "pre-release" (TSK-08 → TSK-09)` |
