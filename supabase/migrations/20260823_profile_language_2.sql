-- Optional second preferred language (Profile → Language tab).

alter table profiles
  add column if not exists language_2 text;
