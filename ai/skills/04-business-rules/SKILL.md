---
name: 04-business-rules
description: Consolida y valida las reglas de negocio extraídas del código y los requisitos, clasificando si son comprobables y cómo se verifican, y vincularlas a las historias afectadas. Úsala como fase 4 del pipeline de QA.
artifact: skill-04-business-rules
version: 1.0.0
generated_by: SKILL-00 (bootstrap-skills)
date: 2026-09-26
sources:
  - ai/system-prompts/00-bootstrap-skills.prompt.md
---

# SKILL 4: REGLAS DE NEGOCIO COMPROBABLES

## Propósito

Consolidar y validar las reglas de negocio extraídas del código y de los requisitos, asegurando que sean **comprobables** y eliminando duplicados.

## Entradas (inputs)

| Entrada | Requerida | Notas |
| :--- | :--- | :--- |
| `./docs/02-inventario-historias-usuario.md` | Sí | Aporta las reglas por historia |
| `./docs/01-inventario-fuentes.md` | Sí | Aporta la evidencia en código |

## Salidas (outputs)

| Artefacto | Contenido |
| :--- | :--- |
| `./docs/04-reglas-de-negocio.md` | Catálogo RN-XXX con comprobabilidad, método de verificación e historias afectadas |

## Dependencias

- **SKILL 1** y **SKILL 2**.

## Reglas específicas

1. **Consolidar, no duplicar.** Si dos fuentes expresan la misma regla, se fusiona en un único `RN-XXX` con **todas** las fuentes listadas. No repitas reglas con distinto ID.
2. **Criterio de comprobabilidad:** una regla es `Sí` comprobable si puede verificarse con una aserción observable en la interfaz, la API, la base de datos o un test automatizado. Si requiere juicio humano, inspección de logs no automatizable o información no expuesta, es `No` y se explica el porqué.
3. **Reglas no comprobables:** márcalas y **exclúyelas del plan de pruebas** (SKILL 6). No las presentes como cobertura.
4. **Cómo se verifica:** describe el mecanismo concreto (pasos, aserción, endpoint, query). Nada de "se comprueba manualmente" sin más detalle.
5. **Historias afectadas:** cada regla lista al menos un `US-XXX`. Una regla sin historia afectada es `[PENDIENTE DE VALIDAR]` (posible funcionalidad no inventariada).
6. **Sin invención:** no deduzcas reglas implícitas (p. ej. "el stock no puede ser negativo" si el código no lo restringe). Si la regla es una expectativa del usuario sin respaldo, va a la sección de reglas pendientes.
7. **Reglas por contradiction:** si dos fuentes se contradicen, no decidas: documenta la contradicción y marca `[BLOQUEADO: reglas contradictorias]` con ambas fuentes.
8. **Idioma:** español, salvo identificadores, rutas y términos técnicos.

## Plantilla de salida en Markdown

```markdown
---
artifact: business-rules
version: 0.1.0
generated_by: SKILL-04
date: YYYY-MM-DD
sources: [docs/01-inventario-fuentes.md, docs/02-inventario-historias-usuario.md]
---

# 04 — Reglas de negocio comprobables

## Resumen
| Métrica | Valor |
| :--- | :--- |
| Reglas totales | X |
| Reglas comprobables | Y |
| Reglas no comprobables | Z |
| Reglas consolidadas (fusionadas) | W |

### RN-001: [Nombre de la regla]
- **Descripción:** [...]
- **Comprobable:** Sí / No
- **Cómo se verifica:** [...]
- **Historias afectadas:** US-001, US-002
- **Fuente:** [FUENTE: ruta:línea], [FUENTE: ...]

## Reglas no comprobables (excluidas del plan de pruebas)
| ID | Regla | Motivo | Fuente |
| :--- | :--- | :--- | :--- |

## Contradicciones detectadas
| Regla A | Regla B | Fuentes | Estado |
| :--- | :--- | :--- | :--- |

## Reglas pendientes de validar
| Descripción | Origen | Vacío |
| :--- | :--- | :--- |

## Trazabilidad regla ↔ historia
| Regla | Historias | CriteriosAcceptación |
| :--- | :--- | :--- |
```

## Criterios de "listo" (definition of done)

- [ ] El archivo `./docs/04-reglas-de-negocio.md` existe con encabezado completo.
- [ ] Existe el resumen con métricas de reglas totales, comprobables, no comprobables y consolidadas.
- [ ] Cada `RN-XXX` tiene Descripción, Comprobable (Sí/No), Cómo se verifica, Historias afectadas y Fuente.
- [ ] Ninguna regla está duplicada: las fusionadas conservan todas sus fuentes.
- [ ] Las reglas no comprobables están en su propia sección y marcadas para exclusión del plan.
- [ ] Las contradicciones están documentadas sin resolverlas por suposición.
- [ ] Toda regla tiene al menos una historia afectada o está marcada como pendiente.
