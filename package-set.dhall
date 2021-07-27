let upstream = https://github.com/dfinity/vessel-package-set/releases/download/mo-0.6.5-20210714/package-set.dhall sha256:8a540b28e41ab539c9b3ceca6c259295fd61ca83d605988877ba39688b1aa1f8
let Package =
    { name : Text, version : Text, repo : Text, dependencies : List Text }

let
  -- This is where you can add your own packages to the package-set
  additions =
    [] : List Package

let
  {- This is where you can override existing packages in the package-set

     For example, if you wanted to use version `v2.0.0` of the foo library:
     let overrides = [
         { name = "foo"
         , version = "v2.0.0"
         , repo = "https://github.com/bar/foo"
         , dependencies = [] : List Text
         }
     ]
  -}
  overrides =
    [] : List Package

in  upstream # additions # overrides
