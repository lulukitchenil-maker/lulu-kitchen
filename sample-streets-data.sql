-- Sample Streets Data for 11 Delivery Settlements
-- This provides initial street data for testing and demonstration
-- Full streets data should be imported from Israeli government sources

-- Jerusalem Streets (Sample - Jerusalem has 500-1000+ streets)
INSERT INTO streets (city_id, street_name_he, street_name_en)
SELECT c.id, street_name_he, street_name_en
FROM cities c, (VALUES
  ('רחוב הרצל', 'Herzl Street'),
  ('רחוב יפו', 'Jaffa Street'),
  ('רחוב בן יהודה', 'Ben Yehuda Street'),
  ('רחוב הנביאים', 'HaNevi''im Street'),
  ('רחוב המלך ג''ורג', 'King George Street'),
  ('רחוב יעקב', 'Yaakov Street'),
  ('רחוב שמואל הנגיד', 'Shmuel HaNagid Street'),
  ('רחוב עמק רפאים', 'Emek Refaim Street'),
  ('רחוב אגרון', 'Agron Street'),
  ('רחוב קרן היסוד', 'Keren HaYesod Street'),
  ('רחוב ממילא', 'Mamilla Street'),
  ('רחוב רמב''ם', 'Rambam Street'),
  ('רחוב בצלאל', 'Bezalel Street'),
  ('רחוב הרב קוק', 'HaRav Kook Street'),
  ('רחוב שומרי אמונים', 'Shomrei Emunim Street'),
  ('רחוב מאה שערים', 'Mea Shearim Street'),
  ('רחוב סטרומה', 'Struma Street'),
  ('רחוב בר אילן', 'Bar Ilan Street'),
  ('רחוב גולדה מאיר', 'Golda Meir Street'),
  ('רחוב היהלום', 'HaYahalom Street'),
  ('רחוב ז''בוטינסקי', 'Jabotinsky Street'),
  ('רחוב משה דיין', 'Moshe Dayan Street'),
  ('רחוב דרך בית לחם', 'Derech Beit Lechem'),
  ('רחוב פרץ', 'Peretz Street'),
  ('שדרות בן גוריון', 'Ben Gurion Boulevard'),
  ('רחוב בזל', 'Basel Street'),
  ('רחוב קדש', 'Kadesh Street'),
  ('רחוב לינקולן', 'Lincoln Street'),
  ('רחוב דיסקין', 'Diskin Street'),
  ('רחוב עזה', 'Aza Street')
) AS v(street_name_he, street_name_en)
WHERE c.name_he = 'ירושלים'
ON CONFLICT (city_id, street_name_he) DO NOTHING;

-- Mevaseret Zion Streets
INSERT INTO streets (city_id, street_name_he, street_name_en)
SELECT c.id, street_name_he, street_name_en
FROM cities c, (VALUES
  ('רחוב המעיין', 'HaMa''ayan Street'),
  ('רחוב הראשונים', 'HaRishonim Street'),
  ('רחוב הפסגה', 'HaPisgah Street'),
  ('רחוב ההר', 'HaHar Street'),
  ('רחוב הגפן', 'HaGefen Street'),
  ('רחוב הזית', 'HaZayit Street'),
  ('רחוב התאנה', 'HaTe''ena Street'),
  ('רחוב הדקל', 'HaDekel Street'),
  ('רחוב הרימון', 'HaRimon Street'),
  ('רחוב האלון', 'HaAlon Street'),
  ('רחוב השקד', 'HaShaked Street'),
  ('רחוב הברוש', 'HaBrosh Street'),
  ('רחוב הארז', 'HaErez Street'),
  ('רחוב האורן', 'HaOren Street'),
  ('רחוב התמר', 'HaTamar Street')
) AS v(street_name_he, street_name_en)
WHERE c.name_he = 'מבשרת ציון'
ON CONFLICT (city_id, street_name_he) DO NOTHING;

-- Abu Ghosh Streets
INSERT INTO streets (city_id, street_name_he, street_name_en)
SELECT c.id, street_name_he, street_name_en
FROM cities c, (VALUES
  ('רחוב הראשי', 'Main Street'),
  ('רחוב הכנסייה', 'Church Street'),
  ('רחוב המסגד', 'Mosque Street'),
  ('רחוב העמק', 'HaEmek Street'),
  ('רחוב הגבעה', 'HaGiv''ah Street'),
  ('רחוב הזית', 'HaZayit Street'),
  ('רחוב השלום', 'Shalom Street'),
  ('רחוב החומות', 'HaHomot Street'),
  ('רחוב המפל', 'HaMapal Street'),
  ('רחוב הנחל', 'HaNahal Street')
) AS v(street_name_he, street_name_en)
WHERE c.name_he = 'אבו גוש'
ON CONFLICT (city_id, street_name_he) DO NOTHING;

-- Moza Illit Streets
INSERT INTO streets (city_id, street_name_he, street_name_en)
SELECT c.id, street_name_he, street_name_en
FROM cities c, (VALUES
  ('רחוב הרי יהודה', 'Harei Yehuda Street'),
  ('רחוב סורק', 'Sorek Street'),
  ('רחוב המעיין', 'HaMa''ayan Street'),
  ('רחוב היער', 'HaYa''ar Street'),
  ('רחוב הגפן', 'HaGefen Street'),
  ('רחוב הזמיר', 'HaZamir Street'),
  ('רחוב הדובדבן', 'HaDuvdevan Street'),
  ('רחוב השקדים', 'HaSh Kedim Street'),
  ('רחוב העצמאות', 'HaAtzmaut Street'),
  ('רחוב החרצית', 'HaHartzit Street')
) AS v(street_name_he, street_name_en)
WHERE c.name_he = 'מוצא עילית'
ON CONFLICT (city_id, street_name_he) DO NOTHING;

-- Moza Tahit Streets
INSERT INTO streets (city_id, street_name_he, street_name_en)
SELECT c.id, street_name_he, street_name_en
FROM cities c, (VALUES
  ('רחוב המושבה', 'HaMoshava Street'),
  ('רחוב הכרמים', 'HaKramim Street'),
  ('רחוב הבוסתן', 'HaBostan Street'),
  ('רחוב המעין', 'HaMa''ayan Street'),
  ('רחוב העמק', 'HaEmek Street'),
  ('רחוב היקב', 'HaYekev Street'),
  ('רחוב הגורן', 'HaGoren Street'),
  ('רחוב השדות', 'HaSadot Street'),
  ('רחוב הפרדס', 'HaPardes Street'),
  ('רחוב התבור', 'HaTabor Street')
) AS v(street_name_he, street_name_en)
WHERE c.name_he = 'מוצא תחתית'
ON CONFLICT (city_id, street_name_he) DO NOTHING;

-- Ma'ale HaHamisha Streets
INSERT INTO streets (city_id, street_name_he, street_name_en)
SELECT c.id, street_name_he, street_name_en
FROM cities c, (VALUES
  ('רחוב החמישה', 'HaHamisha Street'),
  ('רחוב הפלמ''ח', 'HaPalmach Street'),
  ('רחוב הכיבוש', 'HaKibush Street'),
  ('רחוב האלון', 'HaAlon Street'),
  ('רחוב היער', 'HaYa''ar Street'),
  ('רחוב הזיכרון', 'HaZikaron Street'),
  ('רחוב הגבורה', 'HaGvura Street'),
  ('רחוב התקווה', 'HaTikva Street'),
  ('רחוב השלום', 'HaShalom Street'),
  ('רחוב החירות', 'HaHerut Street')
) AS v(street_name_he, street_name_en)
WHERE c.name_he = 'מעלה החמישה'
ON CONFLICT (city_id, street_name_he) DO NOTHING;

-- Kiryat Ye'arim Streets
INSERT INTO streets (city_id, street_name_he, street_name_en)
SELECT c.id, street_name_he, street_name_en
FROM cities c, (VALUES
  ('רחוב היערים', 'HaYe''arim Street'),
  ('רחוב הארון', 'HaAron Street'),
  ('רחוב השילוח', 'HaShiloach Street'),
  ('רחוב דוד המלך', 'King David Street'),
  ('רחוב שמואל הנביא', 'Shmuel HaNavi Street'),
  ('רחוב גבעת האירוסים', 'Giv''at HaIrusim Street'),
  ('רחוב העמק', 'HaEmek Street'),
  ('רחוב המצפה', 'HaMitzpeh Street'),
  ('רחוב האורנים', 'HaOranim Street'),
  ('רחוב הגפן', 'HaGefen Street')
) AS v(street_name_he, street_name_en)
WHERE c.name_he = 'קרית יערים'
ON CONFLICT (city_id, street_name_he) DO NOTHING;

-- Ora Streets
INSERT INTO streets (city_id, street_name_he, street_name_en)
SELECT c.id, street_name_he, street_name_en
FROM cities c, (VALUES
  ('רחוב אורה', 'Ora Street'),
  ('רחוב האור', 'HaOr Street'),
  ('רחוב המאורות', 'HaMe''orot Street'),
  ('רחוב הנוף', 'HaNof Street'),
  ('רחוב הרקיע', 'HaRakia Street'),
  ('רחוב השמש', 'HaShemesh Street'),
  ('רחוב הירח', 'HaYareach Street'),
  ('רחוב הכוכבים', 'HaKochavim Street'),
  ('רחוב המזלות', 'HaMazalot Street'),
  ('רחוב הצוהר', 'HaTzohar Street')
) AS v(street_name_he, street_name_en)
WHERE c.name_he = 'אורה'
ON CONFLICT (city_id, street_name_he) DO NOTHING;

-- Beit Zayit Streets
INSERT INTO streets (city_id, street_name_he, street_name_en)
SELECT c.id, street_name_he, street_name_en
FROM cities c, (VALUES
  ('רחוב הזית', 'HaZayit Street'),
  ('רחוב הכפר', 'HaKfar Street'),
  ('רחוב העמק', 'HaEmek Street'),
  ('רחוב המעין', 'HaMa''ayan Street'),
  ('רחוב החורשה', 'HaHorsha Street'),
  ('רחוב השדות', 'HaSadot Street'),
  ('רחוב הכרמים', 'HaKramim Street'),
  ('רחוב התאנים', 'HaTe''enim Street'),
  ('רחוב הגפנים', 'HaGfanim Street'),
  ('רחוב הדקלים', 'HaDekalim Street')
) AS v(street_name_he, street_name_en)
WHERE c.name_he = 'בית זית'
ON CONFLICT (city_id, street_name_he) DO NOTHING;

-- Ein Rafa Streets
INSERT INTO streets (city_id, street_name_he, street_name_en)
SELECT c.id, street_name_he, street_name_en
FROM cities c, (VALUES
  ('רחוב העין', 'HaAyin Street'),
  ('רחוב המעיין', 'HaMa''ayan Street'),
  ('רחוב הנחל', 'HaNahal Street'),
  ('רחוב הגדה', 'HaGada Street'),
  ('רחוב הבריכה', 'HaBrekha Street'),
  ('רחוב השקט', 'HaSheket Street'),
  ('רחוב היער', 'HaYa''ar Street'),
  ('רחוב הנוף', 'HaNof Street'),
  ('רחוב השלווה', 'HaShalva Street'),
  ('רחוב המפלים', 'HaMapalim Street')
) AS v(street_name_he, street_name_en)
WHERE c.name_he = 'עין ראפה'
ON CONFLICT (city_id, street_name_he) DO NOTHING;

-- Ein Nakuba Streets
INSERT INTO streets (city_id, street_name_he, street_name_en)
SELECT c.id, street_name_he, street_name_en
FROM cities c, (VALUES
  ('רחוב הראשי', 'Main Street'),
  ('רחוב המעין', 'HaMa''ayan Street'),
  ('רחוב הכפר', 'HaKfar Street'),
  ('רחוב הגבעה', 'HaGiv''ah Street'),
  ('רחוב העמק', 'HaEmek Street'),
  ('רחוב הזיתים', 'HaZeitim Street'),
  ('רחוב השקמה', 'HaShikma Street'),
  ('רחוב התאנה', 'HaTe''ena Street'),
  ('רחוב הדקל', 'HaDekel Street'),
  ('רחוב הרימון', 'HaRimon Street')
) AS v(street_name_he, street_name_en)
WHERE c.name_he = 'עין נקובא'
ON CONFLICT (city_id, street_name_he) DO NOTHING;