#!/bin/bash
set -e
git init -q .
mkdir -p src/cf/Constants src/cf/CommonModules/ЦенообразованиеСервер/Ext src/cf/Documents/ЗаказКлиента/Ext src/cf/Roles .claude
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
      <Role>ОтклонениеОтУсловийПродаж</Role>
      <Document>ЗаказКлиента</Document>
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
	МинимальныеЦены = ЦеныНоменклатуры(Документ.Товары.ВыгрузитьКолонку("Номенклатура"), ВидЦены);
	Для Каждого Строка Из Документ.Товары Цикл
		МинимальнаяЦена = МинимальныеЦены.Получить(Строка.Номенклатура);
		Если МинимальнаяЦена <> Неопределено И Строка.Цена < МинимальнаяЦена Тогда
			Сообщение = Новый СообщениеПользователю;
			Сообщение.Текст = "Цена ниже минимальной: " + Строка.Номенклатура;
			Сообщение.Сообщить();
			Отказ = Истина;
		КонецЕсли;
	КонецЦикла;
КонецПроцедуры

Функция ЦеныНоменклатуры(Номенклатура, ВидЦены)
	Результат = Новый Соответствие;
	// чтение цен из регистра цен по виду цены
	Возврат Результат;
КонецФункции
BSL
cat > src/cf/Documents/ЗаказКлиента/Ext/ObjectModule.bsl <<'BSL'
Процедура ОбработкаПроверкиЗаполнения(Отказ, ПроверяемыеРеквизиты)
	ЦенообразованиеСервер.ПроверитьМинимальныеЦены(ЭтотОбъект, Отказ);
КонецПроцедуры
BSL
cat > src/cf/Roles/ОтклонениеОтУсловийПродаж.xml <<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<MetaDataObject xmlns="http://v8.1c.ru/8.3/MDClasses" version="2.20">
  <Role><Properties><Name>ОтклонениеОтУсловийПродаж</Name><Synonym>Отклонение от условий продаж</Synonym></Properties></Role>
</MetaDataObject>
XML
