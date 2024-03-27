//
// Represents an asset that can be displayed in the gallery.
//
export interface IGalleryItem  {

    //
    // The ID of the asset.
    //
    _id: string;

    //
    // The width of the item.
    //
    width: number;

    //
    // The height of item.
    //
    height: number;

    //
    // Optional grouping for the item.
    //
    group?: string[];
}

//
// Represents an asset that has been added to the layout.
//
export interface IGalleryLayoutItem {

    //
    // The ID of the asset.
    //
    _id: string;

    //
    // The horizontal location where the image starts in the gallery.
    //
    offsetX?: number;

    //
    // The width of the item.
    //
    width: number;

    //
    // The height of item.
    //
    height: number;

    //
    // The computed width of the thumbnail.
    //
    thumbWidth?: number;

    //
    // The computed height of the thumbnail.
    //
    thumbHeight?: number;

    //
    // The aspect ratio of them item, once computed.
    //
    aspectRatio?: number;

    //
    // Optional grouping for the item.
    //
    group?: string[];
}

//
// Represents a row in the gallery.
//
export interface IGalleryRow {

    //
    // The type of this row.
    //
    type?: "heading";
    
    //
    // The index in the gallery of the first asset in this row.
    //
    startingAssetDisplayIndex: number;

    //
    // Items to display in this row in the gallery.
    //
    items: IGalleryLayoutItem[];

    //
    // The vertical location where the row starts in the gallery.
    //
    offsetY: number;

    //
    // The width of this row in the gallery.
    //
    width: number;

    //
    // The height of this row in the gallery.
    //
    height: number;

    //
    // The headings displayed for this row of items.
    //
    headings: string[];
}
