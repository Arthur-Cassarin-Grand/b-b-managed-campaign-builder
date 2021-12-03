# Google Ads Managed Campaigns Builder

Créer les groupes d'annonces et mots-clés dans vos campagnes managed en important les données depuis une fiche Google Sheet.

## Tableau d'exemple

'''
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
'''

**RESULTAT**

Le groupe d'annonce aura le nom du mot-clé entouré par son keyword match ([nom] pour exact, "nom" pour phrase, nom pour large)

CAMPAGNE               GROUPE D'ANNONCES               MOT CLE
-------------------------------------------------------------------
Campagne Jambon ------ [Jambon cru]              ----- [Jambon cru]
                |----- Jambon cru sans nitrite   ----- Jambon cru sans nitrite
                |----- "Jambon cru fermier"      ----- "Jambon cru fermier"

Campagne Poulet ------ [Poulet fermier] ----- [Poulet fermier]

## Comment le faire fonctionner

**Les campagnes dans lesquelles vous voulez ajouter des groupes d'annonces et des mots-clés doivent déjà exister sur votre compte.**
Créez un script dans le compte Google Ads souhaité, accorder les accès (il faut le faire deux fois, la première fois ça plante toujours...).
**Modifiez l'URL (YOUR_SPREADSHEET_URL) de la feuille SpreadSheet à la ligne 109 du fichier.**
Faites "Exécuter" (et non pas Aperçu) et "Exécuter sans aperçu".
