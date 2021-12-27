#!/usr/bin/env node

const fs = require('fs')
const RECIPE_FILE = 'recipes.json'

var recipes = []
var recipesToIngredients = {}

fs.readFile(RECIPE_FILE, 'utf8', (err, data) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    recipes = JSON.parse(data)
    recipesToIngredients = recipes.reduce(
        (acc, recipe) => ({ ...acc, [recipe.name]: recipe.ingredients }),
        {}
    )
    ingredientsToRecipes = recipes.reduce((acc, recipe) => {
        recipe.ingredients.forEach((ingredient) => {
            if (!acc[ingredient]) {
                acc[ingredient] = []
            }
            acc[ingredient].push(recipe.name)
        })
        return acc
    }, {})

    command = process.argv[2]
    args = process.argv.slice(3)

    switch (command) {
        case 'add-recipe':
            addRecipe(args[0], args.slice(1))
            break
        case 'describe':
            describe(args[0])
            break
        case 'get-recipe':
            getRecipe(args)
            break
        case 'list-recipes':
            listRecipes()
            break
        case 'remove-recipe':
            removeRecipe(args[0])
            break
        default:
            console.log('Command not recognized')
    }
})

const addRecipe = (name, ingredients) => {
    if (recipesToIngredients.hasOwnProperty(name))
        exitWithError('Recipe already exists')

    recipes.push({
        name,
        ingredients,
    })
    writeRecipes()
    console.log(`Added '${name}' to recipes.`)
}

const describe = (name) => {
    if (!recipesToIngredients.hasOwnProperty(name))
        exitWithError('Recipe does not exist')

    console.log(`${name}:`)
    recipesToIngredients[name].forEach((ingredient) => {
        console.log(` - ${ingredient}`)
    })
}

const getRecipe = (ingredients) => {
    const recipeNames = ingredients.reduce((acc, ingredient) => {
        if (!ingredientsToRecipes.hasOwnProperty(ingredient))
            exitWithError(`No recipe for '${ingredient}'`)
        return [...acc, ...ingredientsToRecipes[ingredient]]
    }, [])
    const recipeNamesSet = new Set(recipeNames)
    recipeNamesSet.forEach((recipeName) => {
        describe(recipeName)
    })
}

const listRecipes = () => {
    console.log('Recipes:')
    Object.keys(recipesToIngredients)
        .sort((a, b) => a.localeCompare(b))
        .forEach((recipe) => {
            console.log(` - ${recipe}`)
        })
}

const removeRecipe = (name) => {
    if (!recipesToIngredients.hasOwnProperty(name))
        exitWithError('Recipe does not exist')
    recipes = recipes.filter((recipe) => recipe.name !== name)
    writeRecipes()
    console.log(`Removed '${name}' from recipes.`)
}

const writeRecipes = () => {
    return fs.writeFile(RECIPE_FILE, JSON.stringify(recipes), (err) => {
        if (err) exitWithError(err)
    })
}

const exitWithError = (err) => {
    console.error(err)
    process.exit(1)
}
