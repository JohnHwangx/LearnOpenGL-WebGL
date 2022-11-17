import webglUtils from "../resources/webgl-utils";
import glm from '../resources/glm'

const vertexShaderSource = `#version 300 es
in vec3 aPos;
in vec2 aTexCoord;

out vec2 TexCoord;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main(){
    gl_Position = projection * view * model * vec4(aPos.x, (-1.0) * aPos.y, aPos.z, 1.0);
    TexCoord = vec2(aTexCoord.x, aTexCoord.y);
}`;

const fragmentShaderSource = `#version 300 es
precision highp float;
out vec4 FragColor;

in vec2 TexCoord;

uniform sampler2D texture1;
uniform sampler2D texture2;
void main(){
    FragColor = mix(texture(texture1, TexCoord), texture(texture2, TexCoord), 0.2);
}`;

export default function main() {
    const canvas = document.querySelector('#c') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        return;
    }

    let program = webglUtils.createProgramFromStrings(gl, [vertexShaderSource, fragmentShaderSource]);
    let positionAttibLocation = gl.getAttribLocation(program, 'aPos');
    let texCoordAttibLocation = gl.getAttribLocation(program, 'aTexCoord');

    const vertices = [
        -0.5, -0.5, -0.5,  0.0, 0.0,
         0.5, -0.5, -0.5,  1.0, 0.0,
         0.5,  0.5, -0.5,  1.0, 1.0,
         0.5,  0.5, -0.5,  1.0, 1.0,
        -0.5,  0.5, -0.5,  0.0, 1.0,
        -0.5, -0.5, -0.5,  0.0, 0.0,

        -0.5, -0.5,  0.5,  0.0, 0.0,
         0.5, -0.5,  0.5,  1.0, 0.0,
         0.5,  0.5,  0.5,  1.0, 1.0,
         0.5,  0.5,  0.5,  1.0, 1.0,
        -0.5,  0.5,  0.5,  0.0, 1.0,
        -0.5, -0.5,  0.5,  0.0, 0.0,

        -0.5,  0.5,  0.5,  1.0, 0.0,
        -0.5,  0.5, -0.5,  1.0, 1.0,
        -0.5, -0.5, -0.5,  0.0, 1.0,
        -0.5, -0.5, -0.5,  0.0, 1.0,
        -0.5, -0.5,  0.5,  0.0, 0.0,
        -0.5,  0.5,  0.5,  1.0, 0.0,

         0.5,  0.5,  0.5,  1.0, 0.0,
         0.5,  0.5, -0.5,  1.0, 1.0,
         0.5, -0.5, -0.5,  0.0, 1.0,
         0.5, -0.5, -0.5,  0.0, 1.0,
         0.5, -0.5,  0.5,  0.0, 0.0,
         0.5,  0.5,  0.5,  1.0, 0.0,

        -0.5, -0.5, -0.5,  0.0, 1.0,
         0.5, -0.5, -0.5,  1.0, 1.0,
         0.5, -0.5,  0.5,  1.0, 0.0,
         0.5, -0.5,  0.5,  1.0, 0.0,
        -0.5, -0.5,  0.5,  0.0, 0.0,
        -0.5, -0.5, -0.5,  0.0, 1.0,

        -0.5,  0.5, -0.5,  0.0, 1.0,
         0.5,  0.5, -0.5,  1.0, 1.0,
         0.5,  0.5,  0.5,  1.0, 0.0,
         0.5,  0.5,  0.5,  1.0, 0.0,
        -0.5,  0.5,  0.5,  0.0, 0.0,
        -0.5,  0.5, -0.5,  0.0, 1.0
    ];

    const cubePositions = [
        [ 0.0,  0.0,  0.0],
        [ 2.0,  5.0, -15.0],
        [-1.5, -2.2, -2.5],
        [-3.8, -2.0, -12.3],
        [ 2.4, -0.4, -3.5],
        [-1.7,  3.0, -7.5],
        [ 1.3, -2.0, -2.5],
        [ 1.5,  2.0, -2.5],
        [ 1.5,  0.2, -1.5],
        [-1.3,  1.0, -1.5]
    ];

    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    let vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.vertexAttribPointer(positionAttibLocation, 3, gl.FLOAT, false, 5 * 4, 0);
    gl.enableVertexAttribArray(positionAttibLocation);

    gl.vertexAttribPointer(texCoordAttibLocation, 2, gl.FLOAT, false, 5 * 4, 3 * 4);
    gl.enableVertexAttribArray(texCoordAttibLocation);

    let texture1UniformLocation = gl.getUniformLocation(program, 'texture1');
    let texture2UniformLocation = gl.getUniformLocation(program, 'texture2');
    
    let modelLocation = gl.getUniformLocation(program, 'model');
    let viewLocation = gl.getUniformLocation(program, 'view');
    let projectionLocation = gl.getUniformLocation(program, 'projection');

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
    
        webglUtils.resizeCanvasToDisplaySize(canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.enable(gl.DEPTH_TEST);
    
        gl.useProgram(program);
        
        gl.uniform1i(texture1UniformLocation, 0);
        gl.uniform1i(texture2UniformLocation, 1);        
    
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures[0]);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, textures[1]);

        requestAnimationFrame(drawScene);

        function drawScene(time:number) {
            time *= 0.001;
    
            let radius = 10.0;
            let camX = Math.sin(time) * radius;
            let camZ = Math.cos(time) * radius;
            let camera = glm.lookAt(
                [camX, 0, camZ],
                [0, 0, 0],
                [0, 1, 0]
            );

            let view = glm.inverse(camera);

            let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
            let projection = glm.perspective(glm.radians(45), aspect, 1, 2000);
            
            gl.uniformMatrix4fv(viewLocation, false, view);
            gl.uniformMatrix4fv(projectionLocation, false, projection);
    
            gl.clearColor(0.2, 0.3, 0.3, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            for (let i = 0; i < cubePositions.length; i++) {
                let model = glm.identity();
                model = glm.translate(model, cubePositions[i]);

                let angle = 20 * i;
                model = glm.axisRotate(model, [1, 0.3, 0.5], glm.radians(angle));
                
                gl.uniformMatrix4fv(modelLocation, false, model);
    
                gl.drawArrays(gl.TRIANGLES, 0, 36);
            }
            requestAnimationFrame(drawScene);
        }
    }
    
}