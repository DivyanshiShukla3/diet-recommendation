document.getElementById('dietForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent default form submission

    // Gather form data
    const name = document.getElementById('name').value;
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const activityLevel = document.getElementById('activity-level').value;
    const goal = document.getElementById('goal').value;
    const dietType = document.getElementById('diet').value;

    // Perform calculations 
    const bmr = calculateBmr(weight, height, age, gender);
    const tdee = calculateTdee(bmr, activityLevel);
    const caloricNeeds = calculateCaloricNeeds(tdee, goal);
    const proteinNeeds = calculateProteinNeeds(weight, goal);
    const fatNeeds = calculateFatNeeds(caloricNeeds);

    // Displaying the needs in console
    console.log("BMR: ", bmr);
    console.log("TDEE: ", tdee);
    console.log("Daily Calorie Needs: ", caloricNeeds);
    console.log("Daily Protein Needs: ", proteinNeeds);
    console.log("Daily Fat Needs: ", fatNeeds);

    // Divide the daily needs by 3 to get per-meal requirements
    const mealCaloricNeeds = [caloricNeeds[0] / 3, caloricNeeds[1] / 3];
    const mealProteinNeeds = [proteinNeeds[0] / 3, proteinNeeds[1] / 3];
    const mealFatNeeds = [fatNeeds[0] / 3, fatNeeds[1] / 3];

    // Log per-meal needs
    console.log("Per Meal Caloric Needs: ", mealCaloricNeeds);
    console.log("Per Meal Protein Needs: ", mealProteinNeeds);
    console.log("Per Meal Fat Needs: ", mealFatNeeds);

     // Fetch recipes and select 3 random ones
    const recipes = await getRecipes(mealCaloricNeeds, mealProteinNeeds, mealFatNeeds, dietType);

    if (recipes && recipes.length > 0) {
        // Store the randomly selected recipes in localStorage
        localStorage.setItem('recipes', JSON.stringify(selectRandomRecipes(recipes, 3)));
        
        // Redirect to result.html after storing the recipes
        window.location.href = 'result.html';
    } else {
        console.error('No recipes found.');
    }
});
// Real-time validation for name input
const nameInput = document.getElementById('name');
nameInput.addEventListener('input', function () {
    if (!nameInput.value.trim()) {
        nameInput.setCustomValidity('Please enter your name');
    } else {
        nameInput.setCustomValidity('');
    }
});

// Age validation to ensure it's above 0
const ageInput = document.getElementById('age');
ageInput.addEventListener('input', function () {
    if (ageInput.value <= 0) {
        ageInput.setCustomValidity('Age must be above 0');
    } else {
        ageInput.setCustomValidity('');
    }
});

// Height and weight validation for valid numeric values
const heightInput = document.getElementById('height');
const weightInput = document.getElementById('weight');

[heightInput, weightInput].forEach(input => {
    input.addEventListener('input', function () {
        if (isNaN(input.value) || input.value <= 0) {
            input.setCustomValidity('Please enter a valid number');
        } else {
            input.setCustomValidity('');
        }
    });
});

// Functions to handle the calculations
function calculateBmr(weight, height, age, gender) {
    if (gender === 'male') {
        return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        return 10 * weight + 6.25 * height - 5 * age - 161;
    }
}

function calculateTdee(bmr, activityLevel) {
    const activityFactors = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725
    };
    return bmr * activityFactors[activityLevel];
}

function calculateCaloricNeeds(tdee, goal) {
    if (goal === 'lose') {
        return [tdee * 0.85, tdee * 0.95];
    } else if (goal === 'gain') {
        return [tdee * 1.05, tdee * 1.15];
    }
    return [tdee, tdee];
}

function calculateProteinNeeds(weight, goal) {
    if (goal === 'gain') {
        return [weight * 1.6, weight * 2.2];
    } else if (goal === 'lose') {
        return [weight * 1.4, weight * 1.8];
    }
    return [weight * 1.0, weight * 1.2];
}

function calculateFatNeeds(caloricNeeds) {
    return [(caloricNeeds[0] * 0.2) / 9, (caloricNeeds[1] * 0.35) / 9];
}

// Fetch the recipes based on calculated needs
async function getRecipes(calories, protein, fat, dietType) {
    const API_KEY = 'da36ebd8c45149fcb34c721c9a276e2a';
    //const API_KEY = '1b52ab32a6a04ebf9d0e68e8c46b004a'; 
    const url = `https://api.spoonacular.com/recipes/complexSearch`;
    const params = new URLSearchParams({
        apiKey: API_KEY,
        maxCalories: calories[1],
        maxProtein: protein[1],
        maxFat: fat[1],
        diet: dietType,
        number: 30, // Fetch more recipes
        cuisine: 'Indian',
        addRecipeInformation: true,
        maxReadyTime: 100
    });

    const response = await fetch(`${url}?${params}`);
    if (response.ok) {
        const data = await response.json();
        console.log(data);

        // Remove duplicate recipes by filtering unique titles
        const uniqueRecipes = Array.from(new Set(data.results.map(r => r.title)))
            .map(title => data.results.find(r => r.title === title));

        return uniqueRecipes;
    } else {
        console.error('Failed to fetch recipes:', response.statusText);
        return null;
    }
}

// Function to select random recipes from the fetched result
function selectRandomRecipes(recipes, numberOfRecipes) {
    const selectedRecipes = [];
    const recipeIndices = new Set();

    while (selectedRecipes.length < numberOfRecipes && recipes.length > selectedRecipes.length) {
        const randomIndex = Math.floor(Math.random() * recipes.length);
        
        // Ensure we don't select the same recipe multiple times
        if (!recipeIndices.has(randomIndex)) {
            recipeIndices.add(randomIndex);
            selectedRecipes.push(recipes[randomIndex]);
        }
    }
    return selectedRecipes;
}
