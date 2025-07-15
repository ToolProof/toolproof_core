// import { World } from './World.js';
import { World } from 'metaverse/dist/World.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import * as THREE from 'three';

interface Config {
    speedMultiplier: number;
    rayColor: string;
    predicate: (obj: THREE.Object3D) => boolean;
    isGrabbable: boolean;
    selectionBehavior: SelectionBehavior;
    recursiveRaycast?: boolean; // Optional flag to enable recursive raycasting
}

interface SelectionCommand {
    selectedObject: THREE.Object3D | null;
    restoreOriginalPosition?: boolean;
}

interface SelectionBehavior {
    onSelectStart(intersected: THREE.Object3D | null): SelectionCommand;
    onSelectEnd(current: THREE.Object3D | null): SelectionCommand;
}

export class TransientSelection implements SelectionBehavior {
    onSelectStart(intersected: THREE.Object3D | null): SelectionCommand {
        return { selectedObject: intersected, restoreOriginalPosition: true };
    }

    onSelectEnd(current: THREE.Object3D | null): SelectionCommand {
        return { selectedObject: null };
    }
}

export class PersistentSelection implements SelectionBehavior {
    private lastSelected: THREE.Object3D | null = null;

    onSelectStart(intersected: THREE.Object3D | null): SelectionCommand {
        // Deselect if we click on the same object again or nothing
        if (!intersected || intersected === this.lastSelected) {
            this.lastSelected = null;
            return { selectedObject: null };
        }

        this.lastSelected = intersected;
        return { selectedObject: intersected };
    }

    onSelectEnd(current: THREE.Object3D | null): SelectionCommand {
        return { selectedObject: current }; // no change
    }
}


abstract class XRWorld extends World {
    private config: Config;
    private controller: THREE.Group;
    protected intersected: THREE.Object3D | null = null;
    protected selectedObject: THREE.Object3D | null = null;
    private grabbedObjectOriginalPosition: THREE.Vector3 | null = null;
    private textSprite: THREE.Sprite | null = null;

    constructor(
        container: HTMLDivElement,
        config: Config

    ) {
        super(container);

        this.config = config;

        this.renderer.xr.enabled = true;
        document.body.appendChild(VRButton.createButton(this.renderer));

        this.controller = this.renderer.xr.getController(1);

        this.controller.addEventListener('selectstart', () => {
            const intersected = this.raycastFromController();
            const cmd = this.config.selectionBehavior.onSelectStart(intersected);
            this.selectedObject = cmd.selectedObject;
            if (cmd.restoreOriginalPosition) {
                this.grabbedObjectOriginalPosition = this.selectedObject?.position.clone() ?? null;
            }
        });

        this.controller.addEventListener('selectend', () => {
            const cmd = this.config.selectionBehavior.onSelectEnd(this.selectedObject);
            if (cmd.restoreOriginalPosition && this.selectedObject) {
                this.selectedObject.position.copy(this.grabbedObjectOriginalPosition ?? new THREE.Vector3());
            }
            this.selectedObject = cmd.selectedObject;
            this.grabbedObjectOriginalPosition = null;
        });


        const laserGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -1)
        ]);

        const laserMaterial = new THREE.LineBasicMaterial({ color: this.config.rayColor });
        const laser = new THREE.Line(laserGeometry, laserMaterial);
        laser.scale.z = 5; // make it 5 units long

        this.controller.add(laser);

        this.cameraRig.add(this.controller);

    }

    render() {
        // draw a single frame
        this.renderer.render(this.scene, this.camera);
    }

    start() {
        this.renderer.setAnimationLoop(() => {
            this.updateMovement(this.clock.getDelta());
            this.updateInteraction();

            this.renderer.render(this.scene, this.camera);
        });
    }

    stop() {
        this.renderer.setAnimationLoop(null);
    }

    protected updateMovement(delta: number) {
        // return;
        const session = this.renderer.xr.getSession();
        if (!session) {
            this.dummyCube.material.color.set('red');
            return;
        }

        this.dummyCube.material.color.set('green');

        const movementSpeed = 1 * this.config.speedMultiplier;
        const rotationSpeed = 2;

        let moved = false;
        let inputDetected = false;

        const debugLeft = '';
        const debugRight = '';

        for (const inputSource of session.inputSources) {
            const gp = inputSource.gamepad;
            if (!gp || gp.axes.length < 2) continue;

            inputDetected = true;

            const x = gp.axes[2] ?? gp.axes[0];
            const y = gp.axes[3] ?? gp.axes[1];

            // 🟦 LEFT controller → movement
            if (inputSource.handedness === 'left') {
                this.dummyCube.scale.set(Math.abs(x) + 0.1, Math.abs(y) + 0.1, 1);

                // Joystick-based horizontal movement
                if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
                    const movement = new THREE.Vector3(x, 0, y)
                        .normalize()
                        .multiplyScalar(movementSpeed * delta)
                        .applyQuaternion(this.cameraRig.quaternion);

                    this.cameraRig.position.add(movement);
                    moved = true;
                }

                // 🎯 Button-based vertical movement
                if (gp.buttons[0]?.pressed) {
                    this.cameraRig.position.y -= movementSpeed * delta; // button 0 = down
                    moved = true;
                }
                if (gp.buttons[1]?.pressed) {
                    this.cameraRig.position.y += movementSpeed * delta; // button 1 = up
                    moved = true;
                }
            }

            // 🟨 RIGHT controller → yaw rotation
            else if (inputSource.handedness === 'right') {
                this.dummyCube.scale.set(Math.abs(x) + 0.1, Math.abs(y) + 0.1, 1);

                // Joystick-based yaw rotation
                if (Math.abs(x) > 0.1) {
                    const yaw = -x * rotationSpeed * delta;
                    const rotation = new THREE.Quaternion().setFromAxisAngle(
                        new THREE.Vector3(0, 1, 0),
                        yaw
                    );
                    this.cameraRig.quaternion.multiply(rotation);
                    moved = true;
                }

                // 🎯 Button-based speed control
                if (gp.buttons[0]?.pressed) {
                    this.config.speedMultiplier = 0.1;
                } else if (gp.buttons[1]?.pressed) {
                    this.config.speedMultiplier = 10;
                } else {
                    this.config.speedMultiplier = 1;
                }

            }

            // 🧾 Button inspection
            /* if (gp.buttons.length > 0) {
                const pressedButtons = gp.buttons
                    .map((btn, i) => btn.pressed ? `[#${i}]` : null)
                    .filter(Boolean)
                    .join(' ');

                const touchedButtons = gp.buttons
                    .map((btn, i) => btn.touched ? `t${i}` : null)
                    .filter(Boolean)
                    .join(' ');

                const analogValues = gp.buttons
                    .map((btn, i) => btn.value > 0 ? `${i}:${btn.value.toFixed(2)}` : null)
                    .filter(Boolean)
                    .join(' ');

                const msg = `Pressed: ${pressedButtons || 'none'}\nTouched: ${touchedButtons || 'none'}\nAnalog: ${analogValues || 'none'}`;

                if (inputSource.handedness === 'left') {
                    debugLeft = `🟦 Left\n${msg}`;
                } else if (inputSource.handedness === 'right') {
                    debugRight = `🟨 Right\n${msg}`;
                }
            } */
        }

        if (!inputDetected) {
            this.dummyCube.material.color.set('orange');
        } else if (!moved) {
            this.dummyCube.material.color.set('yellow');
        }

        // this.showText(`${debugLeft}\n\n${debugRight}`);
    }

    protected updateInteraction() {
        this.highlight();

        // ATTENTION: grabbing is disabled for now
        /* if (!this.config.isGrabbable) {
            return;
        }

        if (this.selectedObject) {
            const pos = new THREE.Vector3();
            this.controller.getWorldPosition(pos);
            if (!this.grabbedObjectOriginalPosition) {
                this.grabbedObjectOriginalPosition = this.selectedObject.position.clone();
            }
            this.selectedObject.position.copy(pos);
        } */

    }

    protected showText(text: string) {
        // Remove old sprite
        if (this.textSprite) {
            this.controller.remove(this.textSprite);
            this.textSprite.material.map?.dispose();
            this.textSprite.material.dispose();
            this.textSprite = null;
        }

        // If no text or empty text, skip creating a new sprite
        if (!text || text.trim() === '') {
            return;
        }

        // Word-wrap the text into lines
        const fontSize = 24;
        const padding = 40;
        const lineHeight = 28;
        const maxWidth = 512 - padding;

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCtx.font = `${fontSize}px sans-serif`;

        const words = text.split(' ');
        let line = '';
        const lines: string[] = [];

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const testWidth = tempCtx.measureText(testLine).width;

            if (testWidth > maxWidth && line !== '') {
                lines.push(line.trim());
                line = words[i] + ' ';
            } else {
                line = testLine;
            }
        }
        if (line !== '') lines.push(line.trim());

        // Create canvas for final sprite
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = lines.length * lineHeight + 60;

        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = `${fontSize}px sans-serif`;
        ctx.textBaseline = 'top';

        lines.forEach((line, i) => {
            ctx.fillText(line, 20, 30 + i * lineHeight);
        });

        // Create new sprite
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        this.textSprite = new THREE.Sprite(material);

        // Position and scale
        const aspect = canvas.width / canvas.height;
        this.textSprite.scale.set(1.5 * aspect, 1.5, 1);
        this.textSprite.position.set(0, 0, -5);

        this.controller.add(this.textSprite);
    }

    private highlight() {
        const intersected = this.raycastFromController();
        this.intersected = intersected;

        const targets = this.scene.children.filter(this.config.predicate);

        targets.forEach(obj => {
            if (obj instanceof THREE.Mesh) {
                const mat = obj.material as THREE.MeshStandardMaterial;
                mat.emissive.set(intersected === obj ? 'yellow' : 'black');
            }
        });
    }

    private raycastFromController(): THREE.Object3D | null {
        const raycaster = new THREE.Raycaster();

        // Get world positions of laser start and end
        const laserStart = new THREE.Vector3(0, 0, 0);
        const laserEnd = new THREE.Vector3(0, 0, -1);

        this.controller.localToWorld(laserStart);
        this.controller.localToWorld(laserEnd);

        const direction = new THREE.Vector3().subVectors(laserEnd, laserStart).normalize();

        raycaster.ray.origin.copy(laserStart);
        raycaster.ray.direction.copy(direction);

        /*  // 🔴 DEBUG LINE
         const debugLineMaterial = new THREE.LineBasicMaterial({ color: 'red' });
         const debugLineGeometry = new THREE.BufferGeometry().setFromPoints([
             laserStart.clone(),
             laserStart.clone().add(direction.clone().multiplyScalar(5)) // extend line 5 units
         ]);
         const debugLine = new THREE.Line(debugLineGeometry, debugLineMaterial);
         this.scene.add(debugLine);
 
         // Optionally remove old debug lines to prevent buildup
         setTimeout(() => this.scene.remove(debugLine), 100); */

        // Perform raycast
        const targets = this.scene.children.filter(this.config.predicate);
        const recursive = this.config.recursiveRaycast ?? false; // Default to false for backward compatibility
        const intersects = raycaster.intersectObjects(targets, recursive);

        return intersects.length > 0 ? intersects[0].object : null;
    }




}


export { XRWorld };
