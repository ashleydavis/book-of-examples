interface Layout
    exposes [getNextRow, GalleryItem, LayoutItem, LayoutRow]
    imports []

GalleryItem : {
}

LayoutItem : {
}

LayoutRow : {
    items : List LayoutItem,
    offsetY : Int U32,
    width : Int U32,
    height : Int U32,
    headings : List Str,
}

getNextRow : List GalleryItem,  Int U32,        Int U32,         List GalleryItem,  Int U32,    List GalleryItem,   List Str -> { row : LayoutRow, removedItems: List GalleryItem, remainingItems : List GalleryItem }
getNextRow = \items,            galleryWidth,   targetRowHeight, currentRowItems,   width,      removedItems,       headings -> 
    if List.len items == 0 then {
        row: {
            items: currentRowItems,
            offsetY: 0,
            height: targetRowHeight,
            width,
            headings
        },
        removedItems,
        remainingItems: []
    }
    else {
        row: {
            items: [],
            offsetY: 0,
            width,
            height: targetRowHeight,
            headings
        },
        removedItems: [],
        remainingItems: []
    }

# Empty gallery returns empty layout.
expect getNextRow [] 10  20 [] 0 [] [] == {
    row: {
        items: [],
        offsetY: 0,
        width: 0,
        height: 20,
        headings: []
    },
    removedItems: [],
    remainingItems: []
}
    
# No items left returns current row.
expect 
    currentRowItems = [{}, {}, {}]
    removedItems = [{}, {}]
    headings = ["a", "b"]
    out = getNextRow [] 10 21 currentRowItems 12 removedItems headings
    out == {
        row: {
            items: currentRowItems,
            offsetY: 0,
            width: 12,
            height: 21,
            headings,
        },
        removedItems,
        remainingItems: []
    }


