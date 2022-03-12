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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Physics = void 0;
const CANNON = __importStar(require("cannon-es"));
class Physics {
    constructor() {
        this.GROUP1 = 1;
        this.GROUP2 = 2;
        this.physicsWorld = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.82, 0),
        });
        this.physicsWorld.broadphase = new CANNON.SAPBroadphase(this.physicsWorld);
        this.physicsWorld.solver.iterations = 10;
        this.planeBody = new CANNON.Body({
            position: new CANNON.Vec3(0, 0, 0),
            shape: new CANNON.Plane(),
            collisionFilterGroup: this.GROUP2,
            collisionFilterMask: this.GROUP1,
        });
        this.planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        this.physicsWorld.addBody(this.planeBody);
    }
    createPhysics(geometry, object, hasMass) {
        const shape = this.createTrimesh(geometry);
        const body = new CANNON.Body({
            mass: hasMass ? 1 : 0,
            shape: shape,
        });
        body.position.x = object.x;
        body.position.y = object.y;
        body.position.z = object.z;
        return body;
    }
    createPlayerPhysics(object) {
        const body = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(object.x, object.y, object.z),
            shape: new CANNON.Sphere(0.45),
            collisionFilterGroup: this.GROUP1,
            collisionFilterMask: this.GROUP2,
        });
        return body;
    }
    createTrimesh(geometry) {
        const vertices = this.getVertices(geometry);
        const indices = Object.keys(vertices).map(Number);
        return new CANNON.Trimesh(vertices, indices);
    }
    getVertices(geometry) {
        const position = geometry.attributes.position;
        const vertices = new Float32Array(position.count * 3);
        for (let i = 0; i < position.count; i += 3) {
            vertices[i] = position.getX(i);
            vertices[i + 1] = position.getY(i);
            vertices[i + 2] = position.getZ(i);
        }
        return vertices;
    }
    updatePhysics(dt) {
        this.physicsWorld.step(1 / 60, dt, 2);
    }
}
exports.Physics = Physics;
