// TODO: implementar prompt para healing de locators que fallan

export const HEAL_LOCATOR_PROMPT = `Eres un experto en locators de Playwright. El siguiente locator falló:

- Página: {pagina}
- Locator original: {locator}
- Error: {error}

Sugiere alternativas robustas.`;

// TODO: incluir contexto del DOM y múltiples alternativas ordenadas por confianza