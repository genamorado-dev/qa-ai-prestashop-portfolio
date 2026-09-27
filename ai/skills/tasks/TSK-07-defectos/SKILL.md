---
name: TSK-07-defectos
description: Redacta fichas de defecto BUG-XXX (un archivo por defecto) a partir de logs, capturas, respuestas de API y pasos de reproducción, con título, severidad, prioridad, ambiente, precondiciones, pasos, resultado esperado frente al real, evidencia adjunta y fuente. Úsala cuando un fallo se ha clasificado como defecto de producto.
artifact: skill-tsk-07-defectos
version: 1.0.0
generated_by: TSK-00 (bootstrap-qa-task-skills)
date: 2026-09-27
sources:
  - ai/system-prompts/03-run-repetitive-tasks-skill.prompt.md
---

# TSK-07: REDACCIÓN DE DEFECTOS

## Propósito

Convertir un fallo clasificado como defecto de producto en una ficha de bug lista para enviar al equipo de desarrollo: reproducible por otra persona, con severidad justificada, evidencia adjunta y trazabilidad hasta la evidencia original. El foco es la reproducibilidad: si alguien que no conoce el análisis no puede repetir el fallo leyendo la ficha, la ficha está incompleta.

## Cuándo usarla (disparadores)

- `TSK-05` o `TSK-06` clasificaron un fallo como "defecto de producto".
- El equipo pide "redacta el bug" o "documenta este defecto".
- Un fallo se repite manualmente en el navegador y hay que reportarlo.
- Se necesita consolidar varios fallos intermitentes que apuntan al mismo defecto.

## Entradas (inputs)

| Entrada | Requerida | Notas |
| :--- | :--- | :--- |
| Logs de la ejecución | Sí | Parámetro `LOG_FILE`; se cita por línea |
| Capturas de pantalla | No | `./evidence/screenshots/`, `./evidence/tasks/TSK-05/` |
| Respuestas de API | No | Parámetro `API_EVIDENCE`; URL, método, status y cuerpo |
| Pasos de reproducción | No | Si vienen de `TSK-02`, se referencian como `TC-XXX` |
| `docs/tasks/TSK-05-analisis-fallos.md` | No | Aporta la clasificación y la causa raíz ya analizada |
| Historial de defectos | No | Evita duplicar bugs ya reportados y fija la numeración |

## Salidas (outputs)

| Artefacto | Contenido |
| :--- | :--- |
| `./docs/tasks/TSK-07-defectos/BUG-XXX.md` | **Un archivo por defecto** con la ficha completa |
| `./docs/tasks/TSK-07-defectos/README.md` | Índice de bugs con estado y severidad |
| `./evidence/tasks/TSK-07/BUG-XXX/` | Referencias a la evidencia adjunta (rutas, no copias) |

## Dependencias

- **TSK-05** — recomienda: clasifica el fallo y evita reportar automatización como defecto.
- Alimenta a: `TSK-08` (histórico de defectos para priorizar regresión), `TSK-09` (estado de defectos del release).

## Proceso paso a paso

1. **Verificar que el fallo es un defecto.** Antes de redactar, confirma que la clasificación de `TSK-05` es "defecto de producto". Si no existe análisis previo, valida que hay evidencia de un comportamiento incorrecto del producto y no de la infraestructura. Si no puedes confirmar, **no redactes**: reporta `[BLOQUEADO: el fallo no está clasificado como defecto de producto]`.
2. **Comprobar duplicados.** Revisa el índice `docs/tasks/TSK-07-defectos/README.md` y, si existe, el gestor de incidencias indicado por el usuario. Si el fallo ya está reportado, no crees un `BUG` nuevo: añade la evidencia nueva al bug existente y anótalo.
3. **Asignar el ID.** `BUG-XXX` correlativo de tres dígitos, continuando la numeración del índice. **Sin reutilizar números** de bugs cerrados.
4. **Redactar el título.** Máquina-legible y específico: `[Módulo] Acción que falla → resultado incorrecto`. Ejemplo: `[Carrito] Aplicar cupón de descuento no reduce el total`. Sin "error", "problema" ni "no funciona".
5. **Fijar severidad** según la tabla de severidades, con justificación explícita.
6. **Fijar prioridad** según impacto en negocio y en el release, con justificación. Severidad y prioridad son ejes distintos: un defecto de severidad alta puede ser de prioridad baja si afecta a un caso de uso marginal.
7. **Escribir la ficha** con la plantilla: resumen, ambiente, precondiciones, datos de prueba, pasos numerados, resultado esperado, resultado real, evidencia, causa raíz probable, historial y referencias.
8. **Enumerar la evidencia** con rutas relativas y, cuando aplique, la línea del log o el json-pointer de la respuesta.
9. **Actualizar el índice** `docs/tasks/TSK-07-defectos/README.md` con la fila del nuevo bug.
10. **Verificar reproducibilidad** releyendo la ficha: cada paso debe ser una acción ejecutable por alguien sin contexto previo.

### Tabla de severidades

| Severidad | Definición | Ejemplo |
| :--- | :--- | :--- |
| **Bloqueante** | Impide usar la funcionalidad; sin alternativa viable | El checkout no se puede completar |
| **Crítica** | Función clave con resultado incorrecto o pérdida/corrupción de datos | El total del carrito es incorrecto |
| **Mayor** | Función importante con impacto parcial o con rodeo disponible | El cupón no se aplica en un navegador concreto |
| **Menor** | Funcionalidad secundaria o impacto cosmético | Texto desalineado en el resumen |
| **Trivial** | Sin impacto funcional (typo, espaciado) | Etiqueta mal traducida |

### Escala de prioridad

| Prioridad | Criterio |
| :--- | :--- |
| **P0** | Se publica en el release en curso; sin rodeo. |
| **P1** | Se publica en el release en curso; con rodeo o alcance reducido. |
| **P2** | Puedeirse al siguiente release; se acepta el riesgo. |
| **P3** | Backlog. |

## Reglas específicas

1. **Un fallo, una ficha.** No agrupes fallos distintos en un mismo `BUG` salvo que compartan causa raíz **demostrada** con evidencia. Si la comparten, el título lo indica y los pasos cubren ambos.
2. **Sin suposiciones en los pasos.** Cada paso describe una acción, no un resultado intermedio inventado.
3. **Separar esperado y real.** Nunca mezcles ambos en un mismo párrafo. Usa las dos secciones de la plantilla.
4. **Evidencia obligatoria.** Una ficha sin al menos una referencia a log, captura, trace o respuesta de API queda `[BLOQUEADO: sin evidencia]`.
5. **Sin datos sensibles.** Enmascara contraseñas, tokens, correos personales y datos de pago en capturas y logs: `pass****`, `user***@example.com`. Nunca pegues una credencial real en la ficha.
6. **Reproducible en 3 pasos mínimo, idealmente ≤7.** Si necesitas más de 10 pasos, suspecta de un problema de entorno: `[PENDIENTE DE VALIDAR]`.
7. **Causa raíz es hipótesis.** Etiquétala como "causa raíz probable" y cita la evidencia que la sostiene. No afirmes la causa interna del producto sin fuente.
8. **Aislamiento.** Escribe únicamente en `docs/tasks/TSK-07-defectos/`. No modifies `docs/` ni los artefactos de otras `TSK-XX`.
9. **Numeración estable.** El ID depende del índice, no de la fecha. Reutilizar un ID cerrado está prohibido.
10. **Markdown puro.** Un archivo por bug, sin JSON ni XML.
11. **Idioma:** español, salvo rutas, identificadores y términos técnicos.

## Plantilla de salida en Markdown

```markdown
---
artifact: bug-XXX
version: 0.1.0
generated_by: TSK-07
date: YYYY-MM-DD
sources: [evidence/ci/playwright-run.log, evidence/screenshots/checkout-total.png, reports/junit/results.xml]
---

# BUG-014 — [Carrito] Aplicar cupón de descuento no reduce el total

| Campo | Valor |
| :--- | :--- |
| **ID** | BUG-014 |
| **Estado** | NUEVO |
| **Severidad** | Crítica |
| **Prioridad** | P0 |
| **Módulo** | Carrito |
| **Tipo** | Funcional |
| **Detectado por** | Automatización — `tests/e2e/checkout.spec.ts:44` |
| **Analizado por** | TSK-05 → TSK-07 |

## Resumen
[Dos o tres frases: qué falla, dónde y con qué impacto para el usuario. Sin jerga interna.]

## Ambiente
| Dato | Valor | Fuente |
| :--- | :--- | :--- |
| URL base | https://… | [FUENTE: playwright.config.ts:L8] |
| Navegador / versión | [PENDIENTE DE VALIDAR] | — |
| Versión de la aplicación | [PENDIENTE DE VALIDAR] | — |
| Fecha y hora de la ejecución | … | [FUENTE: reports/junit/results.xml] |

## Precondiciones
1. Existe un producto en stock.
2. El usuario ha añadido ese producto al carrito.
3. [etc.]

## Datos de prueba
| Dato | Valor |
| :--- | :--- |
| Producto | … |
| Cantidad | 2 |
| Cupón | … |

## Pasos de reproducción
1. [acción]
2. [acción]
3. [acción]

## Resultado esperado
[Qué debería ocurrir, con el valor concreto esperado.]

## Resultado real
[Qué ocurre, con el valor concreto observado.]

## Evidencia
| Tipo | Ruta | Referencia | Qué demuestra |
| :--- | :--- | :--- | :--- |
| Captura | `evidence/screenshots/checkout-total.png` | — | El total visible no incluye el descuento |
| Log | `evidence/ci/playwright-run.log` | L145 | Valor calculado en backend vs. valor mostrado |
| Response API | — | `GET /api/cart/total` | `total: 100.00`, `discount: 0` |
| Traza Playwright | `test-results/…/trace.zip` | — | Secuencia de acciones hasta el fallo |

## Causa raíz probable
[Hipótesis con la evidencia que la sostiene. `[PENDIENTE DE VALIDAR]` si no hay evidencia suficiente.]

## Trazabilidad
| Relación | Referencia |
| :--- | :--- |
| Test que lo detecta | `tests/e2e/checkout.spec.ts:44` |
| Caso de prueba relacionado | `TC-018` [FUENTE: docs/tasks/TSK-02-casos-de-prueba.md#TC-018] |
| Clasificación del fallo | [FUENTE: docs/tasks/TSK-05-analisis-fallos.md#fallo-3] |
| Historia afectada | `US-005` [FUENTE: docs/02-inventario-historias-usuario.md#US-005] |

## Historial
| Fecha | Acción | Autor | Nota |
| :--- | :--- | :--- | :--- |
| YYYY-MM-DD | Creado | TSK-07 | Detectado en la corrida … |
```

## Índice — `./docs/tasks/TSK-07-defectos/README.md`

```markdown
| ID | Título | Severidad | Prioridad | Estado | Módulo | Detectado por | Fecha |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| BUG-014 | [Carrito] Aplicar cupón no reduce el total | Crítica | P0 | NUEVO | Carrito | checkout.spec.ts:44 | 2026-09-27 |
```

## Criterios de "listo" (definition of done)

- [ ] Existe un archivo por defecto en `./docs/tasks/TSK-07-defectos/` con encabezado completo.
- [ ] El ID `BUG-XXX` es correlativo, no reutiliza números cerrados y aparece en el índice.
- [ ] El título sigue el patrón `[Módulo] Acción → resultado` sin palabras vagas.
- [ ] Severidad y prioridad están justificadas explícitamente en la ficha.
- [ ] Existen las secciones de ambiente, precondiciones, datos, pasos, resultado esperado y resultado real, y son distintas entre sí.
- [ ] La sección de evidencia tiene al menos una entrada con ruta y referencia verificable.
- [ ] La causa raíz está etiquetada como probable y cite la evidencia que la sostiene.
- [ ] Los datos sensibles aparecen enmascarados.
- [ ] La ficha es reproducible sin conocimiento previo del análisis.
- [ ] El índice `docs/tasks/TSK-07-defectos/README.md` incluye la fila del nuevo bug.

## Ejemplos de invocación

| Objetivo | Invocación |
| :--- | :--- |
| Redactar un bug desde el análisis | `Ejecuta TSK-07 sobre docs/tasks/TSK-05-analisis-fallos.md, sección "Candidatos a BUG"` |
| Redactar con evidencia concreta | `Ejecuta TSK-07 con LOG_FILE=./evidence/ci/playwright-run.log y capturas de ./evidence/screenshots` |
| Bug desde un caso de prueba | `Ejecuta TSK-07 para el fallo del caso TC-018 de docs/tasks/TSK-02-casos-de-prueba.md` |
| En pipeline | `Ejecuta el pipeline "post-ejecución" (TSK-05 → TSK-06 → TSK-07)` |
