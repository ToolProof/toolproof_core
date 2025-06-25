'use server'
import { Storage } from '@google-cloud/storage';


export const fetchData = async (source: string) => {

    const [bucketName, ...objectPathParts] = source.split('/');
    const objectPath = objectPathParts.join('/');

    const storage = new Storage();

    const file = storage.bucket(bucketName).file(objectPath);
    const [contents] = await file.download();

    return contents.toString('utf-8');
}