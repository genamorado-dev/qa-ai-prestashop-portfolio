---
name: TSK-05-analisis-fallos
description: Analiza los resultados de una ejecución de Playwright (reporte HTML, logs, stack traces, capturas) y clasifica cada fallo como defecto de producto, problema de automatización, problema de datos o fallo de ambiente, con evidencia, causa probable y acción recomendada. Úsala justo después de una corrida fallida para decidir qué hacer con cada test.
artifact: skill-tsk-05-analisis-fallos
version: 1.0.0
generated_by: TSK-00 (bootstrap-qa-task-skills)
date: 2026-09-27
sources:
  - ai/system-prompts/03-run-repetitive-tasks-skill.prompt.md
---

# TSK-05: ANÁLISIS DE FALLOS DE EJECUCIÓN

## Propósito

Convertir un reporte de ejecución fallida en un triage accionable. Cada test que falló se clasifica en una de cuatro categorías —defecto de producto, problema de automatización, problema de datos o fallo de ambiente— con la evidencia que sustenta la clasificación, la causa raíz probable y la acción a ejecutar. El objetivo es que nadie tenga que interpretar manualmente un stack trace para saber si hay que abrir un BUG, arreglar el test o mirar la infraestructura.

## Cuándo usarla (disparadores)

- Una ejecución de la suite terminó con tests en rojo.
- El pipeline de CI falló y hay que decidir si es código, infra o test.
- El reporte HTML de Playwright está disponible y hay que extraer los fallos.
- Piden "analiza los fallos de la última corrida".
- Antes de reportar defectos a desarrollo, para no abrir tickets falsos.

## Entradas (inputs)

| Entrada | Requerida | Notas |
| :--- | :--- | :--- |
| Reporte HTML de Playwright | Sí o alternativa | `./reports/html/index.html` o su directorio |
| Resultado JUnit (`.xml`) | No | `./reports/junit/results.xml`; aporta caso y mensaje por test |
| Log de ejecución | No | Parámetro `LOG_FILE`; se cita por línea |
| Capturas y vídeos | No | `./evidence/screenshots/`, `./evidence/videos/` |
| Código de los tests fallidos | No | Para distinguir defecto de producto de problema de automatización |

## Salidas (outputs)

| Artefacto | Contenido |
| :--- | :--- |
| `./docs/tasks/TSK-05-analisis-fallos.md` | Tabla de fallos clasificados + sección de candidatos a BUG + resumen de la corrida |
| `./evidence/tasks/TSK-05/` | Referencias a las evidencias usadas (rutas, no copias) |

## Dependencias

- **TSK-03** (opcional): el contrato API permite contrastar un fallo de request/response con lo declarado.
- Alimenta a: `TSK-07` (redacción de defectos), `TSK-06` (detección de flakiness), `TSK-09` (resumen de release).

## Proceso paso a paso

1. **Verificar entradas.** Identifica la fuente de verdad de los resultados. Si existen JUnit y HTML, prioriza JUnit para el listado de casos y HTML para los trazos y adjuntos. Declara la decisión con fuente.
2. **Extraer la lista de fallos.** Por cada test fallido recopila: identificador completo del test, archivo, línea, duración, estado (`failed`, `timedOut`, `skipped`, `interrupted`), mensaje de error y stack trace resumido. Cita cada dato: `[FUENTE: reports/junit/results.xml]` o `[FUENTE: reports/html/index.html]`.
3. **Recopilar evidencia asociada:** nombre de la captura, del vídeo y del trace, con su ruta. No copies las imágenes al informe; las referencias.
4. **Clasificar cada fallo** aplicando, en este orden, la tabla de clasificación. La primera regla que aplique decide; no acumules categorías.
5. **Formular la causa raíz probable** como una frase verificable, no como una sospecha vaga. "El localizador apunta a un elemento que ya no existe porque el botón cambió a `data-test`" es verificable; "algochanged en la app" no lo es.
6. **Derivar la acción recomendada** según la categoría:
   - Defecto de producto → candidato a `TSK-07` (redactar BUG).
   - Problema de automatización → candidato a `TSK-04` (revisión de código).
   - Problema de datos → `TSK-11` (datos de prueba) y reintento.
   - Fallo de ambiente → `TSK-10` (healthcheck) y reintento.
7. **Marcar los casos dudosos.** Si la evidencia no permite decidir entre dos categorías, usa `[PENDIENTE DE VALIDAR]` en la categoría y explica qué evidencia adicional haría falta. **No fuerces la clasificación.**
8. **Emitir el informe** con la plantilla de salida y un resumen de la corrida (totales, tasa de fallo, distribución por categoría).

### Tabla de clasificación

| Categoría | Señales en la evidencia | Causa raíz típica | Acción |
| :--- | :--- | :--- | :--- |
| **Defecto de producto** | El aserto falla contra un valor concreto y observable; la captura muestra un estado incorrecto; el response cumple el contrato pero el valor es erróneo | Lógica de negocio incorrecta, cálculo, validación, regresión | Redactar BUG con `TSK-07` |
| **Problema de automatización** | `strict mode violation`, `element is not visible`, `timeout` esperando algo que sí existe, aserción sobre un elemento duplicado, race entre pasos | Localizador inestable, espera bloqueante, test dependiente del orden | Revisar con `TSK-04`, corregir y reintentar |
| **Problema de datos** | El fallo depende de un dato concreto (cantidad inexistente, email duplicado, cupón agotado, stock insuficiente) | Datos compartidos entre corridas, no idempotentes | Regenerar datos con `TSK-11`, reintentar |
| **Fallo de ambiente** | Conexión rechazada, DNS, 502/503, servicio caído, timeout de arranque, falta de credenciales, versión de navegador ausente | Infraestructura, servicio externo, configuración de runner | Verificar con `TSK-10`, escalar a quien tenga el entorno |

## Reglas específicas

1. **Cero invención.** Solo clasificas lo que la evidencia muestra. Si no hay evidencia suficiente, `[PENDIENTE DE VALIDAR]`.
2. **Una categoría por fallo.** El orden de la tabla es jerárquico: si un fallo tiene señales de defecto de producto y de automatización, se clasifica por lo que la evidencia **demuestra primero**, y la señal secundaria se anota en una columna de notas.
3. **Evidencia obligatoria.** Ningún fallo sin al menos una referencia a log, línea de stack, captura o trace.
4. **No re-ejecutes para adivinar.** Esta skill es documental. Reintentos y re-ejecuciones son un paso posterior explícito del usuario.
5. **Severidad de triage:**

   | Severidad | Criterio |
   | :--- | :--- |
   | **P0** | Fallo de ambiente que impide toda la suite: no hay señal de calidad de producto. |
   | **P1** | Defecto de producto confirmado en funcionalidad crítica, con evidencia sólida. |
   | **P2** | Defecto de producto en funcionalidad secundaria, o bloquea la regresión de un camino importante. |
   | **P3** | Problema de automatización, de datos o de entorno acotado a un test. |

6. **Cifras verificables.** Porcentajes y recuentos se calculan sobre el total de tests de la corrida, declarado en la sección de resumen con su fuente.
7. **Aislamiento.** Escribe únicamente en `docs/tasks/TSK-05-analisis-fallos.md` y las referencias en `evidence/tasks/TSK-05/`.
8. **Idempotencia.** El orden de la tabla de fallos sigue el orden de aparición en el archivo de resultados.
9. **Markdown puro.** Sin JSON ni XML generado como salida; los datos se **cilan** en tablas.
10. **Idioma:** español, salvo rutas, identificadores y términos técnicos.

## Plantilla de salida en Markdown

```markdown
---
artifact: tsk-05-analisis-fallos
version: 0.1.0
generated_by: TSK-05
date: YYYY-MM-DD
sources: [reports/junit/results.xml, reports/html/index.html, evidence/screenshots/checkout.png]
---

# TSK-05 — Análisis de fallos de ejecución

## Resumen de la corrida
| Métrica | Valor | Fuente |
| :--- | :--- | :--- |
| Tests totales | X | [FUENTE: reports/junit/results.xml] |
| Passed / Failed / Skipped | X / Y / Z | [FUENTE: reports/junit/results.xml] |
| Tasa de fallo | Y% | (calculado sobre X) |
| Duración total | ... | [FUENTE: reports/junit/results.xml] |

## Distribución por categoría
| Categoría | Tests | % del total |
| :--- | :--- | :--- |
| Defecto de producto | X | ... |
| Problema de automatización | X | ... |
| Problema de datos | X | ... |
| Fallo de ambiente | X | ... |
| [PENDIENTE DE VALIDAR] | X | ... |

## Fallos clasificados
| # | Test | Archivo:Línea | Estado | Error (resumido) | Categoría | Prioridad | Evidencia | Causa raíz probable | Acción recomendada | Fuente |
|---| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | login.spec.ts:12 › autenticación correcta | tests/e2e/login.spec.ts:L12 | timedOut | `locator.click: Timeout 30000ms exceeded` | Problema de automatización | P3 | `evidence/screenshots/login-timeout.png` | El localizador del botón no coincide tras la traducción del rótulo | Corregir localizador a `getByRole('button', { name: /iniciar sesión/i })` y reintentar | [FUENTE: reports/junit/results.xml] |

## Candidatos a BUG (para TSK-07)
| Test | Severidad propuesta | Evidencia clave | Título sugerido |
| :--- | :--- | :--- | :--- |
| checkout.spec.ts:44 | P1 | `evidence/screenshots/checkout-total.png` | El total del carrito no descuenta el cupón aplicado |

## Fallos con clasificación pendiente
| # | Test | Por qué no se puede decidir | Evidencia adicional necesaria | Marca |
|---| :--- | :--- | :--- | :--- |
| 3 | ... | Solo hay timeout, sin captura adjunta | Re-ejecución con `trace: on` | [PENDIENTE DE VALIDAR] |

## Bloqueos
- [BLOQUEADO: ...]
```

## Criterios de "listo" (definition of done)

- [ ] `./docs/tasks/TSK-05-analisis-fallos.md` existe con encabezado completo.
- [ ] El resumen de la corrida declara el total de tests con `[FUENTE: ...]` y los porcentajes se calculan sobre ese total.
- [ ] Todos los tests con estado fallido de la corrida aparecen en la tabla de fallos clasificados, ninguno omitido.
- [ ] Cada fallo tiene categoría única, prioridad, evidencia, causa raíz probable, acción recomendada y `[FUENTE: ...]`.
- [ ] Existe la tabla de distribución por categoría y sus porcentajes suman el total de fallos o están justificados.
- [ ] Los candidatos a BUG están listados para alimentar `TSK-07`, con la evidencia clave identificada.
- [ ] Los fallos sin evidencia suficiente están en la sección de clasificación pendiente, no fuerzan categoría.
- [ ] No se ejecutó ninguna prueba ni se modificó ningún reporte de origen.

## Ejemplos de invocación

| Objetivo | Invocación |
| :--- | :--- |
| Analizar la última corrida | `Ejecuta TSK-05 sobre ./reports/junit/results.xml y ./reports/html/index.html` |
| Solo los fallos de un archivo | `Ejecuta TSK-05 limitado a los tests de tests/e2e/checkout.spec.ts` |
| Con log de CI | `Ejecuta TSK-05 con LOG_FILE=./evidence/ci/playwright-run.log` |
| En pipeline | `Ejecuta el pipeline "post-ejecución" (TSK-05 → TSK-06 → TSK-07)` |
