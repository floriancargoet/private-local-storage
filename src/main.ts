import { createPrivateLocalStorage } from "./private-local-storage";

// Auto setup
setupPrivateLocalStorage();

function setupPrivateLocalStorage() {
  // Copy original localStorage & expose it as `realLocalStorage`.
  const realLS = (globalThis.realLocalStorage = globalThis.localStorage);

  const privateLS = createPrivateLocalStorage(getPrefix(), realLS);
  Object.defineProperty(globalThis, "localStorage", {
    get() {
      return privateLS;
    },
  });
}

function getPrefix() {
  return (
    // If script tag has a prefix, use it
    document.currentScript?.dataset.prefix ??
    // Otherwise, use the path
    location.pathname + "__"
  );
}
