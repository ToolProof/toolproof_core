import { Workflow, WorkflowNode, WorkflowEdge } from '@/components/workflow-builder/types';
// import { XRWorld, TransientSelection } from 'metaverse/dist/XRWorld';
import { XRWorld, TransientSelection } from '../../XRWorld';
import * as THREE from 'three';


interface WorkflowNodeWithMesh extends WorkflowNode {
    mesh: THREE.Mesh;
}

class Workflows extends XRWorld {
    private workflowNodes: WorkflowNodeWithMesh[] = [];
    private connectionObjects: THREE.Object3D[] = []; // Changed to handle any 3D object
    private mouse: THREE.Vector2 = new THREE.Vector2();
    private mouseRaycaster: THREE.Raycaster = new THREE.Raycaster();
    private isMouseInteracting: boolean = false;
    private tooltip: HTMLDivElement | null = null;
    private workflow: Workflow;

    constructor(container: HTMLDivElement, workflow: Workflow) {
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

        // Create spheres with stubs for each workflow step
        this.createWorkflowVisualization(this.workflow);

        // Position camera to get a good view of all workflow nodes
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
        /* console.log('selectedObject:', this.selectedObject);
        console.log('intersected:', this.intersected);
        console.log('dataObjects count:', this.workflowNodes.length);
        console.log('isMouseInteracting:', this.isMouseInteracting);
        console.log('VR Session:', this.renderer.xr.getSession()); */

        // Show text for either selected object (VR/click) or intersected object (hover)
        const objectToDisplay = this.selectedObject || this.intersected;

        if (objectToDisplay) {
            /* console.log('Display object userData:', objectToDisplay.userData);
            console.log('Display object type:', objectToDisplay.type);
            console.log('Display object constructor:', objectToDisplay.constructor.name);
            console.log('Display object id:', objectToDisplay.id);
            console.log('Looking for matching dataObject...'); */

            // Handle different object types
            if (objectToDisplay.userData?.type === 'resource') {
                // Handle job spheres
                let found = false;
                this.workflowNodes.forEach((dataObject, index) => {
                    const isMatch = dataObject.mesh === objectToDisplay;
                    if (index < 5 || isMatch) {
                        //console.log(`Checking dataObject ${index}:`, isMatch, dataObject.job.name,
                        //    'meshId:', dataObject.mesh.id, 'objectId:', objectToDisplay?.id);
                    }
                    if (isMatch) {
                        //console.log('Found matching dataObject:', dataObject);
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
                const workflowNode = this.workflowNodes.find(ws => ws.job.id === jobId);
                const displayText = workflowNode
                    ? `Input: ${inputName}\nJob: ${workflowNode.job.name}`
                    : `Input: ${inputName}`;
                this.showText(displayText);
            } else if (objectToDisplay.userData?.type === 'output') {
                // Handle output cylinders
                const outputName = objectToDisplay.userData.name;
                const jobId = objectToDisplay.userData.jobId;
                const workflowNode = this.workflowNodes.find(ws => ws.job.id === jobId);
                const displayText = workflowNode
                    ? `Output: ${outputName}\nJob: ${workflowNode.job.name}`
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
        // console.log('Tooltip showing:', text);
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

    private calculateExecutionLevels(workflow: Workflow): Map<string, { level: number }> {
        const levels = new Map<string, { level: number }>();
        const visited = new Set<string>();
        const processing = new Set<string>();

        // Helper function to calculate the maximum dependency level for a node
        const calculateLevel = (nodeId: string): number => {
            if (processing.has(nodeId)) {
                // Circular dependency detected, treat as level 0
                return 0;
            }
            
            if (visited.has(nodeId)) {
                return levels.get(nodeId)?.level || 0;
            }

            processing.add(nodeId);
            
            // Find all edges that lead TO this node (dependencies)
            const incomingEdges = workflow.edges.filter(edge => edge.to === nodeId);
            
            if (incomingEdges.length === 0) {
                // No dependencies, this is a starting node (level 0)
                levels.set(nodeId, { level: 0 });
                visited.add(nodeId);
                processing.delete(nodeId);
                return 0;
            }

            // Calculate the maximum level of all dependencies + 1
            let maxDependencyLevel = -1;
            for (const edge of incomingEdges) {
                const dependencyLevel = calculateLevel(edge.from);
                maxDependencyLevel = Math.max(maxDependencyLevel, dependencyLevel);
            }

            const nodeLevel = maxDependencyLevel + 1;
            levels.set(nodeId, { level: nodeLevel });
            visited.add(nodeId);
            processing.delete(nodeId);
            
            return nodeLevel;
        };

        // Calculate levels for all nodes
        workflow.nodes.forEach(node => {
            calculateLevel(node.id);
        });

        return levels;
    }

    private createWorkflowVisualization(workflow: Workflow) {
        const sphereRadius = 2;
        const stubRadius = 0.15;
        const stubLength = 0.8;
        const horizontalSpacing = 15; // Space between execution levels
        const verticalSpacing = 8; // Space between parallel nodes

        // Calculate execution levels for parallel visualization
        const executionLevels = this.calculateExecutionLevels(workflow);

        // Create visual nodes for each workflow node
        workflow.nodes.forEach((workflowNode, index) => {
            const job = workflowNode.job;

            // Get the execution level and position within that level
            const level = executionLevels.get(workflowNode.id);
            if (level === undefined) return;

            const nodesAtLevel = Array.from(executionLevels.entries())
                .filter(([_, nodeLevel]) => nodeLevel.level === level.level)
                .map(([nodeId, _]) => workflow.nodes.find(n => n.id === nodeId))
                .filter((node): node is WorkflowNode => node !== undefined);

            const indexInLevel = nodesAtLevel.findIndex(n => n.id === workflowNode.id);

            // Position nodes: X = execution level, Y = position within level
            const x = level.level * horizontalSpacing - 15; // Horizontal position based on execution level
            const z = 0;
            const y = (indexInLevel - (nodesAtLevel.length - 1) / 2) * verticalSpacing; // Vertical spread for parallel nodes

            // Create main sphere for the job (simple sphere without holes)
            const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
            const sphereMaterial = new THREE.MeshStandardMaterial({
                color: workflowNode.isFakeStep ? 0x888888 : 0x000000,
                metalness: 0.3,
                roughness: 0.4
            });
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            
            sphere.position.set(x, y, z);

            // Set userData for interaction
            sphere.userData = {
                type: 'resource',
                name: job.name,
                description: job.description,
                jobId: job.id,
                stepId: workflowNode.id,
                position: workflowNode.position,
                isFakeStep: workflowNode.isFakeStep,
                executionLevel: level.level,
                parallelIndex: indexInLevel
            };

            this.scene.add(sphere);

            // Store the workflow step with its mesh
            this.workflowNodes.push({
                ...workflowNode,
                mesh: sphere
            });

            // Create input stubs (green cylinders on the left side)
            job.inputs.forEach((input, inputIndex) => {
                const inputStub = this.createCylinder(
                    stubRadius,
                    stubLength,
                    0x00ff00 // Green color for inputs
                );

                // Position input stubs linearly on the left side of the sphere
                const stubVerticalSpacing = 0.8;
                const totalInputs = job.inputs.length;
                const inputY = y + (inputIndex - (totalInputs - 1) / 2) * stubVerticalSpacing;
                const inputX = x - sphereRadius - stubLength / 2; // Attached to left side
                const inputZ = z;
                
                inputStub.position.set(inputX, inputY, inputZ);
                inputStub.rotation.z = Math.PI / 2; // Rotate to horizontal

                // Set userData for the input
                inputStub.userData = {
                    type: 'input',
                    name: input,
                    jobId: job.id,
                    stepId: workflowNode.id,
                    position: workflowNode.position
                };

                this.scene.add(inputStub);
            });

            // Create output stubs (red cylinders on the right side)
            job.outputs.forEach((output, outputIndex) => {
                const outputStub = this.createCylinder(
                    stubRadius,
                    stubLength,
                    0xff0000 // Red color for outputs
                );

                // Position output stubs linearly on the right side of the sphere
                const stubVerticalSpacing = 0.8;
                const totalOutputs = job.outputs.length;
                const outputY = y + (outputIndex - (totalOutputs - 1) / 2) * stubVerticalSpacing;
                const outputX = x + sphereRadius + stubLength / 2; // Attached to right side
                const outputZ = z;
                
                outputStub.position.set(outputX, outputY, outputZ);
                outputStub.rotation.z = Math.PI / 2; // Rotate to horizontal

                // Set userData for the output
                outputStub.userData = {
                    type: 'output',
                    name: output,
                    jobId: job.id,
                    stepId: workflowNode.id,
                    position: workflowNode.position
                };

                this.scene.add(outputStub);
            });
        });
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