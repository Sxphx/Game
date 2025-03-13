function checkForValidMoves() {
    if (water <= 0 && energy <= 0 && food <= 0) {
        return false;
    }

    const canInvestWater = money >= 20 * (1 - checkAutomation());
    const canBuildEnergy = money >= 25 * (1 - checkAutomation()) && water >= 15;
    const canHarvestFood = water >= 20 && energy >= 15;
    const canExpandCity = money >= 50 * (1 - checkAutomation());

    if (water <= 0 || energy <= 0 || food <= 0) {
        return false;
    }

    if (!canInvestWater && !canBuildEnergy && !canHarvestFood && !canExpandCity) {
        if (water < 10 && energy < 10 && food < 10 && money < 20) {
            return false;
        }
    }

    return true;
}


function checkResourceShortages() {
    let criticalShortages = 0;

    if (water <= 0) {
        water = 0;
        happiness -= 10;
        criticalShortages++;
        showAlert("warning", "Water Shortage", "Your city is experiencing a water shortage! Happiness is decreasing rapidly.");
    }

    if (energy <= 0) {
        energy = 0;
        happiness -= 8;
        criticalShortages++;
        showAlert("warning", "Energy Shortage", "Your city is experiencing power outages! Happiness is decreasing.");
    }

    if (food <= 0) {
        food = 0;
        happiness -= 15;
        population = Math.max(0, population - 5);
        criticalShortages++;
        showAlert("warning", "Food Shortage", "Your city is experiencing a food shortage! Population is decreasing and happiness is plummeting.");
    }

    if (criticalShortages >= 3 || happiness <= 0 || population <= 0) {
        gameOver();
        return false;
    }

    return true;
}


function makeDecision(decision) {
    console.log(`Making decision: ${decision}`);
    if (!checkForValidMoves()) {
        showAlert("error", "No Valid Moves", "You have no valid moves left and insufficient resources to recover!");
        gameOver();
        return;
    }
    switch (decision) {
        case 'investWater':
            const waterCost = 20 * (1 - checkAutomation());
            if (money < waterCost) {
                showAlert("error", "Not enough money", `You need ${Math.ceil(waterCost)} money to invest in water infrastructure.`);
                return;
            }
            water += 25 * (1 + checkWater());
            money -= waterCost;
            showAlert("success", "Water Infrastructure Improved", "Water supply has increased.");
            break;

        case 'buildEnergy':
            const energyCost = 25 * (1 - checkAutomation());
            if (water < 15 || money < energyCost) {
                showAlert("error", "Insufficient resources", `You need 15 water and ${Math.ceil(energyCost)} money to build a power plant.`);
                return;
            }
            energy += 30 * (1 + checkSolar());
            water -= 15;
            money -= energyCost;
            showAlert("success", "Power Plant Built", "Energy production has increased.");
            break;

        case 'harvestFood':
            if (water < 20 || energy < 15) {
                showAlert("error", "Insufficient resources", "You need 20 water and 15 energy to harvest food.");
                return;
            }
            water -= 20;
            energy -= 15;
            food += 35 * (1 + checkFarm());
            showAlert("success", "Food Harvested", "Food production has increased.");
            break;

        case 'expandCity':
            const expansionCost = 50 * (1 - checkAutomation());
            if (money < expansionCost) {
                showAlert("error", "Not enough money", `You need ${Math.ceil(expansionCost)} money to expand the city.`);
                return;
            }
            population += 15;
            happiness += 15 * (1 + checkTransport());
            money -= expansionCost;
            showAlert("success", "City Expansion", "Population and happiness have increased.");
            break;
    }

    const baseConsumption = 5;
    const populationFactor = 1 + (population / 100);

    energy -= baseConsumption + (5 * populationFactor);
    food -= baseConsumption * populationFactor;
    water -= baseConsumption * populationFactor;
    happiness -= 2;

    checkResourceShortages();

    if (!checkForValidMoves()) {
        showAlert("error", "No Valid Moves", "You have no valid moves left and insufficient resources to recover!");
        gameOver();
        return;
    }

    researchPointsEarn();
    generateIncome();

    if (Math.random() < 0.05) {
        triggerRandomEvent();
    }

    turn++;
    updateStats();
}

function checkResourceShortages() {
    if (water <= 0) {
        water = 0;
        happiness -= 10;
        showAlert("warning", "Water Shortage", "Your city is experiencing a water shortage! Happiness is decreasing rapidly.");
    }

    if (energy <= 0) {
        energy = 0;
        happiness -= 8;
        showAlert("warning", "Energy Shortage", "Your city is experiencing power outages! Happiness is decreasing.");
    }

    if (food <= 0) {
        food = 0;
        happiness -= 15;
        population = Math.max(0, population - 5);
        showAlert("warning", "Food Shortage", "Your city is experiencing a food shortage! Population is decreasing and happiness is plummeting.");
    }

    if (happiness <= 0 || population <= 0) {
        gameOver();
    }
}

function generateIncome() {
    const baseIncome = 5;
    const populationFactor = population / 50;
    const happinessFactor = happiness / 50;

    money += baseIncome * populationFactor * happinessFactor;
}



function checkWater() {
    const waterTech = researchList.find(r => r.id === "waterPurification");
    return waterTech && waterTech.owned ? 0.20 : 0;
}

function checkSolar() {
    const solarTech = researchList.find(r => r.id === "solarPanels");
    return solarTech && solarTech.owned ? 0.15 : 0;
}

function checkFarm() {
    const farmTech = researchList.find(r => r.id === "Farm");
    return farmTech && farmTech.owned ? 0.20 : 0;
}

function checkTransport() {
    const transportTech = researchList.find(r => r.id === "publicTransport");
    return transportTech && transportTech.owned ? 0.25 : 0;
}

function checkAutomation() {
    const autoTech = researchList.find(r => r.id === "automation");
    return autoTech && autoTech.owned ? 0.15 : 0;
}
