import React from 'react';
import { Condition } from 'updohilo/dist/types/typesWF';

interface ConditionEditorProps {
    condition: Condition;
    onChange: (condition: Condition) => void;
}

export default function ConditionEditor({ condition, onChange }: ConditionEditorProps) {
    const handleOperatorChange = (op: string) => {
        let newCondition: Condition;
        
        switch (op) {
            case 'equals':
                newCondition = { op: 'equals', left: '', right: '' };
                break;
            case 'not_equals':
                newCondition = { op: 'not_equals', left: '', right: '' };
                break;
            case 'greater_than':
                newCondition = { op: 'greater_than', left: '', right: 0 };
                break;
            case 'less_than':
                newCondition = { op: 'less_than', left: '', right: 0 };
                break;
            case 'always':
                newCondition = { op: 'always' };
                break;
            default:
                newCondition = { op: 'always' };
        }
        
        onChange(newCondition);
    };

    const renderConditionInputs = () => {
        switch (condition.op) {
            case 'equals':
            case 'not_equals':
                return (
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="text"
                            value={condition.left}
                            onChange={(e) => onChange({ ...condition, left: e.target.value })}
                            placeholder="Variable name"
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                        />
                        <input
                            type="text"
                            value={condition.right as string}
                            onChange={(e) => onChange({ ...condition, right: e.target.value })}
                            placeholder="Value"
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                        />
                    </div>
                );
            
            case 'greater_than':
            case 'less_than':
                return (
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="text"
                            value={condition.left}
                            onChange={(e) => onChange({ ...condition, left: e.target.value })}
                            placeholder="Variable name"
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                        />
                        <input
                            type="number"
                            value={condition.right}
                            onChange={(e) => onChange({ ...condition, right: parseFloat(e.target.value) || 0 })}
                            placeholder="Number"
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                        />
                    </div>
                );
            
            case 'always':
                return (
                    <div className="text-xs text-gray-500 italic">
                        Always executes (default branch)
                    </div>
                );
            
            default:
                return null;
        }
    };

    return (
        <div className="space-y-2">
            <select
                value={condition.op}
                onChange={(e) => handleOperatorChange(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
            >
                <option value="always">Always (default)</option>
                <option value="equals">Equals</option>
                <option value="not_equals">Not Equals</option>
                <option value="greater_than">Greater Than</option>
                <option value="less_than">Less Than</option>
            </select>
            
            {renderConditionInputs()}
        </div>
    );
}
