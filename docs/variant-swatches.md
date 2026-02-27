# Product Variant Swatches Documentation

## Bicolor Swatches

The system supports bicolor (two-tone) swatches for product variants. This is useful for products that feature two distinct colors in a single option.

### How to use

To create a bicolor swatch, use one of the following formats in the product option name:

1. **Slash Separator**: `ColorA/ColorB` (e.g., `Black/Beige`)
2. **Dash Separator**: `ColorA-ColorB` (e.g., `Midnight-Gold`)

### How it works

- The system automatically detects the `/` or `-` separator.
- It splits the name into two parts.
- Each part is resolved into a color hex code using the internal `COLOR_MAP` or treated as a raw color value.
- The UI renders the swatch as a circle split vertically at 50% using a CSS linear gradient:

  ```css
  background: linear-gradient(90deg, ColorA 50%, ColorB 50%);
  ```

### Color Mapping

The following color names are currently supported and mapped to hex codes:

- black, white, off white, navy, blue, red, maroon, green, olive, beige, cream, brown, grey, gray, silver, gold, pink, purple, lavender, jet black, midnight.

If a color is not in the map, the system will attempt to use the name as a CSS color value or hex code.
