/**
* AUTHOR : Arthur CASSARIN-GRAND
* E-mail : arthur.cassarin@gmail.com
*
* BULK CAMPAIGN BUILDER
*
* This script creates campaigns, group ads and keywords according to a Gsheet table.
*
* Version: 1.0
*
**/

/* ####################################################################################### */
/* --------------------------------------------------------------------------------------- */
/* POUR FAIRE FONCTIONNER LE SCRIPT, INDIQUER SIMPLEMENT L'ADRESSE DU FICHIER GSHEET LIGNE */
/* ATTENTION : Les campagnes où vous souhaitez créer les groupes/mots-clés doivent exister */
/* --------------------------------------------------------------------------------------- */
/* ####################################################################################### */

/* TABLEAU A FOURNIR */

/*
------------------------------------------------------------------------------
CAMPAGNE        | GROUPE D'ANNONCE        | MOT CLE                 | MATCHING
------------------------------------------------------------------------------
Campagne Jambon | Jambon cru              | jambon cru              | Exact
------------------------------------------------------------------------------
Campagne Jambon | Jambon cru sans nitrite | jambon cru sans nitrite | Large
------------------------------------------------------------------------------
Campagne Jambon | Jambon cru fermier      | jambon cru fermier      | Phrase
------------------------------------------------------------------------------
Campagne Poulet | Poulet fermier          | poulet fermier          | Exact
------------------------------------------------------------------------------
*/

/* RESULTAT */

/*

Le groupe d'annonce aura le nom du mot-clé entouré par son keyword match ([nom] pour exact, "nom" pour phrase, nom pour large)

CAMPAGNE               GROUPE D'ANNONCES               MOT CLE
-------------------------------------------------------------------
Campagne Jambon ------ [Jambon cru]              ----- [Jambon cru]
                |----- Jambon cru sans nitrite   ----- Jambon cru sans nitrite
                |----- "Jambon cru fermier"      ----- "Jambon cru fermier"

Campagne Poulet ------ [Poulet fermier] ----- [Poulet fermier]

*/

/* ------------------------------ */
/* FUNCTIONS THAT CREATE ENTITIES */
/* ------------------------------ */

function matchEntity(Entity, Match) {
    if (Match == "Exact") {
        return "[" + Entity + "]";
    } else if (Match == "Phrase") {
        return '"' + Entity + '"';
    } else {
        return Entity;
    }
}

function addKeyword(Campaign, AdGroup, Keyword, Match) {
    var adGroupIterator = AdsApp.adGroups()
        .withCondition("Name = '" + matchEntity(AdGroup, Match) + "'")
        .withCondition('CampaignName = "' + Campaign + '"')
        .get();
    if (adGroupIterator.hasNext()) {
        var adGroup = adGroupIterator.next();

        adGroup.newKeywordBuilder()
            .withText(matchEntity(Keyword, Match))
            .build();

        // Logger.log("Keyword " + matchEntity(Keyword, Match) + " created in " + matchEntity(AdGroup, Match) + " ad group in campaign " + Campaign);
    }
}

function addAdGroup(Campaign, AdGroup, Match) {
    var campaignIterator = AdsApp.campaigns()
        .withCondition("Name = '" + Campaign + "'")
        .get();
    if (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        var adGroupIterator = AdsApp.adGroups()
            .withCondition("Name = '" + matchEntity(AdGroup, Match) + "'")
            .get();
        if (adGroupIterator.hasNext()) {
            // Skip creation because group ad already exists
        }
        else {
            var adGroupOperation = campaign.newAdGroupBuilder()
            .withName(matchEntity(AdGroup, Match))
            .build();
            // Logger.log("Ad group " + matchEntity(AdGroup, Match) + " created in campaign " + Campaign);
        }
    }
}

function main() {
    /* -------------------------------------------- */
    /* /!\ A MODIFIER AVANT LANCEMENT DU SCRIPT /!\ */
    /* -------------------------------------------- */

    // Check the spreadsheet has been entered, and that it works
    var spreadsheetUrl = "YOUR_SPREADSHEET_URL";
    var pauseCreatedCampaignsByDefault = true; // Si true, mets en pause les campagnes crées par le script (sécurité)
    // Variables à modifier si besoin
    var ignoreFirstLine = true; // Ignore la ligne d'entête par défaut

    var spreadsheet = SpreadsheetApp.openByUrl(spreadsheetUrl);
    var data = spreadsheet.getDataRange().getValues();
    var firstRow = false;
    // Logger.log("[SCRIPT STARTED]");
    data.forEach(function (row) {
        // Ignore header line
        if (ignoreFirstLine) {
            if (firstRow == false) {
                firstRow = true;
                // Logger.log("Ignore first header line");
                return;
            }
        }
        //var rowValues = row.getValues();
        var Campaign = row[0];
        var AdGroup = row[1];
        var Keyword = row[2];
        var Match = row[3];
        // Create ad group
        addAdGroup(Campaign, AdGroup, Match);
        // Create keyword if needed
        addKeyword(Campaign, AdGroup, Keyword, Match);
    });
    // Logger.log("[SCRIPT ENDED]");
    // Logger.log("Job done !");
}

