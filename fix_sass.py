import os
import re

# Папка, в которой ищем файлы (обычно src)
TARGET_DIR = 'src'

# Регулярные выражения для поиска
# Ищем: darken($color, 10%)
# Группа 1: переменная цвета
# Группа 2: значение процентов
regex_darken = re.compile(r'darken\(\s*([^,]+),\s*([\d\.]+%)\s*\)')
regex_lighten = re.compile(r'lighten\(\s*([^,]+),\s*([\d\.]+%)\s*\)')

# Строка импорта, которую нужно добавить
IMPORT_STRING = "@use 'sass:color';"

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Skipping {filepath}: {e}")
        return

    original_content = content
    has_changes = False
    
    # Функция замены для darken
    # darken($color, 10%) -> color.adjust($color, $lightness: -10%)
    def replace_darken(match):
        nonlocal has_changes
        has_changes = True
        color = match.group(1).strip()
        amount = match.group(2).strip()
        return f"color.adjust({color}, $lightness: -{amount})"

    # Функция замены для lighten
    # lighten($color, 10%) -> color.adjust($color, $lightness: 10%)
    def replace_lighten(match):
        nonlocal has_changes
        has_changes = True
        color = match.group(1).strip()
        amount = match.group(2).strip()
        return f"color.adjust({color}, $lightness: {amount})"

    # Выполняем замены
    new_content = regex_darken.sub(replace_darken, content)
    new_content = regex_lighten.sub(replace_lighten, new_content)

    # Если были замены, проверяем наличие импорта
    if has_changes:
        # Проверяем, есть ли уже импорт sass:color
        if IMPORT_STRING not in new_content:
            # Пытаемся вставить аккуратно
            # Если есть другие @use, вставляем перед ними или после
            # Простейший вариант: вставляем самой первой строкой
            new_content = f"{IMPORT_STRING}\n{new_content}"
            print(f"[IMPORT] Добавлен импорт в {filepath}")
        
        # Записываем изменения
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"[FIXED]  Исправлен файл: {filepath}")

def main():
    print(f"Start scanning directory: {TARGET_DIR} ...")
    count = 0
    for root, dirs, files in os.walk(TARGET_DIR):
        for file in files:
            if file.endswith('.scss'):
                filepath = os.path.join(root, file)
                process_file(filepath)
                count += 1
    
    print(f"\nDone! Scanned {count} SCSS files.")
    print("Теперь попробуйте запустить 'npm run build'")

if __name__ == "__main__":
    main()