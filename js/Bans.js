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
        var i = maps().length;
        var unbannedMapIds = [];
        var lastMap = null;

        while (i--) {
            if (maps()[i].isBanned() === false) {
                unbannedMapIds.push(maps()[i].id);
            }
        }

        // WAS IT THE LAST MAP BAN -- MAP CHOSEN?
        if (unbannedMapIds.length === 1) {
            lastMap = findMapById(unbannedMapIds[0]);
            lastMap.isPicked(true);
        }
    };

    var toggleBan = function (mapData) {
        if (mapData.isBanned() === true) {
            bansTeamOne.remove(mapData);
            bansTeamTwo.remove(mapData);
            mapData.isBanned(false);
        } else if (mapData.isBanned() === false && isTeamOnesTurn() === true) {
            mapData.isBanned(true);
            bansTeamOne.push(mapData);
            isTeamOnesTurn(false);
        } else {
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