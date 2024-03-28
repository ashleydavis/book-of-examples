//
// Implements a row-based layout algorithm.
//

import { IGalleryItem, IGalleryLayoutItem, IGalleryRow } from "./gallery-item";

export interface IGalleryLayout {
    //
    // Rows of the layout.
    //
    rows: IGalleryRow[];

    //
    // The last row of the gallery.
    // This is kept separate from the other rows to allow for easy appending of new items to this row.
    //
    lastRow: IGalleryItem[];

    //
    // The entire height of the gallery.
    //
    galleryHeight: number;
}

//
// Returns true if two sets of headings match.
//
function headingsMatch(headingsA: string[], headingsB: string[]): boolean {
    if (headingsA.length !== headingsB.length) {
        return false;
    }

    for (let i = 0; i < headingsA.length; i++) {
        if (headingsA[i] !== headingsB[i]) {
            return false;
        }
    }

    return true;
}

//
// Get the next row of items, possibly continuing the previous row.
//
export function getNextRow(items: IGalleryItem[], galleryWidth: number, targetRowHeight: number): 
    { row: IGalleryRow, removedItems: IGalleryItem[], remainingItems: IGalleryItem[] } {

    const layoutItems: IGalleryLayoutItem[] = [];
    let width = 0;

    let numItemsAdded = 0;
    let removedItems: IGalleryItem[] = [];
    let headings: string[] = [];

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
        const item = items[itemIndex];
        const aspectRatio = item.width / item.height;
        const computedWidth = targetRowHeight * aspectRatio;

        const itemGroup = item.group || [];

        if (layoutItems.length > 0) {
            if (width + computedWidth > galleryWidth) {
                //
                // Break row on width.
                //
                break;
            }
            else if (!headingsMatch(headings, itemGroup)) {
                //
                // Break row on headings.
                //
                break;
            }
        }
        else {
            headings = itemGroup;
        }

        const layoutItem: IGalleryLayoutItem = {
            _id: item._id,
            offsetX: 0,

            //
            // Add computed thumb resolution.
            //
            thumbWidth: computedWidth,
            thumbHeight: targetRowHeight,
            aspectRatio: aspectRatio,
        };

        layoutItems.push(layoutItem);
        width += computedWidth;
        numItemsAdded += 1;
        removedItems.push(item);
    }

    return {
        row: {
            items: layoutItems,
            offsetY: 0,
            height: targetRowHeight,
            width,
            headings,
        },
        removedItems,
        remainingItems: items.slice(numItemsAdded),
    };
}

//
// Creates or updates a row-based layout for items in the gallery.
//
export function computePartialLayout(existingLayout: IGalleryLayout | undefined, items: IGalleryItem[], galleryWidth: number, targetRowHeight: number): IGalleryLayout {

    let existingRows: IGalleryRow[];
    let rows: IGalleryRow[] = [];
    let galleryHeight: number;
    let remainingItems = items;
    if (existingLayout) {   
        //
        // Start with the rows from the existing layout.
        // Note the last row is dropped because we'll rebuild it.
        //
        existingRows = existingLayout.rows.slice(0, existingLayout.rows.length-1);
        galleryHeight = existingLayout.galleryHeight;
        if (existingLayout.rows.length > 0) {
            //
            // Restarting the last row of the existing layout.
            //
            remainingItems = existingLayout.lastRow.concat(remainingItems);
        }
    }
    else {
        existingRows = [];
        galleryHeight = 0;
    }

    //
    // Initially assign each gallery item to a series of rows.
    //
    let lastRow: IGalleryItem[] = [];
    while (remainingItems.length > 0) {
        const { row, removedItems, remainingItems: newRemainingItems } = getNextRow(remainingItems, galleryWidth, targetRowHeight);
        rows.push(row);
        remainingItems = newRemainingItems;
        lastRow = removedItems;
    }

    //
    // For all rows, except the last row, stretch the items towards the right hand boundary.
    //
    for (let rowIndex = 0; rowIndex < rows.length-1; rowIndex++) {
        const nextRow = rows[rowIndex+1];
        if (!headingsMatch(rows[rowIndex].headings, nextRow.headings)) {
            continue; // Don't expand the last row in each group.
        }

        const gap = galleryWidth - rows[rowIndex].width;
        const deltaWidth = gap / rows[rowIndex].items.length;

        let maxThumbHeight = 0;
        rows[rowIndex].width = 0;

        //
        // Expand each item to fill the gap.
        //
        for (const item of rows[rowIndex].items) {
            item.thumbWidth! += deltaWidth;
            item.thumbHeight = item.thumbWidth! * (1.0 / item.aspectRatio!);
            rows[rowIndex].width += item.thumbWidth!;
            maxThumbHeight = Math.max(maxThumbHeight, item.thumbHeight);
        }

        rows[rowIndex] = sizeRowToHeight(rows[rowIndex], maxThumbHeight);
    }

    //
    // Now pull back the width of all rows so they don't overlap the right hand edge by too much.
    //
    pullbackRows(rows, galleryWidth);

    //
    // Add group headings.
    //
    let prevHeadings: string[] = [];

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        //todo: Need to add headings back in.
        // if (!headingsMatch(row.headings, prevHeadings)) {
        //     rows.splice(rowIndex, 0, {
        //         type: "heading",
        //         startingAssetDisplayIndex: row.startingAssetDisplayIndex,
        //         items: [],
        //         offsetY: 0,
        //         height: 45,
        //         width: 0, // This isn't needed.
        //         headings: row.headings,
        //     });
        //     rowIndex += 1;
        // }
        
        prevHeadings = row.headings;
    }

    //
    // Computes the offsets of each row and total height of the gallery.
    //

    for (let rowIndex = 0; rowIndex < rows.length-1; rowIndex++) {
        const row = rows[rowIndex];
        row.offsetY = galleryHeight;
        galleryHeight += row.height;

        let accumulatedWidth = 0;

        for (const item of row.items) {
            item.offsetX = accumulatedWidth;
            accumulatedWidth += item.thumbWidth!;
        }
    }

    return {
        rows,
        lastRow,
        galleryHeight,
    };
}

//
// Now pull back the width of all rows so they don't overlap the right hand edge by too much.
//
function pullbackRows(rows: IGalleryRow[], galleryWidth: number) {
    for (let rowIndex = 0; rowIndex < rows.length - 1; rowIndex++) {
        const nextRow = rows[rowIndex + 1];
        if (!headingsMatch(rows[rowIndex].headings, nextRow.headings)) {
            continue; // Don't expand the last row in each group.
        }

        let pullback = 1;
        let origHeight = rows[rowIndex].height;
        let prevHeight = origHeight;

        while (true) {

            const newHeight = origHeight - pullback;
            rows[rowIndex] = sizeRowToHeight(rows[rowIndex], newHeight);

            if (rows[rowIndex].width < galleryWidth) {
                //
                // Pulled the row width in too far, restore the previous height.
                //
                rows[rowIndex] = sizeRowToHeight(rows[rowIndex], prevHeight);
                break;
            }

            prevHeight = newHeight;

            // 
            // Each time we double the amount of pullback we try. It
            // results in too many iterations if we advance this by one each loop.
            //
            pullback *= 2;
        }
    }
}

//
// Resizes a row, computing thumbnail resolution, from a requested height.
//
function sizeRowToHeight(row: IGalleryRow, height: number): IGalleryRow {
    const resizedItems = row.items.map(item => {
        return {
            ...item,
            thumbHeight: height,
            thumbWidth: height * item.aspectRatio,
        };
    });

    return {
        ...row,
        height,
        width: resizedItems.reduce((acc, item) => acc + item.thumbWidth, 0),
        items: resizedItems,
    }
}