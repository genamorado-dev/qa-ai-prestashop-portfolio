---
artifact: skills-readme
version: 1.0.0
generated_by: SKILL-00 (bootstrap-skills)
date: 2026-09-26
sources:
  - ai/system-prompts/00-bootstrap-skills.prompt.md
  - ai/system-prompts/01-run-orchestrator.prompt.md
  - ai/system-prompts/02-run-single-skill.prompt.md
---

# Sistema de Skills de QA Asistido por IA

Ocho skills encadenadas que transforman el **código fuente** de una tienda PrestaShop en un **plan y una estrategia de pruebas** totalmente trazables, sin inventar funcionalidades.

Las definiciones viven en `ai/skills/<NN>-<nombre>/SKILL.md`. Los prompts operativos que las invocan están en `ai/system-prompts/`.

---

## Principios inviolables

Aplican a **todas** las skills, sin excepción:

| # | Principio | Qué significa en la práctica |
| :--- | :--- | :--- |
| 1 | **Formato único** | Toda salida es Markdown puro. Nunca JSON, YAML, XML ni texto sin estructura. |
| 2 | **Cero invención** | Nada entra sin respaldo en código real, requisitos del usuario o evidencia. |
| 3 | **Trazabilidad obligatoria** | Toda afirmación cita su fuente: `[FUENTE: ruta:línea]`, `[FUENTE: requisito del usuario, fecha]` o `[FUENTE: docs/...]`. Sin fuente → `[SIN FUENTE – PENDIENTE DE VALIDAR]` y fuera del inventario. |
| 4 | **Sin asumir comportamiento** | Ante ambigüedad en el código, la skill se detiene y pregunta. No rellena con suposiciones. |
| 5 | **Idioma** | Español, salvo rutas, identificadores y términos técnicos. |
| 6 | **Versionado** | Cada artefacto lleva encabezado con `artifact`, `version`, `generated_by`, `date` y `sources`. |

### Convenciones de identificadores

`REQ-XXX` requisito · `FUENTE-XXX` fuente de código · `US-XXX` historia de usuario · `CA-XXX` criterio de aceptación · `RN-XXX` regla de negocio · `TS-XXX` escenario · `TC-XXX` caso de prueba.

### Marcas de estado

`[FUENTE: ...]` · `[SIN FUENTE]` · `[BLOQUEADO: ...]` · `[PENDIENTE DE VALIDAR]` · `[SUPUESTO: ...]` · `⚠️` sin cobertura · `✅` cubierto.

---

## Flujo completo

```mermaid
flowchart TD
    U[Usuario] -->| parámetros | ORCH

    subgraph ORCH["SKILL 0 · Orquestador"]
        direction TB
        P1[Validar entradas]
        P2[Invocar skill]
        P3{¿Cumple definition of done?}
        P4[Registrar en bitácora]
        P5[¿Siguiente skill?]
        P6[Detener y reportar bloqueo]
        P7[Reporte final]
        P1 --> P2 --> P3
        P3 -- Sí --> P4 --> P5
        P3 -- No --> P6 --> P7
        P5 -- Sí --> P2
        P5 -- No --> P7
    end

    ORCH --> S1["SKILL 1 · Code Extractor<br/>código + requisitos → inventario de fuentes"]
    S1 --> D1[docs/01-inventario-fuentes.md]
    D1 --> V1{"V1: tabla de fuentes,<br/>requisitos y vacíos"}

    V1 -- No --> STOP1[BLOQUEADO]
    V1 -- Sí --> S2["SKILL 2 · User Story Inventory<br/>fuentes → historias US/CA/RN"]
    S2 --> D2[docs/02-inventario-historias-usuario.md]
    D2 --> V2{"V2: cada historia con<br/>fuente, condiciones y CA"}

    V2 -- No --> STOP2[BLOQUEADO]
    V2 -- Sí --> S3["SKILL 3 · Test Scenarios<br/>historias → escenarios TS + casos TC"]
    S3 --> D3[docs/03-escenarios-y-casos.md]
    D3 --> V3{"V3: ≥1 positivo, ≥1 negativo,<br/>≥1 límite por historia"}

    V3 -- No --> STOP3[BLOQUEADO]
    V3 -- Sí --> S4["SKILL 4 · Business Rules<br/>reglas RN consolidadas y comprobables"]
    S4 --> D4[docs/04-reglas-de-negocio.md]
    D4 --> V4{"V4: cada RN con fuente,<br/>comprobabilidad e historias"}
    D1 --> S4

    V4 -- No --> STOP4[BLOQUEADO]
    V4 -- Sí --> S5["SKILL 5 · Traceability Matrix<br/>REQ ↔ US ↔ CA ↔ TS ↔ TC ↔ RN"]
    S5 --> D5[docs/05-matriz-trazabilidad.md]
    D5 --> V5{"V5: toda fila con fuente;<br/>huecos reportados"}

    V5 -- No --> STOP5[BLOQUEADO]
    V5 -- Sí --> S6["SKILL 6 · Test Plan<br/>qué se prueba y por qué"]
    S6 --> D6[docs/06-plan-de-pruebas.md]
    D6 --> V6{"V6: alcance respaldado<br/>por el inventario"}
    D2 --> S6
    D3 --> S6
    D4 --> S6

    V6 -- No --> STOP6[BLOQUEADO]
    V6 -- Sí --> S7["SKILL 7 · Test Strategy<br/>cómo y por qué se prueba"]
    S7 --> D7[docs/07-estrategia-de-pruebas.md]
    D7 --> V7{"V7: decisiones justificadas<br/>con plan y matriz"}

    V7 -- No --> STOP7[BLOQUEADO]
    V7 -- Sí --> END["Estado global: COMPLETO"]

    STOP1 --> LOG[docs/00-progress-log.md]
    STOP2 --> LOG
    STOP3 --> LOG
    STOP4 --> LOG
    STOP5 --> LOG
    STOP6 --> LOG
    STOP7 --> LOG
    END --> LOG
    LOG --> REP[docs/00-orchestrator-report.md]
```

Los puntos `V1`–`V7` son las validaciones de *definition of done*. Si una falla, el flujo se detiene: **no se avanza y no se rellena el hueco**.

---

## Mapa de skills

| # | Skill | Entrada principal | Salida |
| :--- | :--- | :--- | :--- |
| 0 | `00-orchestrator` | Parámetros del usuario | `docs/00-progress-log.md`, `docs/00-orchestrator-report.md` |
| 1 | `01-code-extractor` | Código fuente + requisitos (opcional) | `docs/01-inventario-fuentes.md` |
| 2 | `02-user-story-inventory` | `docs/01-inventario-fuentes.md` | `docs/02-inventario-historias-usuario.md` |
| 3 | `03-test-scenarios` | `docs/02-inventario-historias-usuario.md` | `docs/03-escenarios-y-casos.md` |
| 4 | `04-business-rules` | `docs/01`, `docs/02` | `docs/04-reglas-de-negocio.md` |
| 5 | `05-traceability-matrix` | `docs/01`, `docs/02`, `docs/03`, `docs/04` | `docs/05-matriz-trazabilidad.md` |
| 6 | `06-test-plan` | `docs/02`, `docs/03`, `docs/04`, `docs/05` | `docs/06-plan-de-pruebas.md` |
| 7 | `07-test-strategy` | `docs/06`, `docs/05` | `docs/07-estrategia-de-pruebas.md` |

Detalle de entradas, salidas, reglas, plantilla y *definition of done* de cada skill: `ai/skills/<NN>-<nombre>/SKILL.md`.
Orden de ejecución, dependencias y puntos de validación: [`ai/skills/00-orchestrator/flow.md`](00-orchestrator/flow.md).

---

## Cómo ejecutar

| Objetivo | Prompt a usar |
| :--- | :--- |
| Generar este sistema de skills (ya hecho) | `ai/system-prompts/00-bootstrap-skills.prompt.md` |
| Ejecutar el flujo completo (SKILL 1 → 7) | `ai/system-prompts/01-run-orchestrator.prompt.md` |
| Ejecutar una única skill | `ai/system-prompts/02-run-single-skill.prompt.md` |

### Parámetros del orquestador

| Parámetro | Descripción | Por defecto |
| :--- | :--- | :--- |
| `PROJECT_ROOT` | Ruta del código a analizar | `./` |
| `DOCS_DIR` | Carpeta de artefactos | `./docs/` |
| `EVIDENCE_DIR` | Carpeta de evidencias | `./evidence/` |
| `REQUIREMENTS_FILE` | Requisitos explícitos (opcional) | `null` |
| `START_SKILL` | Skill inicial | `1` |
| `STOP_SKILL` | Skill final | `7` |
| `DRY_RUN` | Simula sin escribir artefactos | `false` |
| `STRICT_MODE` | Detiene el flujo ante cualquier falta de fuente | `true` |
| `OVERWRITE` | Sobrescribe la salida existente (modo single-skill) | `false` |

---

## Estructura de carpetas

```text
ai/
├── skills/                          # Este sistema de skills
│   ├── README.md
│   ├── 00-orchestrator/
│   │   ├── SKILL.md
│   │   └── flow.md
│   ├── 01-code-extractor/SKILL.md
│   ├── 02-user-story-inventory/SKILL.md
│   ├── 03-test-scenarios/SKILL.md
│   ├── 04-business-rules/SKILL.md
│   ├── 05-traceability-matrix/SKILL.md
│   ├── 06-test-plan/SKILL.md
│   └── 07-test-strategy/SKILL.md
├── system-prompts/                  # Prompts operativos
│   ├── 00-bootstrap-skills.prompt.md
│   ├── 01-run-orchestrator.prompt.md
│   └── 02-run-single-skill.prompt.md
├── clients/                         # Cliente LLM y mock
├── mocks/
├── prompts/
└── services/

docs/                                # Artefactos generados por las skills
├── 00-progress-log.md
├── 00-orchestrator-report.md
├── 01-inventario-fuentes.md
├── 02-inventario-historias-usuario.md
├── 03-escenarios-y-casos.md
├── 04-reglas-de-negocio.md
├── 05-matriz-trazabilidad.md
├── 06-plan-de-pruebas.md
└── 07-estrategia-de-pruebas.md

evidence/                            # Evidencias: screenshots, videos, CI, reports
reports/                             # Reportes de ejecución: html, junit, ai-analysis
```

---

## Estado actual

Las skills están **definidas pero no ejecutadas**. Todos los artefactos en `docs/` son *placeholders*: contienen el encabezado y la marca `Pendiente por generar`, sin contenido inventado.

Para pasar de infraestructura a contenido, ejecuta [`ai/system-prompts/01-run-orchestrator.prompt.md`](../system-prompts/01-run-orchestrator.prompt.md) o invoca la SKILL 1 directamente.
