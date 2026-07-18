/**
 * Ambient type declarations for Figma Make-specific module pragmas.
 *
 * 1. `figma:asset/<hash>.<ext>` — Figma Make returns a URL string.
 *
 * For inline version-pinned specifiers (e.g. `@radix-ui/react-slot@1.1.2`)
 * we resolve them to the installed unversioned package via `paths` mapping
 * in tsconfig.json. See that file for the full list of redirects.
 */

declare module 'figma:asset/*' {
  const src: string;
  export default src;
}

declare module 'figma:asset/*.png' {
  const src: string;
  export default src;
}

declare module 'figma:asset/*.svg' {
  const src: string;
  export default src;
}

declare module 'figma:asset/*.jpg' {
  const src: string;
  export default src;
}

declare module 'figma:asset/*.jpeg' {
  const src: string;
  export default src;
}
