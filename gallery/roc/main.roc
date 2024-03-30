app "hello"
    packages { pf: "https://github.com/roc-lang/basic-cli/releases/download/0.8.1/x8URkvfyi9I0QhmVG98roKBUs_AZRkLFwFJVJ3942YA.tar.br" }
    imports [pf.Stdout, Pluralize]
    provides [main] to pf

main =
    Stdout.line (Pluralize.pluralize "dog" "dogs" 3)