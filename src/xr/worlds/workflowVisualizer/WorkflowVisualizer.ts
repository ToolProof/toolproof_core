import { 
    Workflow, 
    Job, 
    ResourceType, 
    WorkflowStepUnion, 
    SimpleWorkflowStep, 
    ParallelWorkflowStep, 
    ConditionalWorkflowStep, 
    WhileLoopWorkflowStep, 
    ForLoopWorkflowStep,
    WorkflowStep,
    DataExchange 
} from 'updohilo/dist/types/typesWF';
// import { XRWorld, TransientSelection } from 'metaverse/dist/XRWorld';
import { XRWorld, TransientSelection } from '../../XRWorld';
import * as THREE from 'three';

interface StepVisualData {
    stepUnion: WorkflowStepUnion;
    mesh: THREE.Mesh;
    job?: Job;
    level: number;
    indexInLevel: number;
    stepId: string;
}

export default class WorkflowVisualizer extends XRWorld {
    private stepVisuals: StepVisualData[] = [];
    private connectionObjects: THREE.Object3D[] = []; // Changed to handle any 3D object
    private mouse: THREE.Vector2 = new THREE.Vector2();
    private mouseRaycaster: THREE.Raycaster = new THREE.Raycaster();
    private isMouseInteracting: boolean = false;
    private tooltip: HTMLDivElement | null = null;
    private workflow: Workflow;
    private availableJobs: Map<string, Job> = new Map();

    constructor(container: HTMLDivElement, workflow: Workflow, availableJobs?: Job[]) {
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

        // Store the workflow
        this.workflow = workflow;

        // Store available jobs
        if (availableJobs) {
            availableJobs.forEach(job => {
                this.availableJobs.set(job.id, job);
            });
        }

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
        const canvas = (this as any).renderer.domElement;
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
        const canvas = (this as any).renderer.domElement;

        // Mouse move event for hover highlighting and tooltip positioning
        canvas.addEventListener('mousemove', (event: MouseEvent) => {
            if (!(this as any).renderer.xr.getSession()) {
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
        canvas.addEventListener('click', (event: MouseEvent) => {
            if (!(this as any).renderer.xr.getSession()) {
                this.updateMousePosition(event);
                this.handleMouseSelection();
            }
        });

        // Mouse leave event to clear highlighting and hide tooltip
        canvas.addEventListener('mouseleave', () => {
            if (!(this as any).renderer.xr.getSession()) {
                this.isMouseInteracting = false;
                this.clearHighlighting();
                this.hideTooltip();
            }
        });
    }

    async init() {
        // Add some ambient and directional lighting to see the spheres better
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        (this as any).scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        (this as any).scene.add(directionalLight);

        // Create visualization for the new workflow structure
        this.createWorkflowVisualization(this.workflow);

        // Position camera to get a good view of all workflow nodes
        (this as any).camera.position.set(0, 20, 30);
        (this as any).camera.lookAt(0, 0, 0);

        // Start animation loop for lightning effects
        this.startLightningAnimation();
    }

    private startLightningAnimation() {
        const animateLightning = () => {
            const currentTime = Date.now();

            // Animate all lightning connections
            this.connectionObjects.forEach(connection => {
                if (connection.userData?.type === 'lightning' && connection instanceof THREE.Group) {
                    const elapsed = (currentTime - connection.userData.startTime) / 1000;
                    const mainMaterial = connection.userData.mainMaterial;
                    const glowMaterial = connection.userData.glowMaterial;

                    // Create pulsing effect with random flickers
                    const basePulse = 0.5 + 0.3 * Math.sin(elapsed * 4); // Base sine wave
                    const flicker = Math.random() > 0.9 ? 0.3 : 0; // Random flicker
                    const intensity = Math.min(1, basePulse + flicker);

                    // Update material opacity
                    mainMaterial.opacity = 0.4 + intensity * 0.6;
                    glowMaterial.opacity = 0.1 + intensity * 0.4;

                    // Occasionally regenerate lightning path for more dynamic effect
                    if (Math.random() > 0.95) {
                        this.regenerateLightningPath(connection);
                    }
                }
            });

            requestAnimationFrame(animateLightning);
        };

        animateLightning();
    }

    private regenerateLightningPath(lightningGroup: THREE.Group) {
        const userData = lightningGroup.userData;
        if (!userData || !userData.points) return;

        const startPos = userData.points[0];
        const endPos = userData.points[userData.points.length - 1];

        let newPoints: THREE.Vector3[];

        if (userData.isLongDistance) {
            // Regenerate routed path
            newPoints = this.createRoutedPath(startPos, endPos);
        } else {
            // Regenerate direct path
            newPoints = this.createDirectPath(startPos, endPos);
        }

        // Update geometry for both lines in the group
        lightningGroup.children.forEach(child => {
            if (child instanceof THREE.Line) {
                const newGeometry = new THREE.BufferGeometry().setFromPoints(newPoints);
                child.geometry.dispose();
                child.geometry = newGeometry;
            }
        });

        // Update stored points
        userData.points = newPoints;
    }

    override updateInteraction() {
        // Skip parent's updateInteraction to avoid the old highlight method
        // Instead, manually do what the parent does but with custom highlighting

        let intersected: THREE.Object3D | null = null;

        // Use different interaction methods based on whether we're in VR or not
        if ((this as any).renderer.xr.getSession()) {
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
        (this as any).scene.traverse((child: THREE.Object3D) => {
            if (child.userData?.type === 'resource' && child instanceof THREE.Mesh) {
                const mat = child.material as THREE.MeshStandardMaterial;
                mat.emissive.set(this.intersected === child ? 'yellow' : 'black');
            } else if ((child.userData?.type === 'input' || child.userData?.type === 'output') && child instanceof THREE.Mesh) {
                const mat = child.material as THREE.MeshStandardMaterial;
                mat.emissive.set(this.intersected === child ? 'yellow' : 'black');
            }
        });

        // Show text for either selected object (VR/click) or intersected object (hover)
        const objectToDisplay = this.selectedObject || this.intersected;

        if (objectToDisplay) {
            // Handle different object types
            if (objectToDisplay.userData?.type === 'resource') {
                // Handle job spheres
                let found = false;
                this.stepVisuals.forEach((stepVisual, index) => {
                    const isMatch = stepVisual.mesh === objectToDisplay;
                    if (isMatch) {
                        const job = stepVisual.job;
                        if (job) {
                            const displayText = job.semanticSpec.description
                                ? `${job.name}:\n${job.semanticSpec.description}`
                                : `${job.name}\n[No description available]`;
                            this.showText(displayText);
                        } else {
                            this.showText(`Step: ${stepVisual.stepId}`);
                        }
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
                const stepVisual = this.stepVisuals.find(sv => sv.job?.id === jobId);
                const displayText = stepVisual?.job
                    ? `Input: ${inputName}\nJob: ${stepVisual.job.name}`
                    : `Input: ${inputName}`;
                this.showText(displayText);
            } else if (objectToDisplay.userData?.type === 'output') {
                // Handle output cylinders
                const outputName = objectToDisplay.userData.name;
                const jobId = objectToDisplay.userData.jobId;
                const stepVisual = this.stepVisuals.find(sv => sv.job?.id === jobId);
                const displayText = stepVisual?.job
                    ? `Output: ${outputName}\nJob: ${stepVisual.job.name}`
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
        if ((this as any).renderer.xr.getSession()) {
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
        (this as any).scene.traverse((child: THREE.Object3D) => {
            if (child.userData?.type === 'resource' || child.userData?.type === 'input' || child.userData?.type === 'output') {
                allInteractables.push(child);
            }
        });

        if (allInteractables.length === 0) {
            return null;
        }

        // We need to access the controller somehow. Let's try to find it in cameraRig
        let controller: THREE.Group | null = null;
        (this as any).cameraRig.traverse((child: THREE.Object3D) => {
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
        const canvas = (this as any).renderer.domElement;
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
        (this as any).scene.traverse((child: THREE.Object3D) => {
            if (child.userData?.type === 'resource' || child.userData?.type === 'input' || child.userData?.type === 'output') {
                allInteractables.push(child);
            }
        });

        if (allInteractables.length === 0) {
            return null;
        }

        // Update the mouse raycaster
        this.mouseRaycaster.setFromCamera(this.mouse, (this as any).camera);

        // Perform raycast against all interactable objects
        const intersects = this.mouseRaycaster.intersectObjects(allInteractables, false);

        return intersects.length > 0 ? intersects[0].object : null;
    }

    private clearHighlighting() {
        (this as any).scene.traverse((child: THREE.Object3D) => {
            if (child.userData?.type === 'resource' && child instanceof THREE.Mesh) {
                const mat = child.material as THREE.MeshStandardMaterial;
                mat.emissive.set('black');
            } else if ((child.userData?.type === 'input' || child.userData?.type === 'output') && child instanceof THREE.Mesh) {
                const mat = child.material as THREE.MeshStandardMaterial;
                mat.emissive.set('black');
            }
        });
    }

    private createWorkflowVisualization(workflow: Workflow) {
        // For now, create a simplified visualization
        // This is a basic implementation that can be expanded
        
        const stepPositions = this.calculateStepPositions(workflow.steps);
        
        stepPositions.forEach((position, index) => {
            this.createStepVisualization(position.step, position.x, position.y, position.z, index);
        });
        
        // Create connections between steps
        this.createStepConnections(workflow.steps, stepPositions);
    }
    
    private calculateStepPositions(steps: WorkflowStepUnion[]): Array<{step: WorkflowStepUnion, x: number, y: number, z: number}> {
        const positions: Array<{step: WorkflowStepUnion, x: number, y: number, z: number}> = [];
        const horizontalSpacing = 15;
        const verticalSpacing = 8;
        
        steps.forEach((step, index) => {
            const x = index * horizontalSpacing;
            const y = 0;
            const z = 0;
            
            positions.push({ step, x, y, z });
        });
        
        return positions;
    }
    
    private createStepVisualization(step: WorkflowStepUnion, x: number, y: number, z: number, index: number) {
        const sphereRadius = 2;
        
        let color = 0x0066cc; // Default blue
        let stepId = `step-${index}`;
        let job: Job | undefined;
        
        // Determine color and properties based on step type
        switch (step.type) {
            case 'simple':
                color = 0x0066cc; // Blue for simple steps
                stepId = step.step.id;
                job = this.availableJobs.get(step.step.jobId);
                break;
            case 'parallel':
                color = 0x6600cc; // Purple for parallel
                stepId = `parallel-${index}`;
                break;
            case 'conditional':
                color = 0xcc6600; // Orange for conditional
                stepId = `conditional-${index}`;
                break;
            case 'while':
                color = 0x00cc66; // Green for while loops
                stepId = `while-${index}`;
                break;
            case 'for':
                color = 0xcc0066; // Pink for for loops
                stepId = `for-${index}`;
                break;
        }
        
        // Create main sphere
        const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
        const sphereMaterial = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.3,
            roughness: 0.4
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        
        sphere.position.set(x, y, z);
        
        // Set userData for interaction
        sphere.userData = {
            type: 'resource',
            name: job?.name || step.type,
            description: job?.semanticSpec.description || `${step.type} step`,
            jobId: job?.id,
            stepId: stepId,
            stepType: step.type
        };
        
        (this as any).scene.add(sphere);
        
        // Store the step visual data
        this.stepVisuals.push({
            stepUnion: step,
            mesh: sphere,
            job: job,
            level: 0, // Will be calculated later if needed
            indexInLevel: index,
            stepId: stepId
        });
        
        // Create input/output stubs for simple steps
        if (step.type === 'simple' && job) {
            this.createStepInputOutputStubs(job, x, y, z, stepId);
        }
    }
    
    private createStepInputOutputStubs(job: Job, centerX: number, centerY: number, centerZ: number, stepId: string) {
        const sphereRadius = 2;
        const stubRadius = 0.15;
        const stubLength = 0.8;
        const stubSpacing = 0.8;
        
        // Create input stubs (green cylinders on the left)
        job.syntacticSpec.inputs.forEach((input, inputIndex) => {
            const inputStub = this.createCylinder(stubRadius, stubLength, 0x00ff00);
            
            const totalInputs = job.syntacticSpec.inputs.length;
            const inputY = centerY + (inputIndex - (totalInputs - 1) / 2) * stubSpacing;
            const inputX = centerX - sphereRadius - stubLength / 2;
            const inputZ = centerZ;
            
            inputStub.position.set(inputX, inputY, inputZ);
            inputStub.rotation.z = Math.PI / 2; // Rotate to horizontal
            
            inputStub.userData = {
                type: 'input',
                name: input.role.name,
                jobId: job.id,
                stepId: stepId
            };
            
            (this as any).scene.add(inputStub);
        });
        
        // Create output stubs (red cylinders on the right)
        job.syntacticSpec.outputs.forEach((output, outputIndex) => {
            const outputStub = this.createCylinder(stubRadius, stubLength, 0xff0000);
            
            const totalOutputs = job.syntacticSpec.outputs.length;
            const outputY = centerY + (outputIndex - (totalOutputs - 1) / 2) * stubSpacing;
            const outputX = centerX + sphereRadius + stubLength / 2;
            const outputZ = centerZ;
            
            outputStub.position.set(outputX, outputY, outputZ);
            outputStub.rotation.z = Math.PI / 2; // Rotate to horizontal
            
            outputStub.userData = {
                type: 'output',
                name: output.role.name,
                jobId: job.id,
                stepId: stepId
            };
            
            (this as any).scene.add(outputStub);
        });
    }
    
    private createStepConnections(steps: WorkflowStepUnion[], positions: Array<{step: WorkflowStepUnion, x: number, y: number, z: number}>) {
        // Create simple sequential connections for now
        // In a full implementation, this would analyze the dataExchanges in each step
        
        for (let i = 0; i < positions.length - 1; i++) {
            const fromPos = positions[i];
            const toPos = positions[i + 1];
            
            const startPoint = new THREE.Vector3(fromPos.x + 2, fromPos.y, fromPos.z);
            const endPoint = new THREE.Vector3(toPos.x - 2, toPos.y, toPos.z);
            
            const connection = this.createSimpleConnection(startPoint, endPoint);
            (this as any).scene.add(connection);
            this.connectionObjects.push(connection);
        }
    }
    
    private createSimpleConnection(startPos: THREE.Vector3, endPos: THREE.Vector3): THREE.Group {
        const group = new THREE.Group();
        
        // Create a simple line connection
        const geometry = new THREE.BufferGeometry().setFromPoints([startPos, endPos]);
        const material = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            linewidth: 2,
            transparent: true,
            opacity: 0.7
        });
        
        const line = new THREE.Line(geometry, material);
        group.add(line);
        
        // Add arrow at the end
        const arrowGeometry = new THREE.ConeGeometry(0.2, 0.5, 8);
        const arrowMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffff });
        const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
        
        // Position and orient the arrow
        arrow.position.copy(endPos);
        const direction = new THREE.Vector3().subVectors(endPos, startPos).normalize();
        arrow.lookAt(endPos.clone().add(direction));
        arrow.rotateX(Math.PI / 2);
        
        group.add(arrow);
        
        return group;
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
    
    private createDirectPath(startPos: THREE.Vector3, endPos: THREE.Vector3): THREE.Vector3[] {
        const segments = 8;
        const points: THREE.Vector3[] = [];
        const direction = new THREE.Vector3().subVectors(endPos, startPos);
        const distance = direction.length();

        // Add start point
        points.push(startPos.clone());

        // Add jagged middle points
        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const basePoint = new THREE.Vector3().lerpVectors(startPos, endPos, t);

            // Add random perpendicular offset for lightning effect
            const perpendicular = new THREE.Vector3(-direction.y, direction.x, 0).normalize();
            const zigzagAmount = (distance * 0.1) * (Math.random() - 0.5) * Math.sin(t * Math.PI * 3);
            basePoint.add(perpendicular.multiplyScalar(zigzagAmount));

            points.push(basePoint);
        }

        // Add end point
        points.push(endPos.clone());

        return points;
    }

    private createRoutedPath(startPos: THREE.Vector3, endPos: THREE.Vector3): THREE.Vector3[] {
        const points: THREE.Vector3[] = [];

        // Route the connection above or below the main workflow area
        const routeAbove = startPos.y > 0; // Choose based on start position
        const routingHeight = routeAbove ? 15 : -15; // Route 15 units above/below

        // Create waypoints for the routed path
        points.push(startPos.clone());

        // Go up/down to routing level
        const verticalPoint1 = new THREE.Vector3(startPos.x, routingHeight, startPos.z);
        points.push(verticalPoint1);

        // Add some intermediate points along the routing level for lightning effect
        const segments = Math.floor((endPos.x - startPos.x) / 15) + 1; // One segment per execution level
        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const x = startPos.x + (endPos.x - startPos.x) * t;
            const routingPoint = new THREE.Vector3(x, routingHeight, startPos.z);

            // Add small random offsets for lightning effect
            routingPoint.y += (Math.random() - 0.5) * 2;
            routingPoint.z += (Math.random() - 0.5) * 2;

            points.push(routingPoint);
        }

        // Come back down to target level
        const verticalPoint2 = new THREE.Vector3(endPos.x, routingHeight, endPos.z);
        points.push(verticalPoint2);

        // Final connection to target
        points.push(endPos.clone());

        return points;
    }

}