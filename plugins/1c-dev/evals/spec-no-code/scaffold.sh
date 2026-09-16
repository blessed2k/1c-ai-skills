#!/bin/bash
set -e
git init -q .
mkdir -p src/cf/Constants src/cf/CommonModules/ЦенообразованиеСервер/Ext .claude
cat > .claude/1c-dev.md <<'MD'
---
dump_path: src/cf
---
MD
cat > src/cf/Configuration.xml <<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<MetaDataObject xmlns="http://v8.1c.ru/8.3/MDClasses" version="2.20">
  <Configuration>
    <Properties><Name>ДемоТорговля</Name></Properties>
    <ChildObjects>
      <Constant>ВидМинимальноДопустимыхЦенПродажи</Constant>
      <CommonModule>ЦенообразованиеСервер</CommonModule>
    </ChildObjects>
  </Configuration>
</MetaDataObject>
XML
cat > src/cf/Constants/ВидМинимальноДопустимыхЦенПродажи.xml <<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<MetaDataObject xmlns="http://v8.1c.ru/8.3/MDClasses" version="2.20">
  <Constant><Properties><Name>ВидМинимальноДопустимыхЦенПродажи</Name><Synonym>Вид минимально допустимых цен продажи</Synonym></Properties></Constant>
</MetaDataObject>
XML
cat > src/cf/CommonModules/ЦенообразованиеСервер/Ext/Module.bsl <<'BSL'
Процедура ПроверитьМинимальныеЦены(Документ, Отказ) Экспорт
	ВидЦены = Константы.ВидМинимальноДопустимыхЦенПродажи.Получить();
	Если НЕ ЗначениеЗаполнено(ВидЦены) Тогда
		Возврат;
	КонецЕсли;
	Если РольДоступна("ОтклонениеОтУсловийПродаж") Тогда
		Возврат;
	КонецЕсли;
	// сравнение цен строк с минимальными
КонецПроцедуры
BSL
