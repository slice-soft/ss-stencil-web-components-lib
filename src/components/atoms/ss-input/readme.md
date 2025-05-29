# ss-input



<!-- Auto Generated Below -->


## Overview

Componente de entrada de texto versátil con soporte para múltiples eventos y estilos.
- Soporta varios tipos de entrada (texto, contraseña, email, etc.)
- Emit eventos para entrada, cambio, enfoque, teclado, selección, portapapeles y más.
- Permite estilos personalizados a través de propiedades y clases.
- Incluye soporte para validación HTML y eventos de interacción del usuario.
- Compatible con diferentes tamaños y variantes de color.
- Soporta estilos de entrada como sólido, contorno y subrayado.
*

## Properties

| Property       | Attribute       | Description                                                        | Type                                                                                                                                                           | Default     |
| -------------- | --------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `color`        | `color`         | Color del componente, basado en variantes predefinidas             | `"error" \| "info" \| "primary" \| "quaternary" \| "secondary" \| "success" \| "tertiary" \| "warning"`                                                        | `'primary'` |
| `disabled`     | `disabled`      | Indica si el input está deshabilitado                              | `boolean`                                                                                                                                                      | `false`     |
| `fullWidth`    | `full-width`    | Indica si el input debe ocupar todo el ancho disponible            | `boolean`                                                                                                                                                      | `false`     |
| `inlineStyles` | `inline-styles` | Estilos en línea personalizados, pueden ser una cadena o un objeto | `string \| { [x: string]: string; }`                                                                                                                           | `undefined` |
| `placeholder`  | `placeholder`   | Texto de marcador de posición                                      | `string`                                                                                                                                                       | `undefined` |
| `size`         | `size`          | Tamaño del input, puede ser 'sm', 'md', 'lg'                       | `"2xl" \| "3xl" \| "lg" \| "md" \| "sm" \| "xl" \| "xs"`                                                                                                       | `'md'`      |
| `type`         | `type`          | Tipo de entrada HTML                                               | `"date" \| "datetime-local" \| "email" \| "file" \| "hidden" \| "month" \| "number" \| "password" \| "search" \| "tel" \| "text" \| "time" \| "url" \| "week"` | `'text'`    |
| `value`        | `value`         | Valor actual del input                                             | `string`                                                                                                                                                       | `undefined` |
| `xId`          | `x-id`          | Identificador único para el componente                             | `string`                                                                                                                                                       | `undefined` |
| `xStyle`       | `x-style`       | Estilo del input, puede ser 'solid', 'outline', 'underline'        | `"outline" \| "solid" \| "underline"`                                                                                                                          | `'solid'`   |


## Events

| Event                 | Description                                               | Type                                           |
| --------------------- | --------------------------------------------------------- | ---------------------------------------------- |
| `ssBlur`              |                                                           | `CustomEvent<FocusEvent>`                      |
| `ssChange`            | Emitted when the value is “committed” (on blur or Enter)  | `CustomEvent<{ xId: string; value: string; }>` |
| `ssClick`             | Mouse/pointer events                                      | `CustomEvent<MouseEvent>`                      |
| `ssCompositionEnd`    |                                                           | `CustomEvent<CompositionEvent>`                |
| `ssCompositionStart`  |                                                           | `CustomEvent<CompositionEvent>`                |
| `ssCompositionUpdate` |                                                           | `CustomEvent<CompositionEvent>`                |
| `ssContextMenu`       |                                                           | `CustomEvent<MouseEvent>`                      |
| `ssCopy`              |                                                           | `CustomEvent<ClipboardEvent>`                  |
| `ssCut`               | Clipboard events                                          | `CustomEvent<ClipboardEvent>`                  |
| `ssDoubleClick`       |                                                           | `CustomEvent<MouseEvent>`                      |
| `ssDrag`              |                                                           | `CustomEvent<DragEvent>`                       |
| `ssDragEnd`           |                                                           | `CustomEvent<DragEvent>`                       |
| `ssDragEnter`         |                                                           | `CustomEvent<DragEvent>`                       |
| `ssDragLeave`         |                                                           | `CustomEvent<DragEvent>`                       |
| `ssDragOver`          |                                                           | `CustomEvent<DragEvent>`                       |
| `ssDragStart`         | Drag & drop                                               | `CustomEvent<DragEvent>`                       |
| `ssDrop`              |                                                           | `CustomEvent<DragEvent>`                       |
| `ssFocus`             | Focus events                                              | `CustomEvent<FocusEvent>`                      |
| `ssFocusIn`           |                                                           | `CustomEvent<FocusEvent>`                      |
| `ssFocusOut`          |                                                           | `CustomEvent<FocusEvent>`                      |
| `ssInput`             | Emitted on each keystroke                                 | `CustomEvent<{ xId: string; value: string; }>` |
| `ssInvalid`           | Emitted when the control fails HTML/constraint validation | `CustomEvent<{ xId: string; value: string; }>` |
| `ssKeyDown`           | Keyboard events                                           | `CustomEvent<KeyboardEvent>`                   |
| `ssKeyPress`          |                                                           | `CustomEvent<KeyboardEvent>`                   |
| `ssKeyUp`             |                                                           | `CustomEvent<KeyboardEvent>`                   |
| `ssMouseDown`         |                                                           | `CustomEvent<MouseEvent>`                      |
| `ssMouseEnter`        |                                                           | `CustomEvent<MouseEvent>`                      |
| `ssMouseLeave`        |                                                           | `CustomEvent<MouseEvent>`                      |
| `ssMouseMove`         |                                                           | `CustomEvent<MouseEvent>`                      |
| `ssMouseOut`          |                                                           | `CustomEvent<MouseEvent>`                      |
| `ssMouseOver`         |                                                           | `CustomEvent<MouseEvent>`                      |
| `ssMouseUp`           |                                                           | `CustomEvent<MouseEvent>`                      |
| `ssPaste`             |                                                           | `CustomEvent<ClipboardEvent>`                  |
| `ssSelect`            | Text selection & IME composition                          | `CustomEvent<Event>`                           |
| `ssTouchCancel`       |                                                           | `CustomEvent<TouchEvent>`                      |
| `ssTouchEnd`          |                                                           | `CustomEvent<TouchEvent>`                      |
| `ssTouchMove`         |                                                           | `CustomEvent<TouchEvent>`                      |
| `ssTouchStart`        | Touch events                                              | `CustomEvent<TouchEvent>`                      |
| `ssWheel`             | Wheel (scroll)                                            | `CustomEvent<WheelEvent>`                      |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
