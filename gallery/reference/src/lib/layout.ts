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
export function headingsMatch(headingsA: string[], headingsB: string[]): boolean {
    if (headingsA.length !== headingsB.length) {
        // Different lengths.
        return false;
    }

    if (headingsA.length === 0 && headingsB.length === 0) {
        // Matching empty lists.
        return true; 
    }

    if (headingsA[0] !== headingsB[0]) {
        // First item doesn't match.
        return false;
    }

    // Look at the rest of the list.
    return headingsMatch(headingsA.slice(1), headingsB.slice(1));
}

//
// Get the next row of items, possibly continuing the previous row.
//
export function getNextRow(items: IGalleryItem[], galleryWidth: number,
    targetRowHeight: number, currentRowItems: IGalleryLayoutItem[] = [],
    width: number = 0, removedItems: IGalleryItem[] = [], headings: string[] = [])
        : { row: IGalleryRow, removedItems: IGalleryItem[], remainingItems: IGalleryItem[] } {

    // Base case: if there are no items left, return the current row and removed items
    if (items.length === 0) {
        return { 
            row: {                
                items: currentRowItems, 
                offsetY: 0,
                height: targetRowHeight,
                width,
                headings,
            },
            removedItems, 
            remainingItems: items 
        };
    }

    const item = items[0];
    const aspectRatio = item.width / item.height;
    const computedWidth = targetRowHeight * aspectRatio;
    const itemGroup = item.group || [];

    // Check conditions to decide whether to break the row
    if ((currentRowItems.length > 0 && (width + computedWidth > galleryWidth || !headingsMatch(headings, itemGroup)))) {
        // Return the current row and removed items as we need to start a new row
        return { 
            row: {                
                items: currentRowItems, 
                offsetY: 0,
                height: targetRowHeight,
                width,
                headings,
            },
            removedItems, 
            remainingItems: items 
        };
    }

    if ((currentRowItems.length === 0 && headings.length > 0 && !headingsMatch(headings, itemGroup))) {
        // Return the current row and removed items as we need to start a new row
        return { 
            row: {                
                items: currentRowItems, 
                offsetY: 0,
                height: targetRowHeight,
                width,
                headings,
            },
            removedItems, 
            remainingItems: items 
        };
    }

    // Otherwise, continue adding the item to the current row
    const layoutItem: IGalleryLayoutItem = {
        _id: item._id,
        offsetX: 0,
        thumbWidth: computedWidth,
        thumbHeight: targetRowHeight,
        aspectRatio: aspectRatio,
    };

    // Recursive call to process the next item
    return getNextRow(
        items.slice(1),  // Pass the remaining items
        galleryWidth,
        targetRowHeight,
        [ ...currentRowItems, layoutItem ],  // Update the current row
        width + computedWidth,  // Update the accumulated width
        [...removedItems, item],  // Accumulate removed items
        headings.length === 0 ? itemGroup : headings  // Update headings if necessary
    );
}

//
// Creates or updates a row-based layout for items in the gallery.
//
export function computePartialLayout(existingLayout: IGalleryLayout | undefined, items: IGalleryItem[], galleryWidth: number, targetRowHeight: number): IGalleryLayout {

    let existingRows: IGalleryRow[];
    let newRows: IGalleryRow[] = [];
    let existingGalleryHeight: number;
    let remainingItems = items;
    if (existingLayout) {   
        //
        // Start with the rows from the existing layout.
        // Note the last row is dropped because we'll rebuild it.
        //
        existingRows = existingLayout.rows.slice(0, existingLayout.rows.length-1);
        existingGalleryHeight = existingLayout.galleryHeight;
        if (existingLayout.rows.length > 0) {
            //
            // Restarting the last row of the existing layout.
            //
            remainingItems = existingLayout.lastRow.concat(remainingItems);
            existingGalleryHeight -= existingLayout.rows[existingLayout.rows.length-1].height; // Remove the height of the last row.
        }
    }
    else {
        //
        // No existing layout, starting fresh.
        //
        existingRows = [];
        existingGalleryHeight = 0;
    }

    //
    // Initially assign each gallery item to a series of rows.
    //
    let lastRow: IGalleryItem[] = [];
    while (remainingItems.length > 0) {
        const { row, removedItems, remainingItems: newRemainingItems } = getNextRow(remainingItems, galleryWidth, targetRowHeight);
        newRows.push(row);
        remainingItems = newRemainingItems;
        lastRow = removedItems;
    }

    //
    // For all rows, except the last row, stretch the items towards the right hand boundary.
    //
    newRows = expandRows(newRows, galleryWidth);

    //
    // Now pull back the width of all rows so they don't overlap the right hand edge by too much.
    //
    newRows = pullbackRows(newRows, galleryWidth);

    //
    // Add group headings.
    //
    newRows = addHeadingRows(newRows);

    //
    // Computes the offsets of each row and total height of the gallery.
    //
    newRows = computeOffsets(newRows, existingGalleryHeight);

    const newGalleryHeight = existingGalleryHeight + newRows.reduce((acc, row) => acc + row.height, 0);

    return {
        rows: existingRows.concat(newRows),
        lastRow,
        galleryHeight: newGalleryHeight,
    };
}

//
// Compute offsets of rows and items.
//
function computeOffsets(newRows: IGalleryRow[], galleryHeight: number): IGalleryRow[] {

    const outputRows: IGalleryRow[] = [];

    for (let rowIndex = 0; rowIndex < newRows.length; rowIndex++) {
        const row = newRows[rowIndex];
        let accumulatedWidth = 0;

        outputRows.push({
            ...row,
            offsetY: galleryHeight,
            items: row.items.map(item => {
                const newItem = {
                    ...item,
                    offsetX: accumulatedWidth,
                };
                accumulatedWidth += item.thumbWidth;
                return newItem;
            }),        
        });

        galleryHeight += row.height;
    }

    return outputRows;
}

//
// Add headings to the gallery.
//
function addHeadingRows(newRows: IGalleryRow[]): IGalleryRow[] {

    const outputRows: IGalleryRow[] = [];

    let prevHeadings: string[] = [];

    for (let rowIndex = 0; rowIndex < newRows.length; rowIndex++) {
        const row = newRows[rowIndex];
        if (!headingsMatch(row.headings, prevHeadings)) {
            // Add the heading to the output.
            outputRows.push({
                type: "heading",
                items: [],
                offsetY: 0,
                height: 45,
                width: 0,
                headings: row.headings,
            });
        }
        
        outputRows.push(row);

        prevHeadings = row.headings;
    }

    return outputRows;
}

//
// For all rows, except the last row, stretch the items towards the right hand boundary.
//
function expandRows(rows: IGalleryRow[], galleryWidth: number): IGalleryRow[] {

    if (rows.length === 0) {
        // No rows to expand.
        return rows;
    }

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

    if (rows.length === 0) {
        // No rows to pull back.
        return rows;
    }

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