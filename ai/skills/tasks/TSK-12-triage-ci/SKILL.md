---
name: TSK-12-triage-ci
description: Analiza los logs de una ejecución de CI/CD (GitHub Actions u otro runner), clasifica el fallo como código de la suite, defecto de producto, infraestructura, dependencia externa o timeout, y propone la acción correspondiente con la evidencia exacta. Úsala cuando un pipeline falla y hay que decidir si es culpa del código, del entorno o de la configuración.
artifact: skill-tsk-12-triage-ci
version: 1.0.0
generated_by: TSK-00 (bootstrap-qa-task-skills)
date: 2026-09-27
sources:
  - ai/system-prompts/03-run-repetitive-tasks-skill.prompt.md
---

# TSK-12: TRIAGE DE FALLOS DE PIPELINE CI/CD

## Propósito

Leer el log de un pipeline fallido y determinar en qué capa está el problema: el código de la suite, el producto bajo prueba, la infraestructura del runner, una dependencia externa o un límite de tiempo. La clasificación se apoya siempre en una línea concreta del log, nunca en una impresión del mensaje de error, y cada hallazgo incluye el paso del pipeline donde ocurrió y la acción que corresponde a quien lo puede resolver.

## Cuándo usarla (disparadores)

- Un workflow de GitHub Actions (u otro runner) termina en rojo.
- El pipeline falla antes de ejecutar los tests (instalación, compilación, caché).
- El pipeline falla con "no tests ran" o con un error de navegador.
- La CI pasa en local pero falla en el runner, o al revés.
- Se pide "revisa por qué falló el pipeline" o "hace triage de esta corrida de CI".
- Después de cada fallo de pipeline, antes de reintentar a ciegas.

## Entradas (inputs)

| Entrada | Requerida | Notas |
| :--- | :--- | :--- |
| Log del pipeline | Sí | Parámetro `CI_LOG`; se cita por línea |
| Definición del workflow | Sí | `./.github/workflows/playwright.yml` (o la ruta indicada) |
| Reportes de la corrida | No | `./reports/junit/results.xml`, `./reports/html/index.html` |
| Nombre del run / commit | No | Parámetros `RUN_ID` y `COMMIT`; citables en el informe |
| Logs de dependencias externas | No | Parámetro `DEPS_LOG` |

## Salidas (outputs)

| Artefacto | Contenido |
| :--- | :--- |
| `./docs/tasks/TSK-12-triage-ci.md` | Tabla de pasos del pipeline con estado, clasificación del fallo, evidencia por línea y acción |
| `./evidence/tasks/TSK-12/` | Referencias a los logs y adjuntos usados (rutas, no copias) |

## Dependencias

- **TSK-10** — el healthcheck distingue infraestructura de aplicación; útil como entrada.
- **TSK-05** — para los tests que sí corrieron y fallaron dentro del pipeline.
- Alimenta a: `TSK-09` (riesgos de release cuando falla la CI del candidato).

## Proceso paso a paso

1. **Identificar la ejecución.** Registra el repositorio, la rama, el commit y el identificador del run. Sin esos datos el informe no es trazable: `[PENDIENTE DE VALIDAR]`.
2. **Reconstruir el grafo de pasos.** Del log, extrae la lista de pasos del pipeline en orden con su estado: `OK`, `FALLO`, `SKIPPED`, `CANCELLED`, `TIMEOUT`. La tabla de pasos es el esqueleto del informe y se cita con la línea del log donde empieza cada paso.
3. **Localizar el primer fallo real.** Descarta los errores derivados: una instalación fallida produce luego "no tests ran", y ese segundo mensaje no es la causa. El primer error no derivado, con su línea, es el que clasificas.
4. **Clasificar el fallo** aplicando la tabla de categorías, en el orden indicado. La primera categoría cuya evidencia encaje decide.
5. **Extraer la evidencia.** Línea exacta del log, mensaje de error, comando que falló y exit code. Sin las cuatro, la clasificación es `[PENDIENTE DE VALIDAR]`.
6. **Verificar si los tests corrieron.** Si llegaron a ejecutarse, añade el recuento de passed/failed con `[FUENTE: reports/junit/results.xml]` y clasifica los fallos de test con los criterios de `TSK-05`. Si no llegaron, el informe lo declara: un pipeline que muere en la instalación **no da información sobre la calidad del producto**.
7. **Determinar la acción** según la categoría y quién puede ejecutarla:

   | Categoría | Acción | Responsable típico |
   | :--- | :--- | :--- |
   | Código de la suite | Corregir el archivo y línea indicados | QA / SDET |
   | Defecto de producto | Redactar bug con `TSK-07` | QA → Desarrollo |
   | Infraestructura | Escalar o reintentar; documentar el incidente | Plataforma / DevOps |
   | Dependencia externa | Reintentar; si persiste, congelar la dependencia o documentar el impacto | Plataforma |
   | Timeout | Reducir el alcance, ajustar `timeout` o dividir el job | QA / Plataforma |
   | Configuración del pipeline | Corregir el workflow y abrir PR | Plataforma |

8. **Evaluar si el fallo invalida la señal.** Declara explícitamente si la corrida aporta o no información sobre la calidad del producto. Es la conclusión más importante del informe.
9. **Emitir el informe** con la plantilla de salida.

### Tabla de categorías

| Categoría | Señales en el log | Causa raíz típica | Prioridad |
| :--- | :--- | :--- | :--- |
| **Infraestructura** | `ECONNREFUSED`, `ETIMEDOUT` hacia el runner, `502`/`503`, "no space left on device", OOM killer, error de descarga de binarios, `docker` no disponible | Runner sin recursos, red bloqueada, servicio caído | P0 si la CI está caída; P3 si es puntual |
| **Dependencia externa** | Falla la descarga de un paquete, `npm ERR! 5xx`, registry no disponible, error de un servicio de terceros | Red, registry, API externa | P1 |
| **Configuración del pipeline** | Variable de entorno ausente, secret no configurado, path incorrecto, caché corrupta, versión de Node no fijada | Workflow incompleto o desincronizado | P2 |
| **Timeout** | `The operation was canceled`, `Job exceeded`, `TimeoutError` global, workflow cancelado por tiempo | Suite más lenta que la ventana de CI | P2 |
| **Código de la suite** | `TSError`, error de compilación de TypeScript, import inexistente, aserción fallida con stack del test | Defecto en el código de pruebas | P1 |
| **Defecto de producto** | Aserción fallida contra valor observable del SUT, captura con estado incorrecto | Regresión en la aplicación | P0/P1 según severidad |

## Reglas específicas

1. **Causa, no síntoma.** Clasifica el primer error no derivado. "no tests ran" es síntoma de una instalación fallida; reportarlo como causa es un error de triage.
2. **Evidencia obligatoria por línea.** Cada hallazgo cita al menos `archivo:Ln` del log o `archivo:Ln` del workflow. Sin línea, es `[PENDIENTE DE VALIDAR]`.
3. **Sin secretos en el informe.** Los logs de CI suelen contener tokens en URLs de descarga o cabeceras. Enmascara: `token:****`, `***@github.com`. Si encuentras una credencial expuesta en el log, es un hallazgo de severidad Bloqueante.
4. **Declaración de señal.** Todo informe termina con un veredicto explícito: la corrida **APORTA** o **NO APORTA** información sobre la calidad del producto, y por qué.
5. **No re-ejecutes.** Esta skill es documental. El reintento del pipeline es un paso posterior explícito del usuario.
6. **No corrijas el workflow.** Si el error está en la definición del pipeline, se propone el cambio con el archivo y la línea; no se edita `.github/workflows/`.
7. **Severidades:** ver la columna de prioridad de la tabla de categorías. Se anteponen a la clasificación en el informe.
8. **Trazabilidad del fallo.** Si el fallo es de un test concreto, enlaza con el `HALL-XXX` o el `BUG-XXX` correspondiente de `TSK-04` o `TSK-07` cuando exista.
9. **Aislamiento.** Escribe únicamente en `docs/tasks/TSK-12-triage-ci.md` y las referencias en `evidence/tasks/TSK-12/`.
10. **Idempotencia.** El informe depende del log y del workflow de entrada, no del momento del análisis.
11. **Markdown puro.** Sin JSON ni YAML.
12. **Idioma:** español, salvo rutas, identificadores y términos técnicos.

## Plantilla de salida en Markdown

```markdown
---
artifact: tsk-12-triage-ci
version: 0.1.0
generated_by: TSK-12
date: YYYY-MM-DD
sources: [evidence/ci/playwright-run.log, .github/workflows/playwright.yml, reports/junit/results.xml]
---

# TSK-12 — Triage de fallos de pipeline

## Identificación de la ejecución
| Dato | Valor | Fuente |
| :--- | :--- | :--- |
| Repositorio / rama | … | [PENDIENTE DE VALIDAR] |
| Commit | abc1234 | [FUENTE: evidence/ci/playwright-run.log:L1] |
| Run ID | 1234567890 | [FUENTE: evidence/ci/playwright-run.log:L1] |
| Workflow | `.github/workflows/playwright.yml` | [FUENTE: .github/workflows/playwright.yml] |
| Resultado | FALLO | [FUENTE: evidence/ci/playwright-run.log:L12] |

## Pasos del pipeline
| # | Paso | Estado | Duración | Fuente |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Checkout | OK | 3 s | [FUENTE: evidence/ci/playwright-run.log:L14] |
| 2 | Install dependencies | FALLO | 41 s | [FUENTE: evidence/ci/playwright-run.log:L58] |
| 3 | Run Playwright tests | SKIPPED | — | [FUENTE: evidence/ci/playwright-run.log:L60] |

## Primer fallo real
| Campo | Valor | Fuente |
| :--- | :--- | :--- |
| Paso | Install dependencies | [FUENTE: evidence/ci/playwright-run.log:L58] |
| Línea del log | L58 | [FUENTE: evidence/ci/playwright-run.log:L58] |
| Mensaje | `npm ERR! code E503` … | [FUENTE: evidence/ci/playwright-run.log:L58] |
| Comando | `npm ci` | [FUENTE: .github/workflows/playwright.yml:L28] |
| Exit code | 1 | [FUENTE: evidence/ci/playwright-run.log:L58] |

## Clasificación
| ID | Categoría | Prioridad | Justificación | Evidencia | Acción | Responsable |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| HALL-001 | Dependencia externa | P1 | El registry devolvió 503; no es un fallo de configuración ni de código | [FUENTE: evidence/ci/playwright-run.log:L58] | Reintentar el job; si persiste, cambiar a `npm ci --prefer-offline` con caché | Plataforma |

## Fallos derivados (no son causa)
| Mensaje | Línea | Causa real |
| :--- | :--- | :--- |
| `Error: no tests ran` | [FUENTE: evidence/ci/playwright-run.log:L61] | HALL-001 (instalación fallida) |

## Exposición de credenciales
| ID | Ubicación | Tipo | Severidad | Acción | Fuente |
| :--- | :--- | :--- | :--- | :--- | :--- |
| — | — | — | — | — | — |

## ¿Los tests corrieron?
| Pregunta | Respuesta | Fuente |
| :--- | :--- | :--- |
| Se ejecutó la suite | No | [FUENTE: evidence/ci/playwright-run.log:L60] |
| Tests passed / failed | — / — | [FUENTE: reports/junit/results.xml] |

## Veredicto de señal
> ## NO APORTA información sobre la calidad del producto
> La instalación de dependencias falló antes de ejecutar cualquier test. El fallo es de dependencia externa, no del producto ni de la suite.

## Acción recomendada
| # | Acción | Responsable | Prioridad |
| :--- | :--- | :--- | :--- |
| 1 | Reintentar el job | Plataforma | P1 |

## Bloqueos
- [BLOQUEADO: ...]
```

## Criterios de "listo" (definition of done)

- [ ] `./docs/tasks/TSK-12-triage-ci.md` existe con encabezado completo.
- [ ] La identificación declara repositorio o rama, commit y run ID, con fuente o `[PENDIENTE DE VALIDAR]`.
- [ ] La tabla de pasos cubre todos los pasos del pipeline con su estado y su fuente.
- [ ] El primer fallo real está identificado con paso, línea, mensaje, comando y exit code, todos citados.
- [ ] Cada hallazgo tiene categoría, prioridad, justificación, evidencia y acción con responsable.
- [ ] Los fallos derivados están listados aparte y no se confunden con la causa.
- [ ] Existe la sección de exposición de credenciales, vacía si no hay hallazgos.
- [ ] Está declarado si los tests llegaron a ejecutarse, con el recuento si los hay.
- [ ] El informe termina con un veredicto de señal explícito (APORTA / NO APORTA) y su motivo.
- [ ] Ningún secreto aparece en claro en el informe.
- [ ] No se re-ejecutó el pipeline ni se modificó el workflow.

## Ejemplos de invocación

| Objetivo | Invocación |
| :--- | :--- |
| Triage del último pipeline | `Ejecuta TSK-12 con CI_LOG=./evidence/ci/playwright-run.log y el workflow ./.github/workflows/playwright.yml` |
| Triage solo de instalación | `Ejecuta TSK-12 limitado al paso "Install dependencies"` |
| Con reportes de la corrida | `Ejecuta TSK-12 con CI_LOG=… y ./reports/junit/results.xml` |
| Después de un healthcheck | `Ejecuta TSK-12 e incluye el resultado de docs/tasks/TSK-10-healthcheck-entorno.md` |
