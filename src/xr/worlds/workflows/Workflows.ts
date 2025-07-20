import { Workflow, WorkflowNode, WorkflowEdge, Concept, Job, ResourceType } from '@/components/workflow-builder/types';
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
                        const displayText = dataObject.job.semanticSpec.description
                            ? `${dataObject.job.displayName}:\n${dataObject.job.semanticSpec.description}`
                            : `${dataObject.job.displayName}\n[No description available]`;
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
                    ? `Input: ${inputName}\nJob: ${workflowNode.job.displayName}`
                    : `Input: ${inputName}`;
                this.showText(displayText);
            } else if (objectToDisplay.userData?.type === 'output') {
                // Handle output cylinders
                const outputName = objectToDisplay.userData.name;
                const jobId = objectToDisplay.userData.jobId;
                const workflowNode = this.workflowNodes.find(ws => ws.job.id === jobId);
                const displayText = workflowNode
                    ? `Output: ${outputName}\nJob: ${workflowNode.job.displayName}`
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
            calculateLevel(node.job.id);
        });

        return levels;
    }

    private optimizeInputSocketOrder(job: Job, workflowNode: WorkflowNode, workflow: Workflow): ResourceType[] {
        // Create array of inputs with their source node positions
        interface InputWithPosition {
            input: ResourceType;
            sourceY: number;
            isFake: boolean;
        }

        const inputsWithSourcePositions: InputWithPosition[] = job.syntacticSpec.inputs.map((input: ResourceType) => {
            // Find the source node that produces this input
            const sourceEdge = workflow.edges.find(edge =>
                edge.to === workflowNode.job.id && edge.dataFlow.includes(input.displayName)
            );

            if (!sourceEdge) {
                // No source found (probably a fake step input), keep original position
                return {
                    input,
                    sourceY: 0, // Default position for inputs without sources
                    isFake: true
                };
            }

            const sourceNode = workflow.nodes.find(node => node.job.id === sourceEdge.from);
            if (!sourceNode) {
                return { input, sourceY: 0, isFake: true };
            }

            // Get the Y position of the source node
            const executionLevels = this.calculateExecutionLevels(workflow);
            const sourceLevel = executionLevels.get(sourceNode.job.id);

            if (!sourceLevel) {
                return { input, sourceY: 0, isFake: true };
            }

            // Calculate source node's Y position (same logic as in createWorkflowVisualization)
            const nodesAtSourceLevel = Array.from(executionLevels.entries())
                .filter(([_, nodeLevel]) => nodeLevel.level === sourceLevel.level)
                .map(([nodeId, _]) => workflow.nodes.find(n => n.job.id === nodeId))
                .filter((node): node is WorkflowNode => node !== undefined);

            const sourceIndexInLevel = nodesAtSourceLevel.findIndex(n => n.job.id === sourceNode.job.id);
            const verticalSpacing = 8; // Same as in createWorkflowVisualization
            const sourceY = (sourceIndexInLevel - (nodesAtSourceLevel.length - 1) / 2) * verticalSpacing;

            return {
                input,
                sourceY,
                isFake: false
            };
        });

        // Sort inputs by their source Y position (top to bottom)
        // Put fake inputs at the bottom
        inputsWithSourcePositions.sort((a: InputWithPosition, b: InputWithPosition) => {
            if (a.isFake && !b.isFake) return 1;  // Fake inputs go to bottom
            if (!a.isFake && b.isFake) return -1; // Real inputs go to top
            return a.sourceY - b.sourceY; // Sort by Y position (top to bottom)
        });

        return inputsWithSourcePositions.map((item: InputWithPosition) => item.input);
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
            const level = executionLevels.get(workflowNode.job.id);
            if (level === undefined) return;

            const nodesAtLevel = Array.from(executionLevels.entries())
                .filter(([_, nodeLevel]) => nodeLevel.level === level.level)
                .map(([nodeId, _]) => workflow.nodes.find(n => n.job.id === nodeId))
                .filter((node): node is WorkflowNode => node !== undefined);

            const indexInLevel = nodesAtLevel.findIndex(n => n.job.id === workflowNode.job.id);

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
                name: job.displayName,
                description: job.semanticSpec.description,
                jobId: job.id,
                stepId: workflowNode.job.id, // Use job.id since WorkflowNode doesn't have id
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
            // Optimize input socket ordering based on source node positions to minimize crossings
            const optimizedInputs = this.optimizeInputSocketOrder(job, workflowNode, workflow);

            optimizedInputs.forEach((input, inputIndex) => {
                const inputStub = this.createCylinder(
                    stubRadius,
                    stubLength,
                    0x00ff00 // Green color for inputs
                );

                // Position input stubs linearly on the left side of the sphere
                const stubVerticalSpacing = 0.8;
                const totalInputs = optimizedInputs.length;
                const inputY = y + (inputIndex - (totalInputs - 1) / 2) * stubVerticalSpacing;
                const inputX = x - sphereRadius - stubLength / 2; // Attached to left side
                const inputZ = z;

                inputStub.position.set(inputX, inputY, inputZ);
                inputStub.rotation.z = Math.PI / 2; // Rotate to horizontal

                // Set userData for the input
                inputStub.userData = {
                    type: 'input',
                    name: input.displayName,
                    jobId: job.id,
                    stepId: workflowNode.job.id // Use job.id since WorkflowNode doesn't have id
                };

                this.scene.add(inputStub);
            });

            // Create output stubs (red cylinders on the right side)
            job.syntacticSpec.outputs.forEach((output, outputIndex) => {
                const outputStub = this.createCylinder(
                    stubRadius,
                    stubLength,
                    0xff0000 // Red color for outputs
                );

                // Position output stubs linearly on the right side of the sphere
                const stubVerticalSpacing = 0.8;
                const totalOutputs = job.syntacticSpec.outputs.length;
                const outputY = y + (outputIndex - (totalOutputs - 1) / 2) * stubVerticalSpacing;
                const outputX = x + sphereRadius + stubLength / 2; // Attached to right side
                const outputZ = z;

                outputStub.position.set(outputX, outputY, outputZ);
                outputStub.rotation.z = Math.PI / 2; // Rotate to horizontal

                // Set userData for the output
                outputStub.userData = {
                    type: 'output',
                    name: output.displayName,
                    jobId: job.id,
                    stepId: workflowNode.job.id // Use job.id since WorkflowNode doesn't have id
                };

                this.scene.add(outputStub);
            });
        });

        // Create animated connections between matching outputs and inputs
        this.createAnimatedConnections(workflow);
    }

    private createAnimatedConnections(workflow: Workflow) {
        // Clear any existing connection objects
        this.connectionObjects.forEach(obj => {
            this.scene.remove(obj);
        });
        this.connectionObjects = [];

        // Create lightning connections for each edge
        workflow.edges.forEach(edge => {
            const fromNode = workflow.nodes.find(n => n.job.id === edge.from);
            const toNode = workflow.nodes.find(n => n.job.id === edge.to);

            if (!fromNode || !toNode) return;

            // Find the mesh objects for these nodes
            const fromMesh = this.workflowNodes.find(wn => wn.job.id === fromNode.job.id)?.mesh;
            const toMesh = this.workflowNodes.find(wn => wn.job.id === toNode.job.id)?.mesh;

            if (!fromMesh || !toMesh) return;

            // Create lightning connection for each data flow
            edge.dataFlow.forEach(dataName => {
                // Find the specific output and input stubs
                const outputIndex = fromNode.job.syntacticSpec.outputs.findIndex(output => output.displayName === dataName);

                // For input index, we need to use the optimized order, not the original
                const optimizedInputs = this.optimizeInputSocketOrder(toNode.job, toNode, workflow);
                const inputIndex = optimizedInputs.findIndex(input => input.displayName === dataName);

                if (outputIndex === -1 || inputIndex === -1) return;

                // Calculate positions of the specific stubs
                const fromPos = fromMesh.position.clone();
                const toPos = toMesh.position.clone();

                // Adjust for stub positions
                const sphereRadius = 2;
                const stubLength = 0.8;
                const stubVerticalSpacing = 0.8;

                // Output stub position (right side of from node)
                const totalOutputs = fromNode.job.syntacticSpec.outputs.length;
                const outputY = fromPos.y + (outputIndex - (totalOutputs - 1) / 2) * stubVerticalSpacing;
                const outputPos = new THREE.Vector3(
                    fromPos.x + sphereRadius + stubLength / 2,
                    outputY,
                    fromPos.z
                );

                // Input stub position (left side of to node) - using optimized order
                const totalInputs = optimizedInputs.length;
                const inputY = toPos.y + (inputIndex - (totalInputs - 1) / 2) * stubVerticalSpacing;
                const inputPos = new THREE.Vector3(
                    toPos.x - sphereRadius - stubLength / 2,
                    inputY,
                    toPos.z
                );

                // Create lightning connection
                const lightning = this.createLightningConnection(outputPos, inputPos, dataName);
                this.scene.add(lightning);
                this.connectionObjects.push(lightning);
            });
        });
    }

    private createLightningConnection(startPos: THREE.Vector3, endPos: THREE.Vector3, dataName: string): THREE.Group {
        const group = new THREE.Group();

        // Calculate if this is a long-distance connection that needs routing
        const distance = startPos.distanceTo(endPos);
        const isLongDistance = distance > 30; // Threshold for long connections

        let points: THREE.Vector3[];

        if (isLongDistance) {
            // Route long connections around the main workflow area
            points = this.createRoutedPath(startPos, endPos);
        } else {
            // Use direct jagged path for short connections
            points = this.createDirectPath(startPos, endPos);
        }

        // Create the lightning geometry
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        // Create animated material that pulses
        const material = new THREE.LineBasicMaterial({
            color: isLongDistance ? 0xff8800 : 0x00ffff, // Orange for long routes, cyan for short
            linewidth: 3,
            transparent: true,
            opacity: 0.8
        });

        const lightning = new THREE.Line(geometry, material);

        // Add glow effect with additional thicker, more transparent line
        const glowMaterial = new THREE.LineBasicMaterial({
            color: isLongDistance ? 0xffaa44 : 0x88ffff,
            linewidth: 8,
            transparent: true,
            opacity: 0.3
        });
        const glowLine = new THREE.Line(geometry.clone(), glowMaterial);

        group.add(lightning);
        group.add(glowLine);

        // Store animation data
        group.userData = {
            type: 'lightning',
            dataName: dataName,
            startTime: Date.now(),
            mainMaterial: material,
            glowMaterial: glowMaterial,
            points: points,
            isLongDistance: isLongDistance
        };

        return group;
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