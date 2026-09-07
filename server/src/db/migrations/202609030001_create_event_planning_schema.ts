import type { Knex } from "knex";

const USERS = "users";
const EVENTS = "events";
const TAGS = "tags";
const EVENT_TAGS = "event_tags";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(USERS, (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.string("name", 100).notNullable();
    table.string("email", 320).notNullable().unique();
    table.string("password_hash", 255).notNullable();
    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table.check(
      "char_length(trim(??)) >= 2",
      ["name"],
      "users_name_length_check",
    );
    table.check(
      "?? = lower(??)",
      ["email", "email"],
      "users_email_lowercase_check",
    );
  });

  await knex.schema.createTable(EVENTS, (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table
      .uuid("creator_id")
      .notNullable()
      .references("id")
      .inTable(USERS)
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
    table.string("title", 200).notNullable();
    table.text("description").notNullable();
    table.timestamp("starts_at", { useTz: true }).notNullable();
    table.string("location", 255).notNullable();
    table.string("visibility", 10).notNullable().defaultTo("private");
    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table.check(
      "char_length(trim(??)) >= 1",
      ["title"],
      "events_title_not_blank_check",
    );
    table.check(
      "char_length(trim(??)) >= 1",
      ["description"],
      "events_description_not_blank_check",
    );
    table.check(
      "char_length(trim(??)) >= 1",
      ["location"],
      "events_location_not_blank_check",
    );
    table.check(
      "?? in ('public', 'private')",
      ["visibility"],
      "events_visibility_check",
    );

    table.index(["starts_at", "id"], "events_starts_at_id_index");
    table.index(["creator_id", "starts_at"], "events_creator_starts_at_index");
    table.index(
      ["visibility", "starts_at"],
      "events_visibility_starts_at_index",
    );
  });

  await knex.schema.createTable(TAGS, (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.string("name", 50).notNullable().unique();
    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table.check(
      "char_length(trim(??)) >= 1",
      ["name"],
      "tags_name_not_blank_check",
    );
    table.check(
      "?? = lower(??)",
      ["name", "name"],
      "tags_name_lowercase_check",
    );
  });

  await knex.schema.createTable(EVENT_TAGS, (table) => {
    table
      .uuid("event_id")
      .notNullable()
      .references("id")
      .inTable(EVENTS)
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
    table
      .uuid("tag_id")
      .notNullable()
      .references("id")
      .inTable(TAGS)
      .onUpdate("CASCADE")
      .onDelete("CASCADE");

    table.primary(["event_id", "tag_id"]);
    table.index(["tag_id", "event_id"], "event_tags_tag_id_event_id_index");
  });

  await knex.raw(`
    CREATE FUNCTION event_planner_set_updated_at()
    RETURNS trigger AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER users_set_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION event_planner_set_updated_at();

    CREATE TRIGGER events_set_updated_at
      BEFORE UPDATE ON events
      FOR EACH ROW
      EXECUTE FUNCTION event_planner_set_updated_at();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(EVENT_TAGS);
  await knex.schema.dropTableIfExists(TAGS);
  await knex.schema.dropTableIfExists(EVENTS);
  await knex.schema.dropTableIfExists(USERS);
  await knex.raw("DROP FUNCTION IF EXISTS event_planner_set_updated_at()");
}
