// The deep import in contact.astro (see comment there) bypasses the package's
// typed entry point, so point the subpath at the package root's types.
declare module '@formspree/ajax/dist/index.mjs' {
  export * from '@formspree/ajax';
}
