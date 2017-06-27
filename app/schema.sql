drop table if exists neighborhood;
create table neighborhood (
  id integer primary key autoincrement,
  name string not null,
  description string,
  lat integer not null,
  lng integer not null,
  place_id string not null
);

insert into neighborhood (name, description, lat, lng, place_id) values ('Galeria São Paulo','R. Santa Efigênia, 364', -23.5386669,-46.6389057,'ChIJzQRro1BYzpQR56s7v5nJSiY');
insert into neighborhood (name, description, lat, lng, place_id) values ('Sushi Lika','R. dos Estudantes, 152', -23.5527241, -46.633751,'ChIJu5kz-r9kzpQR8eHthm8zr8E');
insert into neighborhood (name, description, lat, lng, place_id) values ('Lamen Kazu','R. Thomaz Gonzaga, 51',-23.557696,-46.635886,'ChIJfbcVS2NgzpQRKYYwcNza9T4');
insert into neighborhood (name, description, lat, lng, place_id) values ('Praça da Sé','Pç. da Sé',-23.5498772,-46.6339869,'ChIJM0KuqqtZzpQRscVLca9vGNk');
insert into neighborhood (name, description, lat, lng, place_id) values ('Sushi Isao | 寿司いさお','R. da Glória, 111',-23.5541311,-46.6340817,'ChIJu5kz-r9kzpQR8eHthm8zr8E');