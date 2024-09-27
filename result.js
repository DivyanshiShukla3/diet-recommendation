document.addEventListener('DOMContentLoaded', () => {
    // Retrieve the recipes from localStorage
    const recipes = JSON.parse(localStorage.getItem('recipes'));
    const recipesContainer = document.getElementById('recipesContainer');

    if (recipes && recipes.length > 0) {
        // Display the recipes
        recipes.forEach((recipe, index) => {
            // Extract nutrient details
            let nutrientDetails = '';
            recipe.nutrition.nutrients.forEach(nutrient => {
                nutrientDetails += `${nutrient.name}: ${nutrient.amount.toFixed(2)} ${nutrient.unit}, `;
            });
            
            // Remove the last comma and space
            nutrientDetails = nutrientDetails.slice(0, -2);

            // Create the recipe card
            recipesContainer.innerHTML += `
                <div class="recipe-card">
                    <h3>${recipe.title}</h3>
                    <img src="${recipe.image}" alt="${recipe.title}" width="300">
                    <p><a href="${recipe.sourceUrl}" target="_blank">View Recipe</a></p>
                    <p>Cooking Time: ${recipe.readyInMinutes} minutes</p>
                    <p>Nutrients: ${nutrientDetails}</p> 
                </div>`;
        });
    } else {
        recipesContainer.innerHTML = '<p>No recipes found. Please try different criteria.</p>';
    }

    // Add event listener to the "Go Back to Form" button
    document.getElementById('goBackBtn').addEventListener('click', () => {
        window.location.href = 'form.html'; 
    });
});
