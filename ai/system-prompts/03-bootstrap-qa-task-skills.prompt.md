---
artifact: bootstrap-qa-task-skills-prompt
version: 1.0.0
purpose: DISEÑAR Y GENERAR un conjunto de skills especializadas que automaticen las TAREAS REPETITIVAS de un QA Engineer
target_agent: OpenCode / Cursor / Claude
model_recommended: deepseek-r1:free o qwen3-coder:free
created: 2026-09-26
last_run: 2026-09-27
source_of_record: ai/system-prompts/03-run-repetitive-tasks-skill.prompt.md
---

# Bootstrap de Skills de Tareas de QA (TSK-XX)

Este prompt es el que generó el sistema de skills `TSK-XX`. Se conserva aquí como **registro de diseño**: cualquier `SKILL.md` de `ai/skills/tasks/` cita esta fuente en su encabezado `sources`.

Si necesitas el prompt tal como fue recibido, con su formato original, está en [`03-run-repetitive-tasks-skill.prompt.md`](03-run-repetitive-tasks-skill.prompt.md).

---

## Contexto

- **Repositorio:** `qa-ai-prestashop-portfolio`
- **Sistema previo:** `ai/skills/00-orchestrator` … `07-test-strategy` — extrae requisitos desde el código.
- **Sistema nuevo:** `ai/skills/tasks/TSK-XX-*` — opera **sobre los artefactos de QA** (historias, casos, reportes, logs, contrato, código de test) para acelerar el trabajo diario.
- **Herramientas:** OpenCode con modelos libres, Playwright, TypeScript.
- **Entradas:** `./docs/`, `./evidence/`, `./reports/`, `./tests/`, `./pages/`, `./fixtures/`, `./.github/workflows/`.
- **Salidas de las skills:** `./docs/tasks/` y `./evidence/tasks/`.
- **Prompts del sistema:** `./ai/system-prompts/`.

## Principios inviolables

1. **Formato único:** toda salida en Markdown puro. Nunca JSON, YAML, XML ni texto sin estructura.
2. **Cero invención:** si un dato no está en la entrada, se marca `[PENDIENTE DE VALIDAR]` o `[SIN FUENTE]`.
3. **Trazabilidad obligatoria:** cada afirmación cita su fuente, p. ej. `[FUENTE: docs/02-inventario-historias-usuario.md#US-012]`.
4. **Aislamiento:** cada skill opera sobre su entrada y produce su salida. No modifica artefactos ajenos.
5. **Idempotencia:** dos ejecuciones sobre la misma entrada producen el mismo resultado.
6. **Idioma:** español, salvo nombres de archivo, rutas, identificadores y términos técnicos.
7. **Versionado:** encabezado con `artifact`, `version`, `generated_by`, `date` y `sources`.

## Catálogo implementado

**Base (TSK-01 a TSK-09):**

| ID | Nombre | Entrada | Salida |
| :--- | :--- | :--- | :--- |
| TSK-01 | Revisión de requisitos | `docs/02-inventario-historias-usuario.md` | `docs/tasks/TSK-01-revision-requisitos.md` |
| TSK-02 | Generación de casos de prueba | `docs/02-…`, `docs/04-reglas-de-negocio.md` | `docs/tasks/TSK-02-casos-de-prueba.md` |
| TSK-03 | Contrato API (OpenAPI) | Archivo OpenAPI + endpoints | `docs/tasks/TSK-03-contrato-api.md` |
| TSK-04 | Revisión de código de automatización | `tests/`, `pages/`, `fixtures/` | `docs/tasks/TSK-04-revision-codigo-automatizacion.md` |
| TSK-05 | Análisis de fallos de ejecución | Reporte HTML/JUnit, logs, capturas | `docs/tasks/TSK-05-analisis-fallos.md` |
| TSK-06 | Análisis de tests inestables | ≥3 ejecuciones previas | `docs/tasks/TSK-06-analisis-flaky.md` |
| TSK-07 | Redacción de defectos | Logs, capturas, respuestas de API | `docs/tasks/TSK-07-defectos/BUG-XXX.md` |
| TSK-08 | Selección de tests para regresión | Diff de código, tests, historial de bugs | `docs/tasks/TSK-08-seleccion-regresion.md` |
| TSK-09 | Resumen de release | Reportes, defectos, riesgos | `docs/tasks/TSK-09-resumen-release.md` |

**Adicionales confirmadas (TSK-10 a TSK-12):**

| ID | Nombre | Entrada | Salida |
| :--- | :--- | :--- | :--- |
| TSK-10 | Healthcheck de entorno | `playwright.config.ts`, URL, credenciales | `docs/tasks/TSK-10-healthcheck-entorno.md` |
| TSK-11 | Generación y enmascaramiento de datos | `docs/04-reglas-de-negocio.md`, fixtures, logger | `docs/tasks/TSK-11-datos-prueba.md` |
| TSK-12 | Triage de fallos de pipeline CI/CD | Log del pipeline + workflow | `docs/tasks/TSK-12-triage-ci.md` |

**No implementadas (permanecen en el catálogo ampliado, sin `SKILL.md`):** `TSK-13` a `TSK-20` y `TSK-14`, `TSK-17`, `TSK-19`, `TSK-20` referenciadas por los pipelines. La orquestadora las registra como etapa `NO DEFINIDA` y no las sustituye por tareas parecidas.

## Pipelines predefinidos

| Pipeline | Secuencia |
| :--- | :--- |
| `pre-ejecución` | `TSK-10` → `TSK-11` |
| `nueva-historia` | `TSK-01` → `TSK-02` → `TSK-14` ⚠️ |
| `revision-suite` | `TSK-04` → `TSK-17` → `TSK-20` ⚠️ |
| `post-ejecución` | `TSK-05` → `TSK-06` → `TSK-07` |
| `pre-release` | `TSK-08` → `TSK-09` → `TSK-19` ⚠️ |

## Estructura de cada `SKILL.md`

Cada skill define, en este orden: ID y nombre · propósito · cuándo usarla (disparadores) · entradas · salidas · dependencias · proceso paso a paso · reglas específicas · plantilla de salida en Markdown · criterios de "listo" (definition of done) · ejemplos de invocación.

## Convenciones globales

- **Encabezado obligatorio:** `artifact`, `version`, `generated_by`, `date`, `sources`.
- **IDs:** `BUG-XXX` defectos · `TS-XXX` escenarios · `TC-XXX` casos · `HALL-XXX` hallazgos · `EXP-XXX` exposiciones · `API-NXX` casos negativos de API.
- **Citas:** `[FUENTE: ...]` siempre en línea.
- **Bloqueos:** `[BLOQUEADO: falta fuente]`, `[PENDIENTE DE VALIDAR]`, `[SIN FUENTE]`.
- **Tablas Markdown** para todo lo tabular; **Mermaid** cuando aporte valor.

## Prompts operativos del sistema

| Archivo | Propósito |
| :--- | :--- |
| [`04-run-task-skill.prompt.md`](04-run-task-skill.prompt.md) | Ejecutar una `TSK-XX` individual |
| [`05-run-task-pipeline.prompt.md`](05-run-task-pipeline.prompt.md) | Ejecutar un pipeline completo de tareas |

## Estado de la ejecución del 2026-09-27

Se generaron las definiciones de `TSK-00` a `TSK-12`, el `README.md` del catálogo, la estructura vacía de `docs/tasks/` y `evidence/tasks/`, y los tres prompts de sistema. **No se ejecutó ninguna skill**: no existe ningún artefacto generado por `TSK-XX`, y por tanto no hay contenido inventado.
