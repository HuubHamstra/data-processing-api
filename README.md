# Data Processing API

Voordat je begint, zorg ervoor dat je Node.js hebt geïnstalleerd op je systeem. Je kunt Node.js downloaden vanaf de officiële [Node.js-website](https://nodejs.org/). Node.js biedt de runtime-omgeving die nodig is om de API te draaien.

## Installatie

### Kloon de repository naar de gewenste locatie

Open de terminal en voer het volgende uit:

```
git clone https://github.com/HuubHamstra/data-processing-api
```

Ga vervolgens naar de gekloonde directory door gebruik te maken van de volgende commando's:

```
cd data-processing-api
cd hbomin
```

### Installeer de Node.js-pakketten

Installeer alle Node.js-pakketten met het volgende commando:

```
npm install
```

### Maak een nieuwe databaseverbinding

Creëer een nieuw bestand genaamd "database.js" in de root van de "hbomin" directory, waarin een connectie met de database wordt gemaakt. Gebruik onderstaande code en vervang de placeholders ('host', 'username', 'password', 'database_name', 'port') met de juiste informatie voor jouw database.

```javascript
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'host',
  user: 'username',
  password: 'password',
  database: 'database_name',
  port: 'port'
});

connection.connect()

module.exports = connection;
```

## DBMS Importeren
Deze sectie beschrijft hoe de SQL-bestanden [Dump_20240308.sql](./Dump_20240308.sql) en [Roles_20240308.sql](./Roles_20240308.sql) moeten worden geïmporteerd om de database te configureren en de gebruikersrollen toe te voegen.

### Database Dump
Het [Dump_20240308.sql](./Dump_20240308.sql) bestand bevat de volledige database structuur. Om het te importeren, volg je deze stappen:

* Open je favoriete DBMS (Database Management System), zoals MySQL, PostgreSQL, of SQLite. Merk op dat alles wat MySQL kan importeren ook kan worden gebruikt.
* Voer het SQL-bestand `Dump_20240308.sql` uit in je DBMS. Dit kan worden gedaan via de command line of via een grafische interface.
* Een nieuwe database genaamd `hbomin` zal gegenereerd worden met alle tabellen, functies en views uit het origineel.

### Rollen
Het SQL-bestand [Roles_20240308.sql](./Roles_20240308.sql) bestand bevat de accounts die worden gebruikt binnen de database. Volg deze stappen om de gebruikersrollen toe te voegen:
* Voer dit uit in hetzelfde DBMS waarin je de databasestructuur hebt geïmporteerd.
* Dit bestand zal de vereiste gebruikersrollen toevoegen, met de bijbehorende rechten en machtigingen.

#### De volgende gebruikers zullen toegevoegd worden:
1. Junior
2. Medior
3. Senior

De machtigingen van deze rollen staan beschreven in het [Grants-denies-api.xlsx](./Grants-denies-api.xlsx) Excel-bestand.

## Gebruik

#### Start de API door het volgende commando te gebruiken:

```
npm start
```

Dit zal de API draaien en beschikbaar maken voor verzoeken. Bij vragen of onduidelijkheden, raadpleeg het bijgeleverde PDF-bestand voor meer informatie.

####  Test de API door het volgende commando te gebruiken:

```
npm test
```

Dit zal een groot aantal tests op de API draaien om de integriteit van de API te testen.