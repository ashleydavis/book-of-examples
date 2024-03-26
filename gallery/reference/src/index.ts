import { computePartialLayout } from "./lib/layout";

async function main() {
    console.log(computePartialLayout(undefined, [], 0, 0));
}

main()
   .catch(err => {
        console.error('An error occurred');
        console.error(err);
   });