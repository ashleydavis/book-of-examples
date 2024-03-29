import { IGalleryItem } from "./lib/gallery-item";
import { IGalleryLayout, computePartialLayout } from "./lib/layout";
import { assets } from "./tests/lib/data/assets";
import fs from "fs";

async function main() {
    const batches = createRandomizedAssetBatches(assets);
    let layout: IGalleryLayout | undefined = undefined;
    for (const batch of batches) {
        layout = computePartialLayout(layout, batch, 600, 150);
    }

    // const layout = computePartialLayout(undefined, assets, 600, 150);
    fs.writeFileSync('./test/outputs/output.json', JSON.stringify(layout, null, 2));
    console.log("Done");
}

main()
   .catch(err => {
        console.error('An error occurred');
        console.error(err);
   });

//
// Break assets up into random batches.
//
function createRandomizedAssetBatches(assets: IGalleryItem[]): IGalleryItem[][] {
    
    // Create a batch size between 1 and 25.
    let batchSize = Math.floor(Math.random() * 25) + 1;
    console.log(`Batch size: ${batchSize}`);

    const batches: IGalleryItem[][] = [];

    let curBatch: IGalleryItem[] = [];
    for (const asset of assets) {
        curBatch.push(asset);
        if (curBatch.length >= batchSize) {
            batches.push(curBatch);
            curBatch = [];

            batchSize = Math.floor(Math.random() * 25) + 1;
            console.log(`Batch size: ${batchSize}`);
        }
    }

    if (curBatch.length > 0) {
        batches.push(curBatch);
    }

    // Sum the number of items in all batches.
    const numItems = batches.reduce((acc, batch) => acc + batch.length, 0);
    if (numItems !== assets.length) {
        throw new Error(`Number of items in batches (${numItems}) does not match number of items in assets (${assets.length}).`);
    }

    return batches;
}