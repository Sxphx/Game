function triggerRandomEvent() {
    const events = [
        {
            name: "Drought",
            description: "A drought has hit your region!",
            effect: () => {
                water -= 30;
                showAlert("warning", "Drought", "A drought has hit your region! Water supplies have decreased.");
            }
        },
        {
            name: "Power Surge",
            description: "A power surge has damaged some infrastructure!",
            effect: () => {
                energy -= 25;
                showAlert("warning", "Power Surge", "A power surge has damaged some infrastructure! Energy supplies have decreased.");
            }
        },
        {
            name: "Bountiful Harvest",
            description: "Favorable conditions have led to a bountiful harvest!",
            effect: () => {
                food += 40;
                showAlert("success", "Bountiful Harvest", "Favorable conditions have led to a bountiful harvest! Food supplies have increased.");
            }
        },
        {
            name: "Economic Boom",
            description: "Your city is experiencing an economic boom!",
            effect: () => {
                money += 50;
                happiness += 10;
                showAlert("success", "Economic Boom", "Your city is experiencing an economic boom! Money and happiness have increased.");
            }
        },
        {
            name: "Innovation",
            description: "Your researchers have made a breakthrough!",
            effect: () => {
                researchPoint += 20;
                showAlert("success", "Innovation", "Your researchers have made a breakthrough! Research points have increased.");
            }
        }
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    event.effect();
}
