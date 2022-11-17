import webglUtils from "../resources/webgl-utils";
import glm, { Vector3} from '../resources/glm'

const vertexShaderColorSource = `#version 300 es
in vec3 aPos;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main(){
    gl_Position = projection * view * model * vec4(aPos * vec3(1, -1, 1), 1.0);
}`;

const fragmentShaderColorSource = `#version 300 es
precision highp float;
out vec4 FragColor;

uniform vec3 u_objectColor;
uniform vec3 u_lightColor;
void main(){
    FragColor = vec4(u_lightColor * u_objectColor, 1);
}`;

const vertexShaderLampSource = `#version 300 es
in vec3 aPos;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main(){
    gl_Position = projection * view * model * vec4(aPos * vec3(1, -1, 1), 1);
    
}`;

const fragmentShaderLampSource = `#version 300 es
precision highp float;
out vec4 FragColor;

void main(){
    FragColor = vec4(1);

}`;

export default function main() {
    const canvas = document.querySelector('#c') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        return;
    }

    let cameraPosition = [0, 0, 3];
    let cameraFront:Vector3 = [0, 0, -1];
    let cameraUp = [0, 1, 0];
    let deltaTime = 0;
    let lastFrame = 0;
    
    let lastX: number, lastY: number;
    let yaw = -90;
    let pitch = 0;
    let fov = 45;
    
    let lightPos = [1.2, 1, 2];

    let lightingProgram = webglUtils.createProgramFromStrings(gl, [vertexShaderColorSource, fragmentShaderColorSource]);
    let lampProgram = webglUtils.createProgramFromStrings(gl, [vertexShaderLampSource, fragmentShaderLampSource]);

    let lightingPositionAttibLocation = gl.getAttribLocation(lightingProgram, 'aPos');
    let objectColorLocation = gl.getUniformLocation(lightingProgram, 'u_objectColor');
    let lightColorLocation = gl.getUniformLocation(lightingProgram, 'u_lightColor');
    let lightingModelLocation = gl.getUniformLocation(lightingProgram, 'model');
    let lightingViewLocation = gl.getUniformLocation(lightingProgram, 'view');
    let lightingProjectionLocation = gl.getUniformLocation(lightingProgram, 'projection');

    let lampPositionAttibLocation = gl.getAttribLocation(lampProgram, 'aPos');
    let lampModelLocation = gl.getUniformLocation(lampProgram, 'model');
    let lampViewLocation = gl.getUniformLocation(lampProgram, 'view');
    let lampProjectionLocation = gl.getUniformLocation(lampProgram, 'projection');

    const vertices = [
        -0.5, -0.5, -0.5, 
         0.5, -0.5, -0.5,  
         0.5,  0.5, -0.5,  
         0.5,  0.5, -0.5,  
        -0.5,  0.5, -0.5, 
        -0.5, -0.5, -0.5, 

        -0.5, -0.5,  0.5, 
         0.5, -0.5,  0.5,  
         0.5,  0.5,  0.5,  
         0.5,  0.5,  0.5,  
        -0.5,  0.5,  0.5, 
        -0.5, -0.5,  0.5, 

        -0.5,  0.5,  0.5, 
        -0.5,  0.5, -0.5, 
        -0.5, -0.5, -0.5, 
        -0.5, -0.5, -0.5, 
        -0.5, -0.5,  0.5, 
        -0.5,  0.5,  0.5, 

         0.5,  0.5,  0.5,  
         0.5,  0.5, -0.5,  
         0.5, -0.5, -0.5,  
         0.5, -0.5, -0.5,  
         0.5, -0.5,  0.5,  
         0.5,  0.5,  0.5,  

        -0.5, -0.5, -0.5, 
         0.5, -0.5, -0.5,  
         0.5, -0.5,  0.5,  
         0.5, -0.5,  0.5,  
        -0.5, -0.5,  0.5, 
        -0.5, -0.5, -0.5, 

        -0.5,  0.5, -0.5, 
         0.5,  0.5, -0.5,  
         0.5,  0.5,  0.5,  
         0.5,  0.5,  0.5,  
        -0.5,  0.5,  0.5, 
        -0.5,  0.5, -0.5, 
    ];

    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    let vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.vertexAttribPointer(lightingPositionAttibLocation, 3, gl.FLOAT, false, 3 * 4, 0);
    gl.enableVertexAttribArray(lightingPositionAttibLocation);

    gl.vertexAttribPointer(lampPositionAttibLocation, 3, gl.FLOAT, false, 3 * 4, 0);
    gl.enableVertexAttribArray(lampPositionAttibLocation);
    
    webglUtils.resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.DEPTH_TEST);

    gl.useProgram(lightingProgram);
    gl.uniform3fv(objectColorLocation, [1.0, 0.5, 0.31]);
    gl.uniform3fv(lightColorLocation, [1.0, 1.0, 1.0]);
    
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

        gl.useProgram(lightingProgram);

        let center = [cameraPosition[0] + cameraFront[0], cameraPosition[1] + cameraFront[1], cameraPosition[2] + cameraFront[2]];
        let camera = glm.lookAt(cameraPosition, center, cameraUp);
        let view = glm.inverse(camera);
        gl.uniformMatrix4fv(lightingViewLocation, false, view);

        let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        let projection = glm.perspective(glm.radians(fov), aspect, 0.1, 100);        
        gl.uniformMatrix4fv(lightingProjectionLocation, false, projection);

        let model = glm.identity();
        gl.uniformMatrix4fv(lightingModelLocation, false, model);
        
        gl.drawArrays(gl.TRIANGLES, 0, 36);
        
        gl.useProgram(lampProgram);
        gl.uniformMatrix4fv(lampProjectionLocation, false, projection);
        gl.uniformMatrix4fv(lampViewLocation, false, view);
        model = glm.translate(model, lightPos);
        model = glm.scale(model, 0.2, 0.2, 0.2);
        gl.uniformMatrix4fv(lampModelLocation, false, model);
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    document.onkeydown = (event) => {
        var e = event || window.event || arguments.callee.caller.arguments[0];

        let cameraSpeed = 2.5 * deltaTime;
        if (e && e.keyCode == 87) { // 按 W 
            cameraPosition[0] += cameraSpeed * cameraFront[0];
            cameraPosition[1] += cameraSpeed * cameraFront[1];
            cameraPosition[2] += cameraSpeed * cameraFront[2];
            // console.log('wwwww');
        } else if (e && e.keyCode == 83) { // 按 S 
            cameraPosition[0] -= cameraSpeed * cameraFront[0];
            cameraPosition[1] -= cameraSpeed * cameraFront[1];
            cameraPosition[2] -= cameraSpeed * cameraFront[2];
            // console.log('sssss');
        } else if (e && e.keyCode == 65) { // A
            // console.log('aaaaa');
            cameraPosition[0] -= glm.normalize(glm.cross(cameraFront, cameraUp))[0] * cameraSpeed;
            cameraPosition[1] -= glm.normalize(glm.cross(cameraFront, cameraUp))[1] * cameraSpeed;
            cameraPosition[2] -= glm.normalize(glm.cross(cameraFront, cameraUp))[2] * cameraSpeed;
        } else if (e && e.keyCode == 68) { // D
            // console.log('ddddd');
            cameraPosition[0] += glm.normalize(glm.cross(cameraFront, cameraUp))[0] * cameraSpeed;
            cameraPosition[1] += glm.normalize(glm.cross(cameraFront, cameraUp))[1] * cameraSpeed;
            cameraPosition[2] += glm.normalize(glm.cross(cameraFront, cameraUp))[2] * cameraSpeed;
        }
        drawScene();
    }
    canvas.onmousedown = (e) => {
        lastX = e.clientX;
        lastY = e.clientY;
        fndown();
    }
    function fndown() {
        canvas.onmousemove = (e) => {
            let offsetX = e.clientX - lastX;
            let offsetY = lastY - e.clientY;

            lastX = e.clientX;
            lastY = e.clientY;

            let sensitivity = 0.1;
            offsetX *= sensitivity;
            offsetY *= sensitivity;

            yaw += offsetX;
            pitch += offsetY;

            let x = Math.cos(glm.radians(yaw)) * Math.cos(glm.radians(pitch));
            let y = Math.sin(glm.radians(pitch));
            let z = Math.sin(glm.radians(yaw)) * Math.cos(glm.radians(pitch));
            cameraFront = glm.normalize([x, y, z]);
            drawScene();
            console.log("ondrag");
        }
        canvas.onmouseup = (e) => {
            canvas.onmousemove = null;
            console.log("up");
        }
    }
    canvas.onwheel = (e) => {
        let offsetY = e.deltaY * 0.1;
        if (fov >= 1.0 && fov <= 45.0)
            fov += offsetY;
        if (fov <= 1.0)
            fov = 1.0;
        if (fov >= 45.0)
            fov = 45.0;
        drawScene();
    }
}