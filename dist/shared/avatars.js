"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomAvatar = exports.AVATAR_MODELS = void 0;
exports.AVATAR_MODELS = [
    '/avatars/character-1.glb',
    '/avatars/character-2.glb',
    '/avatars/character-3.glb',
];
function getRandomAvatar() {
    return exports.AVATAR_MODELS[Math.floor(Math.random() * exports.AVATAR_MODELS.length)];
}
exports.getRandomAvatar = getRandomAvatar;
