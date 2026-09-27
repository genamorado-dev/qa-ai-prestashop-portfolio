---
name: TSK-02-casos-de-prueba
description: Genera casos de prueba ejecutables TC-XXX (positivos, negativos, de límite y de integración) a partir de las historias de usuario y las reglas de negocio, con precondiciones, datos, pasos y resultado esperado por paso, y criterio de aceptación cubierto. Úsala cuando los requisitos ya están validados.
artifact: skill-tsk-02-casos-de-prueba
version: 1.0.0
generated_by: TSK-00 (bootstrap-qa-task-skills)
date: 2026-09-27
sources:
  - ai/system-prompts/03-run-repetitive-tasks-skill.prompt.md
---

# TSK-02: GENERACIÓN DE CASOS DE PRUEBA

## Propósito

Convertir historias de usuario y reglas de negocio ya revisadas en casos de prueba concretos y ejecutables, cubriendo el camino positivo, los caminos de error, los valores límite y las interacciones entre functionalities. Cada caso declara a qué criterio de aceptación cuelga, qué datos necesita y qué resultado observable se espera en cada paso, de modo que pueda ejecutarse manualmente o automatizarse sin reinterpretación.

## Cuándo usarla (disparadores)

- `TSK-01` terminó sin hallazgos de severidad Bloqueante.
- Se necesita un conjunto de casos para una historia antes de codificar la automatización.
- Un requisito cambió y hay que regenerar los casos de esa historia.
- Se pide "dame los casos de prueba del módulo X".
- Antes de estimar esfuerzo de automatización, para conocer el volumen real de casos.

## Entradas (inputs)

| Entrada | Requerida | Notas |
| :--- | :--- | :--- |
| `./docs/02-inventario-historias-usuario.md` | Sí | Historias `US-XXX` y criterios `CA-XXX` |
| `./docs/04-reglas-de-negocio.md` | Sí | Reglas `RN-XXX` que condicionan los datos válidos |
| `./docs/tasks/TSK-01-revision-requisitos.md` | No | Si existen hallazgos Bloqueantes de una historia, esa historia queda fuera |
| `./docs/03-escenarios-y-casos.md` | No | Evitar duplicar escenarios ya definidos por SKILL 03 |

## Salidas (outputs)

| Artefacto | Contenido |
| :--- | :--- |
| `./docs/tasks/TSK-02-casos-de-prueba.md` | Escenarios `TS-XXX` + casos `TC-XXX` por historia + cobertura y bloqueos |

## Dependencias

- **SKILL 02** y **SKILL 04** — dependencias duras.
- **TSK-01** — dependencia blanda pero recomendada: condiciona qué historias son generables.
- Alimenta a: `TSK-04`, `TSK-08`, `TSK-14`.

## Proceso paso a paso

1. **Verificar entradas.** Comprueba la existencia de `docs/02-inventario-historias-usuario.md` y `docs/04-reglas-de-negocio.md`. Si falta alguna: detén y reporta el bloqueo.
2. **Cruzar hallazgos de `TSK-01`.** Si existe `docs/tasks/TSK-01-revision-requisitos.md`, extrae las historias con hallazgo Bloqueante y **no generes casos** para ellas: inclúyelas en la sección "Historias excluidas" con el `HALL-XXX` que lo impide.
3. **Derivar los valores límite desde las fuentes.** Recorre las `RN-XXX` y las restricciones escritas en las historias (obligatoriedad, longitudes, rangos, formatos, enums) y construye la tabla de límites **solo con valores respaldados**: `[FUENTE: docs/04-reglas-de-negocio.md#RN-007]`. Los límites que no puedas respaldar van a la sección "Límites sin fuente" y **no generan casos**.
4. **Definir el árbol de escenarios por historia**, en este orden:
   1. **Positivos:** un escenario por criterio `CA-XXX`.
   2. **Negativos:** un escenario por rama de error definida (validación rechazada, permiso denegado, recurso inexistente) **con respaldo en regla o criterio**.
   3. **Límite:** un escenario por cada partición de equivalencia y por cada valor límite derivado en el paso 3.
   4. **Integración:** un escenario cuando dos o más historias interaccionan con evidencia en el inventario o en las reglas.
5. **Convertir cada escenario en casos `TC-XXX`.** Un escenario produce **al menos un caso**; produce varios solo si cambian datos o particiones, nunca solo la redacción.
6. **Escribir cada caso** con la plantilla: precondiciones, datos de prueba, pasos numerados con resultado esperado por paso, resultado final esperado, criterio cubierto, tipo y fuente.
7. **Numerar de forma estable:** `TS-XXX` y `TC-XXX` se asignan en orden de historia y, dentro de la historia, siguiendo el orden del paso 4 (positivos → negativos → límite → integración). Sin huecos, sin reasignar números por fecha.
8. **Emitir el informe** con la cobertura por historia y la lista de límites sin fuente excluidos del conteo.

## Reglas específicas

1. **Cero invención de restricciones.** Un valor límite sin fuente en el inventario, en las reglas de negocio o en el código no se convierte en caso ejecutable. Va a "Límites sin fuente" marcado `[SIN FUENTE]`.
2. **Justificación de no aplicabilidad.** Si una historia no admite caso negativo o de límite, debe existir una línea explícita con el motivo y su fuente. La ausencia silenciosa es un fallo de la skill.
3. **Un caso, un criterio.** Cada `TC-XXX` declara un único criterio cubierto como principal. Si cubre varios, elige el principal y lista los secundarios en una columna aparte.
4. **Resultados observables.** "Funciona correctamente" no es un resultado esperado. El resultado esperado debe poder comprobarse con una aserción, una consulta o una captura.
5. **Pasos atómicos.** Un paso = una acción + un resultado esperado. Si un paso contiene un "y", divídelo.
6. **Datos explícitos.** El caso nombra los valores concretos a usar. Si el dato depende de una regla, cita la `RN-XXX`; si es arbitrario pero razonable, márcalo `[PENDIENTE DE VALIDAR]`.
7. **Sin duplicados.** Si `docs/03-escenarios-y-casos.md` ya cubre un escenario, no lo repitas: referencia `TS-XXX` de ese artefacto y añade solo los que falten.
8. **Aislamiento.** Escribe únicamente en `docs/tasks/TSK-02-casos-de-prueba.md`. No modifiques inventarios ni otras salidas.
9. **Idempotencia.** La numeración depende solo del orden de las historias en el inventario, no del reloj.
10. **Markdown puro.** Todo lo tabular en tablas Markdown.
11. **Idioma:** español, salvo rutas, identificadores y términos técnicos.

## Plantilla de salida en Markdown

```markdown
---
artifact: tsk-02-casos-de-prueba
version: 0.1.0
generated_by: TSK-02
date: YYYY-MM-DD
sources: [docs/02-inventario-historias-usuario.md, docs/04-reglas-de-negocio.md]
---

# TSK-02 — Casos de prueba

## Resumen de cobertura por historia
| Historia | Positivos | Negativos | Límite | Integración | Justificación si no aplica | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |

## Límites derivados de las fuentes
| Límite | Valor | Partición | Historia | Fuente |
| :--- | :--- | :--- | :--- | :--- |
| Longitud mínima del código postal | 5 | Equivalencia válida | US-005 | [FUENTE: docs/04-reglas-de-negocio.md#RN-007] |

## Límites sin fuente (excluidos del conteo)
| Límite propuesto | Motivo | Marca |
| :--- | :--- | :--- |
| Máximo de 50 líneas por carrito | No aparece en ninguna entrada | [SIN FUENTE] |

---

## US-005 — [Título de la historia]
- **Fuente:** [FUENTE: docs/02-inventario-historias-usuario.md#US-005]
- **Criterios cubiertos:** CA-004, CA-005

### TS-003 — [Título del escenario] (US-005)
- **Tipo:** Positivo
- **Precondiciones:** [...]
- **Resultado esperado global:** [...]
- **Fuente:** [FUENTE: ...]

#### TC-004 — [Título del caso] (TS-003)
- **Datos de prueba:** código postal `"28001"`, ...
- **Precondiciones:** [...]
- **Pasos:**
  1. [acción] → Resultado esperado: [...]
  2. [acción] → Resultado esperado: [...]
- **Resultado final esperado:** [...]
- **Criterio cubierto (principal):** CA-004
- **Criterios secundarios:** —
- **Tipo:** Positivo
- **Fuente:** [FUENTE: ...]

## Historias excluidas
| Historia | Motivo | Hallazgo que lo impide |
| :--- | :--- | :--- |
| US-012 | Criterio de aceptación bloqueante | [FUENTE: docs/tasks/TSK-01-revision-requisitos.md#HALL-001] |

## Bloqueos
- [BLOQUEADO: ...]
```

## Criterios de "listo" (definition of done)

- [ ] `./docs/tasks/TSK-02-casos-de-prueba.md` existe con encabezado completo.
- [ ] El resumen de cobertura incluye todas las historias procesables con el recuento de positivos, negativos, límite e integración.
- [ ] Cada historia procesable tiene ≥1 caso positivo y ≥1 caso negativo, o justificación con fuente.
- [ ] Cada historia con campo acotado tiene ≥1 caso de límite **con fuente**, o justificación.
- [ ] Cada `TC-XXX` tiene precondiciones, datos, pasos con resultado esperado por paso, resultado final, criterio cubierto, tipo y `[FUENTE: ...]`.
- [ ] Todos los límites de la tabla "Límites derivados de las fuentes" tienen `[FUENTE: ...]`.
- [ ] Los límites sin fuente están en su propia sección y excluidos del conteo de cobertura.
- [ ] Las historias con hallazgo Bloqueante de `TSK-01` aparecen en "Historias excluidas" y no tienen casos generados.
- [ ] Ninguna otra salida fue modificada.

## Ejemplos de invocación

| Objetivo | Invocación |
| :--- | :--- |
| Generar todos los casos | `Ejecuta TSK-02 sobre docs/02-inventario-historias-usuario.md y docs/04-reglas-de-negocio.md` |
| Solo una historia | `Ejecuta TSK-02 limitado a US-005 y escribe el resultado en docs/tasks/TSK-02-casos-de-prueba.md` |
| Tras revisión de requisitos | `Ejecuta el pipeline "nueva-historia" (TSK-01 → TSK-02 → TSK-14)` |
| Respetando exclusiones | `Ejecuta TSK-02 y excluye las historias con hallazgo bloqueante del informe TSK-01` |
