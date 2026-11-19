
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";


import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
   setPersistence,
browserLocalPersistence,
updateProfile
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";


// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBdo2BodCpgxqqvEvE1DaNI4pbUHFZPi3I",
    authDomain: "recipe-box-efd55.firebaseapp.com",
    projectId: "recipe-box-efd55",
    storageBucket: "recipe-box-efd55.firebasestorage.app",
    messagingSenderId: "186612299956",
    appId: "1:186612299956:web:2d7ecc0b5641a4bc3b3fe1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// Preload all recipe images before showing the homepage
async function preloadRecipeImages(recipeList) {
    const imageUrls = [
        ...new Set(
            recipeList
                .map(recipe => recipe.image)
                .filter(url => url && url.trim() !== "")
        )
    ];

    console.log("Preloading recipe images:", imageUrls.length);

    await Promise.all(
        imageUrls.map(url => {
            return new Promise(resolve => {
                const img = new Image();

                img.onload = async () => {
                    try {
                        await img.decode();
                    } catch (error) {
                        // Image already loaded
                    }
                    resolve();
                };

                img.onerror = () => {
                    console.warn("Image failed to load:", url);
                    resolve();
                };

                img.src = url;

                if (img.complete) {
                    resolve();
                }
            });
        })
    );

    console.log("All recipe images are ready!");
}



// Load recipes from Firestore
async function loadUserRecipes(user) {
    try {
        const recipesQuery = query(
            collection(db, "recipes"),
            where("userId", "==", user.uid)
        );

        const snapshot = await getDocs(recipesQuery);

        const firestoreRecipes = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
        }));

        recipes = [
            ...defaultRecipes.map(recipe => ({
                ...recipe,
                isDefault: true
            })),
            ...firestoreRecipes.map(recipe => ({
                ...recipe,
                isDefault: false
            }))
        ];

        // Wait for all images to preload
        await preloadRecipeImages(recipes);

        saveData();

        console.log("Recipes and images loaded successfully!");

    } catch (error) {
        console.error("Error loading recipes:", error);
        alert("Unable to load recipes from Firebase.");
    }
}

// Load user's favorites from Firestore
async function loadUserFavorites(user) {
    if (!user || auth.currentUser?.uid !== user.uid) {
        return;
    }

    try {
        const favoriteRef = doc(db, "favorites", user.uid);
        const favoriteSnap = await getDoc(favoriteRef);

        // Check if the same account is still logged in
        if (auth.currentUser?.uid !== user.uid) {
            return;
        }

        if (favoriteSnap.exists()) {
            favorites = favoriteSnap.data().recipeIds || [];
        } else {
            favorites = [];
        }

               console.log("Favorites loaded successfully!");
    } catch (error) {
        if (auth.currentUser?.uid !== user.uid) {
            return;
        }

        console.error("Error loading favorites:", error);
        alert("Unable to load favorites.");
    }
}

// Save user's favorites to Firestore
async function saveUserFavorites(user = auth.currentUser) {
    if (!user || auth.currentUser?.uid !== user.uid) {
        return;
    }

    const favoriteIds = [...favorites];

    try {
        await setDoc(doc(db, "favorites", user.uid), {
            userId: user.uid,
            recipeIds: favoriteIds
        });

        console.log("Favorites saved successfully!");

    } catch (error) {
        // Ignore errors caused by logout or account switching
        if (auth.currentUser?.uid !== user.uid) {
            return;
        }

        console.error("Error saving favorites:", error);
        alert("Unable to save favorites.");
    }
}


// Firebase Authentication
const auth = getAuth(app);

// Require login again whenever the app is reopened or refreshed
await setPersistence(auth, browserLocalPersistence);

let isRegisterMode = false;

const authPage = document.getElementById("authPage");
const authForm = document.getElementById("authForm");
const authButton = document.getElementById("authButton");
const authSwitch = document.getElementById("authSwitch");
const authSwitchText = document.getElementById("authSwitchText");
const authSubtitle = document.getElementById("authSubtitle");
const authMessage = document.getElementById("authMessage");
const authFullName = document.getElementById("authFullName");
const authPassword = document.getElementById("authPassword");
const authConfirmPassword = document.getElementById("authConfirmPassword");
const confirmPasswordWrapper = document.getElementById("confirmPasswordWrapper");



// Show / Hide Password
document.querySelectorAll(".toggle-password").forEach(button => {

    const eyeOpen = `
        <svg viewBox="0 0 24 24">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>`;

    const eyeClosed = `
        <svg viewBox="0 0 24 24">
            <path d="M3 3l18 18"/>
            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/>
            <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a15 15 0 0 1-3.2 3.9"/>
            <path d="M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1 0 2-.2 2.9-.5"/>
        </svg>`;

    // Display the normal eye icon initially
    button.innerHTML = eyeOpen;

    button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.target);

        if (!input) return;

        const isPassword = input.type === "password";

        input.type = isPassword ? "text" : "password";

        button.innerHTML = isPassword ? eyeClosed : eyeOpen;

        button.setAttribute(
            "aria-label",
            isPassword ? "Hide password" : "Show password"
        );
    });
});

const logoutBtn = document.getElementById("logoutBtn");

// Logout Function
logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);

        console.log("User logged out successfully!");

    } catch (error) {
        console.error("Logout error:", error);
    }
});

// Profile Dropdown
const profileButton = document.getElementById("profileButton");
const profileDropdown = document.getElementById("profileDropdown");

profileButton.addEventListener("click", () => {
    profileDropdown.hidden = !profileDropdown.hidden;
});

// Close dropdown when clicking outside
document.addEventListener("click", (event) => {
    if (
        !profileButton.contains(event.target) &&
        !profileDropdown.contains(event.target)
    ) {
        profileDropdown.hidden = true;
    }
});


// DITO MO ILALAGAY ANG BAGONG CODE
authSwitch.addEventListener("click", () => {
    isRegisterMode = !isRegisterMode;

    authButton.textContent = isRegisterMode ? "Register" : "Login";
    authSwitch.textContent = isRegisterMode ? "Login" : "Register";

    authSubtitle.textContent = isRegisterMode
        ? "Create your Recipe Box account."
        : "Please login.";

    authSwitchText.textContent = isRegisterMode
        ? "Already have an account?"
        : "Don't have an account?";

    authFullName.hidden = !isRegisterMode;
confirmPasswordWrapper.hidden = !isRegisterMode;
authConfirmPassword.hidden = !isRegisterMode;

    // Make fields required only during registration
    authFullName.required = isRegisterMode;
    authConfirmPassword.required = isRegisterMode;

    // Change password autocomplete
    authPassword.autocomplete = isRegisterMode
        ? "new-password"
        : "current-password";

    authMessage.textContent = "";
    authForm.reset();
});



// Login and Register Function
authForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullName = authFullName.value.trim();
    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;
    const confirmPassword = authConfirmPassword.value;

    if (isRegisterMode && password !== confirmPassword) {
        authMessage.textContent = "Passwords do not match!";
        return;
    }

    if (isRegisterMode && !fullName) {
        authMessage.textContent = "Please enter your full name.";
        return;
    }

    authButton.disabled = true;
    authMessage.textContent = "Please wait...";

    try {
        if (isRegisterMode) {

            // Create new account
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            // Save full name
            await updateProfile(userCredential.user, {
                displayName: fullName
            });

            // Save email and password temporarily
            const registeredEmail = email;
            const registeredPassword = password;

            // Log out automatically after registration
            await signOut(auth);

            // Return to Login page
            authSwitch.click();

            // Automatically fill in Login fields
            document.getElementById("authEmail").value = registeredEmail;
            document.getElementById("authPassword").value = registeredPassword;

            authMessage.textContent =
                "Registration successful! Please click Login.";

       } else {

    // Login existing account
    await signInWithEmailAndPassword(
        auth,
        email,
        password
    );

}

    } catch (error) {

        if (error.code === "auth/invalid-credential") {
            authMessage.textContent =
                "Invalid email or password. Please register first.";

        } else if (error.code === "auth/email-already-in-use") {
            authMessage.textContent =
                "This email is already registered. Please login instead.";

        } else if (error.code === "auth/weak-password") {
            authMessage.textContent =
                "Password must be at least 6 characters.";

        } else {
            authMessage.textContent = error.message;
        }

    } finally {
        authButton.disabled = false;
    }
});


// Check if user is logged in
onAuthStateChanged(auth, async (user) => {

    // Prevent automatic homepage access during registration
    if (isRegisterMode) {
        return;
    }

    if (user) {
        const fullName = user.displayName || user.email.split("@")[0];
        const firstName = fullName.trim().split(" ")[0];

        document.getElementById("profileName").textContent = fullName;
        document.getElementById("profileEmail").textContent = user.email;
        document.getElementById("userName").textContent = firstName;

        console.log("User is logged in:", user.email);

        // Keep the login page visible while loading recipes and images
        authPage.style.display = "flex";

       

        try {
            await Promise.all([
                loadUserRecipes(user),
                loadUserFavorites(user)
            ]);

          // Display all recipe cards
displayRecipes();

// Wait until all visible homepage images are decoded
await waitForDisplayedRecipeImages();

// Show homepage only when everything is ready
authPage.style.display = "none";

        } catch (error) {
            console.error("Error preparing homepage:", error);

            if (authMessage) {
                authMessage.textContent = "Unable to load recipes. Please try again.";
            }
        }

    } else {
        // Clear login and registration fields
authForm.reset();

authEmail.value = "";
authPassword.value = "";
authConfirmPassword.value = "";
authFullName.value = "";

authMessage.textContent = "";
        authPage.style.display = "flex";

        document.getElementById("profileDropdown").hidden = true;
        document.getElementById("profileName").textContent = "User";
        document.getElementById("profileEmail").textContent = "";
        document.getElementById("userName").textContent = "User";

        recipes = [...defaultRecipes];
        favorites = [];

        showingFavorites = false;
        showingMyRecipes = false;
        selectedCategory = "All";

        searchInput.value = "";
        recipeHeading.textContent = "Popular Recipes";

        document.querySelector(".category.active")?.classList.remove("active");
        document.querySelector('[data-category="All"]')?.classList.add("active");

        saveData();
        displayRecipes();
    }

});


console.log("Firebase connected successfully!");
const defaultRecipes = [
    {
        id: 1,
        name: "Pancakes",
        category: "Breakfast",
        time: "20 minutes",
        image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93",
        ingredients: "1 cup flour\n1 tablespoon sugar\n1 teaspoon baking powder\n1 egg\n3/4 cup milk\n2 tablespoons melted butter",
        instructions: "Prepare all the ingredients.\nPlace the flour in a large mixing bowl.\nAdd the sugar and baking powder.\nMix the dry ingredients until combined.\nIn another bowl, crack the egg.\nAdd the milk and melted butter.\nWhisk the wet ingredients together.\nPour the wet mixture into the dry ingredients.\nMix gently until combined. Do not overmix.\nHeat a non-stick pan over medium-low heat.\nPour about 1/4 cup of batter into the pan.\nCook until bubbles appear on the surface.\nFlip the pancake carefully.\nCook the other side until golden brown.\nRepeat until all the batter is used.\nServe warm with your favorite toppings."
    },
    {
        id: 2,
        name: "Chicken Salad",
        category: "Lunch",
        time: "25 minutes",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
        ingredients: "2 cups cooked chicken\n2 cups lettuce\n1 cucumber\n1 tomato\n1/4 cup mayonnaise\n1 tablespoon lemon juice\nSalt and pepper",
        instructions: "Prepare all the ingredients.\nWash the lettuce under clean running water.\nDrain the lettuce and cut it into smaller pieces.\nWash the cucumber and tomato.\nSlice the cucumber into thin pieces.\nCut the tomato into small wedges.\nPlace the vegetables in a large bowl.\nShred or slice the cooked chicken into bite-sized pieces.\nAdd the chicken to the bowl.\nIn a small bowl, combine mayonnaise and lemon juice.\nAdd a little salt and pepper to the dressing.\nMix the dressing until smooth.\nPour the dressing over the chicken and vegetables.\nToss everything gently until evenly coated.\nTaste and adjust the seasoning if needed.\nServe immediately or chill before serving."
    },
    {
        id: 3,
        name: "Spaghetti",
        category: "Dinner",
        time: "40 minutes",
        image: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0",
        ingredients: "250g spaghetti\n250g ground meat\n1 onion\n3 cloves garlic\n2 cups tomato sauce\n1 tablespoon cooking oil\nSalt and pepper\nGrated cheese",
        instructions: "Prepare all the ingredients.\nFill a large pot with water.\nBring the water to a boil.\nAdd a little salt to the boiling water.\nPlace the spaghetti into the pot.\nCook according to the package instructions.\nStir occasionally to prevent the pasta from sticking.\nDrain the spaghetti and set it aside.\nChop the onion and garlic into small pieces.\nHeat cooking oil in a pan.\nSaute the onion until soft.\nAdd the garlic and cook until fragrant.\nAdd the ground meat and break it into small pieces.\nCook until the meat is no longer pink.\nPour the tomato sauce into the pan.\nStir and simmer the sauce for 10 to 15 minutes.\nAdd salt and pepper to taste.\nPlace the cooked spaghetti on a serving plate.\nPour the sauce over the spaghetti.\nTop with grated cheese and serve."
    },
    {
        id: 4,
        name: "Chocolate Cake",
        category: "Dessert",
        time: "50 minutes",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
        ingredients: "1 1/2 cups flour\n1 cup sugar\n1/2 cup cocoa powder\n1 teaspoon baking powder\n2 eggs\n1 cup milk\n1/2 cup oil",
        instructions: "Prepare all the ingredients.\nPreheat the oven to 180 degrees Celsius.\nGrease a round cake pan with a little oil.\nPlace the flour in a large mixing bowl.\nAdd the sugar and cocoa powder.\nAdd the baking powder.\nMix all the dry ingredients together.\nIn another bowl, crack the eggs.\nAdd the milk and oil.\nWhisk the wet ingredients until combined.\nPour the wet mixture into the dry ingredients.\nMix until the batter becomes smooth.\nPour the batter into the prepared cake pan.\nTap the pan gently to remove large air bubbles.\nPlace the pan inside the preheated oven.\nBake for about 30 to 35 minutes.\nInsert a toothpick into the center to check if it is done.\nRemove the cake from the oven and let it cool.\nTransfer the cake to a serving plate and decorate as desired."
    },
    {
        id: 5,
        name: "Avocado Toast",
        category: "Breakfast",
        time: "10 minutes",
        image: "https://images.unsplash.com/photo-1525351484163-7529414344d8",
        ingredients: "2 slices bread\n1 ripe avocado\n1 teaspoon lemon juice\nSalt and pepper\n1 egg (optional)",
        instructions: "Prepare all the ingredients.\nPlace the bread slices in a toaster.\nToast the bread until golden brown and crispy.\nCut the avocado in half lengthwise.\nRemove the avocado seed carefully.\nScoop the avocado flesh into a small bowl.\nMash the avocado using a fork.\nAdd the lemon juice to the mashed avocado.\nSeason with salt and pepper.\nMix until the ingredients are well combined.\nSpread the avocado mixture evenly over the toasted bread.\nCook an egg separately if you want an extra topping.\nPlace the egg on top of the avocado toast.\nServe immediately while the bread is still crispy."
    },
    {
        id: 6,
        name: "Grilled Chicken",
        category: "Dinner",
        time: "35 minutes",
        image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435",
        ingredients: "2 chicken breasts\n2 tablespoons soy sauce\n1 tablespoon lemon juice\n2 cloves garlic\n1 tablespoon cooking oil\nSalt and pepper",
        instructions: "Prepare all the ingredients.\nWash and pat the chicken dry with paper towels.\nPlace the chicken in a clean bowl.\nMince the garlic into small pieces.\nAdd the soy sauce to the chicken.\nPour in the lemon juice and cooking oil.\nAdd the minced garlic, salt, and pepper.\nMix until the chicken is evenly coated.\nCover the bowl and marinate for at least 15 minutes.\nPreheat a grill pan over medium heat.\nLightly grease the grill pan with cooking oil.\nPlace the chicken on the hot pan.\nCook one side for about 6 to 8 minutes.\nFlip the chicken carefully using tongs.\nCook the other side until fully done.\nCheck that the thickest part reaches 74 degrees Celsius.\nRemove the chicken from the pan.\nLet it rest for a few minutes before slicing.\nServe with rice or your favorite side dish."
    },
        {
        id: 7,
        name: "Beef Kare-Kare",
        category: "Lunch",
        time: "1 hour",
        image: "https://snapcalorie-webflow-website.s3.us-east-2.amazonaws.com/media/food_pics_v2/medium/beef_kare-kare.jpg",
        ingredients: "Beef, peanut butter, eggplant, banana heart, string beans, bok choy, shrimp paste, onion, garlic, and water.",
        instructions: "Boil the beef until tender.\nPrepare and wash all the vegetables.\nSaute garlic and onion in a pot.\nAdd the cooked beef.\nAdd water and peanut butter.\nStir until the sauce becomes thick.\nAdd the eggplant, banana heart, and string beans.\nCook until the vegetables are tender.\nAdd the bok choy and cook for a few minutes.\nServe hot with shrimp paste."
    },
    {
        id: 8,
        name: "Bicol Express",
        category: "Lunch",
        time: "45 minutes",
        image: "https://snapcalorie-webflow-website.s3.us-east-2.amazonaws.com/media/food_pics_v2/medium/bicol_express.jpg",
        ingredients: "Pork, coconut milk, coconut cream, shrimp paste, chili peppers, garlic, onion, and ginger.",
        instructions: "Cut the pork into small pieces.\nChop the garlic, onion, ginger, and chili peppers.\nSaute garlic, onion, and ginger in a pan.\nAdd the pork and cook until lightly brown.\nAdd the shrimp paste and mix well.\nPour in the coconut milk.\nSimmer until the pork becomes tender.\nAdd the chili peppers.\nPour in the coconut cream.\nCook until the sauce becomes thick.\nServe with steamed rice."
    },
    {
        id: 9,
        name: "Beef Caldereta",
        category: "Dinner",
        time: "1 hour",
       image: "https://www.billyparisi.com/wp-content/uploads/2025/11/kaldereta-2.jpg",
        ingredients: "Beef, tomato sauce, potatoes, carrots, bell peppers, liver spread, garlic, onion, and water.",
        instructions: "Cut the beef into serving pieces.\nPeel and cut the potatoes and carrots.\nChop the garlic and onion.\nSaute garlic and onion in a pot.\nAdd the beef and cook until brown.\nPour in the tomato sauce and water.\nCover and simmer until the beef becomes tender.\nAdd the potatoes and carrots.\nAdd the liver spread and stir well.\nAdd the bell peppers.\nSimmer until the vegetables are cooked.\nServe hot with rice."
    },
    {
        id: 10,
        name: "Lechon Kawali",
        category: "Lunch",
        time: "1 hour 30 minutes",
        image: "https://foryoueats.b-cdn.net/recipe-images/p0aklVeMgb-976.webp",
        ingredients: "Pork belly, salt, pepper, garlic, bay leaves, water, and cooking oil.",
        instructions: "Wash the pork belly thoroughly.\nPlace the pork in a pot with water.\nAdd salt, pepper, garlic, and bay leaves.\nBoil until the pork becomes tender.\nRemove the pork and let it cool completely.\nPat the pork dry using paper towels.\nCarefully fry the pork in hot oil until golden and crispy.\nRemove from the pan and let the excess oil drain.\nSlice into serving pieces.\nServe with your favorite dipping sauce."
    },
    {
        id: 11,
        name: "Halo-Halo",
        category: "Dessert",
        time: "15 minutes",
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Halo_Halo.jpg",
        ingredients: "Shaved ice, evaporated milk, sweetened banana, sweetened beans, nata de coco, kaong, leche flan, ube jam, and ice cream.",
        instructions: "Prepare a tall serving glass.\nAdd sweetened banana and beans.\nAdd nata de coco and kaong.\nFill the glass with shaved ice.\nPour evaporated milk over the ice.\nAdd ube jam and leche flan on top.\nFinish with a scoop of ice cream.\nServe immediately and mix before eating."
    },
    {
        id: 12,
        name: "Mango Float",
        category: "Dessert",
        time: "30 minutes plus chilling",
       image: "https://commons.wikimedia.org/wiki/Special:FilePath/Mango_float_(Crema_de_Mangga)_-_Philippines.jpg",
        ingredients: "Graham crackers, ripe mangoes, all-purpose cream, and condensed milk.",
        instructions: "Slice the ripe mangoes into thin pieces.\nMix the all-purpose cream and condensed milk in a bowl.\nPrepare a rectangular container.\nArrange a layer of graham crackers at the bottom.\nSpread a layer of cream mixture over the crackers.\nAdd sliced mangoes on top.\nRepeat the layers until the ingredients are used.\nFinish with cream and crushed graham crackers.\nCover the container.\nRefrigerate for at least 6 hours or overnight.\nSlice and serve chilled."
    },
];
let recipes = defaultRecipes.map(recipe => ({
    ...recipe,
    isDefault: true
}));


let favorites = [];
let selectedCategory = "All";
let showingFavorites = false;
let showingMyRecipes = false;
const recipeGrid = document.getElementById("recipeGrid");


 // Wait until the actual homepage images are loaded and decoded
async function waitForDisplayedRecipeImages() {
    const images = Array.from(
        recipeGrid.querySelectorAll(".recipe-image")
    );

    await Promise.all(
        images.map(async (img) => {
            if (!img.complete) {
                await new Promise(resolve => {
                    img.addEventListener("load", resolve, { once: true });
                    img.addEventListener("error", resolve, { once: true });
                });
            }

            if (img.naturalWidth > 0) {
                try {
                    await img.decode();
                } catch (error) {
                    console.warn("Image decoding issue:", img.src);
                }
            }
        })
    );

    console.log("All homepage images are displayed and ready!");
}

const searchInput = document.getElementById("searchInput");
const recipeCount = document.getElementById("recipeCount");
const recipeHeading = document.getElementById("recipeHeading");
const modal = document.getElementById("recipeModal");
const recipeForm = document.getElementById("recipeForm");


// Recipe Details Elements
const recipeDetailsPage = document.getElementById("recipeDetailsPage");
const detailsImage = document.getElementById("detailsImage");
const detailsName = document.getElementById("detailsName");
const detailsCategory = document.getElementById("detailsCategory");
const detailsTime = document.getElementById("detailsTime");
const detailsIngredients = document.getElementById("detailsIngredients");
const detailsInstructions = document.getElementById("detailsInstructions");

const backToRecipes = document.getElementById("backToRecipes");


function saveData() {
    // Recipes and favorites are stored separately per user in Firestore.
    // Do not store account-specific data in shared localStorage.
    localStorage.removeItem("recipeBoxRecipes");
    localStorage.removeItem("recipeBoxFavorites");
}



function showRecipeDetails(recipe) {
    console.log("Opening recipe details:", recipe.name);

    document.querySelector(".welcome").hidden = true;
    document.querySelector(".search-section").hidden = true;
    document.querySelector(".categories").hidden = true;
    document.querySelector(".section-heading").hidden = true;
    recipeGrid.hidden = true;

    recipeDetailsPage.hidden = false;

    console.log("Details page hidden:", recipeDetailsPage.hidden);
console.log("Details page size:", recipeDetailsPage.getBoundingClientRect());
console.log("Details page parent:", recipeDetailsPage.parentElement);

console.log("Is connected:", recipeDetailsPage.isConnected);
console.log("Width:", recipeDetailsPage.offsetWidth);
console.log("Height:", recipeDetailsPage.offsetHeight);
console.log("Display:", getComputedStyle(recipeDetailsPage).display);
console.log("Visibility:", getComputedStyle(recipeDetailsPage).visibility);
console.log("Parent tag:", recipeDetailsPage.parentElement?.tagName);
console.log("Parent class:", recipeDetailsPage.parentElement?.className);

    detailsImage.src = recipe.image || "https://placehold.co/600x400?text=Recipe";
    detailsImage.alt = recipe.name;
    detailsName.textContent = recipe.name;
    detailsCategory.textContent = recipe.category;
    detailsTime.textContent = "⏱ " + recipe.time;
    detailsIngredients.textContent = recipe.ingredients;
   detailsInstructions.innerHTML = "";

const steps = recipe.instructions
    .split("\n")
    .filter(step => step.trim() !== "");

const instructionList = document.createElement("ol");

steps.forEach(step => {
    const listItem = document.createElement("li");
    listItem.textContent = step.trim();
    instructionList.appendChild(listItem);
});

detailsInstructions.appendChild(instructionList);

    window.scrollTo(0, 0);
}

// Back to Recipes
backToRecipes.addEventListener("click", () => {
    recipeDetailsPage.hidden = true;

    document.querySelector(".welcome").hidden = false;
    document.querySelector(".search-section").hidden = false;
    document.querySelector(".categories").hidden = false;
    document.querySelector(".section-heading").hidden = false;
    recipeGrid.hidden = false;

    window.scrollTo(0, 0);
});

// Swipe right to go back from recipe details
let touchStartX = 0;
let touchStartY = 0;

recipeDetailsPage.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
}, { passive: true });

recipeDetailsPage.addEventListener("touchend", (event) => {
    const touchEndX = event.changedTouches[0].screenX;
    const touchEndY = event.changedTouches[0].screenY;

    const swipeDistanceX = touchEndX - touchStartX;
    const swipeDistanceY = Math.abs(touchEndY - touchStartY);

    if (
        !recipeDetailsPage.hidden &&
        swipeDistanceX > 100 &&
        swipeDistanceY < 75
    ) {
        backToRecipes.click();
    }
}, { passive: true });

// Cache recipe cards for faster navigation
const recipeCardCache = new Map();


// Display recipes
function displayRecipes() {
    const searchText = searchInput.value.toLowerCase();
    const currentUser = auth.currentUser;

    const filtered = recipes.filter(recipe => {
        const matchesSearch =
            recipe.name.toLowerCase().includes(searchText);

        const matchesCategory =
            selectedCategory === "All" ||
            recipe.category === selectedCategory;

        const matchesFavorites =
            !showingFavorites || favorites.includes(recipe.id);

        const matchesMyRecipes =
            !showingMyRecipes ||
            (currentUser && recipe.userId === currentUser.uid);

        const matchesHome =
            showingFavorites ||
            showingMyRecipes ||
            recipe.isDefault === true;

        return matchesSearch &&
            matchesCategory &&
            matchesFavorites &&
            matchesMyRecipes &&
            matchesHome;
    });

    recipeCount.textContent = `${filtered.length} recipes`;

    if (filtered.length === 0) {
        recipeGrid.innerHTML = "<p>No recipes found.</p>";
        return;
    }

    const fragment = document.createDocumentFragment();

    filtered.forEach(recipe => {
        let card = recipeCardCache.get(recipe.id);

        // Create card only if it is not yet cached
        if (!card) {
            card = document.createElement("article");
            card.className = "recipe-card";

            const image = recipe.image ||
                "https://placehold.co/600x400?text=Recipe";

            card.innerHTML = `
                <img
                    class="recipe-image"
                    src="${image}"
                    alt="${recipe.name}"
                    loading="eager"
                    decoding="async"
                >

                <div class="recipe-info">
                    <h3></h3>
                    <p></p>

                    <div class="recipe-actions">
                        <div class="main-actions">
                            <button class="view-button">View Recipe</button>
                            <button class="favorite-button">♡</button>
                        </div>

                        <div class="owner-actions">
                            <button class="edit-button">Edit</button>
                            <button class="delete-button">Delete</button>
                        </div>
                    </div>
                </div>
            `;

            // View Recipe
            card.querySelector(".view-button").addEventListener("click", () => {
                showRecipeDetails(recipe);
            });

            // Edit Recipe
            card.querySelector(".edit-button").addEventListener("click", async () => {
                if (!auth.currentUser ||
                    recipe.userId !== auth.currentUser.uid) {
                    alert("You can only edit your own recipes.");
                    return;
                }

                const newName = prompt("Enter recipe name:", recipe.name);
                if (newName === null || newName.trim() === "") return;

                const newCategory = prompt(
                    "Enter category (Breakfast, Lunch, Dinner, Dessert):",
                    recipe.category
                );
                if (newCategory === null) return;

                const newTime = prompt("Enter cooking time:", recipe.time);
                if (newTime === null) return;

                const newImage = prompt("Enter image URL:", recipe.image);
                if (newImage === null) return;

                const newIngredients = prompt(
                    "Enter ingredients:", recipe.ingredients
                );
                if (newIngredients === null) return;

                const newInstructions = prompt(
                    "Enter instructions:", recipe.instructions
                );
                if (newInstructions === null) return;

                const validCategories = [
                    "Breakfast", "Lunch", "Dinner", "Dessert"
                ];

                if (!validCategories.includes(newCategory.trim())) {
                    alert("Please enter a valid category.");
                    return;
                }

                const updatedRecipe = {
                    name: newName.trim(),
                    category: newCategory.trim(),
                    time: newTime.trim(),
                    image: newImage.trim(),
                    ingredients: newIngredients.trim(),
                    instructions: newInstructions.trim()
                };

                try {
                    await updateDoc(
                        doc(db, "recipes", recipe.id),
                        updatedRecipe
                    );

                    Object.assign(recipe, updatedRecipe);

                    // Update cached card image and information
                    const cachedCard = recipeCardCache.get(recipe.id);

                    if (cachedCard) {
                        cachedCard.querySelector(".recipe-image").src =
                            recipe.image ||
                            "https://placehold.co/600x400?text=Recipe";

                        cachedCard.querySelector(".recipe-image").alt =
                            recipe.name;

                        cachedCard.querySelector("h3").textContent =
                            recipe.name;

                        cachedCard.querySelector(".recipe-info p").textContent =
                            `${recipe.category} • ${recipe.time}`;
                    }

                    displayRecipes();

                    alert("Recipe updated successfully!");

                } catch (error) {
                    console.error("Error updating recipe:", error);
                    alert("Unable to update recipe. Please try again.");
                }
            });

            // Delete Recipe
            card.querySelector(".delete-button").addEventListener("click", async () => {
                if (!auth.currentUser ||
                    recipe.userId !== auth.currentUser.uid) {
                    alert("You can only delete your own recipes.");
                    return;
                }

                const confirmDelete = confirm(
                    `Are you sure you want to delete ${recipe.name}?`
                );

                if (!confirmDelete) return;

                try {
                    await deleteDoc(doc(db, "recipes", recipe.id));

                    recipes = recipes.filter(
                        item => item.id !== recipe.id
                    );

                    favorites = favorites.filter(
                        id => id !== recipe.id
                    );

                    recipeCardCache.delete(recipe.id);

                    await saveUserFavorites();
                    displayRecipes();

                    alert("Recipe deleted successfully!");

                } catch (error) {
                    console.error("Error deleting recipe:", error);
                    alert("Unable to delete recipe. Please try again.");
                }
            });

            // Favorite
            card.querySelector(".favorite-button").addEventListener("click", () => {
                toggleFavorite(recipe.id);
            });

            // Save card in cache
            recipeCardCache.set(recipe.id, card);
        }

        // Update card information
        card.querySelector("h3").textContent = recipe.name;

        card.querySelector(".recipe-info p").textContent =
            `${recipe.category} • ${recipe.time}`;

        // Update favorite button
        const favoriteButton = card.querySelector(".favorite-button");
        const isFavorite = favorites.includes(recipe.id);

        favoriteButton.classList.toggle("liked", isFavorite);
        favoriteButton.textContent = isFavorite ? "♥" : "♡";

        // Update owner buttons
        const isOwner =
            currentUser && recipe.userId === currentUser.uid;

        card.querySelector(".edit-button").hidden = !isOwner;
        card.querySelector(".delete-button").hidden = !isOwner;

        fragment.appendChild(card);
    });

    // Replace displayed cards with cached cards
    recipeGrid.replaceChildren(fragment);
}


// Add or remove favorites
async function toggleFavorite(id) {
    const user = auth.currentUser;

    if (!user) {
        return;
    }

    if (favorites.includes(id)) {
        favorites = favorites.filter(item => item !== id);
    } else {
        favorites.push(id);
    }

    saveData();
    displayRecipes();

    await saveUserFavorites(user);
}

// Open Add Recipe form
document.getElementById("addRecipeBtn").addEventListener("click", () => {
    modal.classList.add("show");
});

// Close Add Recipe form
document.getElementById("closeModal").addEventListener("click", () => {
    modal.classList.remove("show");
});


// Save a new recipe to Firebase
recipeForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const user = auth.currentUser;

    if (!user) {
        alert("Please login first!");
        return;
    }

    const newRecipe = {
        name: document.getElementById("recipeName").value.trim(),
        category: document.getElementById("recipeCategory").value,
        time: document.getElementById("recipeTime").value.trim(),
        image: document.getElementById("recipeImage").value.trim(),
        ingredients: document.getElementById("recipeIngredients").value.trim(),
        instructions: document.getElementById("recipeInstructions").value.trim(),
        userId: user.uid
    };

    try {
        // Save recipe to Firestore
        const docRef = await addDoc(
            collection(db, "recipes"),
            newRecipe
        );

        // Add the saved recipe to the current display
        recipes.push({
            id: docRef.id,
            ...newRecipe
        });

        // Also save locally
        saveData();

        recipeForm.reset();
        modal.classList.remove("show");

     selectedCategory = "All";
showingFavorites = false;
showingMyRecipes = true;
searchInput.value = "";

document.querySelector(".category.active")?.classList.remove("active");
document.querySelector('[data-category="All"]').classList.add("active");

recipeHeading.textContent = "My Recipes";

// Highlight My Recipes navigation
document.querySelectorAll(".bottom-nav .nav-item").forEach(item => {
    item.classList.remove("active");
});
document.getElementById("myRecipesNav").classList.add("active");

displayRecipes();

        alert("Recipe saved successfully!");

    } catch (error) {
        console.error("Error saving recipe:", error);
        alert("Unable to save recipe. Please try again.");
    }
});


// Search recipes
searchInput.addEventListener("input", displayRecipes);

// Filter by category
document.querySelectorAll(".category").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelector(".category.active")?.classList.remove("active");
        button.classList.add("active");

        selectedCategory = button.dataset.category;
        showingFavorites = false;
        showingMyRecipes = false;
        recipeHeading.textContent = "Popular Recipes";

        displayRecipes();
    });
});

// Show Favorites
document.getElementById("favoritesNav").addEventListener("click", event => {
    event.preventDefault();

    showingFavorites = true;
    showingMyRecipes = false;
    selectedCategory = "All";
    recipeHeading.textContent = "My Favorites";

    document.querySelector(".category.active")?.classList.remove("active");
    document.querySelector('[data-category="All"]').classList.add("active");

    // Highlight Favorites button
    document.querySelectorAll(".bottom-nav .nav-item").forEach(item => {
        item.classList.remove("active");
    });
    document.getElementById("favoritesNav").classList.add("active");

    displayRecipes();
});

// Show My Recipes
document.getElementById("myRecipesNav").addEventListener("click", event => {
    event.preventDefault();

    showingFavorites = false;
    showingMyRecipes = true;
    selectedCategory = "All";

    recipeHeading.textContent = "My Recipes";

    document.querySelector(".category.active")?.classList.remove("active");
    document.querySelector('[data-category="All"]').classList.add("active");

    searchInput.value = "";

    // Highlight My Recipes button
    document.querySelectorAll(".bottom-nav .nav-item").forEach(item => {
        item.classList.remove("active");
    });
    document.getElementById("myRecipesNav").classList.add("active");

    displayRecipes();
});

// Show Home / Popular Recipes
document.getElementById("homeNav").addEventListener("click", event => {
    event.preventDefault();

    showingFavorites = false;
    showingMyRecipes = false;
    selectedCategory = "All";

    searchInput.value = "";
    recipeHeading.textContent = "Popular Recipes";

    document.querySelector(".category.active")?.classList.remove("active");
    document.querySelector('[data-category="All"]')?.classList.add("active");

    // Return to the main recipes section
    recipeDetailsPage.hidden = true;
    document.querySelector(".welcome").hidden = false;
    document.querySelector(".search-section").hidden = false;
    document.querySelector(".categories").hidden = false;
    document.querySelector(".section-heading").hidden = false;
    recipeGrid.hidden = false;

    // Highlight Home in the bottom navigation
    document.querySelectorAll(".bottom-nav .nav-item").forEach(item => {
        item.classList.remove("active");
    });
    document.getElementById("homeNav").classList.add("active");

    displayRecipes();
});

// Initial display
displayRecipes();


// Register Service Worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js")
            .then((registration) => {
                console.log(
                    "Service Worker registered successfully!",
                    registration
                );
            })
            .catch((error) => {
                console.error(
                    "Service Worker registration failed:",
                    error
                );
            });
    });
}
