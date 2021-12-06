/**
* AUTHOR : Arthur CASSARIN-GRAND
* E-mail : arthur.cassarin@gmail.com
* LICENSE : GNU Lesser General Public License v3.0
* USAGE : You can use, copy and modify this script for both personal and commercial purposes under the same license.
* You still MUST to write original author's name in the code.
*
* BULK CAMPAIGN BUILDER
* This script creates campaigns, group ads and keywords according to a Gsheet table.
*
* Version: 1.1
* CHANGELOG
* 1.1 - 06/12/2021 - Exclude keywords in old campaigns
* 1.0.1 - 04/12/2021 - Code cleaning for public release
* 1.0 - 03/12/2021 - Initial working release
**/

/*
    SETTINGS
*/

// WARNING : Your campaigns must exist before launching the script
spreadsheetUrl = "YOUR_SPREADSHEET_URL"; // MODIFY THIS

excludeManagedKeywordsInOrigialCampaigns = true; // If true, the script will add your new keywords as negative keywords in old campaigns (in 5th column)
// /!\ If you add large keywords for discover campaigns, let the old campaign row empty not to add this exclude keyword in your old campaign

ignoreFirstLine = true; // Ignore first header row of Gsheet sheet (by default)

/*
    END SETTINGS
*/

// Return a name of entity (keyword, ad group) between symboles according to Google Ads match type for keywords
// Result : [name] for exact, "name" for phrase, name for large
function matchEntity(Entity, Match) {
    if (Match == "Exact") {
        return "[" + Entity + "]";
    } else if (Match == "Phrase") {
        return '"' + Entity + '"';
    } else {
        return Entity;
    }
}

// Create a keyword. Don't override existing keywords (throw an error in this case : "Keyword already exists")
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
    }
}

// Create an ad group. Don't override existing ad group (throw an error in this case : "Ad group already exists")
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
        }
    }
}

// Add keyword (with matching) as negative in oldCampaign
function excludeKeywordInCampaign(oldCampaign, Keyword, Match) {
    var campaignIterator = AdsApp.campaigns()
        .withCondition('Name = "' + oldCampaign + '"')
        .get();
    if (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        campaign.createNegativeKeyword(matchEntity(Keyword, Match));
    }
}

function main() {
    var spreadsheet = SpreadsheetApp.openByUrl(spreadsheetUrl);
    var data = spreadsheet.getDataRange().getValues();
    var firstRow = false;
    data.forEach(function (row) {
        // Ignore header line
        if (ignoreFirstLine) {
            if (firstRow == false) {
                firstRow = true;
                return;
            }
        }
        // Read first 4 columns of the sheet
        var Campaign = row[0];
        var AdGroup = row[1];
        var Keyword = row[2];
        var Match = row[3];
        var OldCampaign = row[4];
        // Create ad group if needed
        addAdGroup(Campaign, AdGroup, Match);
        // Create keyword if needed
        addKeyword(Campaign, AdGroup, Keyword, Match);
        // Add negative keyword to previous campaign
        if (OldCampaign != "") {
            if (excludeManagedKeywordsInOrigialCampaigns) {
                excludeKeywordInCampaign(OldCampaign, Keyword, Match);
            }
        }
    });
}
