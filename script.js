
// ------------------------------------------------------------------------------------------ //
const vsSource = `#version 300 es

layout (location = 0) in vec2 vPosition;
layout (location = 1) in vec3 vColor;

uniform mat4 projView;
out vec3 fColor;

void main()
{
  gl_Position = projView * vec4(vPosition, 0.0, 1.0);
  fColor = vColor;
}`;

const fsSource = `#version 300 es
precision lowp float;

in vec3 fColor;
out vec4 fragColor;

void main()
{
  fragColor = vec4(fColor, 1.0);
}`;

// ------------------------------------------------------------------------------------------ //
const randint = (min, max) => Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1) + Math.ceil(min));
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');
const keys = [];
const mouse = { x: 0, y: 0, down: false };
const program = gl.createProgram();
canvas.width = innerWidth;
canvas.height = innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);

// ------------------------------------------------------------------------------------------ //
addEventListener('resize', () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
});
addEventListener('keydown', e => keys[e.key] = true);
addEventListener('keyup', e => keys[e.key] = false);
addEventListener('mousemove', e => { mouse.x = e.x; mouse.y = e.y; });
addEventListener('mousedown', () => mouse.down = true);
addEventListener('mouseup', () => mouse.down = false);

// ------------------------------------------------------------------------------------------ //
const vShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vShader, vsSource);
gl.compileShader(vShader);
if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) console.log(gl.getShaderInfoLog(vShader));
gl.attachShader(program, vShader);

const fShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fShader, fsSource);
gl.compileShader(fShader);
if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) console.log(gl.getShaderInfoLog(fShader));
gl.attachShader(program, fShader);

gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.log(gl.getProgramInfoLog(program));
} else {
  gl.deleteShader(vShader);
  gl.deleteShader(fShader);
}

// ------------------------------------------------------------------------------------------ //
const projViewLoc = gl.getUniformLocation(program, 'projView');
const projView = glMatrix.mat4.create();
const proj = glMatrix.mat4.create();
const view = glMatrix.mat4.create();

// ------------------------------------------------------------------------------------------ //
const floatsPerVertex = 5;
const quadVertexData = new Float32Array([
  -0.5, -0.5,  0.0, 1.0, 1.0,
  -0.5,  0.5,  1.0, 0.0, 1.0,
   0.5, -0.5,  1.0, 1.0, 1.0,
   0.5,  0.5,  1.0, 1.0, 0.0
]);

const quadVertexDataArrayBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quadVertexDataArrayBuffer);
gl.bufferData(gl.ARRAY_BUFFER, quadVertexData, gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);
gl.enableVertexAttribArray(1);
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, floatsPerVertex * Float32Array.BYTES_PER_ELEMENT, 0);
gl.vertexAttribPointer(1, 3, gl.FLOAT, false, floatsPerVertex * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

let last = performance.now();
const loop = now => {
  const dt = Math.min(50 / 1000, (now - last) / 1000);
  last = now;
  // console.log(1 / dt);

  glMatrix.mat4.identity(proj);
  glMatrix.mat4.identity(view);
  glMatrix.mat4.perspective(proj, 69 * Math.PI / 180, canvas.width / canvas.height, 0.01, 1000.0);
  glMatrix.mat4.lookAt(view, [0, 0, 2], [0, 0, 0], [0, 1, 0]);
  glMatrix.mat4.mul(projView, proj, view);

  // Draw call
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  gl.uniformMatrix4fv(projViewLoc, false, projView);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, quadVertexData.length / floatsPerVertex);
  gl.useProgram(null);

  requestAnimationFrame(loop);
};

requestAnimationFrame(loop);