# Changelog

## [0.22.0](https://github.com/lattice-php/lattice/compare/0.21.0...0.22.0) (2026-07-19)


### ⚠ BREAKING CHANGES

* **actions:** Confirmation.title (wire type) is now `string | null` instead of `string`.

### Features

* **actions:** dispatch rejected-action effects and keep overlays open on 422 ([025bd69](https://github.com/lattice-php/lattice/commit/025bd694e7cf9e966b632ac5345aeaa5e75868a7))
* **actions:** reintroduce ActionResult::failure() as a 422 rejection ([78fa152](https://github.com/lattice-php/lattice/commit/78fa15269784cab11fe9fdafad0e8ccac030cfe6))
* **testing:** denied-component helpers and submit-then-act session refresh ([406542e](https://github.com/lattice-php/lattice/commit/406542e8f7b10724b4b8dc332da8da9feedd5b6f))


### Bug Fixes

* **console:** lattice:typescript no-ops without custom wire types ([3383735](https://github.com/lattice-php/lattice/commit/338373543ca1fad026a1113ee27d647d452efc93))
* **tables:** narrow final filter indicator() return types for phpstan ([ed31694](https://github.com/lattice-php/lattice/commit/ed31694a89cec5381ce02fa43648686523538b42))


### Refactoring

* **actions:** make confirmation title optional, drop dead bulk-bar ref guard ([8610520](https://github.com/lattice-php/lattice/commit/8610520e9ffe4c5094c8704d99503f70a0df52d5))
* drop dead exports, fix type round-trip, refresh stale comment ([79f0276](https://github.com/lattice-php/lattice/commit/79f0276033a3314d7faa457c1f947d3309c1e8d4))
* **i18n:** route default UI labels through the translation layer ([d3a54e7](https://github.com/lattice-php/lattice/commit/d3a54e7bb93458dea23b737bee7a55005a3d685e))
* **tests:** streamline suite structure ([99e4e1d](https://github.com/lattice-php/lattice/commit/99e4e1d96e7b39a2dfb9207658d02dbfdac1d1fd))
* **tests:** streamline suite structure ([5dda8d3](https://github.com/lattice-php/lattice/commit/5dda8d356da33ceaa62641304545fa32b70ef922))


### Documentation

* allow dashed and underscored translation keys ([84f9cb1](https://github.com/lattice-php/lattice/commit/84f9cb1cc30966cbbf1ed99cc7d93281e2c90506))
* **boost:** refresh bundled skills to the 0.21 actions API ([6b65332](https://github.com/lattice-php/lattice/commit/6b65332d435241957689a3ce2a4df2f382a88eb1))
* **console:** name spatie/laravel-typescript-transformer consistently ([3a26934](https://github.com/lattice-php/lattice/commit/3a2693423eb5bfdd63084c105c427719920ed460))

## [0.21.0](https://github.com/lattice-php/lattice/compare/0.20.0...0.21.0) (2026-07-17)


### ⚠ BREAKING CHANGES

* **types:** one naming matrix per wire family
* **http:** listeners default to an empty array
* **types:** self-contained generated module; base Column/Filter props generated
* **http:** generate PagePayload — the last hand-written wire payload
* **types:** node references union known subclasses; Column/Filter map to their envelopes
* **types:** generate every domain node union

### Features

* **actions:** slide-out and width presentation for action form modals ([d13675c](https://github.com/lattice-php/lattice/commit/d13675c6074fc04abba72e367504dc7d62f97ee4))
* **actions:** thread modal presentation into action form and confirm dialogs ([dce9280](https://github.com/lattice-php/lattice/commit/dce92804f9792a0268470e304844c675d0a77400))
* add named extension slots ([d311263](https://github.com/lattice-php/lattice/commit/d311263b46a83a46c38f1813a61d3d70a8f72575))
* add typed effect response assertions ([6c3a37d](https://github.com/lattice-php/lattice/commit/6c3a37d8558dfe8fe968e3f8da3de740cdfc922c))
* add typed effect response assertions ([8c58636](https://github.com/lattice-php/lattice/commit/8c58636c74f8c4e2c1aa21a45c7153bbd6586ba4))
* **lib:** add shared hooks and helpers for dedup ([96c4097](https://github.com/lattice-php/lattice/commit/96c40973a1d5e6497c6fad1a48a64f27b277b84e))
* **ui:** add named extension slots ([c0b2385](https://github.com/lattice-php/lattice/commit/c0b23851a01c23f4a367d901a9f6d71d93a9697f))
* **ui:** Modal slide-out sheets + unified dialog sizing ([69613c9](https://github.com/lattice-php/lattice/commit/69613c9dbce93c7e206e6e58753f601f9ba7f1da))
* **ui:** Modal slideOut side and width props ([4ed405c](https://github.com/lattice-php/lattice/commit/4ed405c6d9d60f6d12ea1b9f3a4d16b05acc089f))
* **ui:** placement and width dialog variants with motion tokens ([6606a07](https://github.com/lattice-php/lattice/commit/6606a07e07f03785ddd8e740032a145507702365))
* **ui:** render Modal as slide-out sheet from server props ([9aacdd9](https://github.com/lattice-php/lattice/commit/9aacdd955463c5f2f5e9cadfaad502dbbff02a71))


### Bug Fixes

* **http:** one sub-request dispatch — action forms gain signed uploads ([3d08ff3](https://github.com/lattice-php/lattice/commit/3d08ff3310a70ab16eeec1643663020cb1e71fda))
* **table:** thread bulk action modal presentation into the form sheet ([46d177c](https://github.com/lattice-php/lattice/commit/46d177cf64d453c7c0cddf5b11a395e7d11a0e32))
* **types:** drop strict oxfmt mode — PHP CI test jobs run without node_modules ([ca0abef](https://github.com/lattice-php/lattice/commit/ca0abefd87bf77c23c95b918b513deae8c89ee07))
* **types:** make generation deterministic across PHP versions ([8567d80](https://github.com/lattice-php/lattice/commit/8567d80c22266854e2ebaf5f0f33add3298df09d))
* **types:** node references union known subclasses; Column/Filter map to their envelopes ([3b8a386](https://github.com/lattice-php/lattice/commit/3b8a386a83c76fc6c0f8fd5d7b2e2522eab739f7))
* **types:** seed consumer augment runs with the built-in wire classes ([1147cf4](https://github.com/lattice-php/lattice/commit/1147cf4716c338338c720b0e3473860a499bdd32))
* **ui:** animate centered dialogs without duplicating the centering translate ([6adaa45](https://github.com/lattice-php/lattice/commit/6adaa45ae42e6df9501afcaef74f8ee625c00c4b))
* **ui:** keep the image lightbox shrink-wrapped on the variant dialog surface ([17e062b](https://github.com/lattice-php/lattice/commit/17e062b09f03188d5878716678ddd97c9c06826e))


### Performance

* **core:** register builtin effects and editor extensions explicitly ([5939608](https://github.com/lattice-php/lattice/commit/5939608feeef46e0bbb98294d6ae2aae7407587b))
* **forms:** early-exit FormSchemaWalker::find ([bd8e053](https://github.com/lattice-php/lattice/commit/bd8e05361de886ddf2bb5b3e09e67e8216f65b30))
* **ui:** serve trees from one scoped scan; share the Eloquent scope concern ([e004c10](https://github.com/lattice-php/lattice/commit/e004c107f9f55473be0d58708625ea077f1d4229))


### Refactoring

* **attributes:** route enum unwrap through Wire::scalar ([c5d226c](https://github.com/lattice-php/lattice/commit/c5d226c8805fcd432e1cc468461366c055fbc531))
* **enums:** extract HasPrefixedWireType trait ([18b290c](https://github.com/lattice-php/lattice/commit/18b290c1a64df7b9c4ce8a872c920a071fb58377))
* **form,layout,i18n:** adopt shared hooks and fix field bugs ([09b8b0c](https://github.com/lattice-php/lattice/commit/09b8b0ce857c3bd72c08728a2b7152a370af86de))
* **forms:** extract HasMinMax/HasStep for date-time inputs ([159afc0](https://github.com/lattice-php/lattice/commit/159afc0ea594a8b7f1c6d1f619ad78178c695eb9))
* **http:** generate PagePayload — the last hand-written wire payload ([ba90bbe](https://github.com/lattice-php/lattice/commit/ba90bbee4ed4fb8b19fb1d8398c97e7108ad752a))
* **http:** listeners default to an empty array ([99786f6](https://github.com/lattice-php/lattice/commit/99786f6e2aa0952311dc2239b19a4e5509f69c4e))
* **js:** compile-check the builtin effect handlers against the wire contract ([2e53e5a](https://github.com/lattice-php/lattice/commit/2e53e5a0d154158182e9477965bfc1301afad8ff))
* **js:** extract shared hooks and dedupe cells, storage, debounce, format ([e228f56](https://github.com/lattice-php/lattice/commit/e228f56ac76fdbaa4a212611b355d804b0ce7648))
* **js:** render table row actions through the generic RenderNode ([9edc046](https://github.com/lattice-php/lattice/commit/9edc046d0ab0a0061c425e0d43d79749c8c2d2c9))
* **notifications:** use dialog sheet variants for the slide-out panel ([8cd4c47](https://github.com/lattice-php/lattice/commit/8cd4c4744882f643a2de2bbe325544e4d30b16f4))
* **php:** dedup the make-commands, enum prefix, date/time setters, and enum unwraps ([6eb6e81](https://github.com/lattice-php/lattice/commit/6eb6e812b7040af3ae910fdf59a79cd375a2443c))
* **table:** dedupe cells, storage, debounce, and predicates ([0c054ed](https://github.com/lattice-php/lattice/commit/0c054ede2e23dd60d9249f32ead51529a23ebffb))
* **tables:** make column row-keys and relation bindings declarative capabilities ([ffbc117](https://github.com/lattice-php/lattice/commit/ffbc117b790e62a6af59514da289f4e15cae02a6))
* **types:** #[WireEnvelope] puts the marker→envelope mapping on the marker ([e964d7d](https://github.com/lattice-php/lattice/commit/e964d7dbc2968449a6a63459e9dcdf79fd2bf1fe))
* **types:** generate every domain node union ([8876854](https://github.com/lattice-php/lattice/commit/88768542a5078cddbbf102b651dba61b861a21cf))
* **types:** one naming matrix per wire family ([4fa2325](https://github.com/lattice-php/lattice/commit/4fa2325dde7c58afe21da869506ceb57078fac86))
* **types:** self-contained generated module; base Column/Filter props generated ([821ba1d](https://github.com/lattice-php/lattice/commit/821ba1d87a93144cb5fee0554bf84057048a5888))
* **ui:** adopt shared hooks and dedupe collapsible, pills, chart ([babbbec](https://github.com/lattice-php/lattice/commit/babbbec1584567feb0b0cc97ddbc3df6440078ae))
* **ui:** extract SealsReferences from the duplicated sealing machinery ([922debf](https://github.com/lattice-php/lattice/commit/922debf952c59bb8f71a4e1eebee9089e2cc7d3c))
* **ui:** resolve expandable schema entries ([bfd4fc8](https://github.com/lattice-php/lattice/commit/bfd4fc8091fe51db12b1e47dce794f31a81b6a75))


### Documentation

* document named extension slots ([f6a63b0](https://github.com/lattice-php/lattice/commit/f6a63b0764233f71fc2b1e64e164fdc22d5af7bf))
* document typed effect assertions ([4770867](https://github.com/lattice-php/lattice/commit/4770867a884b1476a279916ae9b0d01a66cd60b9))
* hold PR comments to the comment guidelines ([3a3df3a](https://github.com/lattice-php/lattice/commit/3a3df3a427f6e394bd89b918cd0da62b7a383c65))
* **ui:** document Modal slideOut and width ([4bc1145](https://github.com/lattice-php/lattice/commit/4bc1145f93cfa8e6cde6f0533a4d47edcbe5ab48))

## [0.20.0](https://github.com/lattice-php/lattice/compare/0.19.0...0.20.0) (2026-07-17)


### ⚠ BREAKING CHANGES

* **ui:** charts and select tags resolve tagged colours
* **tables:** cells resolve tagged and row-driven colours via the colour lib
* **ui:** text, icon, and progress render tagged colours
* **theme:** named colour palette vars and lt-tone classes replace cell tones
* **ui:** chart series colors take Color values
* **tables:** badge and icon column colors take Color values
* **ui:** replace the Color enum with a tagged Color value object
* **forms:** extension wire specs always contain props; client code and hand-authored specs must include it.
* **forms:** reduced editors now strip previously-accepted built-in node types from submissions; client-only extension types are stripped unless a PHP extension declares them.
* **editor:** field.rich-editor nodes must carry props.extensions; the client no longer falls back to a default set when it is absent.
* **effects:** drop the Effect suffix from builtin effect classes
* **types:** shrink WireFamily to category and registry
* **effects:** toast/callout payload fields sit directly under props; ToastMessage is now Effects\Builtin\Toast, Callout moved to Effects\Builtin\Callout; custom effect classes may no longer be declared readonly at class level.
* **types:** effect payloads are nested under props on the wire and in EffectOf; consumer effect handlers must read effect.props.*.
* **typescript:** WireTypeManifest buckets attribute-sourced families under families/family() instead of a per-family property; AugmentableMap is gone.
* **attributes:** AsComponent::typeForClass() is now wireTypeForClass(); registering a class that does not implement the effect contract throws.
* **types:** Stack::direction() takes a StackDirection; SignedUpload.method is the HttpMethod enum; the generated dateStyle/timeStyle/direction/method fields are now enum unions rather than string.
* **tables:** the table result's `state` wire field is renamed to `query`, and `FilterClause.operator` is now the `Op` union rather than `string`.
* **realtime:** the generated ListenerPayload type is replaced by Listen.
* **types:** FragmentDefinition/InteractsWithForm resolveFields return FragmentResponse/ResolveResponse objects, not arrays. The client FragmentResponse/ ResolveResponse types are now generated.
* **types:** signUpload returns SignedUpload, not an array; TableResult is no longer JsonSerializable and exposes public data/pagination/state. The client types NotificationsResponse/UnreadCountResponse/SignResponse/TableResponse are replaced by generated NotificationList/UnreadCount/SignedUpload/TableResult.
* **forms:** the wire shape shifts optional keys to present/nullable to match value-object serialization: labelAction.tabIndex is now number | null, and conditions always carries visible/required/readOnly/disabled as arrays (empty when unset). The FormLabelAction type export is replaced by the generated LabelAction.

### Features

* **charts:** add distribution series as a segmented bar ([093cff6](https://github.com/lattice-php/lattice/commit/093cff608a76b7cae84b5d53a18e56d0c1a4a016))
* **charts:** add gauge series rendered as a radial bar ([494f483](https://github.com/lattice-php/lattice/commit/494f483db333e059cbeefa21277890b2ff7eb949))
* **charts:** gauge and distribution series ([95d3ae2](https://github.com/lattice-php/lattice/commit/95d3ae266cbf6bc0b269f55bcf9851268cad6d3f))
* color picker form field ([1726eb6](https://github.com/lattice-php/lattice/commit/1726eb6fc9ecef2dda95c45ec31b6d5ac22d0b07))
* **core:** per-option data from EloquentOptions ([a4747d1](https://github.com/lattice-php/lattice/commit/a4747d186dd5087e20ad8fe2958cf68536cdf15a))
* **core:** support a per-option data record on Option ([a1dfc9a](https://github.com/lattice-php/lattice/commit/a1dfc9a5700a52c8e611acce91a2e5b1be89f2f0))
* **editor:** add inline code and require the extensions prop ([e645c63](https://github.com/lattice-php/lattice/commit/e645c63590a6bdc155d340f6395b1b7aeee2d691))
* **editor:** drive the rich editor from wire extension specs ([86b2103](https://github.com/lattice-php/lattice/commit/86b2103bd0c7a42b1a304591dd1b58b3fe5939cd))
* **forms:** add a copy affix to copyable text inputs ([7c14faa](https://github.com/lattice-php/lattice/commit/7c14faa930b5c9a33d2a180ad79bbef748d56337))
* **forms:** add creatable + itemRules to Select ([3167c97](https://github.com/lattice-php/lattice/commit/3167c97c04fb7b3f25e22651ed67951f26ce0c70))
* **forms:** add editor-extension attribute, base class and registry ([1430e92](https://github.com/lattice-php/lattice/commit/1430e9271c9e50908cc03f2ff7ef9ee6864f287c))
* **forms:** add the built-in editor extensions ([c0b11af](https://github.com/lattice-php/lattice/commit/c0b11af5366c9decb6b7a3444821e8aa17dda284))
* **forms:** color picker field with palette and hex value ([c3e4c7c](https://github.com/lattice-php/lattice/commit/c3e4c7cc33c42c8f60f0c6b8259b453a603e9a15))
* **forms:** creatable Select — tags/chips (free-text + entity tags with color) ([4582d89](https://github.com/lattice-php/lattice/commit/4582d897020b9938b3e2a850ddd93a78546c9c11))
* **forms:** dispatch _create round-trip for creatable Select ([2409daa](https://github.com/lattice-php/lattice/commit/2409daa8ee886fd24d258191e2f0954b56e683b7))
* **forms:** make RichEditor extensions configurable ([133ef58](https://github.com/lattice-php/lattice/commit/133ef58cc2e4024171e70e68ada34e58e61e01a3))
* **forms:** materialize the option schema per select option ([9ded456](https://github.com/lattice-php/lattice/commit/9ded456c533bb40d00f2ecaba4276d50f266a9c3))
* **forms:** per-option schema on Select ([e6442d2](https://github.com/lattice-php/lattice/commit/e6442d2fff9ed95d4ad98d7a6d847b245fb90626))
* **forms:** render the color picker field in a popover ([cc0cb67](https://github.com/lattice-php/lattice/commit/cc0cb67aa1aad30b7510f14e8e84ad243209e2a1))
* **forms:** validate submissions against the field's active extensions ([00fb5d2](https://github.com/lattice-php/lattice/commit/00fb5d2e8b201a9300fea5bf613322c70555b45e))
* let createLatticeApp own the i18n bootstrap, plus boot/wrap hooks ([aa4c013](https://github.com/lattice-php/lattice/commit/aa4c013209092c4fbc3dc796f8a9c8d049bae01e))
* **lib:** colour resolver for tagged Color wire values ([6504a86](https://github.com/lattice-php/lattice/commit/6504a8691be9d479027dd024ae82e0a57c1cd98f))
* own the i18n bootstrap in createLatticeApp and expose boot/wrap hooks ([e6bd50b](https://github.com/lattice-php/lattice/commit/e6bd50b41d0843deba19860f97472a87566c56ce))
* progress component (bar + circle) ([c01fd8e](https://github.com/lattice-php/lattice/commit/c01fd8e393b6047161aa959558292b4cf308181b))
* rich select options via per-option schema ([08e8578](https://github.com/lattice-php/lattice/commit/08e85789ff1d50e41d5697023e3dc1a13f1973da))
* **tables:** expandable rows with lazy fragment detail ([921135c](https://github.com/lattice-php/lattice/commit/921135c1196578950bcbf2be3d6ca985501c6166))
* **tables:** expandable rows with lazy fragment detail ([c892cc5](https://github.com/lattice-php/lattice/commit/c892cc54bd57abe049d1fb714052f7ca34a1c5fe))
* **tables:** global cross-column search ([462a1b8](https://github.com/lattice-php/lattice/commit/462a1b83d941bab88b203c19ba2bdcd5bc6eb888))
* **tables:** global cross-column search ([5b19a92](https://github.com/lattice-php/lattice/commit/5b19a9262f2def789642a8d9cec7c2bd6b986374))
* **tables:** make number and money columns copyable ([c21890c](https://github.com/lattice-php/lattice/commit/c21890cd3bb307eadbfb5aaf16eda9fac4f5e2c9))
* **tables:** open image column cells in the image lightbox ([fe87117](https://github.com/lattice-php/lattice/commit/fe8711776fd724330f9b1dddc9d3cac8c919590d))
* **theme:** named colour palette vars and lt-tone classes replace cell tones ([9ab34bb](https://github.com/lattice-php/lattice/commit/9ab34bb738c8fe5dd6a8c7673b065651866c4bdd))
* **typescript:** augment app-defined effects and editor extensions ([efdcb9c](https://github.com/lattice-php/lattice/commit/efdcb9c4db6a1f38af41c8a0397c6ab6756387df))
* **types:** generate node-carrying response payloads ([7df4665](https://github.com/lattice-php/lattice/commit/7df4665f9e8abdef0199710fad6e64298b89fa67))
* **types:** generate response payloads + tighten the table query type ([5d0fd58](https://github.com/lattice-php/lattice/commit/5d0fd580f7152f129cc38147c22093b52cdc170b))
* **types:** generate response payloads as value objects ([ad4d2a1](https://github.com/lattice-php/lattice/commit/ad4d2a1d7fec34278ccb79cad726d77ed6968a15))
* **ui:** add Avatar and Separator components and a doughnut chart series ([c5e1e5b](https://github.com/lattice-php/lattice/commit/c5e1e5b35d17766a525149193739291b68aefc2e))
* **ui:** add EloquentTreeSource (adjacency list) ([336214a](https://github.com/lattice-php/lattice/commit/336214ae0699e414b80ff69e5dbb3518334843cd))
* **ui:** add image component with lightbox preview ([285f8e0](https://github.com/lattice-php/lattice/commit/285f8e0c1d7ab650cbd921d4dd5e15bf23c5a121))
* **ui:** add Tree component with eager node serialization ([c91137e](https://github.com/lattice-php/lattice/commit/c91137eb5acf67ffbca3d2dca17fa8a2f92ce992))
* **ui:** add TreeNode value object ([f487a9e](https://github.com/lattice-php/lattice/commit/f487a9ec2fcd9a8676b255a65c7f5d539e548835))
* **ui:** add TreeSource contract and CallbackTreeSource ([d11c927](https://github.com/lattice-php/lattice/commit/d11c9275ba5904bfb3e9129e0d2d53c2c7e2c828))
* **ui:** Avatar, Separator, and doughnut chart ([77243b7](https://github.com/lattice-php/lattice/commit/77243b753c334f2f44443792524368598b200f00))
* **ui:** color picker primitive with palette swatches and hex input ([d48841c](https://github.com/lattice-php/lattice/commit/d48841cc3b3b9f22fb2ceaf3412dadbb6010c191))
* **ui:** colored tag chips and create-on-the-fly round-trip ([c743d0c](https://github.com/lattice-php/lattice/commit/c743d0c15fba08044700bc504dcb71ed1babaa94))
* **ui:** creatable combobox with free-text tag entry ([2ad9d77](https://github.com/lattice-php/lattice/commit/2ad9d77ab6bc3f1ecf4c4937091e69a81a83d9a6))
* **ui:** icon-button + control primitives, dogfooded across the UI ([1a08340](https://github.com/lattice-php/lattice/commit/1a083408594ef6613503a17af83889ec36425f2a))
* **ui:** IconButton + NativeSelect primitives; Input density, Button icon ([cb88a5a](https://github.com/lattice-php/lattice/commit/cb88a5a730d667906127a3c5699a32b59f3c7824))
* **ui:** image lightbox and wider copyable coverage ([9945e2d](https://github.com/lattice-php/lattice/commit/9945e2d631094bbec6dcd5c6e6c414ad31aa5772))
* **ui:** keyboard navigation and ARIA tree semantics for Tree ([6211b9f](https://github.com/lattice-php/lattice/commit/6211b9ff653fc947c8b0472d6b67f36435080fad))
* **ui:** make headings copyable ([a71a903](https://github.com/lattice-php/lattice/commit/a71a9036eb18a8dacab891f564f147877d842d68))
* **ui:** progress component with bar and circle variants ([12d3b88](https://github.com/lattice-php/lattice/commit/12d3b88f0ee0f9063850f3be173d5ca5e01b4d6a))
* **ui:** render progress bars and circles on the client ([f9c3418](https://github.com/lattice-php/lattice/commit/f9c3418cdbabffb6be635ef135dd85f2da649e4d))
* **ui:** render Tree component with expand/collapse, active state, links and actions ([0d61daa](https://github.com/lattice-php/lattice/commit/0d61daaa2ed64eda10ce59a072f8de6ced4235a1))
* **ui:** rich option rendering via renderOption on Combobox ([e429e2e](https://github.com/lattice-php/lattice/commit/e429e2ef15e6a3bd2c6180a2cec478a8d0f93dff))
* **ui:** Tree view component (hierarchies, expand/collapse, keyboard a11y) ([f49010f](https://github.com/lattice-php/lattice/commit/f49010f35b7366f85de3d92d9922283146d7e320))
* **workbench:** color picker demo page with browser coverage ([a8dea12](https://github.com/lattice-php/lattice/commit/a8dea12b1e125576bd61bdb58ba5707f812be681))
* **workbench:** progress demo page with browser coverage ([78667aa](https://github.com/lattice-php/lattice/commit/78667aa37d1074f1b6cf8962bcd2f550cd9f089b))
* **workbench:** rich product options in the showcase select ([cffe12f](https://github.com/lattice-php/lattice/commit/cffe12fa2d39913e2eb54acbc49d0f6ba23ce571))


### Bug Fixes

* **editor:** re-render the toolbar on selection-only transactions ([fa570f8](https://github.com/lattice-php/lattice/commit/fa570f86d79107794e254809f585037f26f000fb))
* **forms:** declare createOption on the InteractsWithForm contract ([ee7add3](https://github.com/lattice-php/lattice/commit/ee7add3bdd257a31347c75477e1268d5093b7970))
* **forms:** fall back to plain labels when the option schema renders empty ([de815c0](https://github.com/lattice-php/lattice/commit/de815c03ba49f6b72109f7f6d2e4949a91d60663))
* **i18n:** kebab-case keys + translate remaining strings ([aa11b35](https://github.com/lattice-php/lattice/commit/aa11b3531fc325c1250371721e671917c3f0212d))
* **i18n:** kebab-case translation keys ([8ea7160](https://github.com/lattice-php/lattice/commit/8ea71607a4265b324540dadb60564f0a2c0c29be))
* **i18n:** translate remaining hardcoded UI strings ([77cd9d1](https://github.com/lattice-php/lattice/commit/77cd9d18617cb04c98c590042827291e4c323abe))
* **tables:** stop the column select filter printing its field label ([7074b01](https://github.com/lattice-php/lattice/commit/7074b01da168cd24ae7519dfb7ef7c44b9feffa3))
* **theme:** apply dark colour overrides under the data-theme toggle ([dde4f5e](https://github.com/lattice-php/lattice/commit/dde4f5ec40e9a84608e088c79fb3848b612abf22))
* **ui:** accumulate sequential creatable commits and replace single-select value ([35bf5fa](https://github.com/lattice-php/lattice/commit/35bf5fab3b3b9271a751a9d70b19c6a02b370677))
* **ui:** make creatable tag-entry additive instead of toggling ([3bf9320](https://github.com/lattice-php/lattice/commit/3bf9320c7dbe9f079b7fda25182f41c2501b3687))
* **ui:** make Tree a single tab stop and trigger node actions from the keyboard ([b0c308e](https://github.com/lattice-php/lattice/commit/b0c308e9e234f1c3c43ed1a2d11d3a8f88471306))
* **ui:** order Tree keyboard traversal by position, not node id ([c22d823](https://github.com/lattice-php/lattice/commit/c22d8233001ff864808f8de61f759dbe74d3c804))
* **ui:** restore focus after closing an imperatively-opened Modal ([f199141](https://github.com/lattice-php/lattice/commit/f199141805ab9a15b8d390d2357c25563003414f))
* **ui:** restore focus to the opener after closing an imperatively-opened Modal ([999fa0d](https://github.com/lattice-php/lattice/commit/999fa0d039ffcda02555fade7f4f726e23d73989))
* **ui:** serialise TreeSource children eagerly up to eagerDepth ([d4b19ab](https://github.com/lattice-php/lattice/commit/d4b19ab2114c7bc20c6d8b3b1e4305b5fd20e231))


### Performance

* **ui:** batch the EloquentTreeSource hasChildren check ([7b70f14](https://github.com/lattice-php/lattice/commit/7b70f14bb3c0bf4cc7d4be8c40be0e6380e32029))


### Refactoring

* **attributes:** unify wire-type attributes and value-object registries ([a1d04a9](https://github.com/lattice-php/lattice/commit/a1d04a9becba9b61e08239f1a90c1c9299306faf))
* boot the workbench through createLatticeApp ([72481fd](https://github.com/lattice-php/lattice/commit/72481fdd824bb3141f559102207a01db01b08de8))
* **core:** move colour enums into Core/Enums for docs discovery ([b609354](https://github.com/lattice-php/lattice/commit/b609354591f29bed913661749d7ccc000117bc71))
* drop redundant value-object docblocks ([af68b1f](https://github.com/lattice-php/lattice/commit/af68b1fe86ba5f9ee726dbfbf219daf0805c3fb3))
* **editor:** tighten the registry and public surface after review ([e07027a](https://github.com/lattice-php/lattice/commit/e07027a5e0a63210a7edbd7f5464dbbfdb3768ee))
* **effects:** drop the Effect suffix from builtin effect classes ([0a1bb9d](https://github.com/lattice-php/lattice/commit/0a1bb9dd1c233a73bfb63db796e46721d63d5423))
* **effects:** toast and callout become their own props ([2c53e2e](https://github.com/lattice-php/lattice/commit/2c53e2e56934285b70b2019446acd02a42e88c81))
* **forms:** drop create-on-the-fly from creatable Select ([4ac4902](https://github.com/lattice-php/lattice/commit/4ac49028181db232d3299b8ee3493e8d95d73c66))
* **forms:** editor extensions adopt the required-props envelope ([bdd4889](https://github.com/lattice-php/lattice/commit/bdd48892f6cc87a7b226f580ab11f25d78f91cff))
* **forms:** generate LabelAction and FieldConditions value objects ([76ade92](https://github.com/lattice-php/lattice/commit/76ade9260c1f43fdfcae2db561e9afb4ca0ab6a0))
* name the i18n-enabled flag in createLatticeApp ([b5e0c91](https://github.com/lattice-php/lattice/commit/b5e0c91047288ac80fa1bc274cc9d96151fd776d))
* **realtime:** collapse Listen into its wire shape ([9e31ffa](https://github.com/lattice-php/lattice/commit/9e31ffa94b133c723467c2b4dafb05486601b559))
* reuse Model::only for column-based option data ([fd44b40](https://github.com/lattice-php/lattice/commit/fd44b40e76892cf554bddf950e108b17f05eb4a1))
* **tables:** badge and icon column colors take Color values ([b462812](https://github.com/lattice-php/lattice/commit/b462812916138aab1775b730fa0f1d1d5d2ecca7))
* **tables:** cells resolve tagged and row-driven colours via the colour lib ([addb5fc](https://github.com/lattice-php/lattice/commit/addb5fc376d635f81aa39e2e667b442fdd00936f))
* **tables:** reuse generated FilterIndicator ([2b7954c](https://github.com/lattice-php/lattice/commit/2b7954ce4dc27bf54c8d3f5ef90fb44a2ef12a90))
* **tables:** unify the table query wire type ([055a8e3](https://github.com/lattice-php/lattice/commit/055a8e30c229c0e679bf5def61d87ea23fc90b44))
* **typescript:** drive generation from one wire-family table ([e5c1b6d](https://github.com/lattice-php/lattice/commit/e5c1b6da52a05f914a5d61d4a422b565606c1036))
* **types:** generate drifting handwritten types ([cbbd16c](https://github.com/lattice-php/lattice/commit/cbbd16c68248dad72270ec449520f099f4b5b392))
* **types:** generate the augmentable Node, unifying it with WireNode ([2620fcd](https://github.com/lattice-php/lattice/commit/2620fcd80c7028d6c9e74f72d752e8c7b0fe9c03))
* **types:** one {type, props} envelope and a tighter generated module ([928e75c](https://github.com/lattice-php/lattice/commit/928e75c8040a7923b5b04555395a326d2e27ee1e))
* **types:** rename the effect payload resolver to EffectPropsOf ([af33931](https://github.com/lattice-php/lattice/commit/af339317c81cc068a9176cae1556ef3cbe894444))
* **types:** shrink WireFamily to category and registry ([7b7193a](https://github.com/lattice-php/lattice/commit/7b7193a88cf36863104ac468cbf0215c7597f848))
* **types:** type enum-like string wire fields as their enums ([08f1017](https://github.com/lattice-php/lattice/commit/08f1017485d594a9152719756d93ac542fcde6a1))
* **types:** unify Node/WireNode — generate the augmentable Node ([d239f7e](https://github.com/lattice-php/lattice/commit/d239f7e04955c183f4b1ca9049921741fcdba730))
* **ui:** chart series colors take Color values ([72a2a19](https://github.com/lattice-php/lattice/commit/72a2a1998665e6caf1f3731d2e3f62f30fa5e823))
* **ui:** charts and select tags resolve tagged colours ([ce95c72](https://github.com/lattice-php/lattice/commit/ce95c72d89519a8eb81685708fa1e2cb283d88ec))
* **ui:** dogfood the icon-button and control primitives ([f360813](https://github.com/lattice-php/lattice/commit/f3608131a3e3ee2e85aa49a47f33a2af091b0459))
* **ui:** replace the Color enum with a tagged Color value object ([dc1dad2](https://github.com/lattice-php/lattice/commit/dc1dad2664fb0b67e1e753ad7332260c0e2d9939))
* **ui:** replace Tree::eagerDepth() with an internal depth cap ([a6c6a1b](https://github.com/lattice-php/lattice/commit/a6c6a1b86faddf03de21296d3d16c85640545576))
* **ui:** text, icon, and progress render tagged colours ([0b72b30](https://github.com/lattice-php/lattice/commit/0b72b3036fa1b93dc920cb2080d53c26589dbe36))
* **workbench:** drop duplicated demo pages and share the products demo builder ([a54d1a9](https://github.com/lattice-php/lattice/commit/a54d1a9c04c10b4209805d6806ba538371a068bb))
* **workbench:** extract shared product option mapping ([9755044](https://github.com/lattice-php/lattice/commit/97550442c462ef46689d7a41a289742346b6d5d2))
* **workbench:** restructure demo pages into field, table, component, and platform groups ([2bf027b](https://github.com/lattice-php/lattice/commit/2bf027b72547f208cbf1511ff105ad6ca606f918))
* **workbench:** restructure demo pages into field, table, component, and platform groups ([a001c69](https://github.com/lattice-php/lattice/commit/a001c69c11db703b511a871de7cc45d2c0a7fce2))


### Documentation

* clarify text colour default wording ([331ae07](https://github.com/lattice-php/lattice/commit/331ae0794d17b4cbaed212004c75fdb37790abb4))
* color picker field page ([55dd808](https://github.com/lattice-php/lattice/commit/55dd808260f731705fe0ed27055275cb6d35e6b6))
* colour value object across component, table, and chart pages ([7d0f41d](https://github.com/lattice-php/lattice/commit/7d0f41d36edce872e8a5ff6d214b90ec20caa8fe))
* **forms:** document creatable Select and tags ([02b4073](https://github.com/lattice-php/lattice/commit/02b4073dc16e112e535d2d7a6cd2c4f3a18a70b1))
* **forms:** document rich editor extensions ([57bfb48](https://github.com/lattice-php/lattice/commit/57bfb48bcdb1379c6654e34a366455ac3c8d9be0))
* **forms:** reword negative-definition sentence in select docs ([33f4799](https://github.com/lattice-php/lattice/commit/33f479992d07d2aa9ac34f81b139a91d2a6d07fb))
* **forms:** simplify creatable Select docs to create-on-save ([a7b308e](https://github.com/lattice-php/lattice/commit/a7b308ea47f51fb35e20df0eb3c6c2c983f0956a))
* image lightbox and copyable coverage ([6af5138](https://github.com/lattice-php/lattice/commit/6af513824b3cd1e89d0325884d1f5831c19a1765))
* list ProgressVariant on the enums reference ([f0e5b6c](https://github.com/lattice-php/lattice/commit/f0e5b6c592e4ea3caace1cfeb388e1b126bb53f0))
* note label-only filtering for rich options ([a7a75ce](https://github.com/lattice-php/lattice/commit/a7a75ce58acaea94c1cd02511ddf3decfa51370e))
* progress component page ([e9d5539](https://github.com/lattice-php/lattice/commit/e9d5539d061d94936bdd42c14d64a2530f092d31))
* refresh enum fixture and docs formatting for the color picker ([995fae4](https://github.com/lattice-php/lattice/commit/995fae4e3f45280498b409d3223520ce464788a9))
* rewrap select field docs prose ([428e1fe](https://github.com/lattice-php/lattice/commit/428e1fe60b83fb3fb913a00a7e44d33a71c52c16))
* rich select options ([9ca2ebd](https://github.com/lattice-php/lattice/commit/9ca2ebda0282a6de239553f5e8d358907b0d0e3c))
* state icon column colour fallback ([fe04311](https://github.com/lattice-php/lattice/commit/fe043115f751d248202e442856130fc6aa0224ee))
* **tables:** document global table search ([c8ddb98](https://github.com/lattice-php/lattice/commit/c8ddb98017f6c7565bceb21a35bbd7aa24ba4dd2))
* **tables:** row detail page ([0d0c934](https://github.com/lattice-php/lattice/commit/0d0c934e83e6f7e142bd64dfb69dacc75ed340a1))
* tree source traversal, Enter action behaviour, eagerDepth limits ([d1c0bb4](https://github.com/lattice-php/lattice/commit/d1c0bb4092c9ca34f46ff1ae293863dbe5a6ae6d))
* trim comments that restate the code ([dbb779c](https://github.com/lattice-php/lattice/commit/dbb779cbfd4ba26df03196f35628f715bdf708bf))
* trim comments that restate the code ([d422137](https://github.com/lattice-php/lattice/commit/d422137399ee963dfe125a9502c6b2dc6891f68f))
* **ui:** document the Tree component ([2db7026](https://github.com/lattice-php/lattice/commit/2db7026f5121781129ea559b1876fb9e72789f47))
* unify tone across the docs pages ([564475a](https://github.com/lattice-php/lattice/commit/564475a6f8a6bd0235d13ccd521eccdd2bb9360b))
* unify tone across the docs pages ([7bd1bf7](https://github.com/lattice-php/lattice/commit/7bd1bf7c643656690dccc3396e98b57f64b74441))

## [0.19.0](https://github.com/lattice-php/lattice/compare/0.18.0...0.19.0) (2026-07-11)


### Features

* no-build standalone assets published via lattice:assets ([e860ee9](https://github.com/lattice-php/lattice/commit/e860ee9fc4bfc24ba6e6221e961ce3c7e25936cb))


### Bug Fixes

* bump undici to patched versions for security advisory ([e82f219](https://github.com/lattice-php/lattice/commit/e82f219ce255268b81588ac410f7e87002f9933f))
* bump undici to patched versions for security advisory ([6478c7d](https://github.com/lattice-php/lattice/commit/6478c7dc060bea2aa9253d7535a686d87e5e5e6e))
* **ci:** stop the required docs check from deadlocking non-docs PRs ([5c5273c](https://github.com/lattice-php/lattice/commit/5c5273cf1c5c3092817e1c5f43eab396bcfff8eb))
* **deps:** align lucide-static with the vendored 1.24.0 icons ([7ee89e9](https://github.com/lattice-php/lattice/commit/7ee89e9306ecc9f934252e78e9d93316a947de8f))
* **discovery:** isolate the manifest cache per test worker ([5c6705c](https://github.com/lattice-php/lattice/commit/5c6705ce8a5a4d63b97215daa4dc12ba5558fa54))
* **docs:** restore preflight inside live example previews ([bfc4051](https://github.com/lattice-php/lattice/commit/bfc40519be295f45a696e5989d28fae2798461d8))
* **form:** key row templates by the renderer's node key ([476e488](https://github.com/lattice-php/lattice/commit/476e4883a2826e37f1623d2c5f8530cd6425b51f))
* **form:** render the rich editor placeholder ([81a21a7](https://github.com/lattice-php/lattice/commit/81a21a7ec39e9ff2b8429c30f50c44d8a6b3ebd0))
* gate standalone-asset releases and kill known test flakes ([2ed1e82](https://github.com/lattice-php/lattice/commit/2ed1e8247c56a9713b47aa76848017c32ac19b1c))
* **release:** gate npm publish on fresh standalone assets ([11a20a2](https://github.com/lattice-php/lattice/commit/11a20a2ea293044796b2ad2fca8ff2f4081e1b5a))
* write the generated icon enum to its post-refactor path ([a16e42f](https://github.com/lattice-php/lattice/commit/a16e42f7f0f5f7a5db3ccc943b4df98ae63986f2))


### Refactoring

* delete dead code surfaced by the audit ([1e03ae4](https://github.com/lattice-php/lattice/commit/1e03ae4180bacb6d32596e2eb19a3fb70dda4c78))


### Documentation

* correct API drift found by the correctness sweep ([861b978](https://github.com/lattice-php/lattice/commit/861b978965937cfbaebd700cb8cf06e95ae897ad))
* correct the core and advanced reference pages ([213973c](https://github.com/lattice-php/lattice/commit/213973c408581bfefe67781515e47391de39c70e))
* full correctness sweep, live-example styling, and intro reframe ([720bf9c](https://github.com/lattice-php/lattice/commit/720bf9c225eb54e3ce8ef8a6866c88fa23d8ae41))
* keep the no-build limitations list outside the callout ([bdf4a0a](https://github.com/lattice-php/lattice/commit/bdf4a0aaca58b829ce56f1adc05978ca2e96f135))
* point the README at the no-build install path ([d6268f1](https://github.com/lattice-php/lattice/commit/d6268f1c0b7e31ae52ade98ca757e4d19bf4a0fd))
* reframe the intro around the duplicated UI contract ([700b40d](https://github.com/lattice-php/lattice/commit/700b40d8d57c41c7caa7d4f141c535b3c0d59ac5))

## [0.18.0](https://github.com/lattice-php/lattice/compare/0.17.2...0.18.0) (2026-07-10)


### ⚠ BREAKING CHANGES

* reshape shared concerns around one nullable label and serializer-owned keys
* drop the dead client hidden-field reads
* extract shared label, size, color concerns and localize the action-group default
* hide components whose definition denies authorization at render time
* drop the orphaned field visibility assertions
* merge the field hidden flag into the shared render gate
* when() is removed with no alias; use visible()/hidden() instead.
* consume dedicated filters as standard wire nodes
* serialize dedicated table filters as standard wire nodes
* unify wire type discriminators
* tighten package exports to deliberate entrypoints
* rebuild the row-field substrate as a blessed extension API
* narrow disguised-false component flags to explicit booleans
* wire column flags as explicit booleans and drop ColumnFilter::enabled

### Features

* add schema-based table filters ([f71db16](https://github.com/lattice-php/lattice/commit/f71db164bd20c411185b41febbf00d0904a45aec))
* add schema-based table filters ([1fb8c57](https://github.com/lattice-php/lattice/commit/1fb8c57abbc6861d2422794e53f7941c12b975eb))
* add visible() to columns, omitting hidden columns server-side ([582d08a](https://github.com/lattice-php/lattice/commit/582d08a516d7187f78dfc39ee978b7ac137e7263))
* align select and filter closure contexts with the field surfaces ([ba96bda](https://github.com/lattice-php/lattice/commit/ba96bdaf6751463065677bba9fc915abad4c737b))
* allow packages to register discovery groups ([c61474f](https://github.com/lattice-php/lattice/commit/c61474ff2ad1777c08bbf067561778b9bc6e5522))
* extensible discovery groups + retain optional Builder row fields ([df4d157](https://github.com/lattice-php/lattice/commit/df4d157127bc10a6992d3747323252ad6bbf9317))
* gate table filters and row actions through the shared visibility gate ([df14533](https://github.com/lattice-php/lattice/commit/df145331578e070f3e4b5d42034d1d681548d35d))
* generate FilterPropsMap for typed table-filter props ([e210ca0](https://github.com/lattice-php/lattice/commit/e210ca04f605985d0d86a2447c1737f06b729288))
* hide components whose definition denies authorization at render time ([f9dfb24](https://github.com/lattice-php/lattice/commit/f9dfb24cde92e27d7c41f8d3eba55e006cd4fe60))
* let table filters declare custom string controls, mirroring columns ([ec462b8](https://github.com/lattice-php/lattice/commit/ec462b8b0d8ae2422311d36d0b8a465236cfff1b))
* merge the field hidden flag into the shared render gate ([c21e720](https://github.com/lattice-php/lattice/commit/c21e720f89a2f4cfa317124c37d1ad2141458333))
* stack columns render a bound component schema per row ([8624615](https://github.com/lattice-php/lattice/commit/862461507458f756a2dada1afd9277f22fe44337))
* tighten package exports to deliberate entrypoints ([721b0b4](https://github.com/lattice-php/lattice/commit/721b0b46ed11debd413d2bcdbea31164565b6af2))
* typed table-filter props via FilterPropsOf ([64e57bc](https://github.com/lattice-php/lattice/commit/64e57bccd3916f37075575e0041b7229b6168099))
* unify filter chips into one bar and namespace filter option search ([f5fc918](https://github.com/lattice-php/lattice/commit/f5fc918aebe5ab91299fb548481fd349f563e953))
* unify render gating behind visible() and hidden() with closure support ([1678919](https://github.com/lattice-php/lattice/commit/1678919a7d1a5d1e69b4e578bb30700f57bf36a6))
* unify wire type discriminators ([92d111d](https://github.com/lattice-php/lattice/commit/92d111d9242d7f36215a92c8141303f9fe588280))


### Bug Fixes

* add #[Override] attribute to Field::decorateProps ([ea9101a](https://github.com/lattice-php/lattice/commit/ea9101a74a7be274c868f67c3dc042a609e8b393))
* address performance review followups ([bd673cc](https://github.com/lattice-php/lattice/commit/bd673cccb6f8a3c4c8648ebb50084a09b63c7fa9))
* align fixture dump unicode encoding ([a2a7164](https://github.com/lattice-php/lattice/commit/a2a7164f1b62f2b262f05e638cd13ccdfa0a2f7f))
* categorize table filters as their own discovery category ([1ee2fd7](https://github.com/lattice-php/lattice/commit/1ee2fd720618b58f8ff79fa9a9c2adce4f252dd0))
* **deps:** keep playwright at 1.60.0 ([c74f757](https://github.com/lattice-php/lattice/commit/c74f757e546a7fc948db940effcd216efd62f3ee))
* fail closed when a gated node reaches wire serialization ([2560d6f](https://github.com/lattice-php/lattice/commit/2560d6f69e7ed20e80f826af9666830f3506be31))
* gate row, notification and embedded-form components behind render authorization ([d0e93d5](https://github.com/lattice-php/lattice/commit/d0e93d58878feae12fd44dee5ac86df5ac7b469a))
* handle failed rustfs probe writes ([c449405](https://github.com/lattice-php/lattice/commit/c4494052a9dc2d9168ed792e4c8d252d5fcf5108))
* keep generated types formatted in ci ([5593f11](https://github.com/lattice-php/lattice/commit/5593f1178245f58343a4ff63ea21ecb555a39db6))
* keep the workspace root in the Vite dev-server fs.allow ([830a43a](https://github.com/lattice-php/lattice/commit/830a43abe00325f106c3fe8a7ad1c55dafb005f4))
* match generated type property order to the CI regeneration ([693c10d](https://github.com/lattice-php/lattice/commit/693c10d5c007093e50f556e577b7ffc5f5197782))
* prune hidden columns from table row-data projection ([869896f](https://github.com/lattice-php/lattice/commit/869896f35aeccb5627b1d087a9e994078bf5589a))
* resolve component packages from composer metadata ([fcf5092](https://github.com/lattice-php/lattice/commit/fcf5092c56eb4a8e1f56e2949bc7860bf75e7e01))
* resolve hidden closures against the live instance and share the render-authorization guard ([5f8e8f1](https://github.com/lattice-php/lattice/commit/5f8e8f17565b601ae36f17593833262a6d0b04ae))
* restore the workspace root in the Vite dev-server fs.allow ([8294cce](https://github.com/lattice-php/lattice/commit/8294ccef02969d419661987ecbbfa7e819b752fb))
* retain optional builder/block row fields through validation ([9ed7c94](https://github.com/lattice-php/lattice/commit/9ed7c94b44a797532876dab1dd28f091dad8bb46))
* serialize colors/icons value-maps as objects regardless of key style ([1b46e21](https://github.com/lattice-php/lattice/commit/1b46e219b37c99c3ff85bf6b5917500c45d6c5d6))
* serialize empty wire maps as JSON objects, not arrays ([8b41269](https://github.com/lattice-php/lattice/commit/8b41269d012ab4771c2d2f78c00507bca70f5f4d))
* serialize map-typed wire fields as objects, not arrays ([04d9630](https://github.com/lattice-php/lattice/commit/04d9630dd6d89c919a2dc39306e26216eccae0d3))
* **test:** identify prune notifications by title, not created_at order ([697c6cd](https://github.com/lattice-php/lattice/commit/697c6cd55ba5a9f3516b4f4b2013064214ac6852))
* **types:** include filter in DiscoveredComponent category ([fe08f9c](https://github.com/lattice-php/lattice/commit/fe08f9c96a104b84ff79d145fb499c1ef63493d2))


### Performance

* materialize wire trees with a direct walk instead of a JSON round-trip ([f39cdea](https://github.com/lattice-php/lattice/commit/f39cdea2d575630b7b6ea14b60ffe9e46b1471ae))


### Refactoring

* add form/embed as the deliberate form-hosting surface ([cf09e62](https://github.com/lattice-php/lattice/commit/cf09e62966f4779f3d06d3c3656d9ac7d311dc85))
* add selector-based form value store ([969f89c](https://github.com/lattice-php/lattice/commit/969f89c41c9d46e6a85ca482452824f44a007f26))
* build column props via the shared decorateProps seam; empty props serialize as [] ([e9d8763](https://github.com/lattice-php/lattice/commit/e9d876392bc20f7787bf028967235945198202ca))
* classify wire types by explicit attribute precedence ([e5e4472](https://github.com/lattice-php/lattice/commit/e5e4472a3594bdf266e31065c743f6830dcf541c))
* ColumnData.props is always present; drop client null-guards ([7a2736e](https://github.com/lattice-php/lattice/commit/7a2736e58f696fb704ebfbd498be90fcb7331428))
* columns cleanup — WireMap attribute, public common props, stack schema ([06f7300](https://github.com/lattice-php/lattice/commit/06f7300df0a48dd97a882aa8cc8cda95d814ac73))
* compute field wire props in decorateProps instead of mutating state ([d53597e](https://github.com/lattice-php/lattice/commit/d53597ea43d5d54ee3fe163bd5e9d5b82056713e))
* consume dedicated filters as standard wire nodes ([b735a18](https://github.com/lattice-php/lattice/commit/b735a1877b9b1702b6ed20a138c5c619d93155e6))
* converge wire-node serialization onto one convention ([a1f6bc3](https://github.com/lattice-php/lattice/commit/a1f6bc3f58df980f3ef8c7e4fae98b058a7c8492))
* derive TypeScript domain nodes from discovery ([c4fa950](https://github.com/lattice-php/lattice/commit/c4fa9505d255bb9f7fdcac94c5a758dafa36f5a3))
* drop hand-rolled value-object serializers where native encoding is identical ([ca662b7](https://github.com/lattice-php/lattice/commit/ca662b772f3c8ea711aaf15f1d748d5298b8eaca))
* drop the dead client hidden-field reads ([ee11cec](https://github.com/lattice-php/lattice/commit/ee11cec157be223566edb31232b89909d1338230))
* drop the orphaned field visibility assertions ([b5cc308](https://github.com/lattice-php/lattice/commit/b5cc308da0e8e81435ac6d0b68c604332275481e))
* drop unreachable filter rules and dedupe filter value plumbing ([aeaf42c](https://github.com/lattice-php/lattice/commit/aeaf42c2149635340f570a0414a8b89ff2ec9396))
* emit schema children lazily through one shared convention ([9529797](https://github.com/lattice-php/lattice/commit/9529797f557045f34feb653ae3b069bc29d34efa))
* extract GatesRendering trait and Renderable contract from Component ([a7a2279](https://github.com/lattice-php/lattice/commit/a7a22793c0062d1f053529e6df9310efb4bf769c))
* extract SerializesToWire from ReflectsWireProps with a decorateProps seam ([1f0ab58](https://github.com/lattice-php/lattice/commit/1f0ab5873785c34bb7d08a9247bc551faeee45cd))
* extract shared label, size, color concerns and localize the action-group default ([b6c7657](https://github.com/lattice-php/lattice/commit/b6c76575eff6146f570e77d8275f2d705329e121))
* extract the node serialization pipeline into SerializesWireNode ([ae13c39](https://github.com/lattice-php/lattice/commit/ae13c3990ff95f9925e30fd2772f38b3c53c27d9))
* extract the shared readonly-key and keyed-label concerns ([988434a](https://github.com/lattice-php/lattice/commit/988434a9deac43a6d681f2fa2cb72a182b977f0a))
* filters reflect props through the shared seam via #[AsFilter] ([4a3161b](https://github.com/lattice-php/lattice/commit/4a3161b896b751a9b6b3c67a1e1b6954beeffac2))
* finish TypeScript layering ([e4c5a12](https://github.com/lattice-php/lattice/commit/e4c5a12546d68cf0782b52adc91b8bc872b309b0))
* flatten table columns to {type,key,props} nodes ([aaabe13](https://github.com/lattice-php/lattice/commit/aaabe13e2e149c39c661eca9c0afb5c06d388f14))
* flatten table columns to {type,key,props} nodes (PHP) ([f4e6c2a](https://github.com/lattice-php/lattice/commit/f4e6c2a8dd6f0ebdb13f90f379f75a4b39f96217))
* fold the row-schema trait into RowsField and dedupe reserved-key plumbing ([2044d8c](https://github.com/lattice-php/lattice/commit/2044d8c4af35df09a036beece155e6116e617509))
* improve render and resize performance ([a08dbc2](https://github.com/lattice-php/lattice/commit/a08dbc2132feb0bc3a7c9e3a0970f7dcb6be2d8b))
* internal domain boundaries — form/embed, click-model ownership, lint enforcement ([8a3b524](https://github.com/lattice-php/lattice/commit/8a3b52431258da1f25e68c6136a826135b15a71d))
* make column common concerns public wire props (Field pattern) ([cef331b](https://github.com/lattice-php/lattice/commit/cef331b7d541fc268d316251a747a97d437bd380))
* make TypeScript the base marker attribute for the wire surface ([bc9339e](https://github.com/lattice-php/lattice/commit/bc9339e3e2851483a02097a784a68910309c2ab4))
* memoize node renderer ([a995f96](https://github.com/lattice-php/lattice/commit/a995f9689404b7c55fdceb70fc0d96a168f8639f))
* memoize page metadata resolution ([528ac45](https://github.com/lattice-php/lattice/commit/528ac4516d7373dd7d0a5be6a49ab91d880cd1b3))
* move columns onto the shared node pipeline without serialization side effects ([d11d6f7](https://github.com/lattice-php/lattice/commit/d11d6f7d3522a6d1c001c2b36995be5269a25549))
* narrow disguised-false component flags to explicit booleans ([a3a61e3](https://github.com/lattice-php/lattice/commit/a3a61e39c012a7633fa642883f683ddad057da50))
* normalize resources/js into per-domain components/hooks/lib folders ([940f8b3](https://github.com/lattice-php/lattice/commit/940f8b31f4f799ae41ff373a10843c0d6bda2fd6))
* optimize table column resizing ([43a9a05](https://github.com/lattice-php/lattice/commit/43a9a053ab78d1db6685bf2d109887106b2072bc))
* polish PHP domain structure ([1bf92fb](https://github.com/lattice-php/lattice/commit/1bf92fb690e7253239b12f9a496c51174e350033))
* polish PHP structure and TypeScript layering ([87948d5](https://github.com/lattice-php/lattice/commit/87948d50816eca41239e4a0d254359e4d8fa1ffb))
* re-home the click model into the action domain ([9561efa](https://github.com/lattice-php/lattice/commit/9561efaace50d940e68aa30dcde322683ff48014))
* re-home the serialization purity test and drop a stale docblock line ([3af37ea](https://github.com/lattice-php/lattice/commit/3af37ea787e8d21e898964eee5c0fa53f34c7f22))
* read flattened column props on the client (JS) ([dc51204](https://github.com/lattice-php/lattice/commit/dc512045a9635f99ea36ec05fb30b6485dd7e630))
* rebuild the row-field substrate as a blessed extension API ([4d3aff8](https://github.com/lattice-php/lattice/commit/4d3aff80b96a3f71e80ecb1384aab8af85e8c7ea))
* register built-in discovery kinds via the service provider ([39a27e7](https://github.com/lattice-php/lattice/commit/39a27e735025d00eb2e2585948ec81b5f77cdf94))
* reshape shared concerns around one nullable label and serializer-owned keys ([cd52fae](https://github.com/lattice-php/lattice/commit/cd52fae360bda6ae779498405cca05779e1af42c))
* route feature-domain imports through barrels and enforce with lint ([421e759](https://github.com/lattice-php/lattice/commit/421e7590ad07dfe54a23ac1b0e49d9a5ae7944df))
* serialize dedicated table filters as standard wire nodes ([dfe8b42](https://github.com/lattice-php/lattice/commit/dfe8b42b6ed33162b64763170d553c9c87bf586b))
* serialize effects through shared wire reflection ([180bc6c](https://github.com/lattice-php/lattice/commit/180bc6cd4c7ab379d772a233bc854e590ca4ea58))
* serialize map-typed wire props declaratively via #[WireMap] ([e69fe34](https://github.com/lattice-php/lattice/commit/e69fe34a82de1b4c281e01a25d1db6a4b194ffcd))
* trim comments to why-only ([30260ea](https://github.com/lattice-php/lattice/commit/30260eafad284d46f0cb4b6281d7bfedf8d2f49c))
* unify TypeScript generation discovery behind WireTypeDiscovery ([9671aa6](https://github.com/lattice-php/lattice/commit/9671aa68d819051ab0f268e147830337ab4a4dd7))
* wire column flags as explicit booleans and drop ColumnFilter::enabled ([5e159f4](https://github.com/lattice-php/lattice/commit/5e159f47b9fc195271b29fcc254cacccc99229f2))


### Documentation

* describe render-time authorization hiding ([3e51df6](https://github.com/lattice-php/lattice/commit/3e51df6949effc98807f64d63f69f47f0ed4d205))
* design schema-based table filters ([15b263d](https://github.com/lattice-php/lattice/commit/15b263dab9cfcfd0a3911d9316ddd89c512063b1))
* drop redundant and stale decorateProps docblocks ([d7784fb](https://github.com/lattice-php/lattice/commit/d7784fb83a73aeaedccdbe5c4e9859c2a7fd072e))
* plan schema-based table filters ([257e020](https://github.com/lattice-php/lattice/commit/257e0202c3cc01b805bf81ac3086cc617e601bb1))

## [0.17.2](https://github.com/lattice-php/lattice/compare/0.17.1...0.17.2) (2026-07-08)


### Refactoring

* cleanup batch 2 — single eager registry, tooling, browser de-flake ([41589a0](https://github.com/lattice-php/lattice/commit/41589a07a0639551a9f2d8380b2714002636313c))
* cleanup pass — reference signer, Wire helpers, HasIcon, chat factories ([939f8fb](https://github.com/lattice-php/lattice/commit/939f8fb5c91468eab42e39e49fb2de40c332febd))
* collapse to one eager registry per domain, self-split heavy deps ([bca470b](https://github.com/lattice-php/lattice/commit/bca470b654940a0cd085903930bf4438743c4e6c))
* extract a HasIcon concern and fix RowAction::icon() ([de300d7](https://github.com/lattice-php/lattice/commit/de300d727ebea9e6ce923c5bbd38ba0c04bd13df))
* extract Wire::scalar() for the enum-to-wire-string cast ([f208829](https://github.com/lattice-php/lattice/commit/f208829bb07f4380935a73de91cdfcf8b83087af))
* pin each eager registry to its lazy twin's key set ([2b6885c](https://github.com/lattice-php/lattice/commit/2b6885c020b55db1bfc2150c472b1fb7d964fdf1))
* return static from the chat part factories ([1424d77](https://github.com/lattice-php/lattice/commit/1424d77c4a0b4628b47fd474e01ef1dae4487d9d))

## [0.17.1](https://github.com/lattice-php/lattice/compare/0.17.0...0.17.1) (2026-07-08)


### Bug Fixes

* export the ./format/* subpath from the package ([918d319](https://github.com/lattice-php/lattice/commit/918d3198ff84827ce7caf6c19f2621791d7feab9))
* export the ./format/* subpath from the package ([49a2fd4](https://github.com/lattice-php/lattice/commit/49a2fd43b7465aa13b8c6cfab547a536c34326c0))
* render a visible placeholder for unregistered node types ([4a84b4c](https://github.com/lattice-php/lattice/commit/4a84b4c16cbaa4effa3e5ad94ed83216e4907abf))
* surface unregistered node types instead of failing silently ([8a6d8c7](https://github.com/lattice-php/lattice/commit/8a6d8c760f11aa1c86fb44fb8531c3de5165f81d))
* warn when a node type has no registered renderer ([defb347](https://github.com/lattice-php/lattice/commit/defb3479604590adf3bac9c393787ca371649f8b))


### Documentation

* bootstrap custom components through createLatticeApp({ registry }) ([56532b0](https://github.com/lattice-php/lattice/commit/56532b0c0e9a170bac2bc480e128c5679529d796))
* import the virtual plugins module as `plugins` ([b2d5bad](https://github.com/lattice-php/lattice/commit/b2d5badd6fb647cfd17a232380f1cbdb790d6c69))

## [0.17.0](https://github.com/lattice-php/lattice/compare/0.16.0...0.17.0) (2026-07-07)


### Features

* add --package to lattice:component and lattice:field generators ([76f8f8a](https://github.com/lattice-php/lattice/commit/76f8f8ac412dfc2f60699101ef547592d2cdcf78))
* add lattice notification payload builder ([a78b634](https://github.com/lattice-php/lattice/commit/a78b634cae13a442ad86183da195413fc2e81948))
* add the notifications bell component and generate its types ([5ffbf92](https://github.com/lattice-php/lattice/commit/5ffbf927c40d1a2b6d7e2b4b459e3e906c1a3e8d))
* attach action descriptors to lattice notifications ([6fc00dd](https://github.com/lattice-php/lattice/commit/6fc00dd6b5f4b79beb4cb3e5230b20569706c702))
* composer-only custom component packages ([820f331](https://github.com/lattice-php/lattice/commit/820f331d7c5811b6c1a8363133433cb9d373c1d3))
* discover component-package roots from extra.lattice.discover ([295ecbd](https://github.com/lattice-php/lattice/commit/295ecbddad5dda781b6991f30d52a017d5cf8e3d))
* mark-read, dismiss and clear notification endpoints ([6f74cdf](https://github.com/lattice-php/lattice/commit/6f74cdf6b05eb9c8dbf2e183f85b907a69224018))
* notification center (bell + panel) ([ca7bfd7](https://github.com/lattice-php/lattice/commit/ca7bfd76927118eefb43cad38a1a7f1ece67e528))
* notification list, item and empty-state components ([c332fea](https://github.com/lattice-php/lattice/commit/c332fea323890b6b1ef008c6fb8b7d2e2f3860d1))
* notifications bell component with realtime and registration ([9e9426a](https://github.com/lattice-php/lattice/commit/9e9426a6c5a5e952fb8e5d6163058db7558a3688))
* notifications client store with optimistic mutations ([df04d3d](https://github.com/lattice-php/lattice/commit/df04d3d2880ba554aba45616b03ecb45d0cd5cd8))
* notifications frontend types and api client ([a166c02](https://github.com/lattice-php/lattice/commit/a166c02dd338a9ff86ef5306510974878c50d227))
* prune read notifications past the retention window ([12cdbfe](https://github.com/lattice-php/lattice/commit/12cdbfeabd9ca3c17957db88928c7f424b977e4c))
* scaffold the Composer package on first component when it doesn't exist ([12322a6](https://github.com/lattice-php/lattice/commit/12322a63b3e15f860f65ae9e7a0a5d169d40d129))
* send lattice notifications through database and broadcast channels ([6e0b5e3](https://github.com/lattice-php/lattice/commit/6e0b5e39f3d9d89de1f0f6dad1aecf66aaf9232f))
* serve paginated notifications with materialized actions ([3bdcd8a](https://github.com/lattice-php/lattice/commit/3bdcd8acd3b8ac2836be6d9675d76df53062ae85))
* type virtual:lattice/plugins and wire it into the standard install ([943d1d5](https://github.com/lattice-php/lattice/commit/943d1d55345d6e0f88b25519622228cb60247a60))
* wire notification row click-through to its href ([83cb6f1](https://github.com/lattice-php/lattice/commit/83cb6f19fe990fff53e196646c4a0ff7b118f522))


### Bug Fixes

* gracefully degrade unregistered notification actions ([dd414d3](https://github.com/lattice-php/lattice/commit/dd414d35e305233fbbfa45bd4c05c3f90586b7b9))
* guard notifications loadMore against concurrent double-fetch ([a514eb9](https://github.com/lattice-php/lattice/commit/a514eb97b0aa8cfbefe7833ed5510e58f75dbc1b))
* keep the notifications badge accurate and swallow load-more rejections ([c0a9e01](https://github.com/lattice-php/lattice/commit/c0a9e0138e2628ead7206132ed064796ebea47d6))
* render notification icons through IconRenderer ([da1fc8c](https://github.com/lattice-php/lattice/commit/da1fc8cad0f92506bda62eeeb71514810826e089))
* satisfy PHPStan and TS typecheck on the notifications test suite ([6c40e18](https://github.com/lattice-php/lattice/commit/6c40e188b049f1ee2254059d920bc24814ba2397))
* vendor the bell icon and harden the notifications slide-out ([897d10f](https://github.com/lattice-php/lattice/commit/897d10f7f690f3d74905c469e6f350007e1c65f5))


### Refactoring

* collapse core LooseNode into the generated WireNode ([d81eef1](https://github.com/lattice-php/lattice/commit/d81eef1bdc34b005b2cd54e4bc4c71be338ecbdb))
* collapse notification adapters into one queued LatticeNotification ([f61a831](https://github.com/lattice-php/lattice/commit/f61a831e7d651dd9db5f8bd4f6d9395f27469568))
* derive per-domain node unions from generated type-string unions ([352a480](https://github.com/lattice-php/lattice/commit/352a4800849d57ebb6d26fd6588cb82600865b50))
* drop the unknown-laundered effects cast in realtime subscriptions ([2bc1de4](https://github.com/lattice-php/lattice/commit/2bc1de4f70830b0f9f4c3dd7e68c7f8365b5dcdb))
* emit per-domain NodeType unions only for consumed domains ([03e7bd9](https://github.com/lattice-php/lattice/commit/03e7bd9cbf802cef2b4899dbbae23aff58fc0626))
* generate the NotificationItem type from the backend ([8f70df7](https://github.com/lattice-php/lattice/commit/8f70df7415911322a85ea2630f67d92fdbe581df))
* import the column registry hook from core, not the root provider ([1d63517](https://github.com/lattice-php/lattice/commit/1d63517d98cb828b71174eb3352c722f59f8e06e))
* make notification links internal-only via Inertia ([8a43e77](https://github.com/lattice-php/lattice/commit/8a43e771209ae5a72f7ac79810fb51145d4e3489))
* move the generic date formatters out of the table domain ([d170f62](https://github.com/lattice-php/lattice/commit/d170f62ec871885c5c30d39b6845c822e5bc0827))
* share the transformers' allow-list gate via one trait ([0c6113d](https://github.com/lattice-php/lattice/commit/0c6113dbeaa2fc1450e0ce4574caa604c73de9ca))
* stop exporting internal-only component and helper types ([8f05204](https://github.com/lattice-php/lattice/commit/8f05204cc7fd4a586e360723d4cdc69ca8d389cf))
* TS cleanup — dead exports (E/F/G) + registry import direction (C) ([31658b5](https://github.com/lattice-php/lattice/commit/31658b5aba399373fac8760c405d50248513931f))
* unify clickable behavior under one Triggerable concern ([8ec8c59](https://github.com/lattice-php/lattice/commit/8ec8c59f4a6ff50e375b6221279b9cf73d3585dd))
* unify clickable behavior under one Triggerable concern ([d9f6d4d](https://github.com/lattice-php/lattice/commit/d9f6d4dfaecd32bd748240dc95fcf9cf3b00e67f))
* unify component/column/effect props onto one augmentable-map registry ([d0ba83c](https://github.com/lattice-php/lattice/commit/d0ba83c776ab6adc3cadfec95a66e92286826d77))
* unify node prop resolution through one open path ([848cc38](https://github.com/lattice-php/lattice/commit/848cc38bd47ad669f5315e25410e480f83336ce6))
* unify the PHP→TypeScript type system ([0847682](https://github.com/lattice-php/lattice/commit/0847682876b2972e19f368510bd7e1fa5ca9fb33))


### Documentation

* add a Component packages authoring guide ([909ae99](https://github.com/lattice-php/lattice/commit/909ae99ae1e8b971c038bc089d2d6a274121d652))
* apply the comment rules across the typing system ([5d0511f](https://github.com/lattice-php/lattice/commit/5d0511f484c5e83b10a2cf6ad430c399995b8232))
* components & tables sections, icon rendering + vendoring ([5d9066d](https://github.com/lattice-php/lattice/commit/5d9066d5a4d07179420d5113f1b89dc11e22d8a9))
* document the notifications bell component ([2147e4f](https://github.com/lattice-php/lattice/commit/2147e4f5c8bb56ae30d911275632eb8de975cf73))
* document vendoring icons from a package ([6342487](https://github.com/lattice-php/lattice/commit/63424870e59551db993238b2ece771294bca22b9))
* icon vendoring no longer deletes other files ([51c3450](https://github.com/lattice-php/lattice/commit/51c3450aff7146717838495b746f66d4bcafd7df))
* note the queue-worker prerequisite for notifications ([9c94ef7](https://github.com/lattice-php/lattice/commit/9c94ef701413af3e0db5be7d8d72196413df55af))
* reflect that a button can trigger an action and a link can dispatch effects ([51c9a1e](https://github.com/lattice-php/lattice/commit/51c9a1e1f5f97e58a0e499c1434ba4c3dfddc4b4))
* render sprite icons in live component examples ([cbb7d3f](https://github.com/lattice-php/lattice/commit/cbb7d3f1fcc4dc3ed9048afd64c5805a18a30c09))
* restructure the Tables section, abstract-first with per-column pages ([0ece2a6](https://github.com/lattice-php/lattice/commit/0ece2a65ce1c0c4a389696284f04cd7681b25eb1))
* split the components page into a dedicated Components section ([72c8735](https://github.com/lattice-php/lattice/commit/72c87358d9d21a47d5aaf2904dfdd3c75ec6e090))

## [0.16.0](https://github.com/lattice-php/lattice/compare/0.15.0...0.16.0) (2026-07-04)


### Features

* add clock icon for the time picker trigger ([39065c6](https://github.com/lattice-php/lattice/commit/39065c610c52ddc2c9fc4b5f91d515ded5e49d7f))
* add compact notation to NumberColumn ([927a03c](https://github.com/lattice-php/lattice/commit/927a03c2e6da62c49443fa5219142f3da7f09d49))
* add DateFormat descriptor ([b9880b3](https://github.com/lattice-php/lattice/commit/b9880b34ba80512c3f65903ef3a24cac756c37ec))
* add DateFormat::month() and monthYear() field formats ([5450ea3](https://github.com/lattice-php/lattice/commit/5450ea3b43e0269d1cadd850e946b1cc6ea41831))
* add formatValue dispatcher ([2bf74b7](https://github.com/lattice-php/lattice/commit/2bf74b76dcc1a2be5478bcf8f2e6fc6a3f00f97c))
* add NumberFormat descriptor ([dedaaea](https://github.com/lattice-php/lattice/commit/dedaaea5e639e439fc2137b479314cdffc06db13))
* add scrollable-column TimePicker control ([ce23b22](https://github.com/lattice-php/lattice/commit/ce23b228f83479d6ef1018795d143b93ffbdf0fb))
* add time-picker column model ([ef4942b](https://github.com/lattice-php/lattice/commit/ef4942b15b9806431746ca46ee8a5d045b867eb8))
* add value and category format to Chart ([f3d694a](https://github.com/lattice-php/lattice/commit/f3d694a4eef32d08674af5e6f10fb2a7647d18d3))
* add workbench charts gallery page and appearance switcher ([8722822](https://github.com/lattice-php/lattice/commit/8722822c896990bb6d49958c37a4f6845753c3ab))
* chart value & category formatting + dedicated Charts docs ([d342e61](https://github.com/lattice-php/lattice/commit/d342e61f9c92588dd95aa3effd77a15955fac75a))
* custom in-popover time picker for DateTimeInput and TimeInput ([06a888e](https://github.com/lattice-php/lattice/commit/06a888e4063dffb9ccae146aba8591482693162b))
* format chart axes and tooltip from value and category formats ([6b28f40](https://github.com/lattice-php/lattice/commit/6b28f4060139686d92239ca1fa492dca6181df91))
* give standalone TimeInput a picker popover with a typeable input ([e3f85b4](https://github.com/lattice-php/lattice/commit/e3f85b425bb740532dc300cd60662edddfcd8973))
* use TimePicker for the DateTimeInput time control ([5919d86](https://github.com/lattice-php/lattice/commit/5919d8651aa097e8944780867a8470b0b181df05))


### Bug Fixes

* normalize TimeInput text on blur instead of every keystroke ([9a06350](https://github.com/lattice-php/lattice/commit/9a0635013680632452698186be8e0ae7a508f082))
* satisfy new chart format props in test and docs fixtures ([dade0c1](https://github.com/lattice-php/lattice/commit/dade0c11c53e91051dfb5cc59eb58db5a0c65e95))
* theme the chart hover cursor so bar backgrounds adapt to light and dark ([2419211](https://github.com/lattice-php/lattice/commit/2419211bc82ada877f10d9bc5f7d023461a13d48))
* theme the chart tooltip for dark mode ([62d6196](https://github.com/lattice-php/lattice/commit/62d61962656a2c059fea02fbcc5ead5e31c3ba93))
* update column guard and docs fixtures for chart formatting ([bee2e85](https://github.com/lattice-php/lattice/commit/bee2e8545b00d27c1b7cb099afdffc995605a93a))


### Refactoring

* extract shared formatNumber and adopt it in table cells ([4fb7e45](https://github.com/lattice-php/lattice/commit/4fb7e457f6ce61cdb9d029ccc8f11ed1d1ac6a2a))
* format workbench chart months from raw dates, drop month translations ([2412b65](https://github.com/lattice-php/lattice/commit/2412b65557df39f3ce266d9930b8eff0a5cb68ca))
* keep Zag as sole source of truth for the datetime time control ([e8418b7](https://github.com/lattice-php/lattice/commit/e8418b7ac7d8774e666ff04a46b740dacc79d016))
* move NumberFormatUnit and DateTimeStyle to Core\Enums ([6cab818](https://github.com/lattice-php/lattice/commit/6cab81804edbd0d3161617e10af23507a96060a4))


### Documentation

* add dedicated Charts page under a Components section ([a82e3e1](https://github.com/lattice-php/lattice/commit/a82e3e19816a105c4d34012ef93ecd4ea6470217))
* describe the DateTimeInput time picker columns ([8b9d83f](https://github.com/lattice-php/lattice/commit/8b9d83f1448a7d9b1e56b3f133abbe795bde8c53))
* document chart value and category formatting ([1481472](https://github.com/lattice-php/lattice/commit/1481472261d34585af893c309d1909e20366fba4))
* document DateFormat month and monthYear formats ([64b9cc2](https://github.com/lattice-php/lattice/commit/64b9cc290166d66a24f92e20d0dd2558f9f0767c))
* fix relocated enum namespace and document NumberColumn compact ([6e2172b](https://github.com/lattice-php/lattice/commit/6e2172bfa2f5173d62f05c3d3e38d718ac5da68c))

## [0.15.0](https://github.com/lattice-php/lattice/compare/0.14.0...0.15.0) (2026-07-03)


### Features

* add --lt-gutter token and prune dead tokens ([38fc8d1](https://github.com/lattice-php/lattice/commit/38fc8d174176273fd2d620b029049d8a87ba1396))
* add semantic data-slot hooks to structural components ([ad2dd45](https://github.com/lattice-php/lattice/commit/ad2dd45232a3d74b2053d61d3f3c4a013c1dada1))
* add semantic data-slot hooks to structural components ([d9d0f97](https://github.com/lattice-php/lattice/commit/d9d0f97c5a66272fe8ad94da3cc1e6cbf5bc4b25))
* add weight + table cell-padding tokens and tokenize prose ([e0352ee](https://github.com/lattice-php/lattice/commit/e0352eeca3a482fc50ad939a5902460039bfd280))
* support link icons and affixes ([2f1f83d](https://github.com/lattice-php/lattice/commit/2f1f83d0b3cd6acd1c1844890ef07dbe7ad25acc))
* support link icons and affixes ([e2ea5b9](https://github.com/lattice-php/lattice/commit/e2ea5b98caf550eada84560125e78f1a830c0b61))


### Bug Fixes

* wire the z-index scale and adopt it across layered UI ([8f4daa2](https://github.com/lattice-php/lattice/commit/8f4daa2215d45f35ce1b2083c0da92c5ff8ef852))


### Refactoring

* adopt control-height tokens on peripheral controls ([415fe99](https://github.com/lattice-php/lattice/commit/415fe99416c8f0160bb9053de0a80648b0463f01))
* adopt density tokens (control heights, cell padding, prose) + weight token ([24763e8](https://github.com/lattice-php/lattice/commit/24763e8bd4cff57b8ddd0eb30faf946b4d173615))

## [0.14.0](https://github.com/lattice-php/lattice/compare/0.13.0...0.14.0) (2026-06-23)


### Features

* add eager registry entrypoints ([366cf08](https://github.com/lattice-php/lattice/commit/366cf0875dae0ccca1d528391fc51c79c99c9bc9))
* add standalone Tooltip component ([d943a94](https://github.com/lattice-php/lattice/commit/d943a9423d94a90daaaf906b16063f060cecb7f9))
* add tooltip support to Card ([95b58f0](https://github.com/lattice-php/lattice/commit/95b58f032dd09bf5b7fccd154811bb85d5ddf9ad))
* add tooltip support to Collapsible ([088329d](https://github.com/lattice-php/lattice/commit/088329dab011e36ffe74d759c3f69bd3b0520654))
* add tooltip support to Heading ([a1cd360](https://github.com/lattice-php/lattice/commit/a1cd3600f7b86c72cfee168aa1a5a31b68716704))
* add tooltip support to Section ([13dabaa](https://github.com/lattice-php/lattice/commit/13dabaad780bab152fd5d2cf915e618902d6f15a))
* extend tooltips to Card, Section, Heading, Collapsible + standalone Tooltip ([b89a10b](https://github.com/lattice-php/lattice/commit/b89a10b1c3ea94227fd028b98fa5e601abd54af2))
* only show the select search box when the field is searchable ([433e5c5](https://github.com/lattice-php/lattice/commit/433e5c53c97100d08c9cc562162cb55843e6ad1e))
* only show the select search box when the field is searchable ([1a0ccc9](https://github.com/lattice-php/lattice/commit/1a0ccc98a4ea0563047d8c1d6b2ae89f37cc0e04))
* register Tooltip in the eager core component registry ([7954c48](https://github.com/lattice-php/lattice/commit/7954c48cf170b2f5b6b498379b6d5f3ff40ab7ad))


### Bug Fixes

* add presentation role to collapsible tooltip wrapper for a11y lint ([8e947d0](https://github.com/lattice-php/lattice/commit/8e947d0b83fa2cb06b50a08f3e95078a40189d8c))


### Refactoring

* align Card tooltip header structure with Section ([2b146fc](https://github.com/lattice-php/lattice/commit/2b146fce19b27c8bfd95b3645a4d6d4010d40101))


### Documentation

* document component tooltips and the standalone Tooltip ([803afb0](https://github.com/lattice-php/lattice/commit/803afb04cf8ed3ad6930295e542675e1ff1f972c))
* explain why standalone Tooltip triggers must be non-interactive ([436e703](https://github.com/lattice-php/lattice/commit/436e703b6ee72dcc402b6e152bd88e357b38e5d2))

## [0.13.0](https://github.com/lattice-php/lattice/compare/0.12.0...0.13.0) (2026-06-23)


### Features

* add Collapsible disclosure component ([367353c](https://github.com/lattice-php/lattice/commit/367353cc083fbed0a8d39732d96c3545896e6274))
* add Collapsible disclosure component ([b29f9b9](https://github.com/lattice-php/lattice/commit/b29f9b938b1c8b418a52c81e868261a740d44182))
* add column visibility menu component ([010be20](https://github.com/lattice-php/lattice/commit/010be2072fb2a3f188b118048a172f5d8dc4dc01))
* add toggleable() opt-in to table columns ([4779340](https://github.com/lattice-php/lattice/commit/47793406af8bcaba4539b4d33ec2c04f04c7542b))
* add useColumnVisibility hook ([995a3d5](https://github.com/lattice-php/lattice/commit/995a3d5e4c2ebb11d559d3b4656d4226dc25718c))
* render toggleable column visibility menu in tables ([a5afb26](https://github.com/lattice-php/lattice/commit/a5afb26d8b4e41d263f69963680e8500255786b3))
* toggleable (show/hide) table columns ([2fa4377](https://github.com/lattice-php/lattice/commit/2fa43776ddd3577c7f23be3cc1e7aa25c19615c2))


### Refactoring

* keep resize widths for surviving columns on self-heal ([45fbedc](https://github.com/lattice-php/lattice/commit/45fbedcf67f8a43fcb551e346bff729d864e5c2b))


### Documentation

* document toggleable table columns ([b17b1dd](https://github.com/lattice-php/lattice/commit/b17b1ddbe8e7591e555a8a25c6d53f9a3f1bc200))

## [0.12.0](https://github.com/lattice-php/lattice/compare/0.11.0...0.12.0) (2026-06-22)


### Features

* add copyable modifier to the Text component ([f22a013](https://github.com/lattice-php/lattice/commit/f22a013d4dec1e9e7e628f76485671c8eec0d2d5))


### Bug Fixes

* make modal open prop reactive to server-driven changes ([7ecf944](https://github.com/lattice-php/lattice/commit/7ecf94478c7ef4c17c0a2f5a5cd90aa40fdc1880))

## [0.11.0](https://github.com/lattice-php/lattice/compare/0.10.0...0.11.0) (2026-06-21)


### Features

* add time and datetime form fields ([c5fe36c](https://github.com/lattice-php/lattice/commit/c5fe36c859433f270c72d86c7a79b8f1bc8c9a0c))
* add zag date form components ([407e438](https://github.com/lattice-php/lattice/commit/407e4384dab8d3a9c1cdf6ee4c71fdc55a432162))
* register the lattice translation namespace for consumers ([cfe1185](https://github.com/lattice-php/lattice/commit/cfe1185819df53ba392da98519412350f7e79129))
* render zag date form controls ([2357c7e](https://github.com/lattice-php/lattice/commit/2357c7e783686f1d479e8ef57578021e3cb3e77c))


### Bug Fixes

* add closure types flagged by rector in array_any/array_all calls ([ef995ea](https://github.com/lattice-php/lattice/commit/ef995eaa426cdfc61ebe246921b3fa69779a5f09))
* polish date picker display behavior ([1433507](https://github.com/lattice-php/lattice/commit/1433507a1c3e72cb4d6719d7b038a0e4cda35fd6))
* restore date picker browser input ([e69a9c6](https://github.com/lattice-php/lattice/commit/e69a9c60aa5d12711fee8d1a8013ef30f600d7cd))


### Performance

* lazy load date picker control ([9e7cd37](https://github.com/lattice-php/lattice/commit/9e7cd373b63bfb7213b83b9634333efeb1f433fd))


### Documentation

* document date time form fields ([58d2a13](https://github.com/lattice-php/lattice/commit/58d2a13e081a5de84572fea7660e3980b6651aea))

## [0.10.0](https://github.com/lattice-php/lattice/compare/0.9.0...0.10.0) (2026-06-19)


### Features

* add toggle form field ([cbba72c](https://github.com/lattice-php/lattice/commit/cbba72cc00b4fdadabfc21165f3615a319682597))


### Bug Fixes

* **icon:** let an explicit size override the sprite baseline, add 2xl–4xl ([22544ed](https://github.com/lattice-php/lattice/commit/22544edd133dfb3c41f91638ad2cc234799e000b))

## [0.9.0](https://github.com/lattice-php/lattice/compare/0.8.0...0.9.0) (2026-06-19)


### ⚠ BREAKING CHANGES

* **layouts:** bind MenuItem and Link to actions with sealed context
* **effects:** ActionResult::redirect() is removed; use to() instead. ActionResult now exposes the full effect vocabulary (openModal, resetForm, download, toggleSidebar, Translatable toasts) and the same navigation verbs as LatticeResponse (to/toRoute/back). Navigation on ActionResult emits a RedirectEffect (resolved server-side) rather than a real HTTP redirect; the wire format is unchanged.
* **context:** own context on the definition instance, symmetric across render and endpoints

### Features

* **context:** own context on the definition instance, symmetric across render and endpoints ([0220d01](https://github.com/lattice-php/lattice/commit/0220d0101cfa5bdf933a37b54f0b0427b30cab21))
* **forms:** constrain a Choice to its configured options automatically ([3aa0db2](https://github.com/lattice-php/lattice/commit/3aa0db2c561cdc81867d3b787bf773e62c7219ef))
* **layouts:** bind MenuItem and Link to actions with sealed context ([b26b313](https://github.com/lattice-php/lattice/commit/b26b313be4776c7d0985b151d55f78f0ff74a18e))
* **testing:** add InteractsWithLatticeComponents endpoint helpers ([c0588f0](https://github.com/lattice-php/lattice/commit/c0588f024500c5962628742274bd53909dd653dc))
* **testing:** first-class endpoint testing helpers ([76a2c23](https://github.com/lattice-php/lattice/commit/76a2c237834ea42d9d964a7364b69c0108e2c934))


### Bug Fixes

* **pages:** resolve route arguments and bound models on directly-returned pages ([3136ff6](https://github.com/lattice-php/lattice/commit/3136ff66a2ff8fc6fcd422135224808e6c315559))
* **pages:** resolve route arguments and bound models on directly-returned pages ([6e89341](https://github.com/lattice-php/lattice/commit/6e89341480bc2c102ef010e2a4e409a8cc7a85d7))


### Refactoring

* **effects:** unify ActionResult and LatticeResponse effect builders ([638af63](https://github.com/lattice-php/lattice/commit/638af6380f15688a9cb5aba508227ff948472df3))
* **workbench:** drop now-unused Request param from context resolvers ([38bc66f](https://github.com/lattice-php/lattice/commit/38bc66f44831eda1067f5d4f158af31fdbae1c14))


### Documentation

* **actions:** sync effects reference with the unified builder ([37ecbcd](https://github.com/lattice-php/lattice/commit/37ecbcdb2045fc7c649765efe7052bede18a3d4e))
* add closure evaluation and cli references ([a9d5058](https://github.com/lattice-php/lattice/commit/a9d5058595521e05ea435dd488d4f61f223a149e))
* add closure evaluation and CLI references ([9b5a73c](https://github.com/lattice-php/lattice/commit/9b5a73c88ab25a7d0746d588a198fad9b6cac49e))
* **boost:** fix obsolete attribute names in shipped guidelines ([9277e90](https://github.com/lattice-php/lattice/commit/9277e90009106c8093eb7d8727d65b853d730679))
* correct obsolete and inaccurate API references ([1c23734](https://github.com/lattice-php/lattice/commit/1c23734ad95d01eebc3a368b46b5818ac20abb1f))
* correct obsolete and inaccurate API references ([37c0c8a](https://github.com/lattice-php/lattice/commit/37c0c8a5f683f599e6c6a7b5440c3752e90efb91))
* **testing:** document endpoint helpers, dogfooding, and coverage badges ([92a5a34](https://github.com/lattice-php/lattice/commit/92a5a3403c61c2df0c56b6810352aecbd0718ca4))

## [0.8.0](https://github.com/lattice-php/lattice/compare/0.7.0...0.8.0) (2026-06-19)


### Features

* resolve page render() dependencies through the container on the responsable path ([488944b](https://github.com/lattice-php/lattice/commit/488944bc0784e185c927047cc87eb649f9014da1))
* resolve page render() dependencies through the container on the responsable path ([b628e8b](https://github.com/lattice-php/lattice/commit/b628e8b955c2ba6198a6a5ae3252742c8565ee7d))
* **tabs:** add alignment modifier to the Tabs component ([0201e64](https://github.com/lattice-php/lattice/commit/0201e64d4f2d7b403f5a1585da09d95e451a2270))
* **tabs:** add alignment modifier to the Tabs component ([1510c08](https://github.com/lattice-php/lattice/commit/1510c08b322421e43a3727fe3b4f04cdd29ea7f4))

## [0.7.0](https://github.com/lattice-php/lattice/compare/0.6.0...0.7.0) (2026-06-19)


### Features

* apply appearance changes in the Provider for turnkey theme switching ([9ebe5e8](https://github.com/lattice-php/lattice/commit/9ebe5e8a446154cf26acfdc852c7e25aa53f0628))
* **console:** add definition generators and consolidate the JS registry ([1577560](https://github.com/lattice-php/lattice/commit/1577560085d65fe305acce2a971912452520f147))
* definition generators (page/form/table/action/…) and a single JS registry ([bc63740](https://github.com/lattice-php/lattice/commit/bc6374022c9924f3c59d0ff61c861200d762df8c))
* **provider:** apply appearance changes so theme switching needs no app wiring ([5ae9f9b](https://github.com/lattice-php/lattice/commit/5ae9f9b6295cdbf7c160a66ef445b25db9a1fc46))

## [0.6.0](https://github.com/lattice-php/lattice/compare/0.5.0...0.6.0) (2026-06-19)


### Features

* generalize the form response into a reusable LatticeResponse ([af034c0](https://github.com/lattice-php/lattice/commit/af034c04c72d828b29822eb7ab3dd8906c9be6f9))
* **http:** generalize the form response into a reusable LatticeResponse ([b6492c7](https://github.com/lattice-php/lattice/commit/b6492c77f0b9f16f69a5be16dc874b0d72ec3ded))
* **i18n:** add a client timezone store resolving server, browser, then UTC ([1ee4c5a](https://github.com/lattice-php/lattice/commit/1ee4c5a744b358e85479b071c5be1afeefbe6fa4))
* **i18n:** carry an optional timezone on I18nConfig ([23d0a09](https://github.com/lattice-php/lattice/commit/23d0a0943b38ced7d111c3e505e028251883229e))
* **i18n:** carry the timezone through the frontend config store ([163f389](https://github.com/lattice-php/lattice/commit/163f389dccddc52a38873bf9e435e815bec05a0e))
* **i18n:** deliver the user timezone preference via SetLocale middleware ([92e154b](https://github.com/lattice-php/lattice/commit/92e154bb08f435777ac024df403271563c19e27f))
* **table:** format dates in the active locale and timezone ([d272c40](https://github.com/lattice-php/lattice/commit/d272c40ff89a745f97a598b0e53e045cd179c659))
* **table:** render date cells with a timezone-aware DateTime tooltip ([24bad30](https://github.com/lattice-php/lattice/commit/24bad308b2e6543a1c793ed600368109dd811040))
* **table:** replace date format tokens with Intl style presets (date/time/dateTime) ([1c0dc11](https://github.com/lattice-php/lattice/commit/1c0dc11d8e7a2cbd728e9b519d6c971d78bb03a9))
* timezone-aware datetime display + Intl date formatting ([2d4a8ad](https://github.com/lattice-php/lattice/commit/2d4a8ad0f1fe0d80b6515a99eafa2c816e979c5d))
* **workbench:** store a timezone preference on the user ([ff9a082](https://github.com/lattice-php/lattice/commit/ff9a082225f84c6ed7aa0a3d850b126c21c8b060))


### Bug Fixes

* **i18n:** accept page-prop configs that omit the optional timezone ([7f0e52a](https://github.com/lattice-php/lattice/commit/7f0e52a40e30704633412910d64644791b9232a4))
* **table:** call PlainTextCell hooks before the date-branch return ([5e85c76](https://github.com/lattice-php/lattice/commit/5e85c76d5fc5c105efd8e43f2b95a88e026607b0))
* **test:** narrow anonymous user preferredTimezone return type for PHPStan ([c069882](https://github.com/lattice-php/lattice/commit/c069882dc5e751d4c3b5adfa2fdb1a31796de532))


### Refactoring

* **i18n:** drop the duplicate test-only config timezone getter ([a562d93](https://github.com/lattice-php/lattice/commit/a562d93905fb135effc6d0e69a6dcec9265a3197))

## [0.5.0](https://github.com/lattice-php/lattice/compare/0.4.0...0.5.0) (2026-06-18)


### Features

* createLatticeApp helper, Responsable pages, and optional realtime peer build fix ([7e1b06c](https://github.com/lattice-php/lattice/commit/7e1b06c5552e21e3d8b2cb71b283c48c4244c053))
* expose the remote plugin via package exports ([2c7672b](https://github.com/lattice-php/lattice/commit/2c7672b4b1277c9f1014aa0844daae087b56c653))
* fluent form response helpers and an OTP field ([b081674](https://github.com/lattice-php/lattice/commit/b0816747a75ff670b129538ab3c0e3b5b0404bb2))
* **form:** add an OTP field and InputOTP primitive ([bc7d54c](https://github.com/lattice-php/lattice/commit/bc7d54cf5a7fcbd9f2cf9af394832f7cb82d7420))
* **forms:** add fluent response helpers to FormDefinition ([e86e4db](https://github.com/lattice-php/lattice/commit/e86e4db97c96b59b0b84b3366544024c40ffd6d5))
* **inertia:** add createLatticeApp to bootstrap an app with the lattice shell ([5fc6d8e](https://github.com/lattice-php/lattice/commit/5fc6d8e1c81568d22044ef6416dbaf68082ed005))
* responsive sidebar with off-canvas mobile drawer ([56c76ef](https://github.com/lattice-php/lattice/commit/56c76ef72628dee3b6e7372e9e3420b546346d43))
* responsive sidebar with off-canvas mobile drawer ([d915676](https://github.com/lattice-php/lattice/commit/d915676725e7f1e0df73cee7b454313efb7b7d4f))
* **tables:** badge + multiple text-column modifiers for relation values ([5a56601](https://github.com/lattice-php/lattice/commit/5a566018eaf2670499dc15c49d989aaa921bee39))
* **tables:** relation columns — dotted to-one keys + badge/multiple modifiers, decoupled from Eloquent ([ab2e1a5](https://github.com/lattice-php/lattice/commit/ab2e1a555a1559263bcb9bea23a6406eaaf9dc3a))
* **tables:** relation columns by dotted key (with/whereHas/subquery sort) ([877c8de](https://github.com/lattice-php/lattice/commit/877c8de267d08456135b06fac5183ce2d1962a01))
* **testing:** type the assertion callbacks so closures infer their scope ([4fbc12b](https://github.com/lattice-php/lattice/commit/4fbc12be5d9a5e4bf67d1832e19f6e5c0cd11091))


### Bug Fixes

* **components:** chain base prop decoration in IsInteractive ([e304353](https://github.com/lattice-php/lattice/commit/e304353d04122174c7f23c2cce27af25c275f311))
* **forms:** trim whitespace in client-side blank check ([e225dae](https://github.com/lattice-php/lattice/commit/e225dae70d6eb555acb366c15b0e9149d1860364))
* **rector:** pin the php set to 8.4 so local and CI agree ([6a59455](https://github.com/lattice-php/lattice/commit/6a59455431e3dd9f54b0fd1bde6b9c66b39731b9))
* render icon Button label as sr-only text instead of aria-label ([5f6a638](https://github.com/lattice-php/lattice/commit/5f6a6381c0bc5c4e1ffcac08c4745384f4ec4cb9))
* **vite:** stub absent optional realtime peers so consumer builds succeed ([4afc26d](https://github.com/lattice-php/lattice/commit/4afc26d58838ffa31bc8dd7e24afa3e193ba5654))


### Refactoring

* **actions:** share the action-invocation flow via runAction ([26c3103](https://github.com/lattice-php/lattice/commit/26c310334d8e654046f45bf4b0ecbdf3ea60b64c))
* **chat:** unify the chat-box into one remote-capable component ([0daf764](https://github.com/lattice-php/lattice/commit/0daf7647546179052d85c8729ace89433316cc6f))
* **chat:** unify the chat-box into one remote-capable component ([bff4d24](https://github.com/lattice-php/lattice/commit/bff4d2460eafad80c57e6d563d8824d28af1d6c8))
* **components:** render data-lattice-component from node identity ([900c0b5](https://github.com/lattice-php/lattice/commit/900c0b58d512f4a704ea6696f615606bd57d7d61))
* **core:** extract shared toNodes helper ([76b4c52](https://github.com/lattice-php/lattice/commit/76b4c52344e8c25b6b5e53da3719c53703c79520))
* **effects:** declare wire types by string, drop the EffectType enum ([b847a0e](https://github.com/lattice-php/lattice/commit/b847a0ec99b149a59667dfcc21a9b4b9a4542e7e))
* **effects:** drop the EffectType enum and dead Action.effects; share action invocation ([7751bcc](https://github.com/lattice-php/lattice/commit/7751bcc997a1efa32ac3e5a63c6721333f0aeaa8))
* **forms:** inline applyPrefillValue ([57323fe](https://github.com/lattice-php/lattice/commit/57323fe8106bd4957434345576579d792e7cc004))
* **table:** single-source the empty filter-member rule ([d8c6a43](https://github.com/lattice-php/lattice/commit/d8c6a43b28c10cf2f47cac4b4e671cf0ac1af184))
* **tables:** make columns driver-agnostic; house the Eloquent driver in Sources\Eloquent ([54a81a2](https://github.com/lattice-php/lattice/commit/54a81a244c0ed06df1788c911ce9026109dca916))
* **tables:** trim docblocks that narrate the resolve() bodies ([8bcc591](https://github.com/lattice-php/lattice/commit/8bcc59119a63934479c79171db9edb2265c50054))
* **typescript:** drop unused 'field' discovery category ([2d4f7f2](https://github.com/lattice-php/lattice/commit/2d4f7f23172039b107ad5386a1e8be5a5a304a95))


### Documentation

* add flow diagrams to forms, tables, fragments, and actions ([6df7ca2](https://github.com/lattice-php/lattice/commit/6df7ca25252f6fa8afdb0cc48764d17a6b79d406))
* add flow diagrams to forms, tables, fragments, and actions ([b1da78b](https://github.com/lattice-php/lattice/commit/b1da78b3c001270476575c509138ca63cd4b265a))
* clarify actors in the remote flow diagram ([5faf8ca](https://github.com/lattice-php/lattice/commit/5faf8cad954f5f5f8fd1f4f40b281c29a71c7f6a))
* close coverage gaps and generate the enums reference ([154faac](https://github.com/lattice-php/lattice/commit/154faac4a05c280a2197ede1de5a98d0f74a45bf))
* close coverage gaps and generate the enums reference ([36f83e3](https://github.com/lattice-php/lattice/commit/36f83e39dcf590b19fc3c223cc2bd8b927f44f23))
* document the Remote feature ([7d4625c](https://github.com/lattice-php/lattice/commit/7d4625cee5c77db951f54cbafd93b5be2589828a))
* document the Remote feature ([d3637a0](https://github.com/lattice-php/lattice/commit/d3637a09931d4e297d069d963caef5e451cce9c3))

## [0.4.0](https://github.com/lattice-php/lattice/compare/0.3.0...0.4.0) (2026-06-17)


### Features

* accept Translatable in toast messages ([bcb241c](https://github.com/lattice-php/lattice/commit/bcb241c372f622863af0b7ed8ee0e9f29518bdf7))
* add browser token integration component ([e6ff5ca](https://github.com/lattice-php/lattice/commit/e6ff5caa0dcbe379d1c7f98ed5da2257fb71f73e))
* add buildEffects resolver for real-time listener effects ([90208ca](https://github.com/lattice-php/lattice/commit/90208caa1edb2a6f61924f5c3374265415b55443))
* add integration registry ([95a445f](https://github.com/lattice-php/lattice/commit/95a445f4b62eed9c8f77b7b8c58ceb398043524b))
* add integration token endpoint ([cd571b3](https://github.com/lattice-php/lattice/commit/cd571b30ca1c3aad49a20cad07f4ecf403e6d396))
* add Listen builder for real-time page listeners ([c798b95](https://github.com/lattice-php/lattice/commit/c798b9569661039b5774b309dfc66c6d1b62cecd))
* add remote schema sources ([fa98383](https://github.com/lattice-php/lattice/commit/fa9838342840bc90ae8653e93189b6a5cdbd0428))
* add table filter clause options ([9bb6e46](https://github.com/lattice-php/lattice/commit/9bb6e46af48c19bdf3ce52718b982ed383003afe))
* add Translatable value object and rt() helper ([7048549](https://github.com/lattice-php/lattice/commit/7048549302d47dae314bcdc667185fc42caa6a32))
* demo browser token integrations in chat ([580b0e3](https://github.com/lattice-php/lattice/commit/580b0e3154eb139f766d5ba85e7c4187ac01d975))
* **design:** expand rem-based design tokens and tighten component density ([9c2669f](https://github.com/lattice-php/lattice/commit/9c2669f3233b8dcfedda2beb5def59dc99348024))
* **design:** expand rem-based design tokens and tighten component density ([325d5a5](https://github.com/lattice-php/lattice/commit/325d5a50f1708176248947534119c26db00c1db0))
* **forms:** add prefix/suffix affixes to fields and menu items ([4ffc64d](https://github.com/lattice-php/lattice/commit/4ffc64dab4691ce6af694dc772c83c23ea1f6a78))
* **forms:** prefix/suffix affixes for fields and menu items ([d5f9cd5](https://github.com/lattice-php/lattice/commit/d5f9cd5352480aee343c54028a14a79cf4bf6d51))
* **layout:** add Topbar component with sticky and float modifiers ([0b64c83](https://github.com/lattice-php/lattice/commit/0b64c83000a4517c055d99356ef17c5f59ef028f))
* **layout:** add Topbar component with sticky and float modifiers ([03c3998](https://github.com/lattice-php/lattice/commit/03c39988f4ae8630513146a1bc1b43b385f6e077))
* mount real-time listeners in the page host and export the API ([5c5d812](https://github.com/lattice-php/lattice/commit/5c5d812d880baddbc5db692593c0746e3ce76006))
* normalize integration schema ([ca7ca78](https://github.com/lattice-php/lattice/commit/ca7ca789d1b077ec4fb76d8d71ccb29803c09f5f))
* optional Reverb/Echo real-time (Phase 1) ([8a9f1bb](https://github.com/lattice-php/lattice/commit/8a9f1bb0fb84c733e5beb33e569d85e8cedc3c73))
* render remote data lists from row schemas ([08ed0aa](https://github.com/lattice-php/lattice/commit/08ed0aa266fc8cb906551fe3816f4416c09c167a))
* resolve integration schemas from external sources ([25d81a0](https://github.com/lattice-php/lattice/commit/25d81a09480221167b882f739f6524459d5a566e))
* serialize page listeners behind realtime config flag ([cb701a5](https://github.com/lattice-php/lattice/commit/cb701a562e0a5049e522caba6570a8f10973e9e2))
* show remote todo workbench example ([cd9ed6d](https://github.com/lattice-php/lattice/commit/cd9ed6d890a878df5422f24f88b7142b6c26d484))
* subscribe to Echo channels and dispatch listener effects ([9e7cbfe](https://github.com/lattice-php/lattice/commit/9e7cbfe5e26a03cf70411b93733803e9684b5790))
* support dynamic remote source keys ([a538a96](https://github.com/lattice-php/lattice/commit/a538a967479d9db324d144b921eb8abcbdaf6c71))
* **testing:** address components by class and assert nested props by dot path ([4af8382](https://github.com/lattice-php/lattice/commit/4af83828dee51da84fca275d85eec768fb32efa5))
* **testing:** address layout components by key and assert their props ([5494b43](https://github.com/lattice-php/lattice/commit/5494b436e4f4c223428e752dd40baf68005d1e8c))
* **testing:** address layout components by key and assert their props ([30772f0](https://github.com/lattice-php/lattice/commit/30772f0bc4501a7db8fe48a012f1f0157c39f05a))
* **workbench:** real-time demo page wired to Echo over Reverb ([6f8163f](https://github.com/lattice-php/lattice/commit/6f8163f73acff95f70ccbdea0e7fa529bc461b88))


### Bug Fixes

* address remote source review findings ([262c2e6](https://github.com/lattice-php/lattice/commit/262c2e6454eecd77c5c222a3ebebdfa9c7a74f61))
* **build:** export ./realtime/* and bump docs workflow to setup-node v6 ([7d2cb01](https://github.com/lattice-php/lattice/commit/7d2cb0174d244802c8e4fc45f7eb6e1694172bbe))
* **build:** export ./realtime/* and bump docs workflow to setup-node v6 ([fa9e28e](https://github.com/lattice-php/lattice/commit/fa9e28ec99830f567916eff88decdb8e7e70365c))
* constrain filled chat boxes to parent height ([dd05fec](https://github.com/lattice-php/lattice/commit/dd05fec0c646db1d649a7fbb946669990544673e))
* **forms:** wrap the focus ring around the whole affix group ([c40d75a](https://github.com/lattice-php/lattice/commit/c40d75a3f1f4f232de80895a1ff603e987e5009a))
* launch Reverb from the package root so CI finds the autoloader ([568df70](https://github.com/lattice-php/lattice/commit/568df70e66cbf662ca09a79c6dbfc2eb9029dba1))
* normalize component tokens and selectors ([a3b8d56](https://github.com/lattice-php/lattice/commit/a3b8d56597a23d1121bcd759920784f223245ffe))
* resolve Translatable toast messages on every effect path ([a14a23f](https://github.com/lattice-php/lattice/commit/a14a23fb97375003f993323a3067309df3090fd1))
* sync signed upload action payloads ([8021492](https://github.com/lattice-php/lattice/commit/802149201fbff6e8b3d13aa010f1f26e747b01b1))


### Refactoring

* consolidate remote integration components ([3159366](https://github.com/lattice-php/lattice/commit/31593665b678439b200572408d9401c8cfeb1459))
* drop redundant "lattice" from realtime listener naming ([5f3838a](https://github.com/lattice-php/lattice/commit/5f3838adb8f30319713f28fff6698536b43ddd65))
* generate realtime listener payload types ([f9777d7](https://github.com/lattice-php/lattice/commit/f9777d736986aed302a766a45485397a55297b24))
* rename integrations to remote sources ([5c971ab](https://github.com/lattice-php/lattice/commit/5c971abcfe202f9f1a233e3b20a4e8ad8774868e))
* **testing:** share the schema-assertion builder and flatten childPath ([4274f65](https://github.com/lattice-php/lattice/commit/4274f650d52130c6f5f125bd5ac29d3c1f28fa7b))
* **tests:** assert page and layout structure by type and key ([5f4be54](https://github.com/lattice-php/lattice/commit/5f4be5461bcab926cc7c0c84659300d121e09123))
* trim what-comment from realtime listeners host ([6dfb7ef](https://github.com/lattice-php/lattice/commit/6dfb7ef228d061f28ecfb36788abd453a0b12713))


### Documentation

* add per-page Open Graph social card images ([ab9ff01](https://github.com/lattice-php/lattice/commit/ab9ff01e3db72227c2917688084302cbac4b7de0))
* **forms:** correct MenuItem::icon() accessibility note ([37e8b55](https://github.com/lattice-php/lattice/commit/37e8b559b53cbf260b4bee22d186e907aa6ccff3))
* per-page Open Graph social card images ([16a3c56](https://github.com/lattice-php/lattice/commit/16a3c5670a71c22f36b1654a842d7eadf915d0da))
* **testing:** document class addressing and dot-notation props ([8cea565](https://github.com/lattice-php/lattice/commit/8cea5650f777669f2f7d1dc6a06941f0818a1392))

## [0.3.0](https://github.com/lattice-php/lattice/compare/0.2.0...0.3.0) (2026-06-16)


### ⚠ BREAKING CHANGES

* TextColumn::boolean() and ::numeric() are removed; use BooleanColumn and NumberColumn instead.

### Features

* -&gt;table() row layout modifier (HasRowLayout) ([00c641d](https://github.com/lattice-php/lattice/commit/00c641d055c7d2b2889047e0e7f44e1e0e1f270e))
* #[Page] attribute replacing the latticePage route macro ([605aa61](https://github.com/lattice-php/lattice/commit/605aa61d1f0f560cca66607f5b02e2b1be48f1f3))
* accept enums and associative arrays for select options ([0ad2615](https://github.com/lattice-php/lattice/commit/0ad261502bd0353c3e56007841f0b8476e12b1f5))
* add #[Page] attribute ([f3bd3e2](https://github.com/lattice-php/lattice/commit/f3bd3e21e6efd5d26339f6a9bca6f028f02fc267))
* add a Breadcrumbs layout primitive ([532bfc4](https://github.com/lattice-php/lattice/commit/532bfc405ad399426341b07ff6c28860538aa0e4))
* add a Dropdown layout primitive ([be98e1c](https://github.com/lattice-php/lattice/commit/be98e1c84e0061e3e31214e426edf1e41a29dbd8))
* add a server-configured UserMenu primitive ([adaae4b](https://github.com/lattice-php/lattice/commit/adaae4bc8c90a3e0e58483631749326e4efea5ec))
* add a shared layout popover ([b490eed](https://github.com/lattice-php/lattice/commit/b490eed680cc4566f7071b9c02780749dc626949))
* add async chart workbench examples ([70b0020](https://github.com/lattice-php/lattice/commit/70b0020d593a57b76bbaf3f8c50918d932b957e6))
* add callout client module and effect routing test ([4de6e10](https://github.com/lattice-php/lattice/commit/4de6e10daab03f3be3f7f48253125be05f8a8d61))
* add Callout value object ([2e8987e](https://github.com/lattice-php/lattice/commit/2e8987ec6963166ab5321b320562606e4f1d9d65))
* add CalloutEffect and Effect::callout factory ([18f3aa8](https://github.com/lattice-php/lattice/commit/18f3aa81bedd92434ed17961ba34eeca1cc36546))
* add Callouts layout slot component ([dc59b26](https://github.com/lattice-php/lattice/commit/dc59b2640442af8e8cc720f9acdc40a75864fee1))
* add column resize indicators and clamping ([e7523de](https://github.com/lattice-php/lattice/commit/e7523de9448a03d5c8b8ae3da8192696d433e716))
* add column resize indicators and clamping ([3de9ed7](https://github.com/lattice-php/lattice/commit/3de9ed7ae54ae05562518fda454625166e6bea5c))
* add defaultOpen and fill options to ChatWindow ([8369e17](https://github.com/lattice-php/lattice/commit/8369e17c8372c42003f4b5b22eabd8434a47f4e2))
* add discovery kinds map and key extractor ([809dbe8](https://github.com/lattice-php/lattice/commit/809dbe831d5b9590648ed518de390f3c86f56be4))
* add DiscoveryManifest that builds and caches resolved discovery ([90be2cd](https://github.com/lattice-php/lattice/commit/90be2cdd486a03289dcc162439a8b348f270f2a3))
* add EffectFlasher service and Effects facade ([e363649](https://github.com/lattice-php/lattice/commit/e3636495f7abe044a39c3bbe5d827bc3ae8993e8))
* add EffectRegistry as the effect discovery source ([8c29274](https://github.com/lattice-php/lattice/commit/8c29274587ecfcfed621a114a75d2df92c70a05a))
* add EvaluationContext for closure utility injection ([3af031f](https://github.com/lattice-php/lattice/commit/3af031f3eb70f790595212a8891d4b51c2405df2))
* add Evaluator service for reflection-based closure injection ([dd7cf4b](https://github.com/lattice-php/lattice/commit/dd7cf4bdd106b11203b85ae13da918252f8cc9cb))
* add FileUpload form field (config + rules) ([8ac3f19](https://github.com/lattice-php/lattice/commit/8ac3f194dfe0817d17f549529cac7953f573ecca))
* add FileUploadItem validation rule ([c1d95a8](https://github.com/lattice-php/lattice/commit/c1d95a845ffaa475b33c7efe1de3c18c3a5bd680))
* add floating panel primitive ([437b922](https://github.com/lattice-php/lattice/commit/437b922f99c8551de2137cd108ced2c1be2b7a81))
* add inline action groups ([f9c4ada](https://github.com/lattice-php/lattice/commit/f9c4adac64e9f974d4e85ba9dd45006a54254d38))
* add justify to Stack for flex space distribution ([20532e6](https://github.com/lattice-php/lattice/commit/20532e6b47760a7b9ed92ab1a37d6de1e3471234))
* add lattice vite helper ([8299d2f](https://github.com/lattice-php/lattice/commit/8299d2ff3734002b069a2696a3256a74e3f6b539))
* add lattice.files config ([13537ed](https://github.com/lattice-php/lattice/commit/13537ed46682f6e641b0a3ef7a90e5d5e609078a))
* add locale switching infrastructure ([4af45ef](https://github.com/lattice-php/lattice/commit/4af45ef327ecd7fce089833aac89c8709a5fe9f6))
* add locale switching infrastructure ([6008b97](https://github.com/lattice-php/lattice/commit/6008b97abd254643a4fe30b24a2436f931d743d3))
* add page-level layout() and container() overrides ([eecb27a](https://github.com/lattice-php/lattice/commit/eecb27add49e387dd9134759f7e65e4d4b712c10))
* add Recharts chart component ([2915b0f](https://github.com/lattice-php/lattice/commit/2915b0f103502eb96e29990bae8fe532c6f2f649))
* add reset control for custom table column widths ([3b81eed](https://github.com/lattice-php/lattice/commit/3b81eed7cbfea155006e52582213c7cc0da68fac))
* add resizable column layouts ([558a8d5](https://github.com/lattice-php/lattice/commit/558a8d58bf6ed77a7bb0d0d5864cb8b3679fae46))
* add resizable column layouts ([90d10d5](https://github.com/lattice-php/lattice/commit/90d10d52ba8a7831b8ab53b37254bb487bee5039))
* add reusable info-tooltip component ([6dd3096](https://github.com/lattice-php/lattice/commit/6dd3096be1cdc83947e55f97b8727c8b97ed3186))
* add signed upload URL generation to FileUpload ([6bdf83c](https://github.com/lattice-php/lattice/commit/6bdf83c27e589f904c81277b8943a979eba48608))
* add the frontend effect handler registry and dispatch core ([3fbf6d2](https://github.com/lattice-php/lattice/commit/3fbf6d2e16940aac08971eb456b89406ed4b89e5))
* add tooltip to form fields ([0dba248](https://github.com/lattice-php/lattice/commit/0dba2488382b8648ce9217c819b5c032a51425da))
* add UnresolvableEvaluationParameter exception ([7f3955d](https://github.com/lattice-php/lattice/commit/7f3955d78ce291c9ee40123be0a10c66e412eea3))
* add unseal to the component reference signer ([cc40f93](https://github.com/lattice-php/lattice/commit/cc40f937d3664beae0daf5ab3b7c82394d827b08))
* add workbench product images ([486e4e4](https://github.com/lattice-php/lattice/commit/486e4e4c2761854edb25a05e144ee920bb31bbc1))
* add workbench product images ([6b21233](https://github.com/lattice-php/lattice/commit/6b21233028b2f1c34cba285398a80fafdb6f951f))
* add workbench translations ([e5ccde1](https://github.com/lattice-php/lattice/commit/e5ccde106ddd960fc4895aac7e523f0eed5ee745))
* allow #[AsEffect] to take an EffectType or a raw string ([dd0a7ae](https://github.com/lattice-php/lattice/commit/dd0a7ae7606c2f0fc9d04ff4071f892238574a5c))
* allow removing existing files in the FileUpload renderer ([54492f0](https://github.com/lattice-php/lattice/commit/54492f00eb4cec055cf650492793a6552f65b397))
* apply per-column alignment generically in header and cells ([2edd387](https://github.com/lattice-php/lattice/commit/2edd3879ebf4b487baaf3d900a695fc01d1240aa))
* back a Select's options with an OptionSource (Eloquent without coupling) ([cd9dfba](https://github.com/lattice-php/lattice/commit/cd9dfbacc31c74441794f402c2e03f6df8791d7f))
* bare field rendering inside table cells ([6c1cc57](https://github.com/lattice-php/lattice/commit/6c1cc5796f30c9f47f708d1791a7d2f818d48a86))
* block add-menu for the Builder ([909ca1c](https://github.com/lattice-php/lattice/commit/909ca1c7919090590e549c02bb2f3321930bca2e))
* Builder field (polymorphic line-items) ([1052175](https://github.com/lattice-php/lattice/commit/1052175b57a8d41c4a612c2e373bd7e2a575ac84))
* Builder renderer + registry wiring ([baa37a2](https://github.com/lattice-php/lattice/commit/baa37a2ff86d19c902f5e9ed0c2192439b559f77))
* callout effect + generic effect-flash channel ([732e6e9](https://github.com/lattice-php/lattice/commit/732e6e9cc56fa9528e6730e89d1df85bc418fff5))
* **chat:** ChatWindow component + registry wiring + types ([6bd97f1](https://github.com/lattice-php/lattice/commit/6bd97f117a998cd7d854676c6d3002e9dd2c7185))
* **chat:** composable chat components (role+parts, useChat, floating widget) ([6f51824](https://github.com/lattice-php/lattice/commit/6f51824b455a58c3e83ae1a986b1df942cd16635))
* **chat:** generate ChatMessage, ChatPart union, and ChatRole from PHP ([c901f5b](https://github.com/lattice-php/lattice/commit/c901f5bd3c96c71000df766aa934c76d19c6ff11))
* **chat:** headless useChat turn manager + foldFrame reducer ([84f8263](https://github.com/lattice-php/lattice/commit/84f8263fd7fad5f49d9266b1381ae03badd0690d))
* **chat:** message + part + transport types ([6255a48](https://github.com/lattice-php/lattice/commit/6255a48459f3d9e71bc379fd260649055c182554))
* **chat:** Message component ([6fc1665](https://github.com/lattice-php/lattice/commit/6fc1665f6eb7624278cf0a051ad10bc23d1179f2))
* **chat:** MessageList component ([e2e02ee](https://github.com/lattice-php/lattice/commit/e2e02eeeddd6d27c4c38e2e39a9fe2cf386cdb39))
* **chat:** ndjson chat transport ([ef18db0](https://github.com/lattice-php/lattice/commit/ef18db0e1cdaa94655fda69da5d5c3919534bc60))
* **chat:** part registry + plain-text part ([a9de360](https://github.com/lattice-php/lattice/commit/a9de360f1c1f81b03c0dc6b4cadb77b07b4c7bf9))
* **chat:** PromptInput component ([c7e8c0c](https://github.com/lattice-php/lattice/commit/c7e8c0c8e01bc7bfdc9904471a25aba5def84ed6))
* **chat:** typed chat message value object and role enum ([1aedbee](https://github.com/lattice-php/lattice/commit/1aedbeebb7a1240b8b4aefa31a9420e6f4f9eae8))
* **chat:** typed chat part value objects and registry ([99ae824](https://github.com/lattice-php/lattice/commit/99ae8243001d02fb52b88892aef8488d90bcdcda))
* **chat:** typed ChatMessage/ChatPart backend driving TS generation ([300ee0c](https://github.com/lattice-php/lattice/commit/300ee0c2ae512135425095c71ca88392bb2d2a5c))
* column & relationship select filters (+ searchable) ([7e56c44](https://github.com/lattice-php/lattice/commit/7e56c442c28854a6da19b1bbc3abc1c284fa069a))
* column alignment & numeric/money formatting ([f9344c5](https://github.com/lattice-php/lattice/commit/f9344c5c86fa72d6828f6626471076970563c6e0))
* column select filters with fixed options ([894a8f4](https://github.com/lattice-php/lattice/commit/894a8f400cae8cea09efb44db51ceb4588528270))
* compose layout dropdown triggers ([78a9077](https://github.com/lattice-php/lattice/commit/78a9077e8f710d903c6c7fb1f7d9917cdf720dff))
* compose layout dropdown triggers ([5ddc4f8](https://github.com/lattice-php/lattice/commit/5ddc4f816e15027d3323bd51b9ccd06e63fbe975))
* consumer-defined per-row actions for Repeater and Builder ([0bb9c9a](https://github.com/lattice-php/lattice/commit/0bb9c9a6a899b2d1bd0df98e644c789c88491630))
* dedicated table filters ([749b1b3](https://github.com/lattice-php/lattice/commit/749b1b33eb0c2f8dcd3ee0110cbbd5773d18a72c))
* dedicated table filters (select, ternary, date range, custom) ([39fc8eb](https://github.com/lattice-php/lattice/commit/39fc8eb39742426d5e6e4ca691b1f40a5283c5cf))
* dirty-aware prefill applier in the generalized form resolver ([f9388cd](https://github.com/lattice-php/lattice/commit/f9388cd22b6dc607f31ed582a8cc35d3179a799e))
* dispatch _upload sub-request for signed file uploads ([1d5e049](https://github.com/lattice-php/lattice/commit/1d5e04992cac96e94afda564679733a1426a85d3))
* drain flashed effects via useFlashEffects, drop toast-only flash ([653c1c7](https://github.com/lattice-php/lattice/commit/653c1c7a14a48ecefb55e3d7f3da19f50e924efb))
* editable computed-default field values (price prefill) ([de85b78](https://github.com/lattice-php/lattice/commit/de85b78daa2274b7910ab8daec0ea8d3a4a0d27d))
* editable computed-default via value(fn, editable: true) ([14ee738](https://github.com/lattice-php/lattice/commit/14ee738460450b495bf1491121e5fdf486471343))
* evaluate row-scoped client conditions ([4454c14](https://github.com/lattice-php/lattice/commit/4454c1444af4fe8e51b944c5dee9c89d494e4569))
* expose Evaluator via Evaluate facade ([ede1fcb](https://github.com/lattice-php/lattice/commit/ede1fcb2831e375c890d3c92858bd1289f8dc681))
* field tooltips ([06eb238](https://github.com/lattice-php/lattice/commit/06eb23851e3cda6bc299f665c951ad133f815425))
* file/image upload form field ([7f361b4](https://github.com/lattice-php/lattice/commit/7f361b4d5caa2992c5fcdbb241ecef522538def3))
* finish page layout override demo ([ea2c4d7](https://github.com/lattice-php/lattice/commit/ea2c4d7e3a08b4f9b208ddac98a9ec701864b4dd))
* FLIP reorder animation hook ([99e794c](https://github.com/lattice-php/lattice/commit/99e794c806541b3a51ba679afbfebfea1cf882d0))
* **form:** make password input a controlled field supporting prefilled values ([fa822a9](https://github.com/lattice-php/lattice/commit/fa822a9bd014d0c2ae3fc0de78c333dbd73bc996))
* **frontend:** add a Combobox primitive and adopt it in selects ([1fb4cb9](https://github.com/lattice-php/lattice/commit/1fb4cb97ede80d50d8c3bc8674dbe21ec19d1fcd))
* **frontend:** add DropdownMenu primitive and adopt in menus ([4d89236](https://github.com/lattice-php/lattice/commit/4d89236bbee4ef60a739d8188939a7cbc93a05b7))
* **frontend:** unify control surface + extract a Combobox primitive ([a75c5a4](https://github.com/lattice-php/lattice/commit/a75c5a473fc4cb0af7e0ed7713c5d1c81fce7fc0))
* **frontend:** unify form and table control surface ([94050c6](https://github.com/lattice-php/lattice/commit/94050c6cfa1a70984b27ea0dbbc1fdeb919a7f53))
* gate workbench behind a login page with a locale-aware user ([96ee853](https://github.com/lattice-php/lattice/commit/96ee8535e0b7e6d445795e33ca05c131ec863007))
* generate wire value objects for ActionResult, TableQuery, TablePagination, I18nConfig ([a3416f1](https://github.com/lattice-php/lattice/commit/a3416f13cc13de7a993aafffee28516b4c329af6))
* implement FileUpload dropzone renderer ([45d1a9c](https://github.com/lattice-php/lattice/commit/45d1a9cb254e08aaf668aff6c488cf55c5bd4691))
* include svg sprite in vite helper ([fb2334d](https://github.com/lattice-php/lattice/commit/fb2334d87dedc251e74992e287bf7adb5904a251))
* layout chrome primitives (Dropdown, UserMenu, Breadcrumbs, Stack justify) ([1f6ea78](https://github.com/lattice-php/lattice/commit/1f6ea7821d8353b876c037fd871ad7479feb64b3))
* line-items table layout, reorder animation, and row actions ([538be9f](https://github.com/lattice-php/lattice/commit/538be9fa4d7ce7a5293ecaa226f8b6225191a035))
* make PageMetadata manifest-aware with array round-trip ([9eae409](https://github.com/lattice-php/lattice/commit/9eae4091eeef0499d9623a8f69afbb0ab2192a0f))
* make row fields server-aware ([777d295](https://github.com/lattice-php/lattice/commit/777d29570d819c87bf2e4b75ac4942c29f04dd46))
* MoneyCell formats currency from a static code or row field ([4623406](https://github.com/lattice-php/lattice/commit/462340617cc94012a5fe814eee3070fe223bf143))
* MoneyColumn with static and per-row currency ([75bba9d](https://github.com/lattice-php/lattice/commit/75bba9d53598addd73687a44b62a01b6babd86bc))
* NumberCell formats decimals and units via locale-aware Intl ([80abf4e](https://github.com/lattice-php/lattice/commit/80abf4ea459f72346b97cb9d05e6c6aada674952))
* NumberColumn unit via NumberFormatUnit enum ([d1a5fe0](https://github.com/lattice-php/lattice/commit/d1a5fe00d829af9f38622e52097cf2b4476aa279))
* page-level layout()/container() overrides + chat-reveal layout demo ([f6dde1f](https://github.com/lattice-php/lattice/commit/f6dde1f347da83d0b36158da1b142232f213c9a6))
* per-column alignment as a common ColumnData field ([efe71fa](https://github.com/lattice-php/lattice/commit/efe71fab3b3842637c1f92de8020c225eedae29a))
* persist stable row ids in useRowCollection ([fe52322](https://github.com/lattice-php/lattice/commit/fe523220152924974eaedd1f2e9e1701b58c4c90))
* pure helpers for collecting and applying prefill targets ([d6147ff](https://github.com/lattice-php/lattice/commit/d6147ff8040d0b2df1d343e79bc2fd54bbd58e59))
* read page layout/container from #[Page] attribute ([95ebb2f](https://github.com/lattice-php/lattice/commit/95ebb2f79bddd2f9e7c3d5fe11dddd0c8d3eccee))
* refine dashboard chart examples ([d7ccf50](https://github.com/lattice-php/lattice/commit/d7ccf503f7764e2fd92620f176f13e7746aa2b1e))
* register form.file-upload renderer + generated types ([1e28b74](https://github.com/lattice-php/lattice/commit/1e28b74dc61907361411be8b0135bf0ab91e1035))
* register page routes from #[Page] discovery ([c2e98ed](https://github.com/lattice-php/lattice/commit/c2e98ed25be5590be826a8bed6ad1a96f6d434f6))
* relationship-backed options for select filters ([ca96908](https://github.com/lattice-php/lattice/commit/ca969088aaad38922ff5550d41624465cd74696f))
* render callouts through a layout slot component ([8fabbd2](https://github.com/lattice-php/lattice/commit/8fabbd286012b85360311c000c424e5ae50b7b29))
* render field tooltip in form field frame ([62cf4ef](https://github.com/lattice-php/lattice/commit/62cf4ef03f2f6aa10156c24fe830c1e629e314f1))
* reset control for custom table column widths ([560393b](https://github.com/lattice-php/lattice/commit/560393bc437b7334eab90f071e6eb13e79660239))
* resolve effect handlers from the registry via context ([563011f](https://github.com/lattice-php/lattice/commit/563011fa8c41c4da0ab0289e61eee5d5c7f08477))
* resolve page metadata from #[Page] attribute hierarchy ([6556bf5](https://github.com/lattice-php/lattice/commit/6556bf5d50c3821a64513391700f68d1b0bf41d3))
* resolve registry definitions from the discovery manifest ([8a3b19d](https://github.com/lattice-php/lattice/commit/8a3b19d30eeaf475c7ffb099084e24ac6b4e184a))
* row-scoped prefill resolution on the form resolve endpoint ([af9c0ff](https://github.com/lattice-php/lattice/commit/af9c0ff1beb94b7424320b9d2a7b4fbf2f6a14c1))
* RowActions (inline single, kebab for 2+) ([19e62b0](https://github.com/lattice-php/lattice/commit/19e62b02e2639c762921a9c5e604ecb6f6047205))
* seal existing-file tokens and resolve removals in FileUpload ([a580339](https://github.com/lattice-php/lattice/commit/a5803394891d60e2e372b823e6953e7e13d99a64))
* searchable column select filters ([a8874f4](https://github.com/lattice-php/lattice/commit/a8874f48ed123a0a15e93923003971924b792508))
* searchable option round-trip for table select filters ([348c0af](https://github.com/lattice-php/lattice/commit/348c0afc92a2c2419784ba26ab728cae8cc91113))
* searchable select-filter combobox ([af88b64](https://github.com/lattice-php/lattice/commit/af88b6491f8692bb51dc0c039493abcfe37f266c))
* show the column reset control in repeater/builder row tables ([da89d16](https://github.com/lattice-php/lattice/commit/da89d16906b292868b4431394dea3ce7654f1f7d))
* **sidebar:** reveal item labels as a hover flyout when collapsed ([e4e3cd1](https://github.com/lattice-php/lattice/commit/e4e3cd1fd8be1311d6cdf7dd03ac0bd15efd5c60))
* skip page route registration when routes are cached ([9445159](https://github.com/lattice-php/lattice/commit/94451595e87cc6ce31d75970e33c4bfc461c4254))
* source page registry from the discovery manifest ([850befc](https://github.com/lattice-php/lattice/commit/850befc764eced6a379a036b82bb2f4d3431cfa3))
* stable row id helpers (withRowId/ensureRowIds) ([d0f3efa](https://github.com/lattice-php/lattice/commit/d0f3efa57aae54c6fb03cdc0ed18bf7111ce9c23))
* stable row keys + FLIP wiring in the line-items renderers ([3493fb7](https://github.com/lattice-php/lattice/commit/3493fb77955f6620bda4ae404c6ce5f6eadf8765))
* **stack:** add a height option for full-viewport layouts ([550c5a9](https://github.com/lattice-php/lattice/commit/550c5a937cd14e73e7ec2f7b6e5d1d77e3ec609e))
* **streaming:** generic stream component over @laravel/stream-react + workbench composed chat demo ([c0ba2c8](https://github.com/lattice-php/lattice/commit/c0ba2c80c2187eb1f6cfaafc15d9d705ae89b778))
* streamline lattice vite helper ([bd03f84](https://github.com/lattice-php/lattice/commit/bd03f847e9e93245ec7217b9d9d0d6ed08b840f5))
* support recursive form schemas ([67340bf](https://github.com/lattice-php/lattice/commit/67340bfb1ff515a29721b081d0f3c6cdf42dddac))
* support recursive form schemas ([66c715b](https://github.com/lattice-php/lattice/commit/66c715b2804711ab3327ee7e40999039c659ea1d))
* table layout for the Builder (columns + spanning rows) ([70ff764](https://github.com/lattice-php/lattice/commit/70ff764b18f38a4b67754c77e180a468cf80386e))
* table layout for the Repeater ([3ef87b8](https://github.com/lattice-php/lattice/commit/3ef87b82d48763362cc78dfd5dbb116aaba4fd24))
* TableRows accepts registerRow for FLIP wiring ([46c1285](https://github.com/lattice-php/lattice/commit/46c1285d7e51459223152d77b7a3b96136562bca))
* TableRows grid layout for line-items ([8ff1b1f](https://github.com/lattice-php/lattice/commit/8ff1b1f0c6e220341be39decbbd87e224baae402))
* **testing:** add action assertions ([b36829e](https://github.com/lattice-php/lattice/commit/b36829ee544940b08283f2210d81480d1a892a05))
* **testing:** add assertLatticePage HTTP entry ([67ca795](https://github.com/lattice-php/lattice/commit/67ca795237e2dabd0750fe68e60ff485a22c25a4))
* **testing:** add ComponentAssertions root and object entry ([d94981c](https://github.com/lattice-php/lattice/commit/d94981c1f55ebfb0d19323e18331a26b44b273b2))
* **testing:** add ComponentNode wire-tree value object ([a433a10](https://github.com/lattice-php/lattice/commit/a433a102ced6028d88f9afa363e7d04fbdbfbde8))
* **testing:** add form and field assertions ([a5bf591](https://github.com/lattice-php/lattice/commit/a5bf59137c6b95ca4d53098f3dc68ea3e3c772d8))
* **testing:** add table and filter assertions ([818b9de](https://github.com/lattice-php/lattice/commit/818b9de9709933f7672c24fd7136c315c5d44ce0))
* **testing:** AssertsLatticeComponents test helper ([6f673d9](https://github.com/lattice-php/lattice/commit/6f673d9a38fee3dbed31a71ee7316581b7e489b3))
* thread tooltip prop through field frame consumers ([16a9208](https://github.com/lattice-php/lattice/commit/16a9208fa0c5766989159e782f0ab7442da43541))
* uniform closure utility injection ([daaec0f](https://github.com/lattice-php/lattice/commit/daaec0ff486a75a71d99e5ef9e40ee8e54a160d9))
* **workbench:** add BusinessPartner + Address models and migrations ([8e8ad34](https://github.com/lattice-php/lattice/commit/8e8ad3456c0749729b4c749b46999843ceac5ca2))
* **workbench:** add Group model, migration, factory ([7f0f025](https://github.com/lattice-php/lattice/commit/7f0f0253bc01e33555f09af89eec67c79a6234d2))
* **workbench:** add PriceResolver with group-aware lowest-price resolution ([e20b62a](https://github.com/lattice-php/lattice/commit/e20b62a1ee7a6458505593a2c853032289c182b1))
* **workbench:** add SalesOrder + SalesOrderLine models and status enum ([f2dadd2](https://github.com/lattice-php/lattice/commit/f2dadd249e26ca8da589237022ed3709d2fa835a))
* **workbench:** add SalesPrice model and Product pricing relations ([2ff60db](https://github.com/lattice-php/lattice/commit/2ff60db211ffd399d8531a6a07cdade98360a96b))
* **workbench:** add the Lattice logo to the login page and sidebar ([5019693](https://github.com/lattice-php/lattice/commit/5019693c96cef761389ac0e6e2cdfe80385baab8))
* **workbench:** business partners management UI ([3391a67](https://github.com/lattice-php/lattice/commit/3391a67597f1e665ca91765b3e693cc06ee1c280))
* **workbench:** demo runtime layout switching with a chat-reveal toggle ([8c8a1c8](https://github.com/lattice-php/lattice/commit/8c8a1c8a220257a38861532d448d6deabdbb33ac))
* **workbench:** demo UserMenu, Breadcrumbs and a justify sidebar footer ([1e2cc35](https://github.com/lattice-php/lattice/commit/1e2cc359f6464f1bc2f1945290d29fa182dfe54b))
* **workbench:** gate workbench behind a login page with a seeded locale-aware user ([5b73af2](https://github.com/lattice-php/lattice/commit/5b73af25a4601bc7b002e8b14b8e50dd16309264))
* **workbench:** groups management UI ([2c01248](https://github.com/lattice-php/lattice/commit/2c01248cc1468844d451d374fa751b57b504601c))
* **workbench:** mount floating composable chat in the layout ([0ce885b](https://github.com/lattice-php/lattice/commit/0ce885b57636b5b8e379af9a1ca5694da319b808))
* **workbench:** sales orders UI with group-aware line pricing ([afcffcd](https://github.com/lattice-php/lattice/commit/afcffcde7bd90c2fc6e6664c8f6abc775f5cebe4))
* **workbench:** seed commerce groups, partners, prices, and orders ([1b6e9fc](https://github.com/lattice-php/lattice/commit/1b6e9fc0757a88b872ad804db28c54648c45c618))
* **workbench:** simulated conversation store + NDJSON agent + history endpoint ([891599b](https://github.com/lattice-php/lattice/commit/891599b91913d643e001167de1c08104ee5cb551))
* **workbench:** use extended-faker for realistic product data in dev ([6c514aa](https://github.com/lattice-php/lattice/commit/6c514aac711875ed1c02abcd2bd7b0002cce0933))


### Bug Fixes

* address row-action review feedback ([fe5d7f6](https://github.com/lattice-php/lattice/commit/fe5d7f648b2ef16c257650b11fc11c51009dadac))
* align condition evaluator parity ([3362805](https://github.com/lattice-php/lattice/commit/3362805c32d3532ffbe715930252eff74a1fdab5))
* allow removing unknown-block rows in the Builder ([b188466](https://github.com/lattice-php/lattice/commit/b1884665d3377936e6de3daab43268dd40a92b8d))
* avoid nullsafe-before-coalesce in PageMetadata for phpstan ([71def44](https://github.com/lattice-php/lattice/commit/71def4406c5c0f4ad7d0da993fbbafa4990d0c6e))
* **build:** externalize i18n runtime deps from the library bundle ([31725b1](https://github.com/lattice-php/lattice/commit/31725b1e62f2551b402aebddec6b179782a8a9fe))
* cancel pending FLIP frames on reorder/unmount ([9ec167a](https://github.com/lattice-php/lattice/commit/9ec167a8602ca170414a7d28a6a17f0fe2a6065d))
* **chat:** import default text part from Message so it renders in production ([48dbf2a](https://github.com/lattice-php/lattice/commit/48dbf2ab4101582503be87d5af46d4266985f619))
* default EloquentOptions value column to the model key ([049b87f](https://github.com/lattice-php/lattice/commit/049b87ff91668bfc9723cea4f67d433aeed8d2fc))
* enforce mime/size constraints on signed upload keys ([d1707dc](https://github.com/lattice-php/lattice/commit/d1707dcca5f6d5b7a8fee2ee31d49ff7e912e2b4))
* enforce temp-prefix on signed upload keys to prevent key substitution ([12769f7](https://github.com/lattice-php/lattice/commit/12769f750c40af40ebb8be25a02ff835aec5e7c7))
* expose typed FormData (row scope) to prefill resolvers for consistency ([6a3f6e2](https://github.com/lattice-php/lattice/commit/6a3f6e2c53da814af126d7002a955375009d414a))
* fall through to domain exception when container cannot resolve a typed evaluation parameter ([066353b](https://github.com/lattice-php/lattice/commit/066353b78b4864374e624facfb67bed848299ea2))
* handle array dependsOn conditions ([93a31a9](https://github.com/lattice-php/lattice/commit/93a31a93b14889943825840c4918cdc39770be8e))
* **i18n:** annotate the instance type for portable declarations ([c06095c](https://github.com/lattice-php/lattice/commit/c06095c88d29f165cd337652cf67a5db65fb0a2b))
* **i18n:** stop the locale-change flicker via preserveState reload + locale preload ([6c600d1](https://github.com/lattice-php/lattice/commit/6c600d196e2b2127221f3e03c503b739902b47f6))
* keep an sr-only accessible label for table cells ([a2e855e](https://github.com/lattice-php/lattice/commit/a2e855ed0ed8e30ef5b11d967a9830a7f57d9ade))
* keep Builder row memo by rendering the type input as a sibling ([668d9d3](https://github.com/lattice-php/lattice/commit/668d9d3df0c8730e39aa7f42078a9350e249746c))
* keep default text wire payload compact ([cbce17e](https://github.com/lattice-php/lattice/commit/cbce17e396d91316d1fa61cb671fa4a0bd5d4d01))
* keep popover menu items visible when the sidebar is collapsed ([a3e63c3](https://github.com/lattice-php/lattice/commit/a3e63c30392e3b337884a3d6f2bdfd38a7ad0427))
* keep Stack gap authoritative + add Lattice logo ([401892b](https://github.com/lattice-php/lattice/commit/401892b01ddca1de1b217c5cc328e5c866f1f7f7))
* keep Stack gap authoritative by not stretching grid rows ([71d07a8](https://github.com/lattice-php/lattice/commit/71d07a80e2d899a49f8807779023a598c7b2c35e))
* key page descriptors by class ([1b9066b](https://github.com/lattice-php/lattice/commit/1b9066b88d616a59b97d09fdd4c3e69fbf908de2))
* key prefill overrides by stable row id ([3f5ff91](https://github.com/lattice-php/lattice/commit/3f5ff9146ba877fef8b115e93bc67628d3a18814))
* limit file upload signing to regular forms (action forms submit JSON) ([21d1382](https://github.com/lattice-php/lattice/commit/21d1382d99c3a938e8a554619934ee898ce35620))
* make chat box fill non-nullable ([37d3c8d](https://github.com/lattice-php/lattice/commit/37d3c8dff04820140d7769287900cd02f72b55b6))
* make EffectRegistry re-registration idempotent ([de69571](https://github.com/lattice-php/lattice/commit/de69571e9e5cdd3cc0907a2588096bd60fcdd1fc))
* make existing FileUpload files display-only (no resubmission) ([cf36eb2](https://github.com/lattice-php/lattice/commit/cf36eb26266268921ff7e26d9aea99d283854826))
* **menu:** stretch button menu items to full width ([8f18f13](https://github.com/lattice-php/lattice/commit/8f18f13c6c807d5937474b433a0cb2713c36be16))
* persist column resize state ([9844382](https://github.com/lattice-php/lattice/commit/98443820b104ff29c6622f4f4d7aeffbf6f906a6))
* persist row ids in useLayoutEffect to stabilize ids before paint ([70772fd](https://github.com/lattice-php/lattice/commit/70772fd74716e2c7b1fb41dd7faac5f573fa6049))
* preserve rich editor links ([e205412](https://github.com/lattice-php/lattice/commit/e20541294414049de4a1ab28b03e299c13db1647))
* project table row payloads ([eef0ce2](https://github.com/lattice-php/lattice/commit/eef0ce271e4d3ccf9c2dcc36fe1df112743d99de))
* protect lattice endpoints by default ([1a8c417](https://github.com/lattice-php/lattice/commit/1a8c417529dab20f1e6ea7286eabf35ed69e5d08))
* refresh system appearance subscribers ([0f0840f](https://github.com/lattice-php/lattice/commit/0f0840fd65277ed5f214f8b8296e63b8c75b48b4))
* reject invalid table filter values ([a73a287](https://github.com/lattice-php/lattice/commit/a73a28770e5485c75888d10367dc84b64703dc29))
* remove stale menu npm export ([4a96798](https://github.com/lattice-php/lattice/commit/4a967986327068b016f56b009ed28741c401a83e))
* render non-GET menu items as button links ([e3482d3](https://github.com/lattice-php/lattice/commit/e3482d3644449340be88842c89300e221b3252fb))
* resolve circular import in Callouts slot via renderer context ([0891fdb](https://github.com/lattice-php/lattice/commit/0891fdbaad1b0818f36479580ad620a910f42ebe))
* resolve oxfmt from consumer app ([3e8e24a](https://github.com/lattice-php/lattice/commit/3e8e24a8c443a636c2062a37e7481371a60bcba8))
* resolve phpstan violations in file upload test wiring ([15b6a12](https://github.com/lattice-php/lattice/commit/15b6a12a38bd4fff9448fec97e1805950a76986c))
* scope FileUpload names, errors, and upload target to repeater rows ([86decf8](https://github.com/lattice-php/lattice/commit/86decf8901f1ed4bfe7f576bedcbf16925e456e4))
* set explicit text style defaults ([923b385](https://github.com/lattice-php/lattice/commit/923b385d243d3178cc01aef358d21cbbb1f8c822))
* stabilize workbench selectors and i18n ([ec1d61e](https://github.com/lattice-php/lattice/commit/ec1d61ee2531f4f96f31a14b98d3c0c2e6a87700))
* stabilize workbench translations ([d57a530](https://github.com/lattice-php/lattice/commit/d57a5309f22ba259a7eae3f23233cdadbad3a6e5))
* stop action effect double dispatch ([5898cbd](https://github.com/lattice-php/lattice/commit/5898cbd30bc81d7cf3e9f970cdc7fe8d7ddf3688))
* tighten TypeScript API boundaries ([5e72d4e](https://github.com/lattice-php/lattice/commit/5e72d4ec9a125efafcb144a049e0890f2ae21e89))
* **user-menu:** open the dropdown upward and align it when collapsed ([cb7844d](https://github.com/lattice-php/lattice/commit/cb7844d9eba7ed226a528e4f1bfed01a925116d2))
* validate final form submissions before handlers ([cec4df3](https://github.com/lattice-php/lattice/commit/cec4df32a82e3b8c84693f177e87a1772fde9647))
* **workbench:** collapse products table row actions into a dropdown ([c286bdd](https://github.com/lattice-php/lattice/commit/c286bdd43a7c97d79c77c6750228a5f87b0b5249))
* **workbench:** enforce single default sales price on the modal edit path ([11a5fa8](https://github.com/lattice-php/lattice/commit/11a5fa8566953e930b0167e08c709e9cd7948e53))
* **workbench:** make commerce seeders idempotent and price-independent ([0e58fc1](https://github.com/lattice-php/lattice/commit/0e58fc16e24c28f0a4602e8dbbd8f1c8713dc004))
* **workbench:** make sales order number generation terminate on collision ([2eaed8c](https://github.com/lattice-php/lattice/commit/2eaed8c8000c5ebf22211c212a19f71e51c610bb))
* **workbench:** products-table action dropdown + locale-change flicker ([d0a3076](https://github.com/lattice-php/lattice/commit/d0a30764b75e6fb961dcfc40cbc906548ff65687))


### Refactoring

* address [#111](https://github.com/lattice-php/lattice/issues/111) review feedback ([30bb53e](https://github.com/lattice-php/lattice/commit/30bb53e3042b066b2eaf83aa2e02dd0e9002fdd6))
* address locale switcher review ([7cca4e5](https://github.com/lattice-php/lattice/commit/7cca4e5201c5c5f9e42c27d510b168a5b7112f7b))
* align effect type shape with the node model ([3f322b7](https://github.com/lattice-php/lattice/commit/3f322b79bf7751ad83c5081563d635a4d7b30964))
* align fragment skeleton sizing names ([a388669](https://github.com/lattice-php/lattice/commit/a388669053cfa02274cfb0e3aeda856b2d703050))
* align PHP role attributes ([88dd6b0](https://github.com/lattice-php/lattice/commit/88dd6b030b95a81d6906d47d474e99f5fa332132))
* align PHP role attributes ([4acfde7](https://github.com/lattice-php/lattice/commit/4acfde78624c426e1d1c388eef6a995fb983519a))
* align product factory faker data ([49a4e4c](https://github.com/lattice-php/lattice/commit/49a4e4c55af6d06ad4d5cdfa40460ad21024ebd7))
* **attributes:** rename ComponentAttribute to DefinitionAttribute ([d2f8984](https://github.com/lattice-php/lattice/commit/d2f8984449e749e2583f74e0313d043a07f20f7e))
* **attributes:** resolve the component wire type in one place ([86997e6](https://github.com/lattice-php/lattice/commit/86997e66d850c3c035975b504cd3ff869317e0a6))
* build page routes in the provider from PageRegistry::all() ([17de128](https://github.com/lattice-php/lattice/commit/17de128c0b350ccb00cdf8b48a96a6eff6d6ff8f))
* build the collapsed-sidebar flyout on the shared Popover ([c4083ad](https://github.com/lattice-php/lattice/commit/c4083ad86d7dc10ef444ba53fa8fe9dc015e72d4))
* **chat:** drop AsChatPart's dead wire-type helpers ([ce7b8e1](https://github.com/lattice-php/lattice/commit/ce7b8e17978c6de9bfedec3a08c472d98e2fc817))
* **chat:** drop unused mergeChatParts export ([83069c6](https://github.com/lattice-php/lattice/commit/83069c69d3609a7d4b9d9f34a4e3a6b80c0f2215))
* **chat:** inline the redundant ChatPart alias ([7ac037f](https://github.com/lattice-php/lattice/commit/7ac037f32954309315f7f47e7470d31be695225e))
* **chat:** register chat parts through the plugin registry ([50dac2d](https://github.com/lattice-php/lattice/commit/50dac2d3522af15deaf5124b59ed94d31c0fd535))
* **chat:** render chat parts as components ([2e43db9](https://github.com/lattice-php/lattice/commit/2e43db96c11dbdbdefe68e502b560c4b6c972bb3))
* **chat:** route chat chrome through the lattice i18n namespace ([b81bd20](https://github.com/lattice-php/lattice/commit/b81bd200de2fce0c938821f58d17e9931b62f200))
* **chat:** share json-post headers via core/headers; drop chat→form coupling ([4608624](https://github.com/lattice-php/lattice/commit/460862449ebd7e70dffb9a8f33023915f8220d79))
* **chat:** ship tool-call as a built-in part renderer ([f2e90f8](https://github.com/lattice-php/lattice/commit/f2e90f8438960709a0a4306c9c4e92c685473e1f))
* **chat:** source ChatMessage, ChatPart, and ChatRole from generated types ([7df10a4](https://github.com/lattice-php/lattice/commit/7df10a42f163e8a84f2afe7531066c03941bbd16))
* clarify popover viewport offset ([4fe1966](https://github.com/lattice-php/lattice/commit/4fe196683aa70f24efad921cb5cf125cce2c1042))
* clarify prefill override keying ([46e5c75](https://github.com/lattice-php/lattice/commit/46e5c759b44d5cc47d239e8fae54a3eb2633d9b0))
* clean up line item form internals ([9bdf2ec](https://github.com/lattice-php/lattice/commit/9bdf2ec9e22b904c6d611616d8f2e7a61d7f922b))
* clean up line item form internals ([d490d45](https://github.com/lattice-php/lattice/commit/d490d45e08bbca148b5cc40185167a473f08c35c))
* collapse Effect hierarchy and unify the toast pipeline ([6edc716](https://github.com/lattice-php/lattice/commit/6edc7163881d254b4eb74b41ef8c0eac44451769))
* collapse Effect type hierarchy into AbstractEffect ([1785e2e](https://github.com/lattice-php/lattice/commit/1785e2eb2ad4bcb8685b76dc2e52128052a45ae7))
* collapse the Stack render into a single flex/grid path ([7164473](https://github.com/lattice-php/lattice/commit/71644736db648c908f6c7227681282273b6c1802))
* columns reflect public props (drop props VOs) + Boolean/Number columns ([247b924](https://github.com/lattice-php/lattice/commit/247b924022277678fc802914bdbfa4abda005daa))
* compose workbench locale switcher in layout ([6e46eb0](https://github.com/lattice-php/lattice/commit/6e46eb0752891b63b439178a8e883265430ebbcd))
* configure rustfs s3 disk via testbench.yaml + phpunit.xml ([458fa9a](https://github.com/lattice-php/lattice/commit/458fa9a9269ebd4dab47de829feab4e4f1922d95))
* consolidate discovery and drop config-key registration ([e0f3250](https://github.com/lattice-php/lattice/commit/e0f325014ae62eff630244f7c76ba2defbc1a574))
* consolidate discovery and drop config-key registration ([dfa153a](https://github.com/lattice-php/lattice/commit/dfa153a7f950bf1c7f2634774498177e1579252f))
* **core:** consume the component registry from context in the renderer ([2469e3a](https://github.com/lattice-php/lattice/commit/2469e3a93995b42f5de7a15942f49e6e4db0709c))
* dedupe filter option-source resolution and test doubles ([8746381](https://github.com/lattice-php/lattice/commit/8746381f6f21974390b72a54778cfb9a3d575cb0))
* discover workbench definitions instead of registering explicitly ([7ec82c9](https://github.com/lattice-php/lattice/commit/7ec82c9b1cf22a0c9b648180ec33d0a1937eae5f))
* drive discovery from the manifest and drop the cache store ([1beb61b](https://github.com/lattice-php/lattice/commit/1beb61bcc84076ab110df1b8e269e6802e254309))
* drop ad-hoc discovery in favor of the manifest ([810b7c5](https://github.com/lattice-php/lattice/commit/810b7c578f26395f25922a669ebf24043b20d0e4))
* drop ad-hoc discovery in favor of the manifest ([d291c4c](https://github.com/lattice-php/lattice/commit/d291c4c00233b7f9a8aed822b2903393637ea7b7))
* drop dead classesIn delegate and redundant what-comments ([0d411c1](https://github.com/lattice-php/lattice/commit/0d411c1e0d718b5528d23ad94dfe49db7bf7b90a))
* drop info-tooltip docblock comment ([954478b](https://github.com/lattice-php/lattice/commit/954478b549aab56eb68f6f9ca65f2a177086113c))
* drop latticePage macro in favour of #[Page] ([3d4f845](https://github.com/lattice-php/lattice/commit/3d4f8456de4b9b44f7e86e6bcb46de5c515f983a))
* drop redundant "lattice" from internal identifiers ([b09f499](https://github.com/lattice-php/lattice/commit/b09f499c43dd7a75bdd9d5ad4800ba5015cb4183))
* drop redundant "lattice" from internal identifiers ([2aabad5](https://github.com/lattice-php/lattice/commit/2aabad59ff79b7ac4cb714dbfdc7784e7cc2e7bd))
* drop redundant boolean prop fallbacks in form renderers ([9b0d066](https://github.com/lattice-php/lattice/commit/9b0d066061570686d5c052e1c911bc38c02be0ed))
* drop redundant resizingEnabled guard on the table reset button ([231dad5](https://github.com/lattice-php/lattice/commit/231dad56392706a419ea6ed0a619a008002b5f22))
* drop unused directory/visibility setters from FileUpload ([ffb0c8c](https://github.com/lattice-php/lattice/commit/ffb0c8cd014c5237e0ff08ceecc8d64399398988))
* drop unused params from FileUploadItem rule ([6e6b56b](https://github.com/lattice-php/lattice/commit/6e6b56bef6804f5152ecdbebeb57b6697bd62cd8))
* drop what-comments and tighten prefill resolution ([b209226](https://github.com/lattice-php/lattice/commit/b2092264ef9347ef919145f42b4ce01959f32df2))
* DRY effect wire-type resolution and built-in discovery ([de7341f](https://github.com/lattice-php/lattice/commit/de7341f3962b704ec8503a9d1a150e9acefb95ed))
* **effects:** give EffectOf a { type, ...payload } shape ([7c035a7](https://github.com/lattice-php/lattice/commit/7c035a78e37f06336b6fab3cdcc18a3f5d59dc81))
* **effects:** type effect handlers and collapse builtin registration ([03bf092](https://github.com/lattice-php/lattice/commit/03bf092e34f509775ba7825410d18cc1c45f430b))
* extract HasAction/HasDismissible concerns; simplify EffectFlasher ([722be58](https://github.com/lattice-php/lattice/commit/722be5878e318264f76bde66ef7a205b9657fa12))
* extract NumericColumn base with shared fraction digits ([6eb789a](https://github.com/lattice-php/lattice/commit/6eb789ac4bf7dcefa79b7d32316ba93d334943e5))
* file upload renderer cleanups (post-[#101](https://github.com/lattice-php/lattice/issues/101) review) ([46f51aa](https://github.com/lattice-php/lattice/commit/46f51aaa91f26ad201d233a5dea30daaf8214c30))
* fix layering inversions and enforce architecture in arch tests ([bbed4b0](https://github.com/lattice-php/lattice/commit/bbed4b07ec0349c80b8058fd19bb3c6ff7d19b4d))
* fold Pages into Http and add structural arch guards ([70a434e](https://github.com/lattice-php/lattice/commit/70a434e6aac7076427fabd643a0646d38a9e2081))
* **form:** inline password confirmation onChange handler ([f321d4f](https://github.com/lattice-php/lattice/commit/f321d4f9a06eae6b8c92d4b86741f9a2e5ffe778))
* **frontend:** add a shared Skeleton primitive ([2cd73d9](https://github.com/lattice-php/lattice/commit/2cd73d9269cf208f59907b177cff6a4dc22529e4))
* **frontend:** add a shared Skeleton primitive ([d372e81](https://github.com/lattice-php/lattice/commit/d372e81189f95eef96cc800e85d54da9e0be022a))
* **frontend:** consolidate popover & dialog onto shared primitives ([cb4275f](https://github.com/lattice-php/lattice/commit/cb4275f27c0869c35eb184e0ab67c32aa67d8267))
* **frontend:** dogfood the Checkbox primitive in tables ([54d48cf](https://github.com/lattice-php/lattice/commit/54d48cf57984dd0b639c3c7c80906e66948ffffc))
* generalize row field target resolution for uploads and search ([d104206](https://github.com/lattice-php/lattice/commit/d104206d1c3694975e2909c2e0f806d150f56281))
* **http:** colocate xsrfToken with apiFetch ([bae3e4b](https://github.com/lattice-php/lattice/commit/bae3e4b4bdb07157a95c37889069ddfa3dfeb594))
* **http:** funnel raw-fetch through core/api ([c72947e](https://github.com/lattice-php/lattice/commit/c72947ef438c4baa22b2f12d11712a843986aa57))
* **http:** funnel raw-fetch through core/api ([cf8b230](https://github.com/lattice-php/lattice/commit/cf8b230ec9ba7043bec0b4fd7a510b0b9d053ebc))
* **http:** normalize request method inside apiFetch ([19fb931](https://github.com/lattice-php/lattice/commit/19fb931b8e809e243fd3bcfb85e0305deaa7ed0e))
* **http:** trim comments to why-only ([381bc17](https://github.com/lattice-php/lattice/commit/381bc17a57bbdd4be0d195e9acc68eb11dfb527f))
* make form-field boolean flags non-nullable ([2e7d674](https://github.com/lattice-php/lattice/commit/2e7d67455f9550fe063b110f006d7ca6900ab24a))
* make imperative effect handlers type-safe ([f72d62f](https://github.com/lattice-php/lattice/commit/f72d62f5cf33410b0738c14190bc74ea4ac34dd5))
* manifest-based discovery ([c884377](https://github.com/lattice-php/lattice/commit/c8843770a5c8b6ccd75c945d82d3b24b475bff08))
* memoize table rows + share RowButton/columnsFromSchema + unify layout branches ([c14e71b](https://github.com/lattice-php/lattice/commit/c14e71be0542735aaed86a1eda2c2bc47ef3df70))
* migrate effect call sites to the effects domain ([48104ad](https://github.com/lattice-php/lattice/commit/48104adafad1ff5ca556d90cb65c5b7dfb181ea5))
* migrate FormDefinition toasts to Effects::flash ([df95382](https://github.com/lattice-php/lattice/commit/df95382e1e9d24c7f8c65d79df4eca69d0362c0e))
* migrate workbench pages and tests to #[Page] ([d7b5ce2](https://github.com/lattice-php/lattice/commit/d7b5ce278ea88e810f4d12c75d49567740a9afb2))
* move OptionSource and EloquentOptions to Core ([8f0419c](https://github.com/lattice-php/lattice/commit/8f0419c8eea9cec956084ed94a7ad0ad03b870b6))
* name registry selector hooks consistently ([49795f7](https://github.com/lattice-php/lattice/commit/49795f72c6d59a87fe701299b0dce0e869b41d74))
* point effect producers at the Effects domain ([9e5899a](https://github.com/lattice-php/lattice/commit/9e5899a5cca3f846be186621bcb920909d40ca6e))
* reflect column public props, drop props VOs, split Boolean/Number columns ([52b0a59](https://github.com/lattice-php/lattice/commit/52b0a593c2b2e4f1fa47f84007da2d4ac6e49a59))
* relocate effect classes into src/Effects domain ([ea64a9a](https://github.com/lattice-php/lattice/commit/ea64a9a99793df38311ee5ff6943486c5be97bb5))
* relocate page contracts to Core and enforce layering ([f833533](https://github.com/lattice-php/lattice/commit/f8335332ab8a6e8db8f06d540cc10a9409b3d8ec))
* rely on sprite plugin path resolution ([939c108](https://github.com/lattice-php/lattice/commit/939c1084bac8a5fce43c95cec2ca3d4c72f63440))
* remove react i18next adapter ([a366ee2](https://github.com/lattice-php/lattice/commit/a366ee23fc2f0abb098f140904077a7c2f6ce9e7))
* remove the generic stream component and @laravel/stream-react (chat-only) ([2174a2c](https://github.com/lattice-php/lattice/commit/2174a2cf7ede830337375a33ab0ebd3af7dad046))
* rename effects plugin and document effect dispatch seams ([4bbe69b](https://github.com/lattice-php/lattice/commit/4bbe69b362bbc78d0b8e96ec955940377eafa658))
* rename table/column-registry to table/registry ([b900078](https://github.com/lattice-php/lattice/commit/b900078e8d24438a088274c7fd381221d9f9e5a6))
* replace ToastVariant with shared Variant enum ([2853234](https://github.com/lattice-php/lattice/commit/2853234890000124c76ee59bb2514e117537c570))
* resolve dependsOn and value closures via Evaluate ([dc20982](https://github.com/lattice-php/lattice/commit/dc209822fb90c8e965ad1447da54b052df6c2d88))
* resolve field rule closures via Evaluate ([39a74cb](https://github.com/lattice-php/lattice/commit/39a74cb38ce40008ee918f5a89aff0c0a5566706))
* resolve prefill closures via Evaluate with row and form scopes ([e6a7552](https://github.com/lattice-php/lattice/commit/e6a75524cf104adb1a6091f7dd972fe1b53fb107))
* resolve Select search and selected closures via Evaluate ([9735ee4](https://github.com/lattice-php/lattice/commit/9735ee449614071c54cf2e8cb75fa291463a441c))
* reuse PageBreadcrumb type in the breadcrumbs renderer ([f206a9d](https://github.com/lattice-php/lattice/commit/f206a9d8293b3ebaf85ded20d3c314c71c36bea9))
* reuse prefill context helper and never autowire components ([87037ef](https://github.com/lattice-php/lattice/commit/87037ef6820d314fc94de8cf7cdca6ddeda8ce7b))
* share numeric-value guard; tighten currency resolution and docs ([0f5c280](https://github.com/lattice-php/lattice/commit/0f5c2805e003afc176f2bc57f8b8bf1d2481ae80))
* share variant styles and relocate Callouts slot to layout/ ([d36eb71](https://github.com/lattice-php/lattice/commit/d36eb717ef519f81bebd4bfbdbb07fb660dfb7f9))
* simplify extended faker registration ([afc8180](https://github.com/lattice-php/lattice/commit/afc81800f37fb7eddcc2207966ee3787edfaa933))
* simplify FileUpload renderer and drop dead castValue override ([85db1da](https://github.com/lattice-php/lattice/commit/85db1daf98d8667251e7a0ec2368fd77121e2510))
* simplify product faker typing ([242044c](https://github.com/lattice-php/lattice/commit/242044c1b701fa59d16d3945708291a0f7df6ab0))
* simplify renderer prop handling ([e912c79](https://github.com/lattice-php/lattice/commit/e912c793ed178d1478987e919a1a85c9ceb0efac))
* simplify workbench seeding ([e9b7e4e](https://github.com/lattice-php/lattice/commit/e9b7e4e05bb4b2057c52e4024a72798136738e1e))
* split page registry access ([450982a](https://github.com/lattice-php/lattice/commit/450982a8fd180fd59e83ee12e1ffa0d32a14d93e))
* **tables:** hydrate the column type from a typed #[AsColumn] attribute ([3cf4807](https://github.com/lattice-php/lattice/commit/3cf48071efb5977747c3718b8a816fb4bf88270e))
* **table:** type column cells and unify built-in dispatch ([7b96845](https://github.com/lattice-php/lattice/commit/7b968451579399fc1463bac1f6d8dfccb7ccf477))
* **testing:** add action id to endpoint and confirmation failure messages ([5812862](https://github.com/lattice-php/lattice/commit/58128625ee3d34acaa957d05f75a0396ccc7343c))
* **testing:** align ComponentNode schema guard and rename test helper ([8b0ca38](https://github.com/lattice-php/lattice/commit/8b0ca3856b96afd308205cd81e5f518d91214088))
* **testing:** include root in selector list and document field assertion semantics ([eae32cf](https://github.com/lattice-php/lattice/commit/eae32cf2d265855e1d2020826f253f09e4daf37b))
* **testing:** read assertLatticePage from passed response via withoutVite ([1813993](https://github.com/lattice-php/lattice/commit/18139938b5beb211d6362c22a60baa29dfbbdaa7))
* type prefill props on the FieldProps lens; document demo price trust ([0557dd8](https://github.com/lattice-php/lattice/commit/0557dd8bd5fdbeb4bf2726122f840935f080046b))
* type the row layout as a RowLayout enum ([1ab2ae9](https://github.com/lattice-php/lattice/commit/1ab2ae9009a2bc20bcad348c7c32bd7b7a0ce60e))
* unify the four registry kinds (renderer, columns, chat parts, effects) ([dc55cfb](https://github.com/lattice-php/lattice/commit/dc55cfb1c4c5ba05026874d0c6085753d04a0b60))
* unify toast delivery into a single pipeline ([5e38e37](https://github.com/lattice-php/lattice/commit/5e38e3741da79e77b3b36d114f464a2cf7f15169))
* use extended faker image metadata ([e75a6ef](https://github.com/lattice-php/lattice/commit/e75a6efee95aa5c19c2c77fa5badc717e52acb82))
* use public lattice package imports ([982c7e3](https://github.com/lattice-php/lattice/commit/982c7e3a66fac3ed8b3b2533a463490363513a86))
* use public lattice package imports ([7c4c8a9](https://github.com/lattice-php/lattice/commit/7c4c8a950a0dbe587305bae2381f8e7fca91b4ac))
* **workbench:** dedupe commerce read helpers and simplify address upsert ([d4ba605](https://github.com/lattice-php/lattice/commit/d4ba6050198a51d3339a993504d47c9e213e247f))
* **workbench:** dedupe commerce read helpers and simplify address upsert ([741f5bc](https://github.com/lattice-php/lattice/commit/741f5bc85d60acaa974b27b3620d4ffa7c56ecf0))
* **workbench:** drop redundant Workbench prefix from new file names ([b00305e](https://github.com/lattice-php/lattice/commit/b00305e168821a6fd71e8ceec3b80cd5cbfa6b78))
* **workbench:** emit typed chat value objects from the simulated chat ([b44a8f0](https://github.com/lattice-php/lattice/commit/b44a8f0a8945ea411c589ebe5df7798c492c2b3b))
* **workbench:** flatten the js/lattice folder into the resources root ([9600338](https://github.com/lattice-php/lattice/commit/9600338358ab8f0e4236b09fff3700e5ebd86632))
* **workbench:** inject FakeConversationStore into the history controller ([f83b558](https://github.com/lattice-php/lattice/commit/f83b55860f195ea1e10ef8a22d400a2a0ff1506d))
* **workbench:** persist locale via update() instead of forceFill ([2c37295](https://github.com/lattice-php/lattice/commit/2c3729525dab5086ce3a31809ac09eb81abb961d))
* **workbench:** remove superseded simple chat demo ([1d6d8bb](https://github.com/lattice-php/lattice/commit/1d6d8bb0319cb3f284402db325cb2f81abb32eb7))
* **workbench:** remove the streaming demo page (chat covers streaming) ([9f73203](https://github.com/lattice-php/lattice/commit/9f7320367bc4cccf694f34c69b4de2c079edb95b))
* **workbench:** replace product.price with group-aware sales prices ([db921da](https://github.com/lattice-php/lattice/commit/db921dab96af459edd986666f40e76d83c4dc1ca))
* **workbench:** use enum case and decimal strings in commerce factories ([cce9df5](https://github.com/lattice-php/lattice/commit/cce9df5fed87e540008ad602f05c186e466ce52b))


### Documentation

* add "Development with AI" page and reframe i18n backend-first ([220db54](https://github.com/lattice-php/lattice/commit/220db54a3c92855d4c8b9d4859feb874ef304c9c))
* add a Testing guide for AssertsLatticeComponents ([21c1eed](https://github.com/lattice-php/lattice/commit/21c1eedcfc644682eaf9677f17b45565116111ce))
* add pr-review skill and align AI guidelines with Lattice ([9a4cb98](https://github.com/lattice-php/lattice/commit/9a4cb9829783129caec23e8b20ddb85387213d64))
* add pr-review skill and align AI guidelines with Lattice ([d6646e4](https://github.com/lattice-php/lattice/commit/d6646e4ebb3838c068c123b1140f1a8261cf8f64))
* align package setup and local development ([98361a4](https://github.com/lattice-php/lattice/commit/98361a410034f31cc5205ee19f3af66e9121b518))
* Boost AI guidelines & skills, Development-with-AI page, backend-first i18n ([a3c43bf](https://github.com/lattice-php/lattice/commit/a3c43bf85a193b369d15eacb9f29e9713f525e5f))
* clarify BaseProfile generates built-in effect types only ([8a4715b](https://github.com/lattice-php/lattice/commit/8a4715b5879c145b9ef80c13328052fcba8a3e63))
* clarify vite installation ([71a945e](https://github.com/lattice-php/lattice/commit/71a945ee8ec5a448f3288966163cfc8a5eeb921d))
* clean up bundle size report and collapse sidebar groups ([43c66f4](https://github.com/lattice-php/lattice/commit/43c66f48d6d3ca3a309a01fb78e804d4b9a1aee3))
* clean up bundle size report and collapse sidebar groups ([179ff60](https://github.com/lattice-php/lattice/commit/179ff6064c7b13f318ff61452bee5c28c4eecdfb))
* cross-link the security and enums references ([8349a11](https://github.com/lattice-php/lattice/commit/8349a116e7c135bf07a24edb438856b4f37d760e))
* document #[Page] attribute and drop latticePage references ([eba5aa5](https://github.com/lattice-php/lattice/commit/eba5aa5b36c17c0a9c36c23bf8c12ec04e14ec06))
* document alignment, units, money; workbench money column ([32e4386](https://github.com/lattice-php/lattice/commit/32e4386897f45d16ff7f3ea5522eda3a83872abd))
* document closure utility injection and fix stale search example ([b46c826](https://github.com/lattice-php/lattice/commit/b46c8262f538e06877fe33d2df7244eea255a689))
* document column select filters ([ec40634](https://github.com/lattice-php/lattice/commit/ec40634fbaa7490a87005c3fbe6d26e7c5da7eaf))
* document dedicated table filters ([d66fd78](https://github.com/lattice-php/lattice/commit/d66fd78a759aaa58237a4ecfce0bf6abfe44cd7a))
* document Dropdown, UserMenu, Breadcrumbs and the sidebar footer ([8ff4963](https://github.com/lattice-php/lattice/commit/8ff49634ae755c721e15552b97571c2352f16e0a))
* document FileUpload and fix reference drift ([d743051](https://github.com/lattice-php/lattice/commit/d743051eda7fecd55e56b82a753f25f74116149c))
* document the Builder field ([36a89fd](https://github.com/lattice-php/lattice/commit/36a89fd1ebcd2d2ecb052110d0dabc97d7e34a72))
* document the callout effect and the Effects::flash channel ([6dd91ee](https://github.com/lattice-php/lattice/commit/6dd91ee497fffa834ed5eba5b68a83863e484126))
* document the FileUpload field ([8116d12](https://github.com/lattice-php/lattice/commit/8116d12d0a9dbb09ca08888f34afc8aa5d2045ab))
* document the table row layout and reorder animation ([e0282ce](https://github.com/lattice-php/lattice/commit/e0282ce9e03a8d83f4071c04d642d2b687c78270))
* expand the Pages reference and add a Layouts page ([d869ab6](https://github.com/lattice-php/lattice/commit/d869ab6ce2c642747421a625bbb8d712f8a293c1))
* **extending:** correct the column-cell and registry-hook APIs ([f3c11bc](https://github.com/lattice-php/lattice/commit/f3c11bc54cff497d12e4c63c283b91dfc43e30a1))
* fill option-reference gaps and fix drift ([b745d74](https://github.com/lattice-php/lattice/commit/b745d741fe8da4a5c2fbbfc760e922858283d8bf))
* note source linked test limitation ([fc25ccd](https://github.com/lattice-php/lattice/commit/fc25ccd170553f1cbde8228e06fa2ae95f90ccd5))
* refine structure and flesh out core pages ([ac58472](https://github.com/lattice-php/lattice/commit/ac58472c9e4a3624cb078dd541459db9524b2f33))
* Repeater "Row actions" section with a live example; Builder cross-links it. ([0bb9c9a](https://github.com/lattice-php/lattice/commit/0bb9c9a6a899b2d1bd0df98e644c789c88491630))
* restructure sidebar and relocate pages ([614cc22](https://github.com/lattice-php/lattice/commit/614cc22ca1458b9cd453247db74b48c7be45466f))
* self-updating bundle-size page powered by Sonda ([0dc8811](https://github.com/lattice-php/lattice/commit/0dc8811bf6263317beec1004ca698005a0df85dd))
* self-updating bundle-size page powered by Sonda ([34286ab](https://github.com/lattice-php/lattice/commit/34286ab6daa4da442c2139ee87103c27c80b9a0e))
* ship Boost AI guidelines and skills for consumers ([00ec66a](https://github.com/lattice-php/lattice/commit/00ec66ab9276d63a78819bd1856d8e0fe392545b))
* sync the enums reference with source ([5c0cc98](https://github.com/lattice-php/lattice/commit/5c0cc987dbe6004d88c132750a58ea6637adef8f))
* update effect references to the Effects domain ([6bc04ec](https://github.com/lattice-php/lattice/commit/6bc04ec1ab1867d552a326f529a2d9b85072bae8))

## [0.2.0](https://github.com/lattice-php/lattice/compare/0.1.0...0.2.0) (2026-06-12)


### Features

* add a sidebar layout primitive ([671195d](https://github.com/lattice-php/lattice/commit/671195da6d16244136acf7b65cdda337ada020e6))
* add Column attribute extending Component ([2eaf6ff](https://github.com/lattice-php/lattice/commit/2eaf6ff68b11e8a32cb6495d4c708ebb4f8ffdbb))
* add ColumnProps contract and per-column props value objects ([e3ba40b](https://github.com/lattice-php/lattice/commit/e3ba40b0f6119c96712c6f3da455c0ac1ffeeae2))
* add Component attribute for declaring renderable type strings ([70058ee](https://github.com/lattice-php/lattice/commit/70058ee0ae9ef6e27458eed6c5f54d15a9f681e7))
* add lattice:column generator ([20a952d](https://github.com/lattice-php/lattice/commit/20a952d8a06ebce8f68fcad2dbfeeb75b15c1cc5))
* add lattice:component generator ([6e78269](https://github.com/lattice-php/lattice/commit/6e78269edff3a1ee0e7507ca6e2996d3909fb74e))
* add lattice:field generator scaffolding the PHP and React pair ([1eabc36](https://github.com/lattice-php/lattice/commit/1eabc36be69c61da18d076156fca6089a6ed314a))
* add lattice:typescript command for app component type augmentation ([cc79807](https://github.com/lattice-php/lattice/commit/cc798077dffcf20329bbdc6c0cfb4c66c928871a))
* add MenuItem::children() piping nested items to the schema ([22fbc38](https://github.com/lattice-php/lattice/commit/22fbc387a513cd15402dc199024cfec73d597c36))
* add opt-in i18next integration for built-in UI strings ([bff8d88](https://github.com/lattice-php/lattice/commit/bff8d8886abbe93f802f3d3fcd6058ffca0702d5))
* add reflection-based wireProps seam to Component ([4ff7609](https://github.com/lattice-php/lattice/commit/4ff7609b76e8492b043601db8c848275bbb4b490))
* add shared ClassWalker discovery helper ([aa25f8e](https://github.com/lattice-php/lattice/commit/aa25f8ee01bf957f9a9a01d266b80fb8490df01c))
* add success and info color variants ([9f63dae](https://github.com/lattice-php/lattice/commit/9f63daef301ce6e7a0bf2a4c61064aacebe31342))
* alias the generated HttpMethod type to Inertia's Method ([c0ff70c](https://github.com/lattice-php/lattice/commit/c0ff70ccf2b167173248ba562607223adec2f309))
* align ConditionOperator and FilterOperator to the same 15 cases ([a314e7c](https://github.com/lattice-php/lattice/commit/a314e7c5ed998f705abf171bc862c3fc63431c88))
* align table columns with the type-generation pipeline ([a294a9f](https://github.com/lattice-php/lattice/commit/a294a9fdf830bd3b5c21c8b9f01c5c1bda35bc2a))
* allow custom column type strings and typed column props ([4940989](https://github.com/lattice-php/lattice/commit/4940989609725f5e5f3a18f4f0ee8924d6225a6f))
* augment app ColumnProps from the column props VO ([b4d7c1b](https://github.com/lattice-php/lattice/commit/b4d7c1bbba9610eba3f0ac268845d369679c2ad7))
* Badge, Icon, and Image column types ([f0a7ff5](https://github.com/lattice-php/lattice/commit/f0a7ff54cae6cd44ffafe1c0d8c0de59e90b9fa9)), closes [#118](https://github.com/lattice-php/lattice/issues/118)
* cache definition discovery, warmed via optimize ([30bce9a](https://github.com/lattice-php/lattice/commit/30bce9abd2ad3dfaafd1f085871c622d5ce26a5d))
* collapsible Section layout component ([8ce7052](https://github.com/lattice-php/lattice/commit/8ce7052291fd825fac0ea2c716895490cea8631c)), closes [#120](https://github.com/lattice-php/lattice/issues/120)
* collapsible sidebar navigation + table layout fixes ([4be77bb](https://github.com/lattice-php/lattice/commit/4be77bb203b08a44d78ceda21492704c3cb95d5b))
* collect validated input via a modal form on actions ([0d72f05](https://github.com/lattice-php/lattice/commit/0d72f053006bd773f42e6d70f8d412585adeb997))
* column cell registry for custom table column renderers ([884f863](https://github.com/lattice-php/lattice/commit/884f8637c89e6a1881a54aa795740c944dbb471d))
* configurable component display strings + serialize defaults ([f2ee1dd](https://github.com/lattice-php/lattice/commit/f2ee1dd18e7e4ba550c43b568644a69608b82b15))
* configurable select search placeholder and form validation summary ([80ae860](https://github.com/lattice-php/lattice/commit/80ae8603c3a2b136982be89ef97ad7011a8f403a))
* discover columns by attribute inheritance with props class ([3a5b3d1](https://github.com/lattice-php/lattice/commit/3a5b3d122729578d00794274c34a2308ee5a5118))
* discover Component-attributed classes for TypeScript generation ([924529d](https://github.com/lattice-php/lattice/commit/924529d3fefa54a9bd250d78c7cc142b318f0b01))
* **docs:** add global theming reference page ([e3c8227](https://github.com/lattice-php/lattice/commit/e3c82275b1be3f4a0e310fe03b590e04563942a4))
* **docs:** add Style tab listing tokens used by each example ([a3208f8](https://github.com/lattice-php/lattice/commit/a3208f829bde0267930e93a9562991e4cfc0a3c0))
* **docs:** add TokenList island deriving tokens from a rendered example ([6429734](https://github.com/lattice-php/lattice/commit/6429734026c6e74e1cdea86029b560c0e61df03d))
* **docs:** collect class attributes from a rendered subtree ([5fbfb7e](https://github.com/lattice-php/lattice/commit/5fbfb7e3ccc9f58309628523b71fa67d011fb574))
* **docs:** parse lattice css tokens and tailwind suffix map ([f9c06ed](https://github.com/lattice-php/lattice/commit/f9c06ed1fca86281f8870da6ce6937e264512a80))
* **docs:** per-component Style tab + theming reference ([ee2999b](https://github.com/lattice-php/lattice/commit/ee2999bf3e1d1875274665b1b5d43c854bb35ce4))
* **docs:** resolve tailwind classes to tokens and derive labels ([668f66c](https://github.com/lattice-php/lattice/commit/668f66c42577bd832a1549a1e3b73aae63058e99))
* drive frontend i18n from backend config via the page payload ([49974f2](https://github.com/lattice-php/lattice/commit/49974f2ec8d004c1a2390ef7e6d340f821d6ccd7))
* edit-in-modal — lazy, prefillable action form schemas ([78b82a0](https://github.com/lattice-php/lattice/commit/78b82a0df5b6b6f41021a2f1aec10ec4c5f78e17))
* extend Lattice with custom components, fields and columns ([a890f41](https://github.com/lattice-php/lattice/commit/a890f4152fb724e8b18901622d52eed51f974b32))
* form-in-action — modal forms on actions ([e9a708b](https://github.com/lattice-php/lattice/commit/e9a708b6e722ad4ba761fb93592497c2e08413f2))
* generate augmentable ColumnProps for custom columns ([b265126](https://github.com/lattice-php/lattice/commit/b265126750aa041127ac7881caedbd36ffbcb05c))
* generate ColumnPropsMap and loose ColumnData props ([ced8dad](https://github.com/lattice-php/lattice/commit/ced8dad8d669f4a8206b105cb0b79fbd6cc9022b))
* generate discriminated FormNode union ([e167075](https://github.com/lattice-php/lattice/commit/e167075693bc0aa342091a19eb47cadc52ba5093))
* generate table column wire shape as typed ColumnData ([b58ded2](https://github.com/lattice-php/lattice/commit/b58ded2c0546ade6c66cc6f783f8ddb2292cbb80))
* generate Table type and TableNode union, adopt on frontend ([ea1471c](https://github.com/lattice-php/lattice/commit/ea1471c2cfcc1109235e18f5b99154507b64d8d3))
* generate the ButtonVariant enum instead of hardcoding it ([7d11fbf](https://github.com/lattice-php/lattice/commit/7d11fbf1731cf0424e7ae20c09f7f547969cfb3f))
* generate the sprite, icon types, and a PHP enum from one source ([1c878ae](https://github.com/lattice-php/lattice/commit/1c878ae0f4cb0fd5369bf4918ff9b923ccff92ef))
* generate TS prop types and node unions for core, action and fragment components ([7355140](https://github.com/lattice-php/lattice/commit/7355140cf6acf8d1405b3503e143b1a40e9eb36f))
* generate TS types for layout components (Outlet, Menu, MenuItem) ([affee18](https://github.com/lattice-php/lattice/commit/affee18a6b434edea4d2db021062cd83450c0a22))
* generate TypeScript prop types for form components ([eff971d](https://github.com/lattice-php/lattice/commit/eff971d8361e5770b6eeca9effe7c171e750c68d))
* helper text on form fields ([eff6e56](https://github.com/lattice-php/lattice/commit/eff6e564e8ea22ca231aacacdab766b213c60465))
* Icon schema component + token-driven icon sizing ([72fd74a](https://github.com/lattice-php/lattice/commit/72fd74a8ef92e5135825979ae2d92583e5251a38))
* Icon schema component with token-driven sizing ([126d74f](https://github.com/lattice-php/lattice/commit/126d74f100d5b20c52f0b86d52f645e1108c882f))
* lazy, prefillable form schemas for edit-in-modal actions ([d6b35e2](https://github.com/lattice-php/lattice/commit/d6b35e263ab0859c2e7f909207161bc1a232ff39))
* make component display strings configurable, serialize their defaults ([660a16d](https://github.com/lattice-php/lattice/commit/660a16d130ab097dedf698f04a92012fa72842e9))
* make nested menu items collapsible ([5116a80](https://github.com/lattice-php/lattice/commit/5116a808759341f11883fb2d4cddfb212f898d73))
* make saveMissing dumps land in the writable workbench lang path ([c6a2d72](https://github.com/lattice-php/lattice/commit/c6a2d72f6af59f7bed9f81b5feed2818a621e02b))
* make the sidebar collapsible to an icon rail ([312bcae](https://github.com/lattice-php/lattice/commit/312bcae063654f0351de62b24b305c9fb8487017))
* Menu/MenuItem layout components, replacing the menu system ([ed3b320](https://github.com/lattice-php/lattice/commit/ed3b320d3962366cde0f9f0849628afed5ccdab7))
* migrate components to typed public properties + generated TS types ([482c542](https://github.com/lattice-php/lattice/commit/482c54200011dfda7f7feab9ce5e4d8bcc215bb1))
* migrate Table to typed properties and retire the legacy prop bag ([29c4bb5](https://github.com/lattice-php/lattice/commit/29c4bb5193265532e38adb9d51f91768bda7e87d))
* opt-in i18next integration for built-in UI strings ([ea51682](https://github.com/lattice-php/lattice/commit/ea51682248c06583e349591b8e6462e71926ba70))
* publishable JS scaffold for app component and column plugins ([0f8167d](https://github.com/lattice-php/lattice/commit/0f8167d65cd541b1ab3f1fbedf140f8394e2e989))
* render icons from an SVG sprite, drop lucide-react ([4147e56](https://github.com/lattice-php/lattice/commit/4147e561bfd7c87761ddd6fe745b04a630c42a45))
* render toast notifications with Radix Toast ([0f08dbf](https://github.com/lattice-php/lattice/commit/0f08dbf85d8a575f13241a2072bb9a967f4a34e4))
* replace the menu system with Menu/MenuItem layout components ([e33763e](https://github.com/lattice-php/lattice/commit/e33763ee3b1cf638617ecc4db6e2e74a6b923ebf))
* resolve built-in column props via ColumnPropsOf ([aeac29d](https://github.com/lattice-php/lattice/commit/aeac29d360bcac5e18546523ba749c204e152276))
* resolve component props through an augmentable LatticeComponentProps interface ([33f608e](https://github.com/lattice-php/lattice/commit/33f608e04c60ad4d5385a2141742df3372d62663))
* resolve Component wire type from the Component attribute ([36dd0ab](https://github.com/lattice-php/lattice/commit/36dd0ab25895046001d8e5de6cab74f60505ab40))
* route built-in UI chrome through the i18next namespace ([9c1ec28](https://github.com/lattice-php/lattice/commit/9c1ec2853e21fb6aa2c7cb7066605139b2c287f2))
* scaffold columns with a typed props value object ([7ffcd72](https://github.com/lattice-php/lattice/commit/7ffcd72e1d9ba50ad43887b5a4f9c5c1be66ca72))
* searchable selects and computed fields in action forms ([c3ae47b](https://github.com/lattice-php/lattice/commit/c3ae47bb85f04fd7353db2c24d58459726cf33e2))
* searchable selects and computed fields in action forms ([07104c5](https://github.com/lattice-php/lattice/commit/07104c5fa23d08ce0df3240cba6c7f244cb58f09))
* serve Lattice chrome translations from the workbench backend ([0acce28](https://github.com/lattice-php/lattice/commit/0acce28784a3e4b1cc1fbf7193ddde1e59e7a436))
* server-driven layouts with an outlet ([73e5215](https://github.com/lattice-php/lattice/commit/73e5215c0cb412fd03f828540300a812e9b1d587))
* server-driven layouts with an outlet ([463069a](https://github.com/lattice-php/lattice/commit/463069add9715f3429b8ccc6bd425f1bca3571bb))
* SVG sprite icons via @lattice-php/vite-svg-sprite (drop lucide-react + LucideIcon) ([5050e09](https://github.com/lattice-php/lattice/commit/5050e09a7d16e85695c21cc5aceefc2b396589f1))
* toast notifications (Radix Toast) with link & modal-form actions ([729ca6f](https://github.com/lattice-php/lattice/commit/729ca6f1c23b88a670c6e244f1a0404e4a5f3dcd))
* vertical tabs and keyboard roving focus ([1e98ea0](https://github.com/lattice-php/lattice/commit/1e98ea0ab37937e02475bb42b70d277c2ae12f99))


### Bug Fixes

* clean up table headers and destructive button contrast ([35b0964](https://github.com/lattice-php/lattice/commit/35b0964c425471d51966e46df0ffe9ac91ce8410))
* **css:** define --lt-warning token for light and dark themes ([cd6114b](https://github.com/lattice-php/lattice/commit/cd6114bcca75bd8879d040e55b2e42d1e5cb61cc))
* emit correct relative paths in published type declarations ([ba794f9](https://github.com/lattice-php/lattice/commit/ba794f91e1df59b85630fe5c899054f488bfd8d4))
* emit correct relative paths in published type declarations ([67f6e3a](https://github.com/lattice-php/lattice/commit/67f6e3a6a136cdff31ae8a5613bb7f33a7aa570d))
* expose tabIndex and autoFocus consistently across focusable fields ([a54ca3f](https://github.com/lattice-php/lattice/commit/a54ca3fe0bfa365a09db21f11061af7f9a4d375d))
* keep image column size as an integer ([6ca7a11](https://github.com/lattice-php/lattice/commit/6ca7a1161b3990c0c7e794fd34e3a83f967c37f9))
* make Action::use() type-safe and carry typed variant prop ([dc45ab1](https://github.com/lattice-php/lattice/commit/dc45ab101351de0492989f24de6e0e6d1e514bc3))
* mark values set inside a dependsOn closure as resolved ([867aa76](https://github.com/lattice-php/lattice/commit/867aa76aadf6143a29c6579d1b21b2be2ea6228f))
* published column scaffold uses createPlugin ([97d876c](https://github.com/lattice-php/lattice/commit/97d876c37d4cf8400d1d8adb7d94d66cec05ab0a))
* render docs component previews in production ([98852a5](https://github.com/lattice-php/lattice/commit/98852a55932c66b3aa35383ebf3bee688d3d4f7e))
* render docs component previews in production ([00757c2](https://github.com/lattice-php/lattice/commit/00757c2c38b93081c50fe563ab296f69eba62ed3))
* satisfy phpstan and tidy column-props generation ([24eae38](https://github.com/lattice-php/lattice/commit/24eae38afafc26dc184939948a8bdcbc68d9a312))
* satisfy phpstan for the generated.ts snapshot test ([4057ab1](https://github.com/lattice-php/lattice/commit/4057ab194e6af518a04ba34d46f444587fd3f979))
* satisfy phpstan in MenuItem::fromPage (class-string param, self:: call) ([824822b](https://github.com/lattice-php/lattice/commit/824822bd42134977490e338405484bdc068823b3))
* seed checkbox default-checked state from its value prop ([6662706](https://github.com/lattice-php/lattice/commit/6662706abca66682eec35b921f1ef32fe3c9d3a0))
* sort fixture keys for cross-PHP-version determinism ([c3075e1](https://github.com/lattice-php/lattice/commit/c3075e16ac1af90e1c727edb5daa0751f99c3692))
* sort generated prop types by name for cross-PHP-version determinism ([38b9148](https://github.com/lattice-php/lattice/commit/38b9148d91169a552e804221a2f204f345a087eb))
* tidy sidebar toggle and table column alignment ([ab0adb4](https://github.com/lattice-php/lattice/commit/ab0adb423044735bb7b1c2ab1abe21340f250c7d))


### Performance

* memoize table render derivations ([e761faf](https://github.com/lattice-php/lattice/commit/e761faf0d9e569672f34db745a9feb3d15feeaaf))
* use values identity instead of stringifying in dependsOnAny resolve ([5def6d7](https://github.com/lattice-php/lattice/commit/5def6d7056408a2566633d9d49094a52a776698c))


### Refactoring

* adopt generated prop types in core components ([d887aef](https://github.com/lattice-php/lattice/commit/d887aef26b05eed4aa710dc2c4e6f08912d4d7fc))
* adopt generated TS types in action components ([d393afd](https://github.com/lattice-php/lattice/commit/d393afd6d21bb6c9bce2d72e6beacd909b1f1fb0))
* adopt Radix Dialog for Modal and ConfirmDialog ([b325937](https://github.com/lattice-php/lattice/commit/b32593710f6dc380dfc6de7f10be10c5daf3eeaf))
* adopt Radix Popover for the three anchored overlays ([88889d9](https://github.com/lattice-php/lattice/commit/88889d967535d8ac154c30f288c7415cc8d84923))
* align the form field builder API and hide internals ([573e493](https://github.com/lattice-php/lattice/commit/573e493175c0c7e7781f30f9fcb8142104f327d0))
* build the Toaster's ToastItem from the generated ToastMessage ([0d25617](https://github.com/lattice-php/lattice/commit/0d25617cc9ec4e57c3529f19cb77d7fb472d2c58))
* built-in columns emit typed props value objects ([9a77dd1](https://github.com/lattice-php/lattice/commit/9a77dd136362313f0bab90b042d30178cf7cea55))
* canonical Node type system + relocate generated types ([7deea76](https://github.com/lattice-php/lattice/commit/7deea762f5f56bac4bd296faa736fcc924387c59))
* cells read column props via generated types, drop column-map helper ([1177902](https://github.com/lattice-php/lattice/commit/117790256faba5b90bf99847c5f7a12262343457))
* consistent success output across lattice generators ([ecbcf85](https://github.com/lattice-php/lattice/commit/ecbcf859ed7ea122e00eb278cc74d429b088fd12))
* consume generated form node types on the frontend ([8e4f089](https://github.com/lattice-php/lattice/commit/8e4f089de5d3ca958a336832d9ca5bd5d0f76b5a))
* copyable and circular column flags default to false, not null ([89ade78](https://github.com/lattice-php/lattice/commit/89ade782fc702845a237df8d9451a16ef8c9b6ac))
* declare built-in component wire types via the Component attribute ([4851a7f](https://github.com/lattice-php/lattice/commit/4851a7ff72632a22b24588fb513f165bfb4f02f2))
* dedup action response + bulk confirmation types ([56b0b0b](https://github.com/lattice-php/lattice/commit/56b0b0b43e694c824089e060621dc348f82c9196))
* default Button buttonType to Button instead of nullable ([15d25b7](https://github.com/lattice-php/lattice/commit/15d25b7701d55bf7602471b728b9f40ae83e642c))
* derive effect wire type from a per-effect const ([c6909ab](https://github.com/lattice-php/lattice/commit/c6909abb090ea9c45a19e16b203bca0b5135cff9))
* derive i18n signals from laravel-i18next config ([0368846](https://github.com/lattice-php/lattice/commit/0368846cbb86d9ae4bba9f8c169e341c43df0ee7))
* derive KnownPageContainer from the generated PageContainer ([2a1d9e3](https://github.com/lattice-php/lattice/commit/2a1d9e395458bb553fe827426f37e0301a21eeb2))
* derive the canonical Node type system from the transformer ([3d1e320](https://github.com/lattice-php/lattice/commit/3d1e320db5df3a21cea11697a8a22836d67b5813))
* discover built-in TS enums, value objects and component domains ([ae5d04e](https://github.com/lattice-php/lattice/commit/ae5d04e32c4b98a25104e0f68c823d31fd23be02))
* discover components via php-structure-discoverer ([da45a0a](https://github.com/lattice-php/lattice/commit/da45a0a8e0929bbda503f70395d3e57f257a89a3))
* discover definitions via php-structure-discoverer ([5071c13](https://github.com/lattice-php/lattice/commit/5071c136381165d37d6432f9658bcdc1dc0aa736))
* discover effects via an #[Effect] attribute ([1eb9576](https://github.com/lattice-php/lattice/commit/1eb957609f2bc79ae37260e7245667348f2a8d7a))
* **docs:** drop "lattice" from docs-internal names ([1a1417c](https://github.com/lattice-php/lattice/commit/1a1417caa63f4557bd7d1e43c6c271839ab25aaf))
* drop dead TypeScript code and redundant aliases ([e68a1bf](https://github.com/lattice-php/lattice/commit/e68a1bf021c026c624b3c807852c6cc039961c56))
* drop Lattice prefix from TypeScript support classes ([b01c523](https://github.com/lattice-php/lattice/commit/b01c523a6131ab9877c183a79929d3593fe9244d))
* drop redundant filters state in useTable ([af6be41](https://github.com/lattice-php/lattice/commit/af6be41fdeb2443dc9a59cf8a09c6896a33a4e3d))
* drop redundant string option from enum setters ([c27e304](https://github.com/lattice-php/lattice/commit/c27e3047b044df6e348f27d2f973bae03ae97f40))
* drop the dead orientation fallback in tabs ([2b59a80](https://github.com/lattice-php/lattice/commit/2b59a802af84052507aae073f7c5155a527b793b))
* drop the LucideIcon enum for the generated Icon enum ([a1e715f](https://github.com/lattice-php/lattice/commit/a1e715fc0868c023312875d1ae98c22e7100b83e))
* emit complete effect payloads and fold toast into ToastMessage ([17b16b0](https://github.com/lattice-php/lattice/commit/17b16b042a00bbfc58f1c4261013fc6cc7ccc582))
* emit Record&lt;string, never&gt; for propless component props ([37af39a](https://github.com/lattice-php/lattice/commit/37af39ae57e04d4abc526ab0c791fcbdeeccfc36))
* extract a TableSource interface with an Eloquent adapter ([a4d4026](https://github.com/lattice-php/lattice/commit/a4d40269d0dcc3a6833a22c8a5ef0c7aa4162183))
* extract ConditionEvaluator from ConditionOperator ([ad6a47d](https://github.com/lattice-php/lattice/commit/ad6a47dfaca7c6e8402e8e534ddd1a52c41fd1ea))
* extract FilterApplier from FilterOperator (merge spike [#127](https://github.com/lattice-php/lattice/issues/127)) ([638f63b](https://github.com/lattice-php/lattice/commit/638f63b742e13392fbbb2908c7274e06cae02aae))
* extract FiltersRenderableComponents to dedupe renderable filter ([ee96e8d](https://github.com/lattice-php/lattice/commit/ee96e8d79ff08284017e12b08deacb170efaeece))
* extract HasHttpMethod concern to dedupe method() coercion ([eb5ca2f](https://github.com/lattice-php/lattice/commit/eb5ca2f72d01955adf607866135d881abb1d7e4d))
* extract SimpleField shell for single-input field renderers ([781ebbb](https://github.com/lattice-php/lattice/commit/781ebbb5301f42372b3e66d68443c5886a436f2a))
* extract the form validation and precognition machinery ([8e14f5d](https://github.com/lattice-php/lattice/commit/8e14f5d6deaecc7954f08d0661d5d1c0015887c0))
* extract useSeedDefault for field default seeding ([4192399](https://github.com/lattice-php/lattice/commit/419239938a9d56c226dc69ad72828fb312614be4))
* fold column props generation into PropsTypeGenerator ([4cefe93](https://github.com/lattice-php/lattice/commit/4cefe9393ba952a2884a2cce2b40128582252255))
* generate built-in types from Component discovery and wire into composer fix ([65f35ac](https://github.com/lattice-php/lattice/commit/65f35ace6bd5f61e82c040c8346f807109d1b6ee))
* generate effect union from per-effect value objects ([71f6607](https://github.com/lattice-php/lattice/commit/71f66078eb1bc352b47caafb877dec8769a54c69))
* generate effect union from per-effect value objects ([e84d3fe](https://github.com/lattice-php/lattice/commit/e84d3fef1f459bb64c41f57a20bee084b3a514ff))
* generate FilterClause wire type instead of hand-writing it ([4ba9428](https://github.com/lattice-php/lattice/commit/4ba9428b030f23f2af61bfe79883b2ff90818363))
* generate Form.method as HttpMethod enum and emit ref ([55b6024](https://github.com/lattice-php/lattice/commit/55b6024851aa2982dd882ec944bd4d8c58b45311))
* generate shared value-object types for the wire shape ([082cf37](https://github.com/lattice-php/lattice/commit/082cf37b61c0c334af0a08045cb3d5c0ee5becfa))
* generate shared value-object types for the wire shape ([95e4e72](https://github.com/lattice-php/lattice/commit/95e4e725b021415c327e09ceb6847716c0d66ba8))
* group workbench navigation into a sidebar menu ([7ca9617](https://github.com/lattice-php/lattice/commit/7ca9617c920cac39cf4223f4c1c0908c43229d29))
* hardcode i18n backend paths in the frontend ([078319b](https://github.com/lattice-php/lattice/commit/078319b03c2f4b32a3ca6eae91501cae6bff1392))
* infer container and interactive from class instead of Component attribute args ([9cd7267](https://github.com/lattice-php/lattice/commit/9cd7267e9435870ffcb018f2b2c129aef67054c3))
* inline English defaults via t(key, default), drop en.ts ([c4b0a79](https://github.com/lattice-php/lattice/commit/c4b0a790dc947f9409f2b2f85c8e5d4e886afb2d))
* let columns own availableOperators, drop FilterOperator::appliesTo ([cc5f86a](https://github.com/lattice-php/lattice/commit/cc5f86ad53a088ce2221c3314b65482d63fe1079))
* make children() the MenuItem nesting method, items() Menu-only ([b2b84e7](https://github.com/lattice-php/lattice/commit/b2b84e7f15672813db9fc00b143907e28f11a23c))
* make column capabilities semantic + generate ColumnFilter ([bb03eb5](https://github.com/lattice-php/lattice/commit/bb03eb5b95720c562184a0d90c0f0224b56eab1a))
* map Component-typed value-object props to Node automatically ([4ee41d2](https://github.com/lattice-php/lattice/commit/4ee41d2bacbb481474e9cf576f77844d17d77893))
* match i18n config type to wire shape and init once ([bbe52d4](https://github.com/lattice-php/lattice/commit/bbe52d4d0271e1400eb8e0fb16e70223159de9b5))
* merge ConditionOperator and FilterOperator into a single Op enum ([0fe60ff](https://github.com/lattice-php/lattice/commit/0fe60ffce780b718e5c5f63c464cf8edcb3b6225))
* migrate Action and BulkAction to typed public properties ([33acd41](https://github.com/lattice-php/lattice/commit/33acd41949f9b420615eafdd15359765154b9906))
* migrate ActionGroup label to typed public property ([1ee904f](https://github.com/lattice-php/lattice/commit/1ee904f163f0c1587515b9397d28031bf721f0da))
* migrate Fragment endpoint and lazy to typed public props ([54f431f](https://github.com/lattice-php/lattice/commit/54f431f905f07c0140b830d505a55a6eaa171497))
* migrate simple Core components to typed props ([28df923](https://github.com/lattice-php/lattice/commit/28df9234afd06f84fc2fad8462cee08438e7cac3))
* migrate Stack, SegmentedControl and Modal to typed props ([262d9f8](https://github.com/lattice-php/lattice/commit/262d9f8cfe6442db2a9c0a377a3a12d500629de8))
* migrate Table component to typed public properties ([92dbd6f](https://github.com/lattice-php/lattice/commit/92dbd6f58cc5ce34e7bcbfbac5f4bfd0d6fd59f3))
* migrate Tabs and Tab to typed props ([9dbad8c](https://github.com/lattice-php/lattice/commit/9dbad8c726a8a0c696805b462a0c0289e82b6db7))
* modal and form effect events always carry their target ([3dbd3ee](https://github.com/lattice-php/lattice/commit/3dbd3ee506dab4bf161facb18cbfa21f460b71e9))
* move dev-only TS transformers into the workbench ([9a781a5](https://github.com/lattice-php/lattice/commit/9a781a5bf1187f1e6da13d22d67b8022aebe649c))
* move TypeScript transformer pipeline into src/Support/TypeScript ([1df189b](https://github.com/lattice-php/lattice/commit/1df189b67f1cac5fc3b89acabe09030442f40ab5))
* only register lattice-js publishes in console ([6bcc71a](https://github.com/lattice-php/lattice/commit/6bcc71a84caed46cb7f5fe52ca520955c776c316))
* own the lattice namespace translations in the package lang dir ([d097e9a](https://github.com/lattice-php/lattice/commit/d097e9a8be1e521f13e6640467b2eefd39ddb6ed))
* project field conditions and dependencies to typed properties ([1e2d3c6](https://github.com/lattice-php/lattice/commit/1e2d3c6ff0c5a7648ca8576464c4a220b62da5a4))
* read bulk actions & password confirmation through generated types ([78c8413](https://github.com/lattice-php/lattice/commit/78c8413f11fb231187eca7a397d2233d91a6d086))
* read bulk actions and password confirmation through generated types ([aef4029](https://github.com/lattice-php/lattice/commit/aef4029249fef5872f9defebc4835c3ec0d12435))
* read component props through generated types, dropping runtime getters ([fda367b](https://github.com/lattice-php/lattice/commit/fda367b735c9f3568f75eb4ea3e89dc16b8d0135))
* read relocated column fields from props ([93688a8](https://github.com/lattice-php/lattice/commit/93688a88c9b91b4f9e902216795982652593c98e))
* rename field readonly prop to readOnly ([ae8b884](https://github.com/lattice-php/lattice/commit/ae8b884d2bb6242e8dfe3fc4c1a7da75163cd43a)), closes [#138](https://github.com/lattice-php/lattice/issues/138)
* rename LatticeComponentProps to ComponentProps ([8a1c763](https://github.com/lattice-php/lattice/commit/8a1c763542dc7fe93bf53aae221f6fc5198b5557))
* render via context only, drop renderer prop-drilling ([d30771a](https://github.com/lattice-php/lattice/commit/d30771ae3b267b93a635c0e81b44a8dd5dc1fa89))
* replace IsInteractive serialiseProps override with decorateProps hook ([a04f313](https://github.com/lattice-php/lattice/commit/a04f313f4dc181b35012d11367e1918fbfd227d9))
* replace SubmitButton with Button buttonType ([bea4a83](https://github.com/lattice-php/lattice/commit/bea4a83effa2f01cb44d58ddcf373d8f27eb5b1e))
* require an explicit namespace for useT and translate ([b7fdd44](https://github.com/lattice-php/lattice/commit/b7fdd442613b0412b20f486b4f6f7ad6b2d5567f))
* require the request in Page::toArray() ([d97237f](https://github.com/lattice-php/lattice/commit/d97237fd8bc0bf4bb95aea4f9d95c9bfb1afb05c))
* resolve each field's validation state in a single pass ([067fc8b](https://github.com/lattice-php/lattice/commit/067fc8b710a38b260e73f46a4b783d0eefcd5ab0))
* retire the legacy props bag ([f0e6ebe](https://github.com/lattice-php/lattice/commit/f0e6ebe70384bebdac7ba073499c5d4c5fc81091))
* reuse toBoolean for checkbox truthiness ([307feb4](https://github.com/lattice-php/lattice/commit/307feb4faf0cc8b036952c713b8e51af3af4e9f8))
* route all discovery through ClassWalker ([868c4b1](https://github.com/lattice-php/lattice/commit/868c4b11ed0053a6ffce4ccdb9d571d3fc27466a))
* route every variant guard through the generated ButtonVariant ([863215f](https://github.com/lattice-php/lattice/commit/863215fb7d75e142c807afe2d17e543dfa26e407))
* serialize component content under a schema key ([2992411](https://github.com/lattice-php/lattice/commit/2992411673ca2cd9e43c1f14ade9d860f016164f))
* share one walkFields traversal for form schema walks ([d54c3a6](https://github.com/lattice-php/lattice/commit/d54c3a6d554ff14ea62e4e50ce06e9be519fa6e0))
* share searchable-option and computed-field resolution ([e98fa63](https://github.com/lattice-php/lattice/commit/e98fa63067b2a3267c8325ff3a73f7aae776041d))
* share the form sub-request dispatch across action controllers ([d21dcf4](https://github.com/lattice-php/lattice/commit/d21dcf4cb33f6de87b8fcbad06b0a15c34361077))
* simplify forms internals and round out the conditional API ([5d3449c](https://github.com/lattice-php/lattice/commit/5d3449c48ceb64966a55f482c1eaa53e4d6c3ae0))
* single serialization path via json_encode ([32d8510](https://github.com/lattice-php/lattice/commit/32d8510b97c66fa8762198f74cb0c6a9a0875d10))
* single serialization path via json_encode ([a71fe04](https://github.com/lattice-php/lattice/commit/a71fe046a7cc4b7c7a7b8f8d18542e3b2c780f30))
* slim ColumnData to common fields plus typed props ([06f8965](https://github.com/lattice-php/lattice/commit/06f8965076419d41624923af6fe0e9166c4528c8))
* sort generated type unions alphabetically, drop manual order ([f53852d](https://github.com/lattice-php/lattice/commit/f53852dd6ddc19ad98305179de138cde25b9a2ae))
* source Component props from wireProps() ([1ffb929](https://github.com/lattice-php/lattice/commit/1ffb929871d4f43a37b5170fc1cbc35724045ff8))
* source interactive props from wireProps(), hold context off the bag ([b6e5e4c](https://github.com/lattice-php/lattice/commit/b6e5e4c0f680aabfb3a726d9a591a6453921a3c5))
* table data-source seam + typed column wire shapes ([53bf3d6](https://github.com/lattice-php/lattice/commit/53bf3d6e8c40630ce816dc4cdb3f99ce2d5ec99c))
* tidy table internals (pagination match, shared parse, state fallback) ([2245992](https://github.com/lattice-php/lattice/commit/2245992f33e142bf2ba9dd4b76cbfd394cba7bff))
* tidy table public API (naming + dead contract) ([f4f7c13](https://github.com/lattice-php/lattice/commit/f4f7c13f1348a1c570f72d08c48d5a86464c44e0))
* tidy table query, source and component ([3f39b7f](https://github.com/lattice-php/lattice/commit/3f39b7f7067f720cdf74f12147d78813cae7acfc))
* tidy the action-form transport and field collection ([82e6a36](https://github.com/lattice-php/lattice/commit/82e6a3657eabb8febf2ffecfee34f16285c0d810))
* type table cells via generated props, consolidate marker-rewrite processor ([d7980bb](https://github.com/lattice-php/lattice/commit/d7980bbf5fdede335e43c9450a539e5824c29a19))
* typed props + generated TypeScript types for the form domain ([f6e468a](https://github.com/lattice-php/lattice/commit/f6e468adbc6a8be171b05345663b0fc98e7e2a84))
* typed public properties for base Field scalar props ([32e84f6](https://github.com/lattice-php/lattice/commit/32e84f63877b37ba38e501837749929bcaf72a4e))
* typed public properties for Form container ([5e33a59](https://github.com/lattice-php/lattice/commit/5e33a596f71cac2c1dc51ca426a748b9bcf8304c))
* typed public properties for Has* prop traits ([482d0dd](https://github.com/lattice-php/lattice/commit/482d0dda0065119334d4eeffa5f8231f4f9e5df8))
* typed public properties for PasswordInput ([e3c1eee](https://github.com/lattice-php/lattice/commit/e3c1eee64ab6a3e70f0a3868c42422de35266ec5))
* typed public properties for Select ([7be0d67](https://github.com/lattice-php/lattice/commit/7be0d6750a569b463aaa97056f7f54732475789a))
* typed public properties for simple form fields ([ee660e1](https://github.com/lattice-php/lattice/commit/ee660e1900380833d77ce445bb42ce1bcbaa25fe))
* typed public properties for SubmitButton ([20ef78a](https://github.com/lattice-php/lattice/commit/20ef78a01999ff89046b3f2eb94b47197acdcdb0))
* unify component and column plugin registration ([89b22f4](https://github.com/lattice-php/lattice/commit/89b22f4f08811a7dcfa67c7ec2d847182632b0e2))
* unify container content under a single schema() method ([6618975](https://github.com/lattice-php/lattice/commit/6618975eaad5e035d7326a9ce9cd64933b92e187))
* unify Field condition-state intents ([724a9cd](https://github.com/lattice-php/lattice/commit/724a9cd1a56b46e97df3b400b4ee1c0f2d8ec61a))
* unify TS generation behind one command and a profile ([6538358](https://github.com/lattice-php/lattice/commit/65383582a632905124d1c8bd2a145c454c12a3ec))
* unify type generation on spatie/typescript-transformer ([bae884d](https://github.com/lattice-php/lattice/commit/bae884de148b58d9721997a761ae572a6be5d5e2))
* use the generated ToastVariant in the Toaster ([0aaa002](https://github.com/lattice-php/lattice/commit/0aaa002f046bf57e169cd834964b5efa0afef33b))
* workbench column uses the Column attribute ([de45357](https://github.com/lattice-php/lattice/commit/de4535739171b41c41bc40d83e8731bbf0977d51))


### Documentation

* add Advanced section (Authorization, Security) ([cc95c70](https://github.com/lattice-php/lattice/commit/cc95c703168054ec19fbb49fb20821b40ec69416))
* add an icon-handling guide ([eebca16](https://github.com/lattice-php/lattice/commit/eebca16edfa2a546d0be2b53ce4bd8b291cb9b6c))
* add authoring skill and reusable Info/Warning callouts ([c64f5dd](https://github.com/lattice-php/lattice/commit/c64f5dd0cda72cd6538efc850c8dd5102c611767))
* add Extending section for custom components, fields and columns ([d987108](https://github.com/lattice-php/lattice/commit/d987108d0e79badad061d1c978ea862b3f284c5f))
* add forms field reference pages ([629cd20](https://github.com/lattice-php/lattice/commit/629cd200fdd74f093080ccbf1bbbae1b2b7e9024))
* add live PHP/preview examples for form fields ([6b0e6ff](https://github.com/lattice-php/lattice/commit/6b0e6ffbbb7ac92be002a24066c9cca7b589e167))
* add Tables reference section ([168a5e2](https://github.com/lattice-php/lattice/commit/168a5e2585c009ecb085c38fd0fa75b1efae0e65))
* add Toasts and Enums reference pages ([95a8c34](https://github.com/lattice-php/lattice/commit/95a8c34102c145d9845e9560f3447cde46a824d8))
* authoring skill, reusable callouts, and components-page enrichment ([ac19b3c](https://github.com/lattice-php/lattice/commit/ac19b3ca11969f4fb15eed7716d4006b0e2c9fa8))
* clarify Style tab does not capture overlay-only tokens ([14ae88f](https://github.com/lattice-php/lattice/commit/14ae88f2d507475a8969ccef4ee51b82520ed8ba))
* clarify the three type-generation attribute roles ([a4a7501](https://github.com/lattice-php/lattice/commit/a4a75012d4f47341e5ab6a89838306071828eb20))
* describe tables as source-backed, not Eloquent-only ([dacd7a5](https://github.com/lattice-php/lattice/commit/dacd7a5f3f150ee9e23aa683d270f80586784f13))
* document field options, validation, and conditional fields ([ae28055](https://github.com/lattice-php/lattice/commit/ae280558d1983b44296df7177442d169da10bed6))
* document the i18n integration ([a1a3c18](https://github.com/lattice-php/lattice/commit/a1a3c18c404dea2cc307516c58b6eedf4c3c8b95))
* document the Icon component and icon-size tokens ([959d367](https://github.com/lattice-php/lattice/commit/959d367604090025e1a12c75b280b9808c6ebc9d))
* document toast builder options and new button variants ([e90ead7](https://github.com/lattice-php/lattice/commit/e90ead7b67305207169bf705f9e229bbcbeb0409))
* drop token label and right-align token tables ([f3097b6](https://github.com/lattice-php/lattice/commit/f3097b67a73f6652976a62d757245550a32d0110))
* enrich components page with stack direction, variants, tabs and modal options ([8cf9f1b](https://github.com/lattice-php/lattice/commit/8cf9f1b860466f354e5b2496e636b65e1f0d989c))
* fixture-backed examples, node tree tab, and field docs ([24026d6](https://github.com/lattice-php/lattice/commit/24026d62d28461d987991da960f9b102f580a240))
* left-align token tables with smaller text and more padding ([d72d725](https://github.com/lattice-php/lattice/commit/d72d7259d530da1aad1e2be7fe8f6d1580a90890))
* render examples from fixtures and add a node tree tab ([5aac06c](https://github.com/lattice-php/lattice/commit/5aac06c40fd4745eb9cffa024475c0c8c0bd7644))
* render the controlling field in conditional examples ([f43ec09](https://github.com/lattice-php/lattice/commit/f43ec0985ffe0b3e415f9a8251d4c951834672c7))
* restructure into Introduction + Core/Forms/Tables/Actions sections ([4dcd148](https://github.com/lattice-php/lattice/commit/4dcd148176a60b1fa7652ee6c4e5954695bd8b0b))
* restructure into Introduction + Core/Forms/Tables/Actions sections ([a80c8c9](https://github.com/lattice-php/lattice/commit/a80c8c9b053d7069ef05098370bc862936317da4))
* rewrite Navigation for the schema-driven layout model ([d2888c0](https://github.com/lattice-php/lattice/commit/d2888c0751cfecae70cbb185cca627deb6fbde84))
* shrink Style tab token table text to prevent wrapping ([7b53d07](https://github.com/lattice-php/lattice/commit/7b53d072464c21eeb8d11bbc0c40ed2ba81ada1a))
* simplify the local development path repository and dependency install ([f9c4a06](https://github.com/lattice-php/lattice/commit/f9c4a066f0b3afb883916b206299e575dfe15544))
* toast builder options and new button variants ([b9015c4](https://github.com/lattice-php/lattice/commit/b9015c4e8efd6586f6dc612b6bf89b9bfd95251f))
* trim redundant TS comments ([26348a0](https://github.com/lattice-php/lattice/commit/26348a03f6d23b3ab76d9450216f319f22cc2ebb))
* write Actions reference section ([b857064](https://github.com/lattice-php/lattice/commit/b857064a8ac88252af54065797aaa52560b3b142))
* write Components and Fragments reference ([7fe958a](https://github.com/lattice-php/lattice/commit/7fe958a4157e7e8c897d5520cd16542b4f984b45))
* write Forms overview and lock condition operator parity ([4d3dff0](https://github.com/lattice-php/lattice/commit/4d3dff0f9cb07b93fcaeb89c9d3fa49aa9127289))

## 0.1.0 (2026-06-10)


### chore

* release the first version as 0.1.0 ([a34020a](https://github.com/lattice-php/lattice/commit/a34020a2bc5ba1a438c68cbf313632ed797e9424))


### Features

* add a secured product row action with per-row authorization ([9f02945](https://github.com/lattice-php/lattice/commit/9f029458bac9257dc638b8687960eefb85917c6f))
* add a striped option to tables ([dab9f8b](https://github.com/lattice-php/lattice/commit/dab9f8b49238a002b48de90fe767ce494fc920ec))
* add action icon rendering ([f600d8a](https://github.com/lattice-php/lattice/commit/f600d8a65e9477a2fb1129828d2962b3e79b6ce2))
* add appearance, clipboard, and inertia resolver utilities ([c4bd5fd](https://github.com/lattice-php/lattice/commit/c4bd5fdbd799fddf9e36a460ea33a43fa980e1ac))
* add Astro Starlight documentation site ([7886e4c](https://github.com/lattice-php/lattice/commit/7886e4cea7736ea65d6e6323e6b231e5b4f8e908))
* add bulk action selection UI to tables ([a5743bb](https://github.com/lattice-php/lattice/commit/a5743bb90055839f46581dfa07bbc355405ab9a4))
* add client-side condition evaluation ([43c2ebc](https://github.com/lattice-php/lattice/commit/43c2ebc379344b455cdaf72ec34c567b5445d4f4))
* add Condition value object ([6fe8b01](https://github.com/lattice-php/lattice/commit/6fe8b01628062da7d7c2c9c812885f31a2a218d3))
* add contains, starts_with, ends_with, empty and filled operators ([aa99e9d](https://github.com/lattice-php/lattice/commit/aa99e9deb0cc0021d99dc962816bb58a21cb806f))
* add contracts for signer, discovery, and registry seams ([d301e86](https://github.com/lattice-php/lattice/commit/d301e862f4aeb77e3de0aa7d444cf10fc3c245d3))
* add controlled FormValues store ([82d0260](https://github.com/lattice-php/lattice/commit/82d02605f67d3b01b8323e626556ca1d6e34b38e))
* add declarative field conditions (dependsOn/requiredWhen/...) ([d49a042](https://github.com/lattice-php/lattice/commit/d49a0420469f267e0c7ece633005f9d5c0340354))
* add Effect contract so consumers can define custom effects ([dac433b](https://github.com/lattice-php/lattice/commit/dac433bd34d0fb153f75599b2dd2d098fb5c1c71))
* add Field base with field-level rules ([6dbb224](https://github.com/lattice-php/lattice/commit/6dbb224d7b6433cc3bf921437825d65f57e7c5f8))
* add form field resolve endpoint ([c83495f](https://github.com/lattice-php/lattice/commit/c83495f74436158d6dcb55347eae4eabdf46b9a5))
* add form-level resolve coordinator ([64ba932](https://github.com/lattice-php/lattice/commit/64ba93268e578fe58e28bd7e6877afe6a402893b))
* add Form::fields tree flattening ([6268d37](https://github.com/lattice-php/lattice/commit/6268d37f81069f2382885d5675ceeb7b1975f3c2))
* add FormData value object ([ef67aad](https://github.com/lattice-php/lattice/commit/ef67aad659a6b71896de9ca512d60aa370534061))
* add grouped actions and bundled icons ([2667bdc](https://github.com/lattice-php/lattice/commit/2667bdcdfc429c60a5bc8d6fd90ae4b6d941d0e7))
* add lattice component context ([e255673](https://github.com/lattice-php/lattice/commit/e2556731e38d237599d11a72800f3e83618a99b8))
* add lattice theme tokens ([d4fec3d](https://github.com/lattice-php/lattice/commit/d4fec3d5e3637e9989579a1cc707b135978747f3))
* add menu registry ([952865e](https://github.com/lattice-php/lattice/commit/952865e6139d47fc50b334cd3e507b11af90dd70))
* add modal and fragment primitives ([f331ee1](https://github.com/lattice-php/lattice/commit/f331ee19ce2252c6817b9bd026e0fe1b868412ca))
* add Op enum for field conditions ([d0d8f0f](https://github.com/lattice-php/lattice/commit/d0d8f0f18bc6c52bbd4d8432b21e26afde497b4b))
* add password confirmation modifier ([6ad4ab9](https://github.com/lattice-php/lattice/commit/6ad4ab992dc7d4f7d9d2aba1441b32578aabef80))
* add per-type definition capability contracts ([43baf65](https://github.com/lattice-php/lattice/commit/43baf65d0ab99aa869159d50f609aa4e8341b2f8))
* add precognitive form validation ([3b1df28](https://github.com/lattice-php/lattice/commit/3b1df285d4df647f1faf0c64870de8fe432f0f03))
* add registered form runtime ([14715dd](https://github.com/lattice-php/lattice/commit/14715dd98e1878f39dbb5dc630238c29ee0c74f3))
* add registered tables ([472b753](https://github.com/lattice-php/lattice/commit/472b753b7feb93d42e26916ede3d5b081700c4bc))
* add related products many-to-many to the workbench product form ([0148572](https://github.com/lattice-php/lattice/commit/01485721f83b2ba04c3262a26d8d4f33ac21bd0c))
* add resolved-nodes context and store no-op guard ([3e8541f](https://github.com/lattice-php/lattice/commit/3e8541f33d4d1072989bcb70979732381c204ffe))
* add rich editor backend (tiptap-php render + sanitize, value cast) ([5cba803](https://github.com/lattice-php/lattice/commit/5cba8034a9394f3f8a4d804e526365a64d567749))
* add rich text editor field (TipTap, own chunk) ([dbe0e67](https://github.com/lattice-php/lattice/commit/dbe0e673877909cb4b3064bd9e11061dda7b0051))
* add searchable option resolution to the form endpoint ([72548fb](https://github.com/lattice-php/lattice/commit/72548fb68d6811cd517b9c2c1fd1cb2734387945))
* add secure bulk actions for tables ([8b95ebd](https://github.com/lattice-php/lattice/commit/8b95ebdf7975100bb1b71124a0bfa4f83a3adfd9))
* add SegmentedControl core component and retire Choice event prop ([cf1ede4](https://github.com/lattice-php/lattice/commit/cf1ede4b7504789251634c4c18cdeea60e4d05d4))
* add Select combobox component with search, multi-select and chips ([5b6ceaa](https://github.com/lattice-php/lattice/commit/5b6ceaa9ac6bd0c814cc4b21ef57d8bfb8dce30f))
* add Select form field with static and searchable options ([616c9f7](https://github.com/lattice-php/lattice/commit/616c9f7be7743836d06c59aa5325d3d8ae026c47))
* add sidebar registry ([50d7851](https://github.com/lattice-php/lattice/commit/50d7851d639ef23cc9a6f774f779e864c61892b2))
* add tables, details and emoji to the rich editor ([9257c54](https://github.com/lattice-php/lattice/commit/9257c54f572797f16d88b4c283c8cf39a644f0d0))
* add textarea, number (with slider), and date fields ([5db40f0](https://github.com/lattice-php/lattice/commit/5db40f0f90eb011878eaa36fb33e75823dfb3745))
* add toast messages ([acf95a5](https://github.com/lattice-php/lattice/commit/acf95a51264df2987d243af6f81985fb7740c43d))
* add underline, highlight and text-align to the rich editor ([c4b5ebb](https://github.com/lattice-php/lattice/commit/c4b5ebb127eef57da7862cab931008c13acc1a2a))
* add useDependentField hook ([2894f05](https://github.com/lattice-php/lattice/commit/2894f053185ef5eccec2429bf82a32d5c32b0074))
* add value closures and field resolution ([3a00040](https://github.com/lattice-php/lattice/commit/3a000407b1df5fdaf4cebe1361f7e8c0d8683cf1))
* auto-register Lattice component sources with Tailwind ([9b71c7f](https://github.com/lattice-php/lattice/commit/9b71c7f72fabdc1030ac974f82f00c7351f90c47))
* build @lattice-php/lattice as an npm package ([4d785d6](https://github.com/lattice-php/lattice/commit/4d785d64dd96d9d78b5798928638bc3d085650e4))
* build choice/select options from enums via HasLabel ([81e290f](https://github.com/lattice-php/lattice/commit/81e290f2f4fe33c8f0556a97cb491cb1112e5d95))
* card-based form layout with responsive grids and a floating submit card ([a4ead83](https://github.com/lattice-php/lattice/commit/a4ead839ae43289fc035dae51862d243caf25865))
* choice renders resolved options ([8d7333e](https://github.com/lattice-php/lattice/commit/8d7333ea7fc4f47dc56ad9be1a8bd96cadf792a2))
* complete the action effect vocabulary ([580db71](https://github.com/lattice-php/lattice/commit/580db71a49fb01e5246e5dfbc8da762613aea6f5))
* controlled, condition-aware text input ([1090d4a](https://github.com/lattice-php/lattice/commit/1090d4ae3c4c9eb999e30d8601c19ab1aab376b3))
* derive form validation rules from fields ([2f60f03](https://github.com/lattice-php/lattice/commit/2f60f035ed206f47822f531eae78cbbbd29dcf4c))
* discover lattice definitions by default ([1137ed5](https://github.com/lattice-php/lattice/commit/1137ed52c5e61f62f5a47bde6aaa16839ce21abb))
* email() adds strict email validation (rejects a@a) ([8659fff](https://github.com/lattice-php/lattice/commit/8659fff349366d2b10764af88024e88aa84c1065))
* enforce field conditions during validation ([d989ed8](https://github.com/lattice-php/lattice/commit/d989ed8ca8f5d9bf2f9e5f0a7f1fcb56f0641576))
* expand lattice page actions forms and tables ([d8fd8be](https://github.com/lattice-php/lattice/commit/d8fd8be03472f70f1824a8de146a966664623d3b))
* expand lattice page primitives ([fd235e7](https://github.com/lattice-php/lattice/commit/fd235e7099505384b7f90000893323e73c72c3f6))
* export getActionEffects and ButtonVariant as public contract types ([46fccc2](https://github.com/lattice-php/lattice/commit/46fccc2f38e974f76ee05b1e9d680fb25ea4ddb2))
* generate table Operator and ControlType TypeScript types ([faff4a6](https://github.com/lattice-php/lattice/commit/faff4a6e2f11208d05ba1e364d271b455defd219))
* generate the TableSort value object and a SortDirection enum ([26c5237](https://github.com/lattice-php/lattice/commit/26c523759d1ec3948322ca8e756c6f4f2d392f4a))
* generate TypeScript enum types from PHP and tie EffectType SSOT ([7b54173](https://github.com/lattice-php/lattice/commit/7b54173dbbae7dac5c995596e8ab91dace30b5ac))
* introduce Authorizable and PageContract contracts ([c77995c](https://github.com/lattice-php/lattice/commit/c77995ca1cceeadb9d5e80b863ff6ed81ba416b8))
* make password input condition-aware ([102484e](https://github.com/lattice-php/lattice/commit/102484eab25c006e586a7d781401cb1b507d3809))
* mirror choice/checkbox values into the store ([2916156](https://github.com/lattice-php/lattice/commit/29161560b54460fdc4d1fa2fc0ad50dfd186bc22))
* per-column table filters with date and boolean controls ([2a761f4](https://github.com/lattice-php/lattice/commit/2a761f45d12c1f8bca19d05bf6a8e451b975dbb2))
* publish the React renderer as @lattice-php/lattice on npm ([61803a9](https://github.com/lattice-php/lattice/commit/61803a99890529a5b6b37a732e2240c1dca07c9f))
* resolve Select labels for filled ids on edit forms ([f5a1e2e](https://github.com/lattice-php/lattice/commit/f5a1e2e56144d8b0187588b48a3628d172e12097))
* restyle table filters as a column popover with a stack bar ([44a649b](https://github.com/lattice-php/lattice/commit/44a649b7b29eec895d0b26d7fa12e6a589be42a7))
* scaffold lattice package ([b9b1108](https://github.com/lattice-php/lattice/commit/b9b1108c712c9285b0e291a6b50299e38057db39))
* seal lattice component references ([a1ae657](https://github.com/lattice-php/lattice/commit/a1ae657da9e5239bc3cb79d34f1d264de6ff6629))
* stackable filter clauses with operators (backend) ([adea086](https://github.com/lattice-php/lattice/commit/adea086b27b7a8dbba1b954ccb4ba54710d7753a))
* stackable filter clauses with operators (frontend) ([c1df33a](https://github.com/lattice-php/lattice/commit/c1df33ab91e1fc015b88f2f8fa17438176ed0732))
* style rich text content with a reusable lattice-prose class ([c09b361](https://github.com/lattice-php/lattice/commit/c09b361928b60e4553c7f435df16b7afc14b8212))
* support lattice table row navigation ([279fe4b](https://github.com/lattice-php/lattice/commit/279fe4b0b7289e7b2a66dc0073986a6f35544333))
* support select-all-matching for bulk actions ([36b4273](https://github.com/lattice-php/lattice/commit/36b4273ed063766f6548cb31e05c0c10df4c7426))
* text/presence filter & condition operators (+ exhaustive evaluateOp) ([ba799fb](https://github.com/lattice-php/lattice/commit/ba799fb311202df9cf2765059232435af4b0303e))
* use field labels as validation attributes and add per-field messages ([c601768](https://github.com/lattice-php/lattice/commit/c6017680d375a0c6c20682d0447b7d664cfca4e4))


### Bug Fixes

* align client condition boolean coercion with the server ([15152f7](https://github.com/lattice-php/lattice/commit/15152f70466f245d5ef420e9556c8f4f5aeb1f53))
* apply field resolution during validation ([cf774b0](https://github.com/lattice-php/lattice/commit/cf774b02242723aa12d9b5f98764274d88914c76))
* auto-discover bulk action definitions ([d88672a](https://github.com/lattice-php/lattice/commit/d88672ac23d8ead198acb15c753ad7ea8c4d696a))
* center docs content column on splash and doc pages ([866a26f](https://github.com/lattice-php/lattice/commit/866a26ffcbecc0c63dd5e1ce98e9bc287a5d2f90))
* drop locked field values without a field-level value ([6cae9dc](https://github.com/lattice-php/lattice/commit/6cae9dcc89bccec6b87294b98256bf5f72e1f5a9))
* harden interactive components and memoize serialization hooks ([dae0a08](https://github.com/lattice-php/lattice/commit/dae0a08f37bd5388525303186c5380f9b14f471e))
* include field errors in table query validation responses ([6f8d93b](https://github.com/lattice-php/lattice/commit/6f8d93ba0655dd3e3dcfa081bcd319d6fc4c72ac))
* keep table row actions reachable when columns overflow ([ab5febe](https://github.com/lattice-php/lattice/commit/ab5febe23567c5b554e8bfbfaebe4649a01258e6))
* render required asterisk outside the field label ([198943a](https://github.com/lattice-php/lattice/commit/198943a399a1cda3af9aac8e71ca31512aeac35f))
* seal bulk action references with the bulkAction type ([583497f](https://github.com/lattice-php/lattice/commit/583497fb47a8282838fef860bd852436f1e90c53))
* skip the laravel and inertia vite plugins under vitest ([1e00af8](https://github.com/lattice-php/lattice/commit/1e00af843938d4eead61441c40619d6425cc7c67))
* stop rich editor toolbar clicks from triggering backend requests ([5876a37](https://github.com/lattice-php/lattice/commit/5876a37957c26ae37aef42d5ee31eb19d8c462d6))
* stripe full row width when the table scrolls horizontally ([c1e6f4e](https://github.com/lattice-php/lattice/commit/c1e6f4e59d06ec0a5195dd5b901b075aaa9f9028))


### Performance

* memoize the RichContent Tiptap editor ([2b90aec](https://github.com/lattice-php/lattice/commit/2b90aecd931db00e470c5b9857383e333a9e1c6c))


### Refactoring

* adopt lattice-php/lattice package and Lattice\Lattice namespace ([4239205](https://github.com/lattice-php/lattice/commit/42392059232068873d6df56208a25af1cc8ac3aa))
* adopt lattice-php/lattice package and Lattice\Lattice namespace ([422fcfa](https://github.com/lattice-php/lattice/commit/422fcfa975fb7359c72ba4d05d8f65bcbcb1797b))
* centralize Op numeric comparison ([e68bea9](https://github.com/lattice-php/lattice/commit/e68bea9f98c42114dabd3d1baef1e7b7415e8e06))
* centralize the _lattice ref and lattice:* event contracts ([b087de2](https://github.com/lattice-php/lattice/commit/b087de2dc004e26dc2d6241897967e3b9faf76e0))
* collapse table rows into one payload with embedded actions ([8d8dca6](https://github.com/lattice-php/lattice/commit/8d8dca6a439142a897948247aae2dd0962f13526))
* compose component serialization hooks ([229fe55](https://github.com/lattice-php/lattice/commit/229fe55133f7f34a7567e2fa29ed15711bbf8111))
* consolidate concerns under src/Core/Concerns ([402ea7f](https://github.com/lattice-php/lattice/commit/402ea7fe7f35509f834beac3adfaba060ab169fb))
* decompose the table component into focused modules ([fb611cb](https://github.com/lattice-php/lattice/commit/fb611cb8310dd96fae1b864aa5220d0d0ecc9234))
* dedup the dispatch layer ([15f6757](https://github.com/lattice-php/lattice/commit/15f67575ae0026c6dc602612f48ae5197f7539ff))
* dissolve the Pages namespace into Core and Http ([81e7e53](https://github.com/lattice-php/lattice/commit/81e7e53889ac0fa63c2cb25f440a94e2b9a1cf20))
* dissolve the shared Contracts namespace ([8560f4d](https://github.com/lattice-php/lattice/commit/8560f4d2172367988932c034dc91d0e63f94758c))
* domain-align Pages, Core base classes, and enums ([864244b](https://github.com/lattice-php/lattice/commit/864244b5ed9c32d25d0eb1b293cfe469e12cc7b5))
* enforce exhaustive condition operators in evaluateOp ([5ecc257](https://github.com/lattice-php/lattice/commit/5ecc25720353fcf75f3bf3ce83407927a9870a3e))
* extend Field base from form field components ([e438e66](https://github.com/lattice-php/lattice/commit/e438e6630cc1aaac93ab270d2d2d53f3c9742c8b))
* extract ConditionSet and shared option factory in form fields ([5822a34](https://github.com/lattice-php/lattice/commit/5822a34cee78dad4b87ffa3fe423d0154bb3bff4))
* extract field/component builder concerns ([4bb0e04](https://github.com/lattice-php/lattice/commit/4bb0e04dd793611c4e26d661885338288d25924a))
* extract Filterable and Sortable column capabilities ([ed3fb84](https://github.com/lattice-php/lattice/commit/ed3fb84968140b714cd7a95f9ba09f160bdd7ff3))
* extract shared ConfirmDialog component ([85ffb26](https://github.com/lattice-php/lattice/commit/85ffb26235b6f950f1f97b630d6047a012a0ade9))
* extract shared interaction component runtime ([56dbdc0](https://github.com/lattice-php/lattice/commit/56dbdc042a4e12f7617190cac9a75dd4760a7512))
* extract useControlledField, merge form helpers and validate loops ([1cd111b](https://github.com/lattice-php/lattice/commit/1cd111b62964c38633ae35f92573178f7184a42a))
* flatten frontend source tree ([916addf](https://github.com/lattice-php/lattice/commit/916addf7e6574427278a8bc48443be858f0f3ad9))
* give ToastMessage a single serialization format ([14d54dc](https://github.com/lattice-php/lattice/commit/14d54dcef9c84c63e81dbe03569878e28acbc493))
* infer table filter type from the column ([2fd1d97](https://github.com/lattice-php/lattice/commit/2fd1d97d89e75b5603800fc5a63cbbc770a15342))
* introduce Tables Operator and ControlType enums ([a514c33](https://github.com/lattice-php/lattice/commit/a514c33db0e060f0e894a4e6f836edcfc80b9866))
* merge field rules across calls; email() appends its rule ([097920b](https://github.com/lattice-php/lattice/commit/097920bdba0599cd61cb86fdd58d3c98ab93d564))
* move component reference signing into Core ([3572436](https://github.com/lattice-php/lattice/commit/3572436fc015fa8c2c13a60ddb53c1f23e3c8cc0))
* move core components to src/Core/Components ([95861b5](https://github.com/lattice-php/lattice/commit/95861b5b75432562feba46d09b58313c9521c070))
* move definition discovery into Core\Services ([1c03246](https://github.com/lattice-php/lattice/commit/1c03246737cd7b8d2b241c428feb3e364f558eeb))
* move enums into per-domain Enums subfolders ([f659581](https://github.com/lattice-php/lattice/commit/f6595814f1ca402171dbd20d44ae241a86a923fa))
* move Table and Form components into their domain folders ([68c92c3](https://github.com/lattice-php/lattice/commit/68c92c343359d853def2e3421a4228be4e97fa1f))
* move the Action component family into src/Actions/Components ([22200f6](https://github.com/lattice-php/lattice/commit/22200f6caf174b8733122ed20ce8bed122ebd37a))
* move the Fragment component into the Fragments domain ([1211c5f](https://github.com/lattice-php/lattice/commit/1211c5fc73942cf0c0aedb2af683ff5c1a1a79e1))
* move the Provides* contracts into their feature domains ([fbff863](https://github.com/lattice-php/lattice/commit/fbff86393d0544a72cc8d7fbe40d81ed86b066ff))
* move Toasts into the Core domain ([70f7905](https://github.com/lattice-php/lattice/commit/70f7905da1f1f8e211dc3ac911b574552f4506c0))
* move UnknownLatticeComponent into Core\Exceptions ([40a28e9](https://github.com/lattice-php/lattice/commit/40a28e93bb79becf760bce469aefcf2c0ee4e85e))
* name the toast severity 'variant' everywhere ([6c7bce6](https://github.com/lattice-php/lattice/commit/6c7bce69e43178a0348de4ae3678c5c68a3b58a7))
* remove auth from package core ([7a1572e](https://github.com/lattice-php/lattice/commit/7a1572e153b9ab9d9f13055e977b9511ffde8364))
* remove dead useFormFieldValue and form context state ([7b170d4](https://github.com/lattice-php/lattice/commit/7b170d448c95df5180b064e1b521239bea243136))
* remove lattice type prefixes ([fb0fe87](https://github.com/lattice-php/lattice/commit/fb0fe87a2cf2787ddfdca27435124e1c4eed2886))
* rename internal [@lattice](https://github.com/lattice) alias to @bambamboole/lattice ([6bc5e35](https://github.com/lattice-php/lattice/commit/6bc5e35d0fdfac9afd3d4d7b9c35238c6fe4492e))
* rename operator enums and align their shared values ([28f562d](https://github.com/lattice-php/lattice/commit/28f562d82378b4d817647d031a8f84777d8d4e51))
* reorganize form components ([5008829](https://github.com/lattice-php/lattice/commit/5008829380c5646206ff132ca5c4f3c84317ed3e))
* reorganize package components ([0587c6c](https://github.com/lattice-php/lattice/commit/0587c6c5ddd71b73c98b3875a00f5a8bdae62348))
* seal concrete registries, controllers, and facade as final ([a67179c](https://github.com/lattice-php/lattice/commit/a67179c44b2eefa1b4659c1880a8c4656b37185e))
* send the component reference as the X-Lattice-Ref header ([62e8a11](https://github.com/lattice-php/lattice/commit/62e8a119f3aad13031f764ca6520329b9396fa46))
* simplify page layout metadata ([cfb8209](https://github.com/lattice-php/lattice/commit/cfb82091d6620ec9ad0641724dd3a19769819091))
* simplify registry api ([aebdd49](https://github.com/lattice-php/lattice/commit/aebdd494a859d0a1b822001868fb4960a95f6047))
* simplify table module internals ([c9d01ef](https://github.com/lattice-php/lattice/commit/c9d01ef297cf83ade089529ee3b73622828e1aaf))
* split php component namespaces ([f01615b](https://github.com/lattice-php/lattice/commit/f01615ba7efe71e5f9e4163e5b86a59d88cfa024))
* tables domain value objects + generated Operator/ControlType TS types ([36ee5c9](https://github.com/lattice-php/lattice/commit/36ee5c953d5b0c4f9393f80387978fc0f3546b5e))
* unify form field commit, transport and option helpers ([fccaa60](https://github.com/lattice-php/lattice/commit/fccaa60ca54cc9885ffc0270166216945a0125f3))
* use clipboard helper and support link actions in tables ([776f60b](https://github.com/lattice-php/lattice/commit/776f60bc692649225a8ea9610ec55cc381412dd8))
* use field-level rules in ProductForm ([f957671](https://github.com/lattice-php/lattice/commit/f957671ea9e50e2c8f9e6e95ec5c71f68c4888b1))
* use inertia method type ([ca1f138](https://github.com/lattice-php/lattice/commit/ca1f138a5d93b8f308ce73a6c3dfdcde1ef710f8))
* use lattice package alias ([dc4724b](https://github.com/lattice-php/lattice/commit/dc4724be1ec41ebb74eb86c8824764c5f55a29b5))


### Documentation

* add Astro Starlight documentation site ([93b2da5](https://github.com/lattice-php/lattice/commit/93b2da59f46b2ef7bff62d0ac4bd50d6c50a4f6a))
* add the npm package to the README ([61a9f17](https://github.com/lattice-php/lattice/commit/61a9f17104f81057b275ae6a32fd3f6270a1ac77))
* document the vendor-alias frontend installation ([52042ac](https://github.com/lattice-php/lattice/commit/52042ac6d8e1a5b7a80ef6f1c14547b0025bd985))
* fix the quickstart namespaces to match the source ([d20090d](https://github.com/lattice-php/lattice/commit/d20090d816d6e1ab56482a8165b2fc6c6de741c0))
* lead with npm install and add a Local Development page ([bac5319](https://github.com/lattice-php/lattice/commit/bac531925bc6fa43d230a49c2bf2acfc89e2329b))
