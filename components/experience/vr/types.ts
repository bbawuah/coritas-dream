import * as THREE from 'three';
import { ActionNames } from '../../../store/store';

export interface XRTeleportationData {
  worldDirection: THREE.Vector3;
  position: THREE.Vector3;
  animationState: ActionNames;
}
