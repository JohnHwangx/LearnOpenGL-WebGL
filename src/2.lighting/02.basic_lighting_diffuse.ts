import webglUtils from "../resources/webgl-utils";
import glm, { Vector3} from '../resources/glm'
import Camera, { Camera_Movement } from "../resources/camera";

const vsBasicLighting = `#version 300 es
in vec3 aPos;
in vec3 aNormal;

out vec3 FragPos;
out vec3 Normal;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main(){
    FragPos = vec3(model * vec4(aPos, 1.0));
    Normal = aNormal;

    gl_Position = projection * view * vec4(FragPos, 1.0);
}`;

const fsBasicLighting = `#version 300 es
precision highp float;
out vec4 FragColor;

in vec3 Normal;
in vec3 FragPos;

uniform vec3 lightPos;
uniform vec3 objectColor;
uniform vec3 lightColor;
void main(){
    // ambient
    float ambientStrengh = 0.1;
    vec3 ambient = ambientStrengh * lightColor;

    // diffuse
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(lightPos - FragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;

    vec3 result = (ambient + diffuse) * objectColor;
    FragColor = vec4(result, 1.0);
}`;

const vsLightCube = `#version 300 es
in vec3 aPos;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main(){
    gl_Position = projection * view * model * vec4(aPos, 1.0);
    
}`;

const fsLightCube = `#version 300 es
precision highp float;
out vec4 FragColor;

void main(){
    FragColor = vec4(1.0);

}`;

export default function main() {
    const canvas = document.querySelector('#c') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        return;
    }

    let camera = new Camera([0, 0, 3]);
    // let cameraPosition = [0, 0, 3];
    // let cameraFront:Vector3 = [0, 0, -1];
    // let cameraUp = [0, 1, 0];
    let deltaTime = 0;
    let lastFrame = 0;
    
    let lastX: number, lastY: number;
    // let yaw = -90;
    // let pitch = 0;
    // let fov = 45;
    let firstMouse = true;
    
    let lightPos = [1.2, 1, 2];

    let lightingProgram = webglUtils.createProgramFromStrings(gl, [vsBasicLighting, fsBasicLighting]);
    let lampProgram = webglUtils.createProgramFromStrings(gl, [vsLightCube, fsLightCube]);

    let lightingPositionAttibLocation = gl.getAttribLocation(lightingProgram, 'aPos');
    let lightingNormalAttibLocation = gl.getAttribLocation(lightingProgram, 'aNormal');
    let lightPosLocation = gl.getUniformLocation(lightingProgram, 'lightPos');
    let objectColorLocation = gl.getUniformLocation(lightingProgram, 'objectColor');
    let lightColorLocation = gl.getUniformLocation(lightingProgram, 'lightColor');
    let lightingModelLocation = gl.getUniformLocation(lightingProgram, 'model');
    let lightingViewLocation = gl.getUniformLocation(lightingProgram, 'view');
    let lightingProjectionLocation = gl.getUniformLocation(lightingProgram, 'projection');

    let lampPositionAttibLocation = gl.getAttribLocation(lampProgram, 'aPos');
    let lampModelLocation = gl.getUniformLocation(lampProgram, 'model');
    let lampViewLocation = gl.getUniformLocation(lampProgram, 'view');
    let lampProjectionLocation = gl.getUniformLocation(lampProgram, 'projection');

    const vertices = [
        -0.5, -0.5, -0.5,  0.0,  0.0, -1.0,
         0.5, -0.5, -0.5,  0.0,  0.0, -1.0,
         0.5,  0.5, -0.5,  0.0,  0.0, -1.0,
         0.5,  0.5, -0.5,  0.0,  0.0, -1.0,
        -0.5,  0.5, -0.5,  0.0,  0.0, -1.0,
        -0.5, -0.5, -0.5,  0.0,  0.0, -1.0,

        -0.5, -0.5,  0.5,  0.0,  0.0,  1.0,
         0.5, -0.5,  0.5,  0.0,  0.0,  1.0,
         0.5,  0.5,  0.5,  0.0,  0.0,  1.0,
         0.5,  0.5,  0.5,  0.0,  0.0,  1.0,
        -0.5,  0.5,  0.5,  0.0,  0.0,  1.0,
        -0.5, -0.5,  0.5,  0.0,  0.0,  1.0,

        -0.5,  0.5,  0.5, -1.0,  0.0,  0.0,
        -0.5,  0.5, -0.5, -1.0,  0.0,  0.0,
        -0.5, -0.5, -0.5, -1.0,  0.0,  0.0,
        -0.5, -0.5, -0.5, -1.0,  0.0,  0.0,
        -0.5, -0.5,  0.5, -1.0,  0.0,  0.0,
        -0.5,  0.5,  0.5, -1.0,  0.0,  0.0,

         0.5,  0.5,  0.5,  1.0,  0.0,  0.0,
         0.5,  0.5, -0.5,  1.0,  0.0,  0.0,
         0.5, -0.5, -0.5,  1.0,  0.0,  0.0,
         0.5, -0.5, -0.5,  1.0,  0.0,  0.0,
         0.5, -0.5,  0.5,  1.0,  0.0,  0.0,
         0.5,  0.5,  0.5,  1.0,  0.0,  0.0,

        -0.5, -0.5, -0.5,  0.0, -1.0,  0.0,
         0.5, -0.5, -0.5,  0.0, -1.0,  0.0,
         0.5, -0.5,  0.5,  0.0, -1.0,  0.0,
         0.5, -0.5,  0.5,  0.0, -1.0,  0.0,
        -0.5, -0.5,  0.5,  0.0, -1.0,  0.0,
        -0.5, -0.5, -0.5,  0.0, -1.0,  0.0,

        -0.5,  0.5, -0.5,  0.0,  1.0,  0.0,
         0.5,  0.5, -0.5,  0.0,  1.0,  0.0,
         0.5,  0.5,  0.5,  0.0,  1.0,  0.0,
         0.5,  0.5,  0.5,  0.0,  1.0,  0.0,
        -0.5,  0.5,  0.5,  0.0,  1.0,  0.0,
        -0.5,  0.5, -0.5,  0.0,  1.0,  0.0
    ];

    // first, configure the cube's VAO (and VBO)
    let cubeVAO = gl.createVertexArray();
    gl.bindVertexArray(cubeVAO);

    let vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.vertexAttribPointer(lightingPositionAttibLocation, 3, gl.FLOAT, false, 6 * 4, 0);
    gl.enableVertexAttribArray(lightingPositionAttibLocation);
    gl.vertexAttribPointer(lightingNormalAttibLocation, 3, gl.FLOAT, false, 6 * 4, 3 * 4);
    gl.enableVertexAttribArray(lightingNormalAttibLocation);

    // second, configure the light's VAO (VBO stays the same; the vertices are the same for the light object which is also a 3D cube)
    let lightCubeVAO = gl.createVertexArray();
    gl.bindVertexArray(lightCubeVAO);

    gl.vertexAttribPointer(lampPositionAttibLocation, 3, gl.FLOAT, false, 6 * 4, 0);
    gl.enableVertexAttribArray(lampPositionAttibLocation);
    
    webglUtils.resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.DEPTH_TEST);

    gl.useProgram(lightingProgram);
    gl.uniform3fv(objectColorLocation, [1.0, 0.5, 0.31]);
    gl.uniform3fv(lightColorLocation, [1.0, 1.0, 1.0]);
    gl.uniform3fv(lightPosLocation, lightPos);
    
    function getTime(time: number) {
            
        let currentFrame = time;
        deltaTime = (currentFrame - lastFrame) * 0.001;
        lastFrame = currentFrame;

        requestAnimationFrame(getTime);
    }
    drawScene();
    requestAnimationFrame(getTime);

    function drawScene() {
        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // be sure to activate shader when setting uniforms/drawing objects
        gl.useProgram(lightingProgram);

        let view = camera.GetViewMatrix();
        view = glm.inverse(view);
        gl.uniformMatrix4fv(lightingViewLocation, false, view);

        let glcanvas = gl.canvas as HTMLCanvasElement;
        let aspect = glcanvas.clientWidth / glcanvas.clientHeight;
        let projection = glm.perspective(glm.radians(camera.Zoom), aspect, 0.1, 100);
        gl.uniformMatrix4fv(lightingProjectionLocation, false, projection);

        let model = glm.identity();
        gl.uniformMatrix4fv(lightingModelLocation, false, model);
        
        // render the cube
        gl.bindVertexArray(cubeVAO);
        gl.drawArrays(gl.TRIANGLES, 0, 36);
        
        // also draw the lamp object
        gl.useProgram(lampProgram);
        gl.uniformMatrix4fv(lampProjectionLocation, false, projection);
        gl.uniformMatrix4fv(lampViewLocation, false, view);
        model = glm.translate(model, lightPos);
        model = glm.scale(model, 0.2, 0.2, 0.2);
        gl.uniformMatrix4fv(lampModelLocation, false, model);

        gl.bindVertexArray(lightCubeVAO);
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    document.onkeydown = (event) => {
        // return;
        var e = event || window.event || arguments.callee.caller.arguments[0];

        if (e && e.keyCode == 87) { // 按 W 
            camera.ProcessKeyboard(Camera_Movement.FORWARD, deltaTime);
        } else if (e && e.keyCode == 83) { // 按 S 
            camera.ProcessKeyboard(Camera_Movement.BACKWARD, deltaTime);
        } else if (e && e.keyCode == 65) { // A
            camera.ProcessKeyboard(Camera_Movement.LEFT, deltaTime);
        } else if (e && e.keyCode == 68) { // D
            camera.ProcessKeyboard(Camera_Movement.RIGHT, deltaTime);
        }
        drawScene();
    }
    canvas.onmousedown = (e) => {
        // return;
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

            drawScene();
        }
        canvas.onmouseup = (e) => {
            canvas.onmousemove = null;
            console.log("up");
        }
    }
    canvas.onwheel = (e) => {

        let yoffset = e.deltaY;
        camera.ProcessMouseSroll(yoffset);
        
        drawScene();
    }
}