import { computePartialLayout } from "./lib/layout";
import { assets } from "./tests/lib/data/assets";

async function main() {
    console.log(computePartialLayout(undefined, assets, 600, 150));
}

main()
   .catch(err => {
        console.error('An error occurred');
        console.error(err);
   });