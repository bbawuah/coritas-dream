const fps = 60;
const funcs: any[] = [];

const skip = Symbol('skip');
const start = performance.now();
let time = start;

const animFrame = () => {
  const fns = funcs.slice();
  funcs.length = 0;

  const t = Date.now();
  const dt = t - start;
  const t1 = 1e3 / fps;

  for (const f of fns) if (f !== skip) f(dt);

  while (time <= t + t1 / 4) time += t1;
  setTimeout(animFrame, time - t);
};

export const requestAnimationFrame = (fn: (dt: number) => void) => {
  funcs.push(fn);
  return funcs.length - 1;
};

export const cancelAnimationFrame = (id: number) => {
  funcs[id] = skip;
};

animFrame();
