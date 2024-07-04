app "hello"
    packages { pf: "https://github.com/roc-lang/basic-cli/releases/download/0.8.1/x8URkvfyi9I0QhmVG98roKBUs_AZRkLFwFJVJ3942YA.tar.br" }
    imports [pf.Stdout, Headings, Layout]
    provides [main] to pf

test = 
    if (Headings.headingsMatch ["a"] ["a"]) then 
        "true"
    else 
        "false"

main =
    Stdout.line (test)