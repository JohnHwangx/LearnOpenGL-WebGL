import webglUtils from "../resources/webgl-utils";
import glm, { Vector3} from '../resources/glm'
import Camera, { Camera_Movement } from "../resources/camera";
import Shader from "../resources/Shader";

const vsBlending = `#version 300 es
in vec3 aPos;
in vec2 aTexCoords;

out vec2 TexCoords;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main(){
    TexCoords = aTexCoords;
    gl_Position = projection * view * model * vec4(aPos, 1.0);
}`;

const fsBlending = `#version 300 es
precision highp float;
out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D texture1;

void main(){
    FragColor = texture(texture1, TexCoords);
}`;

export default function main() {
    const canvas = document.querySelector('#c') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        return;
    }

    let camera = new Camera([0, 0, 3]);
    let deltaTime = 0;
    let lastFrame = 0;
    
    let lastX: number, lastY: number;
    let firstMouse = true;
    
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let shader = new Shader(gl, vsBlending, fsBlending);
    // let shaderSingleColor = new Shader(gl, vsStencilTesting, fsStencilSingleColor);
    let lightingPositionAttibLocation = gl.getAttribLocation(shader.ID, 'aPos');
    let lightingTexCoordsAttibLocation = gl.getAttribLocation(shader.ID, 'aTexCoords');

    const cubeVertices = [
        // positions       // texture Coords
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
    const planeVertices = [
         // positions      // texture Coords (note we set these higher than 1 (together with GL_REPEAT as texture wrapping mode). this will cause the floor texture to repeat)
         5.0, -0.5,  5.0,  2.0, 0.0,
        -5.0, -0.5,  5.0,  0.0, 0.0,
        -5.0, -0.5, -5.0,  0.0, 2.0,

         5.0, -0.5,  5.0,  2.0, 0.0,
        -5.0, -0.5, -5.0,  0.0, 2.0,
         5.0, -0.5, -5.0,  2.0, 2.0
    ];
    const transparentVertices = [
        // positions      // texture Coords (swapped y coordinates because texture is flipped upside down)
        0.0,  0.5,  0.0,  0.0,  0.0,
        0.0, -0.5,  0.0,  0.0,  1.0,
        1.0, -0.5,  0.0,  1.0,  1.0,

        0.0,  0.5,  0.0,  0.0,  0.0,
        1.0, -0.5,  0.0,  1.0,  1.0,
        1.0,  0.5,  0.0,  1.0,  0.0
    ];

    // Cube VAO
    let cubeVAO = gl.createVertexArray();
    gl.bindVertexArray(cubeVAO);

    let cubeVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);

    gl.vertexAttribPointer(lightingPositionAttibLocation, 3, gl.FLOAT, false, 5 * 4, 0);
    gl.enableVertexAttribArray(lightingPositionAttibLocation);
    gl.vertexAttribPointer(lightingTexCoordsAttibLocation, 2, gl.FLOAT, false, 5 * 4, 3 * 4);
    gl.enableVertexAttribArray(lightingTexCoordsAttibLocation);

    // plane VAO
    let planeVAO = gl.createVertexArray();
    gl.bindVertexArray(planeVAO);
    
    let palneVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, palneVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(planeVertices), gl.STATIC_DRAW);

    gl.vertexAttribPointer(lightingPositionAttibLocation, 3, gl.FLOAT, false, 5 * 4, 0);
    gl.enableVertexAttribArray(lightingPositionAttibLocation);
    gl.vertexAttribPointer(lightingTexCoordsAttibLocation, 2, gl.FLOAT, false, 5 * 4, 3 * 4);
    gl.enableVertexAttribArray(lightingTexCoordsAttibLocation);
    
    // transparent VAO
    let transparentVAO = gl.createVertexArray();
    gl.bindVertexArray(transparentVAO);
    
    let transparentVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, transparentVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(transparentVertices), gl.STATIC_DRAW);

    gl.vertexAttribPointer(lightingPositionAttibLocation, 3, gl.FLOAT, false, 5 * 4, 0);
    gl.enableVertexAttribArray(lightingPositionAttibLocation);
    gl.vertexAttribPointer(lightingTexCoordsAttibLocation, 2, gl.FLOAT, false, 5 * 4, 3 * 4);
    gl.enableVertexAttribArray(lightingTexCoordsAttibLocation);
    
    webglUtils.resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    const windows = [
        [-1.5, 0.0, -0.48],
        [ 1.5, 0.0, 0.51],
        [ 0.0, 0.0, 0.7],
        [-0.3, 0.0, -2.3],
        [ 0.5, 0.0, -0.6]
    ];

    shader.use();
    shader.setInt("texture1", 0);

    const loadImage = function(imageSrc:string){
        let promise: Promise<HTMLImageElement> = new Promise((resolve,reject)=>{
            const image = new Image();
            image.onload=()=>{
                resolve(image);
            };
            image.onerror=()=>{
                reject();
            }
            image.src = imageSrc;
        });
        return promise;
    };
    
    render();

    async function render() {
        
        let cubeTexture = await loadImage("./resources/images/marble.jpg").then(image => {
            return loadTexture(image);
        });
        let floorTexture = await loadImage("./resources/images/metal.png").then(image => {
            return loadTexture(image);
        });
        let transparentTexture = await loadImage("./resources/images/window.png").then(image => {
            return loadTexture(image);
        });

        requestAnimationFrame(drawScene);

        function drawScene(time: number) {
            let currentFrame = time;
            deltaTime = (currentFrame - lastFrame) * 0.001;
            lastFrame = currentFrame;

            windows.sort((a, b) => {
                let distanceA = glm.length(glm.subtract(camera.Position, a));
                let distanceB = glm.length(glm.subtract(camera.Position, b));
                return distanceB - distanceA;
            })

            gl.clearColor(0.1, 0.1, 0.1, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            //draw objects
            shader.use();
            let model = glm.identity();
            let view = camera.GetViewMatrix();
            view = glm.inverse(view);
            shader.setMat4("view", view);
            let glcanvas = gl.canvas as HTMLCanvasElement;
            let aspect = glcanvas.clientWidth / glcanvas.clientHeight;
            let projection = glm.perspective(glm.radians(camera.Zoom), aspect, 0.1, 100);
            shader.setMat4('projection', projection);
            //cube
            gl.bindVertexArray(cubeVAO);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, cubeTexture);

            model = glm.translate(model, [-1, 0, -1]);
            shader.setMat4('model', model);
            gl.drawArrays(gl.TRIANGLES, 0, 36);

            model = glm.identity();
            model = glm.translate(model, [2, 0, 0]);
            shader.setMat4('model', model);
            gl.drawArrays(gl.TRIANGLES, 0, 36);
            
            // floor
            gl.bindVertexArray(planeVAO);
            gl.bindTexture(gl.TEXTURE_2D, floorTexture);
            shader.setMat4("model", glm.identity());
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            // vegetation
            gl.bindVertexArray(transparentVAO);
            gl.bindTexture(gl.TEXTURE_2D, transparentTexture);
            // for (let [distance, window] of sorted)
            for (let i = 0; i < windows.length;i++)
            {
                model = glm.identity();
                model = glm.translate(model, windows[i]);
                shader.setMat4("model", model);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
            }
            
            requestAnimationFrame(drawScene);
        }
    }

    function loadTexture(image: HTMLImageElement) {
        
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        return texture;
    }

    document.onkeydown = (event) => {
        var e = event || window.event || arguments.callee.caller.arguments[0];
        
        if (e && e.keyCode == 87) { // 按 W 
            camera.ProcessKeyboard(Camera_Movement.FORWARD, deltaTime);
            // console.log('wwwww');
        } else if (e && e.keyCode == 83) { // 按 S 
            camera.ProcessKeyboard(Camera_Movement.BACKWARD, deltaTime);
            // console.log('sssss');
        } else if (e && e.keyCode == 65) { // A
            // console.log('aaaaa');
            camera.ProcessKeyboard(Camera_Movement.LEFT, deltaTime);
        } else if (e && e.keyCode == 68) { // D
            // console.log('ddddd');
            camera.ProcessKeyboard(Camera_Movement.RIGHT, deltaTime);
        }
    }
    canvas.onmousedown = (e) => {
        lastX = e.clientX;
        lastY = e.clientY;
        fndown();
    }
    function fndown() {
        canvas.onmousemove = (e) => {
            
            let xpos = e.clientX;
            let ypos = e.clientY;
            if (firstMouse) {
                lastX = xpos;
                lastY = ypos;
                firstMouse = false;
            }
            let xoffset = xpos - lastX;
            let yoffset = lastY - ypos;

            lastX = xpos;
            lastY = ypos;

            camera.ProcessMouseMovement(xoffset, yoffset);
        }
        canvas.onmouseup = (e) => {
            canvas.onmousemove = null;
            console.log("up");
        }
    }
    canvas.onwheel = (e) => {
        let yoffset = e.deltaY;
        camera.ProcessMouseSroll(yoffset);
    }
}