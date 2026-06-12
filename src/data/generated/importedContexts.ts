import type { Person, PlayerContext } from '../../types'

export const importedPeople: Person[] = [
  {
    "personId": "peter_shilton",
    "displayName": "Peter Shilton",
    "fullName": "Peter Shilton",
    "aliases": [],
    "nationality": "England",
    "primaryRoles": [
      "Shot-stopper",
      "Organizer",
      "European champion"
    ],
    "notes": "Nottingham Forest goalkeeper during the club's European Cup-winning peak."
  },
  {
    "personId": "david_seaman",
    "displayName": "David Seaman",
    "fullName": "David Seaman",
    "aliases": [],
    "nationality": "England",
    "primaryRoles": [
      "Shot-stopper",
      "Back-four keeper",
      "Tournament veteran"
    ],
    "notes": "England keeper into the 2002 World Cup cycle, included to give 2000s England national rolls real goalkeeper coverage."
  },
  {
    "personId": "alan_hansen",
    "displayName": "Alan Hansen",
    "fullName": "Alan Hansen",
    "aliases": [],
    "nationality": "Scotland",
    "primaryRoles": [
      "Ball-playing CB",
      "Line leader",
      "Title dynasty"
    ],
    "notes": "Liverpool defensive leader in a dominant English and European period."
  },
  {
    "personId": "sol_campbell",
    "displayName": "Sol Campbell",
    "fullName": "Sol Campbell",
    "aliases": [],
    "nationality": "England",
    "primaryRoles": [
      "Stopper",
      "Recovery pace",
      "Tournament defender"
    ],
    "notes": "England center-back across Euro 2000, World Cup 2002, Euro 2004 and World Cup 2006 squads."
  },
  {
    "personId": "stuart_pearce",
    "displayName": "Stuart Pearce",
    "fullName": "Stuart Pearce",
    "aliases": [],
    "nationality": "England",
    "primaryRoles": [
      "Aggressive fullback",
      "Set pieces",
      "Leader"
    ],
    "notes": "Nottingham Forest and England left-back reference."
  },
  {
    "personId": "denis_irwin",
    "displayName": "Denis Irwin",
    "fullName": "Denis Irwin",
    "aliases": [],
    "nationality": "Ireland",
    "primaryRoles": [
      "Two-footed fullback",
      "Set pieces",
      "Reliable defender"
    ],
    "notes": "Manchester United fullback across domestic and European trophy seasons."
  },
  {
    "personId": "gary_neville",
    "displayName": "Gary Neville",
    "fullName": "Gary Neville",
    "aliases": [],
    "nationality": "England",
    "primaryRoles": [
      "Reliable fullback",
      "Crossing support",
      "Back-four balance"
    ],
    "notes": "England right-back across Euro and World Cup squads in the late 1990s and 2000s."
  },
  {
    "personId": "david_beckham",
    "displayName": "David Beckham",
    "fullName": "David Beckham",
    "aliases": [],
    "nationality": "England",
    "primaryRoles": [
      "Wide creator",
      "Set pieces",
      "Crossing"
    ],
    "notes": "England right-sided creator across Euro and World Cup cycles."
  },
  {
    "personId": "ryan_giggs",
    "displayName": "Ryan Giggs",
    "fullName": "Ryan Giggs",
    "aliases": [],
    "nationality": "Wales",
    "primaryRoles": [
      "Wide creator",
      "Dribbler",
      "Transition runner"
    ],
    "notes": "Manchester United left-sided creator across multiple title eras."
  },
  {
    "personId": "john_barnes",
    "displayName": "John Barnes",
    "fullName": "John Barnes",
    "aliases": [],
    "nationality": "England",
    "primaryRoles": [
      "Dribbler",
      "Wide creator",
      "Carrier"
    ],
    "notes": "Liverpool left-sided attacker and late First Division star."
  },
  {
    "personId": "graeme_souness",
    "displayName": "Graeme Souness",
    "fullName": "Graeme Souness",
    "aliases": [],
    "nationality": "Scotland",
    "primaryRoles": [
      "Ball-winner",
      "Leader",
      "Tempo setter"
    ],
    "notes": "Liverpool midfield leader in domestic and European Cup success."
  },
  {
    "personId": "kenny_dalglish",
    "displayName": "Kenny Dalglish",
    "fullName": "Kenny Dalglish",
    "aliases": [],
    "nationality": "Scotland",
    "primaryRoles": [
      "Link forward",
      "Creator",
      "Big-game scorer"
    ],
    "notes": "Liverpool all-time forward across title and European Cup teams."
  },
  {
    "personId": "alan_shearer",
    "displayName": "Alan Shearer",
    "fullName": "Alan Shearer",
    "aliases": [],
    "nationality": "England",
    "primaryRoles": [
      "Box finisher",
      "Aerial threat",
      "Penalty taker"
    ],
    "notes": "Blackburn title-winning striker and Premier League scoring benchmark."
  },
  {
    "personId": "eric_cantona",
    "displayName": "Eric Cantona",
    "fullName": "Eric Cantona",
    "aliases": [],
    "nationality": "France",
    "primaryRoles": [
      "Second striker",
      "Creator",
      "Aura"
    ],
    "notes": "Manchester United catalyst in the early Premier League title run."
  },
  {
    "personId": "fabien_barthez",
    "displayName": "Fabien Barthez",
    "fullName": "Fabien Barthez",
    "aliases": [],
    "nationality": "France",
    "primaryRoles": [
      "Sweeper keeper",
      "Shot-stopper",
      "European champion"
    ],
    "notes": "Marseille goalkeeper in the 1993 European Cup-winning side."
  },
  {
    "personId": "hugo_lloris",
    "displayName": "Hugo Lloris",
    "fullName": "Hugo Lloris",
    "aliases": [],
    "nationality": "France",
    "primaryRoles": [
      "Shot-stopper",
      "Sweeper keeper",
      "Leader"
    ],
    "notes": "LAFC goalkeeper context from the club's 2020s era."
  },
  {
    "personId": "thiago_silva",
    "displayName": "Thiago Silva",
    "fullName": "Thiago Silva",
    "aliases": [],
    "nationality": "Brazil",
    "primaryRoles": [
      "Cover defender",
      "Ball-playing CB",
      "Line leader"
    ],
    "notes": "PSG defensive leader and modern Ligue 1 benchmark center-back."
  },
  {
    "personId": "marquinhos",
    "displayName": "Marquinhos",
    "fullName": "Marquinhos",
    "aliases": [],
    "nationality": "Brazil",
    "primaryRoles": [
      "Versatile defender",
      "Recovery pace",
      "Build-up"
    ],
    "notes": "PSG defender covering center-back, right-back, and midfield needs."
  },
  {
    "personId": "lilian_thuram",
    "displayName": "Lilian Thuram",
    "fullName": "Lilian Thuram",
    "aliases": [],
    "nationality": "France",
    "primaryRoles": [
      "Lockdown defender",
      "Recovery pace",
      "Tournament leader"
    ],
    "notes": "France right-back and center-back across Euro-winning and World Cup finalist sides."
  },
  {
    "personId": "maxwell",
    "displayName": "Maxwell",
    "fullName": "Maxwell",
    "aliases": [],
    "nationality": "Brazil",
    "primaryRoles": [
      "Overlap",
      "Possession fullback",
      "Wide support"
    ],
    "notes": "PSG left-back in the club's domestic dominance era."
  },
  {
    "personId": "juninho_pernambucano",
    "displayName": "Juninho Pernambucano",
    "fullName": "Juninho Pernambucano",
    "aliases": [],
    "nationality": "Brazil",
    "primaryRoles": [
      "Set pieces",
      "Tempo setter",
      "Long passing"
    ],
    "notes": "Lyon midfield icon and free-kick benchmark."
  },
  {
    "personId": "marco_verratti",
    "displayName": "Marco Verratti",
    "fullName": "Marco Verratti",
    "aliases": [],
    "nationality": "Italy",
    "primaryRoles": [
      "Press resistance",
      "Controller",
      "Ball-winner"
    ],
    "notes": "PSG midfield controller through the 2010s."
  },
  {
    "personId": "rai",
    "displayName": "Rai",
    "fullName": "Rai",
    "aliases": [],
    "nationality": "Brazil",
    "primaryRoles": [
      "Creator",
      "Late runner",
      "Captain"
    ],
    "notes": "PSG playmaker and 1990s Ligue 1 reference."
  },
  {
    "personId": "david_ginola",
    "displayName": "David Ginola",
    "fullName": "David Ginola",
    "aliases": [],
    "nationality": "France",
    "primaryRoles": [
      "Dribbler",
      "Wide creator",
      "Flair"
    ],
    "notes": "PSG left-sided creator in the 1990s."
  },
  {
    "personId": "angel_di_maria",
    "displayName": "Angel Di Maria",
    "fullName": "Angel Di Maria",
    "aliases": [],
    "nationality": "Argentina",
    "primaryRoles": [
      "Wide creator",
      "Final ball",
      "Transition runner"
    ],
    "notes": "PSG creator and Champions League finalist."
  },
  {
    "personId": "kylian_mbappe",
    "displayName": "Kylian Mbappe",
    "fullName": "Kylian Mbappe",
    "aliases": [],
    "nationality": "France",
    "primaryRoles": [
      "Elite scorer",
      "Transition runner",
      "Wide threat"
    ],
    "notes": "PSG attacking reference and France superstar."
  },
  {
    "personId": "zlatan_ibrahimovic",
    "displayName": "Zlatan Ibrahimovic",
    "fullName": "Zlatan Ibrahimovic",
    "aliases": [],
    "nationality": "Sweden",
    "primaryRoles": [
      "Complete striker",
      "Aerial threat",
      "Creator"
    ],
    "notes": "PSG scoring and chance-creation hub."
  },
  {
    "personId": "jean_pierre_papin",
    "displayName": "Jean-Pierre Papin",
    "fullName": "Jean-Pierre Papin",
    "aliases": [],
    "nationality": "France",
    "primaryRoles": [
      "Box finisher",
      "Volley specialist",
      "European scorer"
    ],
    "notes": "Marseille striker and early-1990s Ligue 1 scoring icon."
  },
  {
    "personId": "tim_howard",
    "displayName": "Tim Howard",
    "fullName": "Tim Howard",
    "aliases": [],
    "nationality": "United States",
    "primaryRoles": [
      "Shot-stopper",
      "Box command",
      "Veteran"
    ],
    "notes": "USMNT goalkeeper context for MLS mode."
  },
  {
    "personId": "brad_guzan",
    "displayName": "Brad Guzan",
    "fullName": "Brad Guzan",
    "aliases": [],
    "nationality": "United States",
    "primaryRoles": [
      "Shot-stopper",
      "Organizer",
      "MLS Cup keeper"
    ],
    "notes": "Atlanta United goalkeeper and MLS Cup winner."
  },
  {
    "personId": "walker_zimmerman",
    "displayName": "Walker Zimmerman",
    "fullName": "Walker Zimmerman",
    "aliases": [],
    "nationality": "United States",
    "primaryRoles": [
      "Aerial defender",
      "Line leader",
      "Set-piece threat"
    ],
    "notes": "Nashville defensive leader and MLS Best XI level center-back."
  },
  {
    "personId": "chad_marshall",
    "displayName": "Chad Marshall",
    "fullName": "Chad Marshall",
    "aliases": [],
    "nationality": "United States",
    "primaryRoles": [
      "Box defender",
      "Aerial control",
      "Consistency"
    ],
    "notes": "MLS center-back benchmark across Columbus and Seattle years."
  },
  {
    "personId": "damarcus_beasley",
    "displayName": "DaMarcus Beasley",
    "fullName": "DaMarcus Beasley",
    "aliases": [],
    "nationality": "United States",
    "primaryRoles": [
      "Two-way left side",
      "Recovery pace",
      "Wide runner"
    ],
    "notes": "Veteran left-sided MLS and USMNT option."
  },
  {
    "personId": "deandre_yedlin",
    "displayName": "DeAndre Yedlin",
    "fullName": "DeAndre Yedlin",
    "aliases": [],
    "nationality": "United States",
    "primaryRoles": [
      "Recovery pace",
      "Overlap",
      "Transition runner"
    ],
    "notes": "Seattle right-back and USMNT wide defender."
  },
  {
    "personId": "graham_zusi",
    "displayName": "Graham Zusi",
    "fullName": "Graham Zusi",
    "aliases": [],
    "nationality": "United States",
    "primaryRoles": [
      "Crossing",
      "Set pieces",
      "Wide utility"
    ],
    "notes": "Sporting KC wide creator and converted fullback."
  },
  {
    "personId": "michael_bradley",
    "displayName": "Michael Bradley",
    "fullName": "Michael Bradley",
    "aliases": [],
    "nationality": "United States",
    "primaryRoles": [
      "Controller",
      "Ball-winner",
      "Organizer"
    ],
    "notes": "Toronto FC captain and MLS Cup-winning midfield anchor."
  },
  {
    "personId": "carlos_valderrama",
    "displayName": "Carlos Valderrama",
    "fullName": "Carlos Valderrama",
    "aliases": [],
    "nationality": "Colombia",
    "primaryRoles": [
      "Creator",
      "Tempo setter",
      "Final ball"
    ],
    "notes": "Early MLS playmaking icon."
  },
  {
    "personId": "landon_donovan",
    "displayName": "Landon Donovan",
    "fullName": "Landon Donovan",
    "aliases": [],
    "nationality": "United States",
    "primaryRoles": [
      "Transition runner",
      "Creator",
      "Clutch scorer"
    ],
    "notes": "MLS attacking icon and LA Galaxy winner."
  },
  {
    "personId": "carlos_vela",
    "displayName": "Carlos Vela",
    "fullName": "Carlos Vela",
    "aliases": [],
    "nationality": "Mexico",
    "primaryRoles": [
      "Creator",
      "Elite scorer",
      "Inverted winger"
    ],
    "notes": "LAFC attacking icon and MVP-level creator."
  },
  {
    "personId": "lionel_messi",
    "displayName": "Lionel Messi",
    "fullName": "Lionel Messi",
    "aliases": [],
    "nationality": "Argentina",
    "primaryRoles": [
      "Creator",
      "Elite scorer",
      "Set pieces"
    ],
    "notes": "Inter Miami star-era attacking reference."
  },
  {
    "personId": "josef_martinez",
    "displayName": "Josef Martinez",
    "fullName": "Josef Martinez",
    "aliases": [],
    "nationality": "Venezuela",
    "primaryRoles": [
      "Box finisher",
      "Pressing striker",
      "Record scorer"
    ],
    "notes": "Atlanta United MLS Cup striker and scoring record threat."
  },
  {
    "personId": "robbie_keane",
    "displayName": "Robbie Keane",
    "fullName": "Robbie Keane",
    "aliases": [],
    "nationality": "Ireland",
    "primaryRoles": [
      "Box finisher",
      "Link forward",
      "Big-game scorer"
    ],
    "notes": "LA Galaxy striker and MLS Cup winner."
  },
  {
    "personId": "peter_schmeichel",
    "displayName": "Peter Schmeichel",
    "fullName": "Peter Schmeichel",
    "aliases": [],
    "nationality": "Denmark",
    "primaryRoles": [
      "Shot-stopper",
      "Box commander",
      "Tournament keeper"
    ],
    "notes": "Denmark 1992 European Championship-winning goalkeeper."
  },
  {
    "personId": "iker_casillas",
    "displayName": "Iker Casillas",
    "fullName": "Iker Casillas",
    "aliases": [],
    "nationality": "Spain",
    "primaryRoles": [
      "Shot-stopper",
      "Captain",
      "European keeper"
    ],
    "notes": "Real Madrid captain and Champions League/Club World Cup-era keeper."
  },
  {
    "personId": "sergio_ramos",
    "displayName": "Sergio Ramos",
    "fullName": "Sergio Ramos",
    "aliases": [],
    "nationality": "Spain",
    "primaryRoles": [
      "Stopper",
      "Aerial threat",
      "Tournament defender"
    ],
    "notes": "Spain defender during the 2008-2012 international dynasty."
  },
  {
    "personId": "giorgio_chiellini",
    "displayName": "Giorgio Chiellini",
    "fullName": "Giorgio Chiellini",
    "aliases": [],
    "nationality": "Italy",
    "primaryRoles": [
      "Line leader",
      "Box defender",
      "Veteran organizer"
    ],
    "notes": "LAFC veteran center-back and title-era organizer."
  },
  {
    "personId": "jordi_alba",
    "displayName": "Jordi Alba",
    "fullName": "Jordi Alba",
    "aliases": [],
    "nationality": "Spain",
    "primaryRoles": [
      "Attacking fullback",
      "Wide creator",
      "Recovery runner"
    ],
    "notes": "Inter Miami attacking left-back context from the club's star era."
  },
  {
    "personId": "philipp_lahm",
    "displayName": "Philipp Lahm",
    "fullName": "Philipp Lahm",
    "aliases": [],
    "nationality": "Germany",
    "primaryRoles": [
      "Inverted fullback",
      "Controller",
      "Captain"
    ],
    "notes": "Bayern treble captain and Club World Cup fullback/control context."
  },
  {
    "personId": "sergio_busquets",
    "displayName": "Sergio Busquets",
    "fullName": "Sergio Busquets",
    "aliases": [],
    "nationality": "Spain",
    "primaryRoles": [
      "Controller",
      "Press resistance",
      "Defensive screen"
    ],
    "notes": "Inter Miami midfield controller context."
  },
  {
    "personId": "luka_modric",
    "displayName": "Luka Modric",
    "fullName": "Luka Modric",
    "aliases": [],
    "nationality": "Croatia",
    "primaryRoles": [
      "Controller",
      "Carrier",
      "Press resistance"
    ],
    "notes": "Real Madrid midfield engine and Champions League final regular."
  },
  {
    "personId": "michel_platini",
    "displayName": "Michel Platini",
    "fullName": "Michel Platini",
    "aliases": [],
    "nationality": "France",
    "primaryRoles": [
      "Creator",
      "Scoring midfielder",
      "Set pieces"
    ],
    "notes": "France Euro 1984 tournament-defining creator."
  },
  {
    "personId": "luis_figo",
    "displayName": "Luis Figo",
    "fullName": "Luis Figo",
    "aliases": [],
    "nationality": "Portugal",
    "primaryRoles": [
      "Wide creator",
      "Dribbler",
      "Final ball"
    ],
    "notes": "Portugal Golden Generation wide creator."
  },
  {
    "personId": "cristiano_ronaldo",
    "displayName": "Cristiano Ronaldo",
    "fullName": "Cristiano Ronaldo",
    "aliases": [],
    "nationality": "Portugal",
    "primaryRoles": [
      "Elite scorer",
      "Aerial threat",
      "Tournament leader"
    ],
    "notes": "Portugal captain and Euro 2016-winning talisman."
  },
  {
    "personId": "marco_van_basten",
    "displayName": "Marco van Basten",
    "fullName": "Marco van Basten",
    "aliases": [],
    "nationality": "Netherlands",
    "primaryRoles": [
      "Complete striker",
      "Volley specialist",
      "Tournament finisher"
    ],
    "notes": "Netherlands Euro 1988 striker."
  },
  {
    "personId": "ubaldo_fillol",
    "displayName": "Ubaldo Fillol",
    "fullName": "Ubaldo Fillol",
    "aliases": [],
    "nationality": "Argentina",
    "primaryRoles": [
      "Shot-stopper",
      "Tournament keeper",
      "Reflexes"
    ],
    "notes": "Argentina 1978 World Cup-winning goalkeeper."
  },
  {
    "personId": "jose_luis_chilavert",
    "displayName": "Jose Luis Chilavert",
    "fullName": "Jose Luis Chilavert",
    "aliases": [],
    "nationality": "Paraguay",
    "primaryRoles": [
      "Shot-stopper",
      "Set pieces",
      "Leader"
    ],
    "notes": "Paraguay goalkeeper and set-piece specialist."
  },
  {
    "personId": "roberto_carlos",
    "displayName": "Roberto Carlos",
    "fullName": "Roberto Carlos",
    "aliases": [],
    "nationality": "Brazil",
    "primaryRoles": [
      "Attacking fullback",
      "Set pieces",
      "Power runner"
    ],
    "notes": "Brazil left-back and World Cup winner."
  },
  {
    "personId": "cafu",
    "displayName": "Cafu",
    "fullName": "Cafu",
    "aliases": [],
    "nationality": "Brazil",
    "primaryRoles": [
      "Two-way fullback",
      "Overlap",
      "Captain"
    ],
    "notes": "Brazil captain and right-back benchmark."
  },
  {
    "personId": "elias_figueroa",
    "displayName": "Elias Figueroa",
    "fullName": "Elias Figueroa",
    "aliases": [],
    "nationality": "Chile",
    "primaryRoles": [
      "Libero",
      "Aerial defender",
      "Line leader"
    ],
    "notes": "Chile and South American defensive great."
  },
  {
    "personId": "diego_godin",
    "displayName": "Diego Godin",
    "fullName": "Diego Godin",
    "aliases": [],
    "nationality": "Uruguay",
    "primaryRoles": [
      "Box defender",
      "Aerial threat",
      "Leader"
    ],
    "notes": "Uruguay captain and Copa America winner."
  },
  {
    "personId": "javier_mascherano",
    "displayName": "Javier Mascherano",
    "fullName": "Javier Mascherano",
    "aliases": [],
    "nationality": "Argentina",
    "primaryRoles": [
      "Ball-winner",
      "Screen",
      "Tournament tackler"
    ],
    "notes": "Argentina midfield and defensive anchor."
  },
  {
    "personId": "juan_roman_riquelme",
    "displayName": "Juan Roman Riquelme",
    "fullName": "Juan Roman Riquelme",
    "aliases": [],
    "nationality": "Argentina",
    "primaryRoles": [
      "Creator",
      "Tempo setter",
      "Set pieces"
    ],
    "notes": "Argentina playmaker and Copa America-era creator."
  },
  {
    "personId": "zico",
    "displayName": "Zico",
    "fullName": "Zico",
    "aliases": [],
    "nationality": "Brazil",
    "primaryRoles": [
      "Creator",
      "Scoring midfielder",
      "Set pieces"
    ],
    "notes": "Brazil playmaker and South American attacking icon."
  },
  {
    "personId": "neymar",
    "displayName": "Neymar",
    "fullName": "Neymar",
    "aliases": [],
    "nationality": "Brazil",
    "primaryRoles": [
      "Dribbler",
      "Creator",
      "Club world champion"
    ],
    "notes": "Barcelona MSN-era Club World Cup attacker merged onto the curated peak context."
  },
  {
    "personId": "luis_suarez",
    "displayName": "Luis Suarez",
    "fullName": "Luis Suarez",
    "aliases": [],
    "nationality": "Uruguay",
    "primaryRoles": [
      "Box finisher",
      "Link forward",
      "Big-game striker"
    ],
    "notes": "Inter Miami center-forward context."
  },
  {
    "personId": "essam_el_hadary",
    "displayName": "Essam El Hadary",
    "fullName": "Essam El Hadary",
    "aliases": [],
    "nationality": "Egypt",
    "primaryRoles": [
      "Shot-stopper",
      "Penalty presence",
      "Tournament keeper"
    ],
    "notes": "Egypt AFCON dynasty goalkeeper."
  },
  {
    "personId": "joseph_antoine_bell",
    "displayName": "Joseph-Antoine Bell",
    "fullName": "Joseph-Antoine Bell",
    "aliases": [],
    "nationality": "Cameroon",
    "primaryRoles": [
      "Shot-stopper",
      "Box command",
      "African great"
    ],
    "notes": "Cameroon goalkeeper and African football reference."
  },
  {
    "personId": "rigobert_song",
    "displayName": "Rigobert Song",
    "fullName": "Rigobert Song",
    "aliases": [],
    "nationality": "Cameroon",
    "primaryRoles": [
      "Stopper",
      "Leader",
      "Tournament defender"
    ],
    "notes": "Cameroon captain and AFCON winner."
  },
  {
    "personId": "kalidou_koulibaly",
    "displayName": "Kalidou Koulibaly",
    "fullName": "Kalidou Koulibaly",
    "aliases": [],
    "nationality": "Senegal",
    "primaryRoles": [
      "Stopper",
      "Recovery pace",
      "Line leader"
    ],
    "notes": "Senegal AFCON-winning captain."
  },
  {
    "personId": "taye_taiwo",
    "displayName": "Taye Taiwo",
    "fullName": "Taye Taiwo",
    "aliases": [],
    "nationality": "Nigeria",
    "primaryRoles": [
      "Power fullback",
      "Set pieces",
      "Overlap"
    ],
    "notes": "Nigeria left-back and Marseille-era power runner."
  },
  {
    "personId": "achraf_hakimi",
    "displayName": "Achraf Hakimi",
    "fullName": "Achraf Hakimi",
    "aliases": [],
    "nationality": "Morocco",
    "primaryRoles": [
      "Attacking fullback",
      "Recovery pace",
      "Transition runner"
    ],
    "notes": "Morocco right-back and World Cup semifinalist."
  },
  {
    "personId": "geremi",
    "displayName": "Geremi",
    "fullName": "Geremi",
    "aliases": [],
    "nationality": "Cameroon",
    "primaryRoles": [
      "Set pieces",
      "Two-way wide player",
      "Utility"
    ],
    "notes": "Cameroon AFCON winner and wide utility player."
  },
  {
    "personId": "yaya_toure",
    "displayName": "Yaya Toure",
    "fullName": "Yaya Toure",
    "aliases": [],
    "nationality": "Ivory Coast",
    "primaryRoles": [
      "Carrier",
      "Controller",
      "Power runner"
    ],
    "notes": "Ivory Coast midfielder and AFCON winner."
  },
  {
    "personId": "michael_essien",
    "displayName": "Michael Essien",
    "fullName": "Michael Essien",
    "aliases": [],
    "nationality": "Ghana",
    "primaryRoles": [
      "Ball-winner",
      "Carrier",
      "Duel winner"
    ],
    "notes": "Ghana midfield force and World Cup-era leader."
  },
  {
    "personId": "jay_jay_okocha",
    "displayName": "Jay-Jay Okocha",
    "fullName": "Jay-Jay Okocha",
    "aliases": [],
    "nationality": "Nigeria",
    "primaryRoles": [
      "Dribbler",
      "Creator",
      "Set pieces"
    ],
    "notes": "Nigeria creative icon and AFCON star."
  },
  {
    "personId": "abedi_pele",
    "displayName": "Abedi Pele",
    "fullName": "Abedi Pele",
    "aliases": [],
    "nationality": "Ghana",
    "primaryRoles": [
      "Creator",
      "Dribbler",
      "Wide playmaker"
    ],
    "notes": "Ghana attacking great and African Footballer of the Year icon."
  },
  {
    "personId": "sadio_mane",
    "displayName": "Sadio Mane",
    "fullName": "Sadio Mane",
    "aliases": [],
    "nationality": "Senegal",
    "primaryRoles": [
      "Pressing forward",
      "Wide scorer",
      "Tournament leader"
    ],
    "notes": "Senegal AFCON-winning attacker."
  },
  {
    "personId": "mohamed_salah",
    "displayName": "Mohamed Salah",
    "fullName": "Mohamed Salah",
    "aliases": [],
    "nationality": "Egypt",
    "primaryRoles": [
      "Elite scorer",
      "Transition runner",
      "Wide finisher"
    ],
    "notes": "Egypt attacking talisman."
  },
  {
    "personId": "riyad_mahrez",
    "displayName": "Riyad Mahrez",
    "fullName": "Riyad Mahrez",
    "aliases": [],
    "nationality": "Algeria",
    "primaryRoles": [
      "Inverted winger",
      "Creator",
      "Set pieces"
    ],
    "notes": "Algeria AFCON-winning captain and right-sided creator."
  },
  {
    "personId": "didier_drogba",
    "displayName": "Didier Drogba",
    "fullName": "Didier Drogba",
    "aliases": [],
    "nationality": "Ivory Coast",
    "primaryRoles": [
      "Target striker",
      "Big-game scorer",
      "Aerial threat"
    ],
    "notes": "Ivory Coast striker and African football icon."
  },
  {
    "personId": "samuel_eto_o",
    "displayName": "Samuel Eto'o",
    "fullName": "Samuel Eto'o",
    "aliases": [],
    "nationality": "Cameroon",
    "primaryRoles": [
      "Elite scorer",
      "Channel runner",
      "Tournament finisher"
    ],
    "notes": "Cameroon striker and AFCON winner."
  },
  {
    "personId": "ederson",
    "displayName": "Ederson",
    "fullName": "Ederson",
    "aliases": [],
    "nationality": "Brazil",
    "primaryRoles": [
      "Sweeper keeper",
      "Distribution",
      "High-line keeper"
    ],
    "notes": "Manchester City treble-era goalkeeper."
  },
  {
    "personId": "marcelo",
    "displayName": "Marcelo",
    "fullName": "Marcelo",
    "aliases": [],
    "nationality": "Brazil",
    "primaryRoles": [
      "Attacking fullback",
      "Dribbler",
      "Combination play"
    ],
    "notes": "Real Madrid left-back in a Champions League dynasty."
  },
  {
    "personId": "dani_carvajal",
    "displayName": "Dani Carvajal",
    "fullName": "Dani Carvajal",
    "aliases": [],
    "nationality": "Spain",
    "primaryRoles": [
      "Two-way fullback",
      "Big-game defender",
      "Overlap"
    ],
    "notes": "Real Madrid right-back across multiple Champions League wins."
  },
  {
    "personId": "virgil_van_dijk",
    "displayName": "Virgil van Dijk",
    "fullName": "Virgil van Dijk",
    "aliases": [],
    "nationality": "Netherlands",
    "primaryRoles": [
      "Line leader",
      "Aerial control",
      "Recovery pace"
    ],
    "notes": "Liverpool Champions League and Club World Cup-winning center-back."
  },
  {
    "personId": "gerard_pique",
    "displayName": "Gerard Pique",
    "fullName": "Gerard Pique",
    "aliases": [],
    "nationality": "Spain",
    "primaryRoles": [
      "Ball-playing CB",
      "Aerial defender",
      "Possession base"
    ],
    "notes": "Barcelona center-back in Champions League and Club World Cup-winning sides."
  },
  {
    "personId": "toni_kroos",
    "displayName": "Toni Kroos",
    "fullName": "Toni Kroos",
    "aliases": [],
    "nationality": "Germany",
    "primaryRoles": [
      "Controller",
      "Long passing",
      "Tempo setter"
    ],
    "notes": "Real Madrid midfield controller in the Champions League dynasty."
  },
  {
    "personId": "n_golo_kante",
    "displayName": "N'Golo Kante",
    "fullName": "N'Golo Kante",
    "aliases": [],
    "nationality": "France",
    "primaryRoles": [
      "Ball-winner",
      "Pressing",
      "Transition stopper"
    ],
    "notes": "Chelsea Champions League and Club World Cup midfield force."
  },
  {
    "personId": "bernardo_silva",
    "displayName": "Bernardo Silva",
    "fullName": "Bernardo Silva",
    "aliases": [],
    "nationality": "Portugal",
    "primaryRoles": [
      "Press resistance",
      "Wide creator",
      "Controller"
    ],
    "notes": "Manchester City treble-era midfielder and wide creator."
  },
  {
    "personId": "vinicius_junior",
    "displayName": "Vinicius Junior",
    "fullName": "Vinicius Junior",
    "aliases": [],
    "nationality": "Brazil",
    "primaryRoles": [
      "Dribbler",
      "Wide scorer",
      "Big-game winger"
    ],
    "notes": "Real Madrid Champions League match-winner and Club World Cup attacker."
  },
  {
    "personId": "gareth_bale",
    "displayName": "Gareth Bale",
    "fullName": "Gareth Bale",
    "aliases": [],
    "nationality": "Wales",
    "primaryRoles": [
      "Power winger",
      "Big-game scorer",
      "Transition runner"
    ],
    "notes": "Real Madrid Champions League final scorer and Club World Cup attacker."
  },
  {
    "personId": "karim_benzema",
    "displayName": "Karim Benzema",
    "fullName": "Karim Benzema",
    "aliases": [],
    "nationality": "France",
    "primaryRoles": [
      "Complete striker",
      "Link forward",
      "Big-game scorer"
    ],
    "notes": "Real Madrid Champions League and Club World Cup striker."
  },
  {
    "personId": "eric_abidal",
    "displayName": "Eric Abidal",
    "fullName": "Eric Abidal",
    "aliases": [],
    "nationality": "France",
    "primaryRoles": [
      "Defensive fullback",
      "Recovery pace",
      "Left-side balance"
    ],
    "notes": "Lyon title-era left-back before Barcelona and France tournament roles."
  },
  {
    "personId": "bixente_lizarazu",
    "displayName": "Bixente Lizarazu",
    "fullName": "Bixente Lizarazu",
    "aliases": [],
    "nationality": "France",
    "primaryRoles": [
      "Two-way fullback",
      "Overlap",
      "Tournament defender"
    ],
    "notes": "Bordeaux and France left-back reference with elite wide defensive value."
  },
  {
    "personId": "justin_morrow",
    "displayName": "Justin Morrow",
    "fullName": "Justin Morrow",
    "aliases": [],
    "nationality": "United States",
    "primaryRoles": [
      "Wingback",
      "Wide runner",
      "Playoff reliability"
    ],
    "notes": "Toronto FC title-era left-sided defender and wingback."
  },
  {
    "personId": "alphonso_davies",
    "displayName": "Alphonso Davies",
    "fullName": "Alphonso Davies",
    "aliases": [],
    "nationality": "Canada",
    "primaryRoles": [
      "Explosive runner",
      "Left-side threat",
      "Transition outlet"
    ],
    "notes": "Vancouver teenage breakout used for MLS left-lane coverage, not Bayern peak."
  },
  {
    "personId": "diego_valeri",
    "displayName": "Diego Valeri",
    "fullName": "Diego Valeri",
    "aliases": [],
    "nationality": "Argentina",
    "primaryRoles": [
      "Creator",
      "Set pieces",
      "Playoff attacker"
    ],
    "notes": "Portland creator and MLS MVP-level attacking midfielder."
  },
  {
    "personId": "ashley_cole",
    "displayName": "Ashley Cole",
    "fullName": "Ashley Cole",
    "aliases": [],
    "nationality": "England",
    "primaryRoles": [
      "Lockdown fullback",
      "Recovery pace",
      "Big-game defender"
    ],
    "notes": "England left-back reference across the 2002, 2006 and 2010 World Cup cycles."
  },
  {
    "personId": "rio_ferdinand",
    "displayName": "Rio Ferdinand",
    "fullName": "Rio Ferdinand",
    "aliases": [],
    "nationality": "England",
    "primaryRoles": [
      "Ball-playing CB",
      "Cover defender",
      "Recovery pace"
    ],
    "notes": "England ball-playing center-back across the 2002 and 2006 World Cup cycles."
  },
  {
    "personId": "john_terry",
    "displayName": "John Terry",
    "fullName": "John Terry",
    "aliases": [],
    "nationality": "England",
    "primaryRoles": [
      "Box defender",
      "Aerial threat",
      "Leader"
    ],
    "notes": "England defensive leader through Euro 2004, World Cup 2006 and World Cup 2010."
  },
  {
    "personId": "paul_scholes",
    "displayName": "Paul Scholes",
    "fullName": "Paul Scholes",
    "aliases": [],
    "nationality": "England",
    "primaryRoles": [
      "Controller",
      "Long passing",
      "Late runs"
    ],
    "notes": "England midfield technician through the 2002 World Cup and Euro 2004 cycle."
  },
  {
    "personId": "steven_gerrard",
    "displayName": "Steven Gerrard",
    "fullName": "Steven Gerrard",
    "aliases": [],
    "nationality": "England",
    "primaryRoles": [
      "Box-to-box",
      "Big-game shot",
      "Captain"
    ],
    "notes": "England all-action midfielder across 2000s tournament squads."
  },
  {
    "personId": "frank_lampard",
    "displayName": "Frank Lampard",
    "fullName": "Frank Lampard",
    "aliases": [],
    "nationality": "England",
    "primaryRoles": [
      "Late runner",
      "Scoring midfielder",
      "Set pieces"
    ],
    "notes": "England goalscoring midfielder across Euro 2004, World Cup 2006 and World Cup 2010."
  },
  {
    "personId": "joe_cole",
    "displayName": "Joe Cole",
    "fullName": "Joe Cole",
    "aliases": [],
    "nationality": "England",
    "primaryRoles": [
      "Dribbler",
      "Wide creator",
      "Tournament spark"
    ],
    "notes": "England wide attacker and creative option across Euro and World Cup squads."
  },
  {
    "personId": "michael_owen",
    "displayName": "Michael Owen",
    "fullName": "Michael Owen",
    "aliases": [],
    "nationality": "England",
    "primaryRoles": [
      "Explosive finisher",
      "Channel runner",
      "Tournament scorer"
    ],
    "notes": "England striker across the 1998 breakthrough and 2000s tournament cycles."
  },
  {
    "personId": "wayne_rooney",
    "displayName": "Wayne Rooney",
    "fullName": "Wayne Rooney",
    "aliases": [],
    "nationality": "England",
    "primaryRoles": [
      "Complete forward",
      "Pressing",
      "Creator"
    ],
    "notes": "England forward from Euro 2004 breakout through the 2006 and 2010 World Cup cycles."
  },
  {
    "personId": "juan_pablo_sorin",
    "displayName": "Juan Pablo Sorin",
    "fullName": "Juan Pablo Sorin",
    "aliases": [],
    "nationality": "Argentina",
    "primaryRoles": [
      "Attacking fullback",
      "Wide engine",
      "Captain"
    ],
    "notes": "Argentina left-sided defender and wingback across Copa America and World Cup cycles."
  },
  {
    "personId": "javier_zanetti",
    "displayName": "Javier Zanetti",
    "fullName": "Javier Zanetti",
    "aliases": [],
    "nationality": "Argentina",
    "primaryRoles": [
      "Two-way fullback",
      "Engine",
      "Wide security"
    ],
    "notes": "Argentina all-phase fullback and Copa America veteran."
  },
  {
    "personId": "dani_alves",
    "displayName": "Dani Alves",
    "fullName": "Dani Alves",
    "aliases": [],
    "nationality": "Brazil",
    "primaryRoles": [
      "Attacking fullback",
      "Wide creator",
      "Title veteran"
    ],
    "notes": "PSG right-back context for late-career Ligue 1 title sides."
  },
  {
    "personId": "benoit_assou_ekotto",
    "displayName": "Benoit Assou-Ekotto",
    "fullName": "Benoit Assou-Ekotto",
    "aliases": [],
    "nationality": "Cameroon",
    "primaryRoles": [
      "Left back",
      "Wide defender",
      "Recovery pace"
    ],
    "notes": "Cameroon left-back used to deepen AFCON left-side coverage."
  },
  {
    "personId": "arthur_boka",
    "displayName": "Arthur Boka",
    "fullName": "Arthur Boka",
    "aliases": [],
    "nationality": "Ivory Coast",
    "primaryRoles": [
      "Left back",
      "Wide engine",
      "Set-piece option"
    ],
    "notes": "Ivory Coast left-back across AFCON and World Cup squads."
  },
  {
    "personId": "david_alaba",
    "displayName": "David Alaba",
    "fullName": "David Alaba",
    "aliases": [],
    "nationality": "Austria",
    "primaryRoles": [
      "Two-way fullback",
      "Ball progression",
      "Back-line cover"
    ],
    "notes": "Bayern Club World Cup winner and left-back/center-back hybrid."
  },
  {
    "personId": "rodrygo",
    "displayName": "Rodrygo",
    "fullName": "Rodrygo",
    "aliases": [],
    "nationality": "Brazil",
    "primaryRoles": [
      "Wide scorer",
      "Big-game runner",
      "Flexible forward"
    ],
    "notes": "Real Madrid Club World Cup and Champions League wide-forward context."
  },
  {
    "personId": "ludovic_giuly",
    "displayName": "Ludovic Giuly",
    "fullName": "Ludovic Giuly",
    "aliases": [],
    "nationality": "France",
    "primaryRoles": [
      "Right-sided attacker",
      "Runner",
      "European finalist"
    ],
    "notes": "Monaco right-sided attacker and 2004 Champions League finalist."
  },
  {
    "personId": "lucas_moura",
    "displayName": "Lucas Moura",
    "fullName": "Lucas Moura",
    "aliases": [],
    "nationality": "Brazil",
    "primaryRoles": [
      "Dribbler",
      "Wide runner",
      "Transition threat"
    ],
    "notes": "PSG wide attacker used to deepen Ligue 1 right-side draft coverage."
  },
  {
    "personId": "edinson_cavani",
    "displayName": "Edinson Cavani",
    "fullName": "Edinson Cavani",
    "aliases": [],
    "nationality": "Uruguay",
    "primaryRoles": [
      "Box finisher",
      "Pressing forward",
      "Wide-channel runner"
    ],
    "notes": "PSG record-scoring forward with enough wide-channel work for draft flexibility."
  },
  {
    "personId": "gianluca_zambrotta",
    "displayName": "Gianluca Zambrotta",
    "fullName": "Gianluca Zambrotta",
    "aliases": [],
    "nationality": "Italy",
    "primaryRoles": [
      "Two-way fullback",
      "Wide balance",
      "Tournament defender"
    ],
    "notes": "Italy tournament fullback across Euros and the 2006 World Cup-winning cycle."
  },
  {
    "personId": "kyle_walker",
    "displayName": "Kyle Walker",
    "fullName": "Kyle Walker",
    "aliases": [],
    "nationality": "England",
    "primaryRoles": [
      "Recovery pace",
      "Wide stopper",
      "Back-three cover"
    ],
    "notes": "England right-back and wide center-back across recent Euro runs."
  },
  {
    "personId": "joe_willis",
    "displayName": "Joe Willis",
    "fullName": "Joe Willis",
    "aliases": [],
    "nationality": "United States",
    "primaryRoles": [
      "Shot-stopper",
      "Box command",
      "MLS veteran"
    ],
    "notes": "Nashville starting goalkeeper context for the club's MLS era."
  },
  {
    "personId": "dave_romney",
    "displayName": "Dave Romney",
    "fullName": "Dave Romney",
    "aliases": [],
    "nationality": "United States",
    "primaryRoles": [
      "Cover defender",
      "Back-line balance",
      "Durable starter"
    ],
    "notes": "Nashville early MLS center-back with left-side flexibility."
  },
  {
    "personId": "daniel_lovitz",
    "displayName": "Daniel Lovitz",
    "fullName": "Daniel Lovitz",
    "aliases": [],
    "nationality": "United States",
    "primaryRoles": [
      "Wide defender",
      "Crossing support",
      "Defensive balance"
    ],
    "notes": "Nashville left-back context with steady MLS minutes."
  },
  {
    "personId": "shaq_moore",
    "displayName": "Shaq Moore",
    "fullName": "Shaq Moore",
    "aliases": [],
    "nationality": "United States",
    "primaryRoles": [
      "Two-way fullback",
      "Wide runner",
      "Recovery pace"
    ],
    "notes": "Nashville and USMNT right-back profile for modern MLS rolls."
  },
  {
    "personId": "dax_mccarty",
    "displayName": "Dax McCarty",
    "fullName": "Dax McCarty",
    "aliases": [],
    "nationality": "United States",
    "primaryRoles": [
      "Ball-winner",
      "Organizer",
      "Tempo setter"
    ],
    "notes": "Veteran Nashville holding midfielder and MLS organizer."
  },
  {
    "personId": "anibal_godoy",
    "displayName": "Anibal Godoy",
    "fullName": "Anibal Godoy",
    "aliases": [],
    "nationality": "Panama",
    "primaryRoles": [
      "Ball-winner",
      "Connector",
      "Duel winner"
    ],
    "notes": "Nashville central midfielder with defensive coverage."
  },
  {
    "personId": "sean_davis",
    "displayName": "Sean Davis",
    "fullName": "Sean Davis",
    "aliases": [],
    "nationality": "United States",
    "primaryRoles": [
      "Connector",
      "Pressing midfielder",
      "Second-ball winner"
    ],
    "notes": "Nashville central midfield depth context."
  },
  {
    "personId": "brian_anunga",
    "displayName": "Brian Anunga",
    "fullName": "Brian Anunga",
    "aliases": [],
    "nationality": "Cameroon",
    "primaryRoles": [
      "Ball-winner",
      "Physical midfielder",
      "Rotation piece"
    ],
    "notes": "Nashville defensive-midfield coverage for MLS draft depth."
  },
  {
    "personId": "hany_mukhtar",
    "displayName": "Hany Mukhtar",
    "fullName": "Hany Mukhtar",
    "aliases": [],
    "nationality": "Germany",
    "primaryRoles": [
      "Creator",
      "Transition scorer",
      "MVP-level attacker"
    ],
    "notes": "Nashville attacking centerpiece and MLS MVP-level creator."
  },
  {
    "personId": "randall_leal",
    "displayName": "Randall Leal",
    "fullName": "Randall Leal",
    "aliases": [],
    "nationality": "Costa Rica",
    "primaryRoles": [
      "Wide creator",
      "Carrier",
      "Final-third connector"
    ],
    "notes": "Nashville wide attacking context from the early MLS seasons."
  },
  {
    "personId": "jacob_shaffelburg",
    "displayName": "Jacob Shaffelburg",
    "fullName": "Jacob Shaffelburg",
    "aliases": [],
    "nationality": "Canada",
    "primaryRoles": [
      "Wide runner",
      "Direct winger",
      "Transition outlet"
    ],
    "notes": "Nashville left-sided runner and Canada international profile."
  },
  {
    "personId": "alex_muyl",
    "displayName": "Alex Muyl",
    "fullName": "Alex Muyl",
    "aliases": [],
    "nationality": "United States",
    "primaryRoles": [
      "Pressing winger",
      "Wingback cover",
      "Work-rate player"
    ],
    "notes": "Nashville right-sided utility profile."
  },
  {
    "personId": "cj_sapong",
    "displayName": "CJ Sapong",
    "fullName": "CJ Sapong",
    "aliases": [],
    "nationality": "United States",
    "primaryRoles": [
      "Target forward",
      "Pressing striker",
      "Box presence"
    ],
    "notes": "Nashville striker context with MLS veteran scoring history."
  },
  {
    "personId": "sam_surridge",
    "displayName": "Sam Surridge",
    "fullName": "Sam Surridge",
    "aliases": [],
    "nationality": "England",
    "primaryRoles": [
      "Box finisher",
      "Penalty-box striker",
      "Aerial target"
    ],
    "notes": "Nashville modern center-forward option."
  },
  {
    "personId": "teal_bunbury",
    "displayName": "Teal Bunbury",
    "fullName": "Teal Bunbury",
    "aliases": [],
    "nationality": "United States",
    "primaryRoles": [
      "Forward depth",
      "Wide-channel runner",
      "Veteran finisher"
    ],
    "notes": "Nashville forward depth and wide-forward coverage."
  },
  {
    "personId": "drake_callender",
    "displayName": "Drake Callender",
    "fullName": "Drake Callender",
    "aliases": [],
    "nationality": "United States",
    "primaryRoles": [
      "Shot-stopper",
      "Penalty presence",
      "Modern keeper"
    ],
    "notes": "Inter Miami starting goalkeeper context."
  },
  {
    "personId": "diego_gomez",
    "displayName": "Diego Gomez",
    "fullName": "Diego Gomez",
    "aliases": [],
    "nationality": "Paraguay",
    "primaryRoles": [
      "Box-to-box",
      "Carrier",
      "Pressing midfielder"
    ],
    "notes": "Inter Miami energetic midfield context."
  },
  {
    "personId": "jack_maher",
    "displayName": "Jack Maher",
    "fullName": "Jack Maher",
    "aliases": [],
    "nationality": "United States",
    "primaryRoles": [
      "Center-back depth",
      "Aerial defender",
      "Back-line cover"
    ],
    "notes": "Nashville center-back context for modern MLS depth."
  },
  {
    "personId": "lukas_macnaughton",
    "displayName": "Lukas MacNaughton",
    "fullName": "Lukas MacNaughton",
    "aliases": [],
    "nationality": "Canada",
    "primaryRoles": [
      "Stopper",
      "Back-line depth",
      "Duel defender"
    ],
    "notes": "Nashville center-back and Canada international profile."
  },
  {
    "personId": "fafa_picault",
    "displayName": "Fafa Picault",
    "fullName": "Fafa Picault",
    "aliases": [],
    "nationality": "Haiti",
    "primaryRoles": [
      "Wide runner",
      "Pressing forward",
      "Transition outlet"
    ],
    "notes": "Nashville wide-forward context with pace and pressing."
  },
  {
    "personId": "diego_palacios",
    "displayName": "Diego Palacios",
    "fullName": "Diego Palacios",
    "aliases": [],
    "nationality": "Ecuador",
    "primaryRoles": [
      "Wide defender",
      "Overlap runner",
      "Recovery pace"
    ],
    "notes": "LAFC title-era left-back context."
  },
  {
    "personId": "ryan_hollingshead",
    "displayName": "Ryan Hollingshead",
    "fullName": "Ryan Hollingshead",
    "aliases": [],
    "nationality": "United States",
    "primaryRoles": [
      "Two-way fullback",
      "Back-post threat",
      "Wide balance"
    ],
    "notes": "LAFC fullback context with both-side coverage."
  },
  {
    "personId": "jesus_murillo",
    "displayName": "Jesus Murillo",
    "fullName": "Jesus Murillo",
    "aliases": [],
    "nationality": "Colombia",
    "primaryRoles": [
      "Stopper",
      "Duel defender",
      "Back-line anchor"
    ],
    "notes": "LAFC center-back coverage for 2020s MLS rolls."
  },
  {
    "personId": "ilie_sanchez",
    "displayName": "Ilie Sanchez",
    "fullName": "Ilie Sanchez",
    "aliases": [],
    "nationality": "Spain",
    "primaryRoles": [
      "Controller",
      "Defensive screen",
      "Build-up passer"
    ],
    "notes": "LAFC midfield organizer and defensive connector."
  },
  {
    "personId": "kellyn_acosta",
    "displayName": "Kellyn Acosta",
    "fullName": "Kellyn Acosta",
    "aliases": [],
    "nationality": "United States",
    "primaryRoles": [
      "Box-to-box",
      "Set pieces",
      "Ball-winner"
    ],
    "notes": "LAFC title-season central midfielder."
  },
  {
    "personId": "eduard_atuesta",
    "displayName": "Eduard Atuesta",
    "fullName": "Eduard Atuesta",
    "aliases": [],
    "nationality": "Colombia",
    "primaryRoles": [
      "Controller",
      "Set pieces",
      "Progressive passer"
    ],
    "notes": "LAFC central playmaker profile."
  },
  {
    "personId": "timothy_tillman",
    "displayName": "Timothy Tillman",
    "fullName": "Timothy Tillman",
    "aliases": [],
    "nationality": "United States",
    "primaryRoles": [
      "Connector",
      "Carrier",
      "Pressing midfielder"
    ],
    "notes": "LAFC midfield depth and connector context."
  },
  {
    "personId": "denis_bouanga",
    "displayName": "Denis Bouanga",
    "fullName": "Denis Bouanga",
    "aliases": [],
    "nationality": "Gabon",
    "primaryRoles": [
      "Wide scorer",
      "Transition runner",
      "Direct attacker"
    ],
    "notes": "LAFC high-volume scorer and 2020s attacking reference."
  },
  {
    "personId": "cristian_arango",
    "displayName": "Cristian Arango",
    "fullName": "Cristian Arango",
    "aliases": [],
    "nationality": "Colombia",
    "primaryRoles": [
      "Box finisher",
      "Pressing striker",
      "Penalty-box mover"
    ],
    "notes": "LAFC title-era center-forward context."
  }
]

export const importedPlayerContexts: PlayerContext[] = [
  {
    "contextId": "shilton_nottingham_forest_1970s",
    "personId": "peter_shilton",
    "displayName": "Peter Shilton",
    "teamType": "club",
    "teamName": "Nottingham Forest",
    "league": "English Top Flight",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "English Top Flight",
        "team": "Nottingham Forest",
        "eraLabel": "1970s",
        "role": "impact"
      },
      {
        "competition": "European Cup",
        "team": "Nottingham Forest",
        "eraLabel": "1970s",
        "role": "impact"
      }
    ],
    "startYear": 1977,
    "endYear": 1982,
    "decade": "1970s",
    "eraLabel": "1970s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "english_top_flight",
      "classic_european_cup"
    ],
    "positions": [
      "GK"
    ],
    "primaryPositions": [
      "GK"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Shot-stopper",
      "Organizer",
      "European champion"
    ],
    "ratings": {
      "attack": 19,
      "creation": 44,
      "control": 61,
      "defense": 65,
      "goalkeeping": 96,
      "physical": 82,
      "press": 50,
      "bigGame": 92
    },
    "peakWindow": "1977-1982",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Nottingham Forest goalkeeper during the club's European Cup-winning peak."
  },
  {
    "contextId": "seaman_arsenal_1990s",
    "personId": "david_seaman",
    "displayName": "David Seaman",
    "teamType": "club",
    "teamName": "Arsenal",
    "league": "English Top Flight",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "English Top Flight",
        "team": "Arsenal",
        "eraLabel": "1990s",
        "role": "impact"
      },
      {
        "competition": "Premier League",
        "team": "Arsenal",
        "eraLabel": "1990s",
        "role": "impact"
      }
    ],
    "startYear": 1990,
    "endYear": 2003,
    "decade": "1990s",
    "eraLabel": "1990s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "english_top_flight",
      "premier_league"
    ],
    "positions": [
      "GK"
    ],
    "primaryPositions": [
      "GK"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Shot-stopper",
      "Consistency",
      "Back-four keeper"
    ],
    "ratings": {
      "attack": 19,
      "creation": 43,
      "control": 60,
      "defense": 64,
      "goalkeeping": 95,
      "physical": 81,
      "press": 50,
      "bigGame": 89
    },
    "peakWindow": "1990-2003",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Arsenal and England keeper across the late First Division and Premier League eras."
  },
  {
    "contextId": "hansen_liverpool_1980s",
    "personId": "alan_hansen",
    "displayName": "Alan Hansen",
    "teamType": "club",
    "teamName": "Liverpool",
    "league": "English Top Flight",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "English Top Flight",
        "team": "Liverpool",
        "eraLabel": "1980s",
        "role": "impact"
      },
      {
        "competition": "European Cup",
        "team": "Liverpool",
        "eraLabel": "1980s",
        "role": "impact"
      }
    ],
    "startYear": 1977,
    "endYear": 1991,
    "decade": "1980s",
    "eraLabel": "1980s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "english_top_flight",
      "classic_european_cup"
    ],
    "positions": [
      "CB"
    ],
    "primaryPositions": [
      "CB"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Ball-playing CB",
      "Line leader",
      "Title dynasty"
    ],
    "ratings": {
      "attack": 37,
      "creation": 61,
      "control": 82,
      "defense": 94,
      "goalkeeping": 4,
      "physical": 92,
      "press": 73,
      "bigGame": 92
    },
    "peakWindow": "1977-1991",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Liverpool defensive leader in a dominant English and European period."
  },
  {
    "contextId": "campbell_arsenal_2000s",
    "personId": "sol_campbell",
    "displayName": "Sol Campbell",
    "teamType": "club",
    "teamName": "Arsenal",
    "league": "Premier League",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "Premier League",
        "team": "Arsenal",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 2001,
    "endYear": 2006,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "english_top_flight",
      "premier_league"
    ],
    "positions": [
      "CB"
    ],
    "primaryPositions": [
      "CB"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Stopper",
      "Recovery pace",
      "Invincible defender"
    ],
    "ratings": {
      "attack": 36,
      "creation": 60,
      "control": 68,
      "defense": 94,
      "goalkeeping": 4,
      "physical": 92,
      "press": 72,
      "bigGame": 90
    },
    "peakWindow": "2001-2006",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Arsenal Invincibles center-back and England international."
  },
  {
    "contextId": "pearce_nottingham_forest_1990s",
    "personId": "stuart_pearce",
    "displayName": "Stuart Pearce",
    "teamType": "club",
    "teamName": "Nottingham Forest",
    "league": "English Top Flight",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "English Top Flight",
        "team": "Nottingham Forest",
        "eraLabel": "1990s",
        "role": "impact"
      },
      {
        "competition": "Premier League",
        "team": "Nottingham Forest",
        "eraLabel": "1990s",
        "role": "impact"
      }
    ],
    "startYear": 1985,
    "endYear": 1997,
    "decade": "1990s",
    "eraLabel": "1990s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "english_top_flight",
      "premier_league"
    ],
    "positions": [
      "LB",
      "LWB",
      "LM"
    ],
    "primaryPositions": [
      "LB"
    ],
    "secondaryPositions": [
      "LWB",
      "LM"
    ],
    "roleTags": [
      "Aggressive fullback",
      "Set pieces",
      "Leader"
    ],
    "ratings": {
      "attack": 56,
      "creation": 67,
      "control": 71,
      "defense": 88,
      "goalkeeping": 5,
      "physical": 88,
      "press": 79,
      "bigGame": 88
    },
    "peakWindow": "1985-1997",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Nottingham Forest and England left-back reference."
  },
  {
    "contextId": "irwin_manchester_united_1990s",
    "personId": "denis_irwin",
    "displayName": "Denis Irwin",
    "teamType": "club",
    "teamName": "Manchester United",
    "league": "Premier League",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "Premier League",
        "team": "Manchester United",
        "eraLabel": "1990s",
        "role": "impact"
      },
      {
        "competition": "UCL",
        "team": "Manchester United",
        "eraLabel": "1990s",
        "role": "impact"
      }
    ],
    "startYear": 1990,
    "endYear": 2002,
    "decade": "1990s",
    "eraLabel": "1990s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "english_top_flight",
      "premier_league",
      "champions_league"
    ],
    "positions": [
      "LB",
      "RB",
      "LWB"
    ],
    "primaryPositions": [
      "LB"
    ],
    "secondaryPositions": [
      "RB",
      "LWB"
    ],
    "roleTags": [
      "Two-footed fullback",
      "Set pieces",
      "Reliable defender"
    ],
    "ratings": {
      "attack": 56,
      "creation": 76,
      "control": 72,
      "defense": 88,
      "goalkeeping": 5,
      "physical": 84,
      "press": 80,
      "bigGame": 90
    },
    "peakWindow": "1990-2002",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Manchester United fullback across domestic and European trophy seasons."
  },
  {
    "contextId": "gary_neville_united_1990s",
    "personId": "gary_neville",
    "displayName": "Gary Neville",
    "teamType": "club",
    "teamName": "Manchester United",
    "league": "Premier League",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "Premier League",
        "team": "Manchester United",
        "eraLabel": "1990s",
        "role": "impact"
      },
      {
        "competition": "UCL",
        "team": "Manchester United",
        "eraLabel": "1990s",
        "role": "impact"
      }
    ],
    "startYear": 1992,
    "endYear": 2011,
    "decade": "1990s",
    "eraLabel": "1990s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "english_top_flight",
      "premier_league",
      "champions_league"
    ],
    "positions": [
      "RB",
      "RWB"
    ],
    "primaryPositions": [
      "RB"
    ],
    "secondaryPositions": [
      "RWB"
    ],
    "roleTags": [
      "Defensive fullback",
      "Overlap",
      "Back-four organizer"
    ],
    "ratings": {
      "attack": 55,
      "creation": 66,
      "control": 70,
      "defense": 88,
      "goalkeeping": 5,
      "physical": 82,
      "press": 82,
      "bigGame": 90
    },
    "peakWindow": "1992-2011",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Manchester United right-back and Champions League winner."
  },
  {
    "contextId": "beckham_united_1990s",
    "personId": "david_beckham",
    "displayName": "David Beckham",
    "teamType": "club",
    "teamName": "Manchester United",
    "league": "Premier League",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "Premier League",
        "team": "Manchester United",
        "eraLabel": "1990s",
        "role": "impact"
      },
      {
        "competition": "UCL",
        "team": "Manchester United",
        "eraLabel": "1990s",
        "role": "impact"
      }
    ],
    "startYear": 1992,
    "endYear": 2003,
    "decade": "1990s",
    "eraLabel": "1990s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "english_top_flight",
      "premier_league",
      "champions_league"
    ],
    "positions": [
      "RM",
      "RW",
      "CM"
    ],
    "primaryPositions": [
      "RM"
    ],
    "secondaryPositions": [
      "RW",
      "CM"
    ],
    "roleTags": [
      "Crossing",
      "Set pieces",
      "Wide creator"
    ],
    "ratings": {
      "attack": 75,
      "creation": 95,
      "control": 86,
      "defense": 57,
      "goalkeeping": 4,
      "physical": 81,
      "press": 82,
      "bigGame": 91
    },
    "peakWindow": "1992-2003",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Manchester United wide creator and 1999 treble piece."
  },
  {
    "contextId": "giggs_united_1990s",
    "personId": "ryan_giggs",
    "displayName": "Ryan Giggs",
    "teamType": "club",
    "teamName": "Manchester United",
    "league": "Premier League",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "Premier League",
        "team": "Manchester United",
        "eraLabel": "1990s",
        "role": "impact"
      },
      {
        "competition": "UCL",
        "team": "Manchester United",
        "eraLabel": "1990s",
        "role": "impact"
      }
    ],
    "startYear": 1990,
    "endYear": 2014,
    "decade": "1990s",
    "eraLabel": "1990s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "english_top_flight",
      "premier_league",
      "champions_league"
    ],
    "positions": [
      "LM",
      "LW",
      "CM"
    ],
    "primaryPositions": [
      "LM"
    ],
    "secondaryPositions": [
      "LW",
      "CM"
    ],
    "roleTags": [
      "Wide creator",
      "Dribbler",
      "Transition runner"
    ],
    "ratings": {
      "attack": 86,
      "creation": 91,
      "control": 88,
      "defense": 58,
      "goalkeeping": 4,
      "physical": 82,
      "press": 75,
      "bigGame": 91
    },
    "peakWindow": "1990-2014",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Manchester United left-sided creator across multiple title eras."
  },
  {
    "contextId": "barnes_liverpool_1980s",
    "personId": "john_barnes",
    "displayName": "John Barnes",
    "teamType": "club",
    "teamName": "Liverpool",
    "league": "English Top Flight",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "English Top Flight",
        "team": "Liverpool",
        "eraLabel": "1980s",
        "role": "impact"
      }
    ],
    "startYear": 1987,
    "endYear": 1997,
    "decade": "1980s",
    "eraLabel": "1980s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "english_top_flight"
    ],
    "positions": [
      "LW",
      "LM",
      "AM"
    ],
    "primaryPositions": [
      "LW"
    ],
    "secondaryPositions": [
      "LM",
      "AM"
    ],
    "roleTags": [
      "Dribbler",
      "Wide creator",
      "Carrier"
    ],
    "ratings": {
      "attack": 89,
      "creation": 91,
      "control": 88,
      "defense": 40,
      "goalkeeping": 4,
      "physical": 82,
      "press": 73,
      "bigGame": 86
    },
    "peakWindow": "1987-1997",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Liverpool left-sided attacker and late First Division star."
  },
  {
    "contextId": "souness_liverpool_1980s",
    "personId": "graeme_souness",
    "displayName": "Graeme Souness",
    "teamType": "club",
    "teamName": "Liverpool",
    "league": "English Top Flight",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "English Top Flight",
        "team": "Liverpool",
        "eraLabel": "1980s",
        "role": "impact"
      },
      {
        "competition": "European Cup",
        "team": "Liverpool",
        "eraLabel": "1980s",
        "role": "impact"
      }
    ],
    "startYear": 1978,
    "endYear": 1984,
    "decade": "1980s",
    "eraLabel": "1980s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "english_top_flight",
      "classic_european_cup"
    ],
    "positions": [
      "DM",
      "CM"
    ],
    "primaryPositions": [
      "DM"
    ],
    "secondaryPositions": [
      "CM"
    ],
    "roleTags": [
      "Ball-winner",
      "Leader",
      "Tempo setter"
    ],
    "ratings": {
      "attack": 50,
      "creation": 75,
      "control": 88,
      "defense": 90,
      "goalkeeping": 4,
      "physical": 91,
      "press": 88,
      "bigGame": 93
    },
    "peakWindow": "1978-1984",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Liverpool midfield leader in domestic and European Cup success."
  },
  {
    "contextId": "dalglish_liverpool_1980s",
    "personId": "kenny_dalglish",
    "displayName": "Kenny Dalglish",
    "teamType": "club",
    "teamName": "Liverpool",
    "league": "English Top Flight",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "English Top Flight",
        "team": "Liverpool",
        "eraLabel": "1980s",
        "role": "impact"
      },
      {
        "competition": "European Cup",
        "team": "Liverpool",
        "eraLabel": "1980s",
        "role": "impact"
      }
    ],
    "startYear": 1977,
    "endYear": 1990,
    "decade": "1980s",
    "eraLabel": "1980s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "english_top_flight",
      "classic_european_cup"
    ],
    "positions": [
      "CF",
      "ST",
      "AM"
    ],
    "primaryPositions": [
      "CF"
    ],
    "secondaryPositions": [
      "ST",
      "AM"
    ],
    "roleTags": [
      "Link forward",
      "Creator",
      "Big-game scorer"
    ],
    "ratings": {
      "attack": 93,
      "creation": 92,
      "control": 84,
      "defense": 35,
      "goalkeeping": 4,
      "physical": 86,
      "press": 73,
      "bigGame": 96
    },
    "peakWindow": "1977-1990",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Liverpool all-time forward across title and European Cup teams."
  },
  {
    "contextId": "shearer_blackburn_1990s",
    "personId": "alan_shearer",
    "displayName": "Alan Shearer",
    "teamType": "club",
    "teamName": "Blackburn",
    "league": "Premier League",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "Premier League",
        "team": "Blackburn",
        "eraLabel": "1990s",
        "role": "impact"
      }
    ],
    "startYear": 1992,
    "endYear": 1996,
    "decade": "1990s",
    "eraLabel": "1990s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "english_top_flight",
      "premier_league"
    ],
    "positions": [
      "ST"
    ],
    "primaryPositions": [
      "ST"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Box finisher",
      "Aerial threat",
      "Penalty taker"
    ],
    "ratings": {
      "attack": 97,
      "creation": 71,
      "control": 73,
      "defense": 30,
      "goalkeeping": 4,
      "physical": 88,
      "press": 68,
      "bigGame": 90
    },
    "peakWindow": "1992-1996",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Blackburn title-winning striker and Premier League scoring benchmark."
  },
  {
    "contextId": "cantona_united_1990s",
    "personId": "eric_cantona",
    "displayName": "Eric Cantona",
    "teamType": "club",
    "teamName": "Manchester United",
    "league": "Premier League",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "Premier League",
        "team": "Manchester United",
        "eraLabel": "1990s",
        "role": "impact"
      }
    ],
    "startYear": 1992,
    "endYear": 1997,
    "decade": "1990s",
    "eraLabel": "1990s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "english_top_flight",
      "premier_league"
    ],
    "positions": [
      "CF",
      "ST",
      "AM"
    ],
    "primaryPositions": [
      "CF"
    ],
    "secondaryPositions": [
      "ST",
      "AM"
    ],
    "roleTags": [
      "Second striker",
      "Creator",
      "Aura"
    ],
    "ratings": {
      "attack": 91,
      "creation": 90,
      "control": 88,
      "defense": 34,
      "goalkeeping": 4,
      "physical": 85,
      "press": 72,
      "bigGame": 91
    },
    "peakWindow": "1992-1997",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Manchester United catalyst in the early Premier League title run."
  },
  {
    "contextId": "barthez_marseille_1990s",
    "personId": "fabien_barthez",
    "displayName": "Fabien Barthez",
    "teamType": "club",
    "teamName": "Marseille",
    "league": "Ligue 1",
    "country": "France",
    "competitionContexts": [
      {
        "competition": "Ligue 1",
        "team": "Marseille",
        "eraLabel": "1990s",
        "role": "impact"
      },
      {
        "competition": "UCL",
        "team": "Marseille",
        "eraLabel": "1990s",
        "role": "impact"
      }
    ],
    "startYear": 1992,
    "endYear": 1995,
    "decade": "1990s",
    "eraLabel": "1990s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "ligue_1",
      "champions_league"
    ],
    "positions": [
      "GK"
    ],
    "primaryPositions": [
      "GK"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Sweeper keeper",
      "Shot-stopper",
      "European champion"
    ],
    "ratings": {
      "attack": 19,
      "creation": 43,
      "control": 60,
      "defense": 64,
      "goalkeeping": 94,
      "physical": 81,
      "press": 50,
      "bigGame": 92
    },
    "peakWindow": "1992-1995",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Marseille goalkeeper in the 1993 European Cup-winning side."
  },
  {
    "contextId": "lloris_lyon_2000s",
    "personId": "hugo_lloris",
    "displayName": "Hugo Lloris",
    "teamType": "club",
    "teamName": "Lyon",
    "league": "Ligue 1",
    "country": "France",
    "competitionContexts": [
      {
        "competition": "Ligue 1",
        "team": "Lyon",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 2008,
    "endYear": 2012,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "ligue_1"
    ],
    "positions": [
      "GK"
    ],
    "primaryPositions": [
      "GK"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Reflex keeper",
      "Sweeper keeper",
      "Captain"
    ],
    "ratings": {
      "attack": 18,
      "creation": 43,
      "control": 59,
      "defense": 63,
      "goalkeeping": 94,
      "physical": 80,
      "press": 49,
      "bigGame": 88
    },
    "peakWindow": "2008-2012",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Lyon and France goalkeeper reference for late-2000s Ligue 1."
  },
  {
    "contextId": "thiago_silva_psg_2010s",
    "personId": "thiago_silva",
    "displayName": "Thiago Silva",
    "teamType": "club",
    "teamName": "PSG",
    "league": "Ligue 1",
    "country": "France",
    "competitionContexts": [
      {
        "competition": "Ligue 1",
        "team": "PSG",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "UCL",
        "team": "PSG",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2012,
    "endYear": 2020,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "ligue_1",
      "champions_league"
    ],
    "positions": [
      "CB"
    ],
    "primaryPositions": [
      "CB"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Cover defender",
      "Ball-playing CB",
      "Line leader"
    ],
    "ratings": {
      "attack": 37,
      "creation": 62,
      "control": 78,
      "defense": 96,
      "goalkeeping": 4,
      "physical": 94,
      "press": 75,
      "bigGame": 90
    },
    "peakWindow": "2012-2020",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "PSG defensive leader and modern Ligue 1 benchmark center-back."
  },
  {
    "contextId": "marquinhos_psg_2010s",
    "personId": "marquinhos",
    "displayName": "Marquinhos",
    "teamType": "club",
    "teamName": "PSG",
    "league": "Ligue 1",
    "country": "France",
    "competitionContexts": [
      {
        "competition": "Ligue 1",
        "team": "PSG",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "UCL",
        "team": "PSG",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2013,
    "endYear": 2026,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "ligue_1",
      "champions_league"
    ],
    "positions": [
      "CB",
      "RB",
      "DM"
    ],
    "primaryPositions": [
      "CB"
    ],
    "secondaryPositions": [
      "RB",
      "DM"
    ],
    "roleTags": [
      "Versatile defender",
      "Recovery pace",
      "Build-up"
    ],
    "ratings": {
      "attack": 37,
      "creation": 61,
      "control": 80,
      "defense": 93,
      "goalkeeping": 4,
      "physical": 92,
      "press": 82,
      "bigGame": 86
    },
    "peakWindow": "2013-2026",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "PSG defender covering center-back, right-back, and midfield needs."
  },
  {
    "contextId": "thuram_monaco_1990s",
    "personId": "lilian_thuram",
    "displayName": "Lilian Thuram",
    "teamType": "club",
    "teamName": "Monaco",
    "league": "Ligue 1",
    "country": "France",
    "competitionContexts": [
      {
        "competition": "Ligue 1",
        "team": "Monaco",
        "eraLabel": "1990s",
        "role": "impact"
      }
    ],
    "startYear": 1991,
    "endYear": 1996,
    "decade": "1990s",
    "eraLabel": "1990s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "ligue_1"
    ],
    "positions": [
      "RB",
      "CB",
      "RWB"
    ],
    "primaryPositions": [
      "RB"
    ],
    "secondaryPositions": [
      "CB",
      "RWB"
    ],
    "roleTags": [
      "Lockdown fullback",
      "Duel winner",
      "Recovery pace"
    ],
    "ratings": {
      "attack": 58,
      "creation": 69,
      "control": 73,
      "defense": 93,
      "goalkeeping": 5,
      "physical": 88,
      "press": 82,
      "bigGame": 91
    },
    "peakWindow": "1991-1996",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Monaco version of a French defensive great."
  },
  {
    "contextId": "maxwell_psg_2010s",
    "personId": "maxwell",
    "displayName": "Maxwell",
    "teamType": "club",
    "teamName": "PSG",
    "league": "Ligue 1",
    "country": "France",
    "competitionContexts": [
      {
        "competition": "Ligue 1",
        "team": "PSG",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "UCL",
        "team": "PSG",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2012,
    "endYear": 2017,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "ligue_1",
      "champions_league"
    ],
    "positions": [
      "LB",
      "LWB"
    ],
    "primaryPositions": [
      "LB"
    ],
    "secondaryPositions": [
      "LWB"
    ],
    "roleTags": [
      "Overlap",
      "Possession fullback",
      "Wide support"
    ],
    "ratings": {
      "attack": 55,
      "creation": 78,
      "control": 80,
      "defense": 84,
      "goalkeeping": 5,
      "physical": 82,
      "press": 78,
      "bigGame": 78
    },
    "peakWindow": "2012-2017",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "PSG left-back in the club's domestic dominance era."
  },
  {
    "contextId": "juninho_lyon_2000s",
    "personId": "juninho_pernambucano",
    "displayName": "Juninho Pernambucano",
    "teamType": "club",
    "teamName": "Lyon",
    "league": "Ligue 1",
    "country": "France",
    "competitionContexts": [
      {
        "competition": "Ligue 1",
        "team": "Lyon",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "UCL",
        "team": "Lyon",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 2001,
    "endYear": 2009,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "ligue_1",
      "champions_league"
    ],
    "positions": [
      "CM",
      "AM",
      "DM"
    ],
    "primaryPositions": [
      "CM"
    ],
    "secondaryPositions": [
      "AM",
      "DM"
    ],
    "roleTags": [
      "Set pieces",
      "Tempo setter",
      "Long passing"
    ],
    "ratings": {
      "attack": 70,
      "creation": 95,
      "control": 92,
      "defense": 74,
      "goalkeeping": 4,
      "physical": 82,
      "press": 82,
      "bigGame": 90
    },
    "peakWindow": "2001-2009",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Lyon midfield icon and free-kick benchmark."
  },
  {
    "contextId": "verratti_psg_2010s",
    "personId": "marco_verratti",
    "displayName": "Marco Verratti",
    "teamType": "club",
    "teamName": "PSG",
    "league": "Ligue 1",
    "country": "France",
    "competitionContexts": [
      {
        "competition": "Ligue 1",
        "team": "PSG",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "UCL",
        "team": "PSG",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2012,
    "endYear": 2023,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "ligue_1",
      "champions_league"
    ],
    "positions": [
      "CM",
      "DM"
    ],
    "primaryPositions": [
      "CM"
    ],
    "secondaryPositions": [
      "DM"
    ],
    "roleTags": [
      "Press resistance",
      "Controller",
      "Ball-winner"
    ],
    "ratings": {
      "attack": 68,
      "creation": 88,
      "control": 94,
      "defense": 72,
      "goalkeeping": 4,
      "physical": 81,
      "press": 84,
      "bigGame": 85
    },
    "peakWindow": "2012-2023",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "PSG midfield controller through the 2010s."
  },
  {
    "contextId": "rai_psg_1990s",
    "personId": "rai",
    "displayName": "Rai",
    "teamType": "club",
    "teamName": "PSG",
    "league": "Ligue 1",
    "country": "France",
    "competitionContexts": [
      {
        "competition": "Ligue 1",
        "team": "PSG",
        "eraLabel": "1990s",
        "role": "impact"
      }
    ],
    "startYear": 1993,
    "endYear": 1998,
    "decade": "1990s",
    "eraLabel": "1990s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "ligue_1"
    ],
    "positions": [
      "AM",
      "CM"
    ],
    "primaryPositions": [
      "AM"
    ],
    "secondaryPositions": [
      "CM"
    ],
    "roleTags": [
      "Creator",
      "Late runner",
      "Captain"
    ],
    "ratings": {
      "attack": 84,
      "creation": 90,
      "control": 88,
      "defense": 43,
      "goalkeeping": 4,
      "physical": 72,
      "press": 68,
      "bigGame": 86
    },
    "peakWindow": "1993-1998",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "PSG playmaker and 1990s Ligue 1 reference."
  },
  {
    "contextId": "ginola_psg_1990s",
    "personId": "david_ginola",
    "displayName": "David Ginola",
    "teamType": "club",
    "teamName": "PSG",
    "league": "Ligue 1",
    "country": "France",
    "competitionContexts": [
      {
        "competition": "Ligue 1",
        "team": "PSG",
        "eraLabel": "1990s",
        "role": "impact"
      }
    ],
    "startYear": 1992,
    "endYear": 1995,
    "decade": "1990s",
    "eraLabel": "1990s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "ligue_1"
    ],
    "positions": [
      "LW",
      "LM",
      "AM"
    ],
    "primaryPositions": [
      "LW"
    ],
    "secondaryPositions": [
      "LM",
      "AM"
    ],
    "roleTags": [
      "Dribbler",
      "Wide creator",
      "Flair"
    ],
    "ratings": {
      "attack": 86,
      "creation": 89,
      "control": 87,
      "defense": 38,
      "goalkeeping": 4,
      "physical": 79,
      "press": 71,
      "bigGame": 83
    },
    "peakWindow": "1992-1995",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "PSG left-sided creator in the 1990s."
  },
  {
    "contextId": "di_maria_psg_2010s",
    "personId": "angel_di_maria",
    "displayName": "Angel Di Maria",
    "teamType": "club",
    "teamName": "PSG",
    "league": "Ligue 1",
    "country": "France",
    "competitionContexts": [
      {
        "competition": "Ligue 1",
        "team": "PSG",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "UCL",
        "team": "PSG",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2015,
    "endYear": 2022,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "ligue_1",
      "champions_league"
    ],
    "positions": [
      "RW",
      "RM",
      "AM",
      "LW"
    ],
    "primaryPositions": [
      "RW"
    ],
    "secondaryPositions": [
      "RM",
      "AM",
      "LW"
    ],
    "roleTags": [
      "Wide creator",
      "Final ball",
      "Transition runner"
    ],
    "ratings": {
      "attack": 88,
      "creation": 92,
      "control": 83,
      "defense": 39,
      "goalkeeping": 4,
      "physical": 81,
      "press": 72,
      "bigGame": 90
    },
    "peakWindow": "2015-2022",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "PSG creator and Champions League finalist."
  },
  {
    "contextId": "mbappe_psg_2020s",
    "personId": "kylian_mbappe",
    "displayName": "Kylian Mbappe",
    "teamType": "club",
    "teamName": "PSG",
    "league": "Ligue 1",
    "country": "France",
    "competitionContexts": [
      {
        "competition": "Ligue 1",
        "team": "PSG",
        "eraLabel": "2020s",
        "role": "impact"
      },
      {
        "competition": "UCL",
        "team": "PSG",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2017,
    "endYear": 2024,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "ligue_1",
      "champions_league"
    ],
    "positions": [
      "ST",
      "LW",
      "RW"
    ],
    "primaryPositions": [
      "ST"
    ],
    "secondaryPositions": [
      "LW",
      "RW"
    ],
    "roleTags": [
      "Elite scorer",
      "Transition runner",
      "Wide threat"
    ],
    "ratings": {
      "attack": 99,
      "creation": 72,
      "control": 74,
      "defense": 31,
      "goalkeeping": 4,
      "physical": 92,
      "press": 70,
      "bigGame": 93
    },
    "peakWindow": "2017-2024",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "PSG attacking reference and France superstar."
  },
  {
    "contextId": "ibrahimovic_psg_2010s",
    "personId": "zlatan_ibrahimovic",
    "displayName": "Zlatan Ibrahimovic",
    "teamType": "club",
    "teamName": "PSG",
    "league": "Ligue 1",
    "country": "France",
    "competitionContexts": [
      {
        "competition": "Ligue 1",
        "team": "PSG",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "UCL",
        "team": "PSG",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2012,
    "endYear": 2016,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "ligue_1",
      "champions_league"
    ],
    "positions": [
      "ST",
      "CF"
    ],
    "primaryPositions": [
      "ST"
    ],
    "secondaryPositions": [
      "CF"
    ],
    "roleTags": [
      "Complete striker",
      "Aerial threat",
      "Creator"
    ],
    "ratings": {
      "attack": 96,
      "creation": 82,
      "control": 73,
      "defense": 30,
      "goalkeeping": 4,
      "physical": 90,
      "press": 68,
      "bigGame": 90
    },
    "peakWindow": "2012-2016",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "PSG scoring and chance-creation hub."
  },
  {
    "contextId": "papin_marseille_1990s",
    "personId": "jean_pierre_papin",
    "displayName": "Jean-Pierre Papin",
    "teamType": "club",
    "teamName": "Marseille",
    "league": "Ligue 1",
    "country": "France",
    "competitionContexts": [
      {
        "competition": "Ligue 1",
        "team": "Marseille",
        "eraLabel": "1990s",
        "role": "impact"
      },
      {
        "competition": "European Cup",
        "team": "Marseille",
        "eraLabel": "1990s",
        "role": "impact"
      }
    ],
    "startYear": 1986,
    "endYear": 1992,
    "decade": "1990s",
    "eraLabel": "1990s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "ligue_1",
      "classic_european_cup"
    ],
    "positions": [
      "ST"
    ],
    "primaryPositions": [
      "ST"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Box finisher",
      "Volley specialist",
      "European scorer"
    ],
    "ratings": {
      "attack": 96,
      "creation": 70,
      "control": 72,
      "defense": 30,
      "goalkeeping": 4,
      "physical": 89,
      "press": 68,
      "bigGame": 91
    },
    "peakWindow": "1986-1992",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Marseille striker and early-1990s Ligue 1 scoring icon."
  },
  {
    "contextId": "howard_colorado_2010s",
    "personId": "tim_howard",
    "displayName": "Tim Howard",
    "teamType": "club",
    "teamName": "Colorado Rapids",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Colorado Rapids",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2016,
    "endYear": 2019,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "mls"
    ],
    "positions": [
      "GK"
    ],
    "primaryPositions": [
      "GK"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Shot-stopper",
      "Box command",
      "Veteran"
    ],
    "ratings": {
      "attack": 18,
      "creation": 41,
      "control": 57,
      "defense": 61,
      "goalkeeping": 90,
      "physical": 76,
      "press": 47,
      "bigGame": 86
    },
    "peakWindow": "2016-2019",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "USMNT goalkeeper context for MLS mode."
  },
  {
    "contextId": "guzan_atlanta_2010s",
    "personId": "brad_guzan",
    "displayName": "Brad Guzan",
    "teamType": "club",
    "teamName": "Atlanta United",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Atlanta United",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2017,
    "endYear": 2026,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "mls"
    ],
    "positions": [
      "GK"
    ],
    "primaryPositions": [
      "GK"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Shot-stopper",
      "Organizer",
      "MLS Cup keeper"
    ],
    "ratings": {
      "attack": 17,
      "creation": 40,
      "control": 55,
      "defense": 59,
      "goalkeeping": 88,
      "physical": 74,
      "press": 46,
      "bigGame": 86
    },
    "peakWindow": "2017-2026",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Atlanta United goalkeeper and MLS Cup winner."
  },
  {
    "contextId": "zimmerman_nashville_2020s",
    "personId": "walker_zimmerman",
    "displayName": "Walker Zimmerman",
    "teamType": "club",
    "teamName": "Nashville SC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Nashville SC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2020,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "mls"
    ],
    "positions": [
      "CB"
    ],
    "primaryPositions": [
      "CB"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Aerial defender",
      "Duel winner",
      "Line leader"
    ],
    "ratings": {
      "attack": 33,
      "creation": 55,
      "control": 63,
      "defense": 87,
      "goalkeeping": 4,
      "physical": 86,
      "press": 67,
      "bigGame": 78
    },
    "peakWindow": "2020-2026",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "MLS defender of the year level center-back."
  },
  {
    "contextId": "marshall_columbus_2010s",
    "personId": "chad_marshall",
    "displayName": "Chad Marshall",
    "teamType": "club",
    "teamName": "Columbus Crew",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Columbus Crew",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2004,
    "endYear": 2013,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "mls"
    ],
    "positions": [
      "CB"
    ],
    "primaryPositions": [
      "CB"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Box defender",
      "Aerial control",
      "Consistency"
    ],
    "ratings": {
      "attack": 33,
      "creation": 55,
      "control": 63,
      "defense": 87,
      "goalkeeping": 4,
      "physical": 85,
      "press": 67,
      "bigGame": 78
    },
    "peakWindow": "2004-2013",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "MLS center-back benchmark across Columbus and Seattle years."
  },
  {
    "contextId": "beasley_houston_2010s",
    "personId": "damarcus_beasley",
    "displayName": "DaMarcus Beasley",
    "teamType": "club",
    "teamName": "Houston Dynamo",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Houston Dynamo",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2014,
    "endYear": 2019,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "mls"
    ],
    "positions": [
      "LB",
      "LWB",
      "LM",
      "LW"
    ],
    "primaryPositions": [
      "LB"
    ],
    "secondaryPositions": [
      "LWB",
      "LM",
      "LW"
    ],
    "roleTags": [
      "Two-way left side",
      "Recovery pace",
      "Wide runner"
    ],
    "ratings": {
      "attack": 53,
      "creation": 78,
      "control": 67,
      "defense": 82,
      "goalkeeping": 5,
      "physical": 86,
      "press": 74,
      "bigGame": 74
    },
    "peakWindow": "2014-2019",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Veteran left-sided MLS and USMNT option."
  },
  {
    "contextId": "yedlin_seattle_2010s",
    "personId": "deandre_yedlin",
    "displayName": "DeAndre Yedlin",
    "teamType": "club",
    "teamName": "Seattle Sounders",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Seattle Sounders",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2013,
    "endYear": 2014,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "mls"
    ],
    "positions": [
      "RB",
      "RWB",
      "RM"
    ],
    "primaryPositions": [
      "RB"
    ],
    "secondaryPositions": [
      "RWB",
      "RM"
    ],
    "roleTags": [
      "Recovery pace",
      "Overlap",
      "Transition runner"
    ],
    "ratings": {
      "attack": 52,
      "creation": 62,
      "control": 66,
      "defense": 80,
      "goalkeeping": 5,
      "physical": 88,
      "press": 82,
      "bigGame": 74
    },
    "peakWindow": "2013-2014",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Seattle right-back and USMNT wide defender."
  },
  {
    "contextId": "zusi_sporting_kc_2010s",
    "personId": "graham_zusi",
    "displayName": "Graham Zusi",
    "teamType": "club",
    "teamName": "Sporting KC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Sporting KC",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2009,
    "endYear": 2023,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "mls"
    ],
    "positions": [
      "RB",
      "RWB",
      "RM",
      "CM"
    ],
    "primaryPositions": [
      "RM"
    ],
    "secondaryPositions": [
      "RB",
      "RWB",
      "CM"
    ],
    "roleTags": [
      "Crossing",
      "Set pieces",
      "Wide utility"
    ],
    "ratings": {
      "attack": 70,
      "creation": 86,
      "control": 73,
      "defense": 53,
      "goalkeeping": 4,
      "physical": 74,
      "press": 78,
      "bigGame": 84
    },
    "peakWindow": "2009-2023",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Sporting KC wide creator and converted fullback."
  },
  {
    "contextId": "bradley_toronto_2010s",
    "personId": "michael_bradley",
    "displayName": "Michael Bradley",
    "teamType": "club",
    "teamName": "Toronto FC",
    "league": "MLS",
    "country": "Canada",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Toronto FC",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2014,
    "endYear": 2023,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "mls"
    ],
    "positions": [
      "DM",
      "CM"
    ],
    "primaryPositions": [
      "DM"
    ],
    "secondaryPositions": [
      "CM"
    ],
    "roleTags": [
      "Controller",
      "Ball-winner",
      "Organizer"
    ],
    "ratings": {
      "attack": 47,
      "creation": 70,
      "control": 86,
      "defense": 82,
      "goalkeeping": 4,
      "physical": 80,
      "press": 82,
      "bigGame": 80
    },
    "peakWindow": "2014-2023",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Toronto FC captain and MLS Cup-winning midfield anchor."
  },
  {
    "contextId": "valderrama_tampa_bay_1990s",
    "personId": "carlos_valderrama",
    "displayName": "Carlos Valderrama",
    "teamType": "club",
    "teamName": "Tampa Bay Mutiny",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Tampa Bay Mutiny",
        "eraLabel": "1990s",
        "role": "impact"
      }
    ],
    "startYear": 1996,
    "endYear": 1997,
    "decade": "1990s",
    "eraLabel": "1990s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "mls"
    ],
    "positions": [
      "AM",
      "CM"
    ],
    "primaryPositions": [
      "AM"
    ],
    "secondaryPositions": [
      "CM"
    ],
    "roleTags": [
      "Creator",
      "Tempo setter",
      "Final ball"
    ],
    "ratings": {
      "attack": 78,
      "creation": 92,
      "control": 90,
      "defense": 42,
      "goalkeeping": 4,
      "physical": 62,
      "press": 66,
      "bigGame": 84
    },
    "peakWindow": "1996-1997",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Early MLS playmaking icon."
  },
  {
    "contextId": "beckham_la_galaxy_2010s",
    "personId": "david_beckham",
    "displayName": "David Beckham",
    "teamType": "club",
    "teamName": "LA Galaxy",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "LA Galaxy",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2007,
    "endYear": 2012,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "mls"
    ],
    "positions": [
      "RM",
      "CM",
      "RW"
    ],
    "primaryPositions": [
      "RM"
    ],
    "secondaryPositions": [
      "CM",
      "RW"
    ],
    "roleTags": [
      "Crossing",
      "Set pieces",
      "Tempo changer"
    ],
    "ratings": {
      "attack": 71,
      "creation": 90,
      "control": 84,
      "defense": 54,
      "goalkeeping": 4,
      "physical": 76,
      "press": 70,
      "bigGame": 86
    },
    "peakWindow": "2007-2012",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "LA Galaxy star and MLS Cup winner."
  },
  {
    "contextId": "donovan_la_galaxy_2000s",
    "personId": "landon_donovan",
    "displayName": "Landon Donovan",
    "teamType": "club",
    "teamName": "LA Galaxy",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "LA Galaxy",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 2005,
    "endYear": 2014,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "mls"
    ],
    "positions": [
      "RW",
      "AM",
      "CF",
      "ST"
    ],
    "primaryPositions": [
      "RW"
    ],
    "secondaryPositions": [
      "AM",
      "CF",
      "ST"
    ],
    "roleTags": [
      "Transition runner",
      "Creator",
      "Clutch scorer"
    ],
    "ratings": {
      "attack": 88,
      "creation": 87,
      "control": 81,
      "defense": 38,
      "goalkeeping": 4,
      "physical": 79,
      "press": 71,
      "bigGame": 90
    },
    "peakWindow": "2005-2014",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "MLS attacking icon and LA Galaxy winner."
  },
  {
    "contextId": "vela_lafc_2010s",
    "personId": "carlos_vela",
    "displayName": "Carlos Vela",
    "teamType": "club",
    "teamName": "LAFC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "LAFC",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2018,
    "endYear": 2024,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "mls"
    ],
    "positions": [
      "RW",
      "CF",
      "ST"
    ],
    "primaryPositions": [
      "RW"
    ],
    "secondaryPositions": [
      "CF",
      "ST"
    ],
    "roleTags": [
      "Wide scorer",
      "Creator",
      "Record-setter"
    ],
    "ratings": {
      "attack": 90,
      "creation": 87,
      "control": 86,
      "defense": 38,
      "goalkeeping": 4,
      "physical": 78,
      "press": 70,
      "bigGame": 82
    },
    "peakWindow": "2018-2024",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "LAFC MVP-level attacker."
  },
  {
    "contextId": "messi_inter_miami_2020s",
    "personId": "lionel_messi",
    "displayName": "Lionel Messi",
    "teamType": "club",
    "teamName": "Inter Miami",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Inter Miami",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2023,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "mls"
    ],
    "positions": [
      "RW",
      "AM",
      "CF"
    ],
    "primaryPositions": [
      "RW"
    ],
    "secondaryPositions": [
      "AM",
      "CF"
    ],
    "roleTags": [
      "Creator",
      "Elite scorer",
      "Set pieces"
    ],
    "ratings": {
      "attack": 91,
      "creation": 94,
      "control": 91,
      "defense": 39,
      "goalkeeping": 4,
      "physical": 81,
      "press": 72,
      "bigGame": 91
    },
    "peakWindow": "2023-2026",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Inter Miami version used for MLS mode context."
  },
  {
    "contextId": "josef_martinez_atlanta_2010s",
    "personId": "josef_martinez",
    "displayName": "Josef Martinez",
    "teamType": "club",
    "teamName": "Atlanta United",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Atlanta United",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2017,
    "endYear": 2022,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "mls"
    ],
    "positions": [
      "ST"
    ],
    "primaryPositions": [
      "ST"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Box finisher",
      "Pressing striker",
      "Record scorer"
    ],
    "ratings": {
      "attack": 90,
      "creation": 65,
      "control": 67,
      "defense": 28,
      "goalkeeping": 4,
      "physical": 83,
      "press": 76,
      "bigGame": 88
    },
    "peakWindow": "2017-2022",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Atlanta United MLS Cup striker and scoring record threat."
  },
  {
    "contextId": "robbie_keane_la_galaxy_2010s",
    "personId": "robbie_keane",
    "displayName": "Robbie Keane",
    "teamType": "club",
    "teamName": "LA Galaxy",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "LA Galaxy",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2011,
    "endYear": 2016,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "mls"
    ],
    "positions": [
      "ST",
      "CF"
    ],
    "primaryPositions": [
      "ST"
    ],
    "secondaryPositions": [
      "CF"
    ],
    "roleTags": [
      "Box finisher",
      "Link forward",
      "Big-game scorer"
    ],
    "ratings": {
      "attack": 89,
      "creation": 75,
      "control": 67,
      "defense": 28,
      "goalkeeping": 4,
      "physical": 83,
      "press": 63,
      "bigGame": 88
    },
    "peakWindow": "2011-2016",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "LA Galaxy striker and MLS Cup winner."
  },
  {
    "contextId": "schmeichel_denmark_1990s",
    "personId": "peter_schmeichel",
    "displayName": "Peter Schmeichel",
    "teamType": "nation",
    "teamName": "Denmark",
    "country": "Denmark",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "Denmark",
        "eraLabel": "1990s",
        "role": "impact"
      }
    ],
    "startYear": 1987,
    "endYear": 2001,
    "decade": "1990s",
    "eraLabel": "1990s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros"
    ],
    "positions": [
      "GK"
    ],
    "primaryPositions": [
      "GK"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Shot-stopper",
      "Box commander",
      "Tournament keeper"
    ],
    "ratings": {
      "attack": 19,
      "creation": 45,
      "control": 63,
      "defense": 67,
      "goalkeeping": 98,
      "physical": 84,
      "press": 52,
      "bigGame": 96
    },
    "peakWindow": "1987-2001",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Denmark 1992 European Championship-winning goalkeeper."
  },
  {
    "contextId": "casillas_spain_2010s",
    "personId": "iker_casillas",
    "displayName": "Iker Casillas",
    "teamType": "nation",
    "teamName": "Spain",
    "country": "Spain",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "Spain",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Spain",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2000,
    "endYear": 2016,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros",
      "world_cup"
    ],
    "positions": [
      "GK"
    ],
    "primaryPositions": [
      "GK"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Shot-stopper",
      "Captain",
      "Tournament keeper"
    ],
    "ratings": {
      "attack": 19,
      "creation": 45,
      "control": 63,
      "defense": 67,
      "goalkeeping": 98,
      "physical": 84,
      "press": 52,
      "bigGame": 97
    },
    "peakWindow": "2000-2016",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Spain captain across Euro 2008, World Cup 2010, and Euro 2012."
  },
  {
    "contextId": "ramos_spain_2010s",
    "personId": "sergio_ramos",
    "displayName": "Sergio Ramos",
    "teamType": "nation",
    "teamName": "Spain",
    "country": "Spain",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "Spain",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Spain",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2005,
    "endYear": 2021,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros",
      "world_cup"
    ],
    "positions": [
      "CB",
      "RB"
    ],
    "primaryPositions": [
      "CB"
    ],
    "secondaryPositions": [
      "RB"
    ],
    "roleTags": [
      "Stopper",
      "Aerial threat",
      "Tournament defender"
    ],
    "ratings": {
      "attack": 37,
      "creation": 62,
      "control": 71,
      "defense": 94,
      "goalkeeping": 4,
      "physical": 88,
      "press": 75,
      "bigGame": 96
    },
    "peakWindow": "2005-2021",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Spain defender during the 2008-2012 international dynasty."
  },
  {
    "contextId": "chiellini_italy_2020s",
    "personId": "giorgio_chiellini",
    "displayName": "Giorgio Chiellini",
    "teamType": "nation",
    "teamName": "Italy",
    "country": "Italy",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "Italy",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2004,
    "endYear": 2022,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros"
    ],
    "positions": [
      "CB"
    ],
    "primaryPositions": [
      "CB"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Stopper",
      "Leader",
      "Duel winner"
    ],
    "ratings": {
      "attack": 37,
      "creation": 61,
      "control": 70,
      "defense": 96,
      "goalkeeping": 4,
      "physical": 88,
      "press": 74,
      "bigGame": 95
    },
    "peakWindow": "2004-2022",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Italy Euro 2020 defensive leader."
  },
  {
    "contextId": "alba_spain_2010s",
    "personId": "jordi_alba",
    "displayName": "Jordi Alba",
    "teamType": "nation",
    "teamName": "Spain",
    "country": "Spain",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "Spain",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Spain",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2011,
    "endYear": 2023,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros",
      "world_cup"
    ],
    "positions": [
      "LB",
      "LWB",
      "LM"
    ],
    "primaryPositions": [
      "LB"
    ],
    "secondaryPositions": [
      "LWB",
      "LM"
    ],
    "roleTags": [
      "Overlap",
      "Cutback provider",
      "Recovery pace"
    ],
    "ratings": {
      "attack": 68,
      "creation": 84,
      "control": 72,
      "defense": 82,
      "goalkeeping": 5,
      "physical": 88,
      "press": 81,
      "bigGame": 81
    },
    "peakWindow": "2011-2023",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Spain left-back and Euro 2012 final scorer."
  },
  {
    "contextId": "lahm_germany_2010s",
    "personId": "philipp_lahm",
    "displayName": "Philipp Lahm",
    "teamType": "nation",
    "teamName": "Germany",
    "country": "Germany",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "Germany",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Germany",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2004,
    "endYear": 2014,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros",
      "world_cup"
    ],
    "positions": [
      "RB",
      "LB",
      "DM"
    ],
    "primaryPositions": [
      "RB"
    ],
    "secondaryPositions": [
      "LB",
      "DM"
    ],
    "roleTags": [
      "Inverted fullback",
      "Controller",
      "Defensive IQ"
    ],
    "ratings": {
      "attack": 59,
      "creation": 71,
      "control": 90,
      "defense": 92,
      "goalkeeping": 5,
      "physical": 88,
      "press": 83,
      "bigGame": 94
    },
    "peakWindow": "2004-2014",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Germany captain and tournament fullback reference."
  },
  {
    "contextId": "busquets_spain_2010s",
    "personId": "sergio_busquets",
    "displayName": "Sergio Busquets",
    "teamType": "nation",
    "teamName": "Spain",
    "country": "Spain",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "Spain",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Spain",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2009,
    "endYear": 2022,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros",
      "world_cup"
    ],
    "positions": [
      "DM",
      "CM"
    ],
    "primaryPositions": [
      "DM"
    ],
    "secondaryPositions": [
      "CM"
    ],
    "roleTags": [
      "Controller",
      "Press resistance",
      "Screen"
    ],
    "ratings": {
      "attack": 52,
      "creation": 78,
      "control": 98,
      "defense": 88,
      "goalkeeping": 4,
      "physical": 89,
      "press": 86,
      "bigGame": 94
    },
    "peakWindow": "2009-2022",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Spain pivot during the 2010 and 2012 trophy run."
  },
  {
    "contextId": "modric_croatia_2010s",
    "personId": "luka_modric",
    "displayName": "Luka Modric",
    "teamType": "nation",
    "teamName": "Croatia",
    "country": "Croatia",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "Croatia",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Croatia",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2006,
    "endYear": 2026,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros",
      "world_cup"
    ],
    "positions": [
      "CM",
      "AM"
    ],
    "primaryPositions": [
      "CM"
    ],
    "secondaryPositions": [
      "AM"
    ],
    "roleTags": [
      "Controller",
      "Carrier",
      "Big-game passer"
    ],
    "ratings": {
      "attack": 72,
      "creation": 94,
      "control": 97,
      "defense": 76,
      "goalkeeping": 4,
      "physical": 85,
      "press": 85,
      "bigGame": 96
    },
    "peakWindow": "2006-2026",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Croatia midfield leader across major tournaments."
  },
  {
    "contextId": "platini_france_1980s",
    "personId": "michel_platini",
    "displayName": "Michel Platini",
    "teamType": "nation",
    "teamName": "France",
    "country": "France",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "France",
        "eraLabel": "1980s",
        "role": "impact"
      }
    ],
    "startYear": 1976,
    "endYear": 1987,
    "decade": "1980s",
    "eraLabel": "1980s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros"
    ],
    "positions": [
      "AM",
      "CM"
    ],
    "primaryPositions": [
      "AM"
    ],
    "secondaryPositions": [
      "CM"
    ],
    "roleTags": [
      "Creator",
      "Scoring midfielder",
      "Set pieces"
    ],
    "ratings": {
      "attack": 94,
      "creation": 98,
      "control": 95,
      "defense": 46,
      "goalkeeping": 4,
      "physical": 77,
      "press": 73,
      "bigGame": 98
    },
    "peakWindow": "1976-1987",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "France Euro 1984 tournament-defining creator."
  },
  {
    "contextId": "figo_portugal_2000s",
    "personId": "luis_figo",
    "displayName": "Luis Figo",
    "teamType": "nation",
    "teamName": "Portugal",
    "country": "Portugal",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "Portugal",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Portugal",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 1991,
    "endYear": 2006,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros",
      "world_cup"
    ],
    "positions": [
      "RW",
      "RM",
      "AM"
    ],
    "primaryPositions": [
      "RW"
    ],
    "secondaryPositions": [
      "RM",
      "AM"
    ],
    "roleTags": [
      "Wide creator",
      "Dribbler",
      "Final ball"
    ],
    "ratings": {
      "attack": 90,
      "creation": 95,
      "control": 92,
      "defense": 41,
      "goalkeeping": 4,
      "physical": 83,
      "press": 75,
      "bigGame": 92
    },
    "peakWindow": "1991-2006",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Portugal Golden Generation wide creator."
  },
  {
    "contextId": "ronaldo_portugal_2010s",
    "personId": "cristiano_ronaldo",
    "displayName": "Cristiano Ronaldo",
    "teamType": "nation",
    "teamName": "Portugal",
    "country": "Portugal",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "Portugal",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Portugal",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2003,
    "endYear": 2026,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros",
      "world_cup"
    ],
    "positions": [
      "LW",
      "ST",
      "CF"
    ],
    "primaryPositions": [
      "LW"
    ],
    "secondaryPositions": [
      "ST",
      "CF"
    ],
    "roleTags": [
      "Elite scorer",
      "Aerial threat",
      "Tournament leader"
    ],
    "ratings": {
      "attack": 100,
      "creation": 93,
      "control": 88,
      "defense": 42,
      "goalkeeping": 4,
      "physical": 92,
      "press": 77,
      "bigGame": 98
    },
    "peakWindow": "2003-2026",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Portugal captain and Euro 2016-winning talisman."
  },
  {
    "contextId": "van_basten_netherlands_1980s",
    "personId": "marco_van_basten",
    "displayName": "Marco van Basten",
    "teamType": "nation",
    "teamName": "Netherlands",
    "country": "Netherlands",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "Netherlands",
        "eraLabel": "1980s",
        "role": "impact"
      }
    ],
    "startYear": 1983,
    "endYear": 1992,
    "decade": "1980s",
    "eraLabel": "1980s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros"
    ],
    "positions": [
      "ST",
      "CF"
    ],
    "primaryPositions": [
      "ST"
    ],
    "secondaryPositions": [
      "CF"
    ],
    "roleTags": [
      "Complete striker",
      "Volley specialist",
      "Tournament finisher"
    ],
    "ratings": {
      "attack": 98,
      "creation": 72,
      "control": 74,
      "defense": 31,
      "goalkeeping": 4,
      "physical": 92,
      "press": 70,
      "bigGame": 97
    },
    "peakWindow": "1983-1992",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Netherlands Euro 1988 striker."
  },
  {
    "contextId": "fillol_argentina_1970s",
    "personId": "ubaldo_fillol",
    "displayName": "Ubaldo Fillol",
    "teamType": "nation",
    "teamName": "Argentina",
    "country": "Argentina",
    "competitionContexts": [
      {
        "competition": "Copa America",
        "team": "Argentina",
        "eraLabel": "1970s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Argentina",
        "eraLabel": "1970s",
        "role": "impact"
      }
    ],
    "startYear": 1974,
    "endYear": 1985,
    "decade": "1970s",
    "eraLabel": "1970s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "copa_america",
      "world_cup"
    ],
    "positions": [
      "GK"
    ],
    "primaryPositions": [
      "GK"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Shot-stopper",
      "Tournament keeper",
      "Reflexes"
    ],
    "ratings": {
      "attack": 19,
      "creation": 44,
      "control": 61,
      "defense": 65,
      "goalkeeping": 96,
      "physical": 82,
      "press": 50,
      "bigGame": 93
    },
    "peakWindow": "1974-1985",
    "dataConfidence": "Legend estimate",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Argentina 1978 World Cup-winning goalkeeper."
  },
  {
    "contextId": "chilavert_paraguay_1990s",
    "personId": "jose_luis_chilavert",
    "displayName": "Jose Luis Chilavert",
    "teamType": "nation",
    "teamName": "Paraguay",
    "country": "Paraguay",
    "competitionContexts": [
      {
        "competition": "Copa America",
        "team": "Paraguay",
        "eraLabel": "1990s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Paraguay",
        "eraLabel": "1990s",
        "role": "impact"
      }
    ],
    "startYear": 1989,
    "endYear": 2003,
    "decade": "1990s",
    "eraLabel": "1990s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "copa_america",
      "world_cup"
    ],
    "positions": [
      "GK"
    ],
    "primaryPositions": [
      "GK"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Shot-stopper",
      "Set pieces",
      "Leader"
    ],
    "ratings": {
      "attack": 19,
      "creation": 58,
      "control": 60,
      "defense": 64,
      "goalkeeping": 94,
      "physical": 81,
      "press": 50,
      "bigGame": 91
    },
    "peakWindow": "1989-2003",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Paraguay goalkeeper and set-piece specialist."
  },
  {
    "contextId": "roberto_carlos_brazil_2000s",
    "personId": "roberto_carlos",
    "displayName": "Roberto Carlos",
    "teamType": "nation",
    "teamName": "Brazil",
    "country": "Brazil",
    "competitionContexts": [
      {
        "competition": "Copa America",
        "team": "Brazil",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Brazil",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 1992,
    "endYear": 2006,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "copa_america",
      "world_cup"
    ],
    "positions": [
      "LB",
      "LWB",
      "LM"
    ],
    "primaryPositions": [
      "LB"
    ],
    "secondaryPositions": [
      "LWB",
      "LM"
    ],
    "roleTags": [
      "Attacking fullback",
      "Set pieces",
      "Power runner"
    ],
    "ratings": {
      "attack": 76,
      "creation": 71,
      "control": 75,
      "defense": 88,
      "goalkeeping": 5,
      "physical": 94,
      "press": 83,
      "bigGame": 94
    },
    "peakWindow": "1992-2006",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Brazil left-back and World Cup winner."
  },
  {
    "contextId": "cafu_brazil_2000s",
    "personId": "cafu",
    "displayName": "Cafu",
    "teamType": "nation",
    "teamName": "Brazil",
    "country": "Brazil",
    "competitionContexts": [
      {
        "competition": "Copa America",
        "team": "Brazil",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Brazil",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 1990,
    "endYear": 2006,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "copa_america",
      "world_cup"
    ],
    "positions": [
      "RB",
      "RWB",
      "RM"
    ],
    "primaryPositions": [
      "RB"
    ],
    "secondaryPositions": [
      "RWB",
      "RM"
    ],
    "roleTags": [
      "Two-way fullback",
      "Overlap",
      "Captain"
    ],
    "ratings": {
      "attack": 59,
      "creation": 82,
      "control": 75,
      "defense": 88,
      "goalkeeping": 5,
      "physical": 91,
      "press": 83,
      "bigGame": 95
    },
    "peakWindow": "1990-2006",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Brazil captain and right-back benchmark."
  },
  {
    "contextId": "figueroa_chile_1970s",
    "personId": "elias_figueroa",
    "displayName": "Elias Figueroa",
    "teamType": "nation",
    "teamName": "Chile",
    "country": "Chile",
    "competitionContexts": [
      {
        "competition": "Copa America",
        "team": "Chile",
        "eraLabel": "1970s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Chile",
        "eraLabel": "1970s",
        "role": "impact"
      }
    ],
    "startYear": 1966,
    "endYear": 1982,
    "decade": "1970s",
    "eraLabel": "1970s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "copa_america",
      "world_cup"
    ],
    "positions": [
      "CB"
    ],
    "primaryPositions": [
      "CB"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Libero",
      "Aerial defender",
      "Line leader"
    ],
    "ratings": {
      "attack": 37,
      "creation": 61,
      "control": 80,
      "defense": 96,
      "goalkeeping": 4,
      "physical": 93,
      "press": 74,
      "bigGame": 93
    },
    "peakWindow": "1966-1982",
    "dataConfidence": "Legend estimate",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Chile and South American defensive great."
  },
  {
    "contextId": "godin_uruguay_2010s",
    "personId": "diego_godin",
    "displayName": "Diego Godin",
    "teamType": "nation",
    "teamName": "Uruguay",
    "country": "Uruguay",
    "competitionContexts": [
      {
        "competition": "Copa America",
        "team": "Uruguay",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Uruguay",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2005,
    "endYear": 2022,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "copa_america",
      "world_cup"
    ],
    "positions": [
      "CB"
    ],
    "primaryPositions": [
      "CB"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Box defender",
      "Aerial threat",
      "Leader"
    ],
    "ratings": {
      "attack": 37,
      "creation": 61,
      "control": 69,
      "defense": 94,
      "goalkeeping": 4,
      "physical": 88,
      "press": 73,
      "bigGame": 91
    },
    "peakWindow": "2005-2022",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Uruguay captain and Copa America winner."
  },
  {
    "contextId": "mascherano_argentina_2010s",
    "personId": "javier_mascherano",
    "displayName": "Javier Mascherano",
    "teamType": "nation",
    "teamName": "Argentina",
    "country": "Argentina",
    "competitionContexts": [
      {
        "competition": "Copa America",
        "team": "Argentina",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Argentina",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2003,
    "endYear": 2018,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "copa_america",
      "world_cup"
    ],
    "positions": [
      "DM",
      "CB",
      "CM"
    ],
    "primaryPositions": [
      "DM"
    ],
    "secondaryPositions": [
      "CB",
      "CM"
    ],
    "roleTags": [
      "Ball-winner",
      "Screen",
      "Tournament tackler"
    ],
    "ratings": {
      "attack": 50,
      "creation": 75,
      "control": 84,
      "defense": 91,
      "goalkeeping": 4,
      "physical": 86,
      "press": 90,
      "bigGame": 93
    },
    "peakWindow": "2003-2018",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Argentina midfield and defensive anchor."
  },
  {
    "contextId": "riquelme_argentina_2000s",
    "personId": "juan_roman_riquelme",
    "displayName": "Juan Roman Riquelme",
    "teamType": "nation",
    "teamName": "Argentina",
    "country": "Argentina",
    "competitionContexts": [
      {
        "competition": "Copa America",
        "team": "Argentina",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Argentina",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 1997,
    "endYear": 2008,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "copa_america",
      "world_cup"
    ],
    "positions": [
      "AM",
      "CM"
    ],
    "primaryPositions": [
      "AM"
    ],
    "secondaryPositions": [
      "CM"
    ],
    "roleTags": [
      "Creator",
      "Tempo setter",
      "Set pieces"
    ],
    "ratings": {
      "attack": 83,
      "creation": 97,
      "control": 94,
      "defense": 45,
      "goalkeeping": 4,
      "physical": 62,
      "press": 71,
      "bigGame": 91
    },
    "peakWindow": "1997-2008",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Argentina playmaker and Copa America-era creator."
  },
  {
    "contextId": "zico_brazil_1980s",
    "personId": "zico",
    "displayName": "Zico",
    "teamType": "nation",
    "teamName": "Brazil",
    "country": "Brazil",
    "competitionContexts": [
      {
        "competition": "Copa America",
        "team": "Brazil",
        "eraLabel": "1980s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Brazil",
        "eraLabel": "1980s",
        "role": "impact"
      }
    ],
    "startYear": 1976,
    "endYear": 1986,
    "decade": "1980s",
    "eraLabel": "1980s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "copa_america",
      "world_cup"
    ],
    "positions": [
      "AM",
      "CM"
    ],
    "primaryPositions": [
      "AM"
    ],
    "secondaryPositions": [
      "CM"
    ],
    "roleTags": [
      "Creator",
      "Scoring midfielder",
      "Set pieces"
    ],
    "ratings": {
      "attack": 92,
      "creation": 98,
      "control": 95,
      "defense": 46,
      "goalkeeping": 4,
      "physical": 76,
      "press": 72,
      "bigGame": 93
    },
    "peakWindow": "1976-1986",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Brazil playmaker and South American attacking icon."
  },
  {
    "contextId": "messi_argentina_2020s",
    "personId": "lionel_messi",
    "displayName": "Lionel Messi",
    "teamType": "nation",
    "teamName": "Argentina",
    "country": "Argentina",
    "competitionContexts": [
      {
        "competition": "Copa America",
        "team": "Argentina",
        "eraLabel": "2020s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Argentina",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2005,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "copa_america",
      "world_cup"
    ],
    "positions": [
      "RW",
      "AM",
      "CF"
    ],
    "primaryPositions": [
      "RW"
    ],
    "secondaryPositions": [
      "AM",
      "CF"
    ],
    "roleTags": [
      "Creator",
      "Elite scorer",
      "Tournament carry"
    ],
    "ratings": {
      "attack": 99,
      "creation": 100,
      "control": 98,
      "defense": 43,
      "goalkeeping": 5,
      "physical": 88,
      "press": 79,
      "bigGame": 100
    },
    "peakWindow": "2005-2026",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Argentina Copa America and World Cup-winning version."
  },
  {
    "contextId": "neymar_brazil_2010s",
    "personId": "neymar",
    "displayName": "Neymar",
    "teamType": "nation",
    "teamName": "Brazil",
    "country": "Brazil",
    "competitionContexts": [
      {
        "competition": "Copa America",
        "team": "Brazil",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Brazil",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2010,
    "endYear": 2026,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "copa_america",
      "world_cup"
    ],
    "positions": [
      "LW",
      "AM",
      "CF"
    ],
    "primaryPositions": [
      "LW"
    ],
    "secondaryPositions": [
      "AM",
      "CF"
    ],
    "roleTags": [
      "Dribbler",
      "Creator",
      "Wide scorer"
    ],
    "ratings": {
      "attack": 94,
      "creation": 96,
      "control": 94,
      "defense": 41,
      "goalkeeping": 4,
      "physical": 84,
      "press": 76,
      "bigGame": 92
    },
    "peakWindow": "2010-2026",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Brazil attacking reference across Copa America and World Cup cycles."
  },
  {
    "contextId": "suarez_uruguay_2010s",
    "personId": "luis_suarez",
    "displayName": "Luis Suarez",
    "teamType": "nation",
    "teamName": "Uruguay",
    "country": "Uruguay",
    "competitionContexts": [
      {
        "competition": "Copa America",
        "team": "Uruguay",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Uruguay",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2007,
    "endYear": 2026,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "copa_america",
      "world_cup"
    ],
    "positions": [
      "ST",
      "CF"
    ],
    "primaryPositions": [
      "ST"
    ],
    "secondaryPositions": [
      "CF"
    ],
    "roleTags": [
      "Complete striker",
      "Pressing forward",
      "Street finisher"
    ],
    "ratings": {
      "attack": 97,
      "creation": 78,
      "control": 73,
      "defense": 30,
      "goalkeeping": 4,
      "physical": 90,
      "press": 82,
      "bigGame": 92
    },
    "peakWindow": "2007-2026",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Uruguay striker and Copa America winner."
  },
  {
    "contextId": "el_hadary_egypt_2000s",
    "personId": "essam_el_hadary",
    "displayName": "Essam El Hadary",
    "teamType": "nation",
    "teamName": "Egypt",
    "country": "Egypt",
    "competitionContexts": [
      {
        "competition": "AFCON",
        "team": "Egypt",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 1996,
    "endYear": 2018,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "afcon"
    ],
    "positions": [
      "GK"
    ],
    "primaryPositions": [
      "GK"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Shot-stopper",
      "Penalty presence",
      "Tournament keeper"
    ],
    "ratings": {
      "attack": 18,
      "creation": 43,
      "control": 59,
      "defense": 63,
      "goalkeeping": 94,
      "physical": 80,
      "press": 49,
      "bigGame": 95
    },
    "peakWindow": "1996-2018",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Egypt AFCON dynasty goalkeeper."
  },
  {
    "contextId": "bell_cameroon_1980s",
    "personId": "joseph_antoine_bell",
    "displayName": "Joseph-Antoine Bell",
    "teamType": "nation",
    "teamName": "Cameroon",
    "country": "Cameroon",
    "competitionContexts": [
      {
        "competition": "AFCON",
        "team": "Cameroon",
        "eraLabel": "1980s",
        "role": "impact"
      }
    ],
    "startYear": 1977,
    "endYear": 1994,
    "decade": "1980s",
    "eraLabel": "1980s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "afcon"
    ],
    "positions": [
      "GK"
    ],
    "primaryPositions": [
      "GK"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Shot-stopper",
      "Box command",
      "African great"
    ],
    "ratings": {
      "attack": 18,
      "creation": 42,
      "control": 58,
      "defense": 62,
      "goalkeeping": 92,
      "physical": 78,
      "press": 48,
      "bigGame": 89
    },
    "peakWindow": "1977-1994",
    "dataConfidence": "Legend estimate",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Cameroon goalkeeper and African football reference."
  },
  {
    "contextId": "song_cameroon_2000s",
    "personId": "rigobert_song",
    "displayName": "Rigobert Song",
    "teamType": "nation",
    "teamName": "Cameroon",
    "country": "Cameroon",
    "competitionContexts": [
      {
        "competition": "AFCON",
        "team": "Cameroon",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Cameroon",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 1993,
    "endYear": 2010,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "afcon",
      "world_cup"
    ],
    "positions": [
      "CB"
    ],
    "primaryPositions": [
      "CB"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Stopper",
      "Leader",
      "Tournament defender"
    ],
    "ratings": {
      "attack": 35,
      "creation": 58,
      "control": 66,
      "defense": 90,
      "goalkeeping": 4,
      "physical": 86,
      "press": 70,
      "bigGame": 90
    },
    "peakWindow": "1993-2010",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Cameroon captain and AFCON winner."
  },
  {
    "contextId": "koulibaly_senegal_2020s",
    "personId": "kalidou_koulibaly",
    "displayName": "Kalidou Koulibaly",
    "teamType": "nation",
    "teamName": "Senegal",
    "country": "Senegal",
    "competitionContexts": [
      {
        "competition": "AFCON",
        "team": "Senegal",
        "eraLabel": "2020s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Senegal",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2015,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "afcon",
      "world_cup"
    ],
    "positions": [
      "CB"
    ],
    "primaryPositions": [
      "CB"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Stopper",
      "Recovery pace",
      "Line leader"
    ],
    "ratings": {
      "attack": 36,
      "creation": 60,
      "control": 68,
      "defense": 94,
      "goalkeeping": 4,
      "physical": 90,
      "press": 72,
      "bigGame": 91
    },
    "peakWindow": "2015-2026",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Senegal AFCON-winning captain."
  },
  {
    "contextId": "taiwo_nigeria_2000s",
    "personId": "taye_taiwo",
    "displayName": "Taye Taiwo",
    "teamType": "nation",
    "teamName": "Nigeria",
    "country": "Nigeria",
    "competitionContexts": [
      {
        "competition": "AFCON",
        "team": "Nigeria",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 2004,
    "endYear": 2012,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "afcon"
    ],
    "positions": [
      "LB",
      "LWB",
      "LM"
    ],
    "primaryPositions": [
      "LB"
    ],
    "secondaryPositions": [
      "LWB",
      "LM"
    ],
    "roleTags": [
      "Power fullback",
      "Set pieces",
      "Overlap"
    ],
    "ratings": {
      "attack": 68,
      "creation": 65,
      "control": 68,
      "defense": 82,
      "goalkeeping": 5,
      "physical": 90,
      "press": 76,
      "bigGame": 76
    },
    "peakWindow": "2004-2012",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Nigeria left-back and Marseille-era power runner."
  },
  {
    "contextId": "hakimi_morocco_2020s",
    "personId": "achraf_hakimi",
    "displayName": "Achraf Hakimi",
    "teamType": "nation",
    "teamName": "Morocco",
    "country": "Morocco",
    "competitionContexts": [
      {
        "competition": "AFCON",
        "team": "Morocco",
        "eraLabel": "2020s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Morocco",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2016,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "afcon",
      "world_cup"
    ],
    "positions": [
      "RB",
      "RWB",
      "RM"
    ],
    "primaryPositions": [
      "RB"
    ],
    "secondaryPositions": [
      "RWB",
      "RM"
    ],
    "roleTags": [
      "Attacking fullback",
      "Recovery pace",
      "Transition runner"
    ],
    "ratings": {
      "attack": 74,
      "creation": 68,
      "control": 72,
      "defense": 84,
      "goalkeeping": 5,
      "physical": 92,
      "press": 84,
      "bigGame": 80
    },
    "peakWindow": "2016-2026",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Morocco right-back and World Cup semifinalist."
  },
  {
    "contextId": "geremi_cameroon_2000s",
    "personId": "geremi",
    "displayName": "Geremi",
    "teamType": "nation",
    "teamName": "Cameroon",
    "country": "Cameroon",
    "competitionContexts": [
      {
        "competition": "AFCON",
        "team": "Cameroon",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Cameroon",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 1996,
    "endYear": 2010,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "afcon",
      "world_cup"
    ],
    "positions": [
      "RM",
      "RB",
      "CM"
    ],
    "primaryPositions": [
      "RM"
    ],
    "secondaryPositions": [
      "RB",
      "CM"
    ],
    "roleTags": [
      "Set pieces",
      "Two-way wide player",
      "Utility"
    ],
    "ratings": {
      "attack": 72,
      "creation": 86,
      "control": 75,
      "defense": 78,
      "goalkeeping": 4,
      "physical": 77,
      "press": 71,
      "bigGame": 88
    },
    "peakWindow": "1996-2010",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Cameroon AFCON winner and wide utility player."
  },
  {
    "contextId": "yaya_toure_ivory_coast_2010s",
    "personId": "yaya_toure",
    "displayName": "Yaya Toure",
    "teamType": "nation",
    "teamName": "Ivory Coast",
    "country": "Ivory Coast",
    "competitionContexts": [
      {
        "competition": "AFCON",
        "team": "Ivory Coast",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Ivory Coast",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2004,
    "endYear": 2016,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "afcon",
      "world_cup"
    ],
    "positions": [
      "CM",
      "DM",
      "AM"
    ],
    "primaryPositions": [
      "CM"
    ],
    "secondaryPositions": [
      "DM",
      "AM"
    ],
    "roleTags": [
      "Carrier",
      "Controller",
      "Power runner"
    ],
    "ratings": {
      "attack": 82,
      "creation": 90,
      "control": 91,
      "defense": 75,
      "goalkeeping": 4,
      "physical": 95,
      "press": 83,
      "bigGame": 88
    },
    "peakWindow": "2004-2016",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Ivory Coast midfielder and AFCON winner."
  },
  {
    "contextId": "essien_ghana_2000s",
    "personId": "michael_essien",
    "displayName": "Michael Essien",
    "teamType": "nation",
    "teamName": "Ghana",
    "country": "Ghana",
    "competitionContexts": [
      {
        "competition": "AFCON",
        "team": "Ghana",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Ghana",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 2002,
    "endYear": 2014,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "afcon",
      "world_cup"
    ],
    "positions": [
      "DM",
      "CM",
      "RB"
    ],
    "primaryPositions": [
      "DM"
    ],
    "secondaryPositions": [
      "CM",
      "RB"
    ],
    "roleTags": [
      "Ball-winner",
      "Carrier",
      "Duel winner"
    ],
    "ratings": {
      "attack": 50,
      "creation": 74,
      "control": 86,
      "defense": 88,
      "goalkeeping": 4,
      "physical": 93,
      "press": 88,
      "bigGame": 85
    },
    "peakWindow": "2002-2014",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Ghana midfield force and World Cup-era leader."
  },
  {
    "contextId": "okocha_nigeria_2000s",
    "personId": "jay_jay_okocha",
    "displayName": "Jay-Jay Okocha",
    "teamType": "nation",
    "teamName": "Nigeria",
    "country": "Nigeria",
    "competitionContexts": [
      {
        "competition": "AFCON",
        "team": "Nigeria",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Nigeria",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 1993,
    "endYear": 2006,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "afcon",
      "world_cup"
    ],
    "positions": [
      "AM",
      "RM",
      "CM"
    ],
    "primaryPositions": [
      "AM"
    ],
    "secondaryPositions": [
      "RM",
      "CM"
    ],
    "roleTags": [
      "Dribbler",
      "Creator",
      "Set pieces"
    ],
    "ratings": {
      "attack": 84,
      "creation": 94,
      "control": 93,
      "defense": 43,
      "goalkeeping": 4,
      "physical": 72,
      "press": 68,
      "bigGame": 90
    },
    "peakWindow": "1993-2006",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Nigeria creative icon and AFCON star."
  },
  {
    "contextId": "abedi_pele_ghana_1990s",
    "personId": "abedi_pele",
    "displayName": "Abedi Pele",
    "teamType": "nation",
    "teamName": "Ghana",
    "country": "Ghana",
    "competitionContexts": [
      {
        "competition": "AFCON",
        "team": "Ghana",
        "eraLabel": "1990s",
        "role": "impact"
      }
    ],
    "startYear": 1982,
    "endYear": 1998,
    "decade": "1990s",
    "eraLabel": "1990s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "afcon"
    ],
    "positions": [
      "AM",
      "LW",
      "LM"
    ],
    "primaryPositions": [
      "AM"
    ],
    "secondaryPositions": [
      "LW",
      "LM"
    ],
    "roleTags": [
      "Creator",
      "Dribbler",
      "Wide playmaker"
    ],
    "ratings": {
      "attack": 86,
      "creation": 93,
      "control": 91,
      "defense": 44,
      "goalkeeping": 4,
      "physical": 73,
      "press": 69,
      "bigGame": 91
    },
    "peakWindow": "1982-1998",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Ghana attacking great and African Footballer of the Year icon."
  },
  {
    "contextId": "mane_senegal_2020s",
    "personId": "sadio_mane",
    "displayName": "Sadio Mane",
    "teamType": "nation",
    "teamName": "Senegal",
    "country": "Senegal",
    "competitionContexts": [
      {
        "competition": "AFCON",
        "team": "Senegal",
        "eraLabel": "2020s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Senegal",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2012,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "afcon",
      "world_cup"
    ],
    "positions": [
      "LW",
      "RW",
      "ST"
    ],
    "primaryPositions": [
      "LW"
    ],
    "secondaryPositions": [
      "RW",
      "ST"
    ],
    "roleTags": [
      "Pressing forward",
      "Wide scorer",
      "Tournament leader"
    ],
    "ratings": {
      "attack": 94,
      "creation": 89,
      "control": 85,
      "defense": 40,
      "goalkeeping": 4,
      "physical": 88,
      "press": 88,
      "bigGame": 93
    },
    "peakWindow": "2012-2026",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Senegal AFCON-winning attacker."
  },
  {
    "contextId": "salah_egypt_2020s",
    "personId": "mohamed_salah",
    "displayName": "Mohamed Salah",
    "teamType": "nation",
    "teamName": "Egypt",
    "country": "Egypt",
    "competitionContexts": [
      {
        "competition": "AFCON",
        "team": "Egypt",
        "eraLabel": "2020s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Egypt",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2011,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "afcon",
      "world_cup"
    ],
    "positions": [
      "RW",
      "ST"
    ],
    "primaryPositions": [
      "RW"
    ],
    "secondaryPositions": [
      "ST"
    ],
    "roleTags": [
      "Elite scorer",
      "Transition runner",
      "Wide finisher"
    ],
    "ratings": {
      "attack": 97,
      "creation": 84,
      "control": 85,
      "defense": 41,
      "goalkeeping": 4,
      "physical": 83,
      "press": 75,
      "bigGame": 91
    },
    "peakWindow": "2011-2026",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Egypt attacking talisman."
  },
  {
    "contextId": "mahrez_algeria_2010s",
    "personId": "riyad_mahrez",
    "displayName": "Riyad Mahrez",
    "teamType": "nation",
    "teamName": "Algeria",
    "country": "Algeria",
    "competitionContexts": [
      {
        "competition": "AFCON",
        "team": "Algeria",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2014,
    "endYear": 2026,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "afcon"
    ],
    "positions": [
      "RW",
      "AM",
      "RM"
    ],
    "primaryPositions": [
      "RW"
    ],
    "secondaryPositions": [
      "AM",
      "RM"
    ],
    "roleTags": [
      "Inverted winger",
      "Creator",
      "Set pieces"
    ],
    "ratings": {
      "attack": 90,
      "creation": 90,
      "control": 89,
      "defense": 39,
      "goalkeeping": 4,
      "physical": 81,
      "press": 72,
      "bigGame": 90
    },
    "peakWindow": "2014-2026",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Algeria AFCON-winning captain and right-sided creator."
  },
  {
    "contextId": "drogba_ivory_coast_2000s",
    "personId": "didier_drogba",
    "displayName": "Didier Drogba",
    "teamType": "nation",
    "teamName": "Ivory Coast",
    "country": "Ivory Coast",
    "competitionContexts": [
      {
        "competition": "AFCON",
        "team": "Ivory Coast",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Ivory Coast",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 2002,
    "endYear": 2014,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "afcon",
      "world_cup"
    ],
    "positions": [
      "ST"
    ],
    "primaryPositions": [
      "ST"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Target striker",
      "Big-game scorer",
      "Aerial threat"
    ],
    "ratings": {
      "attack": 96,
      "creation": 71,
      "control": 73,
      "defense": 30,
      "goalkeeping": 4,
      "physical": 94,
      "press": 68,
      "bigGame": 94
    },
    "peakWindow": "2002-2014",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Ivory Coast striker and African football icon."
  },
  {
    "contextId": "etoo_cameroon_2000s",
    "personId": "samuel_eto_o",
    "displayName": "Samuel Eto'o",
    "teamType": "nation",
    "teamName": "Cameroon",
    "country": "Cameroon",
    "competitionContexts": [
      {
        "competition": "AFCON",
        "team": "Cameroon",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Cameroon",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 1997,
    "endYear": 2014,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "afcon",
      "world_cup"
    ],
    "positions": [
      "ST",
      "CF"
    ],
    "primaryPositions": [
      "ST"
    ],
    "secondaryPositions": [
      "CF"
    ],
    "roleTags": [
      "Elite scorer",
      "Channel runner",
      "Tournament finisher"
    ],
    "ratings": {
      "attack": 97,
      "creation": 71,
      "control": 73,
      "defense": 30,
      "goalkeeping": 4,
      "physical": 88,
      "press": 69,
      "bigGame": 95
    },
    "peakWindow": "1997-2014",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Cameroon striker and AFCON winner."
  },
  {
    "contextId": "casillas_real_madrid_2010s",
    "personId": "iker_casillas",
    "displayName": "Iker Casillas",
    "teamType": "club",
    "teamName": "Real Madrid",
    "league": "LaLiga",
    "country": "Spain",
    "competitionContexts": [
      {
        "competition": "UCL",
        "team": "Real Madrid",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "Club World Cup",
        "team": "Real Madrid",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "LaLiga",
        "team": "Real Madrid",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 1999,
    "endYear": 2015,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "club_world_cup",
      "champions_league",
      "laliga"
    ],
    "positions": [
      "GK"
    ],
    "primaryPositions": [
      "GK"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Shot-stopper",
      "Captain",
      "European keeper"
    ],
    "ratings": {
      "attack": 19,
      "creation": 45,
      "control": 63,
      "defense": 67,
      "goalkeeping": 98,
      "physical": 84,
      "press": 52,
      "bigGame": 97
    },
    "peakWindow": "1999-2015",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Real Madrid captain and Champions League/Club World Cup-era keeper."
  },
  {
    "contextId": "ederson_city_2020s",
    "personId": "ederson",
    "displayName": "Ederson",
    "teamType": "club",
    "teamName": "Manchester City",
    "league": "Premier League",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "UCL",
        "team": "Manchester City",
        "eraLabel": "2020s",
        "role": "impact"
      },
      {
        "competition": "Club World Cup",
        "team": "Manchester City",
        "eraLabel": "2020s",
        "role": "impact"
      },
      {
        "competition": "Premier League",
        "team": "Manchester City",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2017,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "club_world_cup",
      "champions_league",
      "premier_league"
    ],
    "positions": [
      "GK"
    ],
    "primaryPositions": [
      "GK"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Sweeper keeper",
      "Distribution",
      "High-line keeper"
    ],
    "ratings": {
      "attack": 19,
      "creation": 70,
      "control": 82,
      "defense": 65,
      "goalkeeping": 94,
      "physical": 82,
      "press": 50,
      "bigGame": 91
    },
    "peakWindow": "2017-2026",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Manchester City treble-era goalkeeper."
  },
  {
    "contextId": "marcelo_real_madrid_2010s",
    "personId": "marcelo",
    "displayName": "Marcelo",
    "teamType": "club",
    "teamName": "Real Madrid",
    "league": "LaLiga",
    "country": "Spain",
    "competitionContexts": [
      {
        "competition": "UCL",
        "team": "Real Madrid",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "Club World Cup",
        "team": "Real Madrid",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "LaLiga",
        "team": "Real Madrid",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2007,
    "endYear": 2022,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "club_world_cup",
      "champions_league",
      "laliga"
    ],
    "positions": [
      "LB",
      "LWB",
      "LM"
    ],
    "primaryPositions": [
      "LB"
    ],
    "secondaryPositions": [
      "LWB",
      "LM"
    ],
    "roleTags": [
      "Attacking fullback",
      "Dribbler",
      "Combination play"
    ],
    "ratings": {
      "attack": 74,
      "creation": 86,
      "control": 88,
      "defense": 82,
      "goalkeeping": 5,
      "physical": 87,
      "press": 82,
      "bigGame": 93
    },
    "peakWindow": "2007-2022",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Real Madrid left-back in a Champions League dynasty."
  },
  {
    "contextId": "carvajal_real_madrid_2010s",
    "personId": "dani_carvajal",
    "displayName": "Dani Carvajal",
    "teamType": "club",
    "teamName": "Real Madrid",
    "league": "LaLiga",
    "country": "Spain",
    "competitionContexts": [
      {
        "competition": "UCL",
        "team": "Real Madrid",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "Club World Cup",
        "team": "Real Madrid",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "LaLiga",
        "team": "Real Madrid",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2013,
    "endYear": 2026,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "club_world_cup",
      "champions_league",
      "laliga"
    ],
    "positions": [
      "RB",
      "RWB"
    ],
    "primaryPositions": [
      "RB"
    ],
    "secondaryPositions": [
      "RWB"
    ],
    "roleTags": [
      "Two-way fullback",
      "Big-game defender",
      "Overlap"
    ],
    "ratings": {
      "attack": 57,
      "creation": 68,
      "control": 72,
      "defense": 88,
      "goalkeeping": 5,
      "physical": 85,
      "press": 86,
      "bigGame": 94
    },
    "peakWindow": "2013-2026",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Real Madrid right-back across multiple Champions League wins."
  },
  {
    "contextId": "van_dijk_liverpool_2010s",
    "personId": "virgil_van_dijk",
    "displayName": "Virgil van Dijk",
    "teamType": "club",
    "teamName": "Liverpool",
    "league": "Premier League",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "UCL",
        "team": "Liverpool",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "Club World Cup",
        "team": "Liverpool",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "Premier League",
        "team": "Liverpool",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2018,
    "endYear": 2026,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "club_world_cup",
      "champions_league",
      "premier_league"
    ],
    "positions": [
      "CB"
    ],
    "primaryPositions": [
      "CB"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Line leader",
      "Aerial control",
      "Recovery pace"
    ],
    "ratings": {
      "attack": 38,
      "creation": 63,
      "control": 82,
      "defense": 98,
      "goalkeeping": 4,
      "physical": 93,
      "press": 76,
      "bigGame": 94
    },
    "peakWindow": "2018-2026",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Liverpool Champions League and Club World Cup-winning center-back."
  },
  {
    "contextId": "pique_barcelona_2010s",
    "personId": "gerard_pique",
    "displayName": "Gerard Pique",
    "teamType": "club",
    "teamName": "Barcelona",
    "league": "LaLiga",
    "country": "Spain",
    "competitionContexts": [
      {
        "competition": "UCL",
        "team": "Barcelona",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "Club World Cup",
        "team": "Barcelona",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "LaLiga",
        "team": "Barcelona",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2008,
    "endYear": 2022,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "club_world_cup",
      "champions_league",
      "laliga"
    ],
    "positions": [
      "CB"
    ],
    "primaryPositions": [
      "CB"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Ball-playing CB",
      "Aerial defender",
      "Possession base"
    ],
    "ratings": {
      "attack": 37,
      "creation": 61,
      "control": 86,
      "defense": 93,
      "goalkeeping": 4,
      "physical": 93,
      "press": 74,
      "bigGame": 93
    },
    "peakWindow": "2008-2022",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Barcelona center-back in Champions League and Club World Cup-winning sides."
  },
  {
    "contextId": "kroos_real_madrid_2010s",
    "personId": "toni_kroos",
    "displayName": "Toni Kroos",
    "teamType": "club",
    "teamName": "Real Madrid",
    "league": "LaLiga",
    "country": "Spain",
    "competitionContexts": [
      {
        "competition": "UCL",
        "team": "Real Madrid",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "Club World Cup",
        "team": "Real Madrid",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "LaLiga",
        "team": "Real Madrid",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2014,
    "endYear": 2024,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "club_world_cup",
      "champions_league",
      "laliga"
    ],
    "positions": [
      "CM",
      "DM"
    ],
    "primaryPositions": [
      "CM"
    ],
    "secondaryPositions": [
      "DM"
    ],
    "roleTags": [
      "Controller",
      "Long passing",
      "Tempo setter"
    ],
    "ratings": {
      "attack": 71,
      "creation": 96,
      "control": 98,
      "defense": 76,
      "goalkeeping": 4,
      "physical": 84,
      "press": 84,
      "bigGame": 94
    },
    "peakWindow": "2014-2024",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Real Madrid midfield controller in the Champions League dynasty."
  },
  {
    "contextId": "modric_real_madrid_2010s",
    "personId": "luka_modric",
    "displayName": "Luka Modric",
    "teamType": "club",
    "teamName": "Real Madrid",
    "league": "LaLiga",
    "country": "Spain",
    "competitionContexts": [
      {
        "competition": "UCL",
        "team": "Real Madrid",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "Club World Cup",
        "team": "Real Madrid",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "LaLiga",
        "team": "Real Madrid",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2012,
    "endYear": 2026,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "club_world_cup",
      "champions_league",
      "laliga"
    ],
    "positions": [
      "CM",
      "AM"
    ],
    "primaryPositions": [
      "CM"
    ],
    "secondaryPositions": [
      "AM"
    ],
    "roleTags": [
      "Controller",
      "Carrier",
      "Press resistance"
    ],
    "ratings": {
      "attack": 72,
      "creation": 95,
      "control": 97,
      "defense": 76,
      "goalkeeping": 4,
      "physical": 85,
      "press": 85,
      "bigGame": 96
    },
    "peakWindow": "2012-2026",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Real Madrid midfield engine and Champions League final regular."
  },
  {
    "contextId": "kante_chelsea_2020s",
    "personId": "n_golo_kante",
    "displayName": "N'Golo Kante",
    "teamType": "club",
    "teamName": "Chelsea",
    "league": "Premier League",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "UCL",
        "team": "Chelsea",
        "eraLabel": "2020s",
        "role": "impact"
      },
      {
        "competition": "Club World Cup",
        "team": "Chelsea",
        "eraLabel": "2020s",
        "role": "impact"
      },
      {
        "competition": "Premier League",
        "team": "Chelsea",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2016,
    "endYear": 2023,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "club_world_cup",
      "champions_league",
      "premier_league"
    ],
    "positions": [
      "DM",
      "CM"
    ],
    "primaryPositions": [
      "DM"
    ],
    "secondaryPositions": [
      "CM"
    ],
    "roleTags": [
      "Ball-winner",
      "Pressing",
      "Transition stopper"
    ],
    "ratings": {
      "attack": 51,
      "creation": 77,
      "control": 86,
      "defense": 94,
      "goalkeeping": 4,
      "physical": 88,
      "press": 96,
      "bigGame": 96
    },
    "peakWindow": "2016-2023",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Chelsea Champions League and Club World Cup midfield force."
  },
  {
    "contextId": "bernardo_city_2020s",
    "personId": "bernardo_silva",
    "displayName": "Bernardo Silva",
    "teamType": "club",
    "teamName": "Manchester City",
    "league": "Premier League",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "UCL",
        "team": "Manchester City",
        "eraLabel": "2020s",
        "role": "impact"
      },
      {
        "competition": "Club World Cup",
        "team": "Manchester City",
        "eraLabel": "2020s",
        "role": "impact"
      },
      {
        "competition": "Premier League",
        "team": "Manchester City",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2017,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "club_world_cup",
      "champions_league",
      "premier_league"
    ],
    "positions": [
      "RM",
      "RW",
      "CM",
      "AM"
    ],
    "primaryPositions": [
      "RM"
    ],
    "secondaryPositions": [
      "RW",
      "CM",
      "AM"
    ],
    "roleTags": [
      "Press resistance",
      "Wide creator",
      "Controller"
    ],
    "ratings": {
      "attack": 77,
      "creation": 92,
      "control": 94,
      "defense": 58,
      "goalkeeping": 4,
      "physical": 82,
      "press": 88,
      "bigGame": 92
    },
    "peakWindow": "2017-2026",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Manchester City treble-era midfielder and wide creator."
  },
  {
    "contextId": "vinicius_real_madrid_2020s",
    "personId": "vinicius_junior",
    "displayName": "Vinicius Junior",
    "teamType": "club",
    "teamName": "Real Madrid",
    "league": "LaLiga",
    "country": "Spain",
    "competitionContexts": [
      {
        "competition": "UCL",
        "team": "Real Madrid",
        "eraLabel": "2020s",
        "role": "impact"
      },
      {
        "competition": "Club World Cup",
        "team": "Real Madrid",
        "eraLabel": "2020s",
        "role": "impact"
      },
      {
        "competition": "LaLiga",
        "team": "Real Madrid",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2018,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "club_world_cup",
      "champions_league",
      "laliga"
    ],
    "positions": [
      "LW",
      "ST"
    ],
    "primaryPositions": [
      "LW"
    ],
    "secondaryPositions": [
      "ST"
    ],
    "roleTags": [
      "Dribbler",
      "Wide scorer",
      "Big-game winger"
    ],
    "ratings": {
      "attack": 95,
      "creation": 88,
      "control": 85,
      "defense": 41,
      "goalkeeping": 4,
      "physical": 88,
      "press": 75,
      "bigGame": 96
    },
    "peakWindow": "2018-2026",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Real Madrid Champions League match-winner and Club World Cup attacker."
  },
  {
    "contextId": "bale_real_madrid_2010s",
    "personId": "gareth_bale",
    "displayName": "Gareth Bale",
    "teamType": "club",
    "teamName": "Real Madrid",
    "league": "LaLiga",
    "country": "Spain",
    "competitionContexts": [
      {
        "competition": "UCL",
        "team": "Real Madrid",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "Club World Cup",
        "team": "Real Madrid",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "LaLiga",
        "team": "Real Madrid",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2013,
    "endYear": 2022,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "club_world_cup",
      "champions_league",
      "laliga"
    ],
    "positions": [
      "RW",
      "LW",
      "ST"
    ],
    "primaryPositions": [
      "RW"
    ],
    "secondaryPositions": [
      "LW",
      "ST"
    ],
    "roleTags": [
      "Power winger",
      "Big-game scorer",
      "Transition runner"
    ],
    "ratings": {
      "attack": 94,
      "creation": 89,
      "control": 85,
      "defense": 40,
      "goalkeeping": 4,
      "physical": 92,
      "press": 74,
      "bigGame": 96
    },
    "peakWindow": "2013-2022",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Real Madrid Champions League final scorer and Club World Cup attacker."
  },
  {
    "contextId": "benzema_real_madrid_2010s",
    "personId": "karim_benzema",
    "displayName": "Karim Benzema",
    "teamType": "club",
    "teamName": "Real Madrid",
    "league": "LaLiga",
    "country": "Spain",
    "competitionContexts": [
      {
        "competition": "UCL",
        "team": "Real Madrid",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "Club World Cup",
        "team": "Real Madrid",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "LaLiga",
        "team": "Real Madrid",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2009,
    "endYear": 2023,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "club_world_cup",
      "champions_league",
      "laliga"
    ],
    "positions": [
      "ST",
      "CF"
    ],
    "primaryPositions": [
      "ST"
    ],
    "secondaryPositions": [
      "CF"
    ],
    "roleTags": [
      "Complete striker",
      "Link forward",
      "Big-game scorer"
    ],
    "ratings": {
      "attack": 97,
      "creation": 82,
      "control": 84,
      "defense": 30,
      "goalkeeping": 4,
      "physical": 91,
      "press": 69,
      "bigGame": 96
    },
    "peakWindow": "2009-2023",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Real Madrid Champions League and Club World Cup striker."
  },
  {
    "contextId": "abidal_lyon_2000s",
    "personId": "eric_abidal",
    "displayName": "Eric Abidal",
    "teamType": "club",
    "teamName": "Lyon",
    "league": "Ligue 1",
    "country": "France",
    "competitionContexts": [
      {
        "competition": "Ligue 1",
        "team": "Lyon",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "UCL",
        "team": "Lyon",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 2004,
    "endYear": 2007,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "ligue_1",
      "champions_league"
    ],
    "positions": [
      "LB",
      "LWB",
      "CB"
    ],
    "primaryPositions": [
      "LB"
    ],
    "secondaryPositions": [
      "LWB",
      "CB"
    ],
    "roleTags": [
      "Defensive fullback",
      "Recovery pace",
      "Left-side balance"
    ],
    "ratings": {
      "attack": 56,
      "creation": 68,
      "control": 72,
      "defense": 90,
      "goalkeeping": 5,
      "physical": 88,
      "press": 80,
      "bigGame": 88
    },
    "peakWindow": "2004-2007",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Lyon title-era left-back before Barcelona and France tournament roles."
  },
  {
    "contextId": "lizarazu_bordeaux_1990s",
    "personId": "bixente_lizarazu",
    "displayName": "Bixente Lizarazu",
    "teamType": "club",
    "teamName": "Bordeaux",
    "league": "Ligue 1",
    "country": "France",
    "competitionContexts": [
      {
        "competition": "Ligue 1",
        "team": "Bordeaux",
        "eraLabel": "1990s",
        "role": "impact"
      }
    ],
    "startYear": 1988,
    "endYear": 1996,
    "decade": "1990s",
    "eraLabel": "1990s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "ligue_1"
    ],
    "positions": [
      "LB",
      "LWB",
      "LM"
    ],
    "primaryPositions": [
      "LB"
    ],
    "secondaryPositions": [
      "LWB",
      "LM"
    ],
    "roleTags": [
      "Two-way fullback",
      "Overlap",
      "Tournament defender"
    ],
    "ratings": {
      "attack": 56,
      "creation": 80,
      "control": 72,
      "defense": 88,
      "goalkeeping": 5,
      "physical": 88,
      "press": 80,
      "bigGame": 89
    },
    "peakWindow": "1988-1996",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Bordeaux and France left-back reference with elite wide defensive value."
  },
  {
    "contextId": "morrow_toronto_2010s",
    "personId": "justin_morrow",
    "displayName": "Justin Morrow",
    "teamType": "club",
    "teamName": "Toronto FC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Toronto FC",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2014,
    "endYear": 2021,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "mls"
    ],
    "positions": [
      "LB",
      "LWB",
      "LM"
    ],
    "primaryPositions": [
      "LB"
    ],
    "secondaryPositions": [
      "LWB",
      "LM"
    ],
    "roleTags": [
      "Wingback",
      "Wide runner",
      "Playoff reliability"
    ],
    "ratings": {
      "attack": 53,
      "creation": 63,
      "control": 67,
      "defense": 84,
      "goalkeeping": 5,
      "physical": 86,
      "press": 84,
      "bigGame": 82
    },
    "peakWindow": "2014-2021",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Toronto FC title-era left-sided defender and wingback."
  },
  {
    "contextId": "davies_vancouver_2010s",
    "personId": "alphonso_davies",
    "displayName": "Alphonso Davies",
    "teamType": "club",
    "teamName": "Vancouver Whitecaps",
    "league": "MLS",
    "country": "Canada",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Vancouver Whitecaps",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2016,
    "endYear": 2018,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "mls"
    ],
    "positions": [
      "LM",
      "LW",
      "LWB",
      "LB"
    ],
    "primaryPositions": [
      "LM"
    ],
    "secondaryPositions": [
      "LW",
      "LWB",
      "LB"
    ],
    "roleTags": [
      "Explosive runner",
      "Left-side threat",
      "Transition outlet"
    ],
    "ratings": {
      "attack": 78,
      "creation": 82,
      "control": 73,
      "defense": 53,
      "goalkeeping": 4,
      "physical": 94,
      "press": 84,
      "bigGame": 75
    },
    "peakWindow": "2016-2018",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Vancouver teenage breakout used for MLS left-lane coverage, not Bayern peak."
  },
  {
    "contextId": "valeri_portland_2010s",
    "personId": "diego_valeri",
    "displayName": "Diego Valeri",
    "teamType": "club",
    "teamName": "Portland Timbers",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Portland Timbers",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2013,
    "endYear": 2021,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "mls"
    ],
    "positions": [
      "AM",
      "LM",
      "LW"
    ],
    "primaryPositions": [
      "AM"
    ],
    "secondaryPositions": [
      "LM",
      "LW"
    ],
    "roleTags": [
      "Creator",
      "Set pieces",
      "Playoff attacker"
    ],
    "ratings": {
      "attack": 82,
      "creation": 89,
      "control": 87,
      "defense": 42,
      "goalkeeping": 4,
      "physical": 69,
      "press": 65,
      "bigGame": 86
    },
    "peakWindow": "2013-2021",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Portland creator and MLS MVP-level attacking midfielder."
  },
  {
    "contextId": "beckham_england_2000s",
    "personId": "david_beckham",
    "displayName": "David Beckham",
    "teamType": "nation",
    "teamName": "England",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 1996,
    "endYear": 2009,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros",
      "world_cup"
    ],
    "positions": [
      "RM",
      "RW",
      "CM"
    ],
    "primaryPositions": [
      "RM"
    ],
    "secondaryPositions": [
      "RW",
      "CM"
    ],
    "roleTags": [
      "Wide creator",
      "Set pieces",
      "Crossing"
    ],
    "ratings": {
      "attack": 78,
      "creation": 94,
      "control": 86,
      "defense": 57,
      "goalkeeping": 4,
      "physical": 81,
      "press": 74,
      "bigGame": 90
    },
    "peakWindow": "1996-2009",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "England right-sided creator across Euro and World Cup cycles."
  },
  {
    "contextId": "seaman_england_2000s",
    "personId": "david_seaman",
    "displayName": "David Seaman",
    "teamType": "nation",
    "teamName": "England",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 1988,
    "endYear": 2002,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros",
      "world_cup"
    ],
    "positions": [
      "GK"
    ],
    "primaryPositions": [
      "GK"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Shot-stopper",
      "Back-four keeper",
      "Tournament veteran"
    ],
    "ratings": {
      "attack": 18,
      "creation": 42,
      "control": 58,
      "defense": 62,
      "goalkeeping": 91,
      "physical": 78,
      "press": 48,
      "bigGame": 86
    },
    "peakWindow": "1988-2002",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "England keeper into the 2002 World Cup cycle, included to give 2000s England national rolls real goalkeeper coverage."
  },
  {
    "contextId": "cole_england_2000s",
    "personId": "ashley_cole",
    "displayName": "Ashley Cole",
    "teamType": "nation",
    "teamName": "England",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 2001,
    "endYear": 2014,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros",
      "world_cup"
    ],
    "positions": [
      "LB",
      "LWB"
    ],
    "primaryPositions": [
      "LB"
    ],
    "secondaryPositions": [
      "LWB"
    ],
    "roleTags": [
      "Lockdown fullback",
      "Recovery pace",
      "Big-game defender"
    ],
    "ratings": {
      "attack": 57,
      "creation": 68,
      "control": 72,
      "defense": 92,
      "goalkeeping": 5,
      "physical": 87,
      "press": 81,
      "bigGame": 91
    },
    "peakWindow": "2001-2014",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "England left-back reference across the 2002, 2006 and 2010 World Cup cycles."
  },
  {
    "contextId": "campbell_england_2000s",
    "personId": "sol_campbell",
    "displayName": "Sol Campbell",
    "teamType": "nation",
    "teamName": "England",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 1996,
    "endYear": 2007,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros",
      "world_cup"
    ],
    "positions": [
      "CB"
    ],
    "primaryPositions": [
      "CB"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Stopper",
      "Recovery pace",
      "Tournament defender"
    ],
    "ratings": {
      "attack": 36,
      "creation": 60,
      "control": 68,
      "defense": 93,
      "goalkeeping": 4,
      "physical": 92,
      "press": 72,
      "bigGame": 90
    },
    "peakWindow": "1996-2007",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "England center-back across Euro 2000, World Cup 2002, Euro 2004 and World Cup 2006 squads."
  },
  {
    "contextId": "ferdinand_england_2000s",
    "personId": "rio_ferdinand",
    "displayName": "Rio Ferdinand",
    "teamType": "nation",
    "teamName": "England",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 1997,
    "endYear": 2011,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros",
      "world_cup"
    ],
    "positions": [
      "CB"
    ],
    "primaryPositions": [
      "CB"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Ball-playing CB",
      "Cover defender",
      "Recovery pace"
    ],
    "ratings": {
      "attack": 37,
      "creation": 61,
      "control": 78,
      "defense": 94,
      "goalkeeping": 4,
      "physical": 86,
      "press": 73,
      "bigGame": 90
    },
    "peakWindow": "1997-2011",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "England ball-playing center-back across the 2002 and 2006 World Cup cycles."
  },
  {
    "contextId": "terry_england_2000s",
    "personId": "john_terry",
    "displayName": "John Terry",
    "teamType": "nation",
    "teamName": "England",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 2003,
    "endYear": 2012,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros",
      "world_cup"
    ],
    "positions": [
      "CB"
    ],
    "primaryPositions": [
      "CB"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Box defender",
      "Aerial threat",
      "Leader"
    ],
    "ratings": {
      "attack": 36,
      "creation": 60,
      "control": 68,
      "defense": 94,
      "goalkeeping": 4,
      "physical": 88,
      "press": 72,
      "bigGame": 88
    },
    "peakWindow": "2003-2012",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "England defensive leader through Euro 2004, World Cup 2006 and World Cup 2010."
  },
  {
    "contextId": "gary_neville_england_2000s",
    "personId": "gary_neville",
    "displayName": "Gary Neville",
    "teamType": "nation",
    "teamName": "England",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 1995,
    "endYear": 2007,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros",
      "world_cup"
    ],
    "positions": [
      "RB",
      "RWB"
    ],
    "primaryPositions": [
      "RB"
    ],
    "secondaryPositions": [
      "RWB"
    ],
    "roleTags": [
      "Reliable fullback",
      "Crossing support",
      "Back-four balance"
    ],
    "ratings": {
      "attack": 55,
      "creation": 76,
      "control": 70,
      "defense": 87,
      "goalkeeping": 5,
      "physical": 82,
      "press": 82,
      "bigGame": 87
    },
    "peakWindow": "1995-2007",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "England right-back across Euro and World Cup squads in the late 1990s and 2000s."
  },
  {
    "contextId": "scholes_england_2000s",
    "personId": "paul_scholes",
    "displayName": "Paul Scholes",
    "teamType": "nation",
    "teamName": "England",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 1997,
    "endYear": 2004,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros",
      "world_cup"
    ],
    "positions": [
      "CM",
      "AM",
      "LM"
    ],
    "primaryPositions": [
      "CM"
    ],
    "secondaryPositions": [
      "AM",
      "LM"
    ],
    "roleTags": [
      "Controller",
      "Long passing",
      "Late runs"
    ],
    "ratings": {
      "attack": 78,
      "creation": 91,
      "control": 92,
      "defense": 72,
      "goalkeeping": 4,
      "physical": 80,
      "press": 80,
      "bigGame": 88
    },
    "peakWindow": "1997-2004",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "England midfield technician through the 2002 World Cup and Euro 2004 cycle."
  },
  {
    "contextId": "gerrard_england_2000s",
    "personId": "steven_gerrard",
    "displayName": "Steven Gerrard",
    "teamType": "nation",
    "teamName": "England",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 2000,
    "endYear": 2014,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros",
      "world_cup"
    ],
    "positions": [
      "CM",
      "AM",
      "DM",
      "RM"
    ],
    "primaryPositions": [
      "CM"
    ],
    "secondaryPositions": [
      "AM",
      "DM",
      "RM"
    ],
    "roleTags": [
      "Box-to-box",
      "Big-game shot",
      "Captain"
    ],
    "ratings": {
      "attack": 82,
      "creation": 88,
      "control": 87,
      "defense": 73,
      "goalkeeping": 4,
      "physical": 88,
      "press": 82,
      "bigGame": 92
    },
    "peakWindow": "2000-2014",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "England all-action midfielder across 2000s tournament squads."
  },
  {
    "contextId": "lampard_england_2000s",
    "personId": "frank_lampard",
    "displayName": "Frank Lampard",
    "teamType": "nation",
    "teamName": "England",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 1999,
    "endYear": 2014,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros",
      "world_cup"
    ],
    "positions": [
      "CM",
      "AM"
    ],
    "primaryPositions": [
      "CM"
    ],
    "secondaryPositions": [
      "AM"
    ],
    "roleTags": [
      "Late runner",
      "Scoring midfielder",
      "Set pieces"
    ],
    "ratings": {
      "attack": 85,
      "creation": 85,
      "control": 84,
      "defense": 72,
      "goalkeeping": 4,
      "physical": 81,
      "press": 81,
      "bigGame": 88
    },
    "peakWindow": "1999-2014",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "England goalscoring midfielder across Euro 2004, World Cup 2006 and World Cup 2010."
  },
  {
    "contextId": "joe_cole_england_2000s",
    "personId": "joe_cole",
    "displayName": "Joe Cole",
    "teamType": "nation",
    "teamName": "England",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 2001,
    "endYear": 2010,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros",
      "world_cup"
    ],
    "positions": [
      "LW",
      "RW",
      "AM",
      "LM"
    ],
    "primaryPositions": [
      "LW"
    ],
    "secondaryPositions": [
      "RW",
      "AM",
      "LM"
    ],
    "roleTags": [
      "Dribbler",
      "Wide creator",
      "Tournament spark"
    ],
    "ratings": {
      "attack": 84,
      "creation": 86,
      "control": 88,
      "defense": 38,
      "goalkeeping": 4,
      "physical": 78,
      "press": 70,
      "bigGame": 86
    },
    "peakWindow": "2001-2010",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "England wide attacker and creative option across Euro and World Cup squads."
  },
  {
    "contextId": "owen_england_2000s",
    "personId": "michael_owen",
    "displayName": "Michael Owen",
    "teamType": "nation",
    "teamName": "England",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 1998,
    "endYear": 2008,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros",
      "world_cup"
    ],
    "positions": [
      "ST",
      "CF"
    ],
    "primaryPositions": [
      "ST"
    ],
    "secondaryPositions": [
      "CF"
    ],
    "roleTags": [
      "Explosive finisher",
      "Channel runner",
      "Tournament scorer"
    ],
    "ratings": {
      "attack": 92,
      "creation": 68,
      "control": 70,
      "defense": 29,
      "goalkeeping": 4,
      "physical": 85,
      "press": 65,
      "bigGame": 90
    },
    "peakWindow": "1998-2008",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "England striker across the 1998 breakthrough and 2000s tournament cycles."
  },
  {
    "contextId": "rooney_england_2000s",
    "personId": "wayne_rooney",
    "displayName": "Wayne Rooney",
    "teamType": "nation",
    "teamName": "England",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "England",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 2003,
    "endYear": 2018,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros",
      "world_cup"
    ],
    "positions": [
      "ST",
      "CF",
      "AM",
      "LW"
    ],
    "primaryPositions": [
      "CF"
    ],
    "secondaryPositions": [
      "ST",
      "AM",
      "LW"
    ],
    "roleTags": [
      "Complete forward",
      "Pressing",
      "Creator"
    ],
    "ratings": {
      "attack": 91,
      "creation": 86,
      "control": 82,
      "defense": 33,
      "goalkeeping": 4,
      "physical": 87,
      "press": 86,
      "bigGame": 89
    },
    "peakWindow": "2003-2018",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "England forward from Euro 2004 breakout through the 2006 and 2010 World Cup cycles."
  },
  {
    "contextId": "sorin_argentina_2000s",
    "personId": "juan_pablo_sorin",
    "displayName": "Juan Pablo Sorin",
    "teamType": "nation",
    "teamName": "Argentina",
    "country": "Argentina",
    "competitionContexts": [
      {
        "competition": "Copa America",
        "team": "Argentina",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Argentina",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 1995,
    "endYear": 2006,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "copa_america",
      "world_cup"
    ],
    "positions": [
      "LB",
      "LWB",
      "LM"
    ],
    "primaryPositions": [
      "LB"
    ],
    "secondaryPositions": [
      "LWB",
      "LM"
    ],
    "roleTags": [
      "Attacking fullback",
      "Wide engine",
      "Captain"
    ],
    "ratings": {
      "attack": 68,
      "creation": 82,
      "control": 71,
      "defense": 84,
      "goalkeeping": 5,
      "physical": 88,
      "press": 79,
      "bigGame": 88
    },
    "peakWindow": "1995-2006",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Argentina left-sided defender and wingback across Copa America and World Cup cycles."
  },
  {
    "contextId": "zanetti_argentina_2000s",
    "personId": "javier_zanetti",
    "displayName": "Javier Zanetti",
    "teamType": "nation",
    "teamName": "Argentina",
    "country": "Argentina",
    "competitionContexts": [
      {
        "competition": "Copa America",
        "team": "Argentina",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Argentina",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 1994,
    "endYear": 2011,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "copa_america",
      "world_cup"
    ],
    "positions": [
      "RB",
      "RWB",
      "LB",
      "DM"
    ],
    "primaryPositions": [
      "RB"
    ],
    "secondaryPositions": [
      "RWB",
      "LB",
      "DM"
    ],
    "roleTags": [
      "Two-way fullback",
      "Engine",
      "Wide security"
    ],
    "ratings": {
      "attack": 58,
      "creation": 69,
      "control": 84,
      "defense": 90,
      "goalkeeping": 5,
      "physical": 91,
      "press": 88,
      "bigGame": 91
    },
    "peakWindow": "1994-2011",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Argentina all-phase fullback and Copa America veteran."
  },
  {
    "contextId": "dani_alves_brazil_2010s",
    "personId": "dani_alves",
    "displayName": "Dani Alves",
    "teamType": "nation",
    "teamName": "Brazil",
    "country": "Brazil",
    "competitionContexts": [
      {
        "competition": "Copa America",
        "team": "Brazil",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Brazil",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2006,
    "endYear": 2022,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "copa_america",
      "world_cup"
    ],
    "positions": [
      "RB",
      "RWB",
      "RM"
    ],
    "primaryPositions": [
      "RB"
    ],
    "secondaryPositions": [
      "RWB",
      "RM"
    ],
    "roleTags": [
      "Attacking fullback",
      "Controller",
      "Wide creator"
    ],
    "ratings": {
      "attack": 70,
      "creation": 88,
      "control": 88,
      "defense": 84,
      "goalkeeping": 5,
      "physical": 86,
      "press": 82,
      "bigGame": 90
    },
    "peakWindow": "2006-2022",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Brazil right-back and Copa America-winning fullback context."
  },
  {
    "contextId": "assou_ekotto_cameroon_2010s",
    "personId": "benoit_assou_ekotto",
    "displayName": "Benoit Assou-Ekotto",
    "teamType": "nation",
    "teamName": "Cameroon",
    "country": "Cameroon",
    "competitionContexts": [
      {
        "competition": "AFCON",
        "team": "Cameroon",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Cameroon",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2009,
    "endYear": 2014,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "afcon",
      "world_cup"
    ],
    "positions": [
      "LB",
      "LWB"
    ],
    "primaryPositions": [
      "LB"
    ],
    "secondaryPositions": [
      "LWB"
    ],
    "roleTags": [
      "Left back",
      "Wide defender",
      "Recovery pace"
    ],
    "ratings": {
      "attack": 53,
      "creation": 63,
      "control": 67,
      "defense": 84,
      "goalkeeping": 5,
      "physical": 84,
      "press": 74,
      "bigGame": 82
    },
    "peakWindow": "2009-2014",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Cameroon left-back used to deepen AFCON left-side coverage."
  },
  {
    "contextId": "boka_ivory_coast_2000s",
    "personId": "arthur_boka",
    "displayName": "Arthur Boka",
    "teamType": "nation",
    "teamName": "Ivory Coast",
    "country": "Ivory Coast",
    "competitionContexts": [
      {
        "competition": "AFCON",
        "team": "Ivory Coast",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Ivory Coast",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 2004,
    "endYear": 2014,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "afcon",
      "world_cup"
    ],
    "positions": [
      "LB",
      "LWB",
      "LM"
    ],
    "primaryPositions": [
      "LB"
    ],
    "secondaryPositions": [
      "LWB",
      "LM"
    ],
    "roleTags": [
      "Left back",
      "Wide engine",
      "Set-piece option"
    ],
    "ratings": {
      "attack": 53,
      "creation": 76,
      "control": 67,
      "defense": 83,
      "goalkeeping": 5,
      "physical": 86,
      "press": 74,
      "bigGame": 82
    },
    "peakWindow": "2004-2014",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Ivory Coast left-back across AFCON and World Cup squads."
  },
  {
    "contextId": "lahm_bayern_club_world_cup_2010s",
    "personId": "philipp_lahm",
    "displayName": "Philipp Lahm",
    "teamType": "club",
    "teamName": "Bayern Munich",
    "league": "Bundesliga",
    "country": "Germany",
    "competitionContexts": [
      {
        "competition": "Club World Cup",
        "team": "Bayern Munich",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "UCL",
        "team": "Bayern Munich",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "Bundesliga",
        "team": "Bayern Munich",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2012,
    "endYear": 2014,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "club_world_cup",
      "champions_league",
      "bundesliga"
    ],
    "positions": [
      "RB",
      "RWB",
      "LB",
      "DM"
    ],
    "primaryPositions": [
      "RB"
    ],
    "secondaryPositions": [
      "RWB",
      "LB",
      "DM"
    ],
    "roleTags": [
      "Inverted fullback",
      "Controller",
      "Captain"
    ],
    "ratings": {
      "attack": 59,
      "creation": 82,
      "control": 90,
      "defense": 91,
      "goalkeeping": 5,
      "physical": 88,
      "press": 83,
      "bigGame": 93
    },
    "peakWindow": "2012-2014",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Bayern treble captain and Club World Cup fullback/control context."
  },
  {
    "contextId": "alaba_bayern_club_world_cup_2010s",
    "personId": "david_alaba",
    "displayName": "David Alaba",
    "teamType": "club",
    "teamName": "Bayern Munich",
    "league": "Bundesliga",
    "country": "Germany",
    "competitionContexts": [
      {
        "competition": "Club World Cup",
        "team": "Bayern Munich",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "UCL",
        "team": "Bayern Munich",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "Bundesliga",
        "team": "Bayern Munich",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2011,
    "endYear": 2021,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "club_world_cup",
      "champions_league",
      "bundesliga"
    ],
    "positions": [
      "LB",
      "LWB",
      "CB",
      "CM"
    ],
    "primaryPositions": [
      "LB"
    ],
    "secondaryPositions": [
      "LWB",
      "CB",
      "CM"
    ],
    "roleTags": [
      "Two-way fullback",
      "Ball progression",
      "Back-line cover"
    ],
    "ratings": {
      "attack": 58,
      "creation": 84,
      "control": 86,
      "defense": 88,
      "goalkeeping": 5,
      "physical": 88,
      "press": 82,
      "bigGame": 91
    },
    "peakWindow": "2011-2021",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Bayern Club World Cup winner and left-back/center-back hybrid."
  },
  {
    "contextId": "messi_barcelona_2010s",
    "personId": "lionel_messi",
    "displayName": "Lionel Messi",
    "teamType": "club",
    "teamName": "Barcelona",
    "league": "LaLiga",
    "country": "Spain",
    "competitionContexts": [
      {
        "competition": "Club World Cup",
        "team": "Barcelona",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "UCL",
        "team": "Barcelona",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "LaLiga",
        "team": "Barcelona",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2008,
    "endYear": 2021,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "club_world_cup",
      "champions_league",
      "laliga"
    ],
    "positions": [
      "RW",
      "CF",
      "AM"
    ],
    "primaryPositions": [
      "RW"
    ],
    "secondaryPositions": [
      "CF",
      "AM"
    ],
    "roleTags": [
      "Creator",
      "Elite scorer",
      "Club world champion"
    ],
    "ratings": {
      "attack": 100,
      "creation": 100,
      "control": 98,
      "defense": 43,
      "goalkeeping": 5,
      "physical": 89,
      "press": 80,
      "bigGame": 96
    },
    "peakWindow": "2008-2021",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Barcelona Club World Cup-winning attacker merged onto the curated peak context."
  },
  {
    "contextId": "neymar_barcelona_2010s",
    "personId": "neymar",
    "displayName": "Neymar",
    "teamType": "club",
    "teamName": "Barcelona",
    "league": "LaLiga",
    "country": "Spain",
    "competitionContexts": [
      {
        "competition": "Club World Cup",
        "team": "Barcelona",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "UCL",
        "team": "Barcelona",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "LaLiga",
        "team": "Barcelona",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2013,
    "endYear": 2017,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "club_world_cup",
      "champions_league",
      "laliga"
    ],
    "positions": [
      "LW",
      "RW",
      "AM"
    ],
    "primaryPositions": [
      "LW"
    ],
    "secondaryPositions": [
      "RW",
      "AM"
    ],
    "roleTags": [
      "Dribbler",
      "Creator",
      "Club world champion"
    ],
    "ratings": {
      "attack": 93,
      "creation": 94,
      "control": 90,
      "defense": 41,
      "goalkeeping": 4,
      "physical": 83,
      "press": 75,
      "bigGame": 91
    },
    "peakWindow": "2013-2017",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Barcelona MSN-era Club World Cup attacker merged onto the curated peak context."
  },
  {
    "contextId": "suarez_barcelona_2010s",
    "personId": "luis_suarez",
    "displayName": "Luis Suarez",
    "teamType": "club",
    "teamName": "Barcelona",
    "league": "LaLiga",
    "country": "Spain",
    "competitionContexts": [
      {
        "competition": "Club World Cup",
        "team": "Barcelona",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "UCL",
        "team": "Barcelona",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "LaLiga",
        "team": "Barcelona",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2014,
    "endYear": 2020,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "club_world_cup",
      "champions_league",
      "laliga"
    ],
    "positions": [
      "ST",
      "CF",
      "RW"
    ],
    "primaryPositions": [
      "ST"
    ],
    "secondaryPositions": [
      "CF",
      "RW"
    ],
    "roleTags": [
      "Elite scorer",
      "Link play",
      "Club world champion"
    ],
    "ratings": {
      "attack": 97,
      "creation": 80,
      "control": 73,
      "defense": 30,
      "goalkeeping": 4,
      "physical": 90,
      "press": 78,
      "bigGame": 91
    },
    "peakWindow": "2014-2020",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Barcelona Club World Cup striker merged onto the curated peak context."
  },
  {
    "contextId": "rodrygo_real_madrid_2020s",
    "personId": "rodrygo",
    "displayName": "Rodrygo",
    "teamType": "club",
    "teamName": "Real Madrid",
    "league": "LaLiga",
    "country": "Spain",
    "competitionContexts": [
      {
        "competition": "Club World Cup",
        "team": "Real Madrid",
        "eraLabel": "2020s",
        "role": "impact"
      },
      {
        "competition": "UCL",
        "team": "Real Madrid",
        "eraLabel": "2020s",
        "role": "impact"
      },
      {
        "competition": "LaLiga",
        "team": "Real Madrid",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2019,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "club_world_cup",
      "champions_league",
      "laliga"
    ],
    "positions": [
      "RW",
      "LW",
      "CF"
    ],
    "primaryPositions": [
      "RW"
    ],
    "secondaryPositions": [
      "LW",
      "CF"
    ],
    "roleTags": [
      "Wide scorer",
      "Big-game runner",
      "Flexible forward"
    ],
    "ratings": {
      "attack": 90,
      "creation": 84,
      "control": 86,
      "defense": 39,
      "goalkeeping": 4,
      "physical": 80,
      "press": 72,
      "bigGame": 92
    },
    "peakWindow": "2019-2026",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Real Madrid Club World Cup and Champions League wide-forward context."
  },
  {
    "contextId": "giuly_monaco_2000s",
    "personId": "ludovic_giuly",
    "displayName": "Ludovic Giuly",
    "teamType": "club",
    "teamName": "Monaco",
    "league": "Ligue 1",
    "country": "France",
    "competitionContexts": [
      {
        "competition": "Ligue 1",
        "team": "Monaco",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "UCL",
        "team": "Monaco",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 1998,
    "endYear": 2004,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "ligue_1",
      "champions_league"
    ],
    "positions": [
      "RW",
      "RM",
      "CF",
      "AM"
    ],
    "primaryPositions": [
      "RW"
    ],
    "secondaryPositions": [
      "RM",
      "CF",
      "AM"
    ],
    "roleTags": [
      "Right-sided attacker",
      "Runner",
      "European finalist"
    ],
    "ratings": {
      "attack": 86,
      "creation": 84,
      "control": 80,
      "defense": 38,
      "goalkeeping": 4,
      "physical": 78,
      "press": 78,
      "bigGame": 88
    },
    "peakWindow": "1998-2004",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Monaco right-sided attacker and 2004 Champions League finalist."
  },
  {
    "contextId": "lucas_moura_psg_2010s",
    "personId": "lucas_moura",
    "displayName": "Lucas Moura",
    "teamType": "club",
    "teamName": "PSG",
    "league": "Ligue 1",
    "country": "France",
    "competitionContexts": [
      {
        "competition": "Ligue 1",
        "team": "PSG",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "UCL",
        "team": "PSG",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2013,
    "endYear": 2018,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "ligue_1",
      "champions_league"
    ],
    "positions": [
      "RW",
      "RM",
      "LW"
    ],
    "primaryPositions": [
      "RW"
    ],
    "secondaryPositions": [
      "RM",
      "LW"
    ],
    "roleTags": [
      "Dribbler",
      "Wide runner",
      "Transition threat"
    ],
    "ratings": {
      "attack": 84,
      "creation": 82,
      "control": 79,
      "defense": 38,
      "goalkeeping": 4,
      "physical": 88,
      "press": 78,
      "bigGame": 81
    },
    "peakWindow": "2013-2018",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "PSG wide attacker used to deepen Ligue 1 right-side draft coverage."
  },
  {
    "contextId": "dani_alves_psg_2010s",
    "personId": "dani_alves",
    "displayName": "Dani Alves",
    "teamType": "club",
    "teamName": "PSG",
    "league": "Ligue 1",
    "country": "France",
    "competitionContexts": [
      {
        "competition": "Ligue 1",
        "team": "PSG",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "UCL",
        "team": "PSG",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2017,
    "endYear": 2019,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "ligue_1",
      "champions_league"
    ],
    "positions": [
      "RB",
      "RWB",
      "RM"
    ],
    "primaryPositions": [
      "RB"
    ],
    "secondaryPositions": [
      "RWB",
      "RM"
    ],
    "roleTags": [
      "Attacking fullback",
      "Wide creator",
      "Title veteran"
    ],
    "ratings": {
      "attack": 70,
      "creation": 86,
      "control": 86,
      "defense": 82,
      "goalkeeping": 5,
      "physical": 83,
      "press": 79,
      "bigGame": 88
    },
    "peakWindow": "2017-2019",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "PSG right-back context for late-career Ligue 1 title sides."
  },
  {
    "contextId": "cavani_psg_2010s",
    "personId": "edinson_cavani",
    "displayName": "Edinson Cavani",
    "teamType": "club",
    "teamName": "PSG",
    "league": "Ligue 1",
    "country": "France",
    "competitionContexts": [
      {
        "competition": "Ligue 1",
        "team": "PSG",
        "eraLabel": "2010s",
        "role": "impact"
      },
      {
        "competition": "UCL",
        "team": "PSG",
        "eraLabel": "2010s",
        "role": "impact"
      }
    ],
    "startYear": 2013,
    "endYear": 2020,
    "decade": "2010s",
    "eraLabel": "2010s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "ligue_1",
      "champions_league"
    ],
    "positions": [
      "ST",
      "CF",
      "RW"
    ],
    "primaryPositions": [
      "ST"
    ],
    "secondaryPositions": [
      "CF",
      "RW"
    ],
    "roleTags": [
      "Box finisher",
      "Pressing forward",
      "Wide-channel runner"
    ],
    "ratings": {
      "attack": 94,
      "creation": 68,
      "control": 70,
      "defense": 29,
      "goalkeeping": 4,
      "physical": 86,
      "press": 84,
      "bigGame": 88
    },
    "peakWindow": "2013-2020",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "PSG record-scoring forward with enough wide-channel work for draft flexibility."
  },
  {
    "contextId": "zambrotta_italy_2000s",
    "personId": "gianluca_zambrotta",
    "displayName": "Gianluca Zambrotta",
    "teamType": "nation",
    "teamName": "Italy",
    "country": "Italy",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "Italy",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "Italy",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 1999,
    "endYear": 2010,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros",
      "world_cup"
    ],
    "positions": [
      "RB",
      "RWB",
      "LB",
      "LWB"
    ],
    "primaryPositions": [
      "RB"
    ],
    "secondaryPositions": [
      "RWB",
      "LB",
      "LWB"
    ],
    "roleTags": [
      "Two-way fullback",
      "Wide balance",
      "Tournament defender"
    ],
    "ratings": {
      "attack": 57,
      "creation": 80,
      "control": 72,
      "defense": 89,
      "goalkeeping": 5,
      "physical": 88,
      "press": 81,
      "bigGame": 91
    },
    "peakWindow": "1999-2010",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Italy tournament fullback across Euros and the 2006 World Cup-winning cycle."
  },
  {
    "contextId": "thuram_france_2000s",
    "personId": "lilian_thuram",
    "displayName": "Lilian Thuram",
    "teamType": "nation",
    "teamName": "France",
    "country": "France",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "France",
        "eraLabel": "2000s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "France",
        "eraLabel": "2000s",
        "role": "impact"
      }
    ],
    "startYear": 1994,
    "endYear": 2008,
    "decade": "2000s",
    "eraLabel": "2000s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros",
      "world_cup"
    ],
    "positions": [
      "RB",
      "CB",
      "RWB"
    ],
    "primaryPositions": [
      "RB"
    ],
    "secondaryPositions": [
      "CB",
      "RWB"
    ],
    "roleTags": [
      "Lockdown defender",
      "Recovery pace",
      "Tournament leader"
    ],
    "ratings": {
      "attack": 58,
      "creation": 70,
      "control": 74,
      "defense": 94,
      "goalkeeping": 5,
      "physical": 90,
      "press": 82,
      "bigGame": 94
    },
    "peakWindow": "1994-2008",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "France right-back and center-back across Euro-winning and World Cup finalist sides."
  },
  {
    "contextId": "walker_england_2020s",
    "personId": "kyle_walker",
    "displayName": "Kyle Walker",
    "teamType": "nation",
    "teamName": "England",
    "country": "England",
    "competitionContexts": [
      {
        "competition": "Euros",
        "team": "England",
        "eraLabel": "2020s",
        "role": "impact"
      },
      {
        "competition": "World Cup",
        "team": "England",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2011,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "world_xi",
      "ball_knowledge",
      "euros",
      "world_cup"
    ],
    "positions": [
      "RB",
      "RWB",
      "CB"
    ],
    "primaryPositions": [
      "RB"
    ],
    "secondaryPositions": [
      "RWB",
      "CB"
    ],
    "roleTags": [
      "Recovery pace",
      "Wide stopper",
      "Back-three cover"
    ],
    "ratings": {
      "attack": 56,
      "creation": 67,
      "control": 71,
      "defense": 88,
      "goalkeeping": 5,
      "physical": 94,
      "press": 84,
      "bigGame": 88
    },
    "peakWindow": "2011-2026",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "England right-back and wide center-back across recent Euro runs."
  },
  {
    "contextId": "joe_willis_nashville_2020s",
    "personId": "joe_willis",
    "displayName": "Joe Willis",
    "teamType": "club",
    "teamName": "Nashville SC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Nashville SC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2020,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "GK"
    ],
    "primaryPositions": [
      "GK"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Shot-stopper",
      "Box command",
      "MLS veteran"
    ],
    "ratings": {
      "attack": 15,
      "creation": 35,
      "control": 48,
      "defense": 51,
      "goalkeeping": 76,
      "physical": 65,
      "press": 40,
      "bigGame": 72
    },
    "peakWindow": "2020-2026",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Nashville starting goalkeeper context for the club's MLS era."
  },
  {
    "contextId": "walker_zimmerman_nashville_2020s",
    "personId": "walker_zimmerman",
    "displayName": "Walker Zimmerman",
    "teamType": "club",
    "teamName": "Nashville SC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Nashville SC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2020,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "CB"
    ],
    "primaryPositions": [
      "CB"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Aerial defender",
      "Line leader",
      "Set-piece threat"
    ],
    "ratings": {
      "attack": 31,
      "creation": 51,
      "control": 59,
      "defense": 80,
      "goalkeeping": 4,
      "physical": 82,
      "press": 62,
      "bigGame": 77
    },
    "peakWindow": "2020-2026",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Nashville defensive leader and MLS Best XI level center-back."
  },
  {
    "contextId": "dave_romney_nashville_2020s",
    "personId": "dave_romney",
    "displayName": "Dave Romney",
    "teamType": "club",
    "teamName": "Nashville SC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Nashville SC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2020,
    "endYear": 2022,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "CB",
      "LB"
    ],
    "primaryPositions": [
      "CB"
    ],
    "secondaryPositions": [
      "LB"
    ],
    "roleTags": [
      "Cover defender",
      "Back-line balance",
      "Durable starter"
    ],
    "ratings": {
      "attack": 29,
      "creation": 47,
      "control": 54,
      "defense": 75,
      "goalkeeping": 3,
      "physical": 74,
      "press": 57,
      "bigGame": 71
    },
    "peakWindow": "2020-2022",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Nashville early MLS center-back with left-side flexibility."
  },
  {
    "contextId": "daniel_lovitz_nashville_2020s",
    "personId": "daniel_lovitz",
    "displayName": "Daniel Lovitz",
    "teamType": "club",
    "teamName": "Nashville SC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Nashville SC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2020,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "LB",
      "LWB"
    ],
    "primaryPositions": [
      "LB"
    ],
    "secondaryPositions": [
      "LWB"
    ],
    "roleTags": [
      "Wide defender",
      "Crossing support",
      "Defensive balance"
    ],
    "ratings": {
      "attack": 45,
      "creation": 68,
      "control": 57,
      "defense": 74,
      "goalkeeping": 4,
      "physical": 73,
      "press": 64,
      "bigGame": 64
    },
    "peakWindow": "2020-2026",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Nashville left-back context with steady MLS minutes."
  },
  {
    "contextId": "shaq_moore_nashville_2020s",
    "personId": "shaq_moore",
    "displayName": "Shaq Moore",
    "teamType": "club",
    "teamName": "Nashville SC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Nashville SC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2022,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "RB",
      "RWB"
    ],
    "primaryPositions": [
      "RB"
    ],
    "secondaryPositions": [
      "RWB"
    ],
    "roleTags": [
      "Two-way fullback",
      "Wide runner",
      "Recovery pace"
    ],
    "ratings": {
      "attack": 46,
      "creation": 55,
      "control": 58,
      "defense": 73,
      "goalkeeping": 4,
      "physical": 78,
      "press": 74,
      "bigGame": 65
    },
    "peakWindow": "2022-2026",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Nashville and USMNT right-back profile for modern MLS rolls."
  },
  {
    "contextId": "dax_mccarty_nashville_2020s",
    "personId": "dax_mccarty",
    "displayName": "Dax McCarty",
    "teamType": "club",
    "teamName": "Nashville SC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Nashville SC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2020,
    "endYear": 2023,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "DM",
      "CM"
    ],
    "primaryPositions": [
      "DM"
    ],
    "secondaryPositions": [
      "CM"
    ],
    "roleTags": [
      "Ball-winner",
      "Organizer",
      "Tempo setter"
    ],
    "ratings": {
      "attack": 41,
      "creation": 61,
      "control": 76,
      "defense": 76,
      "goalkeeping": 3,
      "physical": 70,
      "press": 75,
      "bigGame": 75
    },
    "peakWindow": "2020-2023",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Veteran Nashville holding midfielder and MLS organizer."
  },
  {
    "contextId": "anibal_godoy_nashville_2020s",
    "personId": "anibal_godoy",
    "displayName": "Anibal Godoy",
    "teamType": "club",
    "teamName": "Nashville SC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Nashville SC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2020,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "DM",
      "CM"
    ],
    "primaryPositions": [
      "DM"
    ],
    "secondaryPositions": [
      "CM"
    ],
    "roleTags": [
      "Ball-winner",
      "Connector",
      "Duel winner"
    ],
    "ratings": {
      "attack": 40,
      "creation": 60,
      "control": 73,
      "defense": 74,
      "goalkeeping": 3,
      "physical": 76,
      "press": 70,
      "bigGame": 68
    },
    "peakWindow": "2020-2026",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Nashville central midfielder with defensive coverage."
  },
  {
    "contextId": "sean_davis_nashville_2020s",
    "personId": "sean_davis",
    "displayName": "Sean Davis",
    "teamType": "club",
    "teamName": "Nashville SC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Nashville SC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2022,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "CM",
      "DM"
    ],
    "primaryPositions": [
      "CM"
    ],
    "secondaryPositions": [
      "DM"
    ],
    "roleTags": [
      "Connector",
      "Pressing midfielder",
      "Second-ball winner"
    ],
    "ratings": {
      "attack": 54,
      "creation": 69,
      "control": 73,
      "defense": 70,
      "goalkeeping": 3,
      "physical": 64,
      "press": 75,
      "bigGame": 67
    },
    "peakWindow": "2022-2026",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Nashville central midfield depth context."
  },
  {
    "contextId": "brian_anunga_nashville_2020s",
    "personId": "brian_anunga",
    "displayName": "Brian Anunga",
    "teamType": "club",
    "teamName": "Nashville SC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Nashville SC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2020,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "DM",
      "CM"
    ],
    "primaryPositions": [
      "DM"
    ],
    "secondaryPositions": [
      "CM"
    ],
    "roleTags": [
      "Ball-winner",
      "Physical midfielder",
      "Rotation piece"
    ],
    "ratings": {
      "attack": 38,
      "creation": 57,
      "control": 68,
      "defense": 72,
      "goalkeeping": 3,
      "physical": 76,
      "press": 72,
      "bigGame": 65
    },
    "peakWindow": "2020-2026",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Nashville defensive-midfield coverage for MLS draft depth."
  },
  {
    "contextId": "hany_mukhtar_nashville_2020s",
    "personId": "hany_mukhtar",
    "displayName": "Hany Mukhtar",
    "teamType": "club",
    "teamName": "Nashville SC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Nashville SC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2020,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "AM",
      "CF",
      "LW"
    ],
    "primaryPositions": [
      "AM"
    ],
    "secondaryPositions": [
      "CF",
      "LW"
    ],
    "roleTags": [
      "Creator",
      "Transition scorer",
      "MVP-level attacker"
    ],
    "ratings": {
      "attack": 82,
      "creation": 84,
      "control": 82,
      "defense": 39,
      "goalkeeping": 4,
      "physical": 65,
      "press": 62,
      "bigGame": 82
    },
    "peakWindow": "2020-2026",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Nashville attacking centerpiece and MLS MVP-level creator."
  },
  {
    "contextId": "randall_leal_nashville_2020s",
    "personId": "randall_leal",
    "displayName": "Randall Leal",
    "teamType": "club",
    "teamName": "Nashville SC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Nashville SC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2020,
    "endYear": 2024,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "LW",
      "RW",
      "AM"
    ],
    "primaryPositions": [
      "LW"
    ],
    "secondaryPositions": [
      "RW",
      "AM"
    ],
    "roleTags": [
      "Wide creator",
      "Carrier",
      "Final-third connector"
    ],
    "ratings": {
      "attack": 75,
      "creation": 76,
      "control": 75,
      "defense": 32,
      "goalkeeping": 3,
      "physical": 66,
      "press": 59,
      "bigGame": 69
    },
    "peakWindow": "2020-2024",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Nashville wide attacking context from the early MLS seasons."
  },
  {
    "contextId": "jacob_shaffelburg_nashville_2020s",
    "personId": "jacob_shaffelburg",
    "displayName": "Jacob Shaffelburg",
    "teamType": "club",
    "teamName": "Nashville SC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Nashville SC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2022,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "LW",
      "LM"
    ],
    "primaryPositions": [
      "LW"
    ],
    "secondaryPositions": [
      "LM"
    ],
    "roleTags": [
      "Wide runner",
      "Direct winger",
      "Transition outlet"
    ],
    "ratings": {
      "attack": 75,
      "creation": 71,
      "control": 67,
      "defense": 32,
      "goalkeeping": 3,
      "physical": 79,
      "press": 75,
      "bigGame": 69
    },
    "peakWindow": "2022-2026",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Nashville left-sided runner and Canada international profile."
  },
  {
    "contextId": "alex_muyl_nashville_2020s",
    "personId": "alex_muyl",
    "displayName": "Alex Muyl",
    "teamType": "club",
    "teamName": "Nashville SC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Nashville SC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2020,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "RM",
      "RW",
      "RB"
    ],
    "primaryPositions": [
      "RM"
    ],
    "secondaryPositions": [
      "RW",
      "RB"
    ],
    "roleTags": [
      "Pressing winger",
      "Wingback cover",
      "Work-rate player"
    ],
    "ratings": {
      "attack": 60,
      "creation": 65,
      "control": 62,
      "defense": 68,
      "goalkeeping": 3,
      "physical": 75,
      "press": 78,
      "bigGame": 64
    },
    "peakWindow": "2020-2026",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Nashville right-sided utility profile."
  },
  {
    "contextId": "cj_sapong_nashville_2020s",
    "personId": "cj_sapong",
    "displayName": "CJ Sapong",
    "teamType": "club",
    "teamName": "Nashville SC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Nashville SC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2021,
    "endYear": 2023,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "ST",
      "CF"
    ],
    "primaryPositions": [
      "ST"
    ],
    "secondaryPositions": [
      "CF"
    ],
    "roleTags": [
      "Target forward",
      "Pressing striker",
      "Box presence"
    ],
    "ratings": {
      "attack": 74,
      "creation": 55,
      "control": 56,
      "defense": 23,
      "goalkeeping": 3,
      "physical": 80,
      "press": 73,
      "bigGame": 70
    },
    "peakWindow": "2021-2023",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Nashville striker context with MLS veteran scoring history."
  },
  {
    "contextId": "sam_surridge_nashville_2020s",
    "personId": "sam_surridge",
    "displayName": "Sam Surridge",
    "teamType": "club",
    "teamName": "Nashville SC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Nashville SC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2023,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "ST",
      "CF"
    ],
    "primaryPositions": [
      "ST"
    ],
    "secondaryPositions": [
      "CF"
    ],
    "roleTags": [
      "Box finisher",
      "Penalty-box striker",
      "Aerial target"
    ],
    "ratings": {
      "attack": 77,
      "creation": 56,
      "control": 57,
      "defense": 24,
      "goalkeeping": 3,
      "physical": 76,
      "press": 54,
      "bigGame": 73
    },
    "peakWindow": "2023-2026",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Nashville modern center-forward option."
  },
  {
    "contextId": "teal_bunbury_nashville_2020s",
    "personId": "teal_bunbury",
    "displayName": "Teal Bunbury",
    "teamType": "club",
    "teamName": "Nashville SC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Nashville SC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2022,
    "endYear": 2024,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "ST",
      "RW",
      "CF"
    ],
    "primaryPositions": [
      "ST"
    ],
    "secondaryPositions": [
      "RW",
      "CF"
    ],
    "roleTags": [
      "Forward depth",
      "Wide-channel runner",
      "Veteran finisher"
    ],
    "ratings": {
      "attack": 71,
      "creation": 53,
      "control": 54,
      "defense": 22,
      "goalkeeping": 3,
      "physical": 75,
      "press": 70,
      "bigGame": 67
    },
    "peakWindow": "2022-2024",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Nashville forward depth and wide-forward coverage."
  },
  {
    "contextId": "drake_callender_inter_miami_2020s",
    "personId": "drake_callender",
    "displayName": "Drake Callender",
    "teamType": "club",
    "teamName": "Inter Miami",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Inter Miami",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2020,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "GK"
    ],
    "primaryPositions": [
      "GK"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Shot-stopper",
      "Penalty presence",
      "Modern keeper"
    ],
    "ratings": {
      "attack": 15,
      "creation": 36,
      "control": 49,
      "defense": 53,
      "goalkeeping": 78,
      "physical": 66,
      "press": 41,
      "bigGame": 76
    },
    "peakWindow": "2020-2026",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Inter Miami starting goalkeeper context."
  },
  {
    "contextId": "jordi_alba_inter_miami_2020s",
    "personId": "jordi_alba",
    "displayName": "Jordi Alba",
    "teamType": "club",
    "teamName": "Inter Miami",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Inter Miami",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2023,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "LB",
      "LWB"
    ],
    "primaryPositions": [
      "LB"
    ],
    "secondaryPositions": [
      "LWB"
    ],
    "roleTags": [
      "Attacking fullback",
      "Wide creator",
      "Recovery runner"
    ],
    "ratings": {
      "attack": 51,
      "creation": 84,
      "control": 64,
      "defense": 78,
      "goalkeeping": 5,
      "physical": 78,
      "press": 72,
      "bigGame": 82
    },
    "peakWindow": "2023-2026",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Inter Miami attacking left-back context from the club's star era."
  },
  {
    "contextId": "sergio_busquets_inter_miami_2020s",
    "personId": "sergio_busquets",
    "displayName": "Sergio Busquets",
    "teamType": "club",
    "teamName": "Inter Miami",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Inter Miami",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2023,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "DM",
      "CM"
    ],
    "primaryPositions": [
      "DM"
    ],
    "secondaryPositions": [
      "CM"
    ],
    "roleTags": [
      "Controller",
      "Press resistance",
      "Defensive screen"
    ],
    "ratings": {
      "attack": 45,
      "creation": 82,
      "control": 88,
      "defense": 78,
      "goalkeeping": 4,
      "physical": 77,
      "press": 79,
      "bigGame": 84
    },
    "peakWindow": "2023-2026",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Inter Miami midfield controller context."
  },
  {
    "contextId": "diego_gomez_inter_miami_2020s",
    "personId": "diego_gomez",
    "displayName": "Diego Gomez",
    "teamType": "club",
    "teamName": "Inter Miami",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Inter Miami",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2023,
    "endYear": 2024,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "CM",
      "AM"
    ],
    "primaryPositions": [
      "CM"
    ],
    "secondaryPositions": [
      "AM"
    ],
    "roleTags": [
      "Box-to-box",
      "Carrier",
      "Pressing midfielder"
    ],
    "ratings": {
      "attack": 57,
      "creation": 73,
      "control": 77,
      "defense": 60,
      "goalkeeping": 3,
      "physical": 79,
      "press": 77,
      "bigGame": 71
    },
    "peakWindow": "2023-2024",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Inter Miami energetic midfield context."
  },
  {
    "contextId": "lionel_messi_inter_miami_2020s",
    "personId": "lionel_messi",
    "displayName": "Lionel Messi",
    "teamType": "club",
    "teamName": "Inter Miami",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Inter Miami",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2023,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "RW",
      "CF",
      "AM"
    ],
    "primaryPositions": [
      "RW"
    ],
    "secondaryPositions": [
      "CF",
      "AM"
    ],
    "roleTags": [
      "Creator",
      "Elite scorer",
      "Set pieces"
    ],
    "ratings": {
      "attack": 91,
      "creation": 93,
      "control": 91,
      "defense": 39,
      "goalkeeping": 4,
      "physical": 80,
      "press": 72,
      "bigGame": 90
    },
    "peakWindow": "2023-2026",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Inter Miami star-era attacking reference."
  },
  {
    "contextId": "luis_suarez_inter_miami_2020s",
    "personId": "luis_suarez",
    "displayName": "Luis Suarez",
    "teamType": "club",
    "teamName": "Inter Miami",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Inter Miami",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2024,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "ST",
      "CF"
    ],
    "primaryPositions": [
      "ST"
    ],
    "secondaryPositions": [
      "CF"
    ],
    "roleTags": [
      "Box finisher",
      "Link forward",
      "Big-game striker"
    ],
    "ratings": {
      "attack": 87,
      "creation": 78,
      "control": 65,
      "defense": 27,
      "goalkeeping": 4,
      "physical": 80,
      "press": 61,
      "bigGame": 85
    },
    "peakWindow": "2024-2026",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Inter Miami center-forward context."
  },
  {
    "contextId": "hugo_lloris_lafc_2020s",
    "personId": "hugo_lloris",
    "displayName": "Hugo Lloris",
    "teamType": "club",
    "teamName": "LAFC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "LAFC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2024,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "GK"
    ],
    "primaryPositions": [
      "GK"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Shot-stopper",
      "Sweeper keeper",
      "Leader"
    ],
    "ratings": {
      "attack": 16,
      "creation": 38,
      "control": 53,
      "defense": 56,
      "goalkeeping": 84,
      "physical": 71,
      "press": 44,
      "bigGame": 82
    },
    "peakWindow": "2024-2026",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "LAFC goalkeeper context from the club's 2020s era."
  },
  {
    "contextId": "jack_maher_nashville_2020s",
    "personId": "jack_maher",
    "displayName": "Jack Maher",
    "teamType": "club",
    "teamName": "Nashville SC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Nashville SC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2020,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "CB"
    ],
    "primaryPositions": [
      "CB"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Center-back depth",
      "Aerial defender",
      "Back-line cover"
    ],
    "ratings": {
      "attack": 28,
      "creation": 46,
      "control": 53,
      "defense": 72,
      "goalkeeping": 3,
      "physical": 74,
      "press": 56,
      "bigGame": 69
    },
    "peakWindow": "2020-2026",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Nashville center-back context for modern MLS depth."
  },
  {
    "contextId": "lukas_macnaughton_nashville_2020s",
    "personId": "lukas_macnaughton",
    "displayName": "Lukas MacNaughton",
    "teamType": "club",
    "teamName": "Nashville SC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Nashville SC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2023,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "CB"
    ],
    "primaryPositions": [
      "CB"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Stopper",
      "Back-line depth",
      "Duel defender"
    ],
    "ratings": {
      "attack": 28,
      "creation": 46,
      "control": 53,
      "defense": 72,
      "goalkeeping": 3,
      "physical": 75,
      "press": 69,
      "bigGame": 65
    },
    "peakWindow": "2023-2026",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Nashville center-back and Canada international profile."
  },
  {
    "contextId": "fafa_picault_nashville_2020s",
    "personId": "fafa_picault",
    "displayName": "Fafa Picault",
    "teamType": "club",
    "teamName": "Nashville SC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "Nashville SC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2023,
    "endYear": 2024,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "LW",
      "RW",
      "ST"
    ],
    "primaryPositions": [
      "LW"
    ],
    "secondaryPositions": [
      "RW",
      "ST"
    ],
    "roleTags": [
      "Wide runner",
      "Pressing forward",
      "Transition outlet"
    ],
    "ratings": {
      "attack": 72,
      "creation": 68,
      "control": 65,
      "defense": 31,
      "goalkeeping": 3,
      "physical": 78,
      "press": 74,
      "bigGame": 66
    },
    "peakWindow": "2023-2024",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "Nashville wide-forward context with pace and pressing."
  },
  {
    "contextId": "giorgio_chiellini_lafc_2020s",
    "personId": "giorgio_chiellini",
    "displayName": "Giorgio Chiellini",
    "teamType": "club",
    "teamName": "LAFC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "LAFC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2022,
    "endYear": 2023,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "CB"
    ],
    "primaryPositions": [
      "CB"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Line leader",
      "Box defender",
      "Veteran organizer"
    ],
    "ratings": {
      "attack": 33,
      "creation": 54,
      "control": 62,
      "defense": 86,
      "goalkeeping": 4,
      "physical": 78,
      "press": 65,
      "bigGame": 84
    },
    "peakWindow": "2022-2023",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "LAFC veteran center-back and title-era organizer."
  },
  {
    "contextId": "diego_palacios_lafc_2020s",
    "personId": "diego_palacios",
    "displayName": "Diego Palacios",
    "teamType": "club",
    "teamName": "LAFC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "LAFC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2019,
    "endYear": 2023,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "LB",
      "LWB"
    ],
    "primaryPositions": [
      "LB"
    ],
    "secondaryPositions": [
      "LWB"
    ],
    "roleTags": [
      "Wide defender",
      "Overlap runner",
      "Recovery pace"
    ],
    "ratings": {
      "attack": 47,
      "creation": 56,
      "control": 60,
      "defense": 75,
      "goalkeeping": 4,
      "physical": 80,
      "press": 75,
      "bigGame": 66
    },
    "peakWindow": "2019-2023",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "LAFC title-era left-back context."
  },
  {
    "contextId": "ryan_hollingshead_lafc_2020s",
    "personId": "ryan_hollingshead",
    "displayName": "Ryan Hollingshead",
    "teamType": "club",
    "teamName": "LAFC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "LAFC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2022,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "RB",
      "LB",
      "RWB",
      "LWB"
    ],
    "primaryPositions": [
      "RB"
    ],
    "secondaryPositions": [
      "LB",
      "RWB",
      "LWB"
    ],
    "roleTags": [
      "Two-way fullback",
      "Back-post threat",
      "Wide balance"
    ],
    "ratings": {
      "attack": 68,
      "creation": 56,
      "control": 59,
      "defense": 74,
      "goalkeeping": 4,
      "physical": 77,
      "press": 66,
      "bigGame": 66
    },
    "peakWindow": "2022-2026",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "LAFC fullback context with both-side coverage."
  },
  {
    "contextId": "jesus_murillo_lafc_2020s",
    "personId": "jesus_murillo",
    "displayName": "Jesus Murillo",
    "teamType": "club",
    "teamName": "LAFC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "LAFC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2020,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "CB"
    ],
    "primaryPositions": [
      "CB"
    ],
    "secondaryPositions": [],
    "roleTags": [
      "Stopper",
      "Duel defender",
      "Back-line anchor"
    ],
    "ratings": {
      "attack": 30,
      "creation": 49,
      "control": 56,
      "defense": 77,
      "goalkeeping": 3,
      "physical": 79,
      "press": 60,
      "bigGame": 74
    },
    "peakWindow": "2020-2026",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "LAFC center-back coverage for 2020s MLS rolls."
  },
  {
    "contextId": "ilie_sanchez_lafc_2020s",
    "personId": "ilie_sanchez",
    "displayName": "Ilie Sanchez",
    "teamType": "club",
    "teamName": "LAFC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "LAFC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2022,
    "endYear": 2025,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "DM",
      "CM",
      "CB"
    ],
    "primaryPositions": [
      "DM"
    ],
    "secondaryPositions": [
      "CM",
      "CB"
    ],
    "roleTags": [
      "Controller",
      "Defensive screen",
      "Build-up passer"
    ],
    "ratings": {
      "attack": 41,
      "creation": 74,
      "control": 78,
      "defense": 76,
      "goalkeeping": 3,
      "physical": 71,
      "press": 73,
      "bigGame": 71
    },
    "peakWindow": "2022-2025",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "LAFC midfield organizer and defensive connector."
  },
  {
    "contextId": "kellyn_acosta_lafc_2020s",
    "personId": "kellyn_acosta",
    "displayName": "Kellyn Acosta",
    "teamType": "club",
    "teamName": "LAFC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "LAFC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2022,
    "endYear": 2023,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "CM",
      "DM"
    ],
    "primaryPositions": [
      "CM"
    ],
    "secondaryPositions": [
      "DM"
    ],
    "roleTags": [
      "Box-to-box",
      "Set pieces",
      "Ball-winner"
    ],
    "ratings": {
      "attack": 56,
      "creation": 72,
      "control": 75,
      "defense": 74,
      "goalkeeping": 3,
      "physical": 66,
      "press": 76,
      "bigGame": 75
    },
    "peakWindow": "2022-2023",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "LAFC title-season central midfielder."
  },
  {
    "contextId": "eduard_atuesta_lafc_2020s",
    "personId": "eduard_atuesta",
    "displayName": "Eduard Atuesta",
    "teamType": "club",
    "teamName": "LAFC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "LAFC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2018,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "CM",
      "DM"
    ],
    "primaryPositions": [
      "CM"
    ],
    "secondaryPositions": [
      "DM"
    ],
    "roleTags": [
      "Controller",
      "Set pieces",
      "Progressive passer"
    ],
    "ratings": {
      "attack": 57,
      "creation": 77,
      "control": 79,
      "defense": 60,
      "goalkeeping": 3,
      "physical": 67,
      "press": 73,
      "bigGame": 71
    },
    "peakWindow": "2018-2026",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "LAFC central playmaker profile."
  },
  {
    "contextId": "timothy_tillman_lafc_2020s",
    "personId": "timothy_tillman",
    "displayName": "Timothy Tillman",
    "teamType": "club",
    "teamName": "LAFC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "LAFC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2023,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "CM",
      "AM"
    ],
    "primaryPositions": [
      "CM"
    ],
    "secondaryPositions": [
      "AM"
    ],
    "roleTags": [
      "Connector",
      "Carrier",
      "Pressing midfielder"
    ],
    "ratings": {
      "attack": 56,
      "creation": 74,
      "control": 75,
      "defense": 59,
      "goalkeeping": 3,
      "physical": 66,
      "press": 75,
      "bigGame": 69
    },
    "peakWindow": "2023-2026",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "LAFC midfield depth and connector context."
  },
  {
    "contextId": "carlos_vela_lafc_2020s",
    "personId": "carlos_vela",
    "displayName": "Carlos Vela",
    "teamType": "club",
    "teamName": "LAFC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "LAFC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2018,
    "endYear": 2024,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "RW",
      "CF",
      "AM"
    ],
    "primaryPositions": [
      "RW"
    ],
    "secondaryPositions": [
      "CF",
      "AM"
    ],
    "roleTags": [
      "Creator",
      "Elite scorer",
      "Inverted winger"
    ],
    "ratings": {
      "attack": 86,
      "creation": 85,
      "control": 84,
      "defense": 36,
      "goalkeeping": 4,
      "physical": 74,
      "press": 67,
      "bigGame": 83
    },
    "peakWindow": "2018-2024",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "LAFC attacking icon and MVP-level creator."
  },
  {
    "contextId": "denis_bouanga_lafc_2020s",
    "personId": "denis_bouanga",
    "displayName": "Denis Bouanga",
    "teamType": "club",
    "teamName": "LAFC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "LAFC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2022,
    "endYear": 2026,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "LW",
      "RW",
      "ST"
    ],
    "primaryPositions": [
      "LW"
    ],
    "secondaryPositions": [
      "RW",
      "ST"
    ],
    "roleTags": [
      "Wide scorer",
      "Transition runner",
      "Direct attacker"
    ],
    "ratings": {
      "attack": 85,
      "creation": 78,
      "control": 75,
      "defense": 35,
      "goalkeeping": 4,
      "physical": 82,
      "press": 79,
      "bigGame": 81
    },
    "peakWindow": "2022-2026",
    "dataConfidence": "High",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "LAFC high-volume scorer and 2020s attacking reference."
  },
  {
    "contextId": "cristian_arango_lafc_2020s",
    "personId": "cristian_arango",
    "displayName": "Cristian Arango",
    "teamType": "club",
    "teamName": "LAFC",
    "league": "MLS",
    "country": "United States",
    "competitionContexts": [
      {
        "competition": "MLS",
        "team": "LAFC",
        "eraLabel": "2020s",
        "role": "impact"
      }
    ],
    "startYear": 2021,
    "endYear": 2022,
    "decade": "2020s",
    "eraLabel": "2020s",
    "eligibleModes": [
      "mls"
    ],
    "positions": [
      "ST",
      "CF"
    ],
    "primaryPositions": [
      "ST"
    ],
    "secondaryPositions": [
      "CF"
    ],
    "roleTags": [
      "Box finisher",
      "Pressing striker",
      "Penalty-box mover"
    ],
    "ratings": {
      "attack": 82,
      "creation": 59,
      "control": 61,
      "defense": 25,
      "goalkeeping": 4,
      "physical": 78,
      "press": 77,
      "bigGame": 75
    },
    "peakWindow": "2021-2022",
    "dataConfidence": "Medium",
    "ratingSourceConfidence": "legacy-proxy",
    "sourceNotes": [
      "Legacy proxy: manual sourced context",
      "Wikidata SPARQL",
      "OpenFootball players",
      "Manual legend curation"
    ],
    "historicalNotes": "LAFC title-era center-forward context."
  }
]
