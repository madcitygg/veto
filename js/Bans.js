// STORAGE FOR CHOSEN PREFS
// STORAGE FOR CHOSEN PREFS
// STORAGE FOR CHOSEN PREFS
var Storage = {
    NAME_KEY:  'madcity-veto-name',
    MAPS_KEY: 'madcity-veto-mappool',

    storeName: function (name) {
        localStorage.setItem(this.MAPS_KEY, ko.toJSON(name));
    },

    recallName: function () {
        return JSON.parse(localStorage.getItem(this.NAME_KEY));
    },

    storeMaps: function (maps) {
        localStorage.setItem(this.MAPS_KEY, ko.toJSON(maps));
    },

    recallMaps: function () {
        return JSON.parse(localStorage.getItem(MAPS_KEY));
    }
}


// MODEL FOR BANS
// MODEL FOR BANS
// MODEL FOR BANS
var BansModel = function () {
    var isBo3Mode = ko.observable(false);
    var bo3StepModel = function (id, isPick, isBan) {
        return {
            id: id,
            isPickStep: isPick,
            isBanStep: isBan
        }
    };

    var bo3Steps = [
        bo3StepModel(0, true, false),
        bo3StepModel(1, true, false),
        bo3StepModel(2, false, true),
        bo3StepModel(3, false, true),
        bo3StepModel(4, false, true),
        bo3StepModel(5, false, true),
        bo3StepModel(6, false, true)
    ];

    var currentBo3Step = ko.observable(bo3Steps[0]);

    var map = function (ident, displayName, active) {
        return {
            id: ident,
            name: displayName,
            active: ko.observable(active),
            isBanned: ko.observable(false),
            isPicked: ko.observable(false),
            bannedByTeamOne: ko.observable(false)
        }
    };

    var maps = ko.observableArray([
        map('cache', 'de_cache', true),
        map('cbble', 'de_cbble', true),
        map('dust2', 'de_dust2', true),
        map('inferno', 'de_inferno', true),
        map('mirage', 'de_mirage', true),
        map('nuke', 'de_nuke', false),
        map('overpass', 'de_overpass', true),
        map('season', 'de_season', false),
        map('train', 'de_train', true)
    ]);

    return {
        isBo3Mode: isBo3Mode,
        bo3Steps: bo3Steps,
        currentBo3Step: currentBo3Step,
        maps: maps
    };
};

var TheBansModel = BansModel();



// VIEW MODEL FOR BANS
// VIEW MODEL FOR BANS
// VIEW MODEL FOR BANS
var BansViewModel = function () {
    var maps = TheBansModel.maps;

    var isBo3Mode = TheBansModel.isBo3Mode;
    var bo3Steps = TheBansModel.bo3Steps;
    var currentBo3Step = TheBansModel.currentBo3Step;

    var pickedMap = ko.observable('');
    var isTeamOnesTurn = ko.observable(true);
    var bansTeamOne = ko.observableArray([]);
    var bansTeamTwo = ko.observableArray([]);


    // recall and fill in saved name
    var customTitle = 'Mad City';
    var recalledTitle = Storage.recallName();
    if (recalledTitle) {
        customTitle = ko.observable(recalledTitle);
    }

    var findMapById = function (id) {
        var i = maps().length;
        while (i--) {
            if (maps()[i].id === id) {
                return maps()[i];
            }
        }
    }

    var markLastPickedMap = function () {
        var i = j = maps().length;
        var unbannedMapIds = [];
        var lastMap = null;

        while (i--) {
            if (maps()[i].isBanned() === false && maps()[i].active()) {
                unbannedMapIds.push(maps()[i].id);
            }
        }

        if (isBo3Mode() && unbannedMapIds.length === 3) {
            // picking for Bo3
            var k = unbannedMapIds.length;
            while (k--) {
                if (findMapById(unbannedMapIds[k]).isPicked() === false) {
                    lastMap = findMapById(unbannedMapIds[k]);
                }
            }

            lastMap.isPicked(true);

        } else if (isBo3Mode() === false && unbannedMapIds.length === 1) {
            // picking for non-Bo3
            lastMap = findMapById(unbannedMapIds[0]);
            lastMap.isPicked(true);
        } else if (isBo3Mode() === false) {
            // was a regular ban, clear any picks
            while (j--) {
                maps()[j].isPicked(false);
            }
        }
    };

    var toggleBan = function (mapData) {
        if (isBo3Mode()) {
            // BANS and PICKS for Bo3

            var currentStepIndex = bo3Steps.indexOf(currentBo3Step());

            if (currentBo3Step().isPickStep && isTeamOnesTurn()) {
                mapData.isPicked(true);
                isTeamOnesTurn(false);
                bansTeamOne.push(mapData);
            } else if (currentBo3Step().isBanStep && isTeamOnesTurn()) {
                mapData.isBanned(true);
                isTeamOnesTurn(false);
                bansTeamOne.push(mapData);
            } else if (currentBo3Step().isPickStep && isTeamOnesTurn() === false) {
                mapData.isPicked(true);
                isTeamOnesTurn(true);
                bansTeamTwo.push(mapData);
            } else if (currentBo3Step().isBanStep && isTeamOnesTurn() === false) {
                mapData.isBanned(true);
                isTeamOnesTurn(true);
                bansTeamTwo.push(mapData);
            }

            currentBo3Step(bo3Steps[currentStepIndex + 1])

        } else {
            // REGULAR BANS for Bo1
            if (mapData.isBanned() && isTeamOnesTurn()) {

                // was UNBANNED and team 1's turn
                bansTeamOne.remove(mapData);
                bansTeamTwo.remove(mapData);
                mapData.isBanned(false);
                isTeamOnesTurn(false);


            } else if (mapData.isBanned() && isTeamOnesTurn() === false) {

                // was UNBANNED and team 2's turn
                bansTeamOne.remove(mapData);
                bansTeamTwo.remove(mapData);
                mapData.isBanned(false);
                isTeamOnesTurn(true);

            } else if (mapData.isBanned() === false && isTeamOnesTurn()) {

                // was BANNED and team 1's turn
                mapData.isBanned(true);
                bansTeamOne.push(mapData);
                isTeamOnesTurn(false);

            } else {

                // was BANNED and team 2's turn
                mapData.isBanned(true);
                bansTeamTwo.push(mapData)
                isTeamOnesTurn(true);
            }
        }

        // mark the map that was picked
        markLastPickedMap();

        maps.subscribe(function (u, wot) {
            console.log('u', u);
            console.log('wot', wot);
        });
    };

    return {
        maps: maps,
        toggleBan: toggleBan,
        pickedMap: pickedMap,
        isTeamOnesTurn: isTeamOnesTurn,
        bansTeamOne: bansTeamOne,
        bansTeamTwo: bansTeamTwo,
        customTitle: customTitle,
        bo3Steps: bo3Steps,
        isBo3Mode: TheBansModel.isBo3Mode
    };
};


$(document).ready(function() {
    ko.applyBindings(BansViewModel);
});