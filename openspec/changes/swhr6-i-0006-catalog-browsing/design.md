# Legacy implementation notes: catalog browsing

- Screens are WAF template screens rendered by category.jsp, product.jsp, item.jsp, search.jsp, sidebar.jsp and main.jsp (home page image map linking to category.screen?category_id=BIRDS|FISH|DOGS|REPTILES|CATS; BIRDS is mapped twice).
- Paging: page size 2 is a legacy constant; lists opened without paging parameters start at row 0.
- Prices: item list (product.jsp) renders list price; search.jsp, item.jsp and the cart render unit cost ("Your Price"). Likely a legacy inconsistency, flagged for the Business Owner.
- Search: SQL lower-cases the searched columns; GenericCatalogDAO binds the keyword as typed while CloudscapeCatalogDAO lower-cases it, so case sensitivity depends on the DAO class configured in web.xml (value redacted). Contradicts the user guide.
- Caching: rendered category list, product item lists and sidebar are cached application-wide for 5 minutes per page and request parameters.
- Language switch: changelocale.do, applied to the shopping controller EJB so the cart follows the language.
- Encoding: EncodingFilter sets request encoding from init-param "encoding" (UTF-8 in web.xml, mapped to /\*). Its documented ASCII default is overwritten by a missing parameter (null).
- Schema: category, product, item and their \*\_details tables keyed by (id, locale); item_details has listprice and unitcost decimal(10,2) not null, image and descn not null, attr1..attr5 nullable (80 chars). Indexes on product.catid and item.productid.
