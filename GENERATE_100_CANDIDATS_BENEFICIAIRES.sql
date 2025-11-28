-- ============================================
-- GÉNÉRATION DE 100 CANDIDATS ET 100 BÉNÉFICIAIRES
-- Profils variés : entrepreneurs, femmes de ménage, chefs d'entreprise, 
-- chômeurs, femmes au foyer, mécaniciens, etc.
-- ============================================

-- ============================================
-- 1. GÉNÉRATION DE 100 CANDIDATS
-- ============================================

WITH candidats_data AS (
  SELECT 
    gen_random_uuid() as id,
    (SELECT id::text FROM organisations ORDER BY RANDOM() LIMIT 1) as organisation_id,
    nom,
    prenom,
    date_naissance,
    genre,
    adresse,
    region_id,
    departement_id,
    commune_id,
    type_profil,
    secteur,
    (SELECT id FROM appels_candidatures ORDER BY RANDOM() LIMIT 1) as appel_id,
    (ARRAY['NOUVEAU', 'EN_EVALUATION', 'ÉLIGIBLE', 'NON_ÉLIGIBLE'])[FLOOR(RANDOM() * 4) + 1] as statut,
    CASE 
      WHEN date_naissance < (CURRENT_DATE - INTERVAL '18 years') AND date_naissance > (CURRENT_DATE - INTERVAL '65 years') 
      THEN 'ÉLIGIBLE'
      ELSE 'NON_ÉLIGIBLE'
    END as statut_eligibilite,
    LOWER(prenom || '.' || nom || '@example.sn') as email,
    '77' || LPAD((FLOOR(RANDOM() * 9999999))::text, 7, '0') as telephone,
    CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '180 days') as created_at,
    CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '30 days') as updated_at
  FROM (
    VALUES
    -- Entrepreneurs et chefs d'entreprise
    ('Diallo', 'Amadou', '1985-03-15'::date, 'M', 'Avenue Cheikh Anta Diop, Immeuble Alpha', 'DK', 'DK-01', 'DK-01-001', 'Entrepreneur', 'Commerce'),
    ('Ndiaye', 'Fatou', '1990-07-22'::date, 'F', 'Rue de la République, Zone A', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Chef d''entreprise', 'Services'),
    ('Ba', 'Moussa', '1988-11-08'::date, 'M', 'Boulevard Général de Gaulle', 'Saint-Louis', 'SL', 'SL-01', 'DK-01-001', 'Entrepreneur', 'Industrie'),
    ('Sarr', 'Aissatou', '1992-05-30'::date, 'F', 'Quartier HLM, Villa 45', 'Dakar', 'DK', 'DK-02', 'DK-01-002', 'Chef d''entreprise', 'Commerce'),
    ('Seck', 'Ibrahima', '1987-09-14'::date, 'M', 'Avenue Malick Sy', 'Thiès', 'TH', 'TH-02', 'TH-01-002', 'Entrepreneur', 'Services'),
    ('Fall', 'Mariama', '1993-12-25'::date, 'F', 'Rue El Hadj Malick Sy', 'Kaolack', 'KD', 'KD-01', 'DK-01-003', 'Entrepreneur', 'Commerce'),
    ('Diop', 'Ousmane', '1986-02-18'::date, 'M', 'Zone industrielle, Lot 12', 'Dakar', 'DK', 'DK-03', 'DK-01-004', 'Chef d''entreprise', 'Industrie'),
    ('Thiam', 'Aminata', '1991-08-03'::date, 'F', 'Avenue Cheikh Ibra Fall', 'Thiès', 'TH', 'TH-01', 'TH-01-003', 'Entrepreneur', 'Services'),
    ('Kane', 'Modou', '1989-04-12'::date, 'M', 'Quartier Grand Médine', 'Dakar', 'DK', 'DK-01', 'DK-01-005', 'Chef d''entreprise', 'Commerce'),
    ('Sy', 'Rokhaya', '1994-06-20'::date, 'F', 'Boulevard de la République', 'Saint-Louis', 'SL', 'SL-02', 'DK-01-001', 'Entrepreneur', 'Services'),
    
    -- Femmes de ménage et aides ménagères
    ('Niang', 'Awa', '1995-01-10'::date, 'F', 'Cité Keur Gorgui, Parcelle 23', 'Dakar', 'DK', 'DK-02', 'DK-01-002', 'Femme de ménage', 'Services'),
    ('Gueye', 'Khadidiatou', '1996-03-28'::date, 'F', 'Quartier Sicap Liberté, Villa 8', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Aide ménagère', 'Services'),
    ('Cissé', 'Mame Diarra', '1997-07-15'::date, 'F', 'Avenue Cheikh Anta Diop, Résidence', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Femme de ménage', 'Services'),
    ('Dia', 'Ndeye', '1994-11-22'::date, 'F', 'Rue de la Gare', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Aide ménagère', 'Services'),
    ('Mbaye', 'Aissatou', '1998-05-05'::date, 'F', 'Quartier HLM Extension', 'Dakar', 'DK', 'DK-02', 'DK-01-002', 'Femme de ménage', 'Services'),
    
    -- Mécaniciens et artisans
    ('Sow', 'Mamadou', '1985-09-18'::date, 'M', 'Zone artisanale, Atelier 7', 'Dakar', 'DK', 'DK-03', 'DK-01-003', 'Mécanicien', 'Artisanat'),
    ('Faye', 'Samba', '1987-12-30'::date, 'M', 'Garage Automobile, Route de Rufisque', 'Dakar', 'DK', 'DK-03', 'DK-01-004', 'Mécanicien', 'Artisanat'),
    ('Diouf', 'Moussa', '1989-02-14'::date, 'M', 'Quartier industriel, Atelier mécanique', 'Thiès', 'TH', 'TH-02', 'TH-01-002', 'Mécanicien', 'Artisanat'),
    ('Ndiaye', 'Cheikh', '1990-08-25'::date, 'M', 'Zone industrielle, Garage 15', 'Kaolack', 'KD', 'KD-02', 'DK-01-003', 'Mécanicien', 'Artisanat'),
    ('Ba', 'Aliou', '1986-04-08'::date, 'M', 'Avenue des Artisans', 'Saint-Louis', 'SL', 'SL-01', 'DK-01-001', 'Artisan', 'Artisanat'),
    
    -- Chômeurs et demandeurs d'emploi
    ('Diallo', 'Ibrahima', '1998-06-12'::date, 'M', 'Cité Keur Massar, Parcelle 89', 'Dakar', 'DK', 'DK-02', 'DK-01-002', 'Chômeur', NULL),
    ('Ndiaye', 'Moussa', '1999-03-20'::date, 'M', 'Quartier Grand Yoff', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Chômeur', NULL),
    ('Sarr', 'Amadou', '1997-10-05'::date, 'M', 'Zone B, Cité HLM', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Demandeur d''emploi', NULL),
    ('Fall', 'Modou', '1996-07-18'::date, 'M', 'Quartier Ndiarème', 'Dakar', 'DK', 'DK-03', 'DK-01-003', 'Chômeur', NULL),
    ('Seck', 'Pape', '1998-11-30'::date, 'M', 'Cité Patte d''Oie', 'Dakar', 'DK', 'DK-01', 'DK-01-005', 'Demandeur d''emploi', NULL),
    
    -- Femmes au foyer
    ('Ba', 'Aissatou', '1992-04-15'::date, 'F', 'Quartier Sacré-Cœur, Villa 12', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Femme au foyer', NULL),
    ('Diop', 'Mariama', '1993-08-22'::date, 'F', 'Avenue Cheikh Anta Diop, Résidence', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Femme au foyer', NULL),
    ('Thiam', 'Khadidiatou', '1994-12-10'::date, 'F', 'Quartier Sicap Mbao', 'Dakar', 'DK', 'DK-02', 'DK-01-002', 'Femme au foyer', NULL),
    ('Kane', 'Rokhaya', '1995-02-28'::date, 'F', 'Cité Keur Gorgui, Parcelle 67', 'Dakar', 'DK', 'DK-02', 'DK-01-002', 'Femme au foyer', NULL),
    ('Sy', 'Awa', '1996-06-14'::date, 'F', 'Quartier HLM, Villa 34', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Femme au foyer', NULL),
    
    -- Commerçants et vendeurs
    ('Gueye', 'Mamadou', '1984-05-20'::date, 'M', 'Marché Sandaga, Stand 45', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Commerçant', 'Commerce'),
    ('Cissé', 'Amadou', '1985-09-12'::date, 'M', 'Marché Tilène, Boutique 23', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Commerçant', 'Commerce'),
    ('Dia', 'Ibrahima', '1986-11-25'::date, 'M', 'Marché central, Étalage 12', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Vendeur', 'Commerce'),
    ('Mbaye', 'Modou', '1987-03-08'::date, 'M', 'Marché de Mbour, Stand 8', 'Mbour', 'TH', 'TH-02', 'TH-01-002', 'Commerçant', 'Commerce'),
    ('Sow', 'Cheikh', '1988-07-18'::date, 'M', 'Marché de Kaolack, Boutique 15', 'Kaolack', 'KD', 'KD-01', 'DK-01-003', 'Vendeur', 'Commerce'),
    
    -- Agriculteurs et éleveurs
    ('Faye', 'Samba', '1975-04-22'::date, 'M', 'Zone rurale, Exploitation agricole', 'Thiadiaye', 'TH', 'TH-02', 'TH-01-002', 'Agriculteur', 'Agriculture'),
    ('Diouf', 'Moussa', '1978-08-15'::date, 'M', 'Village de Keur Moussa', 'Keur Moussa', 'TH', 'TH-01', 'TH-01-001', 'Éleveur', 'Agriculture'),
    ('Ndiaye', 'Amadou', '1980-12-30'::date, 'M', 'Zone rurale, Élevage', 'Notto', 'TH', 'TH-01', 'TH-01-001', 'Agriculteur', 'Agriculture'),
    ('Ba', 'Ibrahima', '1976-06-10'::date, 'M', 'Exploitation agricole, Zone rurale', 'Pout', 'TH', 'TH-01', 'TH-01-001', 'Éleveur', 'Agriculture'),
    ('Sarr', 'Modou', '1979-10-25'::date, 'M', 'Village agricole', 'Khombole', 'TH', 'TH-01', 'TH-01-001', 'Agriculteur', 'Agriculture'),
    
    -- Étudiants et jeunes diplômés
    ('Fall', 'Aissatou', '2000-01-15'::date, 'F', 'Campus UCAD, Résidence étudiante', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Étudiant', 'Éducation'),
    ('Seck', 'Mariama', '2001-05-20'::date, 'F', 'Cité universitaire, Chambre 234', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Étudiant', 'Éducation'),
    ('Diallo', 'Rokhaya', '1999-09-12'::date, 'F', 'Quartier universitaire', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Jeune diplômé', 'Éducation'),
    ('Ndiaye', 'Awa', '2000-11-28'::date, 'F', 'Résidence étudiante, Chambre 156', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Étudiant', 'Éducation'),
    ('Ba', 'Khadidiatou', '2001-03-08'::date, 'F', 'Campus universitaire', 'Saint-Louis', 'SL', 'SL-01', 'DK-01-001', 'Étudiant', 'Éducation'),
    
    -- Artisans et ouvriers qualifiés
    ('Thiam', 'Mamadou', '1983-07-22'::date, 'M', 'Zone artisanale, Atelier menuiserie', 'Dakar', 'DK', 'DK-03', 'DK-01-003', 'Artisan', 'Artisanat'),
    ('Kane', 'Samba', '1984-10-15'::date, 'M', 'Atelier de couture, Zone artisanale', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Artisan', 'Artisanat'),
    ('Sy', 'Ibrahima', '1985-02-28'::date, 'M', 'Atelier de soudure', 'Thiès', 'TH', 'TH-02', 'TH-01-002', 'Ouvrier qualifié', 'Artisanat'),
    ('Gueye', 'Modou', '1986-08-10'::date, 'M', 'Zone artisanale, Atelier 22', 'Kaolack', 'KD', 'KD-02', 'DK-01-003', 'Artisan', 'Artisanat'),
    ('Cissé', 'Cheikh', '1987-12-25'::date, 'M', 'Atelier de réparation', 'Saint-Louis', 'SL', 'SL-02', 'DK-01-001', 'Ouvrier qualifié', 'Artisanat'),
    
    -- Propriétaires d'entreprises (PME/TPE)
    ('Dia', 'Amadou', '1975-06-18'::date, 'M', 'Siège social, Immeuble Alpha', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Propriétaire PME', 'Industrie'),
    ('Mbaye', 'Ibrahima', '1976-09-30'::date, 'M', 'Bureau principal, Zone industrielle', 'Dakar', 'DK', 'DK-03', 'DK-01-003', 'Propriétaire PME', 'Industrie'),
    ('Sow', 'Moussa', '1977-03-14'::date, 'M', 'Direction générale, Immeuble Beta', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Propriétaire TPE', 'Services'),
    ('Faye', 'Modou', '1978-07-28'::date, 'M', 'Siège, Zone d''activité', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Propriétaire PME', 'Commerce'),
    ('Diouf', 'Pape', '1979-11-12'::date, 'M', 'Bureau directeur, Immeuble Gamma', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Propriétaire TPE', 'Services'),
    
    -- Prestataires de services
    ('Ndiaye', 'Aissatou', '1990-04-20'::date, 'F', 'Cabinet de conseil, Bureau 5', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Prestataire de services', 'Services'),
    ('Ba', 'Mariama', '1991-08-05'::date, 'F', 'Agence de services, Immeuble Delta', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Prestataire de services', 'Services'),
    ('Sarr', 'Rokhaya', '1992-12-18'::date, 'F', 'Bureau de prestation, Zone A', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Prestataire de services', 'Services'),
    ('Fall', 'Awa', '1993-02-22'::date, 'F', 'Cabinet, Immeuble Epsilon', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Prestataire de services', 'Services'),
    ('Seck', 'Khadidiatou', '1994-06-08'::date, 'F', 'Agence, Bureau 12', 'Kaolack', 'KD', 'KD-01', 'DK-01-003', 'Prestataire de services', 'Services'),
    
    -- Micro-entrepreneurs
    ('Diallo', 'Mamadou', '1988-01-15'::date, 'M', 'Micro-entreprise, Local 3', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Micro-entrepreneur', 'Commerce'),
    ('Thiam', 'Samba', '1989-05-28'::date, 'M', 'Petite entreprise, Atelier 8', 'Dakar', 'DK', 'DK-03', 'DK-01-003', 'Micro-entrepreneur', 'Artisanat'),
    ('Kane', 'Ibrahima', '1990-09-10'::date, 'M', 'Micro-business, Stand 15', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Micro-entrepreneur', 'Commerce'),
    ('Sy', 'Modou', '1991-11-25'::date, 'M', 'Petit commerce, Boutique 7', 'Mbour', 'TH', 'TH-02', 'TH-01-002', 'Micro-entrepreneur', 'Commerce'),
    ('Gueye', 'Cheikh', '1992-03-18'::date, 'M', 'Micro-entreprise, Local 22', 'Kaolack', 'KD', 'KD-02', 'DK-01-003', 'Micro-entrepreneur', 'Services'),
    
    -- Porteurs de projet
    ('Cissé', 'Aissatou', '1995-07-12'::date, 'F', 'Projet en développement, Bureau', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Porteur de projet', 'Services'),
    ('Dia', 'Mariama', '1996-10-28'::date, 'F', 'Projet entrepreneurial, Local', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Porteur de projet', 'Commerce'),
    ('Mbaye', 'Rokhaya', '1997-02-14'::date, 'F', 'Projet innovant, Bureau 9', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Porteur de projet', 'Services'),
    ('Sow', 'Awa', '1998-06-20'::date, 'F', 'Projet en incubation', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Porteur de projet', 'Services'),
    ('Faye', 'Khadidiatou', '1999-09-05'::date, 'F', 'Projet startup, Espace coworking', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Porteur de projet', 'Services'),
    
    -- Consultants indépendants
    ('Diouf', 'Amadou', '1982-04-22'::date, 'M', 'Cabinet de consulting, Bureau 15', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Consultant indépendant', 'Services'),
    ('Ndiaye', 'Ibrahima', '1983-08-15'::date, 'M', 'Consultant indépendant, Bureau', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Consultant indépendant', 'Services'),
    ('Ba', 'Moussa', '1984-12-30'::date, 'M', 'Cabinet conseil, Immeuble', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Consultant indépendant', 'Services'),
    ('Sarr', 'Modou', '1985-03-08'::date, 'M', 'Consultant, Bureau 7', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Consultant indépendant', 'Services'),
    ('Fall', 'Pape', '1986-07-18'::date, 'M', 'Cabinet, Zone professionnelle', 'Kaolack', 'KD', 'KD-01', 'DK-01-003', 'Consultant indépendant', 'Services'),
    
    -- Pêcheurs
    ('Seck', 'Mamadou', '1974-05-25'::date, 'M', 'Port de pêche, Quai 3', 'Mbour', 'TH', 'TH-02', 'TH-01-002', 'Pêcheur', 'Pêche'),
    ('Diallo', 'Samba', '1975-09-12'::date, 'M', 'Zone de pêche, Port', 'Joal-Fadiouth', 'TH', 'TH-02', 'TH-01-002', 'Pêcheur', 'Pêche'),
    ('Thiam', 'Ibrahima', '1976-11-28'::date, 'M', 'Port artisanal, Quai 5', 'Kayar', 'TH', 'TH-02', 'TH-01-002', 'Pêcheur', 'Pêche'),
    ('Kane', 'Modou', '1977-02-10'::date, 'M', 'Zone de pêche, Port', 'Saint-Louis', 'SL', 'SL-01', 'DK-01-001', 'Pêcheur', 'Pêche'),
    ('Sy', 'Cheikh', '1978-06-22'::date, 'M', 'Port de pêche, Quai 8', 'Mbour', 'TH', 'TH-02', 'TH-01-002', 'Pêcheur', 'Pêche'),
    
    -- Retraités en reconversion
    ('Gueye', 'Aissatou', '1965-08-15'::date, 'F', 'Résidence, Villa 12', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Retraité', NULL),
    ('Cissé', 'Mariama', '1966-12-28'::date, 'F', 'Quartier résidentiel, Villa 8', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Retraité', NULL),
    ('Dia', 'Rokhaya', '1967-04-10'::date, 'F', 'Résidence, Parcelle 45', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Retraité', NULL),
    ('Mbaye', 'Awa', '1968-07-25'::date, 'F', 'Villa, Quartier calme', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Retraité', NULL),
    ('Sow', 'Khadidiatou', '1969-11-08'::date, 'F', 'Résidence, Villa 23', 'Saint-Louis', 'SL', 'SL-01', 'DK-01-001', 'Retraité', NULL),
    
    -- Personnes en situation de handicap
    ('Faye', 'Mamadou', '1985-03-20'::date, 'M', 'Quartier accessible, Parcelle 12', 'Dakar', 'DK', 'DK-02', 'DK-01-002', 'Personne en situation de handicap', NULL),
    ('Diouf', 'Samba', '1986-07-12'::date, 'M', 'Zone adaptée, Logement 8', 'Dakar', 'DK', 'DK-02', 'DK-01-002', 'Personne en situation de handicap', NULL),
    ('Ndiaye', 'Ibrahima', '1987-10-28'::date, 'M', 'Quartier accessible, Villa 5', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Personne en situation de handicap', NULL),
    ('Ba', 'Modou', '1988-02-14'::date, 'M', 'Logement adapté, Parcelle 34', 'Dakar', 'DK', 'DK-02', 'DK-01-002', 'Personne en situation de handicap', NULL),
    ('Sarr', 'Cheikh', '1989-06-18'::date, 'M', 'Zone accessible, Logement 12', 'Kaolack', 'KD', 'KD-01', 'DK-01-003', 'Personne en situation de handicap', NULL),
    
    -- Migrants/Refugiés
    ('Fall', 'Aissatou', '1990-09-22'::date, 'F', 'Camp de réfugiés, Tente 45', 'Dakar', 'DK', 'DK-02', 'DK-01-002', 'Migrant', NULL),
    ('Seck', 'Mariama', '1991-12-08'::date, 'F', 'Zone d''accueil, Logement 23', 'Dakar', 'DK', 'DK-02', 'DK-01-002', 'Migrant', NULL),
    ('Diallo', 'Rokhaya', '1992-04-25'::date, 'F', 'Centre d''accueil, Chambre 12', 'Dakar', 'DK', 'DK-02', 'DK-01-002', 'Migrant', NULL),
    ('Thiam', 'Awa', '1993-08-10'::date, 'F', 'Zone d''hébergement, Logement 8', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Migrant', NULL),
    ('Kane', 'Khadidiatou', '1994-11-28'::date, 'F', 'Centre d''accueil, Chambre 15', 'Dakar', 'DK', 'DK-02', 'DK-01-002', 'Migrant', NULL),
    
    -- Personnes vulnérables
    ('Sy', 'Aissatou', '1995-05-15'::date, 'F', 'Quartier défavorisé, Parcelle 67', 'Dakar', 'DK', 'DK-02', 'DK-01-002', 'Personne vulnérable', NULL),
    ('Gueye', 'Mariama', '1996-09-30'::date, 'F', 'Zone vulnérable, Logement 34', 'Dakar', 'DK', 'DK-02', 'DK-01-002', 'Personne vulnérable', NULL),
    ('Cissé', 'Rokhaya', '1997-01-12'::date, 'F', 'Quartier précaire, Parcelle 89', 'Dakar', 'DK', 'DK-02', 'DK-01-002', 'Personne vulnérable', NULL),
    ('Dia', 'Awa', '1998-05-28'::date, 'F', 'Zone défavorisée, Logement 12', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Personne vulnérable', NULL),
    ('Mbaye', 'Khadidiatou', '1999-09-14'::date, 'F', 'Quartier vulnérable, Parcelle 45', 'Dakar', 'DK', 'DK-02', 'DK-01-002', 'Personne vulnérable', NULL)
  ) AS data(nom, prenom, date_naissance, genre, adresse, region_id, departement_id, commune_id, type_profil, secteur)
)
INSERT INTO candidats (
  id, organisation_id, nom, prenom, genre, date_naissance, adresse, region_id, departement_id, commune_id,
  email, telephone, appel_id, statut, statut_eligibilite, type_profil, secteur, created_at, updated_at
)
SELECT 
  id, organisation_id, nom, prenom, genre, date_naissance, adresse, region_id, departement_id, commune_id,
  email, telephone, appel_id, statut, statut_eligibilite, type_profil, secteur, created_at, updated_at
FROM candidats_data
LIMIT 100;

-- ============================================
-- 2. GÉNÉRATION DE 100 BÉNÉFICIAIRES
-- ============================================

WITH beneficiaires_data AS (
  SELECT 
    'ben-' || LPAD((ROW_NUMBER() OVER())::text, 3, '0') as id,
    nom || ' ' || prenom as raison_sociale,
    nom,
    prenom,
    date_naissance,
    genre,
    adresse,
    region_id,
    departement_id,
    commune_id,
    secteur,
    (SELECT id FROM projets ORDER BY RANDOM() LIMIT 1) as projet_id,
    (ARRAY['ACTIF', 'EN_ACCOMPAGNEMENT', 'SUSPENDU', 'TERMINE'])[FLOOR(RANDOM() * 4) + 1] as statut,
    CASE WHEN RANDOM() > 0.3 THEN (SELECT id::text FROM users WHERE role = 'MENTOR' ORDER BY RANDOM() LIMIT 1) ELSE NULL END as mentor_id,
    CASE WHEN RANDOM() > 0.4 THEN (SELECT id::text FROM users WHERE role = 'FORMATEUR' ORDER BY RANDOM() LIMIT 1) ELSE NULL END as formateur_id,
    CASE WHEN RANDOM() > 0.5 THEN (SELECT id::text FROM users WHERE role = 'COACH' ORDER BY RANDOM() LIMIT 1) ELSE NULL END as coach_id,
    CASE WHEN RANDOM() > 0.2 THEN (SELECT id FROM candidats ORDER BY RANDOM() LIMIT 1) ELSE NULL END as candidat_id,
    LOWER(prenom || '.' || nom || '@beneficiaire.sn') as email,
    '77' || LPAD((FLOOR(RANDOM() * 9999999))::text, 7, '0') as telephone,
    CURRENT_DATE - (RANDOM() * INTERVAL '120 days') as date_affectation,
    CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '150 days') as created_at,
    CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '20 days') as updated_at
  FROM (
    VALUES
    -- Entrepreneurs actifs
    ('Diallo', 'Amadou', '1985-03-15'::date, 'M', 'Avenue Cheikh Anta Diop, Immeuble Alpha', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Commerce'),
    ('Ndiaye', 'Fatou', '1990-07-22'::date, 'F', 'Rue de la République, Zone A', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Services'),
    ('Ba', 'Moussa', '1988-11-08'::date, 'M', 'Boulevard Général de Gaulle', 'Saint-Louis', 'SL', 'SL-01', 'DK-01-001', 'Industrie'),
    ('Sarr', 'Aissatou', '1992-05-30'::date, 'F', 'Quartier HLM, Villa 45', 'Dakar', 'DK', 'DK-02', 'DK-01-002', 'Commerce'),
    ('Seck', 'Ibrahima', '1987-09-14'::date, 'M', 'Avenue Malick Sy', 'Thiès', 'TH', 'TH-02', 'TH-01-002', 'Services'),
    
    -- Femmes entrepreneures
    ('Fall', 'Mariama', '1993-12-25'::date, 'F', 'Rue El Hadj Malick Sy', 'Kaolack', 'KD', 'KD-01', 'DK-01-003', 'Commerce'),
    ('Diop', 'Rokhaya', '1991-08-03'::date, 'F', 'Avenue Cheikh Ibra Fall', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Services'),
    ('Thiam', 'Aminata', '1994-06-20'::date, 'F', 'Boulevard de la République', 'Saint-Louis', 'SL', 'SL-02', 'DK-01-001', 'Services'),
    ('Kane', 'Awa', '1992-02-18'::date, 'F', 'Zone industrielle, Lot 12', 'Dakar', 'DK', 'DK-03', 'DK-01-003', 'Industrie'),
    ('Sy', 'Khadidiatou', '1993-10-12'::date, 'F', 'Quartier Grand Médine', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Commerce'),
    
    -- Mécaniciens et artisans
    ('Gueye', 'Mamadou', '1985-09-18'::date, 'M', 'Zone artisanale, Atelier 7', 'Dakar', 'DK', 'DK-03', 'DK-01-003', 'Artisanat'),
    ('Cissé', 'Samba', '1987-12-30'::date, 'M', 'Garage Automobile, Route de Rufisque', 'Dakar', 'DK', 'DK-03', 'DK-01-004', 'Artisanat'),
    ('Dia', 'Moussa', '1989-02-14'::date, 'M', 'Quartier industriel, Atelier mécanique', 'Thiès', 'TH', 'TH-02', 'TH-01-002', 'Artisanat'),
    ('Mbaye', 'Cheikh', '1990-08-25'::date, 'M', 'Zone industrielle, Garage 15', 'Kaolack', 'KD', 'KD-02', 'DK-01-003', 'Artisanat'),
    ('Sow', 'Aliou', '1986-04-08'::date, 'M', 'Avenue des Artisans', 'Saint-Louis', 'SL', 'SL-01', 'DK-01-001', 'Artisanat'),
    
    -- Commerçants
    ('Faye', 'Amadou', '1984-05-20'::date, 'M', 'Marché Sandaga, Stand 45', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Commerce'),
    ('Diouf', 'Ibrahima', '1985-09-12'::date, 'M', 'Marché Tilène, Boutique 23', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Commerce'),
    ('Ndiaye', 'Modou', '1986-11-25'::date, 'M', 'Marché central, Étalage 12', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Commerce'),
    ('Ba', 'Cheikh', '1987-03-08'::date, 'M', 'Marché de Mbour, Stand 8', 'Mbour', 'TH', 'TH-02', 'TH-01-002', 'Commerce'),
    ('Sarr', 'Pape', '1988-07-18'::date, 'M', 'Marché de Kaolack, Boutique 15', 'Kaolack', 'KD', 'KD-01', 'DK-01-003', 'Commerce'),
    
    -- Agriculteurs
    ('Fall', 'Samba', '1975-04-22'::date, 'M', 'Zone rurale, Exploitation agricole', 'Thiadiaye', 'TH', 'TH-02', 'TH-01-002', 'Agriculture'),
    ('Seck', 'Moussa', '1978-08-15'::date, 'M', 'Village de Keur Moussa', 'Keur Moussa', 'TH', 'TH-01', 'TH-01-001', 'Agriculture'),
    ('Diallo', 'Amadou', '1980-12-30'::date, 'M', 'Zone rurale, Élevage', 'Notto', 'TH', 'TH-01', 'TH-01-001', 'Agriculture'),
    ('Thiam', 'Ibrahima', '1976-06-10'::date, 'M', 'Exploitation agricole, Zone rurale', 'Pout', 'TH', 'TH-01', 'TH-01-001', 'Agriculture'),
    ('Kane', 'Modou', '1979-10-25'::date, 'M', 'Village agricole', 'Khombole', 'TH', 'TH-01', 'TH-01-001', 'Agriculture'),
    
    -- Jeunes diplômés
    ('Sy', 'Aissatou', '2000-01-15'::date, 'F', 'Campus UCAD, Résidence étudiante', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Éducation'),
    ('Gueye', 'Mariama', '2001-05-20'::date, 'F', 'Cité universitaire, Chambre 234', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Éducation'),
    ('Cissé', 'Rokhaya', '1999-09-12'::date, 'F', 'Quartier universitaire', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Éducation'),
    ('Dia', 'Awa', '2000-11-28'::date, 'F', 'Résidence étudiante, Chambre 156', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Éducation'),
    ('Mbaye', 'Khadidiatou', '2001-03-08'::date, 'F', 'Campus universitaire', 'Saint-Louis', 'SL', 'SL-01', 'DK-01-001', 'Éducation'),
    
    -- Artisans
    ('Sow', 'Mamadou', '1983-07-22'::date, 'M', 'Zone artisanale, Atelier menuiserie', 'Dakar', 'DK', 'DK-03', 'DK-01-003', 'Artisanat'),
    ('Faye', 'Samba', '1984-10-15'::date, 'M', 'Atelier de couture, Zone artisanale', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Artisanat'),
    ('Diouf', 'Ibrahima', '1985-02-28'::date, 'M', 'Atelier de soudure', 'Thiès', 'TH', 'TH-02', 'TH-01-002', 'Artisanat'),
    ('Ndiaye', 'Modou', '1986-08-10'::date, 'M', 'Zone artisanale, Atelier 22', 'Kaolack', 'KD', 'KD-02', 'DK-01-003', 'Artisanat'),
    ('Ba', 'Cheikh', '1987-12-25'::date, 'M', 'Atelier de réparation', 'Saint-Louis', 'SL', 'SL-02', 'DK-01-001', 'Artisanat'),
    
    -- Propriétaires PME
    ('Sarr', 'Amadou', '1975-06-18'::date, 'M', 'Siège social, Immeuble Alpha', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Industrie'),
    ('Fall', 'Ibrahima', '1976-09-30'::date, 'M', 'Bureau principal, Zone industrielle', 'Dakar', 'DK', 'DK-03', 'DK-01-003', 'Industrie'),
    ('Seck', 'Moussa', '1977-03-14'::date, 'M', 'Direction générale, Immeuble Beta', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Services'),
    ('Diallo', 'Modou', '1978-07-28'::date, 'M', 'Siège, Zone d''activité', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Commerce'),
    ('Thiam', 'Pape', '1979-11-12'::date, 'M', 'Bureau directeur, Immeuble Gamma', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Services'),
    
    -- Prestataires de services
    ('Kane', 'Aissatou', '1990-04-20'::date, 'F', 'Cabinet de conseil, Bureau 5', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Services'),
    ('Sy', 'Mariama', '1991-08-05'::date, 'F', 'Agence de services, Immeuble Delta', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Services'),
    ('Gueye', 'Rokhaya', '1992-12-18'::date, 'F', 'Bureau de prestation, Zone A', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Services'),
    ('Cissé', 'Awa', '1993-02-22'::date, 'F', 'Cabinet, Immeuble Epsilon', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Services'),
    ('Dia', 'Khadidiatou', '1994-06-08'::date, 'F', 'Agence, Bureau 12', 'Kaolack', 'KD', 'KD-01', 'DK-01-003', 'Services'),
    
    -- Micro-entrepreneurs
    ('Mbaye', 'Mamadou', '1988-01-15'::date, 'M', 'Micro-entreprise, Local 3', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Commerce'),
    ('Sow', 'Samba', '1989-05-28'::date, 'M', 'Petite entreprise, Atelier 8', 'Dakar', 'DK', 'DK-03', 'DK-01-003', 'Artisanat'),
    ('Faye', 'Ibrahima', '1990-09-10'::date, 'M', 'Micro-business, Stand 15', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Commerce'),
    ('Diouf', 'Modou', '1991-11-25'::date, 'M', 'Petit commerce, Boutique 7', 'Mbour', 'TH', 'TH-02', 'TH-01-002', 'Commerce'),
    ('Ndiaye', 'Cheikh', '1992-03-18'::date, 'M', 'Micro-entreprise, Local 22', 'Kaolack', 'KD', 'KD-02', 'DK-01-003', 'Services'),
    
    -- Porteurs de projet
    ('Ba', 'Aissatou', '1995-07-12'::date, 'F', 'Projet en développement, Bureau', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Services'),
    ('Sarr', 'Mariama', '1996-10-28'::date, 'F', 'Projet entrepreneurial, Local', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Commerce'),
    ('Fall', 'Rokhaya', '1997-02-14'::date, 'F', 'Projet innovant, Bureau 9', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Services'),
    ('Seck', 'Awa', '1998-06-20'::date, 'F', 'Projet en incubation', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Services'),
    ('Diallo', 'Khadidiatou', '1999-09-05'::date, 'F', 'Projet startup, Espace coworking', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Services'),
    
    -- Consultants
    ('Thiam', 'Amadou', '1982-04-22'::date, 'M', 'Cabinet de consulting, Bureau 15', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Services'),
    ('Kane', 'Ibrahima', '1983-08-15'::date, 'M', 'Consultant indépendant, Bureau', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Services'),
    ('Sy', 'Moussa', '1984-12-30'::date, 'M', 'Cabinet conseil, Immeuble', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Services'),
    ('Gueye', 'Modou', '1985-03-08'::date, 'M', 'Consultant, Bureau 7', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Services'),
    ('Cissé', 'Pape', '1986-07-18'::date, 'M', 'Cabinet, Zone professionnelle', 'Kaolack', 'KD', 'KD-01', 'DK-01-003', 'Services'),
    
    -- Pêcheurs
    ('Dia', 'Mamadou', '1974-05-25'::date, 'M', 'Port de pêche, Quai 3', 'Mbour', 'TH', 'TH-02', 'TH-01-002', 'Pêche'),
    ('Mbaye', 'Samba', '1975-09-12'::date, 'M', 'Zone de pêche, Port', 'Joal-Fadiouth', 'TH', 'TH-02', 'TH-01-002', 'Pêche'),
    ('Sow', 'Ibrahima', '1976-11-28'::date, 'M', 'Port artisanal, Quai 5', 'Kayar', 'TH', 'TH-02', 'TH-01-002', 'Pêche'),
    ('Faye', 'Modou', '1977-02-10'::date, 'M', 'Zone de pêche, Port', 'Saint-Louis', 'SL', 'SL-01', 'DK-01-001', 'Pêche'),
    ('Diouf', 'Cheikh', '1978-06-22'::date, 'M', 'Port de pêche, Quai 8', 'Mbour', 'TH', 'TH-02', 'TH-01-002', 'Pêche'),
    
    -- Femmes de ménage reconverties
    ('Ndiaye', 'Aissatou', '1990-01-10'::date, 'F', 'Cité Keur Gorgui, Parcelle 23', 'Dakar', 'DK', 'DK-02', 'DK-01-002', 'Services'),
    ('Ba', 'Khadidiatou', '1991-03-28'::date, 'F', 'Quartier Sicap Liberté, Villa 8', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Services'),
    ('Sarr', 'Mame Diarra', '1992-07-15'::date, 'F', 'Avenue Cheikh Anta Diop, Résidence', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Services'),
    ('Fall', 'Ndeye', '1993-11-22'::date, 'F', 'Rue de la Gare', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Services'),
    ('Seck', 'Aissatou', '1994-05-05'::date, 'F', 'Quartier HLM Extension', 'Dakar', 'DK', 'DK-02', 'DK-01-002', 'Services'),
    
    -- Femmes au foyer entrepreneures
    ('Diallo', 'Mariama', '1992-04-15'::date, 'F', 'Quartier Sacré-Cœur, Villa 12', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Commerce'),
    ('Thiam', 'Rokhaya', '1993-08-22'::date, 'F', 'Avenue Cheikh Anta Diop, Résidence', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Commerce'),
    ('Kane', 'Awa', '1994-12-10'::date, 'F', 'Quartier Sicap Mbao', 'Dakar', 'DK', 'DK-02', 'DK-01-002', 'Services'),
    ('Sy', 'Khadidiatou', '1995-02-28'::date, 'F', 'Cité Keur Gorgui, Parcelle 67', 'Dakar', 'DK', 'DK-02', 'DK-01-002', 'Commerce'),
    ('Gueye', 'Aissatou', '1996-06-14'::date, 'F', 'Quartier HLM, Villa 34', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Commerce'),
    
    -- Chômeurs en reconversion
    ('Cissé', 'Mamadou', '1995-06-12'::date, 'M', 'Cité Keur Massar, Parcelle 89', 'Dakar', 'DK', 'DK-02', 'DK-01-002', NULL),
    ('Dia', 'Moussa', '1996-03-20'::date, 'M', 'Quartier Grand Yoff', 'Dakar', 'DK', 'DK-01', 'DK-01-001', NULL),
    ('Mbaye', 'Amadou', '1997-10-05'::date, 'M', 'Zone B, Cité HLM', 'Thiès', 'TH', 'TH-01', 'TH-01-001', NULL),
    ('Sow', 'Modou', '1998-07-18'::date, 'M', 'Quartier Ndiarème', 'Dakar', 'DK', 'DK-03', 'DK-01-003', NULL),
    ('Faye', 'Pape', '1999-11-30'::date, 'M', 'Cité Patte d''Oie', 'Dakar', 'DK', 'DK-01', 'DK-01-005', NULL),
    
    -- Étudiants entrepreneurs
    ('Diouf', 'Aissatou', '2000-01-15'::date, 'F', 'Campus UCAD, Résidence étudiante', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Services'),
    ('Ndiaye', 'Mariama', '2001-05-20'::date, 'F', 'Cité universitaire, Chambre 234', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Services'),
    ('Ba', 'Rokhaya', '1999-09-12'::date, 'F', 'Quartier universitaire', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Services'),
    ('Sarr', 'Awa', '2000-11-28'::date, 'F', 'Résidence étudiante, Chambre 156', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Services'),
    ('Fall', 'Khadidiatou', '2001-03-08'::date, 'F', 'Campus universitaire', 'Saint-Louis', 'SL', 'SL-01', 'DK-01-001', 'Services'),
    
    -- Retraités en reconversion
    ('Seck', 'Aissatou', '1965-08-15'::date, 'F', 'Résidence, Villa 12', 'Dakar', 'DK', 'DK-01', 'DK-01-001', NULL),
    ('Diallo', 'Mariama', '1966-12-28'::date, 'F', 'Quartier résidentiel, Villa 8', 'Dakar', 'DK', 'DK-01', 'DK-01-001', NULL),
    ('Thiam', 'Rokhaya', '1967-04-10'::date, 'F', 'Résidence, Parcelle 45', 'Thiès', 'TH', 'TH-01', 'TH-01-001', NULL),
    ('Kane', 'Awa', '1968-07-25'::date, 'F', 'Villa, Quartier calme', 'Dakar', 'DK', 'DK-01', 'DK-01-001', NULL),
    ('Sy', 'Khadidiatou', '1969-11-08'::date, 'F', 'Résidence, Villa 23', 'Saint-Louis', 'SL', 'SL-01', 'DK-01-001', NULL),
    
    -- Personnes en situation de handicap
    ('Gueye', 'Mamadou', '1985-03-20'::date, 'M', 'Quartier accessible, Parcelle 12', 'Dakar', 'DK', 'DK-02', 'DK-01-002', NULL),
    ('Cissé', 'Samba', '1986-07-12'::date, 'M', 'Zone adaptée, Logement 8', 'Dakar', 'DK', 'DK-02', 'DK-01-002', NULL),
    ('Dia', 'Ibrahima', '1987-10-28'::date, 'M', 'Quartier accessible, Villa 5', 'Thiès', 'TH', 'TH-01', 'TH-01-001', NULL),
    ('Mbaye', 'Modou', '1988-02-14'::date, 'M', 'Logement adapté, Parcelle 34', 'Dakar', 'DK', 'DK-02', 'DK-01-002', NULL),
    ('Sow', 'Cheikh', '1989-06-18'::date, 'M', 'Zone accessible, Logement 12', 'Kaolack', 'KD', 'KD-01', 'DK-01-003', NULL),
    
    -- Personnes vulnérables
    ('Faye', 'Aissatou', '1995-05-15'::date, 'F', 'Quartier défavorisé, Parcelle 67', 'Dakar', 'DK', 'DK-02', 'DK-01-002', NULL),
    ('Diouf', 'Mariama', '1996-09-30'::date, 'F', 'Zone vulnérable, Logement 34', 'Dakar', 'DK', 'DK-02', 'DK-01-002', NULL),
    ('Ndiaye', 'Rokhaya', '1997-01-12'::date, 'F', 'Quartier précaire, Parcelle 89', 'Dakar', 'DK', 'DK-02', 'DK-01-002', NULL),
    ('Ba', 'Awa', '1998-05-28'::date, 'F', 'Zone défavorisée, Logement 12', 'Thiès', 'TH', 'TH-01', 'TH-01-001', NULL),
    ('Sarr', 'Khadidiatou', '1999-09-14'::date, 'F', 'Quartier vulnérable, Parcelle 45', 'Dakar', 'DK', 'DK-02', 'DK-01-002', NULL),
    
    -- Auto-entrepreneurs
    ('Fall', 'Mamadou', '1988-01-15'::date, 'M', 'Auto-entreprise, Local 3', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Commerce'),
    ('Seck', 'Samba', '1989-05-28'::date, 'M', 'Auto-entreprise, Atelier 8', 'Dakar', 'DK', 'DK-03', 'DK-01-003', 'Artisanat'),
    ('Diallo', 'Ibrahima', '1990-09-10'::date, 'M', 'Auto-entreprise, Stand 15', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Commerce'),
    ('Thiam', 'Modou', '1991-11-25'::date, 'M', 'Auto-entreprise, Boutique 7', 'Mbour', 'TH', 'TH-02', 'TH-01-002', 'Commerce'),
    ('Kane', 'Cheikh', '1992-03-18'::date, 'M', 'Auto-entreprise, Local 22', 'Kaolack', 'KD', 'KD-02', 'DK-01-003', 'Services'),
    
    -- Repreneurs d'entreprise
    ('Sy', 'Amadou', '1978-06-18'::date, 'M', 'Entreprise reprise, Siège', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Industrie'),
    ('Gueye', 'Ibrahima', '1979-09-30'::date, 'M', 'Reprise d''entreprise, Bureau', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Services'),
    ('Cissé', 'Moussa', '1980-03-14'::date, 'M', 'Entreprise reprise, Direction', 'Thiès', 'TH', 'TH-01', 'TH-01-001', 'Commerce'),
    ('Dia', 'Modou', '1981-07-28'::date, 'M', 'Reprise, Zone d''activité', 'Kaolack', 'KD', 'KD-01', 'DK-01-003', 'Services'),
    ('Mbaye', 'Pape', '1982-11-12'::date, 'M', 'Entreprise reprise, Bureau', 'Dakar', 'DK', 'DK-01', 'DK-01-001', 'Commerce')
  ) AS data(nom, prenom, date_naissance, genre, adresse, region_id, departement_id, commune_id, secteur)
)
INSERT INTO beneficiaires (
  id, raison_sociale, nom, prenom, genre, date_naissance, adresse, region_id, departement_id, commune_id,
  email, telephone, projet_id, statut, mentor_id, formateur_id, coach_id, candidat_id, secteur,
  date_affectation, created_at, updated_at
)
SELECT 
  id, raison_sociale, nom, prenom, genre, date_naissance, adresse, region_id, departement_id, commune_id,
  email, telephone, projet_id, statut, mentor_id, formateur_id, coach_id, candidat_id, secteur,
  date_affectation, created_at, updated_at
FROM beneficiaires_data
LIMIT 100;

-- ============================================
-- VÉRIFICATION
-- ============================================

SELECT 
  'Candidats créés' as type,
  COUNT(*) as nombre
FROM candidats
WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '1 day'
UNION ALL
SELECT 
  'Bénéficiaires créés',
  COUNT(*)
FROM beneficiaires
WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '1 day';

