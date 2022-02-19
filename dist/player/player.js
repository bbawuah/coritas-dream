"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const schema_1 = require("@colyseus/schema");
class Player extends schema_1.Schema {
    constructor() {
        super();
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.x = Math.floor(Math.random() * 6) + 1;
        this.y = 0.5;
        this.z = Math.floor(Math.random() * 6) + 1;
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
exports.Player = Player;
