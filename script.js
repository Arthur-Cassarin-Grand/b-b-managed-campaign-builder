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
* Version: 1.2
* CHANGELOG
* 1.2 - 15/12/2021 - Check if keywords was created + exclude managed keywords from other campaign's ad groups
* 1.1 - 06/12/2021 - Exclude keywords in old campaigns
* 1.0.1 - 04/12/2021 - Code cleaning for public release
* 1.0 - 03/12/2021 - Initial working release
**/

/*
    SETTINGS 
*/

// WARNING : Your campaigns must exist before launching the script
spreadsheetUrl = "YOUR_SPREADSHEET_URL"; // MODIFY THIS

excludeManagedKeywordsInOrigialCampaigns = true; // If true, it will add your new keywords as negative keywords in old campaigns (in 5th column)
// /!\ If you add large keywords for discover campaigns, let the old campaign row empty not to add this exclude keyword in your old campaign
excludeManagedKeywordsInOtherAdGroups = true; // If true, it will add your new keywords as negative keywords in the other ad groups of the same campaign.

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

// Check if keyword+matching exists in the given Ad Group
function isKeywordInAdGroup(Campaign, AdGroup, Keyword, Match) {
    var keywordIterator = AdsApp.keywords()
        .withCondition('CampaignName = "' + Campaign + '"')
        .withCondition('AdGroupName = "' + matchEntity(AdGroup, Match) + '"')
        .get();
    var found = false;
    while (keywordIterator.hasNext()) {
        var keyword = keywordIterator.next();
        if (keyword.getText() == matchEntity(Keyword, Match)) {
            found = true;
        }
    }
    return found;
}

// Add negative keyword in other campaign's ad groups (except BuildedAdGroup)
function excludeKeywordsInOtherAdGroups(Campaign, MatchedBuildedAdGroup, Keyword, KeyWordMatch) {
    var adGroupIterator = AdsApp.adGroups()
        .withCondition('CampaignName = "' + Campaign + '"')
        .get();
    while (adGroupIterator.hasNext()) {
        adGroup = adGroupIterator.next();
        if (adGroup.getName() != MatchedBuildedAdGroup) {
            adGroup.createNegativeKeyword(matchEntity(Keyword, KeyWordMatch));
        }
    }
}

function main() {
    var spreadsheet = SpreadsheetApp.openByUrl(spreadsheetUrl);
    var data = spreadsheet.getDataRange().getValues();
    var firstRow = false;
    var nRow = 1;
    data.forEach(function (row) {
        // Ignore header line
        if (ignoreFirstLine) {
            if (firstRow == false) {
                nRow++;
                firstRow = true;
                return;
            }
        }
        // Add control column
        var sheet = spreadsheet.setActiveSheet(spreadsheet.getSheets()[0]);
        sheet.getRange("F1").setValue("Result");
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
        // Check if keyword has been created
        if (isKeywordInAdGroup(Campaign, AdGroup, Keyword, Match)) {
            // Add negative keyword to previous campaign
            if (OldCampaign != "") {
                if (excludeManagedKeywordsInOrigialCampaigns) {
                    excludeKeywordInCampaign(OldCampaign, Keyword, Match);
                }
            }
            // Add negative keyword in other campaign's ad groups
            if (excludeManagedKeywordsInOtherAdGroups) {
                excludeKeywordsInOtherAdGroups(Campaign, matchEntity(AdGroup, Match), Keyword, Match);
            }
            sheet.getRange("F"+nRow).setValue("OK");
        } else {
            sheet.getRange("F"+nRow).setValue("Not created");
        }
        
        nRow++;
    });
}

