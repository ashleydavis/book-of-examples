interface Headings
    exposes [headingsMatch]
    imports []

headingsMatch = \headingA, headingB ->
    if List.len headingA != List.len headingB then 
        Bool.false
    else 
        Bool.true
    

expect headingsMatch ["a"] ["a"] == Bool.true

expect headingsMatch ["a"] ["a", "b"] == Bool.false