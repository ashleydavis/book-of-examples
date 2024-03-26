
//
// Represents an asset that can be displayed in the gallery.
//
export interface IGalleryItem {

    //
    // The ID of the asset.
    //
    _id: string;

    //
    // The global index of the asset.
    //
    globalIndex: number;

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
    // The original name of the asset before it was uploaded.
    //
    origFileName: string;

    //
    // The hash of the asset.
    //
    hash: string;

    //
    // Reverse geocoded location of the asset, if known.
    //
    location?: string;

    //
    // The date the file was created.
    //
    fileDate: string;

    //
    // The date the photo was taken, if known.
    //
    photoDate?: string;

    //
    /// The date the asset is sorted by in the backend.
    //
    sortDate: string;

    //
    /// The date the asset was uploaded.
    //
    uploadDate: string;

    //
    // Optional properties, like exif data.
    //
    properties?: any;

    //
    // Labels that have been added to the asset.
    //
    labels?: string[];

    //
    // Description of the asset, once it has been set by the user.
    //
    description?: string;

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
    items: IGalleryItem[];

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
