import glMatrix, { MatrixArray } from "./gl-matrix";

export type vector3 = MatrixArray;

class Vec3 {
    constructor() {}

    /**
     * Creates a new, empty vec3
     *
     * @returns {vector3} a new 3D vector
     */
    create(): vector3 {
        var out = new glMatrix.ARRAY_TYPE(3);
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
        return out;
    }

    /**
     * Creates a new vec3 initialized with values from an existing vector
     *
     * @param {vector3} a vector to clone
     * @returns {vector3} a new 3D vector
     */
    clone(a: vector3): vector3 {
        var out = new glMatrix.ARRAY_TYPE(3);
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        return out;
    }

    /**
     * Creates a new vec3 initialized with the given values
     *
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @returns {vector3} a new 3D vector
     */
    fromValues(x: number, y: number, z: number): vector3 {
        var out = new glMatrix.ARRAY_TYPE(3);
        out[0] = x;
        out[1] = y;
        out[2] = z;
        return out;
    }

    /**
     * Copy the values from one vec3 to another
     *
     * @param {vector3} out the receiving vector
     * @param {vector3} a the source vector
     * @returns {vector3} out
     */
    copy(a: vector3, out?: vector3): vector3 {
        out = out || new glMatrix.ARRAY_TYPE(3);
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        return out;
    }

    /**
     * Set the components of a vec3 to the given values
     *
     * @param {vector3} out the receiving vector
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @returns {vector3} out
     */
    set(x: number, y: number, z: number, out?: vector3): vector3 {
        out = out || new glMatrix.ARRAY_TYPE(3);
        out[0] = x;
        out[1] = y;
        out[2] = z;
        return out;
    }

    /**
     * Adds two vec3's
     *
     * @param {vector3} a the first operand
     * @param {vector3} b the second operand
     * @param {vector3} out the receiving vector
     * @returns {vector3} out
     */
    add(a: vector3, b: vector3, out?: vector3): vector3 {
        out = out || new glMatrix.ARRAY_TYPE(3);
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        return out;
    }

    /**
     * Subtracts vector b from vector a
     *
     * @param {vector3} a the first operand
     * @param {vector3} b the second operand
     * @param {vector3} out the receiving vector
     * @returns {vector3} out
     */
    subtract(a: vector3, b: vector3, out?: vector3): vector3 {
        out = out || new Float32Array(3);
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        return out;
    }

    /**
     * Alias for {@link vector3.subtract}
     * @function
     */
    sub = this.subtract;

    /**
     * Multiplies two vec3's
     *
     * @param {vector3} out the receiving vector
     * @param {vector3} a the first operand
     * @param {vector3} b the second operand
     * @returns {vector3} out
     */
    multiply(a: vector3, b: vector3, out?: vector3): vector3 {
        out = out || new glMatrix.ARRAY_TYPE(3);
        out[0] = a[0] * b[0];
        out[1] = a[1] * b[1];
        out[2] = a[2] * b[2];
        return out;
    }

    /**
     * Alias for {@link vector3.multiply}
     * @function
     */
    mul = this.multiply;

    /**
     * Divides two vec3's
     *
     * @param {vector3} out the receiving vector
     * @param {vector3} a the first operand
     * @param {vector3} b the second operand
     * @returns {vector3} out
     */
    divide(a: vector3, b: vector3, out?: vector3): vector3 {
        out = out || new glMatrix.ARRAY_TYPE(3);
        out[0] = a[0] / b[0];
        out[1] = a[1] / b[1];
        out[2] = a[2] / b[2];
        return out;
    }

    /**
     * Alias for {@link vector3.divide}
     * @function
     */
    div = this.divide;

    /**
     * Returns the minimum of two vec3's
     *
     * @param {vector3} out the receiving vector
     * @param {vector3} a the first operand
     * @param {vector3} b the second operand
     * @returns {vector3} out
     */
    min(a: vector3, b: vector3, out?: vector3): vector3 {
        out = out || new glMatrix.ARRAY_TYPE(3);
        out[0] = Math.min(a[0], b[0]);
        out[1] = Math.min(a[1], b[1]);
        out[2] = Math.min(a[2], b[2]);
        return out;
    }

    /**
     * Returns the maximum of two vec3's
     *
     * @param {vector3} out the receiving vector
     * @param {vector3} a the first operand
     * @param {vector3} b the second operand
     * @returns {vector3} out
     */
    max(a: vector3, b: vector3, out?: vector3): vector3 {
        out = out || new glMatrix.ARRAY_TYPE(3);
        out[0] = Math.max(a[0], b[0]);
        out[1] = Math.max(a[1], b[1]);
        out[2] = Math.max(a[2], b[2]);
        return out;
    }

    /**
     * Scales a vec3 by a scalar number
     *
     * @param {vector3} out the receiving vector
     * @param {vector3} a the vector to scale
     * @param {Number} b amount to scale the vector by
     * @returns {vector3} out
     */
    scale(a: vector3, b: number, out?: vector3): vector3 {
        out = out || new glMatrix.ARRAY_TYPE(3);
        out[0] = a[0] * b;
        out[1] = a[1] * b;
        out[2] = a[2] * b;
        return out;
    }

    /**
     * Adds two vec3's after scaling the second operand by a scalar value
     *
     * @param {vector3} out the receiving vector
     * @param {vector3} a the first operand
     * @param {vector3} b the second operand
     * @param {Number} scale the amount to scale b by before adding
     * @returns {vector3} out
     */
    scaleAndAdd(a: vector3, b: vector3, scale: number, out?: vector3): vector3 {
        out = out || new glMatrix.ARRAY_TYPE(3);
        out[0] = a[0] + b[0] * scale;
        out[1] = a[1] + b[1] * scale;
        out[2] = a[2] + b[2] * scale;
        return out;
    }

    /**
     * Calculates the euclidian distance between two vec3's
     *
     * @param {vector3} a the first operand
     * @param {vector3} b the second operand
     * @returns {Number} distance between a and b
     */
    distance(a: vector3, b: vector3): number {
        var x = b[0] - a[0],
            y = b[1] - a[1],
            z = b[2] - a[2];
        return Math.sqrt(x * x + y * y + z * z);
    }

    /**
     * Alias for {@link vector3.distance}
     * @function
     */
    dist = this.distance;

    /**
     * Calculates the squared euclidian distance between two vec3's
     *
     * @param {vector3} a the first operand
     * @param {vector3} b the second operand
     * @returns {Number} squared distance between a and b
     */
    squaredDistance(a: vector3, b: vector3): number {
        var x = b[0] - a[0],
            y = b[1] - a[1],
            z = b[2] - a[2];
        return x * x + y * y + z * z;
    }

    /**
     * Alias for {@link vector3.squaredDistance}
     * @function
     */
    sqrDist = this.squaredDistance;

    /**
     * Calculates the length of a vec3
     *
     * @param {vector3} a vector to calculate length of
     * @returns {Number} length of a
     */
    length(a: vector3): number {
        var x = a[0],
            y = a[1],
            z = a[2];
        return Math.sqrt(x * x + y * y + z * z);
    }

    /**
     * Alias for {@link vector3.length}
     * @function
     */
    len = this.length;

    /**
     * Calculates the squared length of a vec3
     *
     * @param {vector3} a vector to calculate squared length of
     * @returns {Number} squared length of a
     */
    squaredLength(a: vector3): number {
        var x = a[0],
            y = a[1],
            z = a[2];
        return x * x + y * y + z * z;
    }

    /**
     * Alias for {@link vector3.squaredLength}
     * @function
     */
    sqrLen = this.squaredLength;

    /**
     * Negates the components of a vec3
     *
     * @param {vector3} out the receiving vector
     * @param {vector3} a vector to negate
     * @returns {vector3} out
     */
    negate(a: vector3, out?: vector3): vector3 {
        out = out || new glMatrix.ARRAY_TYPE(3);
        out[0] = -a[0];
        out[1] = -a[1];
        out[2] = -a[2];
        return out;
    }

    /**
     * Returns the inverse of the components of a vec3
     *
     * @param {vector3} out the receiving vector
     * @param {vector3} a vector to invert
     * @returns {vector3} out
     */
    inverse(a: vector3, out?: vector3): vector3{
        out = out || new glMatrix.ARRAY_TYPE(3);
        out[0] = 1.0 / a[0];
        out[1] = 1.0 / a[1];
        out[2] = 1.0 / a[2];
        return out;
    }

    /**
     * Normalize a vec3
     *
     * @param {vector3} out the receiving vector
     * @param {vector3} a vector to normalize
     * @returns {vector3} out
     */
    normalize(a: vector3, out?: vector3): vector3 {
        out = out || new glMatrix.ARRAY_TYPE(3);
        var x = a[0],
            y = a[1],
            z = a[2];
        var len = x * x + y * y + z * z;
        if (len > 0) {
            //TODO: evaluate use of glm_invsqrt here?
            len = 1 / Math.sqrt(len);
            out[0] = a[0] * len;
            out[1] = a[1] * len;
            out[2] = a[2] * len;
        }
        return out;
    }

    /**
     * Calculates the dot product of two vec3's
     *
     * @param {vector3} a the first operand
     * @param {vector3} b the second operand
     * @returns {Number} dot product of a and b
     */
    dot(a: vector3, b: vector3): number {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    /**
     * Computes the cross product of two vec3's
     *
     * @param {vector3} out the receiving vector
     * @param {vector3} a the first operand
     * @param {vector3} b the second operand
     * @returns {vector3} out
     */
    cross(a: vector3, b: vector3, out?: vector3): vector3 {
        out = out || new glMatrix.ARRAY_TYPE(3);
        var ax = a[0],
            ay = a[1],
            az = a[2],
            bx = b[0],
            by = b[1],
            bz = b[2];

        out[0] = ay * bz - az * by;
        out[1] = az * bx - ax * bz;
        out[2] = ax * by - ay * bx;
        return out;
    }

    /**
     * Performs a linear interpolation between two vec3's
     *
     * @param {vector3} out the receiving vector
     * @param {vector3} a the first operand
     * @param {vector3} b the second operand
     * @param {Number} t interpolation amount between the two inputs
     * @returns {vector3} out
     */
    lerp(a: vector3, b: vector3, t: number, out?: vector3): vector3 {
        out = out || new glMatrix.ARRAY_TYPE(3);
        var ax = a[0],
            ay = a[1],
            az = a[2];
        out[0] = ax + t * (b[0] - ax);
        out[1] = ay + t * (b[1] - ay);
        out[2] = az + t * (b[2] - az);
        return out;
    }

    /**
     * Performs a hermite interpolation with two control points
     *
     * @param {vector3} out the receiving vector
     * @param {vector3} a the first operand
     * @param {vector3} b the second operand
     * @param {vector3} c the third operand
     * @param {vector3} d the fourth operand
     * @param {Number} t interpolation amount between the two inputs
     * @returns {vector3} out
     */
    hermite(a: vector3, b: vector3, c: vector3, d: vector3, t: number, out?: vector3): vector3 {
        out = out || new glMatrix.ARRAY_TYPE(3);
        var factorTimes2 = t * t,
            factor1 = factorTimes2 * (2 * t - 3) + 1,
            factor2 = factorTimes2 * (t - 2) + t,
            factor3 = factorTimes2 * (t - 1),
            factor4 = factorTimes2 * (3 - 2 * t);

        out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
        out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
        out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;

        return out;
    }

    /**
     * Performs a bezier interpolation with two control points
     *
     * @param {vector3} out the receiving vector
     * @param {vector3} a the first operand
     * @param {vector3} b the second operand
     * @param {vector3} c the third operand
     * @param {vector3} d the fourth operand
     * @param {Number} t interpolation amount between the two inputs
     * @returns {vector3} out
     */
    bezier(a: vector3, b: vector3, c: vector3, d: vector3, t: number, out?: vector3): vector3 {
        out = out || new glMatrix.ARRAY_TYPE(3);
        var inverseFactor = 1 - t,
            inverseFactorTimesTwo = inverseFactor * inverseFactor,
            factorTimes2 = t * t,
            factor1 = inverseFactorTimesTwo * inverseFactor,
            factor2 = 3 * t * inverseFactorTimesTwo,
            factor3 = 3 * factorTimes2 * inverseFactor,
            factor4 = factorTimes2 * t;

        out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
        out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
        out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;

        return out;
    }

    /**
     * Generates a random vector with the given scale
     *
     * @param {vector3} out the receiving vector
     * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
     * @returns {vector3} out
     */
    random(scale: number, out?: vector3): vector3 {
        out = out || new glMatrix.ARRAY_TYPE(3);
        scale = scale || 1.0;

        var r = glMatrix.RANDOM() * 2.0 * Math.PI;
        var z = glMatrix.RANDOM() * 2.0 - 1.0;
        var zScale = Math.sqrt(1.0 - z * z) * scale;

        out[0] = Math.cos(r) * zScale;
        out[1] = Math.sin(r) * zScale;
        out[2] = z * scale;
        return out;
    }

    /**
     * Transforms the vec3 with a mat4.
     * 4th vector component is implicitly '1'
     *
     * @param {vector3} out the receiving vector
     * @param {vector3} a the vector to transform
     * @param {mat4} m matrix to transform with
     * @returns {vector3} out
     */
    transformMat4(a: vector3, m: MatrixArray, out?: vector3): vector3 {
        out = out || new glMatrix.ARRAY_TYPE(3);
        var x = a[0],
            y = a[1],
            z = a[2],
            w = m[3] * x + m[7] * y + m[11] * z + m[15];
        w = w || 1.0;
        out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
        out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
        out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
        return out;
    }

    transformDirection(a: vector3, m: MatrixArray, out?: vector3) {
        out = out || new glMatrix.ARRAY_TYPE(3);
        var x = a[0],
            y = a[1],
            z = a[2];

        out[0] = m[0] * x + m[4] * y + m[8] * z;
        out[1] = m[1] * x + m[5] * y + m[9] * z;
        out[2] = m[2] * x + m[6] * y + m[10] * z;
        return out;
    }

    /**
     * Transforms the vec3 with a mat3.
     *
     * @param {vector3} out the receiving vector
     * @param {vector3} a the vector to transform
     * @param {mat4} m the 3x3 matrix to transform with
     * @returns {vector3} out
     */
    transformMat3(a: vector3, m: Float32Array, out?: vector3): vector3 {
        out = out || new glMatrix.ARRAY_TYPE(3);
        var x = a[0],
            y = a[1],
            z = a[2];
        out[0] = x * m[0] + y * m[3] + z * m[6];
        out[1] = x * m[1] + y * m[4] + z * m[7];
        out[2] = x * m[2] + y * m[5] + z * m[8];
        return out;
    }

    /**
     * Transforms the vec3 with a quat
     *
     * @param {vector3} out the receiving vector
     * @param {vector3} a the vector to transform
     * @param {quat} q quaternion to transform with
     * @returns {vector3} out
     */
    transformQuat(a: vector3, q: Float32Array, out?: vector3): vector3 {
        // benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations

        out = out || new glMatrix.ARRAY_TYPE(3);
        var x = a[0],
            y = a[1],
            z = a[2],
            qx = q[0],
            qy = q[1],
            qz = q[2],
            qw = q[3],
            // calculate quat * vec
            ix = qw * x + qy * z - qz * y,
            iy = qw * y + qz * x - qx * z,
            iz = qw * z + qx * y - qy * x,
            iw = -qx * x - qy * y - qz * z;

        // calculate result * inverse quat
        out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
        return out;
    }

    /**
     * Rotate a 3D vector around the x-axis
     * @param {vector3} out The receiving vec3
     * @param {vector3} a The vec3 point to rotate
     * @param {vector3} b The origin of the rotation
     * @param {Number} c The angle of rotation
     * @returns {vector3} out
     */
    rotateX(a: vector3, b: vector3, c: number, out?: vector3): vector3 {
        out = out || new glMatrix.ARRAY_TYPE(3);
        var p = [],
            r = [];
        //Translate point to the origin
        p[0] = a[0] - b[0];
        p[1] = a[1] - b[1];
        p[2] = a[2] - b[2];

        //perform rotation
        r[0] = p[0];
        r[1] = p[1] * Math.cos(c) - p[2] * Math.sin(c);
        r[2] = p[1] * Math.sin(c) + p[2] * Math.cos(c);

        //translate to correct position
        out[0] = r[0] + b[0];
        out[1] = r[1] + b[1];
        out[2] = r[2] + b[2];

        return out;
    }

    /**
     * Rotate a 3D vector around the y-axis
     * @param {vector3} out The receiving vec3
     * @param {vector3} a The vec3 point to rotate
     * @param {vector3} b The origin of the rotation
     * @param {Number} c The angle of rotation
     * @returns {vector3} out
     */
    rotateY(a: vector3, b: vector3, c: number, out?: vector3): vector3 {
        out = out || new glMatrix.ARRAY_TYPE(3);
        var p = [],
            r = [];
        //Translate point to the origin
        p[0] = a[0] - b[0];
        p[1] = a[1] - b[1];
        p[2] = a[2] - b[2];

        //perform rotation
        r[0] = p[2] * Math.sin(c) + p[0] * Math.cos(c);
        r[1] = p[1];
        r[2] = p[2] * Math.cos(c) - p[0] * Math.sin(c);

        //translate to correct position
        out[0] = r[0] + b[0];
        out[1] = r[1] + b[1];
        out[2] = r[2] + b[2];

        return out;
    }

    /**
     * Rotate a 3D vector around the z-axis
     * @param {vector3} out The receiving vec3
     * @param {vector3} a The vec3 point to rotate
     * @param {vector3} b The origin of the rotation
     * @param {Number} c The angle of rotation
     * @returns {vector3} out
     */
    rotateZ(a: vector3, b: vector3, c: number, out?: vector3): vector3 {
        out = out || new glMatrix.ARRAY_TYPE(3);
        var p = [],
            r = [];
        //Translate point to the origin
        p[0] = a[0] - b[0];
        p[1] = a[1] - b[1];
        p[2] = a[2] - b[2];

        //perform rotation
        r[0] = p[0] * Math.cos(c) - p[1] * Math.sin(c);
        r[1] = p[0] * Math.sin(c) + p[1] * Math.cos(c);
        r[2] = p[2];

        //translate to correct position
        out[0] = r[0] + b[0];
        out[1] = r[1] + b[1];
        out[2] = r[2] + b[2];

        return out;
    }

    rotateAxisZ(a: vector3, b: number, out?: vector3) {
        out = out || new glMatrix.ARRAY_TYPE(3);
        out[0] = a[0] * Math.cos(b) - a[1] * Math.sin(b);
        out[1] = a[0] * Math.sin(b) + a[1] * Math.cos(b);
        out[2] = a[2];

        return out;
    }

    /**
     * @description 绕任意轴渲染
     * @param out 旋转后的点
     * @param originVector 起始点 
     * @param axisVector 旋转轴
     * @param theta 旋转角度
     * @returns {vector3} 
     */
    rotateByVector(originVector: vector3, axisVector: vector3, theta: number, out?: vector3): vector3 {
        out = out || new glMatrix.ARRAY_TYPE(3);
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        out[0] =
            (axisVector[0] * axisVector[0] * (1 - c) + c) * originVector[0] +
            (axisVector[0] * axisVector[1] * (1 - c) - axisVector[2] * s) * originVector[1] +
            (axisVector[0] * axisVector[2] * (1 - c) + axisVector[1] * s) * originVector[2];
        out[1] =
            (axisVector[1] * axisVector[0] * (1 - c) + axisVector[2] * s) * originVector[0] +
            (axisVector[1] * axisVector[1] * (1 - c) + c) * originVector[1] +
            (axisVector[1] * axisVector[2] * (1 - c) - axisVector[0] * s) * originVector[2];
        out[2] =
            (axisVector[0] * axisVector[2] * (1 - c) - axisVector[1] * s) * originVector[0] +
            (axisVector[1] * axisVector[2] * (1 - c) + axisVector[0] * s) * originVector[1] +
            (axisVector[2] * axisVector[2] * (1 - c) + c) * originVector[2];

        return out;
    }

    /**
     * Perform some operation over an array of vec3s.
     *
     * @param {vector3} a the array of vectors to iterate over
     * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
     * @param {Number} offset Number of elements to skip at the beginning of the array
     * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
     * @param {Function} fn Function to call for each vector in the array
     * @param {Object} [arg] additional argument to pass to fn
     * @returns {vector3} a
     * @function
     */
    forEach(a: vector3, stride: number, offset: number, count: number, fn: Function, arg: any): vector3 {
        var vec = this.create();
        var i: number, l: number;
        if (!stride) {
            stride = 3;
        }

        if (!offset) {
            offset = 0;
        }

        if (count) {
            l = Math.min(count * stride + offset, a.length);
        } else {
            l = a.length;
        }

        for (i = offset; i < l; i += stride) {
            vec[0] = a[i];
            vec[1] = a[i + 1];
            vec[2] = a[i + 2];
            fn(vec, vec, arg);
            a[i] = vec[0];
            a[i + 1] = vec[1];
            a[i + 2] = vec[2];
        }

        return a;
    }

    /**
     * Get the angle between two 3D vectors
     * @param {vector3} a The first operand
     * @param {vector3} b The second operand
     * @returns {Number} The angle in radians
     */
    angle(a: vector3, b: vector3): number {
        var tempA = this.fromValues(a[0], a[1], a[2]);
        var tempB = this.fromValues(b[0], b[1], b[2]);

        this.normalize(tempA, tempA);
        this.normalize(tempB, tempB);

        var cosine = this.dot(tempA, tempB);

        if (cosine > 1.0) {
            return 0;
        } else if(cosine < -1.0) {
            return Math.PI;
        }{
            return Math.acos(cosine);
        }
    }

    angleTo(a: vector3, b: vector3){
        let vertical = this.create();
        this.cross(vertical,a,b);

        var tempA = this.fromValues(a[0], a[1], a[2]);
        var tempB = this.fromValues(b[0], b[1], b[2]);

        this.normalize(tempA, tempA);
        this.normalize(tempB, tempB);

        var cosine = this.dot(tempA, tempB);

        if (cosine > 1.0) {
            return 0;
        } else if(cosine < -1.0) {
            return Math.PI;
        }{
            return vertical[2] > 0? Math.acos(cosine):- Math.acos(cosine);
        }
    }

    /**
     * Returns a string representation of a vector
     *
     * @param {vector3} vec vector to represent as a string
     * @returns {String} string representation of the vector
     */
    str(a: vector3): string {
        return "vec3(" + a[0] + ", " + a[1] + ", " + a[2] + ")";
    }

    clamp( value: number, min: number, max: number ) {
        return Math.max( min, Math.min( max, value ) );
    }
}
const vec3 = new Vec3();
export default vec3;
