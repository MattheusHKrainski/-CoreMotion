-- Reattribute only the 12 explicitly requested editorial seeds, preserving interactions.
UPDATE public.community_posts p SET author_name=authors.name,
 author_badge='Perfil fictício · Demonstração', author_avatar='/community/fictional-avatar.svg'
FROM (VALUES
 ('04ee0de0-1241-a3da-274e-b093b13a4ce0'::uuid,'Tiago Prado'),
 ('97ace2bc-250d-3c83-3f5c-669c2aa30d22'::uuid,'Helena Lacerda'),
 ('258c5dc3-1828-6d47-73bd-3d90d5da9c4f'::uuid,'Ana Luísa Campos'),
 ('2d8da2ce-9180-3fdf-5823-a940a359950b'::uuid,'Caio Siqueira'),
 ('a826ecef-5fa6-e583-5b86-3cd5a7e7b935'::uuid,'Pedro Alencar'),
 ('e2c194fb-175e-ed2d-c1a0-5683721888cf'::uuid,'Isabela Farias'),
 ('af66249d-ab76-ed07-dfaf-5f4a20347c34'::uuid,'Gustavo Reis'),
 ('5c378258-03d5-e0de-2644-7f4e3ddbf7df'::uuid,'Júlia Medeiros'),
 ('f281a74b-12c1-ec1c-d73c-5cd9f19735e5'::uuid,'Luana Barros'),
 ('76e7ab61-13d5-2f5c-9289-969b6bac6902'::uuid,'André Viana'),
 ('f76ec042-3b53-2000-6b94-3be32dba7d2d'::uuid,'Renata Peixoto'),
 ('6ddee97b-e4ed-787d-074b-e0dee2aebc61'::uuid,'Matheus Diniz')
) AS authors(id,name)
WHERE p.id=authors.id AND p.author_id IS NULL AND p.author_name='CoreMotion' AND p.author_badge='Pauta editorial';
