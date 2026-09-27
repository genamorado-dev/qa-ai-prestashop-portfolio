---
name: TSK-03-contrato-api
description: Analiza un contrato OpenAPI (YAML o JSON) endpoint por endpoint y documenta la validación del request, los casos negativos derivados del esquema, los códigos de error declarados, los headers, el esquema de autenticación y las validaciones sugeridas. Úsala cuando exista un contrato de API y se necesiten casos de prueba de interfaz o una revisión del contrato.
artifact: skill-tsk-03-contrato-api
version: 1.0.0
generated_by: TSK-00 (bootstrap-qa-task-skills)
date: 2026-09-27
sources:
  - ai/system-prompts/03-run-repetitive-tasks-skill.prompt.md
---

# TSK-03: CONTRATO API (OPENAPI)

## Propósito

Leer un contrato OpenAPI y extraer, por cada endpoint de interés, lo que la API promete: parámetros, esquema del cuerpo, respuestas, códigos de error, headers, autenticación y restricciones. A partir de esas promesas genera los casos negativos que el contrato **no** cubre y las validaciones que deberían existir, sin asumir el comportamiento real del servicio. El resultado es un documento de revisión del contrato, no una colección de peticiones reales.

## Cuándo usarla (disparadores)

- Existe un archivo OpenAPI en el repositorio y se va a construir o revisar la suite de pruebas de API.
- El equipo pide "revisemos el contrato", "qué falta probar en este endpoint" o "genera casos negativos para la API".
- Hay un cambio en el contrato y se necesita el impacto sobre las pruebas.
- Un caso de API falla de forma inexplicable y se sospecha de una discrepancia con el contrato.
- Antes de automatizar endpoints, para no codificar tests sobre un contrato incorrecto.

## Entradas (inputs)

| Entrada | Requerida | Notas |
| :--- | :--- | :--- |
| Ruta al archivo OpenAPI (`.yaml` / `.yml` / `.json`) | Sí | Parámetro `OPENAPI_FILE` |
| Lista de endpoints de interés | No | Parámetro `ENDPOINTS`; si se omite, se procesan todos y se declara `[PENDIENTE DE VALIDAR]` el alcance |
| Referencias externas (`$ref`) | No | Parámetro `REFS_DIR`; deben resolverse o el hallazgo se marca `[BLOQUEADO]` |
| Implementación del endpoint (código) | No | Parámetro `IMPL_PATH`; solo para contrastar, nunca como fuente primaria |

## Salidas (outputs)

| Artefacto | Contenido |
| :--- | :--- |
| `./docs/tasks/TSK-03-contrato-api.md` | Ficha por endpoint + casos negativos propuestos + gaps de contrato + bloqueos |

## Dependencias

- Ninguna interna. Es la única `TSK-XX` que puede ejecutarse sin artefactos previos de `docs/`.
- Alimenta a: `TSK-05` (análisis de fallos, para contrastar el fallo con lo declarado), `TSK-02` (casos de prueba de API).

## Proceso paso a paso

1. **Verificar el contrato.** Comprueba que `OPENAPI_FILE` existe y es legible. Detecta el formato y anótalo con fuente. Si está ausente: detén y reporta `[BLOQUEADO: falta OPENAPI_FILE]`.
2. **Resolver referencias.** Recorre los `$ref`. Para cada uno: si el destino existe en el archivo o en `REFS_DIR`, resuélvelo; si no, registra el endpoint afectado como `[BLOQUEADO: $ref no resoluble → <ruta>]`. No inventes el esquema resuelto.
3. **Registrar el alcance.** Declara la versión declarada en el documento (`openapi:` / `swagger:`), el título, los servidores y el esquema de seguridad global. Todo con `[FUENTE: <archivo>#<ruta-json-pointer>]`.
4. **Procesar cada endpoint de interés** con el mismo guion fijo:
   1. **Identificación:** método + ruta + `operationId`/`summary` declarados.
   2. **Autenticación:** qué esquema aplica (path/operation/global) y qué exige realmente el contrato.
   3. **Entrada:** parámetros de path, query, header, cookie y cuerpo; para cada uno: tipo, obligatoriedad, formato, enum, mínimo/máximo, longitud y patrón declarado.
   4. **Salida:** para cada código de respuesta declarado, el esquema de la respuesta y sus campos obligatorios.
   5. **Casos negativos derivados del esquema:** por cada restricción, el caso que la viola. Tabla obligatoria.
   6. **Códigos de error ausentes:** qué errores típicos (400, 401, 403, 404, 409, 422, 429, 500) **no** están declarados pese a existir una ruta de fallo derivable del esquema.
   7. **Headers:** los requeridos y los de respuesta declarados, y los ausentes en operaciones con estado de error.
   8. **Observaciones de contrato:** ambigüedades, campos sin `description`, `example` faltantes, esquemas `any` o sin `type`, `required` incompletos.
5. **Consolidar los gaps** en una tabla única ordenada por severidad.
6. **Emitir el informe** con la plantilla de salida.

## Reglas específicas

1. **El contrato es la única fuente primaria.** Todo lo afirmado se cita con su json-pointer: `[FUENTE: docs/api/openapi.yaml#/paths/~1cart~1{productId}/post]`. Si algo no está en el contrato, no se documenta como comportamiento: va a `[PENDIENTE DE VALIDAR]` o `[SIN FUENTE]`.
2. **No executes peticiones reales.** Esta skill es documental. Si el usuario pide llamadas, corresponde a otro flujo y debes decirlo.
3. **Casos negativos anclados a una restricción.** Solo se propone un caso negativo si existe una restricción en el esquema (required, type, min, max, enum, pattern, format, minLength). Sin restricción no hay caso negativo derivable, y eso mismo es un hallazgo de contrato.
4. **No inventes códigos de error.** Si el contrato declara solo `200`, no escribas "debería devolver 404" como si fuera un hecho: escríbelo en la tabla de errores ausentes, marcado `[PENDIENTE DE VALIDAR]`.
5. **Un caso negativo por restricción violada.** No generes variantes de redacción ni combinaciones de múltiples violaciones salvo que se marquen explícitamente como caso combinado.
6. **Autenticación explícita.** Si una operación no declara seguridad y el global tampoco, es un hallazgo de severidad Alta: `[FUENTE: <archivo>#<ruta>]`.
7. **Severidades:**

   | Severidad | Criterio |
   | :--- | :--- |
   | **Bloqueante** | El contrato no permite escribir un caso con resultado esperado inequívoco. |
   | **Alta** | Falta una respuesta de error relevante o la operación no declara autenticación. |
   | **Media** | Campo sin `description`, sin `example`, esquema sin restricciones o `required` incompleto. |
   | **Baja** | Mejora de claridad o de ejemplo de respuesta. |

8. **Aislamiento.** Escribe únicamente en `docs/tasks/TSK-03-contrato-api.md`. No modifiques el contrato: si crees que está mal, lo reportas, no lo arreglas.
9. **Idempotencia.** El procesamiento sigue el orden de aparición de los `paths` en el documento y, dentro de cada uno, el orden de los métodos tal como aparecen.
10. **Markdown puro.** Sin JSON ni YAML generado como salida; el contrato se **cita**, no se reescribe.
11. **Idioma:** español, salvo rutas, identificadores y términos técnicos.

## Plantilla de salida en Markdown

```markdown
---
artifact: tsk-03-contrato-api
version: 0.1.0
generated_by: TSK-03
date: YYYY-MM-DD
sources: [docs/api/openapi.yaml]
---

# TSK-03 — Revisión de contrato API

## Alcance del contrato
| Propiedad | Valor | Fuente |
| :--- | :--- | :--- |
| Especificación | openapi 3.0.3 | [FUENTE: docs/api/openapi.yaml#/openapi] |
| Título | ... | [FUENTE: ...] |
| Servidores | ... | [FUENTE: ...] |
| Seguridad global | ... | [FUENTE: ...] |
| Endpoints totales / procesados | X / Y | [FUENTE: ...] |

## Endpoints revisados

### POST /cart/{productId}
- **Operation ID:** [FUENTE: docs/api/openapi.yaml#/paths/.../post/operationId]
- **Autenticación:** bearer, ámbito `cart:write` — [FUENTE: ...]

#### Entrada
| Ubicación | Nombre | Tipo | Obligatorio | Restricciones | Fuente |
| :--- | :--- | :--- | :--- | :--- | :--- |
| path | productId | integer | Sí | format: int32 | [FUENTE: ...] |
| query | quantity | integer | No | minimum: 1, maximum: 99 | [FUENTE: ...] |
| body | — | object | Sí | required: [sku] | [FUENTE: ...] |

#### Respuestas declaradas
| Código | Descripción | Esquema | Campos obligatorios | Fuente |
| :--- | :--- | :--- | :--- | :--- |
| 200 | Carrito actualizado | Cart | id, total | [FUENTE: ...] |

#### Casos negativos propuestos
| ID | Restricción violada | Datos | Respuesta esperada | Fuente de la restricción | Marca |
| :--- | :--- | :--- | :--- | :--- | :--- |
| API-N01 | `quantity` fuera de rango | quantity=0 | [PENDIENTE DE VALIDAR] | [FUENTE: ...] | [PENDIENTE DE VALIDAR] |

#### Errores declarados ausentes
| Código no declarado | Ruta de fallo derivable del esquema | Fuente |
| :--- | :--- | :--- |
| 404 | `productId` no encontrado (path param sin `enum` ni validación) | [FUENTE: ...] |

## Gaps de contrato
| ID | Endpoint | Gap | Severidad | Recomendación | Fuente |
| :--- | :--- | :--- | :--- | :--- | :--- |

## Referencias no resueltas
| $ref | Endpoint afectado | Efecto | Marca |
| :--- | :--- | :--- | :--- |
| #/components/schemas/Cart | POST /cart | Esquema de respuesta no analizable | [BLOQUEADO: $ref no resoluble] |

## Bloqueos
- [BLOQUEADO: ...]
```

## Criterios de "listo" (definition of done)

- [ ] `./docs/tasks/TSK-03-contrato-api.md` existe con encabezado completo.
- [ ] El alcance del contrato declara especificación, título, servidores y seguridad global, cada uno con `[FUENTE: ...]`.
- [ ] Cada endpoint procesado tiene ficha con entrada, respuestas declaradas, casos negativos propuestos y errores ausentes.
- [ ] Cada caso negativo propuesto cita la restricción del esquema que lo origina.
- [ ] Cada afirmación sobre el contrato tiene `[FUENTE: <archivo>#<json-pointer>]`.
- [ ] Las `$ref` no resueltas están listadas y los endpoints afectados marcados `[BLOQUEADO: ...]`.
- [ ] El archivo OpenAPI de entrada no ha sido modificado.
- [ ] Ninguna petición real se ha ejecutado.

## Ejemplos de invocación

| Objetivo | Invocación |
| :--- | :--- |
| Revisión completa del contrato | `Ejecuta TSK-03 con OPENAPI_FILE=./docs/api/openapi.yaml sobre todos los endpoints` |
| Endpoints concretos | `Ejecuta TSK-03 con OPENAPI_FILE=./openapi.yaml y ENDPOINTS=["POST /cart","GET /orders/{id}"]` |
| Solo gaps del contrato | `Ejecuta TSK-03 y concéntrate en la sección de gaps de contrato y errores ausentes` |
| Con esquema externo | `Ejecuta TSK-03 con REFS_DIR=./docs/api/components` |
