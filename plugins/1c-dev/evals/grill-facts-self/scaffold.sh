#!/bin/bash
set -e
mkdir -p src/cf/Catalogs .claude
cat > .claude/1c-dev.md <<'MD'
---
dump_path: src/cf
mcp: none
---
MD
cat > src/cf/Configuration.xml <<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<MetaDataObject xmlns="http://v8.1c.ru/8.3/MDClasses" version="2.20">
  <Configuration>
    <Properties><Name>ДемоТорговля</Name><CompatibilityMode>Version8_3_24</CompatibilityMode></Properties>
    <ChildObjects><Catalog>Партнеры</Catalog></ChildObjects>
  </Configuration>
</MetaDataObject>
XML
cat > src/cf/Catalogs/Партнеры.xml <<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<MetaDataObject xmlns="http://v8.1c.ru/8.3/MDClasses" version="2.20">
  <Catalog>
    <Properties><Name>Партнеры</Name></Properties>
    <ChildObjects>
      <Attribute><Properties><Name>ИНН</Name><Type><v8:Type xmlns:v8="http://v8.1c.ru/8.1/data/core">xs:string</v8:Type></Type></Properties></Attribute>
      <Attribute><Properties><Name>Поставщик</Name><Type><v8:Type xmlns:v8="http://v8.1c.ru/8.1/data/core">xs:boolean</v8:Type></Type></Properties></Attribute>
      <Attribute><Properties><Name>Клиент</Name><Type><v8:Type xmlns:v8="http://v8.1c.ru/8.1/data/core">xs:boolean</v8:Type></Type></Properties></Attribute>
    </ChildObjects>
  </Catalog>
</MetaDataObject>
XML
