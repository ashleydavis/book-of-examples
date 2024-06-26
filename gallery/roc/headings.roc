interface Headings
    exposes [headingsMatch]
    imports []

headingsMatch = \headingA, headingB ->
    if List.len headingA != List.len headingB then 
        # Different lengths.
        Bool.false
    else if List.len headingA == 0 && List.len headingB == 0 then
        # Matching empty lists.
        Bool.true
    else
        listsMatch = \listA, listB ->
            if List.first listA != List.first listB then
                # First item doesn't match.
                Bool.false
            else if List.len listA == 1 then
                # Last item matches.
                Bool.true
            else 
                # Look at the rest of the list.
                listsMatch (List.dropFirst listA 1) (List.dropFirst listB 1)

        # Look at the rest of the list.
        listsMatch headingA headingB

expect headingsMatch [] [] == Bool.true
expect headingsMatch [] ["a"] == Bool.false
expect headingsMatch ["a"] [] == Bool.false
expect headingsMatch ["a"] ["a"] == Bool.true
expect headingsMatch ["a", "b"] ["a", "b"] == Bool.true
expect headingsMatch ["a"] ["b"] == Bool.false
expect headingsMatch ["a", "b"] ["b", "a"] == Bool.false
expect headingsMatch ["a"] ["a", "b"] == Bool.false
expect headingsMatch ["a", "b"] ["a"] == Bool.false