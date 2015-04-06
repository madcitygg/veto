// MODEL FOR BANS
// MODEL FOR BANS
// MODEL FOR BANS
var BansModel = function () {
    var map = function (ident, displayName) {
        return {
            id: ident,
            name: displayName,
            isBanned: ko.observable(false),
            isPicked: ko.observable(false),
            bannedByTeamOne: ko.observable(false)
        }
    };

    var maps = ko.observableArray([
        map('nuke', 'Nuke'),
        map('overpass', 'Overpass'),
        map('mirage', 'Mirage'),
        map('cache', 'Cache'),
        map('dust2', 'Dust 2'),
        map('season', 'Season'),
        map('inferno', 'Inferno')
    ]);

    return {
        maps: maps
    }
};

var TheBansModel = BansModel();



// VIEW MODEL FOR BANS
// VIEW MODEL FOR BANS
// VIEW MODEL FOR BANS
var BansViewModel = function () {
    var maps = TheBansModel.maps;

    var pickedMap = ko.observable('');
    var isTeamOnesTurn = ko.observable(true);
    var bansTeamOne = ko.observableArray([]);
    var bansTeamTwo = ko.observableArray([]);

    var findMapById = function (id) {
        var i = maps().length;
        while (i--) {
            if (maps()[i].id === id) {
                console.log('found map of', maps()[i]);
                return maps()[i];
            }
        }
    }

    var markPickedMap = function () {
        var i = j = maps().length;
        var unbannedMapIds = [];
        var lastMap = null;

        while (i--) {
            if (maps()[i].isBanned() === false) {
                unbannedMapIds.push(maps()[i].id);
            }
        }

        if (unbannedMapIds.length === 1) {

            // was the last ban, which picks the map
            lastMap = findMapById(unbannedMapIds[0]);
            lastMap.isPicked(true);

        } else {

            // was a regular ban, clear any picks
            while (j--) {
                console.log('j', j);
                maps()[j].isPicked(false);
            }
        }
    };

    var toggleBan = function (mapData) {

        if (mapData.isBanned() === true && isTeamOnesTurn() === true) {

            // was UNBANNED and team 1's turn
            bansTeamOne.remove(mapData);
            bansTeamTwo.remove(mapData);
            mapData.isBanned(false);
            isTeamOnesTurn(false);


        } else if (mapData.isBanned() === true && isTeamOnesTurn() === false) {

            // was UNBANNED and team 2's turn
            bansTeamOne.remove(mapData);
            bansTeamTwo.remove(mapData);
            mapData.isBanned(false);
            isTeamOnesTurn(true);

        } else if (mapData.isBanned() === false && isTeamOnesTurn() === true) {

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

        markPickedMap();
    };

    return {
        maps: maps,
        toggleBan: toggleBan,
        pickedMap: pickedMap,
        isTeamOnesTurn: isTeamOnesTurn,
        bansTeamOne: bansTeamOne,
        bansTeamTwo: bansTeamTwo
    };
};


$(document).ready(function() {
    ko.applyBindings(BansViewModel);
});