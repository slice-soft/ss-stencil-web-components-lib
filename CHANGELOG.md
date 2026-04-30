# Changelog

## [0.2.0](https://github.com/slice-soft/ss-stencil-web-components-lib/compare/ss-stencil-web-components-lib-v0.1.2...ss-stencil-web-components-lib-v0.2.0) (2026-04-30)


### ⚠ BREAKING CHANGES

* **ss-input:** ss-input no longer re-emits native keyboard, selection, clipboard, mouse, drag, wheel, or touch events; use ssInput, ssChange, ssInvalid, ssFocus, ssBlur, or native listeners where appropriate.

### Features

* **atoms:** add shared control types and mixins ([#23](https://github.com/slice-soft/ss-stencil-web-components-lib/issues/23)) ([9f60f43](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/9f60f43a8b4c49cb6777f2311f8a8919c537348a))
* ss radio atom ([#20](https://github.com/slice-soft/ss-stencil-web-components-lib/issues/20)) ([2e64188](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/2e64188b6c7f8f6b3620d7a4350e9d7162e4628a))
* ss select atom ([#19](https://github.com/slice-soft/ss-stencil-web-components-lib/issues/19)) ([3c42e7b](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/3c42e7b11f93ae34e55e8ac89a5589b504a5988b))
* ss switch atom ([#17](https://github.com/slice-soft/ss-stencil-web-components-lib/issues/17)) ([bf9fe38](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/bf9fe38685e40d5bc27427fdf90ac228d1cbea45))
* **ss-avatar:** add avatar atom ([#27](https://github.com/slice-soft/ss-stencil-web-components-lib/issues/27)) ([faf3bde](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/faf3bdee2f7738aa0dcd8338aef4da66130f03bf))
* **ss-badge:** add badge atom ([#32](https://github.com/slice-soft/ss-stencil-web-components-lib/issues/32)) ([b553a88](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/b553a88f2e2303f72dfcc1299acae714c586562c))
* **ss-button:** add loading and accessibility label props ([#24](https://github.com/slice-soft/ss-stencil-web-components-lib/issues/24)) ([7eaf6dd](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/7eaf6dddb8ca7b05e361fd8b24c12674710ab4f1))
* **ss-checkbox:** add checkbox atom ([#33](https://github.com/slice-soft/ss-stencil-web-components-lib/issues/33)) ([b9a28c1](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/b9a28c12b60e0810e47189bc06864ac14e8c3fa4))
* **ss-divider:** add divider atom ([#28](https://github.com/slice-soft/ss-stencil-web-components-lib/issues/28)) ([9fc856d](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/9fc856d48d0d8feef946232c1467d088cdca58dd))
* **ss-input:** add form state and accessibility props  ([#26](https://github.com/slice-soft/ss-stencil-web-components-lib/issues/26)) ([0891bd2](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/0891bd2f417a7b83b6d2f5c69ee1a9a3a1a916db))
* **ss-label:** add label atom ([#22](https://github.com/slice-soft/ss-stencil-web-components-lib/issues/22)) ([99316bb](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/99316bb1747b1f884e3ecb1c66c53903e4643e08))
* **ss-spinner:** add spinner atom ([#30](https://github.com/slice-soft/ss-stencil-web-components-lib/issues/30)) ([3005a92](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/3005a92e90a89d4af26ea5cce6ab436eb6838558))
* **ss-textarea:** add textarea atom  [@juancadev-io](https://github.com/juancadev-io) ([#34](https://github.com/slice-soft/ss-stencil-web-components-lib/issues/34)) ([7805b92](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/7805b9284c24d2e911f768683ae5828bc824254e))
* **ss-tooltip:** add tooltip atom ([#31](https://github.com/slice-soft/ss-stencil-web-components-lib/issues/31)) ([c38cbf7](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/c38cbf7b9780b84b202e23418ec7dbb484fc0438))
* **ss-typography:** add heading levels and font family controls ([#25](https://github.com/slice-soft/ss-stencil-web-components-lib/issues/25)) ([ad57743](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/ad577439ed53cb6e462ff92453ef7110e9bb24d8))

## [0.1.2](https://github.com/slice-soft/ss-stencil-web-components-lib/compare/ss-stencil-web-components-lib-v0.1.1...ss-stencil-web-components-lib-v0.1.2) (2026-04-29)


### Features

* update license to MIT, enhance workflow permissions, and clean up token sets ([#15](https://github.com/slice-soft/ss-stencil-web-components-lib/issues/15)) ([0b1684a](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/0b1684a3742d019fcc2c2cf30fa8f641800cba35))

## [0.1.1](https://github.com/slice-soft/ss-stencil-web-components-lib/compare/ss-stencil-web-components-lib-v0.1.0...ss-stencil-web-components-lib-v0.1.1) (2026-04-29)


### Features

* add CSS variables for themes and update deployment workflows ([#11](https://github.com/slice-soft/ss-stencil-web-components-lib/issues/11)) ([c5840b7](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/c5840b7c12663346957ff014f7fe2333381f6362))
* add deploy workflow for library deployment ([8079d63](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/8079d63200233c4bc567b7042e427c66137dbccc))
* add react output target configuration to stencil config ([f2c06c1](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/f2c06c104181b20495895fde0166276e784ca96b))
* add ss-input component with detailed attributes and event support in vscode-data.json ([18c4606](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/18c46064334cc4c1d70f8063b1a38cb12cd90150))
* add ss-input component with styles, properties, events, and tests ([6d85eeb](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/6d85eeb692f3c575016d67918f754e009ff4e062))
* enhance ss-button and ss-input components with new properties and styles ([#13](https://github.com/slice-soft/ss-stencil-web-components-lib/issues/13)) ([55123bc](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/55123bc9cca6e9a70120e1c8c6ce04b29a3f7e03))
* enhance ss-input tests to cover attributes, events, and advanced interactions ([c4ab6da](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/c4ab6da95196085738e6bb10d9f0fa4f7445f206))
* update version to 0.0.5 and enhance exports in package.json ([a05a3ab](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/a05a3ab7ec58f53a49a13e6df793917b1d553bed))
* update version to 0.0.6 in package.json and package-lock.json ([1ea2168](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/1ea21685b00feadec95ec3eac286a287668b65e9))
* update version to 0.0.6 in package.json and package-lock.json ([207b7f9](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/207b7f93d28b08e38b0d412647ff23e451100a76))


### Bug Fixes

* add examples directory to .gitignore ([1919d05](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/1919d0596d2eea79c0f2e000a23baf5f96f7baf9))
* add project-type and package-file parameters to requeriments.yml ([6ca97c9](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/6ca97c92895394601df677b0d5501c0bfeb2fe25))
* add project-type and package-file parameters to requeriments.yml ([96e66ad](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/96e66ad8c87f9f97d6e58fc24c6cee0a8ec78263))
* ensure secrets are inherited in requeriments.yml ([41b6cf8](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/41b6cf83ba7e0387564926ef2600f09a8690c8ab))
* Formatting in components and utils ([e62107a](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/e62107addea6c91d7761771d925fac4d4de4ba26))
* remove project-type and package-file parameters from requeriments.yml ([49921ce](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/49921ce9486b1acdd3085ef01784842132dd3b63))
* remove trailing newline from deploy.yml ([52aa804](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/52aa8041716f62194abe52ab212e61c9883e29fe))
* remove unnecessary blank line in requeriments.yml ([886dc08](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/886dc085da60677323eb111d17fb951d5e89256a))
* revert package version to 0.0.2 ([8cfa7e1](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/8cfa7e1ef397add3ebae841a3c52a1fca14f2f62))
* revert package version to 0.0.2 ([db99548](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/db99548a0dcee85568bfca7c2c8baa4b079eb700))
* update package name format to include scope ([0c11f82](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/0c11f827be13d7a26b1cb82d22cee90af2ad3f9a))
* update package name to include organization prefix and add publi… ([e3ff7fb](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/e3ff7fb51b28071720cf9c4f72b535bedb993238))
* update package name to include organization prefix and add publishConfig ([f72883f](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/f72883f43025f2f8f03bcc559f28440a2b06f4b5))
* update package version to 0.0.2 and ensure consistent naming format ([32ce185](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/32ce1852ee8909a722ff6f50dc6fa4564fe1e39b))
* update package version to 0.0.2 and ensure consistent naming format ([6f38b09](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/6f38b09d77505ad36ad85cca35d825c2a5562aa7))
* update package version to 0.0.3 in package.json and package-lock.json ([e7e074a](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/e7e074a3c902e917677bae6478b003a12f518d90))
* update package version to 0.0.5 ([5722a3b](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/5722a3b51ac3b701f2fac2158f581037fc6258cc))
* update package version to 0.0.5 ([902ec7b](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/902ec7b0fe9df9f40ad2863c2b67c6f1024ce03a))
* update repository URL format in package.json ([0f82d59](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/0f82d5922b7d034896bbb1abf8455621d7cbd567))
* update repository URL format in package.json ([74e61e9](https://github.com/slice-soft/ss-stencil-web-components-lib/commit/74e61e924cae908a4bfb6fa2f9e64eab854dca61))
