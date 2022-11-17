import { Matrix4, Vector4 } from "./glm";

export default class shader{
    public ID: WebGLProgram;
    private gl: WebGLRenderingContext;
    constructor(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
        this.gl = gl; 
        let vertexShader = this.loadShader(gl, vertexSource, gl.VERTEX_SHADER);
        let fragmentShader = this.loadShader(gl, fragmentSource, gl.FRAGMENT_SHADER);

        this.ID = this.createProgram(gl, vertexShader, fragmentShader);
    }

    private createProgram(gl: WebGLRenderingContext, vertex: WebGLShader, fragment: WebGLShader) {
        
        let program = gl.createProgram();
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);
        var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            // something went wrong with the link
            var lastError = gl.getProgramInfoLog(program);
            console.error("Error in program linking:" + lastError);

            gl.deleteProgram(program);
            return null;
        }
        return program;
    }

    private loadShader(gl:WebGLRenderingContext ,shaderSource:string,shaderType:number) {
        var shader = gl.createShader(shaderType);
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);
        var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            // Something went wrong during compilation; get the error
            var lastError = gl.getShaderInfoLog(shader);
            console.error("*** Error compiling shader '" + shader + "':" + lastError);
            gl.deleteShader(shader);
            return null;
        }    
        return shader;
    }

    public use() {
        this.gl.useProgram(this.ID);
    }

    /**
     * setBool
     */
    public setBool(name: string, value: boolean) {
        let location = this.gl.getUniformLocation(this.ID, name);
        this.gl.uniform1i(location, Number(value));
    }

    /**
     * setInt
     */
    public setInt(name:string,value:number) {
        let location = this.gl.getUniformLocation(this.ID, name);
        this.gl.uniform1i(location, value);
    }

    public setFloat(name: string, value: number) {
        let location = this.gl.getUniformLocation(this.ID, name);
        this.gl.uniform1f(location, value);
    }

    /**
     * setVec2
     */
    public setVec2(name: string, value: number | number[] | Float32Array, value2?: number) {
        let location = this.gl.getUniformLocation(this.ID, name);
        if (typeof value == 'number') {
            this.gl.uniform2f(location, value, value2);
        } else {
            this.gl.uniform2fv(location, value);
        }
    }
    /**
     * setVec3
     */
    public setVec3(name: string, value: number | number[] | Float32Array, value2?: number, value3?: number) {
        let location = this.gl.getUniformLocation(this.ID, name);
        if (typeof value == 'number') {
            this.gl.uniform3f(location, value, value2, value3);
        } else {
            this.gl.uniform3fv(location, value);
        }
    }
    
    /**
     * setVec4
     */
    public setVec4(name: string, value: number | Vector4, value2?: number, value3?: number, value4?: number) {
        let location = this.gl.getUniformLocation(this.ID, name);
        if (typeof value == 'number') {
            this.gl.uniform4f(location, value, value2, value3, value4);
        } else {
            this.gl.uniform4fv(location, value);
        }
    }

    /**
     * setMat2
     */
    public setMat2(name:string,value:Matrix4) {
        let location = this.gl.getUniformLocation(this.ID, name);
        this.gl.uniformMatrix2fv(location, false, value);
    }
    /**
     * setMat3
     */
     public setMat3(name:string,value:Matrix4) {
        let location = this.gl.getUniformLocation(this.ID, name);
        this.gl.uniformMatrix3fv(location, false, value);
    }
    /**
     * setMat4
     */
     public setMat4(name:string,value:Matrix4) {
        let location = this.gl.getUniformLocation(this.ID, name);
        this.gl.uniformMatrix4fv(location, false, value);
    }
}