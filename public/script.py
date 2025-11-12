import json

# Step 1: Extract all values from the JSON file
def extract_values(input_file, output_file):
    """
    Extract all unique 'value' fields from the JSON and save them to a text file.
    Each line will be numbered for easy reference.
    """
    try:
        # Read the JSON file
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Extract all values with their positions
        values_with_positions = []
        
        for model_idx, model in enumerate(data['models']):
            for entry_idx, entry in enumerate(model['entries']):
                value = entry['value']
                # Store: (model_index, entry_index, value)
                values_with_positions.append({
                    'model_idx': model_idx,
                    'entry_idx': entry_idx,
                    'value': value
                })
        
        # Save values to text file with line numbers
        with open(output_file, 'w', encoding='utf-8') as f:
            for idx, item in enumerate(values_with_positions):
                f.write(f"{item['value']}\n")
        
        # Also save the mapping for later use
        mapping_file = output_file.replace('.txt', '_mapping.json')
        with open(mapping_file, 'w', encoding='utf-8') as f:
            json.dump(values_with_positions, f, ensure_ascii=False, indent=2)
        
        print(f"✓ Extracted {len(values_with_positions)} values")
        print(f"✓ Saved to: {output_file}")
        print(f"✓ Mapping saved to: {mapping_file}")
        print(f"\nNext steps:")
        print(f"1. Translate the values in '{output_file}'")
        print(f"2. Save translations in the SAME ORDER to 'translations.txt'")
        print(f"3. Run the second script to apply translations")
        
        return len(values_with_positions)
    
    except FileNotFoundError:
        print(f"Error: Could not find file '{input_file}'")
        return 0
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in file '{input_file}'")
        return 0
    except Exception as e:
        print(f"Error: {str(e)}")
        return 0

# Step 2: Apply translations back to the JSON
def apply_translations(original_file, translations_file, output_file):
    """
    Apply the translations back to the original JSON file using the mapping.
    """
    try:
        # Read original JSON
        with open(original_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Read mapping
        mapping_file = 'values_to_translate_mapping.json'
        with open(mapping_file, 'r', encoding='utf-8') as f:
            mapping = json.load(f)
        
        # Read translations
        with open(translations_file, 'r', encoding='utf-8') as f:
            translations = [line.strip() for line in f.readlines()]
        
        # Verify counts match
        if len(mapping) != len(translations):
            print(f"ERROR: Mismatch in counts!")
            print(f"Expected {len(mapping)} translations, got {len(translations)}")
            return False
        
        # Apply translations
        for idx, item in enumerate(mapping):
            model_idx = item['model_idx']
            entry_idx = item['entry_idx']
            translation = translations[idx]
            
            # Update the 'ur' field
            data['models'][model_idx]['entries'][entry_idx]['ur'] = translation
        
        # Save updated JSON
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"✓ Applied {len(translations)} translations")
        print(f"✓ Saved to: {output_file}")
        return True
    
    except FileNotFoundError as e:
        print(f"Error: Could not find required file - {str(e)}")
        return False
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

# Run the appropriate function
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "apply":
        # Step 2: Apply translations
        original_file = "translations_export.json"
        translations_file = "translations.txt"
        output_file = "data_translated.json"
        apply_translations(original_file, translations_file, output_file)
    else:
        # Step 1: Extract values
        input_file = "translations_export.json"  # Change this to your JSON filename
        output_file = "values_to_translate.txt"
        extract_values(input_file, output_file)