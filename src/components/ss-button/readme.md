# ss-button



<!-- Auto Generated Below -->


## Overview

Botón versátil para acciones del usuario:
- Variantes (primary, secondary…)
- Tamaños (xs–xl)
- Estilos (solid, outline, ghost)
- Formas (rounded, pill, circle, square)
- Control de estado (loading, disabled)

## Properties

| Property          | Attribute          | Description                                                                         | Type                                                                                                    | Default     |
| ----------------- | ------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------- |
| `disableDuration` | `disable-duration` | Milisegundos que dura la deshabilitación                                            | `number`                                                                                                | `200`       |
| `disabled`        | `disabled`         | Deshabilitado global                                                                | `boolean`                                                                                               | `false`     |
| `fullWidth`       | `full-width`       | Ocupa todo el ancho del contenedor                                                  | `boolean`                                                                                               | `false`     |
| `iconPosition`    | `icon-position`    | Posición del ícono: left\|right\|only                                               | `"left" \| "only" \| "right"`                                                                           | `'right'`   |
| `label`           | `label`            | Texto interno o slot default                                                        | `string`                                                                                                | `undefined` |
| `oneClick`        | `one-click`        | Sólo un clic: tras disparar ssClick el botón se deshabilita durante disableDuration | `boolean`                                                                                               | `false`     |
| `shape`           | `shape`            | Forma del botón                                                                     | `"circle" \| "pill" \| "rounded" \| "square"`                                                           | `'rounded'` |
| `size`            | `size`             | Tamaño: xs, sm, md, lg, xl                                                          | `"lg" \| "md" \| "sm" \| "xl" \| "xs"`                                                                  | `'md'`      |
| `status`          | `status`           | Estado inicial: active\|disabled\|loading                                           | `"active" \| "disabled" \| "loading"`                                                                   | `'active'`  |
| `type`            | `type`             | Tipo de botón: `button`\|`submit`\|`reset`                                          | `"button" \| "reset" \| "submit"`                                                                       | `'button'`  |
| `variant`         | `variant`          | Variante de color                                                                   | `"error" \| "info" \| "primary" \| "quaternary" \| "secondary" \| "success" \| "tertiary" \| "warning"` | `'primary'` |
| `xStyle`          | `x-style`          | Estilo visual                                                                       | `"ghost" \| "outline" \| "solid"`                                                                       | `'solid'`   |
| `xid`             | `xid`              | Atributo `id` del botón                                                             | `string`                                                                                                | `undefined` |


## Events

| Event     | Description                             | Type                  |
| --------- | --------------------------------------- | --------------------- |
| `ssClick` | Se dispara cuando el usuario hace click | `CustomEvent<string>` |


## Slots

| Slot     | Description                                       |
| -------- | ------------------------------------------------- |
| `"icon"` | Slot para el ícono (izquierda, derecha u “solo”). |


----------------------------------------------

*Built with love ❤️ by [Slice Soft](https://slicesoft.dev/) Team*
