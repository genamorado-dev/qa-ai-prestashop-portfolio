---
name: 05-traceability-matrix
description: Construye la matriz de trazabilidad que vincula requisitos, historias de usuario, criterios de aceptación, escenarios, casos y reglas de negocio, e identifica huecos de cobertura. Úsala como fase 5 del pipeline de QA.
artifact: skill-05-traceability-matrix
version: 1.0.0
generated_by: SKILL-00 (bootstrap-skills)
date: 2026-09-26
sources:
  - ai/system-prompts/00-bootstrap-skills.prompt.md
---

# SKILL 5: MATRIZ DE TRAZABILIDAD

## Propósito

Construir una matriz que vincule **requisitos ↔ historias ↔ criterios de aceptación ↔ escenarios ↔ casos ↔ reglas de negocio**, y hacer visible la cobertura y sus huecos.

## Entradas (inputs)

| Entrada | Requerida |
| :--- | :--- |
| `./docs/01-inventario-fuentes.md` | Sí |
| `./docs/02-inventario-historias-usuario.md` | Sí |
| `./docs/03-escenarios-y-casos.md` | Sí |
| `./docs/04-reglas-de-negocio.md` | Sí |

## Salidas (outputs)

| Artefacto | Contenido |
| :--- | :--- |
| `./docs/05-matriz-trazabilidad.md` | Matriz principal + huecos + resumen de cobertura |

## Dependencias

- **SKILL 1, 2, 3 y 4.** Es la primera skill que consume todas las anteriores.

## Reglas específicas

1. **Toda fila debe tener al menos una fuente.** Sin `[FUENTE: ...]`, la fila no entra en la matriz.
2. **Huecos marcados con ⚠️.** Requisitos, historias, criterios o reglas sin cobertura se marcan con ⚠️ en la columna `Cobertura`.
3. **Cobertura = existencia de caso.** Una historia solo está cubierta si tiene al menos un `TC-XXX` derivado. Un escenario sin caso no cuenta como cobertura.
4. **Reglas no comprobables:** enlazan su columna pero se marcan como `No comprobable` para que el plan de pruebas las excluya.
5. **Regla de la matriz:** una fila = una combinación coherente. Si una historia tiene 3 casos, la fila aparece 3 veces (una por caso) o se agrupan los casos en la celda; lo que no se permite es dejar celdas vacías sin explicación.
6. **Celdas vacías:** usa `—` o `⚠️` con motivo, nunca celdas en blanco silenciosas.
7. **Resumen de cobertura al final:** % de requisitos cubiertos, % de historias cubiertas, % de criterios cubiertos y listado de huecos detectados. Los porcentajes se calculan sobre los totales reales de las fases anteriores, declarando los denominadores usados.
8. **Sin invención:** la matriz no crea requisitos, historias ni casos que no existan en los artefactos de entrada.
9. **Idioma:** español, salvo identificadores, rutas y términos técnicos.

## Plantilla de salida en Markdown

```markdown
---
artifact: traceability-matrix
version: 0.1.0
generated_by: SKILL-05
date: YYYY-MM-DD
sources: [docs/01, docs/02, docs/03, docs/04]
---

# 05 — Matriz de trazabilidad

## Matriz principal
| Requisito | Historia | Criterio de aceptación | Escenario | Caso | Regla de negocio | Cobertura |
|-----------|----------|------------------------|-----------|------|------------------|-----------|
| REQ-001 | US-001 | CA-001 | TS-001 | TC-001 | RN-001 | ✅ |
| REQ-002 | US-002 | CA-002 | — | — | RN-002 | ⚠️ Sin caso |

## Matriz inversa (caso → historia)
| Caso | Historia | Criterio | Regla | Historia huérfana |
| :--- | :--- | :--- | :--- | :--- |

## Resumen de cobertura
| Entidad | Total | Cubierta | % Cobertura |
| :--- | :--- | :--- | :--- |
| Requisitos | X | Y | Z% |

> Denominadores: X = [fuente del total].

## Huecos detectados
| ID | Tipo | Descripción | Entidad afectada | Impacto | Acción sugerida |
| :--- | :--- | :--- | :--- | :--- | :--- |

## Bloqueos
- [BLOQUEADO: ...]
```

## Criterios de "listo" (definition of done)

- [ ] El archivo `./docs/05-matriz-trazabilidad.md` existe con encabezado completo.
- [ ] La tabla tiene las 7 columnas obligatorias: Requisito, Historia, Criterio de aceptación, Escenario, Caso, Regla de negocio, Cobertura.
- [ ] Todas las filas tienen al menos un `[FUENTE: ...]`.
- [ ] Los requisitos e historias sin cobertura están marcados con ⚠️.
- [ ] Existe la matriz inversa caso → historia.
- [ ] Existe el resumen de cobertura con porcentajes y denominadores declarados.
- [ ] Existe el listado de huecos detectados con impacto.
- [ ] No hay celdas en blanco silenciosas.
