export type MatrixArray = Float32Array | number[];

class GLMatrix {
    EPSILON: number;
    ARRAY_TYPE: any;
    RANDOM: Function;
    ENABLE_SIMD: boolean;
    degree: number = Math.PI / 180;
    SIMD_AVAILABLE: boolean;
    USE_SIMD: boolean;
    constructor() {
        this.EPSILON = 0.000001;
        this.ARRAY_TYPE = typeof Float32Array !== "undefined" ? Float32Array : Array;
        this.RANDOM = Math.random;
        this.ENABLE_SIMD = false;

        this.SIMD_AVAILABLE = this.ARRAY_TYPE === Float32Array && "SIMD" in this;
        this.USE_SIMD = this.ENABLE_SIMD && this.SIMD_AVAILABLE;
    }

    setMatrixArrayType(type: any) {
        this.ARRAY_TYPE = type;
    }

    toRadian(a: number) {
        return a * this.degree;
    }
}
const glMatrix = new GLMatrix();
export default glMatrix;
