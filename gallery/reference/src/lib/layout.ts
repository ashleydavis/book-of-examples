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
    rows = expandRows(rows, galleryWidth);

    //
    // Now pull back the width of all rows so they don't overlap the right hand edge by too much.
    //
    rows = pullbackRows(rows, galleryWidth);

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
            accumulatedWidth += item.thumbWidth;
        }
    }

    return {
        rows,
        lastRow,
        galleryHeight,
    };
}

//
// For all rows, except the last row, stretch the items towards the right hand boundary.
//
function expandRows(rows: IGalleryRow[], galleryWidth: number): IGalleryRow[] {

    const outputRows: IGalleryRow[] = [];

    for (let rowIndex = 0; rowIndex < rows.length - 1; rowIndex++) {
        let row = rows[rowIndex];
        const nextRow = rows[rowIndex + 1];
        if (!headingsMatch(row.headings, nextRow.headings)) {
            // Don't expand the last row in each group.
            outputRows.push(row); // No change.
            continue;
        }

        const gap = galleryWidth - row.width;
        const deltaWidth = gap / row.items.length;

        //
        // Expand each item to fill the gap.
        //
        const expandedItems = row.items.map(item => {
            const newWidth = item.thumbWidth + deltaWidth;
            return {
                ...item,
                thumbWidth: newWidth,
                thumbHeight: newWidth * (1.0 / item.aspectRatio),
            };
        });

        //
        // Resize the row to the height of the tallest item.
        //
        const rowWidth = expandedItems.reduce((acc, item) => acc + item.thumbWidth, 0);
        const expandedRow = {
            ...row,
            width: rowWidth,
            items: expandedItems,
        };
        const maxThumbHeight = Math.max(...expandedItems.map(item => item.thumbHeight));
        outputRows.push(sizeRowToHeight(expandedRow, maxThumbHeight));
    }

    outputRows.push(rows[rows.length - 1]); // The last row in the gallery.

    return outputRows;
}

//
// Now pull back the width of all rows so they don't overlap the right hand edge by too much.
//
function pullbackRows(rows: IGalleryRow[], galleryWidth: number): IGalleryRow[] {

    const outputRows: IGalleryRow[] = [];

    for (let rowIndex = 0; rowIndex < rows.length - 1; rowIndex++) { // Don't touch the last row in the gallery.
        let row = rows[rowIndex];
        const nextRow = rows[rowIndex + 1];
        if (!headingsMatch(rows[rowIndex].headings, nextRow.headings)) {
            // Don't expand the last row in each group.
            outputRows.push(row); // No change.
            continue; 
        }

        let pullback = 1;
        let origHeight = row.height;
        let prevHeight = origHeight;

        while (true) {

            const newHeight = origHeight - pullback;
            row = sizeRowToHeight(row, newHeight);

            if (row.width < galleryWidth) {
                //
                // Pulled the row width in too far, restore the previous height.
                //
                row = sizeRowToHeight(row, prevHeight);
                break;
            }

            prevHeight = newHeight;

            // 
            // Each time we double the amount of pullback we try. It
            // results in too many iterations if we advance this by one each loop.
            //
            pullback *= 2;
        }

        outputRows.push(row);
    }

    outputRows.push(rows[rows.length - 1]); // The last row in the gallery.

    return outputRows;
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