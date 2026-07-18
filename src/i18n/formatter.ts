export interface TranslateParams {
  [key: string]: unknown;
}

/** Simple template interpolation: "Hello {name}" + {name:"World"} → "Hello World" */
export function interpolate(template: string, params?: TranslateParams): string {
  if (!params || Object.keys(params).length === 0) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = params[key];
    if (value === undefined || value === null) return match;
    return String(value);
  });
}