---
name: TSK-06-analisis-flaky
description: Analiza el histórico de varias ejecuciones para identificar tests inestables, cuantificar su tasa de fallo intermitente, detectar patrones de timing, dependencias entre tests, condiciones de carrera yCauses raíz, y proponer mitigaciones. Úsala cuando un test falla de forma intermitente o la suite no es confiable.
artifact: skill-tsk-06-analisis-flaky
version: 1.0.0
generated_by: TSK-00 (bootstrap-qa-task-skills)
date: 2026-09-27
sources:
  - ai/system-prompts/03-run-repetitive-tasks-skill.prompt.md
---

# TSK-06: ANÁLISIS DE TESTS INESTABLES (FLAKY)

## Propósito

Determinar qué tests de la suite son realmente inestables a partir del histórico de múltiples ejecuciones, en lugar de opinar sobre un solo fallo. Para cada test inestable cuantifica su tasa de fallo, identifica el patrón que lo provoca (timing, estado compartido, datos, red, colisión de nombres), propone la causa raíz más probable con evidencia y define una mitigación concreta. Sirve para decidir qué tests hay que arreglar primero y cuáles hay que poner en cuarentena.

## Cuándo usarla (disparadores)

- Un test "a veces" falla y nadie sabe por qué.
- La tasa de fallo global de la suite ha subido sin cambios en el producto.
- El equipo pide "detecta los tests flaky".
- Piden añadir `retry` y hay que justificarlo con datos.
- Antes de medir cobertura o calidad de release, para no inflar los números con falsos verdes.
- Cuando `TSK-05` clasifica varios fallos como "problema de automatización" en corridas distintas.

## Entradas (inputs)

| Entrada | Requerida | Notas |
| :--- | :--- | :--- |
| Histórico de ejecuciones (JUnit por corrida) | Sí | `./reports/junit/*.xml` o `./evidence/ci/**/results*.xml`; **mínimo 3 corridas** |
| Reportes HTML de cada corrida | No | Aportan duración y trazos para el análisis de timing |
| Código de los tests candidatos | No | Necesario para confirmar la causa raíz propuesta |
| Configuración de reintentos | No | `./playwright.config.ts`, campo `retries` |

## Salidas (outputs)

| Artefacto | Contenido |
| :--- | :--- |
| `./docs/tasks/TSK-06-analisis-flaky.md` | Ranking de tests por tasa de fallo + patrones detectados + causa raíz + mitigación + cuarentena propuesta |

## Dependencias

- **TSK-05** — aporta la clasificación de la corrida más reciente; dependencia blanda.
- **TSK-04** — el análisis de causa raíz se apoya en sus hallazgos de antipatrones.
- Alimenta a: `TSK-08` (no seleccionar tests inestables para la regresión), `TSK-09` (riesgos de release).

## Proceso paso a paso

1. **Verificar el histórico.** Cuenta las ejecuciones disponibles y lista cada archivo con su fecha. Si hay menos de 3 corridas: no puedes afirmar flakiness; emite el informe con `[BLOQUEADO: se requieren ≥3 ejecuciones para distinguir flakiness de fallo reproducible]` y un apartado de "histórico insuficiente". No inventes tasas.
2. **Construir la matriz test × corrida.** Por cada corrida, registra el estado de cada test: `P` (passed), `F` (failed), `S` (skipped), `T` (timedOut), `I` (interrupted). Esta matriz es la fuente de todas las métricas posteriores.
3. **Calcular la tasa de fallo intermitente** solo para los tests ejecutados en **todas** las corridas:
   `tasa = ejecuciones fallidas / ejecuciones en las que corrió`.
   Los tests ausentes en alguna corrida (skip) se marcan aparte y **no entran en el denominador**; se reporta como "cobertura irregular del histórico".
4. **Clasificar cada candidato:** `estable` (0 fallos), `intermitente` (falló en algunas y pasó en otras, con ≥1 corrida fallida), `consistente` (falló en todas), `irregular` (ejecutado en menos de la mitad de las corridas). Un test que nunca pasó y nunca corrió no se clasifica: `[PENDIENTE DE VALIDAR]`.
5. **Detectar el patrón de cada intermitente** usando la tabla de patrones, Buscando evidencia en la matriz, en las duraciones y en el código.
6. **Formular la causa raíz probable** y distinguirla del síntoma. "Falla el 30% de las veces" es el síntoma; "el test asume que el elemento ya está en pantalla al navegar" es la causa.
7. **Proponer la mitigación** concreta y su verificación: qué cambiar y cómo comprobar que se arregló (nueva serie de N corridas con 0 fallos).
8. **Proponer la cuarentena** cuando la causa no esté identificada o la mitigación exceda el esfuerzo razonable. Un test en cuarentena **debe** tener dueño y fecha de revisión; nunca se silencia en silencio.
9. **Emitir el informe** con la plantilla de salida.

### Patrones de inestabilidad

| Patrón | Señal en el histórico o en el código | Mitigación típica |
| :--- | :--- |
| **Timing / espera insuficiente** | Fallos por `timeout` agrupados en pruebas con duraciones similares; el fallo se concentra en la primera aserción tras una acción | Sustituir esperas fijas por aserciones web-first (`TSK-04`) |
| **Estado compartido entre tests** | El test pasa si corre solo y falla en la suite; el orden de ejecución cambia el resultado | Aislar con `storageState` por test, evitar `serial` mal usado, limpiar datos |
| **Colisión de datos** | Fallos correlacionados en el mismo minuto con otros tests que tocan los mismos registros | Generar datos únicos por corrida con `TSK-11` |
| **Condición de carrera** | Fallo intermitente en aserciones de valor justo después de una escritura asíncrona | Esperar la señal de confirmación del sistema, no un tiempo fijo |
| **Dependencia de red o servicio externo** | Fallos agrupados en ventanas de tiempo concretas; errores de conexión | Marcar como no bloqueante o usar mocks/stubs |
| **Autenticación / sesión caducada** | Fallo en la primera aserción tras login, en pruebas largas | Reautenticar en el fixture, renovar `storageState` |
| **Selector que coincide con varios elementos** | `strict mode violation` intermitente, depende del número de elementos en pantalla | Localizador único con `getByRole` + nombre o `data-test` |

## Reglas específicas

1. **Mínimo de evidencia: 3 corridas.** Con menos, el informe se emite bloqueado. Nunca declares "este test es flaky" a partir de un solo fallo.
2. **Cero invención.** Toda tasa se deriva de la matriz del paso 2, y la matriz cita su corrida de origen. Si un dato no está en los archivos de resultados, es `[SIN FUENTE]`.
3. **El denominador es el número de ejecuciones en las que el test corrió.** No uses el total de corridas si hubo skips.
4. **Distinción obligatoria:** intermitente ≠ consistente. Un test que falla siempre es un defecto o un problema de automatización, no flakiness. Clasifícalo como `consistente` y remítelo a `TSK-05`.
5. **Severidad de flakiness:**

   | Nivel | Criterio |
   | :--- | :--- |
   | **Crítica** | Tasa ≥ 40% o el test es bloqueante para el pipeline (obligatorio en la regresión). |
   | **Alta** | Tasa entre 15% y 40%. |
   | **Media** | Tasa entre 5% y 15%. |
   | **Baja** | Tasa < 5% y al menos 2 corridas fallidas. |

6. **Sin quarantine silenciosa.** Todo test propuesto para cuarentena lleva `HALL-XXX`, dueño y fecha de revisión. Un `test.skip` sin registro es un hallazgo de `TSK-04`, no una mitigación.
7. **Cifras redondeadas con criterio.** Reporta la tasa con un decimal y declara el denominador: "2/5 (40.0%)". Nada de porcentajes sin base.
8. **Aislamiento.** Escribe únicamente en `docs/tasks/TSK-06-analisis-flaky.md`.
9. **Idempotencia.** La matriz y las tasas dependen solo de los archivos de entrada, no del momento de ejecución.
10. **Markdown puro.** La matriz test × corrida se representa como tabla Markdown.
11. **Idioma:** español, salvo rutas, identificadores y términos técnicos.

## Plantilla de salida en Markdown

```markdown
---
artifact: tsk-06-analisis-flaky
version: 0.1.0
generated_by: TSK-06
date: YYYY-MM-DD
sources: [reports/junit/results-run1.xml, reports/junit/results-run2.xml, reports/junit/results-run3.xml]
---

# TSK-06 — Análisis de tests inestables

## Histórico analizado
| # | Corrida | Fecha | Fuente | Tests | Fallidos |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | run-2026-09-24 | 2026-09-24 | [FUENTE: reports/junit/results-run1.xml] | X | Y |

## Matriz estado por corrida
Leyenda: `P` passed · `F` failed · `S` skipped · `T` timedOut · `I` interrupted

| Test | run-1 | run-2 | run-3 | Tasa | Clasificación | Nivel |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| login.spec.ts › debería autenticar | P | F | P | 1/3 (33.3%) | Intermitente | Alta |
| checkout.spec.ts › total con cupón | F | F | F | 3/3 (100%) | Consistente | — (ver TSK-05) |

## Ranking de tests inestables
| # | Test | Tasa | Nivel | Patrón detectado | Causa raíz probable | Mitigación | Verificación | Fuente |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | login.spec.ts:12 | 1/3 (33.3%) | Alta | Timing | El test navega y aserta sin esperar a que el formulario esté listo | `await expect(page.getByRole('form')).toBeVisible()` antes del fill | 5 corridas consecutivas sin fallo | [FUENTE: tests/e2e/login.spec.ts:L12] |

## Cuarentena propuesta
| Test | Tasa | Motivo | Dueño | Fecha de revisión | Verificación al salir |
| :--- | :--- | :--- | :--- | :--- | :--- |
| ... | ... | Causa no identificada | [PENDIENTE DE VALIDAR] | [PENDIENTE DE VALIDAR] | [PENDIENTE DE VALIDAR] |

## Cobertura irregular del histórico
| Test | Corridas en las que no corrió | Efecto en la tasa | Marca |
| :--- | :--- | :--- | :--- |
| ... | run-2 | Denominador reducido a 2 | [PENDIENTE DE VALIDAR] |

## Hallazgos sin fuente (excluidos)
| ID | Descripción | Marca |
| :--- | :--- | :--- |
| HALL-099 | ... | [SIN FUENTE] |

## Bloqueos
- [BLOQUEADO: se requieren ≥3 ejecuciones para distinguir flakiness de fallo reproducible]
```

## Criterios de "listo" (definition of done)

- [ ] `./docs/tasks/TSK-06-analisis-flaky.md` existe con encabezado completo.
- [ ] El histórico analiza lista cada corrida con su fecha y `[FUENTE: ...]`.
- [ ] Existe la matriz estado por corrida para todos los tests observados.
- [ ] Cada tasa se expresa como `fallos/ejecuciones` con el porcentaje y su base explícita.
- [ ] Cada test candidato a intermitente tiene patrón, causa raíz probable, mitigación y criterio de verificación.
- [ ] Ningún test se clasifica como intermitente sin al menos una corrida fallida y una pasada.
- [ ] La cuarentena propuesta tiene dueño, fecha de revisión y verificación para cada test.
- [ ] Si hay menos de 3 corridas, el informe está bloqueado y no declara tasas de flakiness.

## Ejemplos de invocación

| Objetivo | Invocación |
| :--- | :--- |
| Analizar el histórico completo | `Ejecuta TSK-06 sobre ./reports/junit/*.xml` |
| Con reportes HTML para timing | `Ejecuta TSK-06 con los JUnit de ./reports/junit y los HTML de ./reports/html` |
| Un archivo concreto | `Ejecuta TSK-06 limitado a los tests de tests/e2e/checkout.spec.ts` |
| En pipeline | `Ejecuta el pipeline "post-ejecución" (TSK-05 → TSK-06 → TSK-07)` |
