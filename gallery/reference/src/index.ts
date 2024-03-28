import { IGalleryItem } from "./lib/gallery-item";
import { IGalleryLayout, computePartialLayout } from "./lib/layout";
import { assets } from "./tests/lib/data/assets";
import fs from "fs";

async function main() {
    //
    // TODO:
    //  This test causes problems.
    //
    // const batches = createRandomizedAssetBatches(assets);
    // let layout: IGalleryLayout | undefined = undefined;
    // for (const batch of batches) {
    //     layout = computePartialLayout(layout, batch, 600, 150);
    // }

    const layout = computePartialLayout(undefined, assets, 600, 150);
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
    const batchSize = 3; //Math.floor(Math.random() * 3) + 1;
    console.log(`Batch size: ${batchSize}`);
    const batches: IGalleryItem[][] = [];

    let curBatch: IGalleryItem[] = [];
    for (const asset of assets) {
        curBatch.push(asset);
        if (curBatch.length >= batchSize) {
            batches.push(curBatch);
            curBatch = [];
        }
    }

    return batches;
}