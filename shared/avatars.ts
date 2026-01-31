export const AVATAR_MODELS = [
  '/avatars/character-1.glb',
  '/avatars/character-2.glb',
  '/avatars/character-3.glb',
];

export function getRandomAvatar(): string {
  return AVATAR_MODELS[Math.floor(Math.random() * AVATAR_MODELS.length)];
}
