# Unit ddl-export-default-001

Read through the DDL export adapter (ddl-export@1.0.0). 20 item(s). Cite each requirement with the trace kind, path and anchor given for its item.

## table category

- trace kind: `db_object`
- path: `db/schema/petstore_cloudscape.sql`
- anchor: `category`
- lines: 13-15

```sql
CREATE TABLE category (
  catid char(10) not null,
  constraint pk_category primary key (catid));
```

## table category_details

- trace kind: `db_object`
- path: `db/schema/petstore_cloudscape.sql`
- anchor: `category_details`
- lines: 19-26

```sql
CREATE TABLE category_details (
  catid char(10) not null,
  name varchar(80) not null,
  image varchar(255),
  descn varchar(255),
  locale char(10) not null,
  constraint pk_category_details primary key (catid, locale),
  constraint fk_category_details_1 foreign key (catid) references category (catid));
```

## table item

- trace kind: `db_object`
- path: `db/schema/petstore_cloudscape.sql`
- anchor: `item`
- lines: 49-53

```sql
CREATE TABLE item (
  itemid char(10) not null,
  productid char(10) not null,
  constraint pk_item primary key (itemid),
  constraint fk_item_1 foreign key (productid) references product (productid));
```

## table address

- trace kind: `db_object`
- path: `db/schema/petstore_cloudscape.sql`
- anchor: `address`
- lines: 81-89

```sql
CREATE TABLE address (
  address_id varchar(40) not null,
  street_name1 varchar(80) not null,
  street_name2 varchar(80),
  city varchar(80) not null,
  state varchar(40) not null,
  zip_code varchar(20) not null,
  country varchar(40) not null,
  constraint pk_address primary key (address_id));
```

## table contact_info

- trace kind: `db_object`
- path: `db/schema/petstore_cloudscape.sql`
- anchor: `contact_info`
- lines: 93-101

```sql
CREATE TABLE contact_info (
  contact_id varchar(40) not null,
  family_name varchar(80) not null,
  given_name varchar(80) not null,
  telephone varchar(40) not null,
  email varchar(120) not null,
  address_id varchar(40) not null,
  constraint pk_contact_info primary key (contact_id),
  constraint fk_contact_info_1 foreign key (address_id) references address (address_id));
```

## table credit_card

- trace kind: `db_object`
- path: `db/schema/petstore_cloudscape.sql`
- anchor: `credit_card`
- lines: 105-110

```sql
CREATE TABLE credit_card (
  card_id varchar(40) not null,
  card_number varchar(40) not null,
  card_type varchar(40) not null,
  expiry_date varchar(10) not null,
  constraint pk_credit_card primary key (card_id));
```

## table account

- trace kind: `db_object`
- path: `db/schema/petstore_cloudscape.sql`
- anchor: `account`
- lines: 114-121

```sql
CREATE TABLE account (
  account_id varchar(40) not null,
  status varchar(20) not null,
  contact_id varchar(40) not null,
  card_id varchar(40) not null,
  constraint pk_account primary key (account_id),
  constraint fk_account_1 foreign key (contact_id) references contact_info (contact_id),
  constraint fk_account_2 foreign key (card_id) references credit_card (card_id));
```

## table customer

- trace kind: `db_object`
- path: `db/schema/petstore_cloudscape.sql`
- anchor: `customer`
- lines: 135-142

```sql
CREATE TABLE customer (
  user_id varchar(50) not null,
  account_id varchar(40) not null,
  profile_id varchar(40) not null,
  constraint pk_customer primary key (user_id),
  constraint fk_customer_1 foreign key (user_id) references signon_user (username),
  constraint fk_customer_2 foreign key (account_id) references account (account_id),
  constraint fk_customer_3 foreign key (profile_id) references profile (profile_id));
```

## table inventory

- trace kind: `db_object`
- path: `db/schema/petstore_cloudscape.sql`
- anchor: `inventory`
- lines: 206-209

```sql
CREATE TABLE inventory (
  item_id char(10) not null,
  quantity integer not null,
  constraint pk_inventory primary key (item_id));
```

## table counter

- trace kind: `db_object`
- path: `db/schema/petstore_cloudscape.sql`
- anchor: `counter`
- lines: 213-216

```sql
CREATE TABLE counter (
  name varchar(40) not null,
  counter integer not null,
  constraint pk_counter primary key (name));
```

## table category

- trace kind: `db_object`
- path: `db/schema/petstore_oracle.sql`
- anchor: `category`
- lines: 13-15

```sql
CREATE TABLE category (
  catid varchar2(10) not null,
  constraint pk_category primary key (catid));
```

## table category_details

- trace kind: `db_object`
- path: `db/schema/petstore_oracle.sql`
- anchor: `category_details`
- lines: 19-26

```sql
CREATE TABLE category_details (
  catid varchar2(10) not null,
  name varchar2(80) not null,
  image varchar2(255),
  descn varchar2(255),
  locale varchar2(10) not null,
  constraint pk_category_details primary key (catid, locale),
  constraint fk_category_details_1 foreign key (catid) references category (catid));
```

## table item

- trace kind: `db_object`
- path: `db/schema/petstore_oracle.sql`
- anchor: `item`
- lines: 49-53

```sql
CREATE TABLE item (
  itemid varchar2(10) not null,
  productid varchar2(10) not null,
  constraint pk_item primary key (itemid),
  constraint fk_item_1 foreign key (productid) references product (productid));
```

## table address

- trace kind: `db_object`
- path: `db/schema/petstore_oracle.sql`
- anchor: `address`
- lines: 81-89

```sql
CREATE TABLE address (
  address_id varchar2(40) not null,
  street_name1 varchar2(80) not null,
  street_name2 varchar2(80),
  city varchar2(80) not null,
  state varchar2(40) not null,
  zip_code varchar2(20) not null,
  country varchar2(40) not null,
  constraint pk_address primary key (address_id));
```

## table contact_info

- trace kind: `db_object`
- path: `db/schema/petstore_oracle.sql`
- anchor: `contact_info`
- lines: 93-101

```sql
CREATE TABLE contact_info (
  contact_id varchar2(40) not null,
  family_name varchar2(80) not null,
  given_name varchar2(80) not null,
  telephone varchar2(40) not null,
  email varchar2(120) not null,
  address_id varchar2(40) not null,
  constraint pk_contact_info primary key (contact_id),
  constraint fk_contact_info_1 foreign key (address_id) references address (address_id));
```

## table credit_card

- trace kind: `db_object`
- path: `db/schema/petstore_oracle.sql`
- anchor: `credit_card`
- lines: 105-110

```sql
CREATE TABLE credit_card (
  card_id varchar2(40) not null,
  card_number varchar2(40) not null,
  card_type varchar2(40) not null,
  expiry_date varchar2(10) not null,
  constraint pk_credit_card primary key (card_id));
```

## table account

- trace kind: `db_object`
- path: `db/schema/petstore_oracle.sql`
- anchor: `account`
- lines: 114-121

```sql
CREATE TABLE account (
  account_id varchar2(40) not null,
  status varchar2(20) not null,
  contact_id varchar2(40) not null,
  card_id varchar2(40) not null,
  constraint pk_account primary key (account_id),
  constraint fk_account_1 foreign key (contact_id) references contact_info (contact_id),
  constraint fk_account_2 foreign key (card_id) references credit_card (card_id));
```

## table customer

- trace kind: `db_object`
- path: `db/schema/petstore_oracle.sql`
- anchor: `customer`
- lines: 135-142

```sql
CREATE TABLE customer (
  user_id varchar2(50) not null,
  account_id varchar2(40) not null,
  profile_id varchar2(40) not null,
  constraint pk_customer primary key (user_id),
  constraint fk_customer_1 foreign key (user_id) references signon_user (username),
  constraint fk_customer_2 foreign key (account_id) references account (account_id),
  constraint fk_customer_3 foreign key (profile_id) references profile (profile_id));
```

## table inventory

- trace kind: `db_object`
- path: `db/schema/petstore_oracle.sql`
- anchor: `inventory`
- lines: 206-209

```sql
CREATE TABLE inventory (
  item_id varchar2(10) not null,
  quantity integer not null,
  constraint pk_inventory primary key (item_id));
```

## table counter

- trace kind: `db_object`
- path: `db/schema/petstore_oracle.sql`
- anchor: `counter`
- lines: 213-216

```sql
CREATE TABLE counter (
  name varchar2(40) not null,
  counter integer not null,
  constraint pk_counter primary key (name));
```
