interface Pluralize
    exposes [pluralize]
    imports []

pluralize = \singular, plural, count ->
    countStr = Num.toStr count

    if count == 1 then
        "$(countStr) $(singular)"
    else
        "$(countStr) $(plural)"

expect pluralize "cactus" "cacti" 1 == "1 cactus"

expect pluralize "cactus" "cacti" 2 == "2 cacti"