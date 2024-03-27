import { computePartialLayout } from "./lib/layout";
import { assets } from "./tests/lib/data/assets";
import fs from "fs";

async function main() {
    const layout = computePartialLayout(undefined, assets, 600, 150);
    fs.writeFileSync('./test/outputs/output.json', JSON.stringify(layout, null, 2));
}

main()
   .catch(err => {
        console.error('An error occurred');
        console.error(err);
   });