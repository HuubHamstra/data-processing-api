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

## Gebruik

Start de API door het volgende commando te gebruiken:

```
npm start
```

Dit zal de API draaien en beschikbaar maken voor verzoeken. Bij vragen of onduidelijkheden, raadpleeg het bijgeleverde PDF-bestand voor meer informatie.