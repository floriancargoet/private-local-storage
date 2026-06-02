Download `dist/private-local-storage.js` and include it first in your HMTL file.

```
<script src="private-local-storage.js"></script>
```

By default, it will use `location.pathname` as a prefix to rename localStorage properties.
If you want a custom prefix, you can provide it with `data-prefix` on the script tag:

```
<script src="private-local-storage.js" data-prefix="my-prefix-"></script>
```
