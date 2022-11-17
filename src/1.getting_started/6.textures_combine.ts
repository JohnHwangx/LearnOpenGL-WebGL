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
uniform sampler2D texture2;
void main(){
    FragColor = mix(texture(texture1,TexCoord),texture(texture2, TexCoord), 0.2);
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

    let texture1UniformLocation = gl.getUniformLocation(program, 'texture1');
    let texture2UniformLocation = gl.getUniformLocation(program, 'texture2');
    

    let images = ['./resources/images/container.jpg', './resources/images/awesomeface.jpg'];
    const loadImage = function (imageSrc: string) {
        let promise: Promise<HTMLImageElement> = new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                resolve(image);
            }
            image.onerror = () => {
                reject();
            }
            image.src = imageSrc;
        });
        return promise;
    }

    Promise.all(images.map(i => loadImage(i))).then(images => {
        render(images);
    });

    function render(images: HTMLImageElement[]) {
        let textures = [];
        for (let i = 0; i < images.length; i++){
            let image = images[i];
            let texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);

            textures.push(texture);
        }

        gl.useProgram(program);

        webglUtils.resizeCanvasToDisplaySize(canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        
        gl.uniform1i(texture1UniformLocation, 0);
        gl.uniform1i(texture2UniformLocation, 1);

        gl.clearColor(0.2, 0.3, 0.3, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures[0]);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, textures[1]);

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
}