import webglUtils from "../resources/webgl-utils";
import glm, { Vector3 } from '../resources/glm'
import Camera, { Camera_Movement } from "../resources/camera";
import Shader from "../resources/Shader";

const vsShadowMappingDepth = `#version 300 es
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec2 aTexCoords;

out vec2 TexCoords;

uniform mat4 model;
// uniform mat4 view;
// uniform mat4 projection;
uniform mat4 lightSpaceMatrix;

void main(){
    TexCoords = aTexCoords;
    // gl_Position = projection * view * model * vec4(aPos, 1.0);
    gl_Position = lightSpaceMatrix * model * vec4(aPos, 1.0);
}`;

const fsShadowMappingDepth = `#version 300 es
precision highp float;
out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D texture1;

void main(){    
    // gl_FragDepth = gl_FragCoord.z;
    // FragColor = texture(texture1, TexCoords);
}`;

const vsDebugQuadDepth = `#version 300 es
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec2 aTexCoords;

out vec2 TexCoords;

void main(){
    TexCoords = aTexCoords;
    gl_Position = vec4(aPos, 1.0);
}`;

const fsDebugQuadDepth = `#version 300 es
precision highp float;
out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D depthMap;
uniform float near_plane;
uniform float far_plane;

// required when using a perspective projection matrix
float LinearizeDepth(float depth)
{
    float z = depth * 2.0 - 1.0; // Back to NDC 
    return (2.0 * near_plane * far_plane) / (far_plane + near_plane - z * (far_plane - near_plane));	
}

void main()
{             
    float depthValue = texture(depthMap, TexCoords).r;
    // FragColor = vec4(vec3(LinearizeDepth(depthValue) / far_plane), 1.0); // perspective
    FragColor = vec4(vec3(depthValue), 1.0); // orthographic
}`;

const vsShadowMapping = `#version 300 es
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;

// out vec2 TexCoords;

// out VS_OUT {
//     vec3 FragPos;
//     vec3 Normal;
//     vec2 TexCoords;
//     vec4 FragPosLightSpace;
// } vs_out;
out vec3 FragPos;
out vec3 Normal;
out vec2 TexCoords;
out vec4 FragPosLightSpace;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform mat4 lightSpaceMatrix;

void main()
{
    FragPos = vec3(model * vec4(aPos, 1.0));
    Normal = transpose(inverse(mat3(model))) * aNormal;
    TexCoords = aTexCoords;
    FragPosLightSpace = lightSpaceMatrix * vec4(FragPos, 1.0);
    gl_Position = projection * view * model * vec4(aPos, 1.0);
}`;

const fsShadowMapping = `#version 300 es
precision highp float;
out vec4 FragColor;

// in VS_OUT {
//     vec3 FragPos;
//     vec3 Normal;
//     vec2 TexCoords;
//     vec4 FragPosLightSpace;
// } fs_in;

in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoords;
in vec4 FragPosLightSpace;

uniform sampler2D diffuseTexture;
uniform sampler2D shadowMap;

uniform vec3 lightPos;
uniform vec3 viewPos;

float ShadowCalculation(vec4 fragPosLightSpace)
{
    // perform perspective divide
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    // transform to [0,1] range
    projCoords = projCoords * 0.5 + 0.5;
    // get closest depth value from light's perspective (using [0,1] range fragPosLight as coords)
    float closestDepth = texture(shadowMap, projCoords.xy).r; 
    // get depth of current fragment from light's perspective
    float currentDepth = projCoords.z;
    // check whether current frag pos is in shadow
    float shadow = currentDepth > closestDepth  ? 1.0 : 0.0;

    return shadow;
}

void main()
{           
    vec3 color = texture(diffuseTexture, TexCoords).rgb;
    vec3 normal = normalize(Normal);
    vec3 lightColor = vec3(0.3);
    // ambient
    vec3 ambient = 0.3 * color;
    // diffuse
    vec3 lightDir = normalize(lightPos - FragPos);
    float diff = max(dot(lightDir, normal), 0.0);
    vec3 diffuse = diff * lightColor;
    // specular
    vec3 viewDir = normalize(viewPos - FragPos);
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = 0.0;
    vec3 halfwayDir = normalize(lightDir + viewDir);  
    spec = pow(max(dot(normal, halfwayDir), 0.0), 64.0);
    vec3 specular = spec * lightColor;    
    // calculate shadow
    float shadow = ShadowCalculation(FragPosLightSpace);                      
    vec3 lighting = (ambient + (1.0 - shadow) * (diffuse + specular)) * color;    
    
    FragColor = vec4(lighting, 1.0);
}`

export default function main() {
    const canvas = document.querySelector('#c') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        return;
    }

    // let SRC_WIDTH = gl.canvas.width;
    // let SRC_HEIGHT = gl.canvas.height;

    let camera = new Camera([0, 0, 3]);
    let deltaTime = 0;
    let lastFrame = 0;

    let lastX: number, lastY: number;
    let firstMouse = true;

    let lightPos = [-2, 4, -1];

    let shader = new Shader(gl, vsShadowMapping, fsShadowMapping);
    let simpleDepthShader = new Shader(gl, vsShadowMappingDepth, fsShadowMappingDepth);
    let debugDepthQuad = new Shader(gl, vsDebugQuadDepth, fsDebugQuadDepth);

    // set up vertex data (and buffer(s)) and configure vertex attributes
    // ------------------------------------------------------------------
    const planeVertices = [
        // positions        // normals     // texcoords
         25.0, -0.5,  25.0, 0.0, 1.0, 0.0, 25.0,  0.0,
        -25.0, -0.5,  25.0, 0.0, 1.0, 0.0,  0.0,  0.0,
        -25.0, -0.5, -25.0, 0.0, 1.0, 0.0,  0.0, 25.0,

         25.0, -0.5,  25.0, 0.0, 1.0, 0.0, 25.0,  0.0,
        -25.0, -0.5, -25.0, 0.0, 1.0, 0.0,  0.0, 25.0,
         25.0, -0.5, -25.0, 0.0, 1.0, 0.0, 25.0, 25.0
    ];

    // plane VAO
    let planeVAO = gl.createVertexArray();
    gl.bindVertexArray(planeVAO);

    let planeVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, planeVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(planeVertices), gl.STATIC_DRAW);

    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 8 * 4, 0);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 8 * 4, 3 * 4);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 8 * 4, 6 * 4);
    gl.enableVertexAttribArray(2);
    gl.bindVertexArray(null);

    // configure depth map FBO
    // -----------------------
    let SHADOW_WIDTH = 1024, SHADOW_HEIGHT = 1024;
    const depthMap = gl.createTexture();
    // const depthTextureSize = 512;
    gl.bindTexture(gl.TEXTURE_2D, depthMap);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, SHADOW_WIDTH, SHADOW_HEIGHT, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    // attach depth texture as FBO's depth buffer
    let depthMapFBO = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthMapFBO);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthMap, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    webglUtils.resizeCanvasToDisplaySize(canvas);

    gl.enable(gl.DEPTH_TEST);

    shader.use();
    shader.setInt("diffuseTexture", 0);
    shader.setInt("shadowMap", 1);
    debugDepthQuad.use();
    debugDepthQuad.setInt("depthMap", 0);

    const loadImage = function (imageSrc: string) {
        let promise: Promise<HTMLImageElement> = new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                resolve(image);
            };
            image.onerror = () => {
                reject();
            }
            image.src = imageSrc;
        });
        return promise;
    };

    render();

    async function render() {

        let woodTexture = await loadImage("./resources/images/wood.png").then(image => {
            return loadTexture(image);
        })
        // let floortexture = await loadImage("./resources/images/metal.png").then(image => {
        //     return loadTexture(image);
        // });

        requestAnimationFrame(drawScene);

        function drawScene(time: number) {
            let currentFrame = time;
            deltaTime = (currentFrame - lastFrame) * 0.001;
            lastFrame = currentFrame;

            gl.clearColor(0.2, 0.3, 0.3, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // 1. render depth of scene to texture (from light's perspective)
            // --------------------------------------------------------------
            simpleDepthShader.use();

            let near_plane = 1.0, far_plane = 17.5;
            let lightProjection = glm.orthographic(-10.0, 10.0, -10.0, 10.0, near_plane, far_plane);
            let lightView = glm.lookAt(lightPos, [0, 0, 0], [0.0, 1.0, 0.0]);
            let lightSpaceMatrix = glm.multiply(lightProjection, lightView);
            // render scene from light's point of view
            simpleDepthShader.setMat4("lightSpaceMatrix", lightSpaceMatrix);

            gl.viewport(0, 0, SHADOW_WIDTH, SHADOW_HEIGHT);
            gl.bindFramebuffer(gl.FRAMEBUFFER, depthMapFBO);
            gl.clear(gl.DEPTH_BUFFER_BIT);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, woodTexture);
            renderScene(simpleDepthShader);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            // reset viewport
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
            // 2. render scene as normal using the generated depth/shadow map  
            // --------------------------------------------------------------
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            shader.use();
            let view = camera.GetViewMatrix();
            // view = glm.inverse(view);
            shader.setMat4("view", view);

            let glcanvas = gl.canvas as HTMLCanvasElement;
            let aspect = glcanvas.clientWidth / glcanvas.clientHeight;
            let projection = glm.perspective(glm.radians(camera.Zoom), aspect, 0.1, 100);
            shader.setMat4('projection', projection);

            // set light uniforms
            shader.setVec3("viewPos", camera.Position);
            shader.setVec3("lightPos", lightPos);
            shader.setMat4("lightSpaceMatrix", lightSpaceMatrix);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, woodTexture);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, depthMap);
            renderScene(shader);

            // render Depth map to quad for visual debugging
            // ---------------------------------------------
            debugDepthQuad.use();
            debugDepthQuad.setFloat("near_plane", near_plane);
            debugDepthQuad.setFloat("far_plane", far_plane);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, depthMap);
            // renderQuad();

            requestAnimationFrame(drawScene);
        }
    }

    let cubeVAO: WebGLVertexArrayObject;
    let cubeVBO: WebGLBuffer;
    function renderCube() {
        // initialize (if necessary)
        if (!cubeVAO)
        {
            let vertices = [
                // back face
                -1.0, -1.0, -1.0,  0.0,  0.0, -1.0, 0.0, 0.0, // bottom-left
                 1.0,  1.0, -1.0,  0.0,  0.0, -1.0, 1.0, 1.0, // top-right
                 1.0, -1.0, -1.0,  0.0,  0.0, -1.0, 1.0, 0.0, // bottom-right         
                 1.0,  1.0, -1.0,  0.0,  0.0, -1.0, 1.0, 1.0, // top-right
                -1.0, -1.0, -1.0,  0.0,  0.0, -1.0, 0.0, 0.0, // bottom-left
                -1.0,  1.0, -1.0,  0.0,  0.0, -1.0, 0.0, 1.0, // top-left
                // front face
                -1.0, -1.0,  1.0,  0.0,  0.0,  1.0, 0.0, 0.0, // bottom-left
                1.0, -1.0,  1.0,  0.0,  0.0,  1.0, 1.0, 0.0, // bottom-right
                1.0,  1.0,  1.0,  0.0,  0.0,  1.0, 1.0, 1.0, // top-right
                1.0,  1.0,  1.0,  0.0,  0.0,  1.0, 1.0, 1.0, // top-right
                -1.0,  1.0,  1.0,  0.0,  0.0,  1.0, 0.0, 1.0, // top-left
                -1.0, -1.0,  1.0,  0.0,  0.0,  1.0, 0.0, 0.0, // bottom-left
                // left face
                -1.0,  1.0,  1.0, -1.0,  0.0,  0.0, 1.0, 0.0, // top-right
                -1.0,  1.0, -1.0, -1.0,  0.0,  0.0, 1.0, 1.0, // top-left
                -1.0, -1.0, -1.0, -1.0,  0.0,  0.0, 0.0, 1.0, // bottom-left
                -1.0, -1.0, -1.0, -1.0,  0.0,  0.0, 0.0, 1.0, // bottom-left
                -1.0, -1.0,  1.0, -1.0,  0.0,  0.0, 0.0, 0.0, // bottom-right
                -1.0,  1.0,  1.0, -1.0,  0.0,  0.0, 1.0, 0.0, // top-right
                // right face
                1.0,  1.0,  1.0,  1.0,  0.0,  0.0, 1.0, 0.0, // top-left
                1.0, -1.0, -1.0,  1.0,  0.0,  0.0, 0.0, 1.0, // bottom-right
                1.0,  1.0, -1.0,  1.0,  0.0,  0.0, 1.0, 1.0, // top-right         
                1.0, -1.0, -1.0,  1.0,  0.0,  0.0, 0.0, 1.0, // bottom-right
                1.0,  1.0,  1.0,  1.0,  0.0,  0.0, 1.0, 0.0, // top-left
                1.0, -1.0,  1.0,  1.0,  0.0,  0.0, 0.0, 0.0, // bottom-left     
                // bottom face
                -1.0, -1.0, -1.0,  0.0, -1.0,  0.0, 0.0, 1.0, // top-right
                1.0, -1.0, -1.0,  0.0, -1.0,  0.0, 1.0, 1.0, // top-left
                1.0, -1.0,  1.0,  0.0, -1.0,  0.0, 1.0, 0.0, // bottom-left
                1.0, -1.0,  1.0,  0.0, -1.0,  0.0, 1.0, 0.0, // bottom-left
                -1.0, -1.0,  1.0,  0.0, -1.0,  0.0, 0.0, 0.0, // bottom-right
                -1.0, -1.0, -1.0,  0.0, -1.0,  0.0, 0.0, 1.0, // top-right
                // top face
                -1.0,  1.0, -1.0,  0.0,  1.0,  0.0, 0.0, 1.0, // top-left
                1.0,  1.0,  1.0,  0.0,  1.0,  0.0, 1.0, 0.0, // bottom-right
                1.0,  1.0, -1.0,  0.0,  1.0,  0.0, 1.0, 1.0, // top-right     
                1.0,  1.0,  1.0,  0.0,  1.0,  0.0, 1.0, 0.0, // bottom-right
                -1.0,  1.0, -1.0,  0.0,  1.0,  0.0, 0.0, 1.0, // top-left
                -1.0,  1.0,  1.0,  0.0,  1.0,  0.0, 0.0, 0.0  // bottom-left        
            ];
            cubeVAO = gl.createVertexArray();
            cubeVBO = gl.createBuffer();
            // fill buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVBO);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
            // link vertex attributes
            gl.bindVertexArray(cubeVAO);
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 8 * 4, 0);
            gl.enableVertexAttribArray(1);
            gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 8 * 4, 3 * 4);
            gl.enableVertexAttribArray(2);
            gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 8 * 4, 6 * 4);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindVertexArray(null);
        }
        // render Cube
        gl.bindVertexArray(cubeVAO);
        gl.drawArrays(gl.TRIANGLES, 0, 36);
        gl.bindVertexArray(null);
    }

    let quadVAO: WebGLVertexArrayObject;
    let quadVBO: WebGLBuffer;
    function renderQuad() {
        if (!quadVAO)
        {
            let quadVertices = [
                // positions     // texture Coords
                -1.0,  1.0, 0.0, 0.0, 1.0,
                -1.0, -1.0, 0.0, 0.0, 0.0,
                 1.0,  1.0, 0.0, 1.0, 1.0,
                 1.0, -1.0, 0.0, 1.0, 0.0,
            ];
            // setup plane VAO
            quadVAO = gl.createVertexArray();
            quadVBO = gl.createBuffer();
            gl.bindVertexArray(quadVAO);
            gl.bindBuffer(gl.ARRAY_BUFFER, quadVBO);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadVertices), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 5 * 4, 0);
            gl.enableVertexAttribArray(1);
            gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 5 * 4, 3 * 4);
        }
        gl.bindVertexArray(quadVAO);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.bindVertexArray(null);
    }

    function renderScene(shader: Shader) {
        // floor
        let model = glm.identity();
        shader.setMat4("model", model);
        gl.bindVertexArray(planeVAO);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        // cubes
        model = glm.identity();
        model = glm.translate(model, [0.0, 1.5, 0.0]);
        model = glm.scale(model, 0.5, 0.5, 0.5);
        shader.setMat4("model", model);
        renderCube();
        model = glm.identity();
        model = glm.translate(model, [2.0, 0.0, 1.0]);
        model = glm.scale(model, 0.5, 0.5, 0.5);
        shader.setMat4("model", model);
        renderCube();
        model = glm.identity();
        model = glm.translate(model, [-1.0, 0.0, 2.0]);
        model = glm.axisRotate(model, glm.normalize([1.0, 0.0, 1.0]), glm.radians(60.0));
        model = glm.scale(model, 0.25, 0.25, 0.25);
        shader.setMat4("model", model);
        renderCube();
    }

    function loadTexture(image: HTMLImageElement) {

        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
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