
# SR10-Plateforme_recrutement

## Présentation

Ce projet est développé pour l'UV SR10 par Thomas Leymonerie et Nicolas Parmentier.
Il s'agit d’une application web de recrutement.

## Structure du projet
Le projet est organisé de la manière suivante :

* BDD : Ce répertoire contient les fichiers SQL pour la création des tables de la base de données ainsi que l'initialisation des données.
  * create_table_cmd.sql
  * init_data.sql
* Node : Ce répertoire contient le code source de l'application Node.js.

  * myapp : Ce sous-répertoire contient les fichiers spécifiques à l'application.
    * app.js : Fichier principal de l'application.
    * bin : Répertoire pour les scripts de démarrage.
    * model : Répertoire pour les modèles de données.
    * node_modules : Répertoire pour les dépendances externes.
    * package.json : Fichier de configuration pour les dépendances.
    * package-lock.json : Fichier généré pour verrouiller les versions des dépendances.
    * public : Répertoire pour les ressources publiques (CSS, images, etc.).
    * routes : Répertoire pour les routes de l'application.
    * test : Répertoire pour les tests unitaires.
    * views : Répertoire pour les vues de l'application.

  *  vue-project : Ce sous-répertoire contient le code source de l'application Vue.js.
     * node_modules : Répertoire pour les dépendances externes.
     * public : Répertoire pour les ressources publiques (CSS, images, etc.).
     * src : Répertoire pour les sources de l'application.
       * assets : Répertoire pour les ressources statiques.
       * components : Répertoire pour les composants de l'application.
       * router : Répertoire pour les routes de l'application.
       * views : Répertoire pour les vues de l'application.
       * App.vue : Fichier principal de l'application Vue côté front.
       * main.js : Fichier principal de l'application côté backend.
     * vue.config.js : Fichier de configuration pour Vue CLI.

* package-lock.json : Fichier généré pour verrouiller les versions exactes des dépendances utilisées.

* README.md : Le fichier que vous êtes en train de lire, contenant des informations sur la structure du projet et les différents documents.

* TD1_Conception : Ce répertoire contient les documents de conception du projet (TD1).
  * Cas_Utilisations.pdf : Document décrivant les cas d'utilisation.
  * Classe_UML.pdf : Diagramme de classe UML.
  * MLD.md : Description du modèle logique de données.
  * WireFrame : Ce sous-répertoire contient les wireframes de l'interface utilisateur.
    * WireFrame Admin.png
    * WireFrame Candidat.png
    * WireFrame Inscription.png
    * WireFrame Login.png
    * WireFrame Recruteur.png

## Sécurité

Voir le document security.md

## Piste d'amélioration

Certaines fonctions n'ont pas pu être implémentées comme le filtrage et la recherche des offres pour le candidat.
