import webglUtils from "../resources/webgl-utils";
import glm, { Vector3} from '../resources/glm'
import Camera, { Camera_Movement } from "../resources/camera";
import shader from "../resources/Shader";
import { vec3 } from "../resources/glMatrix";

const vsMaterials = `#version 300 es

in vec3 aPos;
in vec3 aNormal;
in vec2 aTexCoords;

out vec3 FragPos;
out vec3 Normal;
out vec2 TexCoords;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main(){
    FragPos = vec3(model * vec4(aPos, 1.0));
    Normal = mat3(transpose(inverse(model))) * aNormal;
    TexCoords = aTexCoords;

    gl_Position = projection * view * vec4(FragPos, 1.0);
}`;

const fsMaterials = `#version 300 es
precision highp float;
out vec4 FragColor;

struct Material{
    sampler2D diffuse;
    vec3 specular;
    float shininess;
};

struct Light{
    vec3 position;
    
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

in vec3 Normal;
in vec3 FragPos;
in vec2 TexCoords;

uniform vec3 viewPos;
uniform Material material;
uniform Light light;

void main() {
    // ambient
    vec3 ambient = light.ambient * texture(material.diffuse, TexCoords).rgb;

    // diffuse
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(light.position - FragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = light.diffuse * diff * texture(material.diffuse, TexCoords).rgb;

    //specular
    vec3 viewDir = normalize(viewPos - FragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    vec3 specular = light.specular * (spec * material.specular);

    vec3 result = ambient + diffuse + specular;
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
    
    let lastX: number = gl.canvas.width / 2;
    let lastY: number = gl.canvas.height / 2;
    let firstMouse = true;

    let deltaTime = 0;
    let lastFrame = 0;
    
    let lightPos = [1.2, 1, 2];

    let lightingShader = new shader(gl, vsMaterials, fsMaterials);
    let lightCubeShader = new shader(gl, vsLightCube, fsLightCube);

    let lightingPositionAttibLocation = gl.getAttribLocation(lightingShader.ID, 'aPos');
    let lightingNormalAttibLocation = gl.getAttribLocation(lightingShader.ID, 'aNormal');
    let lightingTexCoordsAttibLocation = gl.getAttribLocation(lightingShader.ID, 'aTexCoords');

    let lightCubePositionAttibLocation = gl.getAttribLocation(lightCubeShader.ID, 'aPos');

    const vertices = [
        // positions       // normals        // texture coords
        -0.5, -0.5, -0.5,  0.0,  0.0, -1.0,  0.0,  0.0,
         0.5, -0.5, -0.5,  0.0,  0.0, -1.0,  1.0,  0.0,
         0.5,  0.5, -0.5,  0.0,  0.0, -1.0,  1.0,  1.0,
         0.5,  0.5, -0.5,  0.0,  0.0, -1.0,  1.0,  1.0,
        -0.5,  0.5, -0.5,  0.0,  0.0, -1.0,  0.0,  1.0,
        -0.5, -0.5, -0.5,  0.0,  0.0, -1.0,  0.0,  0.0,

        -0.5, -0.5,  0.5,  0.0,  0.0,  1.0,  0.0,  0.0,
         0.5, -0.5,  0.5,  0.0,  0.0,  1.0,  1.0,  0.0,
         0.5,  0.5,  0.5,  0.0,  0.0,  1.0,  1.0,  1.0,
         0.5,  0.5,  0.5,  0.0,  0.0,  1.0,  1.0,  1.0,
        -0.5,  0.5,  0.5,  0.0,  0.0,  1.0,  0.0,  1.0,
        -0.5, -0.5,  0.5,  0.0,  0.0,  1.0,  0.0,  0.0,

        -0.5,  0.5,  0.5, -1.0,  0.0,  0.0,  1.0,  0.0,
        -0.5,  0.5, -0.5, -1.0,  0.0,  0.0,  1.0,  1.0,
        -0.5, -0.5, -0.5, -1.0,  0.0,  0.0,  0.0,  1.0,
        -0.5, -0.5, -0.5, -1.0,  0.0,  0.0,  0.0,  1.0,
        -0.5, -0.5,  0.5, -1.0,  0.0,  0.0,  0.0,  0.0,
        -0.5,  0.5,  0.5, -1.0,  0.0,  0.0,  1.0,  0.0,

         0.5,  0.5,  0.5,  1.0,  0.0,  0.0,  1.0,  0.0,
         0.5,  0.5, -0.5,  1.0,  0.0,  0.0,  1.0,  1.0,
         0.5, -0.5, -0.5,  1.0,  0.0,  0.0,  0.0,  1.0,
         0.5, -0.5, -0.5,  1.0,  0.0,  0.0,  0.0,  1.0,
         0.5, -0.5,  0.5,  1.0,  0.0,  0.0,  0.0,  0.0,
         0.5,  0.5,  0.5,  1.0,  0.0,  0.0,  1.0,  0.0,

        -0.5, -0.5, -0.5,  0.0, -1.0,  0.0,  0.0,  1.0,
         0.5, -0.5, -0.5,  0.0, -1.0,  0.0,  1.0,  1.0,
         0.5, -0.5,  0.5,  0.0, -1.0,  0.0,  1.0,  0.0,
         0.5, -0.5,  0.5,  0.0, -1.0,  0.0,  1.0,  0.0,
        -0.5, -0.5,  0.5,  0.0, -1.0,  0.0,  0.0,  0.0,
        -0.5, -0.5, -0.5,  0.0, -1.0,  0.0,  0.0,  1.0,

        -0.5,  0.5, -0.5,  0.0,  1.0,  0.0,  0.0,  1.0,
         0.5,  0.5, -0.5,  0.0,  1.0,  0.0,  1.0,  1.0,
         0.5,  0.5,  0.5,  0.0,  1.0,  0.0,  1.0,  0.0,
         0.5,  0.5,  0.5,  0.0,  1.0,  0.0,  1.0,  0.0,
        -0.5,  0.5,  0.5,  0.0,  1.0,  0.0,  0.0,  0.0,
        -0.5,  0.5, -0.5,  0.0,  1.0,  0.0,  0.0,  1.0
    ];
    // first, configure the cube's VAO (and VBO)
    let cubeVAO = gl.createVertexArray();
    gl.bindVertexArray(cubeVAO);

    let vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.vertexAttribPointer(lightingPositionAttibLocation, 3, gl.FLOAT, false, 8 * 4, 0);
    gl.enableVertexAttribArray(lightingPositionAttibLocation);
    gl.vertexAttribPointer(lightingNormalAttibLocation, 3, gl.FLOAT, false, 8 * 4, 3 * 4);
    gl.enableVertexAttribArray(lightingNormalAttibLocation);
    gl.vertexAttribPointer(lightingTexCoordsAttibLocation, 2, gl.FLOAT, false, 8 * 4, 6 * 4);
    gl.enableVertexAttribArray(lightingTexCoordsAttibLocation);

    // second, configure the light's VAO (VBO stays the same; the vertices are the same for the light object which is also a 3D cube)
    let lightCubeVAO = gl.createVertexArray();
    gl.bindVertexArray(lightCubeVAO);

    gl.vertexAttribPointer(lightCubePositionAttibLocation, 3, gl.FLOAT, false, 8 * 4, 0);
    gl.enableVertexAttribArray(lightCubePositionAttibLocation);
    
    webglUtils.resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.DEPTH_TEST);

    // gl.useProgram(lightingShader);
    lightingShader.use();
    lightingShader.setInt('material.diffuse', 0);
    lightingShader.setVec3('material.specular', 0.5, 0.5, 0.5);
    lightingShader.setFloat('material.shininess', 64);

    let imagePaths = ["./resources/images/container2.png"];
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

    Promise.all(imagePaths.map(i=>loadImage(i))).then(images=>{
        render(images);
    });

    function render(images:HTMLImageElement[]){
        let textures = loadTexture(images);
        textures.forEach((texture,index) => {
            gl.activeTexture(gl.TEXTURE0 + index);
            gl.bindTexture(gl.TEXTURE_2D,texture);
        });

        requestAnimationFrame(drawScene);

        function drawScene(time: number) {
            let currentFrame = time;
            deltaTime = (currentFrame - lastFrame) * 0.001;
            lastFrame = currentFrame;
    
            gl.clearColor(0.1, 0.1, 0.1, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
            // be sure to activate shader when setting uniforms/drawing objects
            // gl.useProgram(lightingShader);
            // gl.uniform3fv(viewPosLocation, camera.Position);
            lightingShader.use();
            lightingShader.setVec3('light.position', lightPos);
            lightingShader.setVec3('viewPos', camera.Position);
    
            lightingShader.setVec3('light.ambient', 0.2, 0.2, 0.2);
            lightingShader.setVec3('light.diffuse', 0.5, 0.5, 0.5);
            lightingShader.setVec3('light.specular', 1, 1, 1);
    
            let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
            let projection = glm.perspective(glm.radians(camera.Zoom), aspect, 0.1, 100);
            lightingShader.setMat4('projection', projection);
    
            let view = camera.GetViewMatrix();
            view = glm.inverse(view);
            lightingShader.setMat4('view', view);
    
            let model = glm.identity();
            lightingShader.setMat4('model', model);
            
            // render the cube
            gl.bindVertexArray(cubeVAO);
            gl.drawArrays(gl.TRIANGLES, 0, 36);
            
            // also draw the lamp object
            lightCubeShader.use();
            lightCubeShader.setMat4('projection', projection);
            lightCubeShader.setMat4('view', view);
            model = glm.translate(model, lightPos);
            model = glm.scale(model, 0.2, 0.2, 0.2);
            lightCubeShader.setMat4('model', model);
    
            gl.bindVertexArray(lightCubeVAO);
            gl.drawArrays(gl.TRIANGLES, 0, 36);
            
            requestAnimationFrame(drawScene);
        }
    }

    function loadTexture(images:HTMLImageElement[]){
        let textures=[];
        for(let i=0;i<images.length;i++){
            let image = images[i];
            let texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D,texture);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);

            gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
            gl.generateMipmap(gl.TEXTURE_2D);

            textures.push(texture);
        }
        return textures;
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