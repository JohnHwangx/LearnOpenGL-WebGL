import webglUtils from "../resources/webgl-utils";

const vertexShaderSource = `#version 300 es

in vec4 a_position;
void main(){
    gl_Position = a_position;
}`;

const fragmentShaderSource = `#version 300 es

precision highp float;
out vec4 outColor;

void main(){
    outColor = vec4(1, 0.5, 0.2, 1);
}`;

function createShader(gl:WebGL2RenderingContext,type:number,source:string) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return undefined;
}

function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return undefined;
}

export default function main() {
    let canvas = document.querySelector('#c') as HTMLCanvasElement;
    let gl = canvas.getContext('webgl2');
    if (!gl) {
        return;
    }

    let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    let program = createProgram(gl, vertexShader, fragmentShader);

    const vertices = [
        0.5, 0.5, 0.0,  // top right
        0.5, -0.5, 0.0,  // bottom right
        -0.5, -0.5, 0.0,  // bottom left
        -0.5, 0.5, 0.0   // top left 
    ];

    const indices = [
        0, 1, 3,  // first Triangle
        1, 2, 3   // second Triangle
    ];

    let positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    let vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    let ebo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 3 * 4, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.2, 0.3, 0.3, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}