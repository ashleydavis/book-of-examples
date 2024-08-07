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

getNextRow : List GalleryItem,  U32,            U32,                List GalleryItem,   U32,            List GalleryItem,   List Str -> { row : LayoutRow, removedItems: List GalleryItem, remainingItems : List GalleryItem }
getNextRow = \items,            galleryWidth,   targetRowHeight,    currentRowItems,    curRowWidth,    removedItems,       headings -> 
    when List.first items is
        Err ListWasEmpty -> {
            row: {
                items: List.map currentRowItems \galleryItem -> {}, # Produces layout items from gallery items.
                offsetY: 0,
                height: targetRowHeight,
                width: curRowWidth,
                headings
            },
            removedItems,
            remainingItems: []
        }
        Ok item ->
            aspectRatio = (Num.toFrac item.width) / (Num.toFrac item.height)
            computedWidth = (Num.toFrac targetRowHeight) * aspectRatio
            if (List.len currentRowItems) > 0 
                && ((Num.toFrac curRowWidth) + computedWidth) > (Num.toFrac galleryWidth) then {
                row: {
                    items: List.map currentRowItems \galleryItem -> {}, # Produces layout items from gallery items.
                    offsetY: 0,
                    width: curRowWidth,
                    height: targetRowHeight,
                    headings
                },
                removedItems,
                remainingItems: items,
            }        
            else {
                row: {
                    items: [],
                    offsetY: 0,
                    width: curRowWidth,
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

# Makes a gallery item for testing.
makeSquareItem : _ -> GalleryItem
makeSquareItem = \width -> {
    width,
    height: width,
    headings: []
}        

# Row breaks when computed row width exceeds gallery width
expect 
    currentRowItems = [makeDefaultItem {}, makeDefaultItem {}, makeDefaultItem {}]
    removedItems = [makeDefaultItem {}, makeDefaultItem {}]
    headings = []
    galleryWidth = 10
    targetRowHeight = 21
    curRowWidth = 12
    nextItem = makeSquareItem 100 # The next item goes over gallery width.
    out = getNextRow [nextItem] galleryWidth targetRowHeight currentRowItems curRowWidth removedItems headings
    out == {
        row: {
            items: [{}, {}, {}],
            offsetY: 0,
            width: 12,
            height: 21,
            headings,
        },
        removedItems,
        remainingItems: [nextItem]
    }

