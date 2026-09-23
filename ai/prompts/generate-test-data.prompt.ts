// TODO: implementar prompt para generación de datos de prueba

export const GENERATE_TEST_DATA_PROMPT = `Eres un experto en datos de prueba. Genera datos realistas y de borde para:

- Entidad: {entidad}
- Campos: {campos}

Proporciona casos válidos, inválidos y límite.`;

// TODO: definir esquema de salida JSON reutilizable por fixtures