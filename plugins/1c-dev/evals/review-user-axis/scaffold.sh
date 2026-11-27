#!/bin/bash
set -e
EXT=src/ПримерРасширения
mkdir -p docs/specs .claude "$EXT/Documents/СчетНаОплатуПокупателю/Commands/ОтметитьСрочным/Ext" "$EXT/Roles/Бухгалтер/Ext"
cat > .claude/1c-dev.md <<'MD'
---
edit_mode: files
specs_dir: docs/specs
---
MD
cat > docs/specs/srochny-schet.md <<'MD'
# Срочный счёт: техническая спека

## Задача
Бухгалтер хочет отмечать счёт покупателю как срочный. Пользуется бухгалтер (роль Бухгалтер
расширения ПримерРасширения), начинает в форме документа «Счет на оплату покупателю»: кнопка
«Отметить срочным» в командной панели.

## Решение
Команда документа ОтметитьСрочным ставит реквизит Срочный. Оплаченный счёт не отмечается, и
бухгалтер видит, почему.

## Права и видимость
Роль Бухгалтер: чтение и изменение реквизита Срочный, просмотр команды ОтметитьСрочным.

## Шаги

- [x] 1. Реквизит Срочный и команда ОтметитьСрочным · блок: ничем · агент · проверка: синтаксис (27.11.2026)
- [x] 2. Права в роли Бухгалтер · блок: 1 · агент · проверка: синтаксис (27.11.2026)
MD
cat > "$EXT/Documents/СчетНаОплатуПокупателю.xml" <<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<MetaDataObject xmlns="http://v8.1c.ru/8.3/MDClasses" xmlns:v8="http://v8.1c.ru/8.1/data/core">
	<Document>
		<Properties>
			<Name>СчетНаОплатуПокупателю</Name>
			<ObjectBelonging>Adopted</ObjectBelonging>
		</Properties>
		<ChildObjects>
			<Attribute>
				<Properties>
					<Name>Срочный</Name>
					<Synonym><v8:item><v8:lang>ru</v8:lang><v8:content>Срочный</v8:content></v8:item></Synonym>
					<Type><v8:Type>xs:boolean</v8:Type></Type>
				</Properties>
			</Attribute>
			<Command>
				<Properties>
					<Name>ОтметитьСрочным</Name>
					<Synonym><v8:item><v8:lang>ru</v8:lang><v8:content>Отметить срочным</v8:content></v8:item></Synonym>
					<Group>FormCommandBarImportant</Group>
				</Properties>
			</Command>
		</ChildObjects>
	</Document>
</MetaDataObject>
XML
cat > "$EXT/Documents/СчетНаОплатуПокупателю/Commands/ОтметитьСрочным/Ext/CommandModule.bsl" <<'BSL'
&НаКлиенте
Процедура ОбработкаКоманды(ПараметрКоманды, ПараметрыВыполненияКоманды)
	ОтметитьСрочнымНаСервере(ПараметрКоманды);
КонецПроцедуры

&НаСервере
Процедура ОтметитьСрочнымНаСервере(Счет)
	Если Счет.Оплачен Тогда
		ВызватьИсключение("Счет уже оплачен, срочным его отмечать не нужно.", КатегорияОшибки.ОшибкаКонфигурации);
	КонецЕсли;
	СчетОбъект = Счет.ПолучитьОбъект();
	СчетОбъект.Срочный = Истина;
	СчетОбъект.Записать();
КонецПроцедуры
BSL
cat > "$EXT/Roles/Бухгалтер/Ext/Rights.xml" <<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<Rights xmlns="http://v8.1c.ru/8.2/roles">
	<setForNewObjects>false</setForNewObjects>
	<setForAttributesByDefault>true</setForAttributesByDefault>
	<independentRightsOfChildObjects>false</independentRightsOfChildObjects>
	<object>
		<name>Document.СчетНаОплатуПокупателю</name>
		<right><name>Read</name><value>true</value></right>
		<right><name>Update</name><value>true</value></right>
		<right><name>View</name><value>true</value></right>
		<right><name>Edit</name><value>true</value></right>
	</object>
	<object>
		<name>Document.СчетНаОплатуПокупателю.Attribute.Срочный</name>
		<right><name>View</name><value>true</value></right>
		<right><name>Edit</name><value>true</value></right>
	</object>
</Rights>
XML
