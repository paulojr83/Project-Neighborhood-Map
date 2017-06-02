drop table if exists todos;
create table todos (
  id integer primary key autoincrement,
  title string not null,
  description string not null
);
