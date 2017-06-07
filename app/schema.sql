--drop table if exists neighborhood;
create table neighborhood (
  id integer primary key autoincrement,
  name string not null,
  description string,
  lat integer not null,
  lng integer not null,
  place_id string not null
);
