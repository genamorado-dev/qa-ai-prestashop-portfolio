---
name: TSK-04-revision-codigo-automatizacion
description: Revisa los archivos de automatización de Playwright (.spec.ts, .page.ts, .fixture.ts) y detecta datos hardcodeados, aserciones débiles, localizadores inestables, código duplicado, esperas bloqueantes y antipatrones, con hallazgos por archivo y línea, severidad, recomendación y fuente. Úsala en revisión de código de tests o antes de preparar una suite para CI.
artifact: skill-tsk-04-revision-codigo-automatizacion
version: 1.0.0
generated_by: TSK-00 (bootstrap-qa-task-skills)
date: 2026-09-27
sources:
  - ai/system-prompts/03-run-repetitive-tasks-skill.prompt.md
---

# TSK-04: REVISIÓN DE CÓDIGO DE AUTOMATIZACIÓN

## Propósito

Auditar el código de pruebas automatizadas buscando los defectos que hacen que una suite sea frágil, lenta, poco legible o incapaz de detectar regresiones reales. El foco no es el estilo: es la fiabilidad de la prueba como oráculo. Cada hallazgo se ancla a un archivo y una línea, se clasifica en una categoría conocida y lleva una recomendación concreta de corrección.

## Cuándo usarla (disparadores)

- Se/pull-request una suite de pruebas nueva o modificada.
- La suite pasa en local y falla en CI (o al revés) de forma sistemática.
- El equipo pide "revisa estos tests" o "hazme code review de las pruebas".
- El tiempo de ejecución de la suite excede el timeout del pipeline o se incrementa descontroladamente.
- Antes de un release, para evitar arrastrar deuda técnica de automatización.
- Cuando `TSK-06` reporta flakiness y se busca la causa en el código.

## Entradas (inputs)

| Entrada | Requerida | Notas |
| :--- | :--- | :--- |
| `./tests/**/*.spec.ts` | Sí | Specs de Playwright |
| `./pages/**/*.ts` | Sí | Page Objects |
| `./fixtures/**/*.ts` | Sí | Fixtures y configuración de test |
| `./utils/**/*.ts` | No | Helpers, logger, self-healing |
| `./playwright.config.ts` | No | Para revisar timeouts, retries, workers, reporter |
| Diff de la rama (`git diff`) | No | Parámetro `DIFF_ONLY`; limita la revisión a los archivos cambiados |

## Salidas (outputs)

| Artefacto | Contenido |
| :--- | :--- |
| `./docs/tasks/TSK-04-revision-codigo-automatizacion.md` | Tabla de hallazgos `HALL-XXX` por archivo y línea + métricas de la suite + bloqueos |

## Dependencias

- Ninguna interna. Opera sobre el código de la suite.
- Alimenta a: `TSK-06` (causas de flakiness), `TSK-17` (redundancia), `TSK-20` (accesibilidad de localizadores).

## Proceso paso a paso

1. **Inventariar los archivos.** Lista todos los `.spec.ts`, `pages/*.ts` y `fixtures/*.ts` con su número de líneas. Si `DIFF_ONLY=true`, limita la lista a los archivos del diff. Registra los archivos analizados en la sección de fuentes.
2. **Recorrer cada archivo** buscando, en este orden fijo, las categorías de la tabla siguiente.
3. **Registrar cada hallazgo** con `HALL-XXX`, archivo, línea, categoría, severidad, fragmento relevante (≤3 líneas) y recomendación.
4. **Detectar duplicación.** Compara fragmentos con la misma estructura lógica (misma secuencia de `goto` + `fill` + `click` + `expect`) entre specs. Reporta el grupo una sola vez, listando todos los archivos y líneas implicados.
5. **Calcular métricas de la suite** a partir de lo leído: número de specs, número de tests declarados, ratio de esperas explícitas, ratio de aserciones fuertes, número de datos hardcodeados. Cada métrica con el archivo del que se derivó.
6. **Emitir el informe** con la plantilla de salida, ordenando los hallazgos por severidad y luego por archivo.

### Categorías de análisis

| Categoría | Qué se busca | Ejemplo de hallazgo |
| :--- | :--- | :--- |
| **Dato hardcodeado** | Credenciales, emails, URLs, IDs, importes o textos de prueba escritos en el código | `const PASSWORD = 'Admin123!'` |
| **Aserción débil** | Aserciones que pasan siempre o casi siempre: `toBeTruthy()`, comprobar que no hay error sin validar contenido, `count` sin expectativa clara, captura sin validación visual | `await expect(locator).toBeTruthy()` |
| **Localizador inestable** | Selectores CSS por clase o estructura, `nth-child`, XPath, texto de UI traducido, `id` autogenerado | `page.locator('div.product > div:nth-child(2)')` |
| **Espera bloqueante** | `waitForTimeout`, `sleep`, polling manual con espera fija, espera de carga total de red | `await page.waitForTimeout(3000)` |
| **Código duplicado** | Secuencias de pasos repetidas que deberían estar en un Page Object o helper | misma secuencia de login replicada en 4 specs |
| **Antipatrón de Playwright** | `expect` dentro de condicionales, tests dependientes del orden, `test.only`/`skip` sin justificación, race con `Promise.all` sobre el mismo page, sin `await` en promesas, uso de `force: true`, ausencia de `web-first assertions` | `await page.getByRole('button').click({ force: true })` |

## Reglas específicas

1. **Cero invención.** Solo se reporta lo que está en el archivo. Si no puedes citar archivo y línea, el hallazgo no existe.
2. **Todo hallazgo es accionable.** "Mejorar la mantenibilidad" no es un hallazgo. "Extraer el login de `tests/e2e/login.spec.ts:L12` a `pages/LoginPage.ts`" sí.
3. **Severidades:**

   | Severidad | Criterio |
   | :--- | :--- |
   | **Bloqueante** | El test no puede detectar una regresión real (aserción débil) o expone credenciales en el repositorio. |
   | **Alta** | El test es probablemente inestable (espera bloqueante, localizador estructural) o depende del orden de ejecución. |
   | **Media** | Duplicación significativa, falta de Page Object, `force: true` sin justificación. |
   | **Baja** | Legibilidad, nomenclatura, mensajes de aserción poco descriptivos. |

4. **No reescribas el código.** Esta skill no edita los `.spec.ts`. Si el usuario lo pide tras el informe, es un paso posterior explícito.
5. **Dato sensible.** Si detectas una credencial real, no la reproduzcas completa en el informe: cítala enmascarada (`pass****`) y marca `[BLOQUEADO: credencial expuesta, rotar y revisar historial]`.
6. **Aislamiento.** Escribe únicamente en `docs/tasks/TSK-04-revision-codigo-automatizacion.md`.
7. **Idempotencia.** El hallazgo `HALL-XXX` se numera en orden de archivo y línea, de forma estable respecto al contenido, no a la fecha.
8. **Orden estable.** Los archivos se procesan en orden alfabético de ruta, y dentro de cada archivo por número de línea ascendente.
9. **Markdown puro.** Todo lo tabular en tablas Markdown.
10. **Idioma:** español, salvo rutas, identificadores y términos técnicos.

## Plantilla de salida en Markdown

```markdown
---
artifact: tsk-04-revision-codigo-automatizacion
version: 0.1.0
generated_by: TSK-04
date: YYYY-MM-DD
sources: [tests/e2e/login.spec.ts, tests/e2e/checkout.spec.ts, pages/LoginPage.ts, fixtures/base.fixture.ts]
---

# TSK-04 — Revisión de código de automatización

## Alcance
| Métrica | Valor |
| :--- | :--- |
| Archivos analizados | X |
| Specs / tests declarados | X / Y |
| Modo | Completo / Solo diff |

## Métricas de la suite
| Métrica | Valor | Derivado de |
| :--- | :--- | :--- |
| Esperas explícitas (`expect`) | X en Y tests | tests/e2e/*.spec.ts |
| Esperas bloqueantes (`waitForTimeout`) | X | tests/e2e/checkout.spec.ts:L88 |
| Datos hardcodeados | X | ... |
| Aserciones débiles | X | ... |

## Hallazgos

| ID | Archivo | Línea | Categoría | Severidad | Descripción | Recomendación | Fuente |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| HALL-001 | tests/e2e/login.spec.ts | 12 | Dato hardcodeado | Bloqueante | Credencial de demo escrita en el literal | Mover a `process.env.TEST_PASSWORD` y sanear el historial | [FUENTE: tests/e2e/login.spec.ts:L12] |
| HALL-002 | tests/e2e/checkout.spec.ts | 88 | Espera bloqueante | Alta | `waitForTimeout(3000)` antes de aserción | Sustituir por `await expect(locator).toBeVisible()` | [FUENTE: tests/e2e/checkout.spec.ts:L88] |
| HALL-003 | pages/LoginPage.ts | 40 | Localizador inestable | Alta | Selector CSS por posición de elemento | Usar `getByRole('textbox', { name: ... })` | [FUENTE: pages/LoginPage.ts:L40] |

## Grupos de duplicación
| Grupo | Patrón repetido | Archivos y líneas | Acción sugerida |
| :--- | :--- | :--- | :--- |
| DUP-01 | login + assert de home | tests/e2e/login.spec.ts:L10, tests/e2e/checkout.spec.ts:L18 | Extraer a `fixtures/base.fixture.ts` |

## Hallazgos sin fuente (excluidos)
| ID | Descripción | Marca |
| :--- | :--- | :--- |
| HALL-099 | ... | [SIN FUENTE] |

## Bloqueos
- [BLOQUEADO: ...]
```

## Criterios de "listo" (definition of done)

- [ ] `./docs/tasks/TSK-04-revision-codigo-automatizacion.md` existe con encabezado completo.
- [ ] Todos los archivos analizados están listados en `sources` y en la sección de alcance.
- [ ] Cada hallazgo tiene ID, archivo, línea, categoría, severidad, descripción, recomendación y `[FUENTE: ruta:Ln]`.
- [ ] Las seis categorías del análisis están cubiertas o se declara explícitamente que no hay hallazgos en alguna de ellas.
- [ ] Existe la tabla de métricas de la suite con la fuente de cada métrica.
- [ ] Los grupos de duplicación listan todos los archivos y líneas implicadas.
- [ ] Las credenciales están enmascaradas en el informe.
- [ ] Ningún archivo `.spec.ts`, `pages/*.ts` o `fixtures/*.ts` fue modificado.

## Ejemplos de invocación

| Objetivo | Invocación |
| :--- | :--- |
| Revisión completa de la suite | `Ejecuta TSK-04 sobre ./tests, ./pages, ./fixtures y ./playwright.config.ts` |
| Solo el diff de la rama | `Ejecuta TSK-04 con DIFF_ONLY=true sobre el diff contra main` |
| Un solo archivo | `Ejecuta TSK-04 limitado a tests/e2e/checkout.spec.ts` |
| En pipeline | `Ejecuta el pipeline "revision-suite" (TSK-04 → TSK-17 → TSK-20)` |
