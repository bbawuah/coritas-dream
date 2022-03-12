"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const schema_1 = require("@colyseus/schema");
const THREE = __importStar(require("three"));
class Player extends schema_1.Schema {
    constructor(id, physics) {
        super();
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.id = '';
        this.timestamp = 0;
        this.playerSpeed = 10;
        this.direction = new THREE.Vector3();
        this.frontVector = new THREE.Vector3();
        this.sideVector = new THREE.Vector3();
        this.upVector = new THREE.Vector3(0, 1, 0);
        this.movement = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            idle: false,
        };
        this.x = Math.floor(Math.random() * 6) + 1;
        this.y = 1;
        this.z = Math.floor(Math.random() * 6) + 1;
        this.id = id;
        this.physicalBody = physics.createPlayerPhysics(this); // Create phyisical represenatation of player
        physics.physicsWorld.addBody(this.physicalBody);
    }
    handleUserDirection(angle) {
        this.frontVector.setZ(Number(this.movement.backward) - Number(this.movement.forward));
        this.sideVector.setX(Number(this.movement.left) - Number(this.movement.right));
        this.direction
            .subVectors(this.frontVector, this.sideVector)
            .normalize()
            .multiplyScalar(this.playerSpeed)
            .applyAxisAngle(this.upVector, angle);
        this.physicalBody.velocity.set(this.direction.x, this.physicalBody.velocity.y, this.direction.z);
        // Misschien position in een array pushen?
        this.x = this.physicalBody.position.x;
        this.y = this.physicalBody.position.y;
        this.z = this.physicalBody.position.z;
    }
}
__decorate([
    (0, schema_1.type)('number')
], Player.prototype, "x", void 0);
__decorate([
    (0, schema_1.type)('number')
], Player.prototype, "y", void 0);
__decorate([
    (0, schema_1.type)('number')
], Player.prototype, "z", void 0);
__decorate([
    (0, schema_1.type)('string')
], Player.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)('number')
], Player.prototype, "timestamp", void 0);
exports.Player = Player;
