import {
  BufferGeometry,
  Matrix4,
  BufferAttribute,
  Vector3,
  Ray,
  Sphere,
  LineSegments,
  Raycaster,
  ShaderChunk,
  ShaderMaterial,
  UniformsLib,
  Vector2,
  Color,
  Material,
  Intersection,
  ShaderMaterialParameters,
  Mesh,
} from 'three';

export function MeshLineRaycast(
  this: Mesh,
  raycaster: Raycaster,
  intersects: Intersection[]
) {
  const inverseMatrix = new Matrix4();
  const ray = new Ray();
  const sphere = new Sphere();
  const interRay = new Vector3();

  if (!(this instanceof Mesh)) {
    return;
  }
  const geometry = this.geometry;

  // Checking boundingSphere distance to ray
  // TODO should we return here? what should be passed otherwise
  if (!geometry.boundingSphere) return;
  sphere.copy(geometry.boundingSphere);

  sphere.applyMatrix4(this.matrixWorld);

  if (raycaster.ray.intersectSphere(sphere, interRay) === null) {
    return;
  }

  inverseMatrix.getInverse(this.matrixWorld);
  ray.copy(raycaster.ray).applyMatrix4(inverseMatrix);

  const vStart = new Vector3();
  const vEnd = new Vector3();
  const interSegment = new Vector3();
  const step = this instanceof LineSegments ? 2 : 1;

  if (!(this.material instanceof MeshLineMaterial)) {
    throw new Error("Can't raycast without a meshlinematerial");
  }

  // TODO verify, Geometry doesn't have should this only work for
  const index = geometry instanceof BufferGeometry ? geometry.index : null;
  const attributes =
    geometry instanceof BufferGeometry ? geometry.attributes : null;

  // TODO same as above, added attributes !== null
  if (index !== null && attributes !== null) {
    const indices = index.array;
    const positions = attributes.position.array;
    const widths = attributes.width.array;

    const line = raycaster.params.Line;
    // TODO verify, can the line be null here? if so why, and should that throw an error
    if (!line) return;
    for (let i = 0, l = indices.length - 1; i < l; i += step) {
      const a = indices[i];
      const b = indices[i + 1];

      vStart.fromArray(positions, a * 3);
      vEnd.fromArray(positions, b * 3);
      const l2 = this.material.lineWidth;
      const width =
        widths[Math.floor(i / 3)] !== undefined ? widths[Math.floor(i / 3)] : 1;

      const precision = line.threshold + (this.material.lineWidth * width) / 2;
      const precisionSq = precision * precision;

      const distSq = ray.distanceSqToSegment(
        vStart,
        vEnd,
        interRay,
        interSegment
      );

      if (distSq > precisionSq) continue;

      interRay.applyMatrix4(this.matrixWorld); //Move back to world space for distance calculation

      const distance = raycaster.ray.origin.distanceTo(interRay);

      if (distance < raycaster.near || distance > raycaster.far) continue;

      intersects.push({
        distance: distance,
        // What do we want? intersection point on the ray or on the segment??
        // point: raycaster.ray.at( distance ),
        point: interSegment.clone().applyMatrix4(this.matrixWorld),
        index: i,
        face: null,
        // TODO 0 or undefined here?
        faceIndex: 0,
        object: this,
      });
      // make event only fire once
      i = l2;
    }
  }
}

const meshLineFrag = [
  '',
  ShaderChunk.fog_pars_fragment,
  ShaderChunk.logdepthbuf_pars_fragment,
  '',
  'uniform sampler2D map;',
  'uniform sampler2D alphaMap;',
  'uniform float useMap;',
  'uniform float useAlphaMap;',
  'uniform float useDash;',
  'uniform float dashArray;',
  'uniform float dashOffset;',
  'uniform float dashRatio;',
  'uniform float visibility;',
  'uniform float alphaTest;',
  'uniform vec2 repeat;',
  '',
  'varying vec2 vUV;',
  'varying vec4 vColor;',
  'varying float vCounters;',
  '',
  'void main() {',
  '',
  ShaderChunk.logdepthbuf_fragment,
  '',
  '    vec4 c = vColor;',
  '    if( useMap == 1. ) c *= texture2D( map, vUV * repeat );',
  '    if( useAlphaMap == 1. ) c.a *= texture2D( alphaMap, vUV * repeat ).a;',
  '    if( c.a < alphaTest ) discard;',
  '    if( useDash == 1. ){',
  '        c.a *= ceil(mod(vCounters + dashOffset, dashArray) - (dashArray * dashRatio));',
  '    }',
  '    gl_FragColor = c;',
  '    gl_FragColor.a *= step(vCounters, visibility);',
  '',
  ShaderChunk.fog_fragment,
  '}',
].join('\n');

const meshLineVert = [
  '',
  ShaderChunk.logdepthbuf_pars_vertex,
  ShaderChunk.fog_pars_vertex,
  '',
  'attribute vec3 previous;',
  'attribute vec3 next;',
  'attribute float side;',
  'attribute float width;',
  'attribute float counters;',
  '',
  'uniform vec2 resolution;',
  'uniform float lineWidth;',
  'uniform vec3 color;',
  'uniform float opacity;',
  'uniform float sizeAttenuation;',
  '',
  'varying vec2 vUV;',
  'varying vec4 vColor;',
  'varying float vCounters;',
  '',
  'vec2 fix( vec4 i, float aspect ) {',
  '',
  '    vec2 res = i.xy / i.w;',
  '    res.x *= aspect;',
  '	 vCounters = counters;',
  '    return res;',
  '',
  '}',
  '',
  'void main() {',
  '',
  '    float aspect = resolution.x / resolution.y;',
  '',
  '    vColor = vec4( color, opacity );',
  '    vUV = uv;',
  '',
  '    mat4 m = projectionMatrix * modelViewMatrix;',
  '    vec4 finalPosition = m * vec4( position, 1.0 );',
  '    vec4 prevPos = m * vec4( previous, 1.0 );',
  '    vec4 nextPos = m * vec4( next, 1.0 );',
  '',
  '    vec2 currentP = fix( finalPosition, aspect );',
  '    vec2 prevP = fix( prevPos, aspect );',
  '    vec2 nextP = fix( nextPos, aspect );',
  '',
  '    float w = lineWidth * width;',
  '',
  '    vec2 dir;',
  '    if( nextP == currentP ) dir = normalize( currentP - prevP );',
  '    else if( prevP == currentP ) dir = normalize( nextP - currentP );',
  '    else {',
  '        vec2 dir1 = normalize( currentP - prevP );',
  '        vec2 dir2 = normalize( nextP - currentP );',
  '        dir = normalize( dir1 + dir2 );',
  '',
  '        vec2 perp = vec2( -dir1.y, dir1.x );',
  '        vec2 miter = vec2( -dir.y, dir.x );',
  '        //w = clamp( w / dot( miter, perp ), 0., 4. * lineWidth * width );',
  '',
  '    }',
  '',
  '    //vec2 normal = ( cross( vec3( dir, 0. ), vec3( 0., 0., 1. ) ) ).xy;',
  '    vec4 normal = vec4( -dir.y, dir.x, 0., 1. );',
  '    normal.xy *= .5 * w;',
  '    normal *= projectionMatrix;',
  '    if( sizeAttenuation == 0. ) {',
  '        normal.xy *= finalPosition.w;',
  '        normal.xy /= ( vec4( resolution, 0., 1. ) * projectionMatrix ).xy;',
  '    }',
  '',
  '    finalPosition.xy += normal.xy * side;',
  '',
  '    gl_Position = finalPosition;',
  '',
  ShaderChunk.logdepthbuf_vertex,
  ShaderChunk.fog_vertex &&
    '    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
  ShaderChunk.fog_vertex,
  '}',
].join('\n');

interface GeometryAttributes {
  position: BufferAttribute;
  previous: BufferAttribute;
  next: BufferAttribute;
  side: BufferAttribute;
  width: BufferAttribute;
  uv: BufferAttribute;
  index: BufferAttribute;
  counters: BufferAttribute;
}

function memcpy(
  srcIn: Float32Array | ArrayLike<number>,
  srcOffset: number,
  length: number
): Float32Array {
  const dst = new Float32Array(length);
  for (let i = 0; i < srcIn.length; i++) {
    dst[i] = srcIn[i + srcOffset];
  }
  return dst;
}
// TODO ShaderMaterialParameters deprecated, find a replacement
interface MeshLineMaterialParameters extends ShaderMaterialParameters {
  lineWidth?: number;
  map?: THREE.Texture | null;
  useMap?: number;
  alphaMap?: THREE.Texture | null;
  useAlphaMap?: number;
  color?: Color;
  // TODO changed opacity to lineOpacity, valid change?
  lineOpacity?: number;
  resolution?: Vector2;
  sizeAttenuation?: number;
  dashArray?: number;
  dashOffset?: number;
  dashRatio?: number;
  useDash?: number;
  visibility?: number;
  lineAlphaTest?: number;
  repeat?: Vector2;
}

export class MeshLineMaterial extends ShaderMaterial {
  constructor(parameters?: MeshLineMaterialParameters) {
    super({
      vertexShader: meshLineVert,
      fragmentShader: meshLineFrag,
      uniforms: {
        ...UniformsLib.fog,
        lineWidth: { value: 1 },
        map: { value: null },
        useMap: { value: 0 },
        alphaMap: { value: null },
        useAlphaMap: { value: 0 },
        color: { value: new Color(0xffffff) },
        opacity: { value: 1 },
        resolution: { value: new Vector2(1, 1) },
        sizeAttenuation: { value: 1 },
        dashArray: { value: 0 },
        dashOffset: { value: 0 },
        dashRatio: { value: 0.5 },
        useDash: { value: 0 },
        visibility: { value: 1 },
        alphaTest: { value: 0 },
        repeat: { value: new Vector2(1, 1) },
      },
    });

    // TODO does this work / whats the correct way to do this?
    this.setValues(parameters as ShaderMaterialParameters);
    this.type = 'MeshLineMaterial';
  }

  public copyMaterial(source: MeshLineMaterial) {
    const newMaterial = this.copy(source as Material);
    newMaterial.lineWidth = source.lineWidth;
    newMaterial.map = source.map;
    newMaterial.useMap = source.useMap;
    newMaterial.alphaMap = source.alphaMap;
    newMaterial.useAlphaMap = source.useAlphaMap;
    newMaterial.color.copy(source.color);
    newMaterial.opacity = source.opacity;
    newMaterial.resolution.copy(source.resolution);
    newMaterial.sizeAttenuation = source.sizeAttenuation;
    newMaterial.dashArray = source.dashArray;
    newMaterial.dashOffset = source.dashOffset;
    newMaterial.dashRatio = source.dashRatio;
    newMaterial.useDash = source.useDash;
    newMaterial.visibility = source.visibility;
    newMaterial.alphaTest = source.alphaTest;
    newMaterial.repeat.copy(source.repeat);
    return newMaterial;
  }

  get lineWidth() {
    return this.uniforms.lineWidth.value;
  }
  set lineWidth(value: number) {
    this.uniforms.lineWidth.value = value;
  }

  get map() {
    return this.uniforms.map.value;
  }
  set map(value: THREE.Texture | null) {
    this.uniforms.map.value = value;
  }

  get useMap() {
    return this.uniforms.useMap.value;
  }

  set useMap(value: boolean) {
    this.uniforms.useMap.value = value;
  }

  get alphaMap() {
    return this.uniforms.alphaMap.value;
  }
  set alphaMap(value: THREE.Texture | null) {
    this.uniforms.alphaMap.value = value;
  }

  get useAlphaMap() {
    return this.uniforms.useAlphaMap.value;
  }

  set useAlphaMap(value: boolean) {
    this.uniforms.useAlphaMap.value = value;
  }

  get color() {
    return this.uniforms.color.value;
  }

  set color(value: THREE.Color) {
    this.uniforms.color.value = value;
  }
  // TODO renamed, check if override accessors is possible
  get lineOpacity() {
    return this.uniforms.opacity.value;
  }
  // TODO renamed, check if override accessors is possible
  set lineOpacity(value: number) {
    this.uniforms.opacity.value = value;
  }

  get resolution() {
    return this.uniforms.resolution.value;
  }

  set resolution(value: Vector2) {
    this.uniforms.resolution.value.copy(value);
  }

  get sizeAttenuation() {
    return this.uniforms.sizeAttenuation.value;
  }

  set sizeAttenuation(value: number) {
    this.uniforms.sizeAttenuation.value = value;
  }

  get dashArray() {
    return this.uniforms.dashArray.value;
  }

  set dashArray(value: number) {
    this.uniforms.dashArray.value = value;
    this.useDash = value !== 0 ? 1 : 0;
  }

  get dashOffset() {
    return this.uniforms.dashOffset.value;
  }

  set dashOffset(value: number) {
    this.uniforms.dashOffset.value = value;
  }

  get dashRatio() {
    return this.uniforms.dashRatio.value;
  }

  set dashRatio(value: number) {
    this.uniforms.dashRatio.value = value;
  }

  get useDash() {
    return this.uniforms.useDash.value;
  }

  set useDash(value: number) {
    this.uniforms.useDash.value = value;
  }

  get visibility() {
    return this.uniforms.visibility.value;
  }

  set visibility(value: number) {
    this.uniforms.visibility.value = value;
  }

  // TODO renamed, check if override accessors is possible
  get lineAlphaTest() {
    return this.uniforms.alphaTest.value;
  }

  // TODO renamed, check if override accessors is possible
  set lineAlphaTest(value: number) {
    this.uniforms.alphaTest.value = value;
  }

  get repeat() {
    return this.uniforms.repeat.value;
  }

  set repeat(value: Vector2) {
    this.uniforms.repeat.value.copy(value);
  }
}
type GeometryType = any | BufferGeometry | ArrayLike<number> | Vector3[];

export class MeshLine extends BufferGeometry {
  private positions: number[] = [];
  private previous: number[] = [];
  private next: number[] = [];
  private side: number[] = [];
  private width: number[] = [];
  private indicesArray: number[] = [];
  private uvs: number[] = [];
  private counters: number[] = [];
  private _points: ArrayLike<number> | Vector3[] = [];
  private widthCallback?: (v: number) => number;
  private _attributes?: GeometryAttributes;
  private _geom?: GeometryType;

  constructor() {
    super();
    this.type = 'MeshLine';
    this.positions = [];
  }

  get geom() {
    // TODO Add undefined (or null) to GeometryType and handle that case in setGeometry?
    if (!this._geom) {
      throw new Error('Geometry has not been initialized yet');
    }
    return this._geom;
  }

  get geometry() {
    return this;
  }

  get points() {
    return this._points;
  }

  set points(value: Vector3[] | ArrayLike<number>) {
    this.setPoints(value, this.widthCallback);
  }

  // TODO validate that matrixWorld can be removed
  //public setMatrixWorld(matrixWorld: Matrix4) {
  //  this.matrixWorld = matrixWorld;
  //}

  public advance(position: Vector3) {
    if (!this._attributes) {
      throw new Error('MeshLine error: Attributes has not been created yet');
    }
    const l = this._attributes.position.array.length;

    // PREVIOUS
    const previous = memcpy(this._attributes.position.array, 0, l);

    // POSITIONS
    const positions = memcpy(this._attributes.position.array, 6, l - 6);

    positions[l - 6] = position.x;
    positions[l - 5] = position.y;
    positions[l - 4] = position.z;
    positions[l - 3] = position.x;
    positions[l - 2] = position.y;
    positions[l - 1] = position.z;

    // NEXT
    const next = memcpy(positions, 6, l - 6);

    next[l - 6] = position.x;
    next[l - 5] = position.y;
    next[l - 4] = position.z;
    next[l - 3] = position.x;
    next[l - 2] = position.y;
    next[l - 1] = position.z;

    this._attributes.position.set(positions);
    this._attributes.previous.set(previous);
    this._attributes.next.set(next);

    this._attributes.position.needsUpdate = true;
    this._attributes.previous.needsUpdate = true;
    this._attributes.next.needsUpdate = true;
  }

  private process() {
    const l = this.positions.length / 6;

    this.previous = [];
    this.next = [];
    this.side = [];
    this.width = [];
    this.indicesArray = [];
    this.uvs = [];

    let w, v;

    // initial previous points
    if (this.compareV3(0, l - 1)) {
      v = this.copyV3(l - 2);
    } else {
      v = this.copyV3(0);
    }
    this.previous.push(v[0], v[1], v[2]);
    this.previous.push(v[0], v[1], v[2]);

    for (let j = 0; j < l; j++) {
      // sides
      this.side.push(1);
      this.side.push(-1);

      // widths
      w = 1;
      if (this.widthCallback) {
        w = this.widthCallback(j / (l - 1));
      }

      this.width.push(w);
      this.width.push(w);

      // uvs
      this.uvs.push(j / (l - 1), 0);
      this.uvs.push(j / (l - 1), 1);

      if (j < l - 1) {
        // points previous to poisitions
        v = this.copyV3(j);
        this.previous.push(v[0], v[1], v[2]);
        this.previous.push(v[0], v[1], v[2]);

        // indices
        const n = j * 2;
        this.indicesArray.push(n, n + 1, n + 2);
        this.indicesArray.push(n + 2, n + 1, n + 3);
      }
      if (j > 0) {
        // points after poisitions
        v = this.copyV3(j);
        this.next.push(v[0], v[1], v[2]);
        this.next.push(v[0], v[1], v[2]);
      }
    }

    // last next point
    if (this.compareV3(l - 1, 0)) {
      v = this.copyV3(1);
    } else {
      v = this.copyV3(l - 1);
    }
    this.next.push(v[0], v[1], v[2]);
    this.next.push(v[0], v[1], v[2]);

    // redefining the attribute seems to prevent range errors
    // if the user sets a differing number of vertices
    if (
      !this._attributes ||
      this._attributes.position.count !== this.positions.length
    ) {
      this._attributes = {
        position: new BufferAttribute(new Float32Array(this.positions), 3),
        previous: new BufferAttribute(new Float32Array(this.previous), 3),
        next: new BufferAttribute(new Float32Array(this.next), 3),
        side: new BufferAttribute(new Float32Array(this.side), 1),
        width: new BufferAttribute(new Float32Array(this.width), 1),
        uv: new BufferAttribute(new Float32Array(this.uvs), 2),
        index: new BufferAttribute(new Uint16Array(this.indicesArray), 1),
        counters: new BufferAttribute(new Float32Array(this.counters), 1),
      };
    } else {
      this._attributes.position.copyArray(new Float32Array(this.positions));
      this._attributes.position.needsUpdate = true;
      this._attributes.previous.copyArray(new Float32Array(this.previous));
      this._attributes.previous.needsUpdate = true;
      this._attributes.next.copyArray(new Float32Array(this.next));
      this._attributes.next.needsUpdate = true;
      this._attributes.side.copyArray(new Float32Array(this.side));
      this._attributes.side.needsUpdate = true;
      this._attributes.width.copyArray(new Float32Array(this.width));
      this._attributes.width.needsUpdate = true;
      this._attributes.uv.copyArray(new Float32Array(this.uvs));
      this._attributes.uv.needsUpdate = true;
      this._attributes.index.copyArray(new Uint16Array(this.indicesArray));
      this._attributes.index.needsUpdate = true;
    }

    this.setAttribute('position', this._attributes.position);
    this.setAttribute('previous', this._attributes.previous);
    this.setAttribute('next', this._attributes.next);
    this.setAttribute('side', this._attributes.side);
    this.setAttribute('width', this._attributes.width);
    this.setAttribute('uv', this._attributes.uv);
    this.setAttribute('counters', this._attributes.counters);

    this.setIndex(this._attributes.index);

    this.computeBoundingSphere();
    this.computeBoundingBox();
  }

  public setPoints(
    points: ArrayLike<number> | Vector3[],
    wcb?: (v: number) => number
  ) {
    if (!(points instanceof Float32Array) && !(points instanceof Array)) {
      console.error(
        'ERROR: The BufferArray of points is not instancied correctly.'
      );
      return;
    }
    // as the points are mutated we store them
    // for later retreival when necessary (declaritive architectures)
    this._points = points;
    this.widthCallback = wcb;
    this.positions = [];
    this.counters = [];
    if (points.length && points[0] instanceof Vector3) {
      // could transform Vector3 array into the array used below
      // but this approach will only loop through the array once
      // and is more performant
      for (let j = 0; j < points.length; j++) {
        const p = points[j] as Vector3;
        const c = j / points.length;
        this.positions.push(p.x, p.y, p.z);
        this.positions.push(p.x, p.y, p.z);
        this.counters.push(c);
        this.counters.push(c);
      }
    } else {
      for (let j = 0; j < points.length; j += 3) {
        const pts = points as ArrayLike<number>;
        const c = j / points.length;
        this.positions.push(pts[j], pts[j + 1], pts[j + 2]);
        this.positions.push(pts[j], pts[j + 1], pts[j + 2]);
        this.counters.push(c);
        this.counters.push(c);
      }
    }
    this.process();
  }

  public copyV3(a: number) {
    const aa = a * 6;
    return [this.positions[aa], this.positions[aa + 1], this.positions[aa + 2]];
  }
  public compareV3(a: number, b: number) {
    const aa = a * 6;
    const ab = b * 6;
    return (
      this.positions[aa] === this.positions[ab] &&
      this.positions[aa + 1] === this.positions[ab + 1] &&
      this.positions[aa + 2] === this.positions[ab + 2]
    );
  }
}
