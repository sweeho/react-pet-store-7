-- EXTRACTED FROM LEGACY SOURCE — evidence of what exists, not a build target. Where this disagrees with a capability delta spec, the delta spec wins.
-- Source: legacy-source/db/schema/petstore_oracle.sql (Oracle dialect; Cloudscape script has identical structure with char/varchar/double types).
-- Reconstructed from DDL excerpts in the extraction IR; columns elided in an excerpt are marked. Not executable as-is.

CREATE TABLE category (
  catid varchar2(10) not null,
  constraint pk_category primary key (catid));
CREATE TABLE category_details (
  catid varchar2(10) not null,
  name varchar2(80) not null,
  image varchar2(255),
  descn varchar2(255),
  locale varchar2(10) not null,
  constraint pk_category_details primary key (catid, locale),
  constraint fk_category_details_1 foreign key (catid) references category (catid));
CREATE TABLE product (
  productid varchar2(10) not null,
  catid varchar2(10) not null,
  constraint pk_product primary key (productid),
  constraint fk_product_1 foreign key (catid) references category (catid));
CREATE TABLE product_details (
  productid varchar2(10) not null,
  locale varchar2(10) not null,
  name varchar2(80) not null,
  image varchar2(255),
  descn varchar2(255),
  constraint pk_product_details primary key (productid, locale),
  constraint fk_product_details_1 foreign key (productid) references product (productid));
CREATE TABLE item (
  itemid varchar2(10) not null,
  productid varchar2(10) not null,
  constraint pk_item primary key (itemid),
  constraint fk_item_1 foreign key (productid) references product (productid));
CREATE TABLE item_details (
  itemid varchar2(10) not null,
  listprice decimal(10,2) not null,
  unitcost decimal(10,2) not null,
  locale varchar2(10) not null,
  image varchar2(255) not null,
  descn varchar2(255) not null,
  attr1 varchar2(80), attr2 varchar2(80), attr3 varchar2(80), attr4 varchar2(80), attr5 varchar2(80),
  constraint pk_item_details primary key (itemid, locale),
  constraint fk_item_details_1 foreign key (itemid) references item (itemid));
-- Deliberately NO check relating listprice to unitcost (sample data has an item priced below cost).

CREATE TABLE signon_user (
  username varchar2(50) not null,
  password varchar2(50) not null,   -- plain text in legacy
  constraint pk_signon_user primary key (username));

CREATE TABLE address (
  address_id varchar2(40) not null,
  street_name1 varchar2(80) not null,
  street_name2 varchar2(80),
  city varchar2(80) not null,
  state varchar2(40) not null,
  zip_code varchar2(20) not null,
  country varchar2(40) not null,
  constraint pk_address primary key (address_id));
CREATE TABLE contact_info (
  contact_id varchar2(40) not null,
  family_name varchar2(80) not null,
  given_name varchar2(80) not null,
  telephone varchar2(40) not null,
  email varchar2(120) not null,
  address_id varchar2(40) not null,
  constraint pk_contact_info primary key (contact_id),
  constraint fk_contact_info_1 foreign key (address_id) references address (address_id));
CREATE TABLE credit_card (
  card_id varchar2(40) not null,
  card_number varchar2(40) not null,  -- clear text in legacy
  card_type varchar2(40) not null,
  expiry_date varchar2(10) not null,  -- free text, e.g. 04/04
  constraint pk_credit_card primary key (card_id));
CREATE TABLE account (
  account_id varchar2(40) not null,
  status varchar2(20) not null,
  contact_id varchar2(40) not null,
  card_id varchar2(40) not null,
  constraint pk_account primary key (account_id),
  constraint fk_account_1 foreign key (contact_id) references contact_info (contact_id),
  constraint fk_account_2 foreign key (card_id) references credit_card (card_id));
CREATE TABLE profile (
  profile_id varchar2(40) not null,
  preferred_language varchar2(10) not null,
  favorite_category varchar2(10),
  my_list_preference number(1) not null,
  banner_preference number(1) not null,
  constraint pk_profile primary key (profile_id));
CREATE TABLE customer (
  user_id varchar2(50) not null,
  account_id varchar2(40) not null,
  profile_id varchar2(40) not null,
  constraint pk_customer primary key (user_id),
  constraint fk_customer_1 foreign key (user_id) references signon_user (username),
  constraint fk_customer_2 foreign key (account_id) references account (account_id),
  constraint fk_customer_3 foreign key (profile_id) references profile (profile_id));

CREATE TABLE purchase_order (
  po_id varchar2(40) not null,
  po_user_id varchar2(50) not null,
  po_email_id varchar2(120) not null,
  po_date number(19) not null,
  po_locale varchar2(10) not null,
  po_value number(12,2) not null,
  contact_id varchar2(40) not null,
  card_id varchar2(40) not null,
  constraint pk_purchase_order primary key (po_id),
  constraint fk_purchase_order_1 foreign key (contact_id) references contact_info (contact_id),
  constraint fk_purchase_order_2 foreign key (card_id) references credit_card (card_id));
CREATE TABLE po_line_item (
  po_id varchar2(40) not null,
  line_number varchar2(10) not null,
  -- category_id, product_id, item_id columns elided in the IR excerpt (present in legacy; types not captured)
  quantity integer not null,
  unit_price number(12,2) not null,   -- double in the Cloudscape script
  quantity_shipped integer not null,
  constraint pk_po_line_item primary key (po_id, line_number),
  constraint fk_po_line_item_1 foreign key (po_id) references purchase_order (po_id));
CREATE TABLE order_manager (
  order_id varchar2(40) not null,
  status varchar2(20) not null,       -- PENDING / APPROVED / DENIED / COMPLETED enforced in application code, no CHECK
  constraint pk_order_manager primary key (order_id));

CREATE TABLE supplier_order (
  po_id varchar2(40) not null,
  po_date number(19) not null,
  po_status varchar2(20) not null,
  contact_id varchar2(40) not null,
  constraint pk_supplier_order primary key (po_id),
  constraint fk_supplier_order_1 foreign key (contact_id) references contact_info (contact_id));
CREATE TABLE supplier_line_item (
  po_id varchar2(40) not null,
  line_number varchar2(10) not null,
  category_id varchar2(10) not null,
  product_id varchar2(10) not null,
  item_id varchar2(10) not null,
  quantity integer not null,
  unit_price number(12,2) not null,
  quantity_shipped integer not null,
  constraint pk_supplier_line_item primary key (po_id, line_number),
  constraint fk_supplier_line_item_1 foreign key (po_id) references supplier_order (po_id));
CREATE TABLE inventory (
  item_id varchar2(10) not null,
  quantity integer not null,          -- stock must never be negative (see inventory-management spec)
  constraint pk_inventory primary key (item_id));
CREATE TABLE counter (
  name varchar2(40) not null,
  counter integer not null,
  constraint pk_counter primary key (name));

CREATE INDEX ix_product_catid ON product (catid);
-- ix_item_productid on item (productid); ix_order_manager_status on order_manager (status);
-- ix_po_user on purchase_order (po_user_id); ix_po_date on purchase_order (po_date)

CREATE VIEW v_order_status AS
  SELECT p.po_id, p.po_user_id, p.po_date, p.po_value, m.status
  FROM purchase_order p JOIN order_manager m ON m.order_id = p.po_id;
