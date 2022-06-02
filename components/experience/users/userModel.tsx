import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import * as THREE from 'three';
import { ObjectMap } from '@react-three/fiber';
import { ActionNames, getState, setState } from '../../../store/store';

interface UserModelProps {
  gltf: GLTF | (GLTF & ObjectMap);
}

const animations: Array<ActionNames> = ['fist', 'idle', 'praying', 'walking'];

export class UserModel {
  public controlObject: THREE.Group;
  private animationLoader: GLTFLoader;
  private dracoLoader: DRACOLoader;
  public mixer: THREE.AnimationMixer;
  public activeAction?: THREE.AnimationAction;
  public previousAction?: THREE.AnimationAction;
  public actions!: Record<ActionNames, THREE.AnimationAction>;

  constructor(props: UserModelProps) {
    const { gltf } = props;
    this.animationLoader = new GLTFLoader();
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('draco/');
    this.animationLoader.setDRACOLoader(this.dracoLoader);

    this.controlObject = gltf.scene;

    this.controlObject.traverse((o: any) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });

    this.mixer = new THREE.AnimationMixer(this.controlObject);

    animations.forEach((animation) => {
      this.animationLoader.load(
        `/animations/${animation}.glb`,
        (animationGltf) => {
          const clip = animationGltf.animations[0];
          const action = this.mixer.clipAction(clip);

          this.actions = { ...this.actions, [animation]: action };
        }
      );
    });
  }

  fadeToAction(name: ActionNames, duration: number) {
    this.previousAction = this.activeAction;
    this.activeAction = this.actions[name];

    if (this.previousAction && this.previousAction !== this.activeAction) {
      this.previousAction.fadeOut(duration);
    }

    if (this.activeAction) {
      this.activeAction
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(duration)
        .play();
    }
  }

  createEmoteCallback(name: ActionNames) {
    setState((state) => ({
      ...state,
      animationName: {
        ...state.animationName,
        cb: () => {
          this.fadeToAction(name, 0.2);

          this.mixer.addEventListener('finished', this.restoreState);
        },
      },
    }));
  }

  restoreState() {
    const { animationName } = getState().animationName;
    this.mixer.removeEventListener('finished', this.restoreState);

    this.fadeToAction(animationName, 0.2);
  }
}
