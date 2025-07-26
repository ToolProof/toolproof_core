import React from 'react';
import { Workflow } from 'updohilo/dist/types/typesWF';

interface ConnectionLinesProps {
    workflow: Workflow;
}

export default function ConnectionLines({ workflow }: ConnectionLinesProps) {
    // For now, this is a placeholder component
    // In a full implementation, this would draw SVG lines between connected steps
    // based on the dataExchanges in the workflow steps
    
    const connections: Array<{
        fromStep: string;
        toStep: string;
        output: string;
        input: string;
    }> = [];

    // Extract connections from workflow steps
    workflow.steps.forEach((step) => {
        if (step.type === 'simple') {
            step.step.dataExchanges.forEach((exchange) => {
                connections.push({
                    fromStep: exchange.sourceJobId,
                    toStep: exchange.targetJobId,
                    output: exchange.sourceOutput,
                    input: exchange.targetInput
                });
            });
        }
        // TODO: Handle other step types (parallel, conditional, etc.)
    });

    if (connections.length === 0) {
        return null;
    }

    return (
        <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
            {connections.map((connection, index) => (
                <g key={index}>
                    {/* This is a simplified line - in practice, you'd calculate actual positions */}
                    <line
                        x1={100}
                        y1={100 + index * 50}
                        x2={300}
                        y2={150 + index * 50}
                        stroke="#3B82F6"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                    />
                    <text
                        x={200}
                        y={120 + index * 50}
                        className="text-xs fill-gray-600"
                        textAnchor="middle"
                    >
                        {connection.output} → {connection.input}
                    </text>
                </g>
            ))}
            
            {/* Arrow marker definition */}
            <defs>
                <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                >
                    <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="#3B82F6"
                    />
                </marker>
            </defs>
        </svg>
    );
}
