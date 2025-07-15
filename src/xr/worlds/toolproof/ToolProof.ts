import { getData } from './data';
// import { XRWorld, TransientSelection } from 'metaverse/dist/XRWorld';
import { XRWorld, TransientSelection } from '../../XRWorld';
import * as THREE from 'three';

interface DataObject {
    id: string;
    name: string;
    description: string;
}

interface DataObjectWithMesh extends DataObject {
    mesh: THREE.Mesh;
}

class ToolProof extends XRWorld {
    private dataObjects: DataObjectWithMesh[] = [];
    private lines: { innerSphereName: string, innerSphereId: string, outerSphereId: string }[] = [];
    private mouse: THREE.Vector2 = new THREE.Vector2();
    private mouseRaycaster: THREE.Raycaster = new THREE.Raycaster();
    private isMouseInteracting: boolean = false;
    private tooltip: HTMLDivElement | null = null;

    constructor(container: HTMLDivElement) {
        super(container, {
            speedMultiplier: 5,
            rayColor: 'yellow',
            predicate: (obj: THREE.Object3D) => {
                // Return true for circle groups (which contain the spheres we want to interact with)
                const isTarget = obj instanceof THREE.Group &&
                    typeof obj.name === 'string' &&
                    ['circleZero', 'circleOne', 'circleTwo', 'circleThree'].includes(obj.name);

                if (isTarget) {
                    console.log('Predicate found target:', obj.name, obj);
                }
                return isTarget;
            },
            isGrabbable: false,
            selectionBehavior: new TransientSelection(),
            recursiveRaycast: true // Enable recursive raycasting to find nested spheres
        });

        // Setup mouse event listeners for non-VR interaction
        this.setupMouseInteraction();

        // Create tooltip element
        this.createTooltip();
    }

    private createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            pointer-events: none;
            z-index: 1000;
            max-width: 300px;
            white-space: pre-wrap;
            border: 1px solid #333;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            display: none;
        `;
        document.body.appendChild(this.tooltip);
    }

    private setupMouseInteraction() {
        const canvas = this.renderer.domElement;

        // Mouse move event for hover highlighting and tooltip positioning
        canvas.addEventListener('mousemove', (event) => {
            if (!this.renderer.xr.getSession()) {
                this.updateMousePosition(event);
                this.isMouseInteracting = true;

                // Update tooltip position
                if (this.tooltip) {
                    this.tooltip.style.left = (event.clientX + 10) + 'px';
                    this.tooltip.style.top = (event.clientY - 10) + 'px';
                }
            }
        });

        // Mouse click event for selection
        canvas.addEventListener('click', (event) => {
            if (!this.renderer.xr.getSession()) {
                this.updateMousePosition(event);
                this.handleMouseSelection();
            }
        });

        // Mouse leave event to clear highlighting and hide tooltip
        canvas.addEventListener('mouseleave', () => {
            if (!this.renderer.xr.getSession()) {
                this.isMouseInteracting = false;
                this.clearHighlighting();
                this.hideTooltip();
            }
        });
    }

    private createConcentricCircles( // ATTENTION: use sets instead of arrays
        drawnCircles: ('circleZero' | 'circleOne' | 'circleTwo' | 'circleThree')[] = [], tiltedCircles: ('circleZero' | 'circleOne' | 'circleTwo')[] = [], showLines: boolean,

    ) {
        // Clear previous data objects
        this.dataObjects = [];

        const geometry = new THREE.SphereGeometry(0.2, 32, 32);

        const createMaterial = (opacity: number, color: string, isDummy: boolean = false) => {
            const finalOpacity = isDummy ? opacity * 0.3 : opacity; // Reduce opacity for dummy objects
            return new THREE.MeshStandardMaterial({ color: color, transparent: true, opacity: finalOpacity });
        }

        // Get data from getData method
        const data = getData({
            countZero: 25,
            countOne: 25,
            countTwo: 25,
            countThree: 100
        });

        // Define circle parameters (radius increases for outer circles)
        const circles = [
            { count: data.zeroObjects.length, radius: 5, color: '#0000ff', name: 'circleZero' as const, objects: data.zeroObjects },
            { count: data.oneObjects.length, radius: 10, color: '#00ff00', name: 'circleOne' as const, objects: data.oneObjects },
            { count: data.twoObjects.length, radius: 15, color: '#ff0000', name: 'circleTwo' as const, objects: data.twoObjects },
            { count: data.threeObjects.length, radius: 35, color: '#000000', name: 'circleThree' as const, objects: data.threeObjects }
        ];

        // Create each circle with its spheres
        circles.forEach((circle) => {
            if (!drawnCircles.includes(circle.name)) {
                return; // Skip circles not in drawnCircles
            }

            // Create a group to hold all spheres and lines for this circle
            const circleGroup = new THREE.Group();
            circleGroup.name = circle.name;

            // Create the circle line geometry
            const circleThickness = 0.01; // Thickness of the circle line
            const circleGeometry = new THREE.RingGeometry(circle.radius - circleThickness, circle.radius + circleThickness, 64);
            const lineMaterial = new THREE.MeshBasicMaterial({
                color: 'black',
                transparent: true,
                opacity: 1,
            });
            const circleLine = new THREE.Mesh(circleGeometry, lineMaterial);
            circleLine.rotation.x = -Math.PI / 2; // Rotate to lie flat on XZ plane
            circleGroup.add(circleLine);

            // Special handling for circleOne - dual spheres representing duality
            if (circle.name === 'circleOne') {
                // For circleOne, create pairs of spheres on each side of the line
                for (let i = 0; i < circle.count; i++) {
                    const angle = (i / circle.count) * Math.PI * 2;
                    const dataObject = circle.objects[i];
                    const isDummy = dataObject.name === 'Dummy';
                    const material = createMaterial(0.8, circle.color, isDummy);

                    // Calculate radial direction for positioning dual spheres (inner/outer)
                    const radialOffset = 0.2; // Distance from the circle line (sphere radius so they touch)

                    // Apply tilting if this circle is in the tiltedCircles array (same logic as other circles)
                    const shouldTilt = tiltedCircles.includes(circle.name as 'circleZero' | 'circleOne' | 'circleTwo');

                    let radialX, radialZ, yOffset;
                    if (shouldTilt) {
                        // Use the same vertical transformation as other circles
                        radialX = 0; // Remove X component for vertical circle
                        yOffset = Math.sin(angle) * circle.radius; // Y component for vertical circle
                        radialZ = Math.cos(angle); // Z component for vertical circle (normalized)
                    } else {
                        // Standard horizontal positioning
                        radialX = Math.cos(angle);
                        radialZ = Math.sin(angle);
                        yOffset = 0;
                    }

                    // Create inner sphere (closer to center)
                    const innerRadius = circle.radius - radialOffset;
                    const sphere1 = new THREE.Mesh(geometry, material);
                    sphere1.position.set(radialX * innerRadius, yOffset, radialZ * innerRadius);
                    sphere1.userData = {
                        type: 'resource',
                        circle: circle.name,
                        index: i * 2,
                        duality: 'inner',
                        dataObject: dataObject,
                        id: dataObject.id,
                        name: dataObject.name,
                        description: dataObject.description
                    };
                    circleGroup.add(sphere1);

                    // Add to dataObjects array
                    this.dataObjects.push({
                        id: dataObject.id,
                        name: dataObject.name,
                        description: dataObject.description,
                        mesh: sphere1
                    });

                    // Create outer sphere (farther from center)
                    const outerRadius = circle.radius + radialOffset;
                    const sphere2 = new THREE.Mesh(geometry, material);
                    sphere2.position.set(radialX * outerRadius, yOffset, radialZ * outerRadius);
                    sphere2.userData = {
                        type: 'resource',
                        circle: circle.name,
                        index: i * 2 + 1,
                        duality: 'outer',
                        dataObject: dataObject,
                        id: dataObject.id,
                        name: dataObject.name,
                        description: dataObject.description
                    };
                    circleGroup.add(sphere2);

                    // Add to dataObjects array (note: both spheres represent the same data object)
                    this.dataObjects.push({
                        id: dataObject.id,
                        name: dataObject.name,
                        description: dataObject.description,
                        mesh: sphere2
                    });
                }
            } else {
                // Standard single sphere distribution for other circles
                for (let i = 0; i < circle.count; i++) {
                    const angle = (i / circle.count) * Math.PI * 2;
                    const dataObject = circle.objects[i];
                    const isDummy = dataObject.name === 'Dummy';
                    const material = createMaterial(0.8, circle.color, isDummy);

                    // Apply tilting if this circle is in the tiltedCircles array (but not circleThree)
                    const shouldTilt = tiltedCircles.includes(circle.name as 'circleZero' | 'circleOne' | 'circleTwo');
                    const x = shouldTilt ? 0 : Math.cos(angle) * circle.radius; // Remove X component for vertical circle
                    const y = shouldTilt ? Math.sin(angle) * circle.radius : 0; // Y component for vertical circle
                    const z = shouldTilt ? Math.cos(angle) * circle.radius : Math.sin(angle) * circle.radius; // Z component for vertical circle

                    const sphere = new THREE.Mesh(geometry, material);
                    sphere.position.set(x, y, z);
                    sphere.userData = {
                        type: 'resource',
                        circle: circle.name,
                        index: i,
                        dataObject: dataObject,
                        id: dataObject.id,
                        name: dataObject.name,
                        description: dataObject.description
                    };

                    circleGroup.add(sphere);

                    // Add to dataObjects array
                    this.dataObjects.push({
                        id: dataObject.id,
                        name: dataObject.name,
                        description: dataObject.description,
                        mesh: sphere
                    });
                }
            }

            this.scene.add(circleGroup);
        });

        if (!showLines) return;

        // Now create lines for each tilted circle to circleThree (using the reordered positions)
        tiltedCircles.forEach(innerCircleName => {
            this.createLinesToCircleThree(innerCircleName);
        });

        // Finally, swap the objects in circleThree based on the lines created
        this.swapCircleThreeObjects();
    }

    private createLinesToCircleThree(innerCircleName: 'circleZero' | 'circleOne' | 'circleTwo') {
        const circleThreeGroup = this.scene.getObjectByName('circleThree');
        const innerCircleGroup = this.scene.getObjectByName(innerCircleName);

        if (circleThreeGroup && innerCircleGroup) {
            const circleThreeSpheres = circleThreeGroup.children.filter(child => child instanceof THREE.Mesh && child.userData?.type === 'resource') as THREE.Mesh[];
            const innerCircleSpheres = innerCircleGroup.children.filter(child => child instanceof THREE.Mesh && child.userData?.type === 'resource') as THREE.Mesh[];

            // Check if the inner circle is tilted (vertical)
            const isTilted = innerCircleSpheres.some(sphere => Math.abs(sphere.position.y) > 0.1);

            // Sort inner spheres by their angular position
            const sortedInnerSpheres = this.sortSpheresByAngle([...innerCircleSpheres], isTilted);

            const sortedOuterSpheres = this.sortSpheresByAngle([...circleThreeSpheres], false); // circleThree is always horizontal

            // Create lines for dummy objects based on angular position
            sortedInnerSpheres.forEach((innerSphere, index) => {
                // Use modulo to wrap around if there are more inner spheres than outer ones
                const outerIndex = index % sortedOuterSpheres.length;
                const outerSphere = sortedOuterSpheres[outerIndex];

                if (outerSphere) {
                    // Create straight line between the inner circle sphere and its positionally corresponding circleThree sphere
                    const points = [innerSphere.position.clone(), outerSphere.position.clone()];
                    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                    const lineMaterial = new THREE.LineBasicMaterial({
                        color: 0x888888,
                        transparent: true,
                        opacity: innerSphere.userData.dataObject.name === 'Dummy' ? 0.3 : 1 // Lower opacity for dummy lines
                    });
                    const line = new THREE.Line(lineGeometry, lineMaterial);
                    this.scene.add(line);

                    if (innerSphere.userData.dataObject.name !== 'Dummy') {
                        // Store the line name for later reference
                        this.lines.push({
                            innerSphereName: innerSphere.userData.dataObject.name,
                            innerSphereId: innerSphere.userData.dataObject.id,
                            outerSphereId: outerSphere.userData.dataObject.id
                        });
                    }
                }
            });
        }
    }

    private sortSpheresByAngle(spheres: THREE.Mesh[], isVertical: boolean): THREE.Mesh[] {
        return spheres.sort((a, b) => {
            let angleA, angleB;
            if (isVertical) {
                // For vertical circles (YZ plane), handle upper and lower halves differently
                if (a.position.y >= 0) {
                    angleA = Math.atan2(a.position.y, a.position.z);
                } else {
                    // For negative Y (lower half), flip the Z component to correct the mapping
                    angleA = Math.atan2(a.position.y, -a.position.z);
                }

                if (b.position.y >= 0) {
                    angleB = Math.atan2(b.position.y, b.position.z);
                } else {
                    // For negative Y (lower half), flip the Z component to correct the mapping
                    angleB = Math.atan2(b.position.y, -b.position.z);
                }
            } else {
                // For horizontal circles (XZ plane), sort by angle in XZ plane
                angleA = Math.atan2(a.position.z, a.position.x);
                angleB = Math.atan2(b.position.z, b.position.x);
            }
            return angleA - angleB;
        });
    }

    private swapCircleThreeObjects() {
        // Loop through all the lines to find objects that need to be swapped
        this.lines.forEach(line => {
            // Find the circleThree object with name matching 'file_' + innerSphereName
            const targetThreeName = `file_${line.innerSphereName}`;
            const threeObject = this.dataObjects.find(obj => obj.name === targetThreeName);

            // Find the circleThree object with the outerSphereId
            const outerObject = this.dataObjects.find(obj => obj.id === line.outerSphereId);

            if (threeObject && outerObject && threeObject !== outerObject) {
                // Swap the userData (which contains the data object information)
                const threeUserData = { ...threeObject.mesh.userData };
                const outerUserData = { ...outerObject.mesh.userData };

                threeObject.mesh.userData = outerUserData;
                outerObject.mesh.userData = threeUserData;

                // Also swap the material properties if they're different
                const threeMaterial = threeObject.mesh.material as THREE.MeshStandardMaterial;
                const outerMaterial = outerObject.mesh.material as THREE.MeshStandardMaterial;

                const threeOpacity = threeMaterial.opacity;
                const outerOpacity = outerMaterial.opacity;

                threeMaterial.opacity = outerOpacity;
                outerMaterial.opacity = threeOpacity;

                // Update the dataObjects array to reflect the swap
                const threeIndex = this.dataObjects.indexOf(threeObject);
                const outerIndex = this.dataObjects.indexOf(outerObject);

                if (threeIndex !== -1 && outerIndex !== -1) {
                    // Swap the data object references while keeping mesh references intact
                    const tempData = { ...threeObject };
                    threeObject.id = outerObject.id;
                    threeObject.name = outerObject.name;
                    threeObject.description = outerObject.description;

                    outerObject.id = tempData.id;
                    outerObject.name = tempData.name;
                    outerObject.description = tempData.description;
                }

                // console.log(`Swapped data between ${targetThreeName} and object with ID ${line.outerSphereId}`);
            }
        });
    }

    async init() {
        // Create concentric circles and specify which of the inner circles should be tilted and connected to circleThree
        const selector = 0;
        if (selector === 0) {
            this.createConcentricCircles(['circleThree', 'circleOne'], ['circleOne'], true);
        } else if (selector === 1) {
            this.createConcentricCircles(['circleThree', 'circleTwo'], ['circleTwo'], true);
        } else {
            this.createConcentricCircles(['circleThree', 'circleTwo', 'circleOne'], [], false);
        }

        // Add some ambient and directional lighting to see the spheres better
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Position camera to get a good view of all circles
        this.camera.position.set(0, 20, 30);
        this.camera.lookAt(0, 0, 0);
    }

    override updateInteraction() {
        // Skip parent's updateInteraction to avoid the old highlight method
        // Instead, manually do what the parent does but with custom highlighting

        let intersected: THREE.Object3D | null = null;

        // Use different interaction methods based on whether we're in VR or not
        if (this.renderer.xr.getSession()) {
            // VR mode - use custom raycast
            intersected = this.customRaycast();
        } else {
            // Non-VR mode - use mouse raycast if mouse is interacting
            if (this.isMouseInteracting) {
                intersected = this.performMouseRaycast();
            }
        }

        this.intersected = intersected;

        // Custom highlighting logic for nested spheres
        this.scene.traverse((child) => {
            if (child.userData?.type === 'resource' && child instanceof THREE.Mesh) {
                const mat = child.material as THREE.MeshStandardMaterial;
                mat.emissive.set(this.intersected === child ? 'yellow' : 'black');
            }
        });

        // Debug logging
        console.log('selectedObject:', this.selectedObject);
        console.log('intersected:', this.intersected);
        console.log('dataObjects count:', this.dataObjects.length);
        console.log('isMouseInteracting:', this.isMouseInteracting);
        console.log('VR Session:', this.renderer.xr.getSession());

        // Show text for either selected object (VR/click) or intersected object (hover)
        const objectToDisplay = this.selectedObject || this.intersected;

        if (objectToDisplay) {
            console.log('Display object userData:', objectToDisplay.userData);
            console.log('Display object type:', objectToDisplay.type);
            console.log('Display object constructor:', objectToDisplay.constructor.name);
            console.log('Display object id:', objectToDisplay.id);
            console.log('Looking for matching dataObject...');

            let found = false;
            this.dataObjects.forEach((dataObject, index) => {
                // More detailed comparison logging
                const isMatch = dataObject.mesh === objectToDisplay;
                if (index < 5 || isMatch) { // Only log first 5 and any matches to reduce noise
                    console.log(`Checking dataObject ${index}:`, isMatch, dataObject.name,
                        'meshId:', dataObject.mesh.id, 'objectId:', objectToDisplay.id);
                }
                if (isMatch) {
                    console.log('Found matching dataObject:', dataObject);
                    const displayText = dataObject.description
                        ? `${dataObject.name}:\n${dataObject.description}`
                        : `${dataObject.name}\n[No description available]`;
                    this.showText(displayText);
                    found = true;
                    return;
                }
            });

            if (!found) {
                console.log('No matching dataObject found for:', objectToDisplay);
                // Try to get text directly from userData
                if (objectToDisplay.userData?.name && objectToDisplay.userData?.description) {
                    console.log('Using userData directly');
                    const displayText = objectToDisplay.userData.description
                        ? `${objectToDisplay.userData.name}:\n${objectToDisplay.userData.description}`
                        : `${objectToDisplay.userData.name}\n[No description available]`;
                    this.showText(displayText);
                } else if (objectToDisplay.userData?.name) {
                    console.log('Using userData name only');
                    this.showText(`${objectToDisplay.userData.name}\n[No description available]`);
                }
            }
        } else {
            this.showText('');
        }
    }

    // Override showText to handle non-VR mode with tooltip
    protected override showText(text: string) {
        // In VR mode, use the parent's implementation
        if (this.renderer.xr.getSession()) {
            super.showText(text);
            return;
        }

        // In non-VR mode, use DOM tooltip
        if (!text || text.trim() === '') {
            this.hideTooltip();
        } else {
            this.showTooltip(text);
        }
    }

    private showTooltip(text: string) {
        if (!this.tooltip) return;

        this.tooltip.textContent = text;
        this.tooltip.style.display = 'block';
        console.log('Tooltip showing:', text);
    }

    private hideTooltip() {
        if (!this.tooltip) return;

        this.tooltip.style.display = 'none';
    }

    // Cleanup method to remove tooltip
    cleanup() {
        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip);
            this.tooltip = null;
        }
    }

    private customRaycast(): THREE.Object3D | null {
        // Find all spheres directly
        const allSpheres: THREE.Object3D[] = [];
        this.scene.traverse((child) => {
            if (child.userData?.type === 'resource') {
                allSpheres.push(child);
            }
        });

        if (allSpheres.length === 0) {
            return null;
        }

        // We need to access the controller somehow. Let's try to find it in cameraRig
        let controller: THREE.Group | null = null;
        this.cameraRig.traverse((child) => {
            if (child instanceof THREE.Group && child.children.some(c => c instanceof THREE.Line)) {
                controller = child;
            }
        });

        if (!controller) {
            return null;
        }

        const raycaster = new THREE.Raycaster();

        // Get world positions of laser start and end
        const laserStart = new THREE.Vector3(0, 0, 0);
        const laserEnd = new THREE.Vector3(0, 0, -1);

        (controller as THREE.Group).localToWorld(laserStart);
        (controller as THREE.Group).localToWorld(laserEnd);

        const direction = new THREE.Vector3().subVectors(laserEnd, laserStart).normalize();

        raycaster.ray.origin.copy(laserStart);
        raycaster.ray.direction.copy(direction);

        // Perform raycast against all spheres
        const intersects = raycaster.intersectObjects(allSpheres, false);

        return intersects.length > 0 ? intersects[0].object : null;
    }

    private updateMousePosition(event: MouseEvent) {
        const canvas = this.renderer.domElement;
        const rect = canvas.getBoundingClientRect();

        // Convert mouse coordinates to normalized device coordinates (-1 to +1)
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    private handleMouseSelection() {
        const intersectedObject = this.performMouseRaycast();
        if (intersectedObject) {
            // Set as selected object (similar to VR behavior)
            this.selectedObject = intersectedObject;
        } else {
            // Clear selection when clicking on empty space
            this.selectedObject = null;
        }
    }

    private performMouseRaycast(): THREE.Object3D | null {
        // Find all spheres directly
        const allSpheres: THREE.Object3D[] = [];
        this.scene.traverse((child) => {
            if (child.userData?.type === 'resource') {
                allSpheres.push(child);
            }
        });

        if (allSpheres.length === 0) {
            return null;
        }

        // Update the mouse raycaster
        this.mouseRaycaster.setFromCamera(this.mouse, this.camera);

        // Perform raycast against all spheres
        const intersects = this.mouseRaycaster.intersectObjects(allSpheres, false);

        return intersects.length > 0 ? intersects[0].object : null;
    }

    private clearHighlighting() {
        this.scene.traverse((child) => {
            if (child.userData?.type === 'resource' && child instanceof THREE.Mesh) {
                const mat = child.material as THREE.MeshStandardMaterial;
                mat.emissive.set('black');
            }
        });
    }

}


export { ToolProof };