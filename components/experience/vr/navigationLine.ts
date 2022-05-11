import * as THREE from 'three';

export class NavigationLine {
  public lineSegments: number = 10;
  public lineGeometryVertices: Float32Array = new Float32Array(
    (this.lineSegments + 1) * 3
  );
  public lineGeometryColors: Float32Array = new Float32Array(
    (this.lineSegments + 1) * 3
  );
  public bufferGeometry: THREE.BufferGeometry = new THREE.BufferGeometry();
  public guideline: THREE.Line;
  public guideLineMaterial: THREE.LineBasicMaterial =
    new THREE.LineBasicMaterial({
      blending: THREE.AdditiveBlending,
      linewidth: 10,
    });

  constructor(scene: THREE.Scene, color: THREE.ColorRepresentation) {
    this.lineGeometryVertices.fill(0);
    this.lineGeometryColors.fill(0.5);

    this.guideLineMaterial.color = new THREE.Color(color);

    this.bufferGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(this.lineGeometryVertices, 3)
    );

    this.guideline = new THREE.Line(
      this.bufferGeometry,
      this.guideLineMaterial
    );

    scene.add(this.guideline);
  }
}
