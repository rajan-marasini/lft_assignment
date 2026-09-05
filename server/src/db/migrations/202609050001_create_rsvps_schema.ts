import type { Knex } from "knex";

const RSVPS = "rsvps";
const EVENTS = "events";
const USERS = "users";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(RSVPS, (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table
      .uuid("event_id")
      .notNullable()
      .references("id")
      .inTable(EVENTS)
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable(USERS)
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
    table.string("status", 10).notNullable().defaultTo("yes");
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.unique(["event_id", "user_id"], "rsvps_event_user_unique");
    table.check("?? in ('yes', 'no', 'maybe')", ["status"], "rsvps_status_check");

    table.index(["event_id", "status"], "rsvps_event_id_status_index");
    table.index(["user_id"], "rsvps_user_id_index");
  });

  await knex.raw(`
    CREATE TRIGGER rsvps_set_updated_at
      BEFORE UPDATE ON rsvps
      FOR EACH ROW
      EXECUTE FUNCTION event_planner_set_updated_at();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(RSVPS);
}
