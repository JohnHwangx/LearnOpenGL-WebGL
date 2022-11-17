export type ProgramInfo = {
    program: WebGLProgram,
    uniformSetters: Setters,
    attribSetters: Setters
};

export type Setters = { [x: string]: Function };

export type UniformValues = { [x: string]: any };

export type VertexValues = { [x: string]: any };
export type BufferInfos = { [x: string]: any };

// export default class webglUtils {
/**
   * Wrapped logging function.
   * @param {string} msg The message to log.
   */
function error(msg: string) {
    // if (this.topWindow.console) {
    //     if (topWindow.console.error) {
    //         topWindow.console.error(msg);
    //     } else if (topWindow.console.log) {
    //         topWindow.console.log(msg);
    //     }
    // }
}
/**
* Resize a canvas to match the size its displayed.
* @param {HTMLCanvasElement} canvas The canvas to resize.
* @param {number} [multiplier] amount to multiply by.
*    Pass in window.devicePixelRatio for native pixels.
* @return {boolean} true if the canvas was resized.
* @memberOf module:webgl-utils
*/
function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement, multiplier?: number): boolean {
    multiplier = multiplier || 1;
    var width = canvas.clientWidth * multiplier | 0;
    var height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
    }
    return false;
}

const defaultShaderType = [
    "VERTEX_SHADER",
    "FRAGMENT_SHADER",
];

/**
* Creates a program from 2 script tags.
* @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
* @param {string[]} shaderStrings Array of ids of the script tags for the shaders. The first is assumed to be the
vertex shader, the second the fragment shader.
* @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
* @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
* @param {} opt_errorCallback callback for errors. By default it just prints an error to the console
on error. If you want something else pass an callback. It's passed an error message.
* @return {WebGLProgram} The created program.
* @memberOf module:webgl-utils
*/
function createProgramFromStrings(
    gl: WebGLRenderingContext,
    shaderStrings: string[],
    opt_attribs?: string[],
    opt_locations?: number[],
    opt_errorCallback?: any): WebGLProgram {

    var shaders = [];
    for (var ii = 0; ii < shaderStrings.length; ++ii) {
        shaders.push(createShaderFromString(
            gl, shaderStrings[ii], gl[defaultShaderType[ii]], opt_errorCallback));
    }
    return createProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback);
}

/**
* Loads a shader from a script tag.
* @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
* @param {string} shaderString The id of the script tag.
* @param {number} opt_shaderType The type of shader. If not passed in it will
be derived from the type of the script tag.
* @param {} opt_errorCallback callback for errors.
* @return {WebGLShader} The created shader.
*/
function createShaderFromString(
    gl: WebGLRenderingContext,
    shaderString: string,
    opt_shaderType?: number,
    opt_errorCallback?: any): WebGLShader {

    var shaderSource = "";
    var shaderType: number;
    // var shaderScript = document.getElementById(scriptId);
    // if (!shaderScript) {
    //     throw ("*** Error: unknown script element" + scriptId);
    // }
    shaderSource = shaderString;

    // if (!opt_shaderType) {
    //     if (shaderScript.type === "x-shader/x-vertex") {
    //         shaderType = gl.VERTEX_SHADER;
    //     } else if (shaderScript.type === "x-shader/x-fragment") {
    //         shaderType = gl.FRAGMENT_SHADER;
    //     } else if (shaderType !== gl.VERTEX_SHADER && shaderType !== gl.FRAGMENT_SHADER) {
    //         throw ("*** Error: unknown shader type");
    //     }
    // }

    return loadShader(
        gl, shaderSource, opt_shaderType ? opt_shaderType : shaderType,
        opt_errorCallback);
}

/**
 * Loads a shader.
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {string} shaderSource The shader source.
 * @param {number} shaderType The type of shader.
 * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors.
 * @return {WebGLShader} The created shader.
 */
function loadShader(
    gl: WebGLRenderingContext,
    shaderSource: string,
    shaderType: number,
    opt_errorCallback: any): WebGLShader {

    var errFn = opt_errorCallback || error;
    // Create the shader object
    var shader = gl.createShader(shaderType);

    // Load the shader source
    gl.shaderSource(shader, shaderSource);

    // Compile the shader
    gl.compileShader(shader);

    // Check the compile status
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

/**
* Creates a program, attaches shaders, binds attrib locations, links the
* program and calls useProgram.
* @param {WebGLShader[]} shaders The shaders to attach
* @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
* @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
* @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
*        on error. If you want something else pass an callback. It's passed an error message.
* @memberOf module:webgl-utils
*/
function createProgram(
    gl: WebGLRenderingContext,
    shaders: WebGLShader[],
    opt_attribs: string[],
    opt_locations: number[],
    opt_errorCallback: (msg: string) => void)
{

    var errFn = opt_errorCallback || error;
    var program = gl.createProgram();
    shaders.forEach(function (shader) {
        gl.attachShader(program, shader);
    });
    if (opt_attribs) {
        opt_attribs.forEach(function (attrib, ndx) {
            gl.bindAttribLocation(
                program,
                opt_locations ? opt_locations[ndx] : ndx,
                attrib);
        });
    }
    gl.linkProgram(program);

    // Check the link status
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

/**
   * Creates a ProgramInfo from 2 sources.
   *
   * A ProgramInfo contains
   *
   *     programInfo = {
   *        program: WebGLProgram,
   *        uniformSetters: object of setters as returned from createUniformSetters,
   *        attribSetters: object of setters as returned from createAttribSetters,
   *     }
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext
   *        to use.
   * @param {string[]} shaderSourcess Array of sources for the
   *        shaders or ids. The first is assumed to be the vertex shader,
   *        the second the fragment shader.
   * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
   * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
   *        on error. If you want something else pass an callback. It's passed an error message.
   * @return {module:webgl-utils.ProgramInfo} The created program.
   * @memberOf module:webgl-utils
   */
function createProgramInfo(
    gl: WebGLRenderingContext,
    shaderSources: string[],
    opt_attribs?: string[],
    opt_locations?: number[],
    opt_errorCallback?: any): ProgramInfo
{
    // shaderSources = shaderSources.map(function (source) {
    //   var script = document.getElementById(source);
    //   return script ? script.text : source;
    // });
    var program = createProgramFromStrings(gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback);
    if (!program) {
        return null;
    }
    var uniformSetters = createUniformSetters(gl, program);
    var attribSetters = createAttributeSetters(gl, program);

    let programInfor: ProgramInfo = {
        program: program,
        uniformSetters: uniformSetters,
        attribSetters: attribSetters
    };
    return programInfor;
}

/**
 * Sets attributes and buffers including the `ELEMENT_ARRAY_BUFFER` if appropriate
 *
 * Example:
 *
 *     var programInfo = createProgramInfo(
 *         gl, ["some-vs", "some-fs");
 *
 *     var arrays = {
 *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
 *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
 *     };
 *
 *     var bufferInfo = createBufferInfoFromArrays(gl, arrays);
 *
 *     gl.useProgram(programInfo.program);
 *
 * This will automatically bind the buffers AND set the
 * attributes.
 *
 *     setBuffersAndAttributes(programInfo.attribSetters, bufferInfo);
 *
 * For the example above it is equivilent to
 *
 *     gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
 *     gl.enableVertexAttribArray(a_positionLocation);
 *     gl.vertexAttribPointer(a_positionLocation, 3, gl.FLOAT, false, 0, 0);
 *     gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
 *     gl.enableVertexAttribArray(a_texcoordLocation);
 *     gl.vertexAttribPointer(a_texcoordLocation, 4, gl.FLOAT, false, 0, 0);
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext.
 * @param {Object.<string, function>} setters Attribute setters as returned from `createAttributeSetters`
 * @param {module:webgl-utils.BufferInfo} buffers a BufferInfo as returned from `createBufferInfoFromArrays`.
 * @memberOf module:webgl-utils
 */
function setBuffersAndAttributes(gl: WebGLRenderingContext, setters: ProgramInfo | Setters, buffers: BufferInfos) {
    setAttributes(setters, buffers.attribs);
    if (buffers.indices) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    }
}

/**
 * Set uniforms and binds related textures.
 *
 * example:
 *
 *     var programInfo = createProgramInfo(
 *         gl, ["some-vs", "some-fs");
 *
 *     var tex1 = gl.createTexture();
 *     var tex2 = gl.createTexture();
 *
 *     ... assume we setup the textures with data ...
 *
 *     var uniforms = {
 *       u_someSampler: tex1,
 *       u_someOtherSampler: tex2,
 *       u_someColor: [1,0,0,1],
 *       u_somePosition: [0,1,1],
 *       u_someMatrix: [
 *         1,0,0,0,
 *         0,1,0,0,
 *         0,0,1,0,
 *         0,0,0,0,
 *       ],
 *     };
 *
 *     gl.useProgram(program);
 *
 * This will automatically bind the textures AND set the
 * uniforms.
 *
 *     setUniforms(programInfo.uniformSetters, uniforms);
 *
 * For the example above it is equivalent to
 *
 *     var texUnit = 0;
 *     gl.activeTexture(gl.TEXTURE0 + texUnit);
 *     gl.bindTexture(gl.TEXTURE_2D, tex1);
 *     gl.uniform1i(u_someSamplerLocation, texUnit++);
 *     gl.activeTexture(gl.TEXTURE0 + texUnit);
 *     gl.bindTexture(gl.TEXTURE_2D, tex2);
 *     gl.uniform1i(u_someSamplerLocation, texUnit++);
 *     gl.uniform4fv(u_someColorLocation, [1, 0, 0, 1]);
 *     gl.uniform3fv(u_somePositionLocation, [0, 1, 1]);
 *     gl.uniformMatrix4fv(u_someMatrix, false, [
 *         1,0,0,0,
 *         0,1,0,0,
 *         0,0,1,0,
 *         0,0,0,0,
 *       ]);
 *
 * Note it is perfectly reasonable to call `setUniforms` multiple times. For example
 *
 *     var uniforms = {
 *       u_someSampler: tex1,
 *       u_someOtherSampler: tex2,
 *     };
 *
 *     var moreUniforms {
 *       u_someColor: [1,0,0,1],
 *       u_somePosition: [0,1,1],
 *       u_someMatrix: [
 *         1,0,0,0,
 *         0,1,0,0,
 *         0,0,1,0,
 *         0,0,0,0,
 *       ],
 *     };
 *
 *     setUniforms(programInfo.uniformSetters, uniforms);
 *     setUniforms(programInfo.uniformSetters, moreUniforms);
 *
 * @param {Object.<string, function>|module:webgl-utils.ProgramInfo} setters the setters returned from
 *        `createUniformSetters` or a ProgramInfo from {@link module:webgl-utils.createProgramInfo}.
 * @param {Object.<string, value>} an object with values for the
 *        uniforms.
 * @memberOf module:webgl-utils
 */
function setUniforms(setters: ProgramInfo | Setters, values: UniformValues) {
    let mySetters = setters.uniformSetters || setters;

    Object.keys(values).forEach(function (name) {
        var setter = mySetters[name];
        if (setter) {
            setter(values[name]);
        }
    });
}

/**
 * Creates setter functions for all attributes of a shader
 * program. You can pass this to {@link module:webgl-utils.setBuffersAndAttributes} to set all your buffers and attributes.
 *
 * @see {@link module:webgl-utils.setAttributes} for example
 * @param {WebGLProgram} program the program to create setters for.
 * @return {Object.<string, function>} an object with a setter for each attribute by name.
 * @memberOf module:webgl-utils
 */
function createAttributeSetters(gl: WebGLRenderingContext, program: WebGLProgram): Setters {
    var attribSetters:Setters = {};

    function createAttribSetter(index: number): Function {
        return function (b: any) {
            gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
            gl.enableVertexAttribArray(index);
            gl.vertexAttribPointer(
                index, b.numComponents || b.size, b.type || gl.FLOAT, b.normalize || false, b.stride || 0, b.offset || 0);
        };
    }

    var numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (var ii = 0; ii < numAttribs; ++ii) {
        var attribInfo = gl.getActiveAttrib(program, ii);
        if (!attribInfo) {
            break;
        }
        var index = gl.getAttribLocation(program, attribInfo.name);
        attribSetters[attribInfo.name] = createAttribSetter(index);
    }

    return attribSetters;
}

/**
 * Sets attributes and binds buffers (deprecated... use {@link module:webgl-utils.setBuffersAndAttributes})
 *
 * Example:
 *
 *     var program = createProgramFromScripts(
 *         gl, ["some-vs", "some-fs");
 *
 *     var attribSetters = createAttributeSetters(program);
 *
 *     var positionBuffer = gl.createBuffer();
 *     var texcoordBuffer = gl.createBuffer();
 *
 *     var attribs = {
 *       a_position: {buffer: positionBuffer, numComponents: 3},
 *       a_texcoord: {buffer: texcoordBuffer, numComponents: 2},
 *     };
 *
 *     gl.useProgram(program);
 *
 * This will automatically bind the buffers AND set the
 * attributes.
 *
 *     setAttributes(attribSetters, attribs);
 *
 * Properties of attribs. For each attrib you can add
 * properties:
 *
 * *   type: the type of data in the buffer. Default = gl.FLOAT
 * *   normalize: whether or not to normalize the data. Default = false
 * *   stride: the stride. Default = 0
 * *   offset: offset into the buffer. Default = 0
 *
 * For example if you had 3 value float positions, 2 value
 * float texcoord and 4 value uint8 colors you'd setup your
 * attribs like this
 *
 *     var attribs = {
 *       a_position: {buffer: positionBuffer, numComponents: 3},
 *       a_texcoord: {buffer: texcoordBuffer, numComponents: 2},
 *       a_color: {
 *         buffer: colorBuffer,
 *         numComponents: 4,
 *         type: gl.UNSIGNED_BYTE,
 *         normalize: true,
 *       },
 *     };
 *
 * @param {Object.<string, function>|model:webgl-utils.ProgramInfo} setters Attribute setters as returned from createAttributeSetters or a ProgramInfo as returned {@link module:webgl-utils.createProgramInfo}
 * @param {Object.<string, module:webgl-utils.AttribInfo>} attribs AttribInfos mapped by attribute name.
 * @memberOf module:webgl-utils
 * @deprecated use {@link module:webgl-utils.setBuffersAndAttributes}
 */
function setAttributes(setters:ProgramInfo | Setters, attribs:any) {
    let mySetters = setters.attribSetters || setters;

    Object.keys(attribs).forEach(function (name) {
        var setter = mySetters[name];
        if (setter) {
            setter(attribs[name]);
        }
    });
}

/**
   * Creates setter functions for all uniforms of a shader
   * program.
   *
   * @see {@link module:webgl-utils.setUniforms}
   *
   * @param {WebGLProgram} program the program to create setters for.
   * @returns {Object.<string, function>} an object with a setter by name for each uniform
   * @memberOf module:webgl-utils
   */
function createUniformSetters(gl: WebGLRenderingContext, program: WebGLProgram): Setters {
    var textureUnit = 0;

    /**
     * Creates a setter for a uniform of the given program with it's
     * location embedded in the setter.
     * @param {WebGLProgram} program
     * @param {WebGLUniformInfo} uniformInfo
     * @returns {function} the created setter.
     */
    function createUniformSetter(program: WebGLProgram, uniformInfo: WebGLActiveInfo): Function {
        var location = gl.getUniformLocation(program, uniformInfo.name);
        var type = uniformInfo.type;
        // Check if this uniform is an array
        var isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) === "[0]");
        if (type === gl.FLOAT && isArray) {
            return function (v: number[] | Float32Array) {
                gl.uniform1fv(location, v);
            };
        }
        if (type === gl.FLOAT) {
            return function (v: number) {
                gl.uniform1f(location, v);
            };
        }
        if (type === gl.FLOAT_VEC2) {
            return function (v: number[] | Float32Array) {
                gl.uniform2fv(location, v);
            };
        }
        if (type === gl.FLOAT_VEC3) {
            return function (v: number[] | Float32Array) {
                gl.uniform3fv(location, v);
            };
        }
        if (type === gl.FLOAT_VEC4) {
            return function (v: number[] | Float32Array) {
                gl.uniform4fv(location, v);
            };
        }
        if (type === gl.INT && isArray) {
            return function (v: Int32List) {
                gl.uniform1iv(location, v);
            };
        }
        if (type === gl.INT) {
            return function (v: number) {
                gl.uniform1i(location, v);
            };
        }
        if (type === gl.INT_VEC2) {
            return function (v: Int32List) {
                gl.uniform2iv(location, v);
            };
        }
        if (type === gl.INT_VEC3) {
            return function (v: Int32List) {
                gl.uniform3iv(location, v);
            };
        }
        if (type === gl.INT_VEC4) {
            return function (v: Int32List) {
                gl.uniform4iv(location, v);
            };
        }
        if (type === gl.BOOL) {
            return function (v: Int32List) {
                gl.uniform1iv(location, v);
            };
        }
        if (type === gl.BOOL_VEC2) {
            return function (v: Int32List) {
                gl.uniform2iv(location, v);
            };
        }
        if (type === gl.BOOL_VEC3) {
            return function (v: Int32List) {
                gl.uniform3iv(location, v);
            };
        }
        if (type === gl.BOOL_VEC4) {
            return function (v: Int32List) {
                gl.uniform4iv(location, v);
            };
        }
        if (type === gl.FLOAT_MAT2) {
            return function (v: Float32List) {
                gl.uniformMatrix2fv(location, false, v);
            };
        }
        if (type === gl.FLOAT_MAT3) {
            return function (v: Float32List) {
                gl.uniformMatrix3fv(location, false, v);
            };
        }
        if (type === gl.FLOAT_MAT4) {
            return function (v: Float32List) {
                gl.uniformMatrix4fv(location, false, v);
            };
        }
        if ((type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) && isArray) {
            var units: number[] = [];
            for (var ii = 0; ii < uniformInfo.size; ++ii) {
                units.push(textureUnit++);
            }
            return function (bindPoint: number, units: number[]) {
                return function (textures: WebGLTexture[]) {
                    gl.uniform1iv(location, units);
                    textures.forEach(function (texture, index) {
                        gl.activeTexture(gl.TEXTURE0 + units[index]);
                        gl.bindTexture(bindPoint, texture);
                    });
                };
            }(getBindPointForSamplerType(gl, type), units);
        }
        if (type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) {
            return function (bindPoint, unit) {
                return function (texture: WebGLTexture) {
                    gl.uniform1i(location, unit);
                    gl.activeTexture(gl.TEXTURE0 + unit);
                    gl.bindTexture(bindPoint, texture);
                };
            }(getBindPointForSamplerType(gl, type), textureUnit++);
        }
        throw ("unknown type: 0x" + type.toString(16)); // we should never get here.
    }

    var uniformSetters:Setters = {};
    var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

    for (var ii = 0; ii < numUniforms; ++ii) {
        var uniformInfo = gl.getActiveUniform(program, ii);
        if (!uniformInfo) {
            break;
        }
        var name = uniformInfo.name;
        // remove the array suffix.
        if (name.substr(-3) === "[0]") {
            name = name.substr(0, name.length - 3);
        }
        var setter = createUniformSetter(program, uniformInfo);
        uniformSetters[name] = setter;
    }
    return uniformSetters;
}

/**
 * Returns the corresponding bind point for a given sampler type
 */
function getBindPointForSamplerType(gl: WebGLRenderingContext, type: number) {
    if (type === gl.SAMPLER_2D) return gl.TEXTURE_2D;        // eslint-disable-line
    if (type === gl.SAMPLER_CUBE) return gl.TEXTURE_CUBE_MAP;  // eslint-disable-line
    return undefined;
}

function allButIndices(name: string) {
    return name !== "indices";
}

function createMapping(obj) {
    var mapping = {};
    Object.keys(obj).filter(allButIndices).forEach(function (key) {
        mapping["a_" + key] = key;
    });
    return mapping;
}

function getGLTypeForTypedArray(gl: WebGLRenderingContext, typedArray: any) {
    if (typedArray instanceof Int8Array) { return gl.BYTE; }            // eslint-disable-line
    if (typedArray instanceof Uint8Array) { return gl.UNSIGNED_BYTE; }   // eslint-disable-line
    if (typedArray instanceof Int16Array) { return gl.SHORT; }           // eslint-disable-line
    if (typedArray instanceof Uint16Array) { return gl.UNSIGNED_SHORT; }  // eslint-disable-line
    if (typedArray instanceof Int32Array) { return gl.INT; }             // eslint-disable-line
    if (typedArray instanceof Uint32Array) { return gl.UNSIGNED_INT; }    // eslint-disable-line
    if (typedArray instanceof Float32Array) { return gl.FLOAT; }           // eslint-disable-line
    throw "unsupported typed array type";
}

// This is really just a guess. Though I can't really imagine using
// anything else? Maybe for some compression?
function getNormalizationForTypedArray(typedArray: any) {
    if (typedArray instanceof Int8Array) { return true; }  // eslint-disable-line
    if (typedArray instanceof Uint8Array) { return true; }  // eslint-disable-line
    return false;
}

function isArrayBuffer(a) {
    return a.buffer && a.buffer instanceof ArrayBuffer;
}

function guessNumComponentsFromName(name: string, length?: number) {
    var numComponents:number;
    if (name.indexOf("coord") >= 0) {
        numComponents = 2;
    } else if (name.indexOf("color") >= 0) {
        numComponents = 4;
    } else {
        numComponents = 3;  // position, normals, indices ...
    }

    if (length % numComponents > 0) {
        throw "can not guess numComponents. You should specify it.";
    }

    return numComponents;
}

/**
 * creates a typed array with a `push` function attached
 * so that you can easily *push* values.
 *
 * `push` can take multiple arguments. If an argument is an array each element
 * of the array will be added to the typed array.
 *
 * Example:
 *
 *     var array = createAugmentedTypedArray(3, 2);  // creates a Float32Array with 6 values
 *     array.push(1, 2, 3);
 *     array.push([4, 5, 6]);
 *     // array now contains [1, 2, 3, 4, 5, 6]
 *
 * Also has `numComponents` and `numElements` properties.
 *
 * @param {number} numComponents number of components
 * @param {number} numElements number of elements. The total size of the array will be `numComponents * numElements`.
 * @param {constructor} opt_type A constructor for the type. Default = `Float32Array`.
 * @return {ArrayBuffer} A typed array.
 * @memberOf module:webgl-utils
 */
function createAugmentedTypedArray(numComponents: number, numElements: number, opt_type?: any): any {
    var Type = opt_type || Float32Array;
    return augmentTypedArray(new Type(numComponents * numElements), numComponents);
    // return new AugmentTypedArray(numComponents, numElements, opt_type);
}

/**
 * tries to get the number of elements from a set of arrays.
 */
function getNumElementsFromNonIndexedArrays(arrays) {
    var key = Object.keys(arrays)[0];
    var array = arrays[key];
    if (isArrayBuffer(array)) {
        return array.numElements;
    } else {
        return array.data.length / array.numComponents;
    }
}

type TypedArray = any;

export class AugmentTypedArray1{
    private cursor: number;
    public numComponents: number;
    private arrayBuffer: any;

    constructor(numComponents: number, numElements: number, opt_type?: TypedArray) {
        this.cursor = 0;
        this.numComponents = numComponents;
        var Type = opt_type || Float32Array;
        this.arrayBuffer = new Type(numComponents * numElements);       
    }
    
    public push(...arg:any[]) {
        for (var ii = 0; ii < arg.length; ++ii) {
            var value = arg[ii];
            if (value instanceof Array || (value.buffer && value.buffer instanceof ArrayBuffer)) {
                for (var jj = 0; jj < value.length; ++jj) {
                    this.arrayBuffer[this.cursor++] = value[jj];
                }
            } else {
                this.arrayBuffer[this.cursor++] = value;
            }
        }
    }

    public reset(opt_index: number) {
        this.cursor = opt_index || 0;
    }

    public get ArrayBuffer() : any {
        return this.arrayBuffer;
    }
    

    public get numElements() : number {
        return this.arrayBuffer.length / this.numComponents | 0;
    }
    
}

// Add `push` to a typed array. It just keeps a 'cursor'
// and allows use to `push` values into the array so we
// don't have to manually compute offsets
function augmentTypedArray(typedArray: any, numComponents:number) {
    var cursor = 0;
    typedArray.push = function () {
        for (var ii = 0; ii < arguments.length; ++ii) {
            var value = arguments[ii];
            if (value instanceof Array || (value.buffer && value.buffer instanceof ArrayBuffer)) {
                for (var jj = 0; jj < value.length; ++jj) {
                    typedArray[cursor++] = value[jj];
                }
            } else {
                typedArray[cursor++] = value;
            }
        }
    };
    typedArray.reset = function (opt_index: number) {
        cursor = opt_index || 0;
    };
    typedArray.numComponents = numComponents;
    Object.defineProperty(typedArray, 'numElements', {
        get: function () {
            return this.length / this.numComponents | 0;
        },
    });
    return typedArray;
}

function createBufferFromTypedArray(gl: WebGLRenderingContext, array: BufferSource, type?: number, drawType?: number) {
    type = type || gl.ARRAY_BUFFER;
    var buffer = gl.createBuffer();
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, array, drawType || gl.STATIC_DRAW);
    return buffer;
}

function makeTypedArray(array: any, name: string) {
    if (isArrayBuffer(array)) {
        return array;
    }

    if (array.data && isArrayBuffer(array.data)) {
        return array.data;
    }

    if (Array.isArray(array)) {
        array = {
            data: array,
        };
    }

    if (!array.numComponents) {
        array.numComponents = guessNumComponentsFromName(name, array.length);
    }

    var type = array.type;
    if (!type) {
        if (name === "indices") {
            type = Uint16Array;
        }
    }
    var typedArray = createAugmentedTypedArray(array.numComponents, array.data.length / array.numComponents | 0, type);
    typedArray.push(array.data);
    return typedArray;
}

/**
 * Creates a set of attribute data and WebGLBuffers from set of arrays
 *
 * Given
 *
 *      var arrays = {
 *        position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
 *        texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
 *        normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
 *        color:    { numComponents: 4, data: [255, 255, 255, 255, 255, 0, 0, 255, 0, 0, 255, 255], type: Uint8Array, },
 *        indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
 *      };
 *
 * returns something like
 *
 *      var attribs = {
 *        a_position: { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
 *        a_texcoord: { numComponents: 2, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
 *        a_normal:   { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
 *        a_color:    { numComponents: 4, type: gl.UNSIGNED_BYTE, normalize: true,  buffer: WebGLBuffer, },
 *      };
 *
 * @param {WebGLRenderingContext} gl The webgl rendering context.
 * @param {Object.<string, array|typedarray>} arrays The arrays
 * @param {Object.<string, string>} [opt_mapping] mapping from attribute name to array name.
 *     if not specified defaults to "a_name" -> "name".
 * @return {Object.<string, module:webgl-utils.AttribInfo>} the attribs
 * @memberOf module:webgl-utils
 */
function createAttribsFromArrays(gl: WebGLRenderingContext, arrays: VertexValues, opt_mapping?: any):any {
    var mapping = opt_mapping || createMapping(arrays);
    var attribs = {};
    Object.keys(mapping).forEach(function (attribName) {
        var bufferName = mapping[attribName];
        var origArray = arrays[bufferName];
        var array = makeTypedArray(origArray, bufferName);
        attribs[attribName] = {
            buffer: createBufferFromTypedArray(gl, array),
            numComponents: origArray.numComponents || array.numComponents || guessNumComponentsFromName(bufferName),
            type: getGLTypeForTypedArray(gl, array),
            normalize: getNormalizationForTypedArray(array),
        };
    });
    return attribs;
}

/**
 * Creates a BufferInfo from an object of arrays.
 *
 * This can be passed to {@link module:webgl-utils.setBuffersAndAttributes} and to
 * {@link module:webgl-utils:drawBufferInfo}.
 *
 * Given an object like
 *
 *     var arrays = {
 *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
 *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
 *       normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
 *       indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
 *     };
 *
 *  Creates an BufferInfo like this
 *
 *     bufferInfo = {
 *       numElements: 4,        // or whatever the number of elements is
 *       indices: WebGLBuffer,  // this property will not exist if there are no indices
 *       attribs: {
 *         a_position: { buffer: WebGLBuffer, numComponents: 3, },
 *         a_normal:   { buffer: WebGLBuffer, numComponents: 3, },
 *         a_texcoord: { buffer: WebGLBuffer, numComponents: 2, },
 *       },
 *     };
 *
 *  The properties of arrays can be JavaScript arrays in which case the number of components
 *  will be guessed.
 *
 *     var arrays = {
 *        position: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0],
 *        texcoord: [0, 0, 0, 1, 1, 0, 1, 1],
 *        normal:   [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
 *        indices:  [0, 1, 2, 1, 2, 3],
 *     };
 *
 *  They can also by TypedArrays
 *
 *     var arrays = {
 *        position: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]),
 *        texcoord: new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
 *        normal:   new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
 *        indices:  new Uint16Array([0, 1, 2, 1, 2, 3]),
 *     };
 *
 *  Or augmentedTypedArrays
 *
 *     var positions = createAugmentedTypedArray(3, 4);
 *     var texcoords = createAugmentedTypedArray(2, 4);
 *     var normals   = createAugmentedTypedArray(3, 4);
 *     var indices   = createAugmentedTypedArray(3, 2, Uint16Array);
 *
 *     positions.push([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]);
 *     texcoords.push([0, 0, 0, 1, 1, 0, 1, 1]);
 *     normals.push([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
 *     indices.push([0, 1, 2, 1, 2, 3]);
 *
 *     var arrays = {
 *        position: positions,
 *        texcoord: texcoords,
 *        normal:   normals,
 *        indices:  indices,
 *     };
 *
 * For the last example it is equivalent to
 *
 *     var bufferInfo = {
 *       attribs: {
 *         a_position: { numComponents: 3, buffer: gl.createBuffer(), },
 *         a_texcoods: { numComponents: 2, buffer: gl.createBuffer(), },
 *         a_normals: { numComponents: 3, buffer: gl.createBuffer(), },
 *       },
 *       indices: gl.createBuffer(),
 *       numElements: 6,
 *     };
 *
 *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_position.buffer);
 *     gl.bufferData(gl.ARRAY_BUFFER, arrays.position, gl.STATIC_DRAW);
 *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_texcoord.buffer);
 *     gl.bufferData(gl.ARRAY_BUFFER, arrays.texcoord, gl.STATIC_DRAW);
 *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_normal.buffer);
 *     gl.bufferData(gl.ARRAY_BUFFER, arrays.normal, gl.STATIC_DRAW);
 *     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indices);
 *     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrays.indices, gl.STATIC_DRAW);
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @param {Object.<string, array|object|typedarray>} arrays Your data
 * @param {Object.<string, string>} [opt_mapping] an optional mapping of attribute to array name.
 *    If not passed in it's assumed the array names will be mapped to an attribute
 *    of the same name with "a_" prefixed to it. An other words.
 *
 *        var arrays = {
 *           position: ...,
 *           texcoord: ...,
 *           normal:   ...,
 *           indices:  ...,
 *        };
 *
 *        bufferInfo = createBufferInfoFromArrays(gl, arrays);
 *
 *    Is the same as
 *
 *        var arrays = {
 *           position: ...,
 *           texcoord: ...,
 *           normal:   ...,
 *           indices:  ...,
 *        };
 *
 *        var mapping = {
 *          a_position: "position",
 *          a_texcoord: "texcoord",
 *          a_normal:   "normal",
 *        };
 *
 *        bufferInfo = createBufferInfoFromArrays(gl, arrays, mapping);
 *
 * @return {module:webgl-utils.BufferInfo} A BufferInfo
 * @memberOf module:webgl-utils
 */
function createBufferInfoFromArrays(gl: WebGLRenderingContext, arrays: any, opt_mapping?: any): BufferInfos {
    var bufferInfo: BufferInfos = {
        attribs: createAttribsFromArrays(gl, arrays, opt_mapping),
    };
    var indices = arrays.indices;
    if (indices) {
        indices = makeTypedArray(indices, "indices");
        bufferInfo.indices = createBufferFromTypedArray(gl, indices, gl.ELEMENT_ARRAY_BUFFER);
        bufferInfo.numElements = indices.length;
    } else {
        bufferInfo.numElements = getNumElementsFromNonIndexedArrays(arrays);
    }

    return bufferInfo;
}

/**
 * Calls `gl.drawElements` or `gl.drawArrays`, whichever is appropriate
 *
 * normally you'd call `gl.drawElements` or `gl.drawArrays` yourself
 * but calling this means if you switch from indexed data to non-indexed
 * data you don't have to remember to update your draw call.
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @param {module:webgl-utils.BufferInfo} bufferInfo as returned from createBufferInfoFromArrays
 * @param {enum} [primitiveType] eg (gl.TRIANGLES, gl.LINES, gl.POINTS, gl.TRIANGLE_STRIP, ...)
 * @param {number} [count] An optional count. Defaults to bufferInfo.numElements
 * @param {number} [offset] An optional offset. Defaults to 0.
 * @memberOf module:webgl-utils
 */
function drawBufferInfo(gl: WebGLRenderingContext, bufferInfo: BufferInfos, primitiveType?: number, count?: number, offset?: number) {
    var indices = bufferInfo.indices;
    primitiveType = primitiveType === undefined ? gl.TRIANGLES : primitiveType;
    var numElements = count === undefined ? bufferInfo.numElements : count;
    offset = offset === undefined ? offset : 0;
    if (indices) {
        gl.drawElements(primitiveType, numElements, gl.UNSIGNED_SHORT, offset);
    } else {
        gl.drawArrays(primitiveType, offset, numElements);
    }
}

export default {
    resizeCanvasToDisplaySize,
    createProgram,
    createProgramFromStrings,
    createProgramInfo,
    createAttributeSetters,
    createBufferInfoFromArrays,
    createAugmentedTypedArray,
    drawBufferInfo,
    setBuffersAndAttributes,
    setUniforms,
}