# Google Ads Managed Campaigns Builder

Créer les groupes d'annonces et mots-clés dans vos campagnes managed en important les données depuis une fiche Google Sheet.

## Tableau d'exemple

```
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
Campagne Poulet | Découverte              | poulet curry            | Large
------------------------------------------------------------------------------
Campagne Poulet | Découverte              | poulet thaï             | Large
------------------------------------------------------------------------------
Campagne Poulet | Découverte              | poulet kasher           | Large
------------------------------------------------------------------------------
```

## RESULTAT

Le groupe d'annonce aura le nom du mot-clé entouré par son keyword match ([nom] pour exact, "nom" pour phrase, nom pour large)

```
CAMPAGNE               GROUPE D'ANNONCES               MOT CLE
-------------------------------------------------------------------
Campagne Jambon ------ [Jambon cru]              ----- [Jambon cru]
                |----- Jambon cru sans nitrite   ----- Jambon cru sans nitrite
                |----- "Jambon cru fermier"      ----- "Jambon cru fermier"

Campagne Poulet ------ [Poulet fermier] ----- [Poulet fermier]
                |----- Découverte       ----- poulet curry
                                        ----- poulet thaï
                                        ----- poulet kasher
```

## Comment le faire fonctionner

**Les campagnes dans lesquelles vous voulez ajouter des groupes d'annonces et des mots-clés doivent déjà exister sur votre compte.**

Créez un script dans le compte Google Ads souhaité, accordez les accès (il faut le faire deux fois, la première fois ça plante toujours...). Copiez le contenu du script.

**Modifiez l'URL (YOUR_SPREADSHEET_URL) de la feuille SpreadSheet à la ligne 109 du script.**

Faites ensuite "Exécuter" (et non pas Aperçu, car ça ne fera aucune modif sur le compte) et "Exécuter sans aperçu".

Astuce : gardez toujours la même spreadsheet pour ce client et modifiez les données, cela vous évitera de modifier le script.

Limite : Google Ads ne fait tourner un script que 30 minutes au maximum. Le script est rapide, donc vous ne devriez pas avoir de problèmes avant 100.000 occurences environ...donc vous êtes larges. Mais si vous êtes sur un énorme compte, il faudra le faire en plusieurs fois.
