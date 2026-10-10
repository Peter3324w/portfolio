// Prism: the cursor effect over the site's images.
//
// Each image gets a WebGL canvas laid exactly over it (inserted as its next
// sibling, so it inherits every transform, clip and blend the image has) and
// the image itself is hidden once the canvas has drawn it. Every canvas keeps
// its own motion texture, a port of lusion.co's ScreenPaint: each frame it
// stamps a capsule from the pointer's last position to its new one, sized by
// how far it travelled relative to the image (so scrolling under a still
// pointer paints too), then lets the paint flow and fade. Prism reads it and
// pulls red and blue apart along the motion.
//
// One shared rAF loop drives all of them, and only for a few seconds after
// the pointer moves or the page scrolls; at rest nothing runs.
import { CURSOR_FX } from "./cursorFx";

const F = CURSOR_FX.field;
const LOOK = CURSOR_FX.look;
// Long enough for the slowest ink (0.95 a frame) to fade out completely.
const AWAKE_MS = 3500;
const MAX_DPR = 1.5;

const PREC =
  "#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n";
const VERT =
  "attribute vec2 a_pos;varying vec2 v_uv;void main(){v_uv=a_pos*0.5+0.5;gl_Position=vec4(a_pos,0.0,1.0);}";

// lusion's ScreenPaint fragment shader (noise on). Theirs also shifts the old
// paint by the scroll; here the canvas scrolls with its image, so the paint
// already stays put on the content.
const PAINT = `${PREC}
uniform sampler2D u_low; uniform sampler2D u_prev;
uniform vec2 u_texel;
uniform vec4 u_from; uniform vec4 u_to;
uniform float u_push; uniform vec3 u_diss; uniform vec2 u_vel;
uniform float u_curlScale; uniform float u_curlStrength;
varying vec2 v_uv;
vec2 sdSegment(vec2 p, vec2 a, vec2 b){ vec2 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/max(dot(ba,ba),1e-6),0.0,1.0); return vec2(length(pa-ba*h),h); }
vec2 hash(vec2 p){ vec3 p3=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973)); p3+=dot(p3,p3.yzx+33.33); return fract((p3.xx+p3.yz)*p3.zy)*2.0-1.0; }
vec3 noised(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); vec2 u=f*f*f*(f*(f*6.0-15.0)+10.0); vec2 du=30.0*f*f*(f*(f-2.0)+1.0);
  vec2 ga=hash(i); vec2 gb=hash(i+vec2(1.0,0.0)); vec2 gc=hash(i+vec2(0.0,1.0)); vec2 gd=hash(i+vec2(1.0,1.0));
  float va=dot(ga,f); float vb=dot(gb,f-vec2(1.0,0.0)); float vc=dot(gc,f-vec2(0.0,1.0)); float vd=dot(gd,f-vec2(1.0,1.0));
  return vec3(va+u.x*(vb-va)+u.y*(vc-va)+u.x*u.y*(va-vb-vc+vd), ga+u.x*(gb-ga)+u.y*(gc-ga)+u.x*u.y*(ga-gb-gc+gd)+du*(u.yx*(va-vb-vc+vd)+vec2(vb,vc)-va)); }
void main(){
  vec2 res=sdSegment(gl_FragCoord.xy,u_from.xy,u_to.xy);
  vec2 rw=mix(u_from.zw,u_to.zw,res.y);
  float d=1.0-smoothstep(-0.01,rw.x,res.x);
  vec4 low=texture2D(u_low,v_uv);
  vec2 velInv=(0.5-low.xy)*u_push;
  vec3 n3=noised(gl_FragCoord.xy*u_curlScale*(1.0-low.xy));
  vec2 n=noised(gl_FragCoord.xy*u_curlScale*(2.0-low.xy*(0.5+n3.x)+n3.yz*0.1)).yz;
  velInv+=n*(low.z+low.w)*u_curlStrength;
  vec4 data=texture2D(u_prev,v_uv+velInv*u_texel);
  data.xy-=0.5;
  vec4 delta=(u_diss.xxyz-1.0)*data;
  delta+=vec4(u_vel*d,rw.yy*d);
  delta.zw=sign(delta.zw)*max(vec2(0.004),abs(delta.zw));
  data+=delta; data.xy+=0.5;
  gl_FragColor=clamp(data,0.0,1.0);
}`;

const COPY = `${PREC}uniform sampler2D u_texture;varying vec2 v_uv;void main(){gl_FragColor=texture2D(u_texture,v_uv);}`;

const BLUR = `${PREC}uniform sampler2D u_texture; uniform vec2 u_delta; varying vec2 v_uv;
void main(){ vec4 c=texture2D(u_texture,v_uv)*0.2270270270; vec2 o1=u_delta*1.3846153846; vec2 o2=u_delta*3.2307692308;
  c+=texture2D(u_texture,v_uv+o1)*0.3162162162; c+=texture2D(u_texture,v_uv-o1)*0.3162162162;
  c+=texture2D(u_texture,v_uv+o2)*0.0702702703; c+=texture2D(u_texture,v_uv-o2)*0.0702702703; gl_FragColor=c; }`;

// Draws the image the way the <img> does (object-fit cover/contain plus
// object-position), with red and blue sampled apart along the motion. The
// texture is premultiplied, so transparent images (the hero face) split too.
const PRISM = `${PREC}
uniform sampler2D u_image; uniform sampler2D u_field;
uniform vec2 u_box; uniform vec2 u_img; uniform float u_contain; uniform vec2 u_pos;
uniform vec3 u_look;
varying vec2 v_uv;
vec4 img(vec2 uv){
  vec2 box=vec2(uv.x,1.0-uv.y)*u_box;
  float s=u_contain>0.5?min(u_box.x/u_img.x,u_box.y/u_img.y):max(u_box.x/u_img.x,u_box.y/u_img.y);
  vec2 drawn=u_img*s;
  vec2 t=(box-(u_box-drawn)*u_pos)/drawn;
  if(t.x<0.0||t.y<0.0||t.x>1.0||t.y>1.0) return vec4(0.0);
  return texture2D(u_image,t);
}
void main(){
  vec4 d=texture2D(u_field,v_uv); float w=d.z*0.7+d.w*0.3;
  vec2 vel=(0.5-d.xy)*2.0*w;
  vec2 px=1.0/u_box;
  vec2 base=v_uv+vel*u_look.y*px;
  vec2 off=vel*u_look.x*px;
  float s=u_look.z;
  vec4 r1=img(base+off), r2=img(base+off*(1.0-0.3*s)), r3=img(base+off*(1.0-0.6*s));
  vec4 g1=img(base), g2=img(base+off*0.15*s), g3=img(base-off*0.15*s);
  vec4 b1=img(base-off), b2=img(base-off*(1.0-0.3*s)), b3=img(base-off*(1.0-0.6*s));
  float aR=(r1.a+r2.a+r3.a)/3.0, aG=(g1.a+g2.a+g3.a)/3.0, aB=(b1.a+b2.a+b3.a)/3.0;
  gl_FragColor=vec4((r1.r+r2.r+r3.r)/3.0,(g1.g+g2.g+g3.g)/3.0,(b1.b+b2.b+b3.b)/3.0,max(aR,max(aG,aB)));
}`;

type GL = WebGLRenderingContext | WebGL2RenderingContext;
type Target = { tex: WebGLTexture; fb: WebGLFramebuffer; w: number; h: number };
type Program = { p: WebGLProgram; u: Record<string, WebGLUniformLocation | null> };
type Uniform = number | number[] | { tex: WebGLTexture };

/* ── Shared input + loop ── */

/** Where the mouse is (client px) and whether it's over the page. */
export const pointer = { x: -1e4, y: -1e4, inside: false };
type LoopMember = { frame(dt: number): void };
const instances = new Set<LoopMember>();
let lastInput = 0;
let raf = 0;
let lastFrame = 0;

const poke = () => {
  lastInput = performance.now();
  if (!raf) {
    lastFrame = lastInput;
    raf = requestAnimationFrame(loop);
  }
};
const onPointerMove = (e: PointerEvent) => {
  if (e.pointerType !== "mouse") return;
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.inside = true;
  poke();
};
const onPointerOut = (e: MouseEvent) => {
  if (!e.relatedTarget) pointer.inside = false;
};

function loop(now: number) {
  raf = 0;
  const dt = Math.min((now - lastFrame) / 1000, 1 / 20) || 1 / 60;
  lastFrame = now;
  instances.forEach((inst) => inst.frame(dt));
  if (now - lastInput < AWAKE_MS) raf = requestAnimationFrame(loop);
}

function listen(on: boolean) {
  if (on) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", poke, { passive: true });
    window.addEventListener("resize", poke);
    document.addEventListener("mouseout", onPointerOut);
  } else {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("scroll", poke);
    window.removeEventListener("resize", poke);
    document.removeEventListener("mouseout", onPointerOut);
  }
}

/* ── GL helpers ── */

function program(gl: GL, frag: string): Program {
  const shader = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, shader(gl.FRAGMENT_SHADER, frag));
  gl.bindAttribLocation(p, 0, "a_pos");
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "link");
  const u: Program["u"] = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS) as number;
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(p, i);
    if (info) u[info.name] = gl.getUniformLocation(p, info.name);
  }
  return { p, u };
}

function texture(gl: GL) {
  const t = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

/* ── One image ── */

class PrismInstance {
  private canvas: HTMLCanvasElement;
  private gl: GL | null = null;
  private progs: Record<"paint" | "copy" | "blur" | "prism", Program> | null = null;
  private half: { i: number; t: number } | null = null;
  private imageTex: WebGLTexture | null = null;
  private curr: Target | null = null;
  private prev: Target | null = null;
  private low: Target | null = null;
  private lowBlur: Target | null = null;
  private W = 1;
  private H = 1;
  private visible = false;
  private drawn = false;
  private contain = 0;
  private pos: [number, number] = [0.5, 0.5];
  private io: IntersectionObserver;
  private ro: ResizeObserver;
  // Motion texture state (paint px, GL y-up), and the pointer / box last frame.
  private to = [0, 0, 0, 0];
  private from = [0, 0, 0, 0];
  private vel = [0, 0];
  private wasActive = false;
  private px = 0;
  private py = 0;
  private boxX = NaN;
  private boxY = NaN;

  constructor(private img: HTMLImageElement) {
    const c = document.createElement("canvas");
    c.setAttribute("aria-hidden", "true");
    Object.assign(c.style, {
      position: "absolute",
      pointerEvents: "none",
      mixBlendMode: getComputedStyle(img).mixBlendMode,
    });
    img.after(c);
    this.canvas = c;
    c.addEventListener("webglcontextlost", this.onLost);
    this.ro = new ResizeObserver(() => this.layout());
    this.ro.observe(img);
    this.io = new IntersectionObserver(
      ([e]) => {
        this.visible = e.isIntersecting;
        if (this.visible) {
          // It moved while off screen; start the next stroke fresh.
          this.boxX = this.boxY = NaN;
          this.wasActive = false;
          this.init();
          poke();
        }
      },
      { rootMargin: "120px" },
    );
    this.io.observe(c);
    img.addEventListener("load", this.onImageLoad);
  }

  private onLost = () => this.teardownGL();

  private onImageLoad = () => {
    this.uploadImage();
    this.drawn = false;
    poke();
  };

  // Lay the canvas exactly over the image's box.
  private layout() {
    const { img, canvas } = this;
    this.W = Math.max(1, img.offsetWidth);
    this.H = Math.max(1, img.offsetHeight);
    const cs = getComputedStyle(img);
    this.contain = cs.objectFit === "contain" ? 1 : 0;
    const pos = cs.objectPosition.split(" ").map((v) => (v.endsWith("%") ? parseFloat(v) / 100 : 0.5));
    this.pos = [pos[0] ?? 0.5, pos[1] ?? 0.5];
    Object.assign(canvas.style, {
      left: `${img.offsetLeft}px`,
      top: `${img.offsetTop}px`,
      width: `${this.W}px`,
      height: `${this.H}px`,
    });
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.round(this.W * dpr);
    canvas.height = Math.round(this.H * dpr);
    if (this.gl) this.makeTargets();
    this.drawn = false;
    poke();
  }

  private init() {
    if (this.gl) return;
    const opts: WebGLContextAttributes = { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: true };
    const gl = (this.canvas.getContext("webgl2", opts) || this.canvas.getContext("webgl", opts)) as GL | null;
    if (!gl) return;
    try {
      this.progs = { paint: program(gl, PAINT), copy: program(gl, COPY), blur: program(gl, BLUR), prism: program(gl, PRISM) };
    } catch {
      return;
    }
    this.gl = gl;
    const isGL2 = typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;
    const gl2 = gl as WebGL2RenderingContext;
    this.half = isGL2 && gl.getExtension("EXT_color_buffer_float") ? { i: gl2.RGBA16F, t: gl2.HALF_FLOAT } : null;
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    this.imageTex = texture(gl);
    this.uploadImage();
    this.makeTargets();
  }

  private uploadImage() {
    const { gl, img } = this;
    if (!gl || !this.imageTex || !img.complete || !img.naturalWidth) return;
    gl.bindTexture(gl.TEXTURE_2D, this.imageTex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  }

  private target(w: number, h: number): Target {
    const gl = this.gl!;
    const tex = texture(gl);
    const alloc = (half: boolean) =>
      half && this.half
        ? gl.texImage2D(gl.TEXTURE_2D, 0, this.half.i, w, h, 0, gl.RGBA, this.half.t, null)
        : gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    alloc(true);
    const fb = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    if (this.half && gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      this.half = null;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      alloc(false);
    }
    gl.viewport(0, 0, w, h);
    gl.clearColor(0.5, 0.5, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { tex, fb, w, h };
  }

  private makeTargets() {
    const gl = this.gl!;
    [this.curr, this.prev, this.low, this.lowBlur].forEach((t) => {
      if (t) {
        gl.deleteTexture(t.tex);
        gl.deleteFramebuffer(t.fb);
      }
    });
    const pw = Math.max(8, this.W >> 2), ph = Math.max(8, this.H >> 2);
    const lw = Math.max(4, this.W >> 3), lh = Math.max(4, this.H >> 3);
    this.curr = this.target(pw, ph);
    this.prev = this.target(pw, ph);
    this.low = this.target(lw, lh);
    this.lowBlur = this.target(lw, lh);
    this.vel = [0, 0];
    this.wasActive = false;
  }

  private run(prog: Program, target: Target | null, vals: Record<string, Uniform>) {
    const gl = this.gl!;
    gl.useProgram(prog.p);
    let unit = 0;
    for (const k in vals) {
      const loc = prog.u[k];
      if (!loc) continue;
      const v = vals[k];
      if (typeof v === "number") gl.uniform1f(loc, v);
      else if ("tex" in v) {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, v.tex);
        gl.uniform1i(loc, unit++);
      } else if (v.length === 2) gl.uniform2f(loc, v[0], v[1]);
      else if (v.length === 3) gl.uniform3f(loc, v[0], v[1], v[2]);
      else gl.uniform4f(loc, v[0], v[1], v[2], v[3]);
    }
    if (target) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb);
      gl.viewport(0, 0, target.w, target.h);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  frame(dt: number) {
    if (!this.visible || !this.gl || !this.curr || !this.prev || !this.low || !this.lowBlur || !this.progs) return;
    const { img, W, H } = this;
    if (!img.complete || !img.naturalWidth) return;

    // Where the image is on screen right now, and how far it moved since
    // last frame (scroll, parallax, tilt): movement of the content under
    // the pointer counts as the pointer moving.
    const r = this.canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const kx = W / r.width, ky = H / r.height;
    const cx = Number.isNaN(this.boxX) ? 0 : (r.left - this.boxX) * kx;
    const cy = Number.isNaN(this.boxY) ? 0 : (r.top - this.boxY) * ky;
    this.boxX = r.left;
    this.boxY = r.top;
    const x = (pointer.x - r.left) * kx;
    const y = (pointer.y - r.top) * ky;
    const active = pointer.inside;

    const pw = this.curr.w, ph = this.curr.h, sx = pw / W, sy = ph / H;
    [this.prev, this.curr] = [this.curr, this.prev];
    // x, y are in the image's own coordinates, so a still pointer over a
    // scrolling image already travels across it; the content's share of that
    // travel is weighted up to scrollWeight in total, as lusion does.
    this.from = [...this.to];
    const extra = F.scrollWeight - 1;
    const travel = active && this.wasActive
      ? Math.hypot(x - this.px - cx * extra, y - this.py - cy * extra)
      : 0;
    const maxR = Math.max(40, window.innerWidth / 20) * F.radius;
    const radius = Math.min(1, travel / 100) * maxR * sy;
    this.to = [x * sx, (H - y) * sy, radius, 1];
    if (!this.wasActive || !active) this.from = [this.to[0], this.to[1], radius, 1];
    this.wasActive = active;
    this.px = x;
    this.py = y;
    const k = dt * 0.8;
    this.vel = [
      this.vel[0] * 0.8 + (this.to[0] - this.from[0]) * k,
      this.vel[1] * 0.8 + (this.to[1] - this.from[1]) * k,
    ];

    const p = this.progs;
    this.run(p.paint, this.curr, {
      u_low: { tex: this.low.tex },
      u_prev: { tex: this.prev.tex },
      u_texel: [1 / pw, 1 / ph],
      u_from: this.from,
      u_to: this.to,
      u_push: F.push,
      u_diss: [F.velocityFade, F.trailFade, F.coreFade],
      u_vel: this.vel,
      u_curlScale: F.curlScale,
      u_curlStrength: F.curlStrength,
    });
    this.run(p.copy, this.low, { u_texture: { tex: this.curr.tex } });
    this.run(p.blur, this.lowBlur, { u_texture: { tex: this.low.tex }, u_delta: [2 / this.low.w, 0] });
    this.run(p.blur, this.low, { u_texture: { tex: this.lowBlur.tex }, u_delta: [0, 2 / this.low.h] });

    this.run(p.prism, null, {
      u_image: { tex: this.imageTex! },
      u_field: { tex: this.curr.tex },
      u_box: [W, H],
      u_img: [img.naturalWidth, img.naturalHeight],
      u_contain: this.contain,
      u_pos: this.pos,
      u_look: [LOOK.split, LOOK.push, LOOK.blur],
    });
    // The canvas now shows the image; hide the original under it.
    if (!this.drawn) {
      this.drawn = true;
      img.style.opacity = "0";
    }
  }

  private teardownGL() {
    this.gl = null;
    this.progs = null;
    this.curr = this.prev = this.low = this.lowBlur = null;
    this.img.style.opacity = "";
    this.drawn = false;
  }

  destroy() {
    this.io.disconnect();
    this.ro.disconnect();
    this.img.removeEventListener("load", this.onImageLoad);
    this.canvas.removeEventListener("webglcontextlost", this.onLost);
    (this.gl?.getExtension("WEBGL_lose_context") as WEBGL_lose_context | null)?.loseContext();
    this.teardownGL();
    this.canvas.remove();
  }
}

/** Prism is for mouse users who haven't asked for less motion. */
export function prismEnabled() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Joins the shared loop (awake for a few seconds after input). Returns the leave. */
export function joinPrismLoop(member: LoopMember): () => void {
  if (instances.size === 0) listen(true);
  instances.add(member);
  return () => {
    instances.delete(member);
    if (instances.size === 0) {
      listen(false);
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
}

/** Puts Prism over an image. Returns the cleanup. */
export function attachPrism(img: HTMLImageElement): () => void {
  if (!prismEnabled()) return () => {};
  const inst = new PrismInstance(img);
  const leave = joinPrismLoop(inst);
  return () => {
    leave();
    inst.destroy();
  };
}
