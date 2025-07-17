import { Job, WorkflowStep } from './data';
// import { XRWorld, TransientSelection } from 'metaverse/dist/XRWorld';
import { XRWorld, TransientSelection } from '../../XRWorld';
import * as THREE from 'three';


interface WorkflowStepWithMesh extends WorkflowStep {
    mesh: THREE.Mesh;
}

class Workflows extends XRWorld {
    private workflowSteps: WorkflowStepWithMesh[] = [];
    private lines: { innerSphereName: string, innerSphereId: string, outerSphereId: string }[] = [];
    private mouse: THREE.Vector2 = new THREE.Vector2();
    private mouseRaycaster: THREE.Raycaster = new THREE.Raycaster();
    private isMouseInteracting: boolean = false;
    private tooltip: HTMLDivElement | null = null;
    private inputWorkflowSteps: WorkflowStep[];

    constructor(container: HTMLDivElement, workflowSteps: WorkflowStep[]) {
        super(container, {
            speedMultiplier: 5,
            rayColor: 'yellow',
            predicate: (obj: THREE.Object3D) => {
                return true;
            },
            isGrabbable: false,
            selectionBehavior: new TransientSelection(),
            recursiveRaycast: true // Enable recursive raycasting to find nested spheres
        });

        // Store the input workflow steps
        this.inputWorkflowSteps = workflowSteps;

        // Hide VR button since we're embedding in UI
        this.hideVRButton();

        // Ensure renderer is properly contained
        this.setupContainerRendering(container);

        // Setup mouse event listeners for non-VR interaction
        this.setupMouseInteraction();

        // Create tooltip element
        this.createTooltip();
    }

    private hideVRButton() {
        // Find and hide the VR button that was added to document.body
        const vrButton = document.querySelector('#VRButton') as HTMLElement;
        if (vrButton) {
            vrButton.style.display = 'none';
        }

        // Also check for any button with VR-related text
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            if (button.textContent?.includes('VR') || button.textContent?.includes('not supported')) {
                button.style.display = 'none';
            }
        });
    }

    private setupContainerRendering(container: HTMLDivElement) {
        // Ensure the renderer canvas is properly sized and contained
        const canvas = this.renderer.domElement;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        canvas.style.position = 'relative'; // Ensure it's not absolutely positioned

        // Make sure the container can contain the canvas properly
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
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

    async init() {
        // Add some ambient and directional lighting to see the spheres better
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Create spheres for each workflow step
        this.createWorkflowVisualization(this.inputWorkflowSteps);

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

        // Custom highlighting logic for nested spheres and cylinders
        this.scene.traverse((child) => {
            if (child.userData?.type === 'resource' && child instanceof THREE.Mesh) {
                const mat = child.material as THREE.MeshStandardMaterial;
                mat.emissive.set(this.intersected === child ? 'yellow' : 'black');
            } else if ((child.userData?.type === 'input' || child.userData?.type === 'output') && child instanceof THREE.Mesh) {
                const mat = child.material as THREE.MeshStandardMaterial;
                mat.emissive.set(this.intersected === child ? 'yellow' : 'black');
            }
        });

        // Debug logging
        console.log('selectedObject:', this.selectedObject);
        console.log('intersected:', this.intersected);
        console.log('dataObjects count:', this.workflowSteps.length);
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

            // Handle different object types
            if (objectToDisplay.userData?.type === 'resource') {
                // Handle job spheres
                let found = false;
                this.workflowSteps.forEach((dataObject, index) => {
                    const isMatch = dataObject.mesh === objectToDisplay;
                    if (index < 5 || isMatch) {
                        console.log(`Checking dataObject ${index}:`, isMatch, dataObject.job.name,
                            'meshId:', dataObject.mesh.id, 'objectId:', objectToDisplay?.id);
                    }
                    if (isMatch) {
                        console.log('Found matching dataObject:', dataObject);
                        const displayText = dataObject.job.description
                            ? `${dataObject.job.name}:\n${dataObject.job.description}`
                            : `${dataObject.job.name}\n[No description available]`;
                        this.showText(displayText);
                        found = true;
                        return;
                    }
                });

                if (!found && objectToDisplay.userData?.name) {
                    const displayText = objectToDisplay.userData.description
                        ? `${objectToDisplay.userData.name}:\n${objectToDisplay.userData.description}`
                        : `${objectToDisplay.userData.name}\n[No description available]`;
                    this.showText(displayText);
                }
            } else if (objectToDisplay.userData?.type === 'input') {
                // Handle input cylinders
                const inputName = objectToDisplay.userData.name;
                const jobId = objectToDisplay.userData.jobId;
                const workflowStep = this.workflowSteps.find(ws => ws.job.id === jobId);
                const displayText = workflowStep
                    ? `Input: ${inputName}\nJob: ${workflowStep.job.name}`
                    : `Input: ${inputName}`;
                this.showText(displayText);
            } else if (objectToDisplay.userData?.type === 'output') {
                // Handle output cylinders
                const outputName = objectToDisplay.userData.name;
                const jobId = objectToDisplay.userData.jobId;
                const workflowStep = this.workflowSteps.find(ws => ws.job.id === jobId);
                const displayText = workflowStep
                    ? `Output: ${outputName}\nJob: ${workflowStep.job.name}`
                    : `Output: ${outputName}`;
                this.showText(displayText);
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

    // Cleanup method to remove tooltip and VR button
    cleanup() {
        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip);
            this.tooltip = null;
        }

        // Also clean up VR button
        this.hideVRButton();
    }

    private customRaycast(): THREE.Object3D | null {
        // Find all interactable objects (spheres and cylinders)
        const allInteractables: THREE.Object3D[] = [];
        this.scene.traverse((child) => {
            if (child.userData?.type === 'resource' || child.userData?.type === 'input' || child.userData?.type === 'output') {
                allInteractables.push(child);
            }
        });

        if (allInteractables.length === 0) {
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

        // Perform raycast against all interactable objects
        const intersects = raycaster.intersectObjects(allInteractables, false);

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
        // Find all interactable objects (spheres and cylinders)
        const allInteractables: THREE.Object3D[] = [];
        this.scene.traverse((child) => {
            if (child.userData?.type === 'resource' || child.userData?.type === 'input' || child.userData?.type === 'output') {
                allInteractables.push(child);
            }
        });

        if (allInteractables.length === 0) {
            return null;
        }

        // Update the mouse raycaster
        this.mouseRaycaster.setFromCamera(this.mouse, this.camera);

        // Perform raycast against all interactable objects
        const intersects = this.mouseRaycaster.intersectObjects(allInteractables, false);

        return intersects.length > 0 ? intersects[0].object : null;
    }

    private clearHighlighting() {
        this.scene.traverse((child) => {
            if (child.userData?.type === 'resource' && child instanceof THREE.Mesh) {
                const mat = child.material as THREE.MeshStandardMaterial;
                mat.emissive.set('black');
            } else if ((child.userData?.type === 'input' || child.userData?.type === 'output') && child instanceof THREE.Mesh) {
                const mat = child.material as THREE.MeshStandardMaterial;
                mat.emissive.set('black');
            }
        });
    }

    private createWorkflowVisualization(workflowStepsData: WorkflowStep[]) {
        const sphereRadius = 2;
        const cylinderRadius = 0.2;
        const cylinderLength = 3;
        const stepSpacing = 15; // Space between workflow steps

        workflowStepsData.forEach((workflowStep, index) => {
            const job = workflowStep.job;
            
            // Position workflow steps in a horizontal line based on their position
            const x = workflowStep.position * stepSpacing - 15; // ATTENTION: arbitrary offset to center
            const z = 0;
            const y = 0;

            // Create main sphere for the job
            const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
            const sphereMaterial = new THREE.MeshStandardMaterial({
                color: 0x4287f5,
                metalness: 0.3,
                roughness: 0.4
            });
            const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphereMesh.position.set(x, y, z);

            // Set userData for interaction
            sphereMesh.userData = {
                type: 'resource',
                name: job.name,
                description: job.description,
                jobId: job.id,
                stepId: workflowStep.id,
                position: workflowStep.position
            };

            this.scene.add(sphereMesh);

            // Store the workflow step with its mesh
            this.workflowSteps.push({
                ...workflowStep,
                mesh: sphereMesh
            });

            // Create input cylinders (coming from the left)
            job.inputs.forEach((input, inputIndex) => {
                const inputCylinder = this.createCylinder(
                    cylinderRadius,
                    cylinderLength,
                    0x42f554 // Green color for inputs
                );

                // Position cylinder to the left of the sphere
                const inputY = y + (inputIndex - (job.inputs.length - 1) / 2) * 1.5;
                inputCylinder.position.set(x - sphereRadius - cylinderLength / 2, inputY, z);
                inputCylinder.rotation.z = Math.PI / 2; // Rotate to horizontal

                // Set userData for the input
                inputCylinder.userData = {
                    type: 'input',
                    name: input,
                    jobId: job.id,
                    stepId: workflowStep.id,
                    position: workflowStep.position
                };

                this.scene.add(inputCylinder);
            });

            // Create output cylinders (going to the right)
            job.outputs.forEach((output, outputIndex) => {
                const outputCylinder = this.createCylinder(
                    cylinderRadius,
                    cylinderLength,
                    0xf54242 // Red color for outputs
                );

                // Position cylinder to the right of the sphere
                const outputY = y + (outputIndex - (job.outputs.length - 1) / 2) * 1.5;
                outputCylinder.position.set(x + sphereRadius + cylinderLength / 2, outputY, z);
                outputCylinder.rotation.z = Math.PI / 2; // Rotate to horizontal

                // Set userData for the output
                outputCylinder.userData = {
                    type: 'output',
                    name: output,
                    jobId: job.id,
                    stepId: workflowStep.id,
                    position: workflowStep.position
                };

                this.scene.add(outputCylinder);
            });
        });

        // Create connections between workflow steps (lines between outputs and inputs)
        this.createWorkflowConnections(workflowStepsData);
    }

    private createWorkflowConnections(workflowStepsData: WorkflowStep[]) {
        // For now, just connect consecutive workflow steps with simple lines
        // In the future, this could be enhanced to show actual data flow connections
        for (let i = 0; i < workflowStepsData.length - 1; i++) {
            const currentStep = workflowStepsData[i];
            const nextStep = workflowStepsData[i + 1];
            
            // Get the positions of the spheres
            const currentPos = new THREE.Vector3(currentStep.position * 15, 0, 0);
            const nextPos = new THREE.Vector3(nextStep.position * 15, 0, 0);
            
            // Create a line geometry between the spheres
            const points = [
                new THREE.Vector3(currentPos.x + 2, currentPos.y, currentPos.z), // Right edge of current sphere
                new THREE.Vector3(nextPos.x - 2, nextPos.y, nextPos.z) // Left edge of next sphere
            ];
            
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineMaterial = new THREE.LineBasicMaterial({ 
                color: 0xffffff, 
                linewidth: 2,
                opacity: 0.7,
                transparent: true
            });
            
            const line = new THREE.Line(lineGeometry, lineMaterial);
            this.scene.add(line);
        }
    }

    private createCylinder(radius: number, height: number, color: number): THREE.Mesh {
        const geometry = new THREE.CylinderGeometry(radius, radius, height, 16);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.3,
            roughness: 0.4
        });
        return new THREE.Mesh(geometry, material);
    }

}


export { Workflows };