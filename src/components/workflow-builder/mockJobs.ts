import { Job } from './types';
import { v4 as uuidv4 } from 'uuid';

export const availableJobs: Job[] = [
    {
        id: uuidv4(),
        name: 'generate_candidate',
        description: 'Generates candidate ligand from an anchor ligand and a target receptor.',
        inputs: ['anchor', 'target'],
        outputs: ['candidate']
    },
    {
        id: uuidv4(),
        name: 'basic_docking_with_autodock',
        description: 'Performs basic docking using AutoDock.',
        inputs: ['candidate', 'target', 'box'],
        outputs: ['docking', 'pose']
    },
];

export const mockJobs: Job[] = [
    {
        id: uuidv4(),
        name: 'addition',
        description: 'Adds two numbers together.',
        inputs: ['num_a', 'num_b'],
        outputs: ['sum_a_b'],
    },
    {
        id: uuidv4(),
        name: 'subtraction',
        description: 'Subtracts one number from another.',
        inputs: ['num_a', 'num_b'],
        outputs: ['diff_a_b'],
    },
    {
        id: uuidv4(),
        name: 'multiplication',
        description: 'Multiplies two numbers together.',
        inputs: ['num_a', 'num_b'],
        outputs: ['prod_a_b'],
    },
    {
        id: uuidv4(),
        name: 'division',
        description: 'Divides one number by another.',
        inputs: ['num_a', 'num_b'],
        outputs: ['quot_a_b'],
    },
]