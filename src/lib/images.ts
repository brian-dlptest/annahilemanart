import type { ImageMetadata } from 'astro';

const modules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/**/*.{jpg,jpeg,png,gif,webp}',
  { eager: false },
);

export async function resolveImage(filename: string): Promise<ImageMetadata> {
  const key = `/src/assets/images/${filename}`;
  const loader = modules[key];
  if (!loader) {
    throw new Error(`Image not found: ${filename}. Check src/assets/images/.`);
  }
  return (await loader()).default;
}
