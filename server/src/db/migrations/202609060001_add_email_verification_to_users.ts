import type { Knex } from "knex";

const USERS = "users";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(USERS, (table) => {
    table.boolean("is_verified").notNullable().defaultTo(false);
    table.string("verification_token", 255).nullable();
    table
      .timestamp("verification_token_expires_at", { useTz: true })
      .nullable();
    table.index(["verification_token"], "users_verification_token_index");
  });

  // Automatically mark existing users as verified so existing accounts/tests are not locked out
  await knex(USERS).update({ is_verified: true });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(USERS, (table) => {
    table.dropIndex(["verification_token"], "users_verification_token_index");
    table.dropColumn("verification_token_expires_at");
    table.dropColumn("verification_token");
    table.dropColumn("is_verified");
  });
}
