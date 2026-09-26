---
name: 03-test-scenarios
description: Deriva escenarios de prueba positivos, negativos y de valores límite desde el inventario de historias de usuario, con precondiciones, pasos, resultado esperado y criterio de aceptación cubierto. Úsala como fase 3 del pipeline de QA.
artifact: skill-03-test-scenarios
version: 1.0.0
generated_by: SKILL-00 (bootstrap-skills)
date: 2026-09-26
sources:
  - ai/system-prompts/00-bootstrap-skills.prompt.md
---

# SKILL 3: ESCENARIOS DE PRUEBA Y CASOS POSITIVOS/NEGATIVOS

## Propósito

Derivar escenarios de prueba (positivos, negativos y de valores límite) desde el inventario de historias, sin inventar restricciones que el código no respalde.

## Entradas (inputs)

| Entrada | Requerida | Notas |
| :--- | :--- | :--- |
| `./docs/02-inventario-historias-usuario.md` | Sí | Debe cumplir su DoD |

## Salidas (outputs)

| Artefacto | Contenido |
| :--- | :--- |
| `./docs/03-escenarios-y-casos.md` | Escenarios TS-XXX + casos TC-XXX + resumen de cobertura por historia |

## Dependencias

- **SKILL 2** (`docs/02-inventario-historias-usuario.md`).

## Reglas específicas

1. **Cobertura mínima por historia:** cada historia validada debe tener ≥1 caso **positivo**, ≥1 **negativo** y ≥1 de **valor límite** (si aplica).
2. **Justificación de no aplicabilidad:** si un tipo de caso no aplica, debe existir una justificación explícita y con fuente; la ausencia silenciosa es un fallo de la skill.
3. **Valores límite con fuente real:** los límites deben derivarse de restricciones existentes en el código (longitudes máximas, rangos, tipos, obligatoriedad, enums, formatos). Ejemplos: `[FUENTE: src/.../Validator.php:L88]`.
4. **Límites sin fuente:** márcalo como `[SIN FUENTE]` y **exclúyelo del conteo final** de cobertura. No lo conviertas en caso ejecutable.
5. **Cada escenario cuelga de una historia y de un criterio:** `TS-XXX` referencia `US-XXX` y un `CA-XXX` concreto.
6. **Escenario ≠ caso:** `TS-XXX` describe el escenario; `TC-XXX` es un caso concreto y ejecutable derivado de él, con datos y resultado esperado por paso.
7. **Sin casos de bajo valor:** no generes variantes que difieran solo en redacción. Cada caso debe explorar una ruta de código o una partición de equivalencia distinta.
8. **Particiones de equivalencia:** agrupa los casos por partición para que la cobertura sea demostrable.
9. **Idioma:** español, salvo identificadores, rutas y términos técnicos.

## Plantilla de salida en Markdown

```markdown
---
artifact: test-scenarios
version: 0.1.0
generated_by: SKILL-03
date: YYYY-MM-DD
sources: [docs/02-inventario-historias-usuario.md]
---

# 03 — Escenarios y casos de prueba

## Resumen de cobertura por historia
| Historia | Positivos | Negativos | Límite | Justificación si no aplica | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |

### TS-001: [Título] (US-001)
- **Tipo:** Positivo / Negativo / Valor límite
- **Precondiciones:** [...]
- **Pasos:** [...]
- **Resultado esperado:** [...]
- **Criterio de aceptación cubierto:** CA-001
- **Fuente:** [FUENTE: ...]

#### TC-001: [Título del caso] (TS-001)
- **Datos de prueba:** [...]
- **Pasos:**
  1. [paso] → Resultado esperado: [...]
  2. [paso] → Resultado esperado: [...]
- **Resultado final esperado:** [...]
- **Fuente:** [FUENTE: ...]

## Límites derivados del código
| Límite | Valor | Historia | Fuente |
| :--- | :--- | :--- | :--- |

## Límites sin fuente (excluidos del conteo)
| Límite propuesto | Motivo | Marca |
| :--- | :--- | :--- |

## Bloqueos
- [BLOQUEADO: ...]
```

## Criterios de "listo" (definition of done)

- [ ] El archivo `./docs/03-escenarios-y-casos.md` existe con encabezado completo.
- [ ] Existe el resumen de cobertura por historia con el recuento de positivos, negativos y límites.
- [ ] Cada historia validada tiene ≥1 positivo y ≥1 negativo con `TS-XXX` y `TC-XXX` asociados.
- [ ] Cada historia con campo acotado tiene ≥1 caso de valor límite **con fuente**, o justificación de no aplicabilidad.
- [ ] Cada escenario declara Tipo, Precondiciones, Pasos, Resultado esperado, Criterio cubierto y Fuente.
- [ ] Cada caso tiene datos, pasos con resultado esperado por paso y resultado final.
- [ ] Todos los límites de la sección "Límites derivados del código" tienen `[FUENTE: ...]`.
- [ ] Los límites sin fuente están en su propia sección y excluidos del conteo.
