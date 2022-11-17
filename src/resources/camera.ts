import glm from "./glm";
import {vec3, vector3 } from "./glMatrix"

const YAW = -90;
const PITCH = 0;
const SPEED = 2.5;
const SENSITIVITY = 0.1;
const ZOOM = 45;

export enum Camera_Movement{
    FORWARD,
    BACKWARD,
    LEFT,
    RIGHT
};

export default class Camera{
    public Position: vector3;
    public Front: vector3;
    public Up: vector3;
    public Right: vector3;
    public WorldUp: vector3;

    public Yaw: number;
    public Pitch: number;

    public MovementSpeed: number;
    public MouseSensitivity: number;
    public Zoom: number;

    constructor(
        position: vector3 = [0, 0, 0],
        up: vector3 = [0, 1, 0],
        yaw: number = YAW,
        pitch: number = PITCH
    ) {
        this.Front = [0, 0, -1];
        this.MovementSpeed = SPEED;
        this.MouseSensitivity = SENSITIVITY;
        this.Zoom = ZOOM;

        this.Position = position;
        this.WorldUp = up;
        this.Yaw = yaw;
        this.Pitch = pitch;
        
        this.updateCameraVector();
    }

    public GetViewMatrix() {
        return glm.lookAt(this.Position, glm.add(this.Position, this.Front), this.Up);
    }

    public ProcessKeyboard(direction: Camera_Movement, deltaTime: number) {
        let velociy = this.MovementSpeed * deltaTime;
        if (direction == Camera_Movement.FORWARD) {
            // this.Position += this.Front * velociy;
            this.Position = vec3.add(this.Position, vec3.scale(this.Front, velociy));
        }
        if (direction == Camera_Movement.BACKWARD) {
            this.Position = vec3.subtract(this.Position, vec3.scale(this.Front, velociy));
        }
        if (direction == Camera_Movement.LEFT) {
            this.Position = vec3.subtract(this.Position, vec3.scale(this.Right, velociy));
        }
        if (direction == Camera_Movement.RIGHT) {
            this.Position = vec3.add(this.Position, vec3.scale(this.Right, velociy));
        }
    }

    public ProcessMouseMovement(xoffset: number, yoffset: number, constrainPitch: boolean = true) {
        xoffset *= this.MouseSensitivity;
        yoffset *= this.MouseSensitivity;

        this.Yaw += xoffset;
        this.Pitch += yoffset;

        if (constrainPitch) {
            if (this.Pitch > 89) {
                this.Pitch = 89;
            }
            if (this.Pitch < -89) {
                this.Pitch = -89;
            }
        }

        this.updateCameraVector();
    }

    public ProcessMouseSroll(yoffset:number) {
        this.Zoom -= yoffset;
        if (this.Zoom < 1) {
            this.Zoom = 1;
        }
        if (this.Zoom > 45) {
            this.Zoom = 45;
        }
    }

    private updateCameraVector() {
        let front: vector3 = vec3.create();
        front[0] = Math.cos(glm.radians(this.Yaw)) * Math.cos(glm.radians(this.Pitch));
        front[1] = Math.sin(glm.radians(this.Pitch));
        front[2] = Math.sin(glm.radians(this.Yaw)) * Math.cos(glm.radians(this.Pitch));
        this.Front = glm.normalize(front);

        this.Right = glm.normalize(glm.cross(this.Front, this.WorldUp));
        this.Up = glm.normalize(glm.cross(this.Right, this.Front));
    }
}