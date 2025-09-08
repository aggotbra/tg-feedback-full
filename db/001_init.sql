create table if not exists suggestions (
  id            bigserial primary key,
  user_id       text,
  product       text not null,
  topic         text,
  text          text not null,
  votes_up      integer not null default 0,
  votes_down    integer not null default 0,
  status        text not null default 'new',
  external_key  text,
  created_at    timestamptz not null default now()
);

create table if not exists votes (
  id             bigserial primary key,
  suggestion_id  bigint not null references suggestions(id) on delete cascade,
  voter          text not null,
  value          smallint not null,
  created_at     timestamptz not null default now(),
  unique (suggestion_id, voter)
);

create index if not exists idx_suggestions_created_at on suggestions(created_at desc);
create index if not exists idx_suggestions_product on suggestions(product);
create index if not exists idx_votes_suggestion on votes(suggestion_id);
