---
name: 02-user-story-inventory
description: Convierte el inventario de fuentes en un inventario funcional de historias de usuario verificables, con condiciones, reglas de negocio y criterios de aceptación citadas. Úsala como fase 2 del pipeline de QA.
artifact: skill-02-user-story-inventory
version: 1.0.0
generated_by: SKILL-00 (bootstrap-skills)
date: 2026-09-26
sources:
  - ai/system-prompts/00-bootstrap-skills.prompt.md
---

# SKILL 2: INVENTARIO DE HISTORIAS DE USUARIO

## Propósito

Convertir las fuentes de la Skill 1 en un inventario funcional de historias de usuario **verificables**, donde cada condición, regla y criterio de aceptación tenga su fuente.

## Entradas (inputs)

| Entrada | Requerida | Notas |
| :--- | :--- | :--- |
| `./docs/01-inventario-fuentes.md` | Sí | Debe cumplir su definition of done |

## Salidas (outputs)

| Artefacto | Contenido |
| :--- | :--- |
| `./docs/02-inventario-historias-usuario.md` | Historias US-XXX + reglas RN-XXX + criterios CA-XXX + pendientes |

## Dependencias

- **SKILL 1** (`docs/01-inventario-fuentes.md`). Si falta o no cumple su DoD, detenerse.

## Reglas específicas

1. **Una historia sin fuente NO se incluye.** Va a la sección "Pendientes de validar" con su vacío asociado.
2. **Cada condición, regla y criterio debe tener fuente.** Sin `[FUENTE: ...]` no es válido.
3. **No fusionar historias distintas bajo un mismo ID.** Si dos comportamientos no comparten propósito, son dos US.
4. **Atomicidad:** una historia describe **una** capacidad verificable del usuario/rol.
5. **Rol respaldado:** el "Como [rol]" debe derivarse del código (permisos, guards, tipos de usuario) o de un requisito; si no se puede determinar, se usa `[PENDIENTE DE VALIDAR: rol no determinado]` y la historia queda como tal.
6. **Condiciones verificables observables:** nada de "el sistema funciona bien". Cada condición debe poder comprobarse con una aserción concreta.
7. **IDs correlativos y estables:** `US-XXX`, `CA-XXX`, `RN-XXX`. No reutilices IDs ni los renumeres al re-ejecutar.
8. **Reglas de negocio:** solo si están respaldadas por fuente. Marca su comprobabilidad preliminar (`Sí` / `Por confirmar`); la consolidación formal es trabajo de la SKILL 4.
9. **Trazabilidad de ida y vuelta:** cada historia referencia los `FUENTE-XXX` de la Skill 1 y cada `FUENTE-XXX` debe ser usado por al menos una historia o quedar Justificado como no Functional.
10. **Idioma:** español, salvo identificadores, rutas y términos técnicos.

## Plantilla de salida en Markdown

```markdown
---
artifact: user-story-inventory
version: 0.1.0
generated_by: SKILL-02
date: YYYY-MM-DD
sources: [docs/01-inventario-fuentes.md]
---

# 02 — Inventario de historias de usuario

## Resumen
| Métrica | Valor |
| :--- | :--- |
| Historias validadas | X |
| Historias pendientes de validar | Y |
| Criterios de aceptación | Z |
| Reglas de negocio | W |

### US-001: [Título]
- **Como** [rol] **quiero** [acción] **para** [beneficio].
- **Fuente:** [FUENTE: ruta:línea] o [FUENTE: requisito proporcionado por el usuario, YYYY-MM-DD]
- **Condiciones verificables:**
  - [ ] Condición 1
  - [ ] Condición 2
- **Reglas de negocio comprobables:** (solo si están respaldadas por fuente)
  - RN-001: [regla] [FUENTE: ...]
- **Criterios de aceptación:**
  - CA-001: Dado [contexto] cuando [acción] entonces [resultado] [FUENTE: ...]
- **Estado:** Validada / Pendiente de validar

## Pendientes de validar
| ID provisional | Descripción | Vacío de origen |
| :--- | :--- | :--- |

## Fuentes no usadas
| FUENTE-XXX | Motivo |
| :--- | :--- |
```

## Criterios de "listo" (definition of done)

- [ ] El archivo `./docs/02-inventario-historias-usuario.md` existe con encabezado completo.
- [ ] Cada historia tiene la estructura completa: Como/quiero/para, Fuente, Condiciones verificables, Criterios de aceptación y Estado.
- [ ] Cada historia tiene al menos un criterio de aceptación con fuente.
- [ ] Cada historia tiene al menos una condición verificable observable.
- [ ] Existe la sección de resumen con métricas.
- [ ] Existe la sección "Pendientes de validar" (puede estar vacía, pero debe existir).
- [ ] Existe la sección "Fuentes no usadas" con justificación.
- [ ] Ninguna historia carece de `[FUENTE: ...]`.
- [ ] No hay dos historias distintas fusionadas bajo un mismo ID.
