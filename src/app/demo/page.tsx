'use client';
import ToolProof from '@/xr/worlds/toolproof/ToolProof';
import Workflows from '@/xr/worlds/workflowVisualizer/WorkflowVisualizer';
import { numericalWorkflow_1, numericalWorkflow_2 } from 'updohilo/dist/mocks/mocks';
import { useEffect, useRef } from 'react';



export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  /* useEffect(() => {
    const asyncWrapper = async () => {
      if (!containerRef.current) return;

      // 1. Create and load script tag
      const script = document.createElement('script');
      script.src = 'https://toolproof.github.io/ligandokreado/ligand.js';
      script.async = true;

      script.onload = async () => {
        const SceneClass = (window as any).ExportedScene;
        if (!SceneClass) {
          console.error('window.ExportedScene not found.');
          return;
        }

        const scene: XRWorld = new SceneClass(containerRef.current);
        await scene.init();
      };

      script.onerror = () => {
        console.error('Failed to load external scene script.');
      };

      document.body.appendChild(script);
    };

    asyncWrapper();
  }, []); */

  useEffect(() => {

    const asyncWrapper = async () => {
      if (!containerRef.current) return;

      /* const toolProof = new ToolProof(containerRef.current);
      await toolProof.init(); */

      const workflowsWorld = new Workflows(containerRef.current, numericalWorkflow_1);
      await workflowsWorld.init();

      // Cleanup on unmount
      return () => {
      };
    }

    asyncWrapper();

  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100vw', height: '100vh', backgroundColor: 'orange' }}
    ></div>
  );
}
