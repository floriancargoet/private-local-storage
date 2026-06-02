export function createPrivateLocalStorage(prefix: string, realLS: Storage) {
  if (typeof Proxy === "undefined" || typeof Proxy === "object") {
    throw new Error("Private localStorage requires ES 2015 Proxy support");
  }

  // Convert private prop name to real prop name
  function privateToReal(prop: string) {
    return prefix + prop;
  }

  // Get only private keys from real localStorage
  function privateKeys() {
    return (
      Object.keys(realLS)
        .filter((k) => k.startsWith(prefix))
        // It starts with prefix & we only replace the first occurence, no need for a proper regexp here.
        .map((k) => k.replace(prefix, ""))
    );
  }

  // LocalStorage methods that we want to expose on our proxy.
  const methods = {
    getItem(prop) {
      return realLS.getItem(privateToReal(prop));
    },
    setItem(prop, value: unknown) {
      // LS converts value to string internally, the type is too strict.
      return realLS.setItem(privateToReal(prop), value as string);
    },
    removeItem(prop) {
      return realLS.removeItem(privateToReal(prop));
    },
    clear() {
      for (let key of privateKeys()) {
        realLS.removeItem(privateToReal(key));
      }
    },
    key(n) {
      return privateKeys()[n] ?? null;
    },
  } satisfies Partial<Storage>;

  return new Proxy(
    {}, // Dummy target
    {
      // Intercept `in` operator
      has(_obj, prop) {
        if (typeof prop === "symbol") return false;
        return privateToReal(prop) in realLS;
      },
      // Intercept Object.keys() (requires props to also be enumerable, see getOwnPropertyDescriptor)
      ownKeys(_obj) {
        return privateKeys();
      },
      // Forward to real LS to have item keys enumerable but not other properties
      getOwnPropertyDescriptor(_obj, prop) {
        if (typeof prop === "symbol") return;
        return Object.getOwnPropertyDescriptor(realLS, privateToReal(prop));
      },
      // Intercept raw set (localStorage["foo"] = "bar")
      set(_obj, prop, value) {
        // LS ignores symbol but doesn't throw so we do the same
        if (typeof prop === "symbol") return true;
        if (prop in methods) return false;
        switch (prop) {
          // TODO: check if other special keys
          case "length":
            return false;
          default:
            methods.setItem(prop, value);
            return true;
        }
      },
      get(_obj, prop) {
        if (typeof prop === "symbol") return;
        if (prop in methods) {
          return methods[prop as keyof typeof methods];
        }
        switch (prop) {
          case "length":
            return privateKeys().length;
          default:
            // Direct access doesn't return null for missing props so we can't just call getItem.
            if (privateToReal(prop) in realLS) {
              return methods.getItem(prop);
            }
        }
      },
      deleteProperty(_obj, prop) {
        if (typeof prop === "symbol") return true;
        const key = privateToReal(prop);
        if (key in realLS) {
          realLS.removeItem(key);
        }
        return true; // LS always returns true so we do the same
      },
    },
  ) as Storage;
}
