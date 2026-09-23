// TODO: implementar prompt para análisis de fallos de pruebas

export const ANALYZE_FAILURE_PROMPT = `Eres un analista de QA. Analiza el siguiente fallo de prueba:

- Suite: {suite}
- Test: {test}
- Error: {error}
- Trace/screenshot: {evidencia}

Determina causa raíz y recomendaciones.`;

// TODO: estructurar salida como JSON con causa raíz y sugerencias