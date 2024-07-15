interface Layout
    exposes [getNextRow, GalleryItem, LayoutItem, LayoutRow]
    imports []

GalleryItem : {
    width : U32,
    height : U32,
    headings : List Str,
}

LayoutItem : {
}

LayoutRow : {
    items : List LayoutItem,
    offsetY : U32,
    width : U32,
    height : U32,
    headings : List Str,
}

getNextRow : List GalleryItem,  U32,        U32,         List GalleryItem,  U32,    List GalleryItem,   List Str -> { row : LayoutRow, removedItems: List GalleryItem, remainingItems : List GalleryItem }
getNextRow = \items,            galleryWidth,   targetRowHeight, currentRowItems,   width,      removedItems,       headings -> 
    if List.len items == 0 then {
        row: {
            items: List.map currentRowItems \galleryItem -> {}, # Produces layout items from gallery items.
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

# Makes a gallery item for testing.
makeDefaultItem : _ -> GalleryItem
makeDefaultItem = \_ -> {
    width: 10,
    height: 20,
    headings: []
}    
    
# No items left returns current row.
expect 
    currentRowItems = [makeDefaultItem {}, makeDefaultItem {}, makeDefaultItem {}]
    removedItems = [makeDefaultItem {}, makeDefaultItem {}]
    headings = ["a", "b"]
    out = getNextRow [] 10 21 currentRowItems 12 removedItems headings
    out == {
        row: {
            items: [{}, {}, {}],
            offsetY: 0,
            width: 12,
            height: 21,
            headings,
        },
        removedItems,
        remainingItems: []
    }

