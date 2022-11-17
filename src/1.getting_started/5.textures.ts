import webglUtils from "../resources/webgl-utils";

const vertexShaderSource = `#version 300 es
in vec3 aPos;
in vec3 aColor;
in vec2 aTexCoord;

out vec3 ourColor;
out vec2 TexCoord;

void main(){
    gl_Position = vec4(aPos, 1.0);
    ourColor = aColor;
    TexCoord = vec2(aTexCoord.x, aTexCoord.y);
}`;

const fragmentShaderSource = `#version 300 es
precision highp float;
out vec4 FragColor;

in vec3 ourColor;
in vec2 TexCoord;

uniform sampler2D texture1;
void main(){
    FragColor = texture(texture1, TexCoord) * vec4(ourColor, 1.0);;
}`;

export default function main() {
    const canvas = document.querySelector('#c') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        return;
    }

    let program = webglUtils.createProgramFromStrings(gl, [vertexShaderSource, fragmentShaderSource]);
    let positionAttibLocation = gl.getAttribLocation(program, 'aPos');
    let colorAttribLocation = gl.getAttribLocation(program, 'aColor');
    let texCoordAttibLocation = gl.getAttribLocation(program, 'aTexCoord');

    const vertices = [
        // positions          // colors           // texture coords
        0.5,  0.5, 0.0,   1.0, 0.0, 0.0,   1.0, 1.0, // top right
        0.5, -0.5, 0.0,   0.0, 1.0, 0.0,   1.0, 0.0, // bottom right
       -0.5, -0.5, 0.0,   0.0, 0.0, 1.0,   0.0, 0.0, // bottom left
       -0.5,  0.5, 0.0,   1.0, 1.0, 0.0,   0.0, 1.0  // top left 
    ];
    const indices = [
        0, 1, 3, // first triangle
        1, 2, 3  // second triangle
    ];

    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    let vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    let ebo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.vertexAttribPointer(positionAttibLocation, 3, gl.FLOAT, false, 8 * 4, 0);
    gl.enableVertexAttribArray(positionAttibLocation);

    gl.vertexAttribPointer(colorAttribLocation, 3, gl.FLOAT, false, 8 * 4, 3 * 4);
    gl.enableVertexAttribArray(colorAttribLocation);

    gl.vertexAttribPointer(texCoordAttibLocation, 2, gl.FLOAT, false, 8 * 4, 6 * 4);
    gl.enableVertexAttribArray(texCoordAttibLocation);

    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    let image = new Image();
    image.src = './resources/images/container.jpg';
    image.addEventListener('load', () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);

        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        let textureUniformLocation = gl.getUniformLocation(program, 'texture1');

        gl.clearColor(0.2, 0.3, 0.3, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);
        gl.bindVertexArray(vao);

        gl.uniform1i(textureUniformLocation, 0);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    });
}