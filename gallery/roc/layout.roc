interface Layout
    exposes [getNextRow, GalleryItem, LayoutItem, LayoutRow]
    imports []

GalleryItem : {
}

LayoutItem : {
}

LayoutRow : {
    items : List LayoutItem,
    galleryWidth : Int U32,
    targetRowHeight : Int U32,
    currentRowItems : List GalleryItem,
    width : Int U32,
    removedItems : List GalleryItem,
    headings : List Str
}

getNextRow : List GalleryItem, Int U32, Int U32, List GalleryItem, Int U32, List GalleryItem, List Str -> { row : LayoutRow, removedItems: List GalleryItem, remainingItems : List GalleryItem }
getNextRow = \items, galleryWidth, targetRowHeight, currentRowItems, width, removedItems, headings -> 
    {
        row: {
            items: [],
            galleryWidth,
            targetRowHeight,
            currentRowItems,
            width,
            removedItems,
            headings
        },
        removedItems: [],
        remainingItems: []
    }

expect getNextRow [] 10  20 [] 0 [] [] == {
    row: {
        items: [],
        galleryWidth: 10,
        targetRowHeight: 20,
        currentRowItems: [],
        width: 0,
        removedItems: [],
        headings: []
    },
    removedItems: [],
    remainingItems: []
}
