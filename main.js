Events.on(ClientLoadEvent, () => {
    // -------------------------------------------------------------
    // 1. GLOBAL PRODUCTION SPEEDUP (20x)
    // 2. UNIT BUILD SPEEDUP (5x overall & 10x for T1 Unit Factories)
    // 3. CORE UNIT CAPACITY (2x Core Unit Cap)
    // -------------------------------------------------------------
    Vars.content.blocks().each(b => {
        // 20x Faster Production for Smelters/Crafters
        if ("craftTime" in b && b.craftTime > 0) {
            b.craftTime /= 20;
        }

        // 5x Faster Construction for Reconstructors / Assemblers
        if ("constructTime" in b && b.constructTime > 0) {
            b.constructTime /= 5;
        }

        // 10x Speed for T1 Unit Factories
        if ("plans" in b && b.plans != null && b.plans.size > 0) {
            b.plans.each(plan => {
                if ("buildTime" in plan && plan.buildTime > 0) {
                    plan.buildTime /= 10;
                }
            });
        }

        // 2x Unit Cap from Cores
        if ("unitCapModifier" in b && b.unitCapModifier > 0) {
            b.unitCapModifier *= 2;
        }
    });

    // -------------------------------------------------------------
    // 4. AUTO COMPLETE BUTTON IN PAUSE MENU
    // -------------------------------------------------------------
    Vars.ui.paused.shown(() => {
        let dialog = Vars.ui.paused;
        
        if (!dialog.find("auto-complete-container")) {
            let container = dialog.cont;
            
            if (container != null) {
                container.row();
                let customTable = container.table().name("auto-complete-container").get();
                
                customTable.button("Auto Complete Sector", () => {
                    try {
                        Vars.state.rules.winWave = Vars.state.wave;
                        Vars.ui.showInfoToast("Win wave set to current wave!", 3);
                        dialog.hide();
                    } catch(err) {
                        Log.err("Auto-complete error: " + err);
                    }
                }).size(260, 55).padTop(12);
            }
        }
    });

    // -------------------------------------------------------------
    // 5. UNIT STATS EDITOR HUD BUTTON (NO FRAG FEATURES)
    // -------------------------------------------------------------
    Vars.ui.hudGroup.fill(null, cons(table => {
        table.top().left();
        table.button("Edit Unit Stats", () => {
            showUnitEditorDialog();
        }).size(150, 45).pad(10);
    }));
});

function showUnitEditorDialog() {
    let dialog = new BaseDialog("Unit Stats Editor");
    dialog.addCloseButton();
    let cont = dialog.cont;

    let playerUnit = Vars.player.unit();
    if (playerUnit == null || playerUnit.type == null) {
        cont.add("No active unit control detected! Control a unit first.").row();
        dialog.show();
        return;
    }

    let type = playerUnit.type;

    cont.add("[accent]Editing Unit:[white] " + type.localizedName).row();

    // Base Stats
    cont.add("Movement Speed").row();
    let speedSlider = cont.slider(0.5, 20, 0.5, type.speed, null).get();
    cont.row();

    cont.add("Max Health").row();
    let healthField = cont.field(type.health.toString(), null).get();
    cont.row();

    cont.add("Build Speed").row();
    let buildSlider = cont.slider(1, 50, 1, type.buildSpeed, null).get();
    cont.row();

    // Weapon Configuration
    if (type.weapons != null && type.weapons.size > 0) {
        let weapon = type.weapons.first();
        let bullet = weapon.bullet;

        cont.add("--- [accent]Weapon Stats[white] ---").row();
        cont.add("Reload Time (Ticks)").row();
        let reloadField = cont.field(weapon.reload.toString(), null).get();
        cont.row();

        cont.add("--- [accent]Bullet Stats[white] ---").row();
        cont.add("Bullet Damage").row();
        let damageField = cont.field(bullet.damage.toString(), null).get();
        cont.row();

        cont.button("Apply Changes", () => {
            try {
                type.speed = speedSlider.getValue();
                type.buildSpeed = buildSlider.getValue();

                let newHealth = parseFloat(healthField.getText());
                if (!isNaN(newHealth) && newHealth > 0) {
                    type.health = newHealth;
                    playerUnit.health = newHealth;
                }

                let newReload = parseFloat(reloadField.getText());
                if (!isNaN(newReload) && newReload > 0) weapon.reload = newReload;

                let newDamage = parseFloat(damageField.getText());
                if (!isNaN(newDamage)) bullet.damage = newDamage;

                Vars.ui.showInfoToast("Unit Stats Updated!", 2);
                dialog.hide();
            } catch(err) {
                Log.err("Error applying stats: " + err);
            }
        }).size(220, 50).padTop(15);
    } else {
        cont.button("Apply Changes", () => {
            type.speed = speedSlider.getValue();
            type.buildSpeed = buildSlider.getValue();

            let newHealth = parseFloat(healthField.getText());
            if (!isNaN(newHealth) && newHealth > 0) {
                type.health = newHealth;
                playerUnit.health = newHealth;
            }

            Vars.ui.showInfoToast("Unit Stats Updated!", 2);
            dialog.hide();
        }).size(220, 50).padTop(15);
    }

    dialog.show();
}
