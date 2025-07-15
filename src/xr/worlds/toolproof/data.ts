import { v4 as uuidv4 } from 'uuid';

interface DataObject {
    id: string;
    name: string;
    description: string;
}

export const getData = (counts: {countZero: number, countOne: number, countTwo: number, countThree: number}): {zeroObjects: DataObject[], oneObjects: DataObject[], twoObjects: DataObject[], threeObjects: DataObject[]} => {

            const _oneObjects: DataObject[] = [
                {
                    id: uuidv4(),
                    name: 'ToolProof Webclient',
                    description: 'The services you are using right now to watch this demo.'
                },
            ];
            const _twoObjects: DataObject[] = [
                {
                    id: uuidv4(),
                    name: 'job_registrar',
                    description: 'A job to register new jobs in the database.'
                },
                {
                    id: uuidv4(),
                    name: 'graph_generator',
                    description: 'A job to generate LangGraph graphs from Workflow specifications.'
                },
            ];

            // Helper function to create dummy objects
            const createDummyObject = (): DataObject => ({
                id: uuidv4(),
                name: 'Dummy',
                description: 'Dummy'
            });

            // Create zeroObjects - all dummies
            const zeroObjects: DataObject[] = Array(counts.countZero).fill(null).map(() => createDummyObject());

            // Create oneObjects - explicit objects + dummies
            const oneObjects: DataObject[] = [..._oneObjects];
            const oneRemainingCount = counts.countOne - _oneObjects.length;
            if (oneRemainingCount > 0) {
                oneObjects.push(...Array(oneRemainingCount).fill(null).map(() => createDummyObject()));
            }

            // Create twoObjects - explicit objects + dummies
            const twoObjects: DataObject[] = [..._twoObjects];
            const twoRemainingCount = counts.countTwo - _twoObjects.length;
            if (twoRemainingCount > 0) {
                twoObjects.push(...Array(twoRemainingCount).fill(null).map(() => createDummyObject()));
            }

            // Create threeObjects - one for each explicit object from _oneObjects and _twoObjects + dummies
            const threeObjects: DataObject[] = [];
            
            // Add objects corresponding to _oneObjects with 'file_' prefix
            _oneObjects.forEach(obj => {
                threeObjects.push({
                    id: uuidv4(),
                    name: `file_${obj.name}`,
                    description: `file_${obj.description || obj.name}`
                });
            });

            // Add objects corresponding to _twoObjects with 'file_' prefix
            _twoObjects.forEach(obj => {
                threeObjects.push({
                    id: uuidv4(),
                    name: `file_${obj.name}`,
                    description: `file_${obj.description || obj.name}`
                });
            });

            // Add remaining dummies if needed
            const threeRemainingCount = counts.countThree - threeObjects.length;
            if (threeRemainingCount > 0) {
                threeObjects.push(...Array(threeRemainingCount).fill(null).map(() => createDummyObject()));
            }

            return {
                zeroObjects,
                oneObjects,
                twoObjects,
                threeObjects
            };
        }
