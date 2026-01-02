🚀 Features

    Aktuelle Wetterdaten: Temperatur, Feuchtigkeit, Windgeschwindigkeit, Windrichtung (inkl. Textausgabe wie "Nordwest"), Bewölkung und Wettercodes.

    7-Tage-Vorhersage: Tägliche Min/Max-Temperaturen, Regenmenge, Regenwahrscheinlichkeit und Sonnenzeiten.

    Pollen-Vorhersage (7 Tage): Detaillierte Prognose für Birke, Gräser, Erle, Beifuß und Ambrosia.

    Luftqualität: Aktueller europäischer Luftqualitätsindex (AQI) und Feinstaubwerte (PM10, PM2.5).

    Log-Optimiert: Automatische Konvertierung von null-Werten in 0 und korrektes Setzen des ack-Flags zur Vermeidung von Log-Warnungen.

    Automatisierung: Das Script legt die gesamte Ordnerstruktur unter 0_userdata.0 selbstständig an. Abrufintervall 15 Minuten

🛠 Installation & Benutzung
1. Voraussetzungen

    Installierter JavaScript-Adapter in ioBroker.

    Die Instanz benötigt Zugriff auf das Internet.

    Das NPM-Modul axios muss im JavaScript-Adapter eingetragen sein (in den Instanz-Einstellungen unter "Zusätzliche NPM-Module").

2. Script einrichten

    Erstelle ein neues Script im Bereich "Common" oder "User" im ioBroker JavaScript-Editor.

    Kopiere den vollständigen Code in das neue Script.

    Wichtig: Passe die Koordinaten (latitude und longitude) am Anfang des Scripts an deinen Wohnort an.
    JavaScript

    const latitude  = 51.4668; // Dein Breitengrad
    const longitude = 12.5350; // Dein Längengrad

    Speichere und starte das Script.

3. Datenstruktur

Nach dem ersten Start findest du deine Daten unter: 0_userdata.0.open-meteo-api

    ...Aktuell: Echtzeit-Wetterdaten.

    ...Wetter_Täglich: Vorhersage-Ordner Tag_0 (Heute) bis Tag_6.

    ...Luft_Qualität: Aktuelle Pollenwerte und Feinstaub.

    ...Luft_Pollen_Täglich: Pollenvorhersage für die nächsten 7 Tage.

📊 Technische Details

    Intervall: Das Script wird standardmäßig alle 15 Minuten ausgeführt (Minute 2, 17, 32, 47).

    Einheiten: Alle Werte werden mit den passenden Einheiten (°C, km/h, %, mm, etc.) angelegt.

    Sonnenzeiten: Zeitstempel für Sonnenauf- und untergang werden automatisch in das lesbare Format HH:mm umgewandelt.

⚠️ Hinweis bei Updates

Solltest du das Script aktualisieren und Fehlermeldungen im Log erhalten (z.B. "Read-Only state"), lösche bitte einmalig den kompletten Ordner 0_userdata.0.open-meteo-api. Das Script baut die Struktur beim nächsten Durchlauf mit den korrekten Berechtigungen neu auf.