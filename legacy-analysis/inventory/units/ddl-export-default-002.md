# Unit ddl-export-default-002

Read through the DDL export adapter (ddl-export@1.0.0). 20 item(s). Cite each requirement with the trace kind, path and anchor given for its item.

## table product

- trace kind: `db_object`
- path: `db/schema/petstore_cloudscape.sql`
- anchor: `product`
- lines: 30-34

```sql
CREATE TABLE product (
  productid char(10) not null,
  catid char(10) not null,
  constraint pk_product primary key (productid),
  constraint fk_product_1 foreign key (catid) references category (catid));
```

## table product_details

- trace kind: `db_object`
- path: `db/schema/petstore_cloudscape.sql`
- anchor: `product_details`
- lines: 38-45

```sql
CREATE TABLE product_details (
  productid char(10) not null,
  locale char(10) not null,
  name varchar(80) not null,
  image varchar(255),
  descn varchar(255),
  constraint pk_product_details primary key (productid, locale),
  constraint fk_product_details_1 foreign key (productid) references product (productid));
```

## table item_details

- trace kind: `db_object`
- path: `db/schema/petstore_cloudscape.sql`
- anchor: `item_details`
- lines: 57-70

```sql
CREATE TABLE item_details (
  itemid char(10) not null,
  listprice decimal(10,2) not null,
  unitcost decimal(10,2) not null,
  locale char(10) not null,
  image varchar(255) not null,
  descn varchar(255) not null,
  attr1 varchar(80),
  attr2 varchar(80),
  attr3 varchar(80),
  attr4 varchar(80),
  attr5 varchar(80),
  constraint pk_item_details primary key (itemid, locale),
  constraint fk_item_details_1 foreign key (itemid) references item (itemid));
```

## table po_line_item

- trace kind: `db_object`
- path: `db/schema/petstore_cloudscape.sql`
- anchor: `po_line_item`
- lines: 161-171

```sql
CREATE TABLE po_line_item (
  po_id varchar(40) not null,
  line_number varchar(10) not null,
  category_id char(10) not null,
  product_id char(10) not null,
  item_id char(10) not null,
  quantity integer not null,
  unit_price double not null,
  quantity_shipped integer not null,
  constraint pk_po_line_item primary key (po_id, line_number),
  constraint fk_po_line_item_1 foreign key (po_id) references purchase_order (po_id));
```

## table order_manager

- trace kind: `db_object`
- path: `db/schema/petstore_cloudscape.sql`
- anchor: `order_manager`
- lines: 175-178

```sql
CREATE TABLE order_manager (
  order_id varchar(40) not null,
  status varchar(20) not null,
  constraint pk_order_manager primary key (order_id));
```

## index ix_product_catid

- trace kind: `db_object`
- path: `db/schema/petstore_cloudscape.sql`
- anchor: `ix_product_catid`
- lines: 219-219
- touches: reads product

```sql
CREATE INDEX ix_product_catid ON product (catid);
```

## index ix_item_productid

- trace kind: `db_object`
- path: `db/schema/petstore_cloudscape.sql`
- anchor: `ix_item_productid`
- lines: 220-220
- touches: reads item

```sql
CREATE INDEX ix_item_productid ON item (productid);
```

## index ix_po_user

- trace kind: `db_object`
- path: `db/schema/petstore_cloudscape.sql`
- anchor: `ix_po_user`
- lines: 221-221
- touches: reads purchase_order

```sql
CREATE INDEX ix_po_user ON purchase_order (po_user_id);
```

## index ix_po_date

- trace kind: `db_object`
- path: `db/schema/petstore_cloudscape.sql`
- anchor: `ix_po_date`
- lines: 222-222
- touches: reads purchase_order

```sql
CREATE INDEX ix_po_date ON purchase_order (po_date);
```

## index ix_order_manager_status

- trace kind: `db_object`
- path: `db/schema/petstore_cloudscape.sql`
- anchor: `ix_order_manager_status`
- lines: 223-223
- touches: reads order_manager

```sql
CREATE INDEX ix_order_manager_status ON order_manager (status);
```

## table product

- trace kind: `db_object`
- path: `db/schema/petstore_oracle.sql`
- anchor: `product`
- lines: 30-34

```sql
CREATE TABLE product (
  productid varchar2(10) not null,
  catid varchar2(10) not null,
  constraint pk_product primary key (productid),
  constraint fk_product_1 foreign key (catid) references category (catid));
```

## table product_details

- trace kind: `db_object`
- path: `db/schema/petstore_oracle.sql`
- anchor: `product_details`
- lines: 38-45

```sql
CREATE TABLE product_details (
  productid varchar2(10) not null,
  locale varchar2(10) not null,
  name varchar2(80) not null,
  image varchar2(255),
  descn varchar2(255),
  constraint pk_product_details primary key (productid, locale),
  constraint fk_product_details_1 foreign key (productid) references product (productid));
```

## table item_details

- trace kind: `db_object`
- path: `db/schema/petstore_oracle.sql`
- anchor: `item_details`
- lines: 57-70

```sql
CREATE TABLE item_details (
  itemid varchar2(10) not null,
  listprice decimal(10,2) not null,
  unitcost decimal(10,2) not null,
  locale varchar2(10) not null,
  image varchar2(255) not null,
  descn varchar2(255) not null,
  attr1 varchar2(80),
  attr2 varchar2(80),
  attr3 varchar2(80),
  attr4 varchar2(80),
  attr5 varchar2(80),
  constraint pk_item_details primary key (itemid, locale),
  constraint fk_item_details_1 foreign key (itemid) references item (itemid));
```

## table po_line_item

- trace kind: `db_object`
- path: `db/schema/petstore_oracle.sql`
- anchor: `po_line_item`
- lines: 161-171

```sql
CREATE TABLE po_line_item (
  po_id varchar2(40) not null,
  line_number varchar2(10) not null,
  category_id varchar2(10) not null,
  product_id varchar2(10) not null,
  item_id varchar2(10) not null,
  quantity integer not null,
  unit_price number(12,2) not null,
  quantity_shipped integer not null,
  constraint pk_po_line_item primary key (po_id, line_number),
  constraint fk_po_line_item_1 foreign key (po_id) references purchase_order (po_id));
```

## table order_manager

- trace kind: `db_object`
- path: `db/schema/petstore_oracle.sql`
- anchor: `order_manager`
- lines: 175-178

```sql
CREATE TABLE order_manager (
  order_id varchar2(40) not null,
  status varchar2(20) not null,
  constraint pk_order_manager primary key (order_id));
```

## index ix_product_catid

- trace kind: `db_object`
- path: `db/schema/petstore_oracle.sql`
- anchor: `ix_product_catid`
- lines: 219-219
- touches: reads product

```sql
CREATE INDEX ix_product_catid ON product (catid);
```

## index ix_item_productid

- trace kind: `db_object`
- path: `db/schema/petstore_oracle.sql`
- anchor: `ix_item_productid`
- lines: 220-220
- touches: reads item

```sql
CREATE INDEX ix_item_productid ON item (productid);
```

## index ix_po_user

- trace kind: `db_object`
- path: `db/schema/petstore_oracle.sql`
- anchor: `ix_po_user`
- lines: 221-221
- touches: reads purchase_order

```sql
CREATE INDEX ix_po_user ON purchase_order (po_user_id);
```

## index ix_po_date

- trace kind: `db_object`
- path: `db/schema/petstore_oracle.sql`
- anchor: `ix_po_date`
- lines: 222-222
- touches: reads purchase_order

```sql
CREATE INDEX ix_po_date ON purchase_order (po_date);
```

## index ix_order_manager_status

- trace kind: `db_object`
- path: `db/schema/petstore_oracle.sql`
- anchor: `ix_order_manager_status`
- lines: 223-223
- touches: reads order_manager

```sql
CREATE INDEX ix_order_manager_status ON order_manager (status);
```
