# Tables

user(<u>username</u>, name, email, hashed_password, favourite_club, type)

```sql
CREATE TABLE "C##FPL"."user" (
  "username" VARCHAR2(20) NOT NULL,
  "name" VARCHAR2(50) NOT NULL,
  "email" VARCHAR2(100) NOT NULL,
  "hashed_password" VARCHAR2(128) NOT NULL,
  "favourite_club" NCHAR(3) NOT NULL,
  "user_type" VARCHAR2(10) NOT NULL,
  "disabled" SMALLINT DEFAULT 0 NOT NULL,
  PRIMARY KEY ("username"),
  CONSTRAINT "user_unique_email" UNIQUE ("email"),
  CONSTRAINT "disabled_boolean" CHECK ("disabled" in (0, 1)),
  CONSTRAINT "valid_user_type" CHECK ("user_type" in ('ADMIN', 'USER', 'SCOUT'))
);
```

blog(<u>id</u>, writer, publication_date, title, cover_image, content)

```sql
CREATE TABLE "C##FPL"."blog" (
  "id" NUMBER GENERATED BY DEFAULT AS IDENTITY,
  "writer" VARCHAR2(20),
  "publication_date" TIMESTAMP NOT NULL,
  "title" VARCHAR2(100) NOT NULL,
  "cover_image_url" VARCHAR2(255) NOT NULL,
  "content" LONG NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "user_blog_writer" 
    FOREIGN KEY ("writer") REFERENCES "user"("username") 
    ON DELETE SET NULL
);
```

team(<u>id</u>, owner, team_name, balance_left, total_points)

```sql
CREATE TABLE "C##FPL"."team" (
  "id" NUMBER GENERATED BY DEFAULT AS IDENTITY,
  "owner" VARCHAR2(20) NOT NULL,
  "team_name" VARCHAR2(50) NOT NULL,
  "team_balance" NUMBER(4,1) DEFAULT 100.0 NOT NULL,
  "total_points" NUMBER(4,0) DEFAULT 0 NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "team_has_owner" FOREIGN KEY ("owner") REFERENCES "user"("username") ON DELETE CASCADE,
  CONSTRAINT "team_balance_non_negative" CHECK ("team_balance" >= 0)
);
```

league(<u>id</u>, owner, name, type, invitation_code)

```sql
CREATE TABLE "C##FPL"."league" (
  "id" NUMBER GENERATED BY DEFAULT AS IDENTITY,
  "owner" VARCHAR2(20) NOT NULL,
  "name" VARCHAR2(50) NOT NULL,
  "type" VARCHAR2(10) NOT NULL,
  "invitation_code" VARCHAR2(6) NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "league_has_owner" FOREIGN KEY ("owner") REFERENCES "user"("username") ON DELETE CASCADE,
  CONSTRAINT "valid_league_type" CHECK ("type" in ('PUBLIC', 'PRIVATE'))
);
```

participation(<u>team_id</u>, <u>league_id</u>)

```sql
CREATE TABLE "C##FPL"."participation" (
  "team_id" NUMBER NOT NULL,
  "league_id" NUMBER NOT NULL,
  PRIMARY KEY ("team_id", "league_id"),
  CONSTRAINT "participate_in_league" 
    FOREIGN KEY ("league_id") REFERENCES "league"("id") 
    ON DELETE CASCADE,
  CONSTRAINT "participation_of_team" 
    FOREIGN KEY ("team_id") REFERENCES "team"("id") 
    ON DELETE CASCADE
);
```

club(<u>short_name</u>, name, logo)

```sql
CREATE TABLE "C##FPL"."club" (
  "short_name" NCHAR(3),
  "name" VARCHAR2(50) NOT NULL,
  "logo_url" VARCHAR2(255) NOT NULL,
  PRIMARY KEY("short_name")
);
```

player(<u>id</u>, name, position, availibility_status, availibility_last_changed, availibility_percentage, price_current, price_last_changed, price_change_amount, club)

```sql
CREATE TABLE "C##FPL"."player" (
  "id" NUMBER GENERATED BY DEFAULT AS IDENTITY,
  "name" VARCHAR2(50) NOT NULL,
  "position" NCHAR(3) NOT NULL,
  "availibility_status" VARCHAR2(50),
  "availibility_last_changed" TIMESTAMP,
  "availibility_percentage" NUMBER(3) DEFAULT 100 NOT NULL,
  "price_current" NUMBER(3, 1) NOT NULL,
  "price_last_changed" TIMESTAMP,
  "price_change_amount" NUMBER(1, 1),
  "club" NCHAR(3),
  PRIMARY KEY("id"),
  CONSTRAINT "player_of_club" 
    FOREIGN KEY ("club") REFERENCES "club"("short_name") 
    ON DELETE SET NULL,
  CONSTRAINT "valid_player_position"
    CHECK("position" in ('GKP', 'DEF', 'MID', 'FWD'))
);
```

current_squad(<u>team_id</u>, <u>player_id</u>, buying_price)

```sql
CREATE TABLE "C##FPL"."current_squad" (
  "team_id" NUMBER NOT NULL,
  "player_id" NUMBER NOT NULL,
  "buying_price" NUMBER(3,1) NOT NULL,
  PRIMARY KEY ("team_id", "player_id"),
  CONSTRAINT "player_in_current_squad" 
    FOREIGN KEY ("player_id") REFERENCES "player"("id") 
    ON DELETE CASCADE,
  CONSTRAINT "current_squad_of_team" 
    FOREIGN KEY ("team_id") REFERENCES "team"("id") 
    ON DELETE CASCADE
);
```

gw(<u>id</u>, deadline)

```sql
CREATE TABLE "C##FPL"."gw" (
  "id" NUMBER(2) NOT NULL,
  "deadline" TIMESTAMP NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "valid_gw_number" CHECK("id" BETWEEN 1 AND 38)
);
```

fixture(gw_id, <u>home_club</u>, <u>away_club</u>)

```sql
CREATE TABLE "C##FPL"."fixture" (
  "id" NUMBER GENERATED BY DEFAULT AS IDENTITY,
  "gw_id" NUMBER(2),
  "home_club" NCHAR(3) NOT NULL,
  "away_club" NCHAR(3) NOT NULL,
  "result" VARCHAR2(7),
  PRIMARY KEY ("id"),
  CONSTRAINT "fixture_clubs"
    UNIQUE("home_club", "away_club"),
  CONSTRAINT "fixture_of_gw" 
    FOREIGN KEY ("gw_id") REFERENCES "gw"("id") 
    ON DELETE CASCADE,
  CONSTRAINT "home_club_fixture" 
    FOREIGN KEY ("home_club") REFERENCES "club"("short_name") 
    ON DELETE CASCADE,
  CONSTRAINT "away_club_fixture" 
    FOREIGN KEY ("away_club") REFERENCES "club"("short_name") 
    ON DELETE CASCADE
);
```

prev_gw_sqad(<u>gw_id</u>, <u>team_id</u>, <u>player_id</u>)

```sql
CREATE TABLE "C##FPL"."prev_gw_sqad" (
  "team_id" NUMBER NOT NULL,
  "player_id" NUMBER NOT NULL,
  "gw_id" NUMBER(2) NOT NULL,
  PRIMARY KEY ("team_id", "player_id", "gw_id"),
  CONSTRAINT "squad_of_prev_gw" 
    FOREIGN KEY ("gw_id") REFERENCES "gw"("id") 
    ON DELETE CASCADE,
  CONSTRAINT "player_in_prev_squad" 
    FOREIGN KEY ("player_id") REFERENCES "player"("id") 
    ON DELETE CASCADE,
  CONSTRAINT "prev_squad_of_team" 
    FOREIGN KEY ("team_id") REFERENCES "team"("id") 
    ON DELETE CASCADE
);
```

event(<u>type</u>, details)

```sql
CREATE TABLE "C##FPL"."event"(
  "type" VARCHAR2(5),
  "details" VARCHAR2(255),
  PRIMARY KEY ("type")
)
```

point_system(<u>event_type</u>, <u>position</u>, point)

```sql
CREATE TABLE "C##FPL"."point_system"(
  "type" VARCHAR2(5),
  "position" NCHAR(3) NOT NULL,
  "point" NUMBER(2) NOT NULL,
  PRIMARY KEY ("type", "position"),
  CONSTRAINT "event_type_in_point_system" 
    FOREIGN KEY ("type") REFERENCES "event"("type") 
    ON DELETE CASCADE,
  CONSTRAINT "valid_player_position_in_point_system"
    CHECK("position" in ('GKP', 'DEF', 'MID', 'FWD'))
);
```

fixture_event(<u>event_id</u>, fixture_id, player_id, event_type)

```sql
CREATE TABLE "C##FPL"."fixture_event"(
  "id" NUMBER GENERATED BY DEFAULT AS IDENTITY,
  "fixture_id" NUMBER NOT NULL,
  "player_id" NUMBER NOT NULL,
  "event_type" VARCHAR2(5) NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "event_of_player" 
    FOREIGN KEY ("player_id") REFERENCES "player"("id") 
    ON DELETE CASCADE,
  CONSTRAINT "event_of_fixture" 
    FOREIGN KEY ("fixture_id") REFERENCES "fixture"("id") 
    ON DELETE CASCADE,
  CONSTRAINT "event_type" 
    FOREIGN KEY ("event_type") REFERENCES "event"("type") 
    ON DELETE CASCADE
);
```

fixture_stats(<u>player_id</u>, <u>fixture_id</u>, points, minutes_played, goal_scored, goal_conceded, own_goal, penalty_scored, penalty_missed, yellow_card, red_card, saves, bonus_point, selected_by, price)

```sql
CREATE TABLE "C##FPL"."fixture_stats" (
  "player_id" NUMBER NOT NULL,
  "fixture_id" NUMBER NOT NULL,
  "points"           NUMBER(2) DEFAULT 0 NOT NULL,
  "minutes_played"   NUMBER(3) DEFAULT 0 NOT NULL,
  "goal_scored"      NUMBER(2) DEFAULT 0 NOT NULL,
  "goal_conceded"    NUMBER(2) DEFAULT 0 NOT NULL,
  "own_goal"         NUMBER(2) DEFAULT 0 NOT NULL,
  "penalty_scored"   NUMBER(2) DEFAULT 0 NOT NULL,
  "penalty_missed"   NUMBER(2) DEFAULT 0 NOT NULL,
  "yellow_card"      NUMBER(2) DEFAULT 0 NOT NULL,
  "red_card"         NUMBER(2) DEFAULT 0 NOT NULL,
  "saves"            NUMBER(2) DEFAULT 0 NOT NULL,
  "bonus_point"      NUMBER(1) DEFAULT 0 NOT NULL,
  "selected_by"      NUMBER(10) DEFAULT 0 NOT NULL,
  "price"            NUMBER(3, 1) DEFAULT 0 NOT NULL,
  PRIMARY KEY ("player_id", "fixture_id"),
  CONSTRAINT "stat_of_prev_fixture" 
    FOREIGN KEY ("fixture_id") REFERENCES "fixture"("id") 
    ON DELETE CASCADE,
  CONSTRAINT "stat_of_player" 
    FOREIGN KEY ("player_id") REFERENCES "player"("id") 
    ON DELETE CASCADE
);
```

settings (key, value)

```sql
CREATE TABLE "C##FPL"."settings" (
  "key"    VARCHAR2(20) NOT NULL,
  "value"  NUMBER,
  PRIMARY KEY ("key")
);
```

# Views

player_list_view

```sql
CREATE OR REPLACE 
  VIEW "player_list_view" AS 
  SELECT 
    P."id", P."name", P."position", P."club", 
    C."name" "club_name", P."price_current", 
    P."availibility_status", P."availibility_percentage", 
    C."logo_url" 
  FROM "C##FPL"."player" P 
  JOIN "C##FPL"."club" C 
  ON (P."club" = C."short_name") 
WITH READ ONLY;
```

fixture_list

```sql
CREATE OR REPLACE 
  VIEW "fixture_list" AS
  SELECT 
    "id", 
    "gw_id", 
    "home_club", 
    "away_club", 
    H."name" "home_full_name", 
    H."logo_url" "home_logo_url", 
    A."name" "away_full_name", 
    A."logo_url" "away_logo_url",
    "result" 
  FROM "C##FPL"."fixture" 
  JOIN "club" H ON ("home_club" = H."short_name") 
  JOIN "club" A ON ("away_club" = A."short_name");
```

# Triggers

```sql
CREATE OR REPLACE TRIGGER "last_update_trigger" 
    BEFORE UPDATE ON "player"
    FOR EACH ROW 
DECLARE
BEGIN

    IF :NEW."availibility_status" != :OLD."availibility_status" OR 
        :NEW."availibility_percentage" != :OLD."availibility_percentage" THEN
        :NEW."availibility_last_changed" := CURRENT_TIMESTAMP;
    END IF;

    IF :NEW."price_current" != :OLD."price_current" THEN
            :NEW."price_last_changed" := CURRENT_TIMESTAMP;
            :NEW."price_change_amount" := :NEW."price_current" - :OLD."price_current";
    END IF;

END;
```